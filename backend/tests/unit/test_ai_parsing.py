"""Golden-file tests for HuggingFace response parsing in summary, cover letter, and preview."""

import re

from app.services.ai.cover_letter import _clean_output as clean_cover_letter
from app.services.ai.summarizer import _clean_output as clean_summary


class TestSummaryCleanOutput:
    def test_strips_surrounding_quotes(self):
        raw = '"Experienced software engineer with 8+ years in distributed systems."'
        assert clean_summary(raw) == "Experienced software engineer with 8+ years in distributed systems."

    def test_strips_single_quotes(self):
        raw = "'Results-driven project manager specializing in agile methodologies.'"
        assert clean_summary(raw) == "Results-driven project manager specializing in agile methodologies."

    def test_collapses_multiple_newlines(self):
        raw = "First sentence about experience.\n\n\nSecond sentence about skills."
        result = clean_summary(raw)
        assert "\n\n" not in result
        assert "First sentence" in result
        assert "Second sentence" in result

    def test_strips_whitespace(self):
        raw = "   \n  A detail-oriented data analyst with 5 years of experience.  \n  "
        assert clean_summary(raw) == "A detail-oriented data analyst with 5 years of experience."

    def test_empty_string(self):
        assert clean_summary("") == ""

    def test_only_quotes(self):
        assert clean_summary('""') == ""

    def test_preserves_normal_text(self):
        raw = "Senior backend engineer with expertise in Python, FastAPI, and cloud infrastructure."
        assert clean_summary(raw) == raw


class TestCoverLetterCleanOutput:
    def test_strips_code_fences(self):
        raw = "```\nDear Hiring Team,\n\nI am writing...\n```"
        result = clean_cover_letter(raw)
        assert result.startswith("Dear Hiring Team,")
        assert "```" not in result

    def test_strips_markdown_language_fence(self):
        raw = "```markdown\nDear Hiring Team,\n\nParagraph here.\n```"
        result = clean_cover_letter(raw)
        assert "```" not in result
        assert "markdown" not in result

    def test_strips_preamble_here_is(self):
        raw = "Here is your cover letter:\n\nDear Hiring Team,\n\nI noticed..."
        result = clean_cover_letter(raw)
        assert result.startswith("Dear Hiring Team,")

    def test_strips_preamble_below_is(self):
        raw = "Below is the tailored cover letter:\n\nDear Hiring Team,\n\nGreat company..."
        result = clean_cover_letter(raw)
        assert result.startswith("Dear Hiring Team,")

    def test_strips_preamble_this_is(self):
        raw = "This is the cover letter you requested:\n\nHello! I'm excited..."
        result = clean_cover_letter(raw)
        assert result.startswith("Hello!")

    def test_preserves_clean_letter(self):
        raw = "Dear Hiring Team,\n\nFirst paragraph.\n\nSecond paragraph.\n\nYours sincerely,"
        assert clean_cover_letter(raw) == raw

    def test_empty_string(self):
        assert clean_cover_letter("") == ""

    def test_whitespace_only(self):
        assert clean_cover_letter("   \n\n  ") == ""

    def test_combined_fence_and_preamble(self):
        raw = "```\nHere is the letter:\n\nDear Team,\n\nContent here.\n```"
        result = clean_cover_letter(raw)
        assert "```" not in result
        assert "Here is" not in result
        assert "Dear Team," in result


class TestPreviewParsing:
    def test_standard_format_parsed(self):
        raw = (
            "ORIGINAL: Responsible for managing sales team\n"
            "REWRITTEN: Led a 12-person sales team exceeding quarterly targets by 25%\n"
            "IMPROVEMENT: Added metrics and action verb"
        )
        orig_m = re.search(r"ORIGINAL:\s*(.+)", raw, re.IGNORECASE)
        rew_m = re.search(r"REWRITTEN:\s*(.+)", raw, re.IGNORECASE)
        imp_m = re.search(r"IMPROVEMENT:\s*(.+)", raw, re.IGNORECASE)

        assert orig_m and orig_m.group(1).strip() == "Responsible for managing sales team"
        assert rew_m and rew_m.group(1).strip() == "Led a 12-person sales team exceeding quarterly targets by 25%"
        assert imp_m and imp_m.group(1).strip() == "Added metrics and action verb"

    def test_missing_improvement_field(self):
        raw = (
            "ORIGINAL: Helped with customer issues\n"
            "REWRITTEN: Resolved 50+ customer support tickets weekly"
        )
        imp_m = re.search(r"IMPROVEMENT:\s*(.+)", raw, re.IGNORECASE)
        assert imp_m is None

    def test_missing_all_fields_returns_defaults(self):
        raw = "Just a plain sentence with no labels."
        orig_m = re.search(r"ORIGINAL:\s*(.+)", raw, re.IGNORECASE)
        rew_m = re.search(r"REWRITTEN:\s*(.+)", raw, re.IGNORECASE)
        assert orig_m is None
        assert rew_m is None
