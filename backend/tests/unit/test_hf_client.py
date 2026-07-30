"""Retry and HTTP error-mapping tests for the Hugging Face client."""

from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException

from app.api.routes._ai_errors import call_ai_service
from app.services.ai import hf_client


@pytest.mark.anyio
@pytest.mark.parametrize("error_type", [httpx.ConnectError, httpx.ReadTimeout])
async def test_call_hf_retries_transport_failures_twice(monkeypatch, error_type) -> None:
    request = httpx.Request("POST", hf_client.API_URL)
    failures = [error_type("provider unavailable", request=request) for _ in range(2)]
    success = httpx.Response(
        200,
        request=request,
        json={"choices": [{"message": {"content": "generated text"}}]},
    )
    post = AsyncMock(side_effect=[*failures, success])
    client = type("Client", (), {"post": post})()
    sleep = AsyncMock()

    monkeypatch.setattr(hf_client, "_get_api_key", lambda: "test-key")
    monkeypatch.setattr(hf_client, "_get_client", lambda: client)
    monkeypatch.setattr(hf_client.asyncio, "sleep", sleep)

    result = await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert result == "generated text"
    assert post.await_count == 3
    assert [call.args[0] for call in sleep.await_args_list] == [1.0, 2.0]


async def _raise(error: Exception) -> None:
    raise error


@pytest.mark.anyio
async def test_connect_error_maps_to_503() -> None:
    request = httpx.Request("POST", hf_client.API_URL)

    with pytest.raises(HTTPException) as exc_info:
        await call_ai_service(_raise(httpx.ConnectError("offline", request=request)))

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "AI service is temporarily unreachable. Please try again shortly."


@pytest.mark.anyio
async def test_provider_5xx_maps_to_502() -> None:
    request = httpx.Request("POST", hf_client.API_URL)
    response = httpx.Response(503, request=request, text="provider outage")
    error = httpx.HTTPStatusError("service unavailable", request=request, response=response)

    with pytest.raises(HTTPException) as exc_info:
        await call_ai_service(_raise(error))

    assert exc_info.value.status_code == 502
    assert exc_info.value.detail == "AI service temporarily unavailable."


@pytest.mark.anyio
async def test_provider_timeout_maps_to_504() -> None:
    request = httpx.Request("POST", hf_client.API_URL)

    with pytest.raises(HTTPException) as exc_info:
        await call_ai_service(_raise(httpx.ReadTimeout("timed out", request=request)))

    assert exc_info.value.status_code == 504
