"""Integration tests for the middleware-level IP rate limit safety net."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.core.rate_limit import SlidingWindowRateLimiter
from app.main import GlobalIPRateLimitMiddleware


def _test_app(max_requests: int = 2) -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        GlobalIPRateLimitMiddleware,
        rate_limiter=SlidingWindowRateLimiter(max_requests=max_requests),
    )

    @app.get("/")
    async def root():
        return {"status": "ok"}

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


def _cloudflare_headers(ip: str) -> dict[str, str]:
    return {"CF-Connecting-IP": ip, "CF-Ray": "test-ray"}


@pytest.mark.anyio
async def test_normal_requests_pass_through():
    transport = ASGITransport(app=_test_app())
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")

    assert response.status_code == 200


@pytest.mark.anyio
async def test_exceeding_limit_returns_429_with_retry_after():
    transport = ASGITransport(app=_test_app())
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.get("/")
        await client.get("/")
        response = await client.get("/")

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) >= 1


@pytest.mark.anyio
async def test_different_ips_have_independent_counters():
    transport = ASGITransport(app=_test_app(max_requests=1))
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        first_ip = _cloudflare_headers("203.0.113.10")
        second_ip = _cloudflare_headers("203.0.113.11")
        assert (await client.get("/", headers=first_ip)).status_code == 200
        assert (await client.get("/", headers=first_ip)).status_code == 429
        response = await client.get("/", headers=second_ip)

    assert response.status_code == 200


@pytest.mark.anyio
async def test_health_is_not_rate_limited():
    transport = ASGITransport(app=_test_app(max_requests=1))
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        responses = [await client.get("/health") for _ in range(5)]

    assert all(response.status_code == 200 for response in responses)
