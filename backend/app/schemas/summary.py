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

from pydantic import BaseModel


class SummaryRequest(BaseModel):
    job_title: str
    job_description: str
    experience_bullets: str
    years_experience: int = 0
    skills: str = ""  # comma-separated, optional


class SummaryResponse(BaseModel):
    summary: str
    word_count: int
    model_used: str
    tip: str
