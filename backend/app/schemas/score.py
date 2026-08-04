"""Schemas for ATS scoring input and output."""

from pydantic import BaseModel

from app.schemas.job import JobDescription
from app.schemas.resume import ResumeData


class ScoreRequest(BaseModel):
    job: JobDescription
    resume: ResumeData


class ATSScore(BaseModel):
    overall_score: float
    grade: str
    grade_label: str
    hard_skills_score: float
    soft_skills_score: float
    matched_hard_skills: list[str]
    matched_soft_skills: list[str]
    matched_keywords: list[str]
    missing_hard_skills: list[str]
    missing_soft_skills: list[str]
    missing_keywords: list[str]
    total_job_keywords: int
    total_matched: int
    total_missing: int
    domain_warning: str | None = None
