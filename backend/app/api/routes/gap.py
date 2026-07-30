"""POST /api/v1/gap -- gap analysis from raw job + resume text."""

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.auth import require_auth
from app.core.rate_limit import limiter
from app.schemas.gap import GapRequest
from app.schemas.job import JobDescription
from app.schemas.score import ATSScore
from app.services.nlp.keyword_extractor import extract_keywords
from app.services.scoring.ats_scorer import score_from_text

router = APIRouter()


@router.post(
    "/gap",
    response_model=ATSScore,
    summary="Gap analysis from raw text",
    description=(
        "Accepts raw job description text + raw resume text. "
        "Returns ATS score, matched skills, and missing skills."
    ),
)
@limiter.limit("30/minute")
async def analyze_gap(request: Request, gap_req: GapRequest, _user_id: str = Depends(require_auth)) -> ATSScore:
    if not gap_req.job_text.strip():
        raise HTTPException(status_code=422, detail="job_text cannot be empty.")
    if not gap_req.resume_text.strip():
        raise HTTPException(status_code=422, detail="resume_text cannot be empty.")

    job_analysis = extract_keywords(JobDescription(raw_text=gap_req.job_text))
    return score_from_text(job_analysis, gap_req.resume_text)
