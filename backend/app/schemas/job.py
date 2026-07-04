"""Schemas for job description input and analysis output."""

from typing import Optional
from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    raw_text: str = Field(..., max_length=50_000)
    url: Optional[str] = Field(None, max_length=2000)


class JobAnalysis(BaseModel):
    job_title: str
    company: Optional[str] = None
    hard_skills: list[str]
    soft_skills: list[str]
    required_experience: Optional[str] = None
    education_requirements: Optional[list[str]] = None
    keywords: list[str]
    responsibilities: list[str]
