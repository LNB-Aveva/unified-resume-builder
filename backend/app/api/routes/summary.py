from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.routes._ai_errors import call_ai_service
from app.core.ai_quota import enforce_ai_quota
from app.core.auth import require_auth
from app.core.rate_limit import limiter
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
@limiter.limit("10/minute")
async def create_summary(request: Request, request_body: SummaryRequest, _user_id: str = Depends(require_auth)) -> SummaryResponse:
    if not request_body.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request_body.job_description.strip():
        raise HTTPException(status_code=422, detail="job_description cannot be empty.")
    if not request_body.experience_bullets.strip():
        raise HTTPException(status_code=422, detail="experience_bullets cannot be empty.")

    await enforce_ai_quota(request, units=1)
    return await call_ai_service(generate_summary(request_body))
