"""Golden-file tests for HuggingFace response parsing in the rewriter."""

from app.services.ai.rewriter import _parse_rewrites


ORIGINALS_3 = [
    "Managed team of 5 engineers",
    "Built APIs for internal tools",
    "Improved deployment process",
]


class TestParseRewritesPerfectFormat:
    def test_standard_format_with_separators(self):
        raw = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a cross-functional team of 5 engineers delivering microservices\n"
            "KEYWORDS: leadership, microservices\n"
            "---\n"
            "ORIGINAL: Built APIs for internal tools\n"
            "REWRITTEN: Designed and built REST APIs powering 3 internal tools\n"
            "KEYWORDS: REST APIs\n"
            "---\n"
            "ORIGINAL: Improved deployment process\n"
            "REWRITTEN: Optimized CI/CD pipeline reducing deployment time by 40%\n"
            "KEYWORDS: CI/CD\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3
        assert results[0].rewritten == "Led a cross-functional team of 5 engineers delivering microservices"
        assert results[0].keywords_woven == ["leadership", "microservices"]
        assert results[2].keywords_woven == ["CI/CD"]

    def test_keywords_none(self):
        raw = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a team of 5 engineers on critical projects\n"
            "KEYWORDS: NONE\n"
        )
        results = _parse_rewrites(raw, ["Managed team of 5 engineers"])
        assert len(results) == 1
        assert results[0].keywords_woven == []


class TestParseRewritesNoSeparators:
    def test_format_without_dashes(self):
        raw = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a team of 5 engineers\n"
            "KEYWORDS: leadership\n"
            "\n"
            "ORIGINAL: Built APIs for internal tools\n"
            "REWRITTEN: Designed REST APIs for internal tooling\n"
            "KEYWORDS: REST APIs\n"
            "\n"
            "ORIGINAL: Improved deployment process\n"
            "REWRITTEN: Streamlined CI/CD deployment pipeline\n"
            "KEYWORDS: CI/CD\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3
        assert "REST APIs" in results[1].keywords_woven


class TestParseRewritesRawBullets:
    def test_plain_text_fallback(self):
        raw = (
            "- Led a team of 5 engineers on cloud migration\n"
            "- Designed REST APIs for 3 internal tools\n"
            "- Streamlined CI/CD pipeline reducing deploy time\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3
        assert results[0].original == ORIGINALS_3[0]
        assert "Led a team" in results[0].rewritten
        assert results[0].keywords_woven == []

    def test_star_bullets_fallback(self):
        raw = (
            "* Led a team of 5 engineers\n"
            "* Built scalable REST APIs\n"
            "* Optimized deployment pipeline\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3

    def test_no_bullet_markers_fallback(self):
        raw = (
            "Led a team of 5 engineers on cloud migration\n"
            "Designed REST APIs for 3 internal tools\n"
            "Streamlined CI/CD pipeline reducing deploy time\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3


class TestParseRewritesEdgeCases:
    def test_empty_response(self):
        results = _parse_rewrites("", ORIGINALS_3)
        assert len(results) == 0

    def test_whitespace_only_response(self):
        results = _parse_rewrites("   \n\n  ", ORIGINALS_3)
        assert len(results) == 0

    def test_partial_response_triggers_fallback(self):
        raw = (
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a team of 5 engineers\n"
            "KEYWORDS: leadership\n"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) >= 1
        assert results[0].keywords_woven == ["leadership"]

    def test_fewer_lines_than_originals(self):
        raw = "Led a team of 5 engineers on cloud migration"
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3
        assert results[0].rewritten == "Led a team of 5 engineers on cloud migration"
        assert results[1].rewritten == ORIGINALS_3[1]
        assert results[2].rewritten == ORIGINALS_3[2]

    def test_separator_lines_ignored(self):
        raw = "---\n---\n---"
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 0

    def test_mixed_format_with_commentary(self):
        raw = (
            "Here are your rewritten bullets:\n\n"
            "ORIGINAL: Managed team of 5 engineers\n"
            "REWRITTEN: Led a cross-functional team of 5 engineers\n"
            "KEYWORDS: leadership\n"
            "---\n"
            "ORIGINAL: Built APIs for internal tools\n"
            "REWRITTEN: Architected REST APIs for internal tooling\n"
            "KEYWORDS: REST APIs\n"
            "---\n"
            "ORIGINAL: Improved deployment process\n"
            "REWRITTEN: Reduced deployment time 40% through CI/CD automation\n"
            "KEYWORDS: CI/CD\n"
            "\nI hope these help!"
        )
        results = _parse_rewrites(raw, ORIGINALS_3)
        assert len(results) == 3
