"""POST /api/v1/preview-rewrite -- unauthenticated single-bullet AI rewrite demo."""

from fastapi import APIRouter, Request

from app.api.routes._ai_errors import call_ai_service
from app.core.rate_limit import enforce_preview_ai_quota, limiter
from app.schemas.preview import BulletPreviewRequest, BulletPreviewResponse
from app.services.ai.preview import preview_rewrite_bullet

router = APIRouter()


@router.post(
    "/preview-rewrite",
    response_model=BulletPreviewResponse,
    summary="Preview bullet rewrite (unauthenticated)",
    description=(
        "Rewrites a single resume bullet point without requiring an account. "
        "Strictly rate-limited. For full multi-bullet rewrites with keyword targeting, "
        "use POST /api/v1/rewrite (requires authentication)."
    ),
)
@limiter.limit("5/minute")
async def preview_rewrite_route(request: Request, body: BulletPreviewRequest) -> BulletPreviewResponse:
    enforce_preview_ai_quota(request)
    result = await call_ai_service(preview_rewrite_bullet(body.bullet))
    return BulletPreviewResponse(**result)
