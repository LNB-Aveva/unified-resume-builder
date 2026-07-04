"""Schemas for the AI bullet point rewriter."""

from pydantic import BaseModel, Field


class BulletRewriteRequest(BaseModel):
    job_title: str = Field(..., max_length=200)
    missing_keywords: str = Field(..., max_length=2_000)
    bullets: str = Field(..., max_length=5_000)


class RewrittenBullet(BaseModel):
    original: str
    rewritten: str
    keywords_woven: list[str]


class BulletRewriteResponse(BaseModel):
    rewrites: list[RewrittenBullet]
    model_used: str
    tip: str
