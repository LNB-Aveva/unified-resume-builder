"""Smoke tests for the standalone load-test runner."""

import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).parent))

from load_test import ROUTES, run_route, validate_payloads  # noqa: E402


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


def test_all_sample_payloads_validate() -> None:
    validate_payloads()


@pytest.mark.anyio
async def test_five_requests_per_route() -> None:
    request_counts: dict[str, int] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        request_counts[request.url.path] = request_counts.get(request.url.path, 0) + 1
        return httpx.Response(200, json={"ok": True})

    async with httpx.AsyncClient(
        transport=httpx.MockTransport(handler),
        base_url="http://load-smoke.test",
    ) as client:
        reports = [await run_route(client, route, 5, "test-token") for route in ROUTES]

    assert len(reports) == 9
    assert sum(request_counts.values()) == 45
    assert set(request_counts) == {route.path for route in ROUTES}
    assert all(count == 5 for count in request_counts.values())
    assert all(report["error_rate"] == 0 for report in reports)
