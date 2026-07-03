"""
compliance.py — API route for ATS compliance checking.

ENDPOINT: POST /api/v1/compliance

Accepts raw resume text and returns a compliance report:
  - 15 formatting checks (critical, warning, suggestion)
  - Overall score 0-100
  - Specific messages explaining what to fix

WHAT'S DIFFERENT FROM /gap?
  /gap   → "Does your resume have the RIGHT KEYWORDS for this job?"
  /compliance → "Can ATS systems PARSE your resume correctly at all?"

Both checks are needed. A perfectly formatted resume with wrong keywords fails.
A keyword-perfect resume in the wrong format also fails. You need both.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.compliance import ComplianceReport
from app.services.compliance.checker import check_resume

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class ComplianceRequest(BaseModel):
    """Input: just the raw resume text."""
    resume_text: str = Field(..., max_length=50_000)


@router.post(
    "/compliance",
    response_model=ComplianceReport,
    summary="ATS compliance check",
    description=(
        "Runs 15 ATS formatting checks on raw resume text. "
        "Returns critical issues, warnings, and suggestions with specific fix instructions."
    ),
)
@limiter.limit("30/minute")
async def check_compliance(request: Request, comp_req: ComplianceRequest) -> ComplianceReport:
    """
    POST /api/v1/compliance

    Body (JSON):
        { "resume_text": "Jane Developer | jane@email.com | ..." }

    Returns ComplianceReport with overall_score and per-rule checks.
    """
    if not comp_req.resume_text.strip():
        raise HTTPException(status_code=422, detail="resume_text cannot be empty.")

    return check_resume(comp_req.resume_text)
