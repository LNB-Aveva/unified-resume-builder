"""POST /api/v1/score -- score a resume against a job description."""

from fastapi import APIRouter, HTTPException, Request

from app.core.rate_limit import limiter
from app.schemas.score import ATSScore, ScoreRequest
from app.services.nlp.keyword_extractor import extract_keywords
from app.services.scoring.ats_scorer import score_resume

router = APIRouter()


@router.post(
    "/score",
    response_model=ATSScore,
    summary="Score a resume against a job description",
    description=(
        "Compares a resume against a job description and returns an ATS match score "
        "(0-100), letter grade, matched skills, and missing skills."
    ),
)
@limiter.limit("30/minute")
async def score_resume_endpoint(request: Request, score_req: ScoreRequest) -> ATSScore:
    if not score_req.job.raw_text or not score_req.job.raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="job.raw_text cannot be empty.",
        )

    job_analysis = extract_keywords(score_req.job)
    return score_resume(job_analysis, score_req.resume)
