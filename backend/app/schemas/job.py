"""
job.py - Defines the DATA SHAPE of a job description.

WHY THIS FILE EXISTS:
When a user pastes a job description, we need to extract structured data from it.
This schema defines what that extracted data looks like AFTER parsing.

The raw job description is just a big block of text. Our NLP module will process
it and produce a structured JobAnalysis object that all other modules can use.
"""

from typing import Optional
from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    """Raw job description input from the user."""
    title: Optional[str] = Field(None, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    raw_text: str = Field(..., max_length=50_000)
    url: Optional[str] = Field(None, max_length=2000)


class JobAnalysis(BaseModel):
    """
    Structured output AFTER analyzing a job description.

    WHY SEPARATE FROM JobDescription?
    The raw text goes IN, and this structured analysis comes OUT.
    This separation is called "input vs. output schemas" — a common
    pattern in API design.
    """
    job_title: str
    company: Optional[str] = None
    hard_skills: list[str]     # Technical skills: "Python", "SQL", "React"
    soft_skills: list[str]     # People skills: "leadership", "communication"
    required_experience: Optional[str] = None  # e.g., "3+ years"
    education_requirements: Optional[list[str]] = None
    keywords: list[str]        # All important keywords extracted
    responsibilities: list[str]
