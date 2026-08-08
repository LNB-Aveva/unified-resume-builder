"""Tests for durable AI quota enforcement at the Supabase RPC boundary."""

from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.core import ai_quota


def _request(token: str = "signed-user-token") -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/summary",
            "headers": [(b"authorization", f"Bearer {token}".encode())],
        }
    )


@pytest.fixture
def quota_settings(monkeypatch):
    monkeypatch.setattr(ai_quota.settings, "SUPABASE_URL", "https://project.supabase.co")
    monkeypatch.setattr(ai_quota.settings, "SUPABASE_ANON_KEY", "public-anon-key")
    monkeypatch.setattr(ai_quota.settings, "AI_QUOTA_ENFORCEMENT", True)


@pytest.mark.anyio
async def test_consume_quota_sends_user_token_and_units(quota_settings):
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/rest/v1/rpc/consume_ai_quota"
        assert request.headers["authorization"] == "Bearer signed-user-token"
        assert request.headers["apikey"] == "public-anon-key"
        assert request.content == b'{"p_units":5}'
        return httpx.Response(
            200,
            json=[{
                "allowed": True,
                "user_remaining": 5,
                "global_remaining": 495,
                "retry_after_seconds": 3600,
            }],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await ai_quota.consume_ai_quota("signed-user-token", 5, client)

    assert result.allowed is True
    assert result.user_remaining == 5
    assert result.global_remaining == 495


@pytest.mark.anyio
async def test_quota_denial_returns_429_with_retry_after(monkeypatch, quota_settings):
    monkeypatch.setattr(
        ai_quota,
        "consume_ai_quota",
        AsyncMock(return_value=ai_quota.QuotaResult(False, 0, 400, 7200)),
    )

    with pytest.raises(HTTPException) as exc_info:
        await ai_quota.enforce_ai_quota(_request(), units=1)

    assert exc_info.value.status_code == 429
    assert exc_info.value.headers == {"Retry-After": "7200"}
    assert "00:00 UTC" in exc_info.value.detail


@pytest.mark.anyio
async def test_quota_transport_failure_fails_closed(monkeypatch, quota_settings):
    request = httpx.Request("POST", "https://project.supabase.co/rest/v1/rpc/consume_ai_quota")
    monkeypatch.setattr(
        ai_quota,
        "consume_ai_quota",
        AsyncMock(side_effect=httpx.ConnectError("offline", request=request)),
    )

    with pytest.raises(HTTPException) as exc_info:
        await ai_quota.enforce_ai_quota(_request(), units=1)

    assert exc_info.value.status_code == 503
    assert "usage controls" in exc_info.value.detail


@pytest.mark.anyio
async def test_quota_requires_bearer_token(quota_settings):
    request = Request({"type": "http", "method": "POST", "path": "/", "headers": []})

    with pytest.raises(HTTPException) as exc_info:
        await ai_quota.enforce_ai_quota(request, units=1)

    assert exc_info.value.status_code == 401


@pytest.mark.anyio
async def test_quota_bypasses_network_outside_enforced_environment(monkeypatch):
    monkeypatch.setattr(ai_quota.settings, "AI_QUOTA_ENFORCEMENT", False)
    consume = AsyncMock()
    monkeypatch.setattr(ai_quota, "consume_ai_quota", consume)

    await ai_quota.enforce_ai_quota(_request(), units=1)

    consume.assert_not_awaited()


@pytest.mark.anyio
async def test_invalid_unit_weight_is_rejected(quota_settings):
    with pytest.raises(ValueError, match="between 1 and 5"):
        await ai_quota.consume_ai_quota("token", 6)


@pytest.mark.anyio
async def test_invalid_rpc_json_fails_closed(quota_settings):
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="not-json")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(RuntimeError, match="invalid JSON"):
            await ai_quota.consume_ai_quota("token", 1, client)
