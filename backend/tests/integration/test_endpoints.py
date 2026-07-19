"""Security Pass 2: Integration tests — hit actual API endpoints via httpx TestClient."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def transport():
    return ASGITransport(app=app)


@pytest.fixture
async def client(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


VALID_PERSONAL = {"full_name": "Test User", "email": "test@example.com"}
VALID_JOB_TEXT = (
    "Software Engineer\n\nRequirements:\n- Python\n- React\n- 3+ years experience\n"
    "- Bachelor's degree in Computer Science\nSkills: communication, teamwork\n"
    "Experience:\n- Built REST APIs\n- Deployed to AWS"
)
VALID_RESUME = {
    "personal_info": VALID_PERSONAL,
    "summary": "Experienced software engineer",
    "work_experience": [{
        "job_title": "Developer", "company": "Acme",
        "start_date": "Jan 2020", "end_date": "Present",
        "bullet_points": ["Built REST APIs with Python FastAPI"],
    }],
    "education": [{"degree": "BS Computer Science", "institution": "MIT"}],
    "skills": ["python", "react"],
}


class TestHealthEndpoints:
    @pytest.mark.anyio
    async def test_root(self, client):
        r = await client.get("/")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"

    @pytest.mark.anyio
    async def test_health(self, client):
        r = await client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


class TestAnalyzeEndpoint:
    @pytest.mark.anyio
    async def test_valid_payload(self, client):
        r = await client.post("/api/v1/analyze", json={"raw_text": VALID_JOB_TEXT})
        assert r.status_code == 200
        data = r.json()
        assert "hard_skills" in data
        assert "python" in data["hard_skills"]

    @pytest.mark.anyio
    async def test_empty_raw_text_rejected(self, client):
        r = await client.post("/api/v1/analyze", json={"raw_text": "   "})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_missing_body(self, client):
        r = await client.post("/api/v1/analyze", content=b"{}")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_oversized_raw_text(self, client):
        r = await client.post("/api/v1/analyze", json={"raw_text": "x" * 50_001})
        assert r.status_code == 422


class TestScoreEndpoint:
    @pytest.mark.anyio
    async def test_valid_payload(self, client):
        r = await client.post("/api/v1/score", json={
            "job": {"raw_text": VALID_JOB_TEXT},
            "resume": VALID_RESUME,
        })
        assert r.status_code == 200
        data = r.json()
        assert "overall_score" in data
        assert 0 <= data["overall_score"] <= 100

    @pytest.mark.anyio
    async def test_empty_job_text(self, client):
        r = await client.post("/api/v1/score", json={
            "job": {"raw_text": "   "},
            "resume": VALID_RESUME,
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_missing_resume(self, client):
        r = await client.post("/api/v1/score", json={"job": {"raw_text": "test"}})
        assert r.status_code == 422


class TestGapEndpoint:
    @pytest.mark.anyio
    async def test_valid_payload(self, client):
        r = await client.post("/api/v1/gap", json={
            "job_text": VALID_JOB_TEXT,
            "resume_text": "Python developer with 5 years experience building REST APIs with React",
        })
        assert r.status_code == 200
        assert "overall_score" in r.json()

    @pytest.mark.anyio
    async def test_empty_job_text(self, client):
        r = await client.post("/api/v1/gap", json={"job_text": "  ", "resume_text": "valid"})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_empty_resume_text(self, client):
        r = await client.post("/api/v1/gap", json={"job_text": "valid", "resume_text": "  "})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_oversized_fields(self, client):
        r = await client.post("/api/v1/gap", json={
            "job_text": "x" * 50_001, "resume_text": "valid",
        })
        assert r.status_code == 422


class TestComplianceEndpoint:
    @pytest.mark.anyio
    async def test_valid_payload(self, client):
        resume = (
            "John Doe\njohn@example.com\n555-123-4567\nlinkedin.com/in/johndoe\n\n"
            "Professional Summary\nExperienced developer.\n\n"
            "Work Experience\nSoftware Engineer, Acme Corp\nJan 2020 - Present\n"
            "- Developed REST APIs serving 10,000 users\n"
            "- Led team of 5 engineers\n\n"
            "Education\nBS Computer Science, MIT, May 2019\n\n"
            "Skills\nPython, React, AWS, Docker"
        )
        r = await client.post("/api/v1/compliance", json={"resume_text": resume})
        assert r.status_code == 200
        data = r.json()
        assert data["total_checks"] == 15
        assert 0 <= data["overall_score"] <= 100

    @pytest.mark.anyio
    async def test_empty_text(self, client):
        r = await client.post("/api/v1/compliance", json={"resume_text": "  "})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_minimal_text_returns_low_score(self, client):
        r = await client.post("/api/v1/compliance", json={"resume_text": "hello"})
        assert r.status_code == 200
        assert r.json()["overall_score"] < 50


class TestExportEndpoint:
    @pytest.mark.anyio
    async def test_valid_pdf_export(self, client):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "John Doe", "email": "john@test.com"},
            "summary": "Experienced developer",
            "experience": [{
                "company": "Acme", "title": "Dev",
                "start_date": "2020", "end_date": "2024",
                "bullets": ["Built APIs", "Led team"],
            }],
            "education": [{"institution": "MIT", "degree": "BS", "year": "2019"}],
            "skills": "Python, React, AWS",
        })
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
        assert len(r.content) > 100

    @pytest.mark.anyio
    async def test_empty_name_rejected(self, client):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "   ", "email": "t@t.com"},
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_empty_email_rejected(self, client):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "Test", "email": "   "},
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_invalid_template_rejected(self, client):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "Test", "email": "t@t.com"},
            "template": "evil",
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_content_disposition_header(self, client):
        r = await client.post("/api/v1/export/pdf", json={
            "personal": {"full_name": "Jane Smith", "email": "j@t.com"},
            "filename": "my_resume",
        })
        assert r.status_code == 200
        assert "my_resume.pdf" in r.headers.get("content-disposition", "")


class TestAIEndpointValidation:
    """Test schema validation for AI endpoints (no HF API key needed)."""

    @pytest.mark.anyio
    async def test_summary_missing_required_fields(self, client):
        r = await client.post("/api/v1/summary", json={"job_title": "Dev"})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_summary_empty_title(self, client):
        r = await client.post("/api/v1/summary", json={
            "job_title": "   ", "job_description": "desc",
            "experience_bullets": "bullets",
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_rewrite_missing_bullets(self, client):
        r = await client.post("/api/v1/rewrite", json={
            "job_title": "Dev", "missing_keywords": "python",
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_cover_letter_invalid_tone(self, client):
        r = await client.post("/api/v1/cover-letter", json={
            "job_title": "Dev", "company_name": "Co",
            "job_description": "desc", "experience_summary": "exp",
            "tone": "evil",
        })
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_cover_letter_missing_company(self, client):
        r = await client.post("/api/v1/cover-letter", json={
            "job_title": "Dev", "job_description": "desc",
            "experience_summary": "exp",
        })
        assert r.status_code == 422


class TestSecurityHeaders:
    @pytest.mark.anyio
    async def test_x_content_type_options(self, client):
        r = await client.get("/health")
        assert r.headers.get("x-content-type-options") == "nosniff"

    @pytest.mark.anyio
    async def test_x_frame_options(self, client):
        r = await client.get("/health")
        assert r.headers.get("x-frame-options") == "DENY"

    @pytest.mark.anyio
    async def test_referrer_policy(self, client):
        r = await client.get("/health")
        assert r.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


class TestMalformedRequests:
    @pytest.mark.anyio
    async def test_invalid_json_body(self, client):
        r = await client.post(
            "/api/v1/analyze",
            content=b"not json",
            headers={"content-type": "application/json"},
        )
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_wrong_content_type(self, client):
        r = await client.post(
            "/api/v1/analyze",
            content=b"raw_text=test",
            headers={"content-type": "text/plain"},
        )
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_get_on_post_endpoint(self, client):
        r = await client.get("/api/v1/analyze")
        assert r.status_code == 405

    @pytest.mark.anyio
    async def test_nonexistent_route(self, client):
        r = await client.get("/api/v1/nonexistent")
        assert r.status_code in (404, 405)
