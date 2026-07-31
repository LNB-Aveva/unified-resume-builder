"""Property-based tests using Hypothesis for core scoring, NLP, auth, rate-limit, and PDF logic."""

import time

import jwt
from hypothesis import HealthCheck, assume, given, settings
from hypothesis import strategies as st

from app.core.rate_limit import SlidingWindowRateLimiter
from app.schemas.export import Education as ExportEdu, PersonalInfo as ExportPI, ResumeExportRequest, WorkExperience as ExportWE
from app.schemas.job import JobAnalysis, JobDescription
from app.schemas.resume import PersonalInfo, ResumeData, WorkExperience
from app.services.compliance.checker import check_resume
from app.services.export.pdf_generator import _s, generate_pdf
from app.services.nlp.keyword_extractor import extract_keywords
from app.services.scoring.ats_scorer import _compute_grade, _skill_present, score_from_text, score_resume

word = st.from_regex(r"[A-Za-z]{3,15}", fullmatch=True)

skill_text = st.from_regex(r"[A-Za-z][A-Za-z0-9 .#+-]{1,25}", fullmatch=True)

resume_text = st.text(
    alphabet=st.characters(whitelist_categories=("L", "N", "Zs", "P")),
    min_size=10,
    max_size=5000,
)

job_text = st.lists(word, min_size=10, max_size=100).map(lambda ws: " ".join(ws))


class TestScoreProperties:

    @given(score=st.integers(min_value=0, max_value=100))
    def test_grade_always_returns_valid_grade(self, score):
        grade, _ = _compute_grade(score)
        assert grade in ("A", "B", "C", "D", "F")

    @given(score=st.integers(min_value=0, max_value=100))
    def test_grade_monotonic(self, score):
        grade_order = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
        grade, _ = _compute_grade(score)
        if score >= 85:
            assert grade_order[grade] == 4
        elif score >= 65:
            assert grade_order[grade] == 3
        elif score >= 50:
            assert grade_order[grade] == 2
        elif score >= 30:
            assert grade_order[grade] == 1
        else:
            assert grade_order[grade] == 0

    @given(skills=st.lists(skill_text, min_size=1, max_size=10))
    @settings(suppress_health_check=[HealthCheck.filter_too_much])
    def test_score_bounded_0_100(self, skills):
        job = JobAnalysis(
            job_title="Engineer",
            hard_skills=skills,
            soft_skills=[],
            keywords=skills,
            responsibilities=[],
        )
        resume = ResumeData(
            personal_info=PersonalInfo(full_name="Test", email="t@t.com"),
            work_experience=[
                WorkExperience(job_title="Dev", company="Co", start_date="2020", bullet_points=[])
            ],
            skills=skills[:3],
            education=[],
        )
        result = score_resume(job, resume)
        assert 0 <= result.overall_score <= 100

    @given(skill=skill_text, text=resume_text)
    def test_skill_present_returns_bool(self, skill, text):
        result = _skill_present(skill, text)
        assert isinstance(result, bool)

    @given(skill=skill_text)
    def test_skill_present_in_own_text(self, skill):
        assume(len(skill.strip()) >= 2)
        assert _skill_present(skill, f"I am proficient in {skill} and more")

    @given(skills=st.lists(st.from_regex(r"[A-Za-z]{4,12}", fullmatch=True), min_size=1, max_size=5))
    @settings(max_examples=30, suppress_health_check=[HealthCheck.filter_too_much])
    def test_all_skills_matched_score_nonnegative(self, skills):
        text = " ".join(skills) + " experienced professional with " + " and ".join(skills)
        job = JobAnalysis(
            job_title="Role",
            hard_skills=skills,
            soft_skills=[],
            keywords=skills,
            responsibilities=[],
        )
        result = score_from_text(job, text)
        assert result.overall_score >= 0

    @given(raw=job_text)
    @settings(max_examples=20, deadline=1000)
    def test_extract_keywords_never_crashes(self, raw):
        job = JobDescription(raw_text=raw)
        result = extract_keywords(job)
        assert result.job_title is not None
        assert isinstance(result.hard_skills, list)
        assert isinstance(result.soft_skills, list)
        assert isinstance(result.keywords, list)


class TestComplianceProperties:

    @given(text=resume_text)
    @settings(max_examples=30)
    def test_compliance_never_crashes(self, text):
        assume(len(text.strip()) >= 10)
        result = check_resume(text)
        assert 0 <= result.overall_score <= 100
        assert result.total_checks > 0
        assert result.passed_count + result.critical_issues + result.warnings + result.suggestions_failed == result.total_checks

    @given(text=st.just(""))
    def test_empty_string_handled(self, text):
        result = check_resume(text)
        assert result.total_checks > 0


TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests-only-must-be-32-bytes-minimum"

jwt_sub = st.from_regex(r"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", fullmatch=True)

latin1_safe_text = st.text(
    alphabet=st.characters(whitelist_categories=("L", "N", "Zs"), max_codepoint=0xFF),
    min_size=1,
    max_size=200,
)


class TestAuthProperties:

    @given(sub=jwt_sub)
    @settings(max_examples=20)
    def test_valid_token_roundtrips(self, sub):
        payload = {
            "sub": sub,
            "aud": "authenticated",
            "role": "authenticated",
            "iat": time.time(),
            "exp": time.time() + 3600,
        }
        token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
        decoded = jwt.decode(token, TEST_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        assert decoded["sub"] == sub

    @given(secret=st.binary(min_size=1, max_size=64))
    @settings(max_examples=20)
    def test_wrong_secret_always_fails(self, secret):
        assume(secret != TEST_JWT_SECRET.encode())
        payload = {
            "sub": "user-1",
            "aud": "authenticated",
            "exp": time.time() + 3600,
        }
        token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
        try:
            jwt.decode(token, secret.decode("latin-1", errors="replace"), algorithms=["HS256"], audience="authenticated")
            assert False, "Should have raised"
        except (jwt.InvalidSignatureError, jwt.DecodeError):
            pass


class TestRateLimitProperties:

    @given(max_req=st.integers(min_value=1, max_value=100))
    @settings(max_examples=20)
    def test_exactly_max_requests_allowed(self, max_req):
        limiter = SlidingWindowRateLimiter(max_requests=max_req, window_seconds=60.0)
        allowed = 0
        for _ in range(max_req + 10):
            ok, _ = limiter.check("ip")
            if ok:
                allowed += 1
        assert allowed == max_req

    @given(n_ips=st.integers(min_value=1, max_value=20))
    @settings(max_examples=10)
    def test_independent_ip_buckets(self, n_ips):
        limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60.0)
        for i in range(n_ips):
            for _ in range(3):
                ok, _ = limiter.check(f"ip-{i}")
                assert ok
            ok, _ = limiter.check(f"ip-{i}")
            assert not ok


class TestPdfProperties:

    @given(text=st.text(min_size=0, max_size=500))
    @settings(max_examples=30)
    def test_sanitize_never_crashes(self, text):
        result = _s(text)
        assert isinstance(result, str)
        result.encode("latin-1")

    @given(name=latin1_safe_text, email=st.emails())
    @settings(max_examples=10, deadline=5000)
    def test_pdf_generation_never_crashes(self, name, email):
        assume(len(name.strip()) >= 1)
        req = ResumeExportRequest(
            personal=ExportPI(full_name=name, email=email),
            template="classic",
        )
        pdf_bytes = generate_pdf(req)
        assert pdf_bytes[:5] == b"%PDF-"
