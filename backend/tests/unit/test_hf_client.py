"""Retry and HTTP error-mapping tests for the Hugging Face client."""

from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException

from app.api.routes._ai_errors import call_ai_service
from app.services.ai import hf_client


@pytest.fixture(autouse=True)
def reset_circuit_breaker() -> None:
    hf_client._reset_circuit_breaker()
    yield
    hf_client._reset_circuit_breaker()


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
    monkeypatch.setattr(hf_client.anyio, "sleep", sleep)

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


def _success_response() -> httpx.Response:
    request = httpx.Request("POST", hf_client.API_URL)
    return httpx.Response(
        200,
        request=request,
        json={"choices": [{"message": {"content": "generated text"}}]},
    )


def _server_error_response() -> httpx.Response:
    request = httpx.Request("POST", hf_client.API_URL)
    return httpx.Response(503, request=request, text="provider outage")


@pytest.mark.anyio
async def test_unexpected_provider_response_does_not_leak_content(monkeypatch) -> None:
    request = httpx.Request("POST", hf_client.API_URL)
    private_content = "Jane Doe medical leave and SSN 123-45-6789"
    response = httpx.Response(200, request=request, json={"provider_output": private_content})
    post = AsyncMock(return_value=response)

    monkeypatch.setattr(hf_client, "_get_api_key", lambda: "test-key")
    monkeypatch.setattr(hf_client, "_get_client", lambda: type("Client", (), {"post": post})())
    monkeypatch.setattr(hf_client, "_MAX_RETRIES", 0)

    with pytest.raises(RuntimeError) as exc_info:
        await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert str(exc_info.value) == "Unexpected response shape from AI provider"
    assert private_content not in str(exc_info.value)


def test_model_is_pinned_to_reviewed_provider() -> None:
    assert hf_client.MODEL.endswith(":together")
    assert not hf_client.MODEL.endswith(":fastest")


async def _trip_circuit(monkeypatch, post: AsyncMock) -> None:
    monkeypatch.setattr(hf_client, "_get_api_key", lambda: "test-key")
    monkeypatch.setattr(hf_client, "_get_client", lambda: type("Client", (), {"post": post})())
    monkeypatch.setattr(hf_client, "_MAX_RETRIES", 0)
    for _ in range(5):
        with pytest.raises(httpx.HTTPStatusError):
            await hf_client.call_hf([], max_tokens=10, temperature=0.1)


@pytest.mark.anyio
async def test_circuit_opens_after_five_consecutive_failures(monkeypatch) -> None:
    post = AsyncMock(return_value=_server_error_response())
    await _trip_circuit(monkeypatch, post)

    with pytest.raises(hf_client.CircuitBreakerOpenError):
        await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert post.await_count == 5


@pytest.mark.anyio
async def test_open_circuit_rejects_without_http_call(monkeypatch) -> None:
    post = AsyncMock(return_value=_server_error_response())
    await _trip_circuit(monkeypatch, post)
    post.reset_mock()

    with pytest.raises(hf_client.CircuitBreakerOpenError):
        await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    post.assert_not_awaited()


@pytest.mark.anyio
async def test_circuit_allows_half_open_probe_after_timeout(monkeypatch) -> None:
    now = 1000.0
    monkeypatch.setattr(hf_client.time, "monotonic", lambda: now)
    post = AsyncMock(return_value=_server_error_response())
    await _trip_circuit(monkeypatch, post)
    post.reset_mock()
    now += 60.0

    with pytest.raises(httpx.HTTPStatusError):
        await hf_client.call_hf([], max_tokens=10, temperature=0.1)
    with pytest.raises(hf_client.CircuitBreakerOpenError):
        await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert post.await_count == 1


@pytest.mark.anyio
async def test_successful_half_open_probe_closes_circuit(monkeypatch) -> None:
    now = 1000.0
    monkeypatch.setattr(hf_client.time, "monotonic", lambda: now)
    post = AsyncMock(return_value=_server_error_response())
    await _trip_circuit(monkeypatch, post)
    now += 60.0
    post.side_effect = [_success_response(), _success_response()]

    first = await hf_client.call_hf([], max_tokens=10, temperature=0.1)
    second = await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert first == second == "generated text"
    assert post.await_count == 7


@pytest.mark.anyio
async def test_success_resets_consecutive_failure_counter(monkeypatch) -> None:
    post = AsyncMock(
        side_effect=[
            _server_error_response(),
            _server_error_response(),
            _server_error_response(),
            _server_error_response(),
            _success_response(),
            _server_error_response(),
            _server_error_response(),
            _server_error_response(),
            _server_error_response(),
        ]
    )
    monkeypatch.setattr(hf_client, "_get_api_key", lambda: "test-key")
    monkeypatch.setattr(hf_client, "_get_client", lambda: type("Client", (), {"post": post})())
    monkeypatch.setattr(hf_client, "_MAX_RETRIES", 0)

    for _ in range(4):
        with pytest.raises(httpx.HTTPStatusError):
            await hf_client.call_hf([], max_tokens=10, temperature=0.1)
    assert await hf_client.call_hf([], max_tokens=10, temperature=0.1) == "generated text"
    for _ in range(4):
        with pytest.raises(httpx.HTTPStatusError):
            await hf_client.call_hf([], max_tokens=10, temperature=0.1)

    assert post.await_count == 9


@pytest.mark.anyio
async def test_open_circuit_maps_to_retryable_503() -> None:
    with pytest.raises(HTTPException) as exc_info:
        await call_ai_service(_raise(hf_client.CircuitBreakerOpenError("open")))

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == (
        "AI service is temporarily offline. The system will automatically retry "
        "in about 60 seconds. Please try again shortly."
    )
    assert exc_info.value.headers == {"Retry-After": "60"}
