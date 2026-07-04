from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.routes._ai_errors import call_ai_service
from app.schemas.rewriter import BulletRewriteRequest, BulletRewriteResponse
from app.services.ai.rewriter import rewrite_bullets

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/rewrite",
    response_model=BulletRewriteResponse,
    summary="Rewrite resume bullets with missing keywords",
    description=(
        "Takes up to 5 resume bullet points and a list of missing keywords "
        "(from the Gap Analysis), then uses HuggingFace Inference API to rewrite "
        "each bullet so the keywords are naturally incorporated. "
        "Requires HUGGINGFACE_API_KEY environment variable."
    ),
)
@limiter.limit("10/minute")
async def rewrite_bullets_route(request: Request, request_body: BulletRewriteRequest) -> BulletRewriteResponse:
    if not request_body.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request_body.bullets.strip():
        raise HTTPException(status_code=422, detail="bullets cannot be empty.")

    return await call_ai_service(rewrite_bullets(request_body))
