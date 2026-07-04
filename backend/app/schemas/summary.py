"""Schemas for the AI summary generator."""

from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    job_title: str = Field(..., max_length=200)
    job_description: str = Field(..., max_length=50_000)
    experience_bullets: str = Field(..., max_length=10_000)
    years_experience: int = Field(0, ge=0, le=60)
    skills: str = Field("", max_length=2_000)


class SummaryResponse(BaseModel):
    summary: str
    word_count: int
    model_used: str
    tip: str
