"""Schemas for structured resume data."""

from typing import Annotated

from pydantic import BaseModel, Field


class PersonalInfo(BaseModel):
    full_name: str = Field(..., max_length=200)
    email: str = Field(..., max_length=320)
    phone: str | None = Field(None, max_length=30)
    location: str | None = Field(None, max_length=200)
    linkedin_url: str | None = Field(None, max_length=500)
    portfolio_url: str | None = Field(None, max_length=500)


class WorkExperience(BaseModel):
    job_title: str = Field(..., max_length=200)
    company: str = Field(..., max_length=200)
    start_date: str = Field(..., max_length=20)
    end_date: str | None = Field("Present", max_length=20)
    bullet_points: list[Annotated[str, Field(max_length=2000)]] = Field(default_factory=list, max_length=30)


class Education(BaseModel):
    degree: str = Field(..., max_length=300)
    institution: str = Field(..., max_length=300)
    graduation_date: str | None = Field(None, max_length=20)
    gpa: str | None = Field(None, max_length=10)


class ResumeData(BaseModel):
    personal_info: PersonalInfo
    summary: str | None = Field(None, max_length=5_000)
    work_experience: list[WorkExperience] = Field(default_factory=list, max_length=20)
    education: list[Education] = Field(default_factory=list, max_length=15)
    skills: list[Annotated[str, Field(max_length=200)]] = Field(default_factory=list, max_length=50)
    certifications: list[Annotated[str, Field(max_length=500)]] | None = Field(None, max_length=30)
    projects: list[Annotated[str, Field(max_length=2000)]] | None = Field(None, max_length=20)
