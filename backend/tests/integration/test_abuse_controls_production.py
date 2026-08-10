"""Credential-gated production proof for migration 008 abuse controls."""

import os
import uuid
from datetime import UTC, datetime, timedelta

import httpx
import pytest

from tests.integration._supabase_test_auth import access_token_from_admin_magic_link

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
REST = f"{SUPABASE_URL}/rest/v1"
AUTH = f"{SUPABASE_URL}/auth/v1"
_MISSING = not all([SUPABASE_URL, ANON_KEY, SERVICE_KEY])


def _admin_headers() -> dict[str, str]:
    return {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }


def _user_headers(token: str) -> dict[str, str]:
    return {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


@pytest.fixture(scope="module")
def abuse_user():
    if _MISSING:
        pytest.skip("Production Supabase credentials are not set")

    tag = uuid.uuid4().hex[:10]
    email = f"abuse-controls-{tag}@test.local"
    password = f"Abuse!Pass_{tag}"
    create = httpx.post(
        f"{AUTH}/admin/users",
        headers=_admin_headers(),
        json={"email": email, "password": password, "email_confirm": True},
        timeout=30,
    )
    create.raise_for_status()
    user_id = create.json()["id"]

    access_token = access_token_from_admin_magic_link(
        auth_url=AUTH,
        anon_key=ANON_KEY,
        service_key=SERVICE_KEY,
        email=email,
    )

    profile = httpx.post(
        f"{REST}/profiles",
        headers={**_admin_headers(), "Prefer": "resolution=merge-duplicates"},
        json={"id": user_id, "full_name": "Abuse Control User"},
        timeout=30,
    )
    profile.raise_for_status()

    try:
        yield {"id": user_id, "jwt": access_token}
    finally:
        httpx.delete(
            f"{AUTH}/admin/users/{user_id}",
            headers=_admin_headers(),
            timeout=30,
        )


@pytest.mark.skipif(_MISSING, reason="Production Supabase credentials are not set")
class TestProductionAbuseControls:
    def test_old_client_callable_quota_signature_is_absent(self, abuse_user):
        response = httpx.post(
            f"{REST}/rpc/consume_ai_quota",
            headers=_user_headers(abuse_user["jwt"]),
            json={"p_units": 6},
            timeout=30,
        )
        assert response.status_code == 404

    def test_backend_quota_signature_rejects_user_jwt(self, abuse_user):
        response = httpx.post(
            f"{REST}/rpc/consume_ai_quota",
            headers=_user_headers(abuse_user["jwt"]),
            json={"p_user_id": abuse_user["id"], "p_units": 1},
            timeout=30,
        )
        assert response.status_code in (401, 403, 404)

    def test_far_future_shared_score_is_rejected(self, abuse_user):
        response = httpx.post(
            f"{REST}/shared_scores",
            headers=_user_headers(abuse_user["jwt"]),
            json={
                "id": uuid.uuid4().hex,
                "user_id": abuse_user["id"],
                "overall_score": 80,
                "grade": "B",
                "grade_label": "Good",
                "expires_at": (datetime.now(UTC) + timedelta(days=365)).isoformat(),
            },
            timeout=30,
        )
        assert response.status_code == 400

    def test_oversized_direct_writes_are_rejected(self, abuse_user):
        profile_response = httpx.patch(
            f"{REST}/profiles?id=eq.{abuse_user['id']}",
            headers=_user_headers(abuse_user["jwt"]),
            json={"full_name": "x" * 201},
            timeout=30,
        )
        assert profile_response.status_code == 400

        job_response = httpx.post(
            f"{REST}/jobs",
            headers=_user_headers(abuse_user["jwt"]),
            json={
                "user_id": abuse_user["id"],
                "company": "Company",
                "title": "Role",
                "notes": "x" * 20_001,
            },
            timeout=30,
        )
        assert job_response.status_code == 400

        score_response = httpx.post(
            f"{REST}/shared_scores",
            headers=_user_headers(abuse_user["jwt"]),
            json={
                "id": uuid.uuid4().hex,
                "user_id": abuse_user["id"],
                "overall_score": 80,
                "grade": "B",
                "grade_label": "Good",
                "matched_keywords": ["x"] * 501,
                "expires_at": (datetime.now(UTC) + timedelta(days=1)).isoformat(),
            },
            timeout=30,
        )
        assert score_response.status_code == 400

    def test_resume_row_ceiling_is_enforced(self, abuse_user):
        headers = _user_headers(abuse_user["jwt"])
        for index in range(50):
            response = httpx.post(
                f"{REST}/resumes",
                headers=headers,
                json={
                    "user_id": abuse_user["id"],
                    "title": f"Abuse-control proof {index + 1}",
                },
                timeout=30,
            )
            assert response.status_code == 201

        denied = httpx.post(
            f"{REST}/resumes",
            headers=headers,
            json={"user_id": abuse_user["id"], "title": "Over limit"},
            timeout=30,
        )
        assert denied.status_code == 400
