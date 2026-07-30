"""Standalone async load runner for all nine API routes.

Run from ``backend/`` with ``python tests/load/load_test.py --dry-run`` first.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import statistics
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.schemas.compliance import ComplianceRequest
from app.schemas.cover_letter import CoverLetterRequest
from app.schemas.export import ResumeExportRequest
from app.schemas.gap import GapRequest
from app.schemas.job import JobDescription
from app.schemas.preview import BulletPreviewRequest
from app.schemas.rewriter import BulletRewriteRequest
from app.schemas.score import ScoreRequest
from app.schemas.summary import SummaryRequest

VALID_JOB_TEXT = (
    "Software Engineer\nRequirements: Python, React, AWS, communication, and "
    "3+ years of experience. Build REST APIs and deploy cloud services."
)
VALID_RESUME_TEXT = (
    "Alex Morgan\nalex@example.com\nSoftware Engineer\n"
    "Built REST APIs with Python and React. Deployed services to AWS.\n"
    "Skills: Python, React, AWS, communication"
)
VALID_RESUME = {
    "personal_info": {"full_name": "Alex Morgan", "email": "alex@example.com"},
    "summary": "Software engineer experienced in cloud API development.",
    "work_experience": [
        {
            "job_title": "Software Engineer",
            "company": "Example Corp",
            "start_date": "2021",
            "end_date": "Present",
            "bullet_points": ["Built REST APIs with Python and React"],
        }
    ],
    "education": [{"degree": "BS Computer Science", "institution": "State University"}],
    "skills": ["Python", "React", "AWS"],
}


@dataclass(frozen=True)
class RouteCase:
    name: str
    path: str
    payload: dict[str, Any]
    schema: type
    concurrency: int
    authenticated: bool


ROUTES = (
    RouteCase("analyze", "/api/v1/analyze", {"raw_text": VALID_JOB_TEXT}, JobDescription, 20, False),
    RouteCase(
        "preview-rewrite",
        "/api/v1/preview-rewrite",
        {"bullet": "Built internal reporting tools for the operations team."},
        BulletPreviewRequest,
        20,
        False,
    ),
    RouteCase(
        "score",
        "/api/v1/score",
        {"job": {"raw_text": VALID_JOB_TEXT}, "resume": VALID_RESUME},
        ScoreRequest,
        3,
        True,
    ),
    RouteCase(
        "gap",
        "/api/v1/gap",
        {"job_text": VALID_JOB_TEXT, "resume_text": VALID_RESUME_TEXT},
        GapRequest,
        3,
        True,
    ),
    RouteCase(
        "compliance",
        "/api/v1/compliance",
        {"resume_text": VALID_RESUME_TEXT},
        ComplianceRequest,
        3,
        True,
    ),
    RouteCase(
        "rewrite",
        "/api/v1/rewrite",
        {
            "job_title": "Software Engineer",
            "missing_keywords": "Docker, CI/CD",
            "bullets": "Built REST APIs with Python\nDeployed services to AWS",
        },
        BulletRewriteRequest,
        2,
        True,
    ),
    RouteCase(
        "summary",
        "/api/v1/summary",
        {
            "job_title": "Software Engineer",
            "job_description": VALID_JOB_TEXT,
            "experience_bullets": "Built Python APIs and deployed services to AWS.",
            "years_experience": 4,
            "skills": "Python, React, AWS",
        },
        SummaryRequest,
        2,
        True,
    ),
    RouteCase(
        "cover-letter",
        "/api/v1/cover-letter",
        {
            "job_title": "Software Engineer",
            "company_name": "Example Corp",
            "job_description": VALID_JOB_TEXT,
            "experience_summary": "Four years building Python APIs and cloud services.",
            "skills": "Python, React, AWS",
            "tone": "formal",
        },
        CoverLetterRequest,
        2,
        True,
    ),
    RouteCase(
        "export",
        "/api/v1/export/pdf",
        {
            "personal": {"full_name": "Alex Morgan", "email": "alex@example.com"},
            "summary": "Software engineer experienced in cloud API development.",
            "experience": [
                {
                    "company": "Example Corp",
                    "title": "Software Engineer",
                    "start_date": "2021",
                    "end_date": "Present",
                    "bullets": ["Built REST APIs with Python"],
                }
            ],
            "skills": "Python, React, AWS",
            "education": [
                {"institution": "State University", "degree": "BS", "year": "2021"}
            ],
            "filename": "load-test-resume",
            "template": "classic",
        },
        ResumeExportRequest,
        2,
        True,
    ),
)


@dataclass
class RequestResult:
    latency: float
    status_code: int | None = None
    timed_out: bool = False
    error: str | None = None


def validate_payloads() -> None:
    for route in ROUTES:
        route.schema.model_validate(route.payload)


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    position = (len(ordered) - 1) * percentile
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = position - lower
    return ordered[lower] + (ordered[upper] - ordered[lower]) * fraction


async def _send_request(
    client: httpx.AsyncClient,
    route: RouteCase,
    semaphore: asyncio.Semaphore,
    headers: dict[str, str],
) -> RequestResult:
    async with semaphore:
        started = time.perf_counter()
        try:
            response = await client.post(route.path, json=route.payload, headers=headers)
            return RequestResult(time.perf_counter() - started, status_code=response.status_code)
        except httpx.TimeoutException as exc:
            return RequestResult(time.perf_counter() - started, timed_out=True, error=str(exc))
        except httpx.HTTPError as exc:
            return RequestResult(time.perf_counter() - started, error=str(exc))


async def run_route(
    client: httpx.AsyncClient,
    route: RouteCase,
    request_count: int,
    token: str | None,
) -> dict[str, float | int | str]:
    if route.authenticated and not token:
        raise ValueError(f"{route.name} requires --token or LOAD_TEST_AUTH_TOKEN")

    headers = {"Authorization": f"Bearer {token}"} if route.authenticated else {}
    semaphore = asyncio.Semaphore(route.concurrency)
    started = time.perf_counter()
    results = await asyncio.gather(
        *[_send_request(client, route, semaphore, headers) for _ in range(request_count)]
    )
    elapsed = time.perf_counter() - started
    latencies_ms = [result.latency * 1000 for result in results]
    timeouts = sum(result.timed_out for result in results)
    errors = sum(
        result.error is not None
        or result.status_code is None
        or not 200 <= result.status_code < 300
        for result in results
    )
    return {
        "route": route.name,
        "requests": request_count,
        "concurrency": route.concurrency,
        "requests_per_second": request_count / elapsed if elapsed else 0.0,
        "p50_ms": _percentile(latencies_ms, 0.50),
        "p95_ms": _percentile(latencies_ms, 0.95),
        "p99_ms": _percentile(latencies_ms, 0.99),
        "mean_ms": statistics.fmean(latencies_ms) if latencies_ms else 0.0,
        "error_rate": errors / request_count if request_count else 0.0,
        "timeout_rate": timeouts / request_count if request_count else 0.0,
    }


def _print_report(report: dict[str, float | int | str]) -> None:
    print(
        f"{report['route']:<16} n={report['requests']:<3} c={report['concurrency']:<2} "
        f"rps={report['requests_per_second']:.2f} "
        f"p50={report['p50_ms']:.1f}ms p95={report['p95_ms']:.1f}ms "
        f"p99={report['p99_ms']:.1f}ms errors={report['error_rate']:.1%} "
        f"timeouts={report['timeout_rate']:.1%}"
    )


async def run(args: argparse.Namespace) -> None:
    validate_payloads()
    if args.dry_run:
        print(f"Validated {len(ROUTES)} route payloads; no requests sent.")
        return

    token = args.token or os.environ.get("LOAD_TEST_AUTH_TOKEN")
    timeout = httpx.Timeout(args.timeout)
    async with httpx.AsyncClient(base_url=args.base_url.rstrip("/"), timeout=timeout) as client:
        for route in ROUTES:
            request_count = args.deterministic_requests if route.concurrency == 20 else args.ai_requests
            report = await run_route(client, route, request_count, token)
            _print_report(report)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--token", help="Supabase access token for the seven protected routes")
    parser.add_argument("--timeout", type=float, default=65.0, help="Per-request timeout in seconds")
    parser.add_argument("--deterministic-requests", type=int, default=20)
    parser.add_argument("--ai-requests", type=int, default=5)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(run(parse_args()))
