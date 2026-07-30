"""FastAPI entry point for the Unified Resume Builder API."""

import json
import logging
import os
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import anyio
import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.routes import analyze, compliance, cover_letter, export, gap, preview, rewrite, score, summary
from app.core.config import settings  # noqa: F401
from app.core.rate_limit import SlidingWindowRateLimiter, get_client_ip, global_ip_limiter, limiter
from app.services.ai.hf_client import close_client

_sentry_dsn = os.environ.get("SENTRY_DSN", "")
if _sentry_dsn:

    def _strip_pii(event: dict, hint: dict) -> dict:
        request = event.get("request", {})
        request.pop("data", None)
        request.pop("body", None)
        headers = request.get("headers", {})
        for key in ("authorization", "cookie", "set-cookie"):
            headers.pop(key, None)
        # Exception stack frames carry local variables (resume text, AI prompts,
        # job descriptions). Strip them so PII never reaches Sentry.
        for exc in event.get("exception", {}).get("values", []):
            for frame in exc.get("stacktrace", {}).get("frames", []):
                frame.pop("vars", None)
        event.pop("extra", None)
        return event

    sentry_sdk.init(
        dsn=_sentry_dsn,
        traces_sample_rate=0.1,
        environment=os.environ.get("ENV", "production"),
        before_send=_strip_pii,
        send_default_pii=False,
        include_local_variables=False,
    )


class _JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log = {
            "ts": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "msg": record.getMessage(),
        }
        request_id = getattr(record, "request_id", None)
        if request_id is not None:
            log["request_id"] = request_id
        extra_data = getattr(record, "extra_data", None)
        if isinstance(extra_data, dict):
            log.update(extra_data)
        return json.dumps(log, default=str)


_logger = logging.getLogger("app.access")
_logger.setLevel(logging.INFO)
_handler = logging.StreamHandler()
_handler.setFormatter(_JSONFormatter())
_logger.addHandler(_handler)
_logger.propagate = False


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    yield
    await close_client()


_MAX_BODY_BYTES = 1_048_576  # 1 MB


async def _send_413(scope, send) -> None:
    response = JSONResponse(
        status_code=413,
        content={"detail": "Request body too large. Maximum size is 1 MB."},
    )
    await response(scope, _noop_receive, send)


async def _noop_receive() -> dict:
    return {"type": "http.request", "body": b"", "more_body": False}


class BodySizeLimitMiddleware:
    """Pure-ASGI middleware enforcing the 1 MB body cap.

    Content-Length is checked up front. When it is absent (e.g. chunked
    transfer-encoding), the body is buffered while enforcing the cap so the
    limit cannot be bypassed by omitting the header, then replayed downstream.
    Implemented at the ASGI layer (not BaseHTTPMiddleware) so we control the
    receive channel and can feed the buffered body to the app.
    """

    def __init__(self, app) -> None:
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers") or [])
        content_length = headers.get(b"content-length")
        if content_length is not None:
            try:
                declared = int(content_length)
            except ValueError:
                response = JSONResponse(
                    status_code=400, content={"detail": "Invalid Content-Length header."}
                )
                await response(scope, receive, send)
                return
            if declared > _MAX_BODY_BYTES:
                await _send_413(scope, send)
                return
            await self.app(scope, receive, send)
            return

        body = bytearray()
        more_body = True
        while more_body:
            message = await receive()
            if message["type"] != "http.request":
                if message["type"] == "http.disconnect":
                    return
                continue
            body.extend(message.get("body", b""))
            if len(body) > _MAX_BODY_BYTES:
                await _send_413(scope, send)
                return
            more_body = message.get("more_body", False)

        buffered = bytes(body)
        replayed = False

        async def replay_receive() -> dict:
            nonlocal replayed
            if not replayed:
                replayed = True
                return {"type": "http.request", "body": buffered, "more_body": False}
            return await receive()

        await self.app(scope, replay_receive, send)


class GlobalIPRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limiter: SlidingWindowRateLimiter) -> None:
        super().__init__(app)
        self.rate_limiter = rate_limiter

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)

        allowed, retry_after = self.rate_limiter.check(get_client_ip(request))
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Global rate limit exceeded. Please try again later."},
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)


_REQUEST_TIMEOUT = 60.0

_AI_ROUTES = frozenset(
    {
        "/api/v1/score",
        "/api/v1/gap",
        "/api/v1/summary",
        "/api/v1/cover-letter",
        "/api/v1/rewrite",
        "/api/v1/compliance",
    }
)


class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            with anyio.fail_after(_REQUEST_TIMEOUT):
                return await call_next(request)
        except TimeoutError:
            return JSONResponse(
                status_code=504,
                content={"detail": "Request timed out. Please try again."},
            )


class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start = time.monotonic()
        response = await call_next(request)
        duration_ms = round((time.monotonic() - start) * 1000)
        matched_route = request.scope.get("route")
        route = getattr(matched_route, "path_format", None) or getattr(matched_route, "path", None)
        content_length_header = response.headers.get("content-length")
        content_length = int(content_length_header) if content_length_header and content_length_header.isdigit() else None
        extra = {
            "request_id": request_id,
            "extra_data": {
                "method": request.method,
                "path": request.url.path,
                "route": route,
                "status": response.status_code,
                "duration_ms": duration_ms,
                "client": request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown"),
                "rate_limited": response.status_code == 429,
                "auth_failed": response.status_code in {401, 403},
                "is_ai_route": request.url.path.rstrip("/") in _AI_ROUTES,
                "content_length": content_length,
            },
        }
        _logger.info(
            "%s %s %s %dms",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            extra=extra,
        )
        response.headers["X-Request-ID"] = request_id
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if _is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


_is_production = os.environ.get("RENDER", "") != "" or os.environ.get("ENV", "").lower() == "production"

app = FastAPI(
    title="Unified Resume Builder API",
    description="ATS scoring, keyword analysis, and AI-powered resume optimization",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]
for _url in os.environ.get("FRONTEND_URL", "").split(","):
    _url = _url.strip().rstrip("/")
    if _url:
        _cors_origins.append(_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.add_middleware(GlobalIPRateLimitMiddleware, rate_limiter=global_ip_limiter)
app.add_middleware(AccessLogMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestTimeoutMiddleware)
app.add_middleware(BodySizeLimitMiddleware)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(score.router, prefix="/api/v1", tags=["Scoring"])
app.include_router(gap.router, prefix="/api/v1", tags=["Gap Analysis"])
app.include_router(compliance.router, prefix="/api/v1", tags=["Compliance"])
app.include_router(summary.router, prefix="/api/v1", tags=["AI Summary"])
app.include_router(rewrite.router, prefix="/api/v1", tags=["AI Rewriter"])
app.include_router(export.router, prefix="/api/v1", tags=["PDF Export"])
app.include_router(cover_letter.router, prefix="/api/v1", tags=["Cover Letter"])
app.include_router(preview.router, prefix="/api/v1", tags=["Preview"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Unified Resume Builder API",
        "status": "healthy",
        "version": "0.1.0",
        "docs": "Visit /docs for interactive API documentation",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
