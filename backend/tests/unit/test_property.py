"""Property-based tests using Hypothesis for core scoring and NLP logic."""

from hypothesis import HealthCheck, assume, given, settings
from hypothesis import strategies as st

from app.schemas.job import JobAnalysis, JobDescription
from app.schemas.resume import PersonalInfo, ResumeData, WorkExperience
from app.services.compliance.checker import check_resume
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
        if score >= 90:
            assert grade_order[grade] == 4
        elif score >= 80:
            assert grade_order[grade] == 3
        elif score >= 70:
            assert grade_order[grade] == 2
        elif score >= 60:
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
    @settings(max_examples=20)
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
