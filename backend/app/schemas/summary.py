"""
summary.py — Pydantic schemas for the AI Summary Generator.

INPUT DESIGN:
  We accept the minimum needed to generate a good summary:
    - job_title: the role the user is applying for
    - job_description: the full job posting (used to match tone/keywords)
    - experience_bullets: the user's own experience in their words
    - years_experience: integer for context (e.g. "5 years of experience...")
    - skills: optional skill list to weave in

  We do NOT ask for a full structured resume here — that's /score's job.
  The goal is: "give me a tailored 2-3 sentence summary fast."

OUTPUT DESIGN:
  summary: the generated text (plain string, no markdown)
  word_count: so the frontend can show "47 words — good length"
  model_used: for transparency / debugging
  tip: one actionable tip to personalize the output further
"""

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
