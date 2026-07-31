"""Contract tests: API responses conform to OpenAPI schema definitions."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

OPENAPI = app.openapi()
SCHEMAS = OPENAPI.get("components", {}).get("schemas", {})


def _resolve_ref(ref_or_schema: dict) -> dict:
    if "$ref" in ref_or_schema:
        name = ref_or_schema["$ref"].split("/")[-1]
        return SCHEMAS[name]
    return ref_or_schema


def _validate_field(value, schema: dict, path: str = "") -> list[str]:
    """Lightweight schema validator — checks types and required fields."""
    schema = _resolve_ref(schema)
    errors: list[str] = []

    schema_type = schema.get("type")

    if schema_type == "object":
        if not isinstance(value, dict):
            return [f"{path}: expected object, got {type(value).__name__}"]
        for req_field in schema.get("required", []):
            if req_field not in value:
                errors.append(f"{path}.{req_field}: required field missing")
        props = schema.get("properties", {})
        for key, val in value.items():
            if key in props:
                errors.extend(_validate_field(val, props[key], f"{path}.{key}"))
    elif schema_type == "array":
        if not isinstance(value, list):
            return [f"{path}: expected array, got {type(value).__name__}"]
        items_schema = schema.get("items", {})
        for i, item in enumerate(value):
            errors.extend(_validate_field(item, items_schema, f"{path}[{i}]"))
    elif schema_type == "string":
        if not isinstance(value, str):
            errors.append(f"{path}: expected string, got {type(value).__name__}")
    elif schema_type == "number" or schema_type == "integer":
        if not isinstance(value, (int, float)):
            errors.append(f"{path}: expected number, got {type(value).__name__}")
    elif schema_type == "boolean":
        if not isinstance(value, bool):
            errors.append(f"{path}: expected boolean, got {type(value).__name__}")

    return errors


def _find_response_schema(path: str, method: str = "post") -> dict | None:
    path_spec = OPENAPI.get("paths", {}).get(path, {})
    op = path_spec.get(method, {})
    resp_200 = op.get("responses", {}).get("200", {})
    content = resp_200.get("content", {}).get("application/json", {})
    return content.get("schema")


ANALYZE_PAYLOAD = {
    "raw_text": "We are looking for a Senior Python Developer with experience in FastAPI, Docker, and AWS. Must have leadership skills.",
}

SCORE_PAYLOAD = {
    "job": {
        "job_title": "Python Developer",
        "hard_skills": ["python", "fastapi"],
        "soft_skills": ["leadership"],
        "keywords": ["python", "fastapi", "leadership"],
        "responsibilities": [],
    },
    "resume": {
        "personal_info": {"full_name": "Test User", "email": "test@test.com"},
        "work_experience": [
            {"job_title": "Dev", "company": "Co", "start_date": "2020", "bullet_points": ["Built APIs"]}
        ],
        "skills": ["python", "fastapi", "leadership"],
        "education": [],
    },
}

COMPLIANCE_PAYLOAD = {
    "resume_text": "John Doe\njohn@email.com\n555-1234\nSenior Software Engineer\n\nProfessional summary here.\n\nExperience:\n- Built scalable APIs\n- Led team of 5 engineers\n\nSkills: Python, Docker, AWS\n\nEducation:\nBS Computer Science, Stanford University",
}


@pytest.mark.anyio
async def test_analyze_response_matches_schema():
    schema = _find_response_schema("/api/v1/analyze")
    if schema is None:
        pytest.skip("No response schema found for /api/v1/analyze")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/analyze", json=ANALYZE_PAYLOAD)

    assert resp.status_code == 200
    errors = _validate_field(resp.json(), schema, "/api/v1/analyze")
    assert errors == [], f"Schema violations: {errors}"


@pytest.mark.anyio
async def test_score_response_matches_schema():
    schema = _find_response_schema("/api/v1/score")
    if schema is None:
        pytest.skip("No response schema found for /api/v1/score")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/score", json=SCORE_PAYLOAD,
                                 headers={"Authorization": "Bearer test"})

    if resp.status_code == 401:
        pytest.skip("Auth required — cannot validate schema without valid token")

    assert resp.status_code == 200
    errors = _validate_field(resp.json(), schema, "/api/v1/score")
    assert errors == [], f"Schema violations: {errors}"


@pytest.mark.anyio
async def test_compliance_response_matches_schema():
    schema = _find_response_schema("/api/v1/compliance")
    if schema is None:
        pytest.skip("No response schema found for /api/v1/compliance")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/compliance", json=COMPLIANCE_PAYLOAD,
                                  headers={"Authorization": "Bearer test"})

    if resp.status_code == 401:
        pytest.skip("Auth required — cannot validate schema without valid token")

    assert resp.status_code == 200
    errors = _validate_field(resp.json(), schema, "/api/v1/compliance")
    assert errors == [], f"Schema violations: {errors}"


@pytest.mark.anyio
async def test_analyze_is_public_no_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/analyze", json=ANALYZE_PAYLOAD)
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_openapi_spec_is_valid():
    assert "paths" in OPENAPI
    assert len(OPENAPI["paths"]) >= 9
    for path, methods in OPENAPI["paths"].items():
        for method in methods:
            assert method in ("get", "post", "put", "patch", "delete", "options", "head"), \
                f"{path} has invalid method {method}"
            op = methods[method]
            assert "responses" in op, f"{path}.{method} missing responses"
