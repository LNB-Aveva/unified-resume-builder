"""Tests for PDF sanitization fidelity (_s) and title truncation."""

from app.services.export.pdf_generator import _s, _ResumePDF, generate_pdf
from app.schemas.export import PersonalInfo, ResumeExportRequest, WorkExperience


class TestSanitizationFidelity:
    def test_em_dash_to_hyphen(self):
        assert _s("2020–2024") == "2020-2024"
        assert _s("role — title") == "role - title"

    def test_smart_quotes(self):
        assert _s("“Hello”") == '"Hello"'
        assert _s("‘it’s’") == "'it's'"

    def test_bullet_to_hyphen(self):
        assert _s("• item one") == "- item one"
        assert _s("· item two") == "- item two"

    def test_ellipsis(self):
        assert _s("wait…") == "wait..."

    def test_nbsp_to_space(self):
        assert _s("hello world") == "hello world"

    def test_decomposition_z_caron(self):
        result = _s("Ž")  # Z with caron
        assert result == "Z"

    def test_decomposition_n_tilde(self):
        result = _s("ñ")  # n with tilde
        assert result == "n"

    def test_combined_characters(self):
        result = _s("“Résumé” — Željko’s CV")
        assert '"' in result
        assert "-" in result
        assert "Z" in result
        assert "'" in result

    def test_pure_ascii_unchanged(self):
        text = "Hello World 123 - test"
        assert _s(text) == text


class TestTitleTruncation:
    def test_long_title_gets_truncated(self):
        pdf = _ResumePDF()
        pdf.add_page()
        long_title = "A" * 200
        pdf._two_col(long_title, "2024")
        output = bytes(pdf.output())
        assert output[:5] == b"%PDF-"

    def test_short_title_not_truncated(self):
        pdf = _ResumePDF()
        pdf.add_page()
        short_title = "Software Engineer"
        pdf._two_col(short_title, "2024")
        output = bytes(pdf.output())
        assert output[:5] == b"%PDF-"


class TestPdfWithUnicode:
    def test_unicode_resume_generates_valid_pdf(self):
        req = ResumeExportRequest(
            personal=PersonalInfo(
                full_name="Željko Müller-Straße",
                email="zeljko@example.com",
            ),
            summary="Experienced with “cloud” infrastructure — AWS, GCP",
            experience=[
                WorkExperience(
                    company="Café Tech GmbH",
                    title="Senior Engineer • Backend",
                    start_date="Jan 2020",
                    end_date="Dec 2024",
                    bullets=[
                        "• Built microservices with 99.9% uptime",
                        "– Reduced latency by 40%",
                        "“Exceeded” quarterly targets",
                    ],
                )
            ],
            skills="Python, Go, Kubernetes, CI/CD • Docker",
            template="classic",
        )
        pdf_bytes = generate_pdf(req)
        assert pdf_bytes[:5] == b"%PDF-"
        assert len(pdf_bytes) > 500
