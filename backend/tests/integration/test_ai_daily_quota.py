"""Integration coverage for the unauthenticated AI cost guard."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.routes import preview
from app.core import rate_limit
from app.main import app


@pytest.mark.anyio
async def test_preview_daily_quota_returns_actionable_429(monkeypatch):
    async def fake_preview(bullet: str) -> dict[str, str]:
        return {
            "original": bullet,
            "rewritten": "Built internal APIs for business teams.",
            "improvement": "Added action verb",
        }

    monkeypatch.setattr(preview, "preview_rewrite_bullet", fake_preview)
    monkeypatch.setattr(rate_limit, "AI_DAILY_GLOBAL_LIMIT", 10)
    monkeypatch.setattr(rate_limit, "AI_PREVIEW_DAILY_IP_LIMIT", 1)
    monkeypatch.setattr(rate_limit, "ai_daily_limiter", rate_limit.DailyQuotaLimiter())

    headers = {"X-Forwarded-For": "203.0.113.123"}
    body = {"bullet": "Worked on internal APIs for business teams"}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        first = await client.post("/api/v1/preview-rewrite", json=body, headers=headers)
        blocked = await client.post("/api/v1/preview-rewrite", json=body, headers=headers)

    assert first.status_code == 200
    assert blocked.status_code == 429
    assert "daily limit" in blocked.json()["detail"].lower()
    assert int(blocked.headers["retry-after"]) > 0
