"""Tests for JWT authentication on protected API routes."""

import time
import uuid

import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests-only-must-be-32-bytes-minimum"


def _make_token(
    sub: str | None = None,
    exp: float | None = None,
    aud: str = "authenticated",
    secret: str = TEST_JWT_SECRET,
) -> str:
    payload: dict = {
        "aud": aud,
        "role": "authenticated",
        "iat": time.time(),
        "exp": exp or time.time() + 3600,
    }
    if sub is not None:
        payload["sub"] = sub
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def transport():
    return ASGITransport(app=app)


@pytest.fixture
async def client(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def valid_token() -> str:
    return _make_token(sub=str(uuid.uuid4()))


@pytest.fixture
def auth_headers(valid_token) -> dict:
    return {"Authorization": f"Bearer {valid_token}"}


PROTECTED_ROUTES = [
    ("/api/v1/score", {"job": {"raw_text": "Python developer needed"}, "resume": {
        "personal_info": {"full_name": "Test", "email": "t@t.com"},
        "summary": "Dev", "work_experience": [], "education": [], "skills": ["python"],
    }}),
    ("/api/v1/gap", {"job_text": "Python developer", "resume_text": "Python expert"}),
    ("/api/v1/compliance", {"resume_text": "John Doe\njohn@test.com\nSummary\nSkills"}),
    ("/api/v1/rewrite", {"job_title": "Dev", "bullets": "Built APIs", "missing_keywords": "python"}),
    ("/api/v1/summary", {"job_title": "Dev", "job_description": "Python", "experience_bullets": "Built APIs"}),
    ("/api/v1/cover-letter", {"job_title": "Dev", "company_name": "Acme", "job_description": "Python", "experience_summary": "Built APIs"}),
    ("/api/v1/export/pdf", {"personal": {"full_name": "Test User", "email": "t@t.com"}}),
]

PUBLIC_ROUTES = [
    ("/api/v1/analyze", {"raw_text": "Python developer with React experience"}),
    ("/api/v1/preview-rewrite", {"bullet": "Built APIs for internal tools"}),
]


class TestProtectedRoutesReject401:
    @pytest.mark.anyio
    @pytest.mark.parametrize("path,body", PROTECTED_ROUTES, ids=[p for p, _ in PROTECTED_ROUTES])
    async def test_no_token_returns_401(self, client, path, body):
        r = await client.post(path, json=body)
        assert r.status_code == 401

    @pytest.mark.anyio
    @pytest.mark.parametrize("path,body", PROTECTED_ROUTES, ids=[p for p, _ in PROTECTED_ROUTES])
    async def test_invalid_token_returns_401(self, client, path, body):
        r = await client.post(
            path, json=body,
            headers={"Authorization": "Bearer this-is-not-a-jwt"},
        )
        assert r.status_code == 401

    @pytest.mark.anyio
    @pytest.mark.parametrize("path,body", PROTECTED_ROUTES, ids=[p for p, _ in PROTECTED_ROUTES])
    async def test_expired_token_returns_401(self, client, path, body):
        expired = _make_token(sub=str(uuid.uuid4()), exp=time.time() - 60)
        r = await client.post(
            path, json=body,
            headers={"Authorization": f"Bearer {expired}"},
        )
        assert r.status_code == 401

    @pytest.mark.anyio
    @pytest.mark.parametrize("path,body", PROTECTED_ROUTES, ids=[p for p, _ in PROTECTED_ROUTES])
    async def test_wrong_secret_returns_401(self, client, path, body):
        wrong_secret_token = _make_token(sub=str(uuid.uuid4()), secret="wrong-secret")
        r = await client.post(
            path, json=body,
            headers={"Authorization": f"Bearer {wrong_secret_token}"},
        )
        assert r.status_code == 401

    @pytest.mark.anyio
    async def test_missing_sub_claim_returns_401(self, client):
        token = _make_token(sub=None)
        r = await client.post(
            "/api/v1/compliance",
            json={"resume_text": "Test resume"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 401

    @pytest.mark.anyio
    async def test_wrong_audience_returns_401(self, client):
        token = _make_token(sub=str(uuid.uuid4()), aud="wrong-audience")
        r = await client.post(
            "/api/v1/compliance",
            json={"resume_text": "Test resume"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 401


class TestProtectedRoutesAcceptValidToken:
    @pytest.mark.anyio
    async def test_score_with_valid_token(self, client, auth_headers):
        r = await client.post("/api/v1/score", json={
            "job": {"raw_text": "Python developer with React experience"},
            "resume": {
                "personal_info": {"full_name": "Test", "email": "t@t.com"},
                "summary": "Dev", "work_experience": [], "education": [], "skills": ["python"],
            },
        }, headers=auth_headers)
        assert r.status_code == 200

    @pytest.mark.anyio
    async def test_gap_with_valid_token(self, client, auth_headers):
        r = await client.post("/api/v1/gap", json={
            "job_text": "Python developer", "resume_text": "Python expert",
        }, headers=auth_headers)
        assert r.status_code == 200

    @pytest.mark.anyio
    async def test_compliance_with_valid_token(self, client, auth_headers):
        r = await client.post("/api/v1/compliance", json={
            "resume_text": "John Doe\njohn@test.com\nSummary\nSkills: Python",
        }, headers=auth_headers)
        assert r.status_code == 200

    @pytest.mark.anyio
    async def test_export_with_valid_token(self, client, auth_headers):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "Test User", "email": "t@t.com"},
        }, headers=auth_headers)
        assert r.status_code == 200


class TestPublicRoutesNoAuth:
    @pytest.mark.anyio
    @pytest.mark.parametrize("path,body", PUBLIC_ROUTES, ids=[p for p, _ in PUBLIC_ROUTES])
    async def test_public_route_works_without_token(self, client, path, body):
        r = await client.post(path, json=body)
        assert r.status_code != 401

    @pytest.mark.anyio
    async def test_health_no_auth(self, client):
        r = await client.get("/health")
        assert r.status_code == 200

    @pytest.mark.anyio
    async def test_root_no_auth(self, client):
        r = await client.get("/")
        assert r.status_code == 200
