"""POST /api/v1/preview-rewrite -- quota-free deterministic rewrite preview."""

from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.schemas.preview import BulletPreviewRequest, BulletPreviewResponse
from app.services.ai.preview import preview_rewrite_bullet

router = APIRouter()


@router.post(
    "/preview-rewrite",
    response_model=BulletPreviewResponse,
    summary="Preview bullet rewrite (unauthenticated)",
    description=(
        "Demonstrates a deterministic single-bullet improvement without requiring an account. "
        "For AI multi-bullet rewrites with keyword targeting, "
        "use POST /api/v1/rewrite (requires authentication)."
    ),
)
@limiter.limit("5/minute")
async def preview_rewrite_route(request: Request, body: BulletPreviewRequest) -> BulletPreviewResponse:
    result = await preview_rewrite_bullet(body.bullet)
    return BulletPreviewResponse(**result)
