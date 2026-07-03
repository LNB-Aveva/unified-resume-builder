"""
cover_letter.py — API route for AI cover letter generation.

ENDPOINT: POST /api/v1/cover-letter

Same error-mapping pattern as /summary and /rewrite:
  ValueError      → 503  missing API key
  TimeoutException → 504  HF cold-start
  HTTPStatusError → 502  upstream API error
  RuntimeError    → 500  empty/bad model output
"""

import logging

from fastapi import APIRouter, HTTPException, Request
import httpx
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)

from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.services.ai.cover_letter import generate_cover_letter

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


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
@limiter.limit("10/minute")
async def create_cover_letter(request: Request, request_body: CoverLetterRequest) -> CoverLetterResponse:
    if not request_body.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request_body.company_name.strip():
        raise HTTPException(status_code=422, detail="company_name cannot be empty.")
    if not request_body.job_description.strip():
        raise HTTPException(status_code=422, detail="job_description cannot be empty.")
    if not request_body.experience_summary.strip():
        raise HTTPException(status_code=422, detail="experience_summary cannot be empty.")

    try:
        return await generate_cover_letter(request_body)

    except ValueError:
        raise HTTPException(status_code=503, detail="AI service is not configured. Please contact support.")

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "HuggingFace model timed out (cover letters are longer — cold-start can take 30s). "
                "Wait 30 seconds and try again."
            ),
        )

    except httpx.HTTPStatusError as e:
        logger.error("HF API error %s: %s", e.response.status_code, e.response.text[:200])
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable.")

    except RuntimeError as e:
        logger.error("Runtime error in cover letter: %s", e)
        raise HTTPException(status_code=500, detail="Failed to generate cover letter. Please try again.")

    except Exception as e:
        logger.error("Unexpected error in cover letter: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=500, detail="An internal error occurred.")
