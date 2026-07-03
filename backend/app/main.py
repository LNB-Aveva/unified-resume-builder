"""FastAPI entry point for the Unified Resume Builder API."""

import os
from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings  # noqa: F401
from app.api.routes import analyze, score, gap, compliance, summary, rewrite, export, cover_letter

limiter = Limiter(key_func=get_remote_address)

_is_production = os.environ.get("RENDER", "") != "" or os.environ.get("ENV", "").lower() == "production"

app = FastAPI(
    title="Unified Resume Builder API",
    description="ATS scoring, keyword analysis, and AI-powered resume optimization",
    version="0.1.0",
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
_frontend_url = os.environ.get("FRONTEND_URL", "").strip().rstrip("/")
if _frontend_url:
    _cors_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(score.router, prefix="/api/v1", tags=["Scoring"])
app.include_router(gap.router, prefix="/api/v1", tags=["Gap Analysis"])
app.include_router(compliance.router, prefix="/api/v1", tags=["Compliance"])
app.include_router(summary.router, prefix="/api/v1", tags=["AI Summary"])
app.include_router(rewrite.router, prefix="/api/v1", tags=["AI Rewriter"])
app.include_router(export.router, prefix="/api/v1", tags=["PDF Export"])
app.include_router(cover_letter.router, prefix="/api/v1", tags=["Cover Letter"])


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
