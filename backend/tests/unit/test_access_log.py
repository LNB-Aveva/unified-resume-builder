"""Structured access-log regression tests."""

import io
import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.responses import JSONResponse

from app import main as main_module


@pytest.fixture
def access_log_client(monkeypatch):
    stream = io.StringIO()
    handler = main_module.logging.StreamHandler(stream)
    handler.setFormatter(main_module._JSONFormatter())
    monkeypatch.setattr(main_module._logger, "handlers", [handler])

    test_app = FastAPI()
    test_app.add_middleware(main_module.AccessLogMiddleware)

    @test_app.get("/items/{item_id}")
    async def item(item_id: str):
        return {"item_id": item_id}

    @test_app.get("/api/v1/{tool}")
    async def tool(tool: str):
        return {"tool": tool}

    @test_app.get("/status/{status_code}")
    async def status(status_code: int):
        return JSONResponse({"status": status_code}, status_code=status_code)

    def latest_log() -> dict:
        return json.loads(stream.getvalue().splitlines()[-1])

    return TestClient(test_app), latest_log


def test_normal_request_logs_route_and_false_classification_flags(access_log_client):
    client, latest_log = access_log_client

    response = client.get("/items/42")
    log = latest_log()

    assert response.status_code == 200
    assert log["route"] == "/items/{item_id}"
    assert log["rate_limited"] is False
    assert log["auth_failed"] is False
    assert log["is_ai_route"] is False
    assert log["content_length"] == int(response.headers["content-length"])


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/score",
        "/api/v1/gap",
        "/api/v1/summary",
        "/api/v1/cover-letter",
        "/api/v1/rewrite",
        "/api/v1/compliance",
    ],
)
def test_known_ai_routes_are_classified(path, access_log_client):
    client, latest_log = access_log_client

    response = client.get(path)

    assert response.status_code == 200
    assert latest_log()["is_ai_route"] is True


@pytest.mark.parametrize(
    ("status_code", "rate_limited", "auth_failed"),
    [(401, False, True), (403, False, True), (429, True, False)],
)
def test_response_status_classification(status_code, rate_limited, auth_failed, access_log_client):
    client, latest_log = access_log_client

    response = client.get(f"/status/{status_code}")
    log = latest_log()

    assert response.status_code == status_code
    assert log["rate_limited"] is rate_limited
    assert log["auth_failed"] is auth_failed
