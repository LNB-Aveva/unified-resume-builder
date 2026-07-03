"""Schemas for ATS compliance checking."""

from pydantic import BaseModel, Field


class ComplianceCheck(BaseModel):
    rule: str
    passed: bool
    severity: str
    message: str


class ComplianceRequest(BaseModel):
    resume_text: str = Field(..., max_length=50_000)


class ComplianceReport(BaseModel):
    overall_score: int
    critical_issues: int
    warnings: int
    suggestions_failed: int
    passed_count: int
    total_checks: int
    checks: list[ComplianceCheck]
