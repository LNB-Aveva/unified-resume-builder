"""Schemas for the unauthenticated bullet rewrite preview."""

from pydantic import BaseModel, Field


class BulletPreviewRequest(BaseModel):
    bullet: str = Field(..., min_length=10, max_length=500)


class BulletPreviewResponse(BaseModel):
    original: str
    rewritten: str
    improvement: str
