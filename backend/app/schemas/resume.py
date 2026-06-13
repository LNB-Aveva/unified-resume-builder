"""
resume.py - Defines the DATA SHAPE of a resume.

WHY THIS FILE EXISTS:
Before you can build any feature (ATS scoring, keyword extraction, AI rewriting),
you need to agree on what a "resume" looks like as structured data.

WHAT IS A SCHEMA?
A schema is a blueprint that says: "A resume MUST have these fields, in these
formats." It's like a form template — if someone fills in their name but skips
their email, the schema rejects it.

WHAT IS PYDANTIC?
Pydantic is a Python library that enforces schemas. You define the shape of your
data using Python classes, and Pydantic automatically validates any data against
that shape. If the data is wrong, it throws a clear error.

ANALOGY:
Think of a schema like a job application form. Every field has a label, a type
(text, date, number), and some are required (*) while others are optional.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class PersonalInfo(BaseModel):
    """The user's basic contact information."""
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class WorkExperience(BaseModel):
    """A single job entry in the user's work history."""
    job_title: str
    company: str
    start_date: str            # e.g., "Jan 2023"
    end_date: Optional[str] = "Present"
    bullet_points: list[str]   # The experience descriptions that we'll optimize


class Education(BaseModel):
    """A single education entry."""
    degree: str                # e.g., "Bachelor of Science in Computer Science"
    institution: str
    graduation_date: Optional[str] = None
    gpa: Optional[str] = None


class ResumeData(BaseModel):
    """
    The complete resume data model.

    WHY THIS STRUCTURE:
    Every AI module in our system (keyword extractor, ATS scorer, resume rewriter)
    will read and write data in THIS format. Having one agreed-upon shape means
    all modules can work together without translation errors.
    """
    personal_info: PersonalInfo
    summary: Optional[str] = None
    work_experience: list[WorkExperience]
    education: list[Education]
    skills: list[str]
    certifications: Optional[list[str]] = None
    projects: Optional[list[str]] = None
