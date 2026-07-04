from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.routes._ai_errors import call_ai_service
from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.services.ai.cover_letter import generate_cover_letter

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/cover-letter",
    response_model=CoverLetterResponse,
    summary="Generate AI cover letter",
    description=(
        "Generates a tailored 250-320 word cover letter using HuggingFace Inference API. "
        "Supports formal and conversational tone. "
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

    return await call_ai_service(generate_cover_letter(request_body))
