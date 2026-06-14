"""
rewrite.py — API route for AI-powered resume bullet rewriting.

ENDPOINT: POST /api/v1/rewrite

WHY A SEPARATE ROUTE FROM /summary:
  The summary generator creates *new* prose from scratch.
  The rewriter *transforms existing content* — the constraint
  "preserve factual content, don't invent metrics" means the
  prompt and output parsing are fundamentally different.
  Keeping them in separate routes and services makes each
  easier to tune and test independently.

REQUEST VALIDATION:
  We validate the three required fields before hitting the AI.
  Missing keywords is optional in practice (user may not have
  run Gap Analysis yet), but we require job_title and bullets
  because the prompt collapses without them.

ERROR MAPPING (same pattern as summary.py):
  ValueError  → 503  (missing API key)
  Timeout     → 504  (HF cold-start)
  HTTPStatus  → 502  (upstream API error)
  RuntimeError → 500  (empty/unparseable model output)
"""

from fastapi import APIRouter, HTTPException
import httpx

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
async def rewrite_bullets_route(request: BulletRewriteRequest) -> BulletRewriteResponse:
    """
    POST /api/v1/rewrite

    Body (JSON):
        {
          "job_title": "Senior Software Engineer",
          "missing_keywords": "Docker, Kubernetes, CI/CD, microservices",
          "bullets": "- Worked on backend services\\n- Helped with deployments"
        }

    Returns BulletRewriteResponse with original/rewritten pairs + keywords added.
    """
    if not request.job_title.strip():
        raise HTTPException(status_code=422, detail="job_title cannot be empty.")
    if not request.bullets.strip():
        raise HTTPException(status_code=422, detail="bullets cannot be empty.")

    try:
        return await rewrite_bullets(request)

    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "HuggingFace model timed out — try reducing to 3 bullets "
                "or wait 30s for the model to warm up."
            ),
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace API error {e.response.status_code}: {e.response.text[:200]}",
        )

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
