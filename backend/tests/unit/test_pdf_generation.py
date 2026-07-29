"""Stress test: PDF generation with large resumes (up to schema limits)."""

import pytest

from app.schemas.export import Education, PersonalInfo, ResumeExportRequest, WorkExperience
from app.services.export.pdf_generator import generate_pdf


def _large_resume(n_jobs: int = 20, n_bullets: int = 30) -> ResumeExportRequest:
    return ResumeExportRequest(
        personal=PersonalInfo(
            full_name="Alexandra Christophersen-Vanderbilt",
            email="alexandra.cv@longdomainname-example.com",
            phone="+1 (555) 012-3456",
            location="San Francisco, California, United States",
            linkedin="linkedin.com/in/alexandra-christophersen",
            website="https://alexandra-portfolio.dev",
        ),
        summary=(
            "Highly accomplished senior software engineer with 15+ years of experience "
            "designing and implementing distributed systems, leading cross-functional teams, "
            "and delivering high-impact projects across fintech, healthcare, and e-commerce. "
            "Passionate about mentoring, open-source contribution, and continuous improvement."
        ),
        experience=[
            WorkExperience(
                company=f"Company {i + 1} Inc. — A Global Technology Leader",
                title=f"Senior Staff Engineer (L{6 + i % 3})",
                start_date=f"Jan {2010 + i}",
                end_date=f"Dec {2010 + i}",
                bullets=[
                    f"Engineered high-throughput microservice #{b + 1} processing 50K+ requests/sec "
                    f"with 99.99% uptime using Kubernetes, gRPC, and PostgreSQL"
                    for b in range(n_bullets)
                ],
            )
            for i in range(n_jobs)
        ],
        education=[
            Education(
                institution="Stanford University",
                degree="Master of Science",
                field="Computer Science — Distributed Systems",
                year="2010",
            ),
            Education(
                institution="University of California, Berkeley",
                degree="Bachelor of Science",
                field="Electrical Engineering and Computer Sciences",
                year="2008",
            ),
        ],
        skills=(
            "Python, Java, Go, Rust, TypeScript, React, Next.js, FastAPI, Django, "
            "Spring Boot, Kubernetes, Docker, AWS, GCP, Azure, Terraform, PostgreSQL, "
            "Redis, Kafka, RabbitMQ, Elasticsearch, GraphQL, REST, gRPC, CI/CD, "
            "Jenkins, GitHub Actions, Prometheus, Grafana, Datadog, Sentry"
        ),
        template="classic",
    )


@pytest.mark.parametrize("template", ["classic", "modern", "minimal"])
def test_large_resume_generates_valid_pdf(template: str) -> None:
    req = _large_resume()
    req.template = template  # type: ignore[assignment]
    pdf_bytes = generate_pdf(req)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes[:5] == b"%PDF-"
    assert len(pdf_bytes) > 1000


def test_large_resume_pdf_size_under_5mb() -> None:
    req = _large_resume()
    pdf_bytes = generate_pdf(req)
    assert len(pdf_bytes) < 5 * 1024 * 1024


def test_empty_resume_generates_pdf() -> None:
    req = ResumeExportRequest(
        personal=PersonalInfo(full_name="Test User", email="test@test.com"),
    )
    pdf_bytes = generate_pdf(req)
    assert pdf_bytes[:5] == b"%PDF-"
