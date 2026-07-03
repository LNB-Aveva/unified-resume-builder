"""
export.py — Pydantic schemas for the PDF Resume Export endpoint.

DESIGN DECISIONS:

  WorkExperience.bullets is list[str] not a single string.
  Each string becomes one bullet point in the PDF. The frontend
  splits on newlines before sending — keeping it clean server-side.

  skills is a raw string (comma-separated or free text).
  We render it as-is in the template rather than parsing it —
  the user knows best how they want their skills to read.

  filename lets the frontend set the download name without
  the backend having to know the user's name. Defaults to "resume".

ATS COMPATIBILITY NOTE:
  The PDF template is intentionally single-column, text-heavy, and
  table-free. Most ATS systems extract text by reading the PDF's
  content stream in order — tables cause columns to be read in the
  wrong order. A linear layout guarantees correct extraction.
"""

from typing import Literal
from pydantic import BaseModel, Field


class PersonalInfo(BaseModel):
    full_name: str = Field(..., max_length=200)
    email: str = Field(..., max_length=320)
    phone: str = Field("", max_length=30)
    location: str = Field("", max_length=200)
    linkedin: str = Field("", max_length=500)
    website: str = Field("", max_length=500)


class WorkExperience(BaseModel):
    company: str = Field(..., max_length=200)
    title: str = Field(..., max_length=200)
    start_date: str = Field(..., max_length=20)
    end_date: str = Field(..., max_length=20)
    bullets: list[str]


class Education(BaseModel):
    institution: str = Field(..., max_length=300)
    degree: str = Field(..., max_length=200)
    field: str = Field("", max_length=200)
    year: str = Field(..., max_length=20)


class ResumeExportRequest(BaseModel):
    personal: PersonalInfo
    summary: str = Field("", max_length=5_000)
    experience: list[WorkExperience] = []
    skills: str = Field("", max_length=5_000)
    education: list[Education] = []
    filename: str = Field("resume", max_length=100)
    template: Literal["classic", "modern", "minimal"] = "classic"
