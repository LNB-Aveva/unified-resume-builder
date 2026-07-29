"""FastAPI entry point for the Unified Resume Builder API."""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import anyio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.routes import analyze, compliance, cover_letter, export, gap, preview, rewrite, score, summary
from app.core.config import settings  # noqa: F401
from app.core.rate_limit import limiter
from app.services.ai.hf_client import close_client


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    yield
    await close_client()


_REQUEST_TIMEOUT = 60.0


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

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestTimeoutMiddleware)

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
