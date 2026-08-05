"""Two-user RLS isolation tests (Phase 4.5 / Finding F6).

Proves that Supabase Row Level Security prevents user A from
reading, updating, or deleting user B's data across all tables:
profiles, jobs, resumes, and resume_versions.

Requires three env vars (skipped in CI when absent):
  SUPABASE_URL            — project REST URL
  SUPABASE_ANON_KEY       — public anon key
  SUPABASE_SERVICE_ROLE_KEY — admin key (for creating/deleting test users)

Run manually:
  cd backend && python -m pytest tests/integration/test_rls_isolation.py -v
"""

from __future__ import annotations

import os
import uuid

import httpx
import pytest

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_MISSING = not all([SUPABASE_URL, ANON_KEY, SERVICE_KEY])
skip_reason = "SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY not set"

REST = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else ""
AUTH = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else ""


def _admin_headers() -> dict[str, str]:
    return {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }


def _user_headers(jwt: str) -> dict[str, str]:
    return {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {jwt}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _create_user(email: str, password: str) -> str:
    """Create a test user via admin API. Returns user id."""
    r = httpx.post(
        f"{AUTH}/admin/users",
        headers=_admin_headers(),
        json={
            "email": email,
            "password": password,
            "email_confirm": True,
        },
    )
    assert r.status_code == 200, f"Failed to create user {email}: {r.text}"
    return r.json()["id"]


def _sign_in(email: str, password: str) -> str:
    """Sign in and return access token."""
    r = httpx.post(
        f"{AUTH}/token?grant_type=password",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        json={"email": email, "password": password},
    )
    assert r.status_code == 200, f"Sign-in failed for {email}: {r.text}"
    return r.json()["access_token"]


def _delete_user(user_id: str) -> None:
    """Delete a test user via admin API."""
    httpx.delete(
        f"{AUTH}/admin/users/{user_id}",
        headers=_admin_headers(),
    )


@pytest.fixture(scope="module")
def users():
    """Create two test users, yield their JWTs + IDs, then clean up."""
    if _MISSING:
        pytest.skip(skip_reason)

    tag = uuid.uuid4().hex[:8]
    email_a = f"rls-test-a-{tag}@test.local"
    email_b = f"rls-test-b-{tag}@test.local"
    pwd = f"Test!Pass_{tag}"

    uid_a = _create_user(email_a, pwd)
    uid_b = _create_user(email_b, pwd)

    jwt_a = _sign_in(email_a, pwd)
    jwt_b = _sign_in(email_b, pwd)

    yield {
        "a": {"id": uid_a, "jwt": jwt_a, "email": email_a},
        "b": {"id": uid_b, "jwt": jwt_b, "email": email_b},
    }

    _delete_user(uid_a)
    _delete_user(uid_b)


# ── Profiles ───────────────────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestProfilesRLS:
    def test_user_a_creates_profile(self, users):
        r = httpx.post(
            f"{REST}/profiles",
            headers=_user_headers(users["a"]["jwt"]),
            json={"id": users["a"]["id"], "full_name": "User A"},
        )
        assert r.status_code == 201

    def test_user_b_creates_profile(self, users):
        r = httpx.post(
            f"{REST}/profiles",
            headers=_user_headers(users["b"]["jwt"]),
            json={"id": users["b"]["id"], "full_name": "User B"},
        )
        assert r.status_code == 201

    def test_user_b_cannot_read_a_profile(self, users):
        r = httpx.get(
            f"{REST}/profiles?id=eq.{users['a']['id']}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_update_a_profile(self, users):
        r = httpx.patch(
            f"{REST}/profiles?id=eq.{users['a']['id']}",
            headers=_user_headers(users["b"]["jwt"]),
            json={"full_name": "Hacked"},
        )
        assert r.status_code == 200
        assert r.json() == []

        r2 = httpx.get(
            f"{REST}/profiles?id=eq.{users['a']['id']}",
            headers=_user_headers(users["a"]["jwt"]),
        )
        assert r2.json()[0]["full_name"] == "User A"

    def test_user_b_cannot_delete_a_profile(self, users):
        r = httpx.delete(
            f"{REST}/profiles?id=eq.{users['a']['id']}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

        r2 = httpx.get(
            f"{REST}/profiles?id=eq.{users['a']['id']}",
            headers=_user_headers(users["a"]["jwt"]),
        )
        assert len(r2.json()) == 1

    def test_user_b_cannot_insert_profile_as_a(self, users):
        fake_id = users["a"]["id"]
        r = httpx.post(
            f"{REST}/profiles",
            headers=_user_headers(users["b"]["jwt"]),
            json={"id": fake_id, "full_name": "Impersonator"},
        )
        assert r.status_code in (403, 409)


# ── Jobs ───────────────────────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestJobsRLS:
    @pytest.fixture(autouse=True)
    def _setup(self, users):
        self.job_a_id = str(uuid.uuid4())
        r = httpx.post(
            f"{REST}/jobs",
            headers=_user_headers(users["a"]["jwt"]),
            json={
                "id": self.job_a_id,
                "user_id": users["a"]["id"],
                "company": "TestCorp A",
                "title": "Engineer",
            },
        )
        assert r.status_code == 201
        yield
        httpx.delete(
            f"{REST}/jobs?id=eq.{self.job_a_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )

    def test_user_b_cannot_read_a_jobs(self, users):
        r = httpx.get(
            f"{REST}/jobs?id=eq.{self.job_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_update_a_jobs(self, users):
        r = httpx.patch(
            f"{REST}/jobs?id=eq.{self.job_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
            json={"company": "Hacked"},
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_delete_a_jobs(self, users):
        r = httpx.delete(
            f"{REST}/jobs?id=eq.{self.job_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

        r2 = httpx.get(
            f"{REST}/jobs?id=eq.{self.job_a_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )
        assert len(r2.json()) == 1

    def test_user_b_cannot_insert_job_as_a(self, users):
        r = httpx.post(
            f"{REST}/jobs",
            headers=_user_headers(users["b"]["jwt"]),
            json={
                "user_id": users["a"]["id"],
                "company": "Impersonator Corp",
                "title": "Fake",
            },
        )
        assert r.status_code in (403, 409)


# ── Resumes ────────────────────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestResumesRLS:
    @pytest.fixture(autouse=True)
    def _setup(self, users):
        self.resume_a_id = str(uuid.uuid4())
        r = httpx.post(
            f"{REST}/resumes",
            headers=_user_headers(users["a"]["jwt"]),
            json={
                "id": self.resume_a_id,
                "user_id": users["a"]["id"],
                "title": "A's Resume",
            },
        )
        assert r.status_code == 201
        yield
        httpx.delete(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )

    def test_user_b_cannot_read_a_resumes(self, users):
        r = httpx.get(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_update_a_resumes(self, users):
        r = httpx.patch(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
            json={"title": "Hacked Resume"},
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_delete_a_resumes(self, users):
        r = httpx.delete(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

        r2 = httpx.get(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )
        assert len(r2.json()) == 1

    def test_user_b_cannot_insert_resume_as_a(self, users):
        r = httpx.post(
            f"{REST}/resumes",
            headers=_user_headers(users["b"]["jwt"]),
            json={
                "user_id": users["a"]["id"],
                "title": "Impersonator Resume",
            },
        )
        assert r.status_code in (403, 409)


# ── Resume Versions ───────────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestResumeVersionsRLS:
    @pytest.fixture(autouse=True)
    def _setup(self, users):
        self.resume_a_id = str(uuid.uuid4())
        r = httpx.post(
            f"{REST}/resumes",
            headers=_user_headers(users["a"]["jwt"]),
            json={
                "id": self.resume_a_id,
                "user_id": users["a"]["id"],
                "title": "Versioned Resume",
            },
        )
        assert r.status_code == 201

        self.version_id = str(uuid.uuid4())
        r2 = httpx.post(
            f"{REST}/resume_versions",
            headers=_user_headers(users["a"]["jwt"]),
            json={
                "id": self.version_id,
                "resume_id": self.resume_a_id,
                "version_number": 1,
                "resume_data": {"test": "data"},
            },
        )
        assert r2.status_code == 201
        yield
        httpx.delete(
            f"{REST}/resumes?id=eq.{self.resume_a_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )

    def test_user_b_cannot_read_a_versions(self, users):
        r = httpx.get(
            f"{REST}/resume_versions?id=eq.{self.version_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_user_b_cannot_delete_a_versions(self, users):
        r = httpx.delete(
            f"{REST}/resume_versions?id=eq.{self.version_id}",
            headers=_user_headers(users["b"]["jwt"]),
        )
        assert r.status_code == 200
        assert r.json() == []

        r2 = httpx.get(
            f"{REST}/resume_versions?id=eq.{self.version_id}",
            headers=_user_headers(users["a"]["jwt"]),
        )
        assert len(r2.json()) == 1

    def test_user_b_cannot_insert_version_to_a_resume(self, users):
        r = httpx.post(
            f"{REST}/resume_versions",
            headers=_user_headers(users["b"]["jwt"]),
            json={
                "resume_id": self.resume_a_id,
                "version_number": 99,
                "resume_data": {"hacked": True},
            },
        )
        assert r.status_code in (403, 409)


# ── Shared Scores ────────────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestSharedScoresRLS:
    def test_unauthenticated_cannot_insert(self, users):
        headers = {
            "apikey": ANON_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        r = httpx.post(
            f"{REST}/shared_scores",
            headers=headers,
            json={
                "id": f"anon-{uuid.uuid4().hex[:8]}",
                "user_id": users["a"]["id"],
                "overall_score": 85.5,
                "grade": "B",
                "grade_label": "Good",
                "total_matched": 10,
                "total_missing": 5,
                "total_job_keywords": 15,
                "expires_at": "2099-12-31T00:00:00Z",
            },
        )
        assert r.status_code in (401, 403)

    def test_user_b_cannot_insert_score_as_a(self, users):
        r = httpx.post(
            f"{REST}/shared_scores",
            headers=_user_headers(users["b"]["jwt"]),
            json={
                "id": f"impersonate-{uuid.uuid4().hex[:8]}",
                "user_id": users["a"]["id"],
                "overall_score": 99.0,
                "grade": "A",
                "grade_label": "Excellent",
                "total_matched": 20,
                "total_missing": 0,
                "total_job_keywords": 20,
                "expires_at": "2099-12-31T00:00:00Z",
            },
        )
        assert r.status_code in (403, 409)


# ── Delete Cascade (4.6) ─────────────────────────────────────────────


@pytest.mark.skipif(_MISSING, reason=skip_reason)
class TestDeleteCascade:
    """Verify delete_own_user() cascades through all owned data."""

    def test_cascade_deletes_all_owned_data(self):
        tag = uuid.uuid4().hex[:8]
        email = f"rls-cascade-{tag}@test.local"
        pwd = f"Cascade!Pass_{tag}"

        uid = _create_user(email, pwd)
        jwt = _sign_in(email, pwd)
        h = _user_headers(jwt)

        httpx.post(f"{REST}/profiles", headers=h, json={
            "id": uid, "full_name": "Cascade User",
        })
        httpx.post(f"{REST}/jobs", headers=h, json={
            "user_id": uid, "company": "C", "title": "T",
        })

        resume_id = str(uuid.uuid4())
        httpx.post(f"{REST}/resumes", headers=h, json={
            "id": resume_id, "user_id": uid, "title": "R",
        })
        httpx.post(f"{REST}/resume_versions", headers=h, json={
            "resume_id": resume_id, "version_number": 1,
            "resume_data": {"x": 1},
        })

        r = httpx.post(
            f"{REST}/rpc/delete_own_user",
            headers=h,
            json={},
        )
        assert r.status_code in (200, 204)

        admin_h = _admin_headers()
        admin_h["Prefer"] = "return=representation"
        for table in ["profiles", "jobs", "resumes", "resume_versions"]:
            key = "id" if table == "profiles" else "user_id"
            filter_val = uid if table != "resume_versions" else resume_id
            filter_key = "resume_id" if table == "resume_versions" else key
            r = httpx.get(
                f"{REST}/{table}?{filter_key}=eq.{filter_val}",
                headers=admin_h,
            )
            assert r.json() == [], f"{table} still has rows after cascade delete"
