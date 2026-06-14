"""
gap.py — API route for gap analysis (paste job + resume text, get score).

ENDPOINT: POST /api/v1/gap

This is the most user-friendly endpoint:
  - No JSON schema to learn
  - No structured resume format required
  - Just paste two blocks of text and get your score

The pipeline:
  raw job text → keyword_extractor → JobAnalysis
  raw resume text → score_from_text() → ATSScore

The ATSScore result has everything needed for the Gap Analysis UI:
  matched_keywords (green chips), missing_keywords (red chips), overall score
"""

from fastapi import APIRouter, HTTPException

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
        "Returns ATS score, matched skills, and missing skills. "
        "No structured JSON required — just paste and go."
    ),
)
async def analyze_gap(request: GapRequest) -> ATSScore:
    """
    POST /api/v1/gap

    Body (JSON):
        {
            "job_text": "Software Engineer — Requirements: Python, React...",
            "resume_text": "Jane Developer — Skills: JavaScript, React, SQL..."
        }

    Returns ATSScore with overall score, grade, matched/missing skill lists.
    """
    if not request.job_text.strip():
        raise HTTPException(status_code=422, detail="job_text cannot be empty.")
    if not request.resume_text.strip():
        raise HTTPException(status_code=422, detail="resume_text cannot be empty.")

    job_analysis = extract_keywords(JobDescription(raw_text=request.job_text))
    return score_from_text(job_analysis, request.resume_text)
