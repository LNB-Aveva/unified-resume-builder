"""AI routes must consume weighted quota before reaching Hugging Face."""

import time
import uuid
from unittest.mock import AsyncMock

import jwt
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.api.routes import cover_letter, rewrite, summary
from app.main import app

TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests-only-must-be-32-bytes-minimum"


def _auth_headers(user_id: str) -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": user_id,
            "aud": "authenticated",
            "role": "authenticated",
            "iat": time.time(),
            "exp": time.time() + 3600,
        },
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


CASES = [
    (
        summary,
        "/api/v1/summary",
        {
            "job_title": "Engineer",
            "job_description": "Build Python systems",
            "experience_bullets": "Built APIs",
        },
        "generate_summary",
        1,
    ),
    (
        cover_letter,
        "/api/v1/cover-letter",
        {
            "job_title": "Engineer",
            "company_name": "Acme",
            "job_description": "Build Python systems",
            "experience_summary": "Built APIs",
        },
        "generate_cover_letter",
        2,
    ),
    (
        rewrite,
        "/api/v1/rewrite",
        {
            "job_title": "Engineer",
            "bullets": "Built APIs",
            "missing_keywords": "Python",
        },
        "rewrite_bullets",
        5,
    ),
]


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("route_module", "path", "body", "provider_name", "expected_units"),
    CASES,
    ids=["summary", "cover-letter", "rewrite"],
)
async def test_quota_denial_stops_provider_call(
    monkeypatch,
    route_module,
    path,
    body,
    provider_name,
    expected_units,
):
    quota = AsyncMock(
        side_effect=HTTPException(
            status_code=429,
            detail="Daily AI fair-use allowance reached.",
            headers={"Retry-After": "3600"},
        )
    )
    provider = AsyncMock()
    monkeypatch.setattr(route_module, "enforce_ai_quota", quota)
    monkeypatch.setattr(route_module, provider_name, provider)

    user_id = str(uuid.uuid4())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(path, json=body, headers=_auth_headers(user_id))

    assert response.status_code == 429
    assert response.headers["Retry-After"] == "3600"
    assert quota.await_args.kwargs == {"user_id": user_id, "units": expected_units}
    provider.assert_not_awaited()
