"""
score.py — API route for ATS resume scoring.

ENDPOINT: POST /api/v1/score

This is the second core endpoint. The analyze endpoint tells you what a job
WANTS. This endpoint tells you how well your resume MATCHES what the job wants.

Together these two endpoints power the core value proposition of the product:
  1. POST /api/v1/analyze  → "Here's what this job requires"
  2. POST /api/v1/score    → "Here's how your resume stacks up against it"
"""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.score import ATSScore, ScoreRequest
from app.services.nlp.keyword_extractor import extract_keywords
from app.services.scoring.ats_scorer import score_resume

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


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
    """
    POST /api/v1/score

    Body (JSON):
        {
            "job": {
                "raw_text": "...full job description...",
                "title": "Software Engineer",    ← optional
                "company": "TechCorp"            ← optional
            },
            "resume": {
                "personal_info": { "full_name": "...", "email": "..." },
                "work_experience": [...],
                "education": [...],
                "skills": ["Python", "React", ...]
            }
        }

    Returns an ATSScore with overall score, grade, matched/missing skills.
    """
    if not score_req.job.raw_text or not score_req.job.raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="job.raw_text cannot be empty.",
        )

    job_analysis = extract_keywords(score_req.job)
    return score_resume(job_analysis, score_req.resume)
