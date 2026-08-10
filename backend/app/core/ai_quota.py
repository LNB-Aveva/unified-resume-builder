"""Durable Supabase-backed daily quota for Hugging Face routes."""

import logging
from dataclasses import dataclass

import httpx
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class QuotaResult:
    allowed: bool
    user_remaining: int
    global_remaining: int
    retry_after_seconds: int


async def consume_ai_quota(
    user_id: str,
    units: int,
    client: httpx.AsyncClient | None = None,
) -> QuotaResult:
    """Atomically consume AI units through the backend-only Supabase RPC."""
    if units < 1 or units > 5:
        raise ValueError("AI quota units must be between 1 and 5")
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Supabase AI quota is not configured")

    owns_client = client is None
    quota_client = client or httpx.AsyncClient(timeout=5.0)
    try:
        response = await quota_client.post(
            f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/rpc/consume_ai_quota",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
            },
            json={"p_user_id": user_id, "p_units": units},
        )
        response.raise_for_status()
        try:
            payload = response.json()
        except ValueError as exc:
            raise RuntimeError("Supabase AI quota returned invalid JSON") from exc
    finally:
        if owns_client:
            await quota_client.aclose()

    record = payload[0] if isinstance(payload, list) and payload else payload
    if not isinstance(record, dict) or "allowed" not in record:
        raise RuntimeError("Supabase AI quota returned an invalid response")

    return QuotaResult(
        allowed=bool(record["allowed"]),
        user_remaining=max(0, int(record.get("user_remaining", 0))),
        global_remaining=max(0, int(record.get("global_remaining", 0))),
        retry_after_seconds=max(1, int(record.get("retry_after_seconds", 1))),
    )


async def enforce_ai_quota(user_id: str, units: int) -> None:
    """Fail closed in production before an AI provider call can be made."""
    if not settings.AI_QUOTA_ENFORCEMENT:
        return

    try:
        result = await consume_ai_quota(user_id, units)
    except httpx.HTTPStatusError as exc:
        logger.error("Supabase AI quota RPC failed with HTTP %s", exc.response.status_code)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI usage controls are temporarily unavailable. Please try again shortly.",
        ) from None
    except (httpx.TransportError, RuntimeError) as exc:
        logger.error("Supabase AI quota unavailable: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI usage controls are temporarily unavailable. Please try again shortly.",
        ) from None

    if not result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Daily AI fair-use allowance reached. "
                "Your allowance resets at 00:00 UTC."
            ),
            headers={"Retry-After": str(result.retry_after_seconds)},
        )
