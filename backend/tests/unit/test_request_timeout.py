"""Tests for RequestTimeoutMiddleware (Phase 6.1)."""

import anyio
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import RequestTimeoutMiddleware


@pytest.fixture
def timeout_client():
    app = FastAPI()
    app.add_middleware(RequestTimeoutMiddleware)

    @app.get("/fast")
    async def fast():
        return {"ok": True}

    @app.get("/slow")
    async def slow():
        await anyio.sleep(120)
        return {"ok": True}

    return TestClient(app)


def test_fast_request_succeeds(timeout_client) -> None:
    response = timeout_client.get("/fast")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_slow_request_returns_504(timeout_client, monkeypatch) -> None:
    monkeypatch.setattr("app.main._REQUEST_TIMEOUT", 0.1)
    response = timeout_client.get("/slow")
    assert response.status_code == 504
    assert "timed out" in response.json()["detail"].lower()
