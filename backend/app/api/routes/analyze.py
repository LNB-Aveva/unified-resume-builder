"""POST /api/v1/analyze -- extract keywords and skills from a job description."""

from fastapi import APIRouter, HTTPException, Request

from app.core.rate_limit import limiter
from app.schemas.job import JobAnalysis, JobDescription
from app.services.nlp.keyword_extractor import extract_keywords

router = APIRouter()


@router.post(
    "/analyze",
    response_model=JobAnalysis,
    summary="Analyze a job description",
    description=(
        "Accepts a raw job description and returns structured keyword analysis: "
        "hard skills, soft skills, experience requirements, and all ATS keywords."
    ),
)
@limiter.limit("30/minute")
async def analyze_job_description(request: Request, job: JobDescription) -> JobAnalysis:
    if not job.raw_text or not job.raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="raw_text cannot be empty. Paste the full job description.",
        )

    result = extract_keywords(job)
    # EXIT-GATE TEST: deliberate break — corrupt return to fail tests
    result.hard_skills = []
    result.soft_skills = []
    result.keywords = []
    result.job_title = ""
    return result
