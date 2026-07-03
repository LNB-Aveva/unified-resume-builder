"""
cover_letter.py — Pydantic schemas for the AI Cover Letter Generator.

DESIGN DECISIONS:

  company_name is required (unlike the summary generator which just takes
  job_title). A cover letter without the company name is generic and weak —
  the model needs it to write a personalised opening hook.

  tone controls the prompt's instruction set:
    "formal"         — traditional business language, third-person achievements
    "conversational" — energetic, personality-forward, slightly casual

  word_target is informational in the response (we can't force exact word
  counts from a generative model, but the prompt constrains the range).

OUTPUT:
  cover_letter: the full letter text, ready to copy-paste
  word_count: so the user can check it's in the 250–350 word sweet spot
  model_used: transparency
  tip: one personalisation tip (e.g. "add the hiring manager's name")
"""

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
