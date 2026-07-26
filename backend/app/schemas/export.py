"""Schemas for PDF resume export."""

from typing import Annotated, Literal

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
    bullets: list[Annotated[str, Field(max_length=2000)]] = Field(default_factory=list, max_length=30)


class Education(BaseModel):
    institution: str = Field(..., max_length=300)
    degree: str = Field(..., max_length=200)
    field: str = Field("", max_length=200)
    year: str = Field(..., max_length=20)


class ResumeExportRequest(BaseModel):
    personal: PersonalInfo
    summary: str = Field("", max_length=5_000)
    experience: list[WorkExperience] = Field(default_factory=list, max_length=20)
    skills: str = Field("", max_length=5_000)
    education: list[Education] = Field(default_factory=list, max_length=15)
    filename: str = Field("resume", max_length=60)
    template: Literal["classic", "modern", "minimal"] = "classic"
