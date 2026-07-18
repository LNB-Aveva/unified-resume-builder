"""Schemas for job description input and analysis output."""


from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    title: str | None = Field(None, max_length=200)
    company: str | None = Field(None, max_length=200)
    raw_text: str = Field(..., max_length=50_000)
    url: str | None = Field(None, max_length=2000)


class JobAnalysis(BaseModel):
    job_title: str
    company: str | None = None
    hard_skills: list[str]
    soft_skills: list[str]
    required_experience: str | None = None
    education_requirements: list[str] | None = None
    keywords: list[str]
    responsibilities: list[str]
