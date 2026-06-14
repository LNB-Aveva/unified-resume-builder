"""
cover_letter.py — API route for AI cover letter generation.

ENDPOINT: POST /api/v1/cover-letter

Same error-mapping pattern as /summary and /rewrite:
  ValueError      → 503  missing API key
  TimeoutException → 504  HF cold-start
  HTTPStatusError → 502  upstream API error
  RuntimeError    → 500  empty/bad model output
"""

from fastapi import APIRouter, HTTPException
import httpx

from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.services.ai.cover_letter import generate_cover_letter

router = APIRouter()


@router.post(
    "/cover-letter",
    response_model=CoverLetterResponse,
    summary="Generate AI cover letter",
    description=(
        "Generates a tailored 250-320 word cover letter using HuggingFace Inference API "
        "(Mistral-7B-Instruct). Supports formal and conversational tone. "
        "Requires HUGGINGFACE_API_KEY environment variable."
    ),
)
async def create_cover_letter(request: CoverLetterRequest) -> CoverLetterResponse:
    if not request.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request.company_name.strip():
        raise HTTPException(status_code=422, detail="company_name cannot be empty.")
    if not request.job_description.strip():
        raise HTTPException(status_code=422, detail="job_description cannot be empty.")
    if not request.experience_summary.strip():
        raise HTTPException(status_code=422, detail="experience_summary cannot be empty.")

    try:
        return await generate_cover_letter(request)

    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "HuggingFace model timed out (cover letters are longer — cold-start can take 30s). "
                "Wait 30 seconds and try again."
            ),
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace API error {e.response.status_code}: {e.response.text[:200]}",
        )

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
