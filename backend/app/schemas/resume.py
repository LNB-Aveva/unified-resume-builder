"""Schemas for structured resume data."""

from typing import Annotated, Optional
from pydantic import BaseModel, Field


class PersonalInfo(BaseModel):
    full_name: str = Field(..., max_length=200)
    email: str = Field(..., max_length=320)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=200)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)


class WorkExperience(BaseModel):
    job_title: str = Field(..., max_length=200)
    company: str = Field(..., max_length=200)
    start_date: str = Field(..., max_length=20)
    end_date: Optional[str] = Field("Present", max_length=20)
    bullet_points: list[Annotated[str, Field(max_length=2000)]] = Field(default_factory=list, max_length=30)


class Education(BaseModel):
    degree: str = Field(..., max_length=300)
    institution: str = Field(..., max_length=300)
    graduation_date: Optional[str] = Field(None, max_length=20)
    gpa: Optional[str] = Field(None, max_length=10)


class ResumeData(BaseModel):
    personal_info: PersonalInfo
    summary: Optional[str] = Field(None, max_length=5_000)
    work_experience: list[WorkExperience] = Field(default_factory=list, max_length=20)
    education: list[Education] = Field(default_factory=list, max_length=15)
    skills: list[Annotated[str, Field(max_length=200)]] = Field(default_factory=list, max_length=50)
    certifications: Optional[list[Annotated[str, Field(max_length=500)]]] = Field(None, max_length=30)
    projects: Optional[list[Annotated[str, Field(max_length=2000)]]] = Field(None, max_length=20)
