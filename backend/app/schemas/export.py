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

from pydantic import BaseModel


class PersonalInfo(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""


class WorkExperience(BaseModel):
    company: str
    title: str
    start_date: str   # e.g. "Jan 2020"
    end_date: str     # e.g. "Present" or "Dec 2023"
    bullets: list[str]


class Education(BaseModel):
    institution: str
    degree: str
    field: str = ""
    year: str          # e.g. "2019" or "2017–2019"


class ResumeExportRequest(BaseModel):
    personal: PersonalInfo
    summary: str = ""
    experience: list[WorkExperience] = []
    skills: str = ""
    education: list[Education] = []
    filename: str = "resume"
