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
from pydantic import BaseModel, Field


class PersonalInfo(BaseModel):
    """The user's basic contact information."""
    full_name: str = Field(..., max_length=200)
    email: str = Field(..., max_length=320)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=200)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)


class WorkExperience(BaseModel):
    """A single job entry in the user's work history."""
    job_title: str = Field(..., max_length=200)
    company: str = Field(..., max_length=200)
    start_date: str = Field(..., max_length=20)
    end_date: Optional[str] = Field("Present", max_length=20)
    bullet_points: list[str]


class Education(BaseModel):
    """A single education entry."""
    degree: str = Field(..., max_length=300)
    institution: str = Field(..., max_length=300)
    graduation_date: Optional[str] = Field(None, max_length=20)
    gpa: Optional[str] = Field(None, max_length=10)


class ResumeData(BaseModel):
    personal_info: PersonalInfo
    summary: Optional[str] = Field(None, max_length=5_000)
    work_experience: list[WorkExperience]
    education: list[Education]
    skills: list[str]
    certifications: Optional[list[str]] = None
    projects: Optional[list[str]] = None
