"""POST /api/v1/compliance -- ATS compliance formatting checks."""

from fastapi import APIRouter, HTTPException, Request

from app.core.rate_limit import limiter
from app.schemas.compliance import ComplianceReport, ComplianceRequest
from app.services.compliance.checker import check_resume

router = APIRouter()


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
    if not comp_req.resume_text.strip():
        raise HTTPException(status_code=422, detail="resume_text cannot be empty.")

    return check_resume(comp_req.resume_text)
