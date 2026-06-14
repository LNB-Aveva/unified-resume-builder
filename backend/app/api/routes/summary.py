"""
summary.py — API route for AI-generated professional summaries.

ENDPOINT: POST /api/v1/summary

WHY ASYNC MATTERS HERE:
  The HuggingFace API can take 5-20 seconds to respond (cold-start on free tier).
  If this were synchronous (regular def), the server would BLOCK — no other
  requests could be handled while waiting. With `async def`, FastAPI suspends
  this request and handles others while waiting for HuggingFace to respond.
  This is called "non-blocking I/O" and it's why we use httpx (async HTTP client)
  instead of the popular `requests` library (which is synchronous).

ERROR HANDLING STRATEGY:
  We map different error types to appropriate HTTP status codes:
    ValueError  → 503 Service Unavailable (missing API key — config problem)
    HTTPStatusError → 502 Bad Gateway (HF API failed — upstream problem)
    Timeout     → 504 Gateway Timeout (HF model cold-start took too long)
    Anything else → 500 Internal Server Error
"""

from fastapi import APIRouter, HTTPException
import httpx

from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.ai.summarizer import generate_summary

router = APIRouter()


@router.post(
    "/summary",
    response_model=SummaryResponse,
    summary="Generate AI professional summary",
    description=(
        "Uses HuggingFace Inference API to generate a tailored 2-3 sentence "
        "professional summary from the candidate's experience and the target job description. "
        "Requires HUGGINGFACE_API_KEY environment variable."
    ),
)
async def create_summary(request: SummaryRequest) -> SummaryResponse:
    """
    POST /api/v1/summary

    Body (JSON):
        {
          "job_title": "Senior Software Engineer",
          "job_description": "We are looking for...",
          "experience_bullets": "- Built REST APIs with FastAPI...",
          "years_experience": 5,
          "skills": "Python, FastAPI, Docker, AWS"
        }

    Returns SummaryResponse with generated summary text + word count + tip.
    """
    if not request.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request.job_description.strip():
        raise HTTPException(status_code=422, detail="job_description cannot be empty.")
    if not request.experience_bullets.strip():
        raise HTTPException(status_code=422, detail="experience_bullets cannot be empty.")

    try:
        return await generate_summary(request)

    except ValueError as e:
        # Missing API key — tell the user what to do
        raise HTTPException(status_code=503, detail=str(e))

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "HuggingFace model timed out (cold-start can take 20s). "
                "Wait 30 seconds and try again — the model will be warm."
            ),
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace API error {e.response.status_code}: {e.response.text[:200]}",
        )

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
