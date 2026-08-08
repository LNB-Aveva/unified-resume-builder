from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.routes._ai_errors import call_ai_service
from app.core.ai_quota import enforce_ai_quota
from app.core.auth import require_auth
from app.core.rate_limit import limiter
from app.schemas.rewriter import BulletRewriteRequest, BulletRewriteResponse
from app.services.ai.rewriter import rewrite_bullets

router = APIRouter()


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
async def rewrite_bullets_route(request: Request, request_body: BulletRewriteRequest, _user_id: str = Depends(require_auth)) -> BulletRewriteResponse:
    if not request_body.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request_body.bullets.strip():
        raise HTTPException(status_code=422, detail="bullets cannot be empty.")

    await enforce_ai_quota(request, units=5)
    return await call_ai_service(rewrite_bullets(request_body))
