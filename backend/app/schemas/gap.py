"""Schema for the gap analysis endpoint (raw text input)."""

from pydantic import BaseModel, Field


class GapRequest(BaseModel):
    job_text: str = Field(..., max_length=50_000)
    resume_text: str = Field(..., max_length=50_000)
