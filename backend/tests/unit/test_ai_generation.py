"""End-to-end unit tests for the AI generation services.

These mock ONLY ``call_hf`` (the network boundary) and exercise the real
prompt-assembly, response-parsing, and response-model code paths that the
integration suite skips because it never issues a live HuggingFace call.

They exist to kill mutations in rewriter / summarizer / cover_letter that
line-coverage-only integration tests would miss.
"""

from unittest.mock import AsyncMock

import pytest

from app.schemas.cover_letter import CoverLetterRequest
from app.schemas.rewriter import BulletRewriteRequest
from app.schemas.summary import SummaryRequest
from app.services.ai import cover_letter as cover_letter_service
from app.services.ai import rewriter as rewriter_service
from app.services.ai import summarizer as summarizer_service


class TestRewriteBullets:
    @pytest.mark.anyio
    async def test_parses_and_assembles_all_bullets(self, monkeypatch):
        raw = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a cross-functional team of 5 engineers delivering microservices\n"
            "KEYWORDS: leadership, microservices\n"
            "---\n"
            "ORIGINAL: Built APIs for internal tools\n"
            "REWRITTEN: Architected REST APIs powering 3 internal tools on AWS\n"
            "KEYWORDS: AWS\n"
        )
        monkeypatch.setattr(rewriter_service, "call_hf", AsyncMock(return_value=raw))

        req = BulletRewriteRequest(
            job_title="Backend Engineer",
            missing_keywords="AWS, microservices",
            bullets="Managed team of 5 engineers\nBuilt APIs for internal tools",
        )
        resp = await rewriter_service.rewrite_bullets(req)

        assert len(resp.rewrites) == 2
        assert resp.rewrites[0].keywords_woven == ["leadership", "microservices"]
        assert resp.rewrites[1].keywords_woven == ["AWS"]
        assert "REST APIs" in resp.rewrites[1].rewritten
        assert resp.model_used == "Qwen/Qwen2.5-7B-Instruct:together"
        assert resp.tip  # a non-empty coaching tip is always attached

    @pytest.mark.anyio
    async def test_partial_response_triggers_single_bullet_fallback(self, monkeypatch):
        # Batch response only covers the first bullet; the second must be
        # recovered via the per-bullet fallback call.
        batch = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a team of 5 engineers on cloud migration\n"
            "KEYWORDS: cloud\n"
        )
        single = (
            "ORIGINAL: Built APIs for internal tools\n"
            "REWRITTEN: Designed REST APIs for internal tooling on AWS\n"
            "KEYWORDS: AWS\n"
        )
        call = AsyncMock(side_effect=[batch, single])
        monkeypatch.setattr(rewriter_service, "call_hf", call)

        req = BulletRewriteRequest(
            job_title="Backend Engineer",
            missing_keywords="AWS",
            bullets="Managed team of 5 engineers\nBuilt APIs for internal tools",
        )
        resp = await rewriter_service.rewrite_bullets(req)

        assert call.await_count == 2  # one batch + one fallback
        originals = {r.original for r in resp.rewrites}
        assert "Built APIs for internal tools" in originals
        assert len(resp.rewrites) == 2


class TestGenerateSummary:
    @pytest.mark.anyio
    async def test_cleans_output_and_counts_words(self, monkeypatch):
        raw = '"Senior backend engineer with 8+ years building distributed systems."'
        monkeypatch.setattr(summarizer_service, "call_hf", AsyncMock(return_value=raw))

        req = SummaryRequest(
            job_title="Backend Engineer",
            job_description="Python, distributed systems",
            experience_bullets="Built microservices",
            years_experience=8,
        )
        resp = await summarizer_service.generate_summary(req)

        assert not resp.summary.startswith('"')  # surrounding quotes stripped
        assert resp.word_count == len(resp.summary.split())
        assert resp.word_count > 0
        assert resp.model_used == "Qwen/Qwen2.5-7B-Instruct:together"

    @pytest.mark.anyio
    async def test_empty_model_output_raises(self, monkeypatch):
        monkeypatch.setattr(summarizer_service, "call_hf", AsyncMock(return_value="   \n  "))

        req = SummaryRequest(
            job_title="Backend Engineer",
            job_description="Python",
            experience_bullets="Built microservices",
        )
        with pytest.raises(RuntimeError):
            await summarizer_service.generate_summary(req)


class TestGenerateCoverLetter:
    @pytest.mark.anyio
    @pytest.mark.parametrize("tone", ["formal", "conversational"])
    async def test_generates_letter_for_each_tone(self, monkeypatch, tone):
        raw = (
            "Your work on developer tooling is exactly where I want to contribute.\n\n"
            "At Acme I shipped a platform that cut build times by 40%.\n\n"
            "That experience maps directly onto your need for CI/CD and Python depth.\n\n"
            "I would welcome the chance to talk through how I can help."
        )
        monkeypatch.setattr(cover_letter_service, "call_hf", AsyncMock(return_value=raw))

        req = CoverLetterRequest(
            job_title="Platform Engineer",
            company_name="CloudScale",
            job_description="CI/CD, Python, developer tooling",
            experience_summary="Shipped internal platform used by 200 engineers",
            tone=tone,
        )
        resp = await cover_letter_service.generate_cover_letter(req)

        assert resp.cover_letter
        assert resp.word_count == len(resp.cover_letter.split())
        assert resp.tip  # tone-specific tip attached

    @pytest.mark.anyio
    async def test_strips_code_fence_and_preamble(self, monkeypatch):
        raw = "```\nDear Hiring Team,\n\nI am the right hire.\n```"
        monkeypatch.setattr(cover_letter_service, "call_hf", AsyncMock(return_value=raw))

        req = CoverLetterRequest(
            job_title="Engineer",
            company_name="Acme",
            job_description="Python",
            experience_summary="Built things",
        )
        resp = await cover_letter_service.generate_cover_letter(req)

        assert "```" not in resp.cover_letter
        assert resp.cover_letter.startswith("Dear Hiring Team")

    @pytest.mark.anyio
    async def test_strips_leading_preamble(self, monkeypatch):
        raw = "Here is your cover letter:\n\nDear Hiring Team,\n\nI am the right hire."
        monkeypatch.setattr(cover_letter_service, "call_hf", AsyncMock(return_value=raw))

        req = CoverLetterRequest(
            job_title="Engineer",
            company_name="Acme",
            job_description="Python",
            experience_summary="Built things",
        )
        resp = await cover_letter_service.generate_cover_letter(req)

        assert not resp.cover_letter.lower().startswith("here is")
        assert resp.cover_letter.startswith("Dear Hiring Team")

    @pytest.mark.anyio
    async def test_empty_model_output_raises(self, monkeypatch):
        monkeypatch.setattr(cover_letter_service, "call_hf", AsyncMock(return_value="```\n```"))

        req = CoverLetterRequest(
            job_title="Engineer",
            company_name="Acme",
            job_description="Python",
            experience_summary="Built things",
        )
        with pytest.raises(RuntimeError):
            await cover_letter_service.generate_cover_letter(req)
