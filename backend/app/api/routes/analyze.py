"""
analyze.py — The API route for job description analysis.

WHAT IS A ROUTER?
In FastAPI (and most web frameworks), you don't put all your routes in one file
— that would become thousands of lines long. Instead, you split routes into
separate files called "routers". Each router handles one category of endpoints.

This router handles: POST /api/v1/analyze
The main.py file "mounts" this router with the /api/v1 prefix.

WHAT IS POST vs GET?
- GET: "give me data" — fetching a webpage, loading a list
- POST: "process this data I'm sending you" — submitting a form, sending JSON
Keyword analysis requires the user to SEND us text, so POST is correct here.

WHY /api/v1/?
The /v1/ signals "version 1 of our API". When we change the API in a breaking
way (different response shape), we bump to /v2/ — old clients keep working on
/v1/ while new clients use /v2/. Industry standard.
"""

from fastapi import APIRouter, HTTPException

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
async def analyze_job_description(job: JobDescription) -> JobAnalysis:
    """
    POST /api/v1/analyze

    Body (JSON):
        {
            "raw_text": "Software Engineer ... Requirements: Python, SQL ...",
            "title": "Software Engineer",    ← optional
            "company": "TechCorp",           ← optional
            "url": "https://..."             ← optional
        }

    Returns a JobAnalysis with extracted skills, keywords, and responsibilities.
    """
    if not job.raw_text or not job.raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="raw_text cannot be empty. Paste the full job description.",
        )

    return extract_keywords(job)
