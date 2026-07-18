"""Schemas for the AI cover letter generator."""

from typing import Literal

from pydantic import BaseModel, Field


class CoverLetterRequest(BaseModel):
    job_title: str = Field(..., max_length=200)
    company_name: str = Field(..., max_length=200)
    job_description: str = Field(..., max_length=50_000)
    experience_summary: str = Field(..., max_length=10_000)
    skills: str = Field("", max_length=2_000)
    tone: Literal["formal", "conversational"] = "formal"


class CoverLetterResponse(BaseModel):
    cover_letter: str
    word_count: int
    model_used: str
    tip: str
