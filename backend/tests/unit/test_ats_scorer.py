import pytest

from app.schemas.job import JobAnalysis
from app.schemas.resume import Education, PersonalInfo, ResumeData, WorkExperience
from app.services.scoring.ats_scorer import _compute_grade, _skill_present, score_from_text, score_resume


def _job(hard=None, soft=None):
    hard = hard or []
    soft = soft or []
    return JobAnalysis(
        job_title="Engineer",
        hard_skills=hard,
        soft_skills=soft,
        keywords=sorted(set(hard + soft)),
        responsibilities=[],
    )


def _resume(skills=None, bullets=None, summary=None):
    return ResumeData(
        personal_info=PersonalInfo(full_name="Test User", email="t@t.com"),
        summary=summary,
        work_experience=[
            WorkExperience(
                job_title="Dev",
                company="Co",
                start_date="2020",
                bullet_points=bullets or [],
            )
        ],
        education=[Education(degree="BS CS", institution="U")],
        skills=skills or [],
    )


class TestSkillPresent:
    def test_exact_match(self):
        assert _skill_present("python", "uses python for scripting")

    def test_no_match(self):
        assert not _skill_present("python", "uses ruby for scripting")

    def test_word_boundary_prefix(self):
        assert not _skill_present("sql", "uses nosql databases")

    def test_word_boundary_suffix(self):
        assert not _skill_present("go", "uses gopher for services")

    def test_synonym_match(self):
        assert _skill_present("go", "uses golang for services")
        assert _skill_present("javascript", "proficient in js and css")
        assert _skill_present("react", "built apps with reactjs")
        assert _skill_present("kubernetes", "deployed on k8s clusters")
        assert _skill_present("postgresql", "experience with postgres databases")

    def test_case_insensitive_text(self):
        assert _skill_present("python", "built with python and docker")

    def test_special_chars_escaped(self):
        assert _skill_present("c++", "proficient in c++ development")
        assert _skill_present("c#", "experience with c# projects")
        assert _skill_present("ci/cd", "set up ci/cd pipelines")

    def test_multiword_skill(self):
        assert _skill_present("machine learning", "applied machine learning models")


class TestComputeGrade:
    @pytest.mark.parametrize("score,letter", [
        (100, "A"), (85, "A"), (84.9, "B"), (65, "B"),
        (64, "C"), (50, "C"), (49, "D"), (30, "D"),
        (29, "F"), (0, "F"),
    ])
    def test_grade_thresholds(self, score, letter):
        grade, _ = _compute_grade(score)
        assert grade == letter


class TestScoreResume:
    def test_perfect_match(self):
        job = _job(hard=["python", "docker"], soft=["leadership"])
        resume = _resume(skills=["python", "docker", "leadership"])
        result = score_resume(job, resume)
        assert result.overall_score == 100.0
        assert result.grade == "A"
        assert result.total_missing == 0

    def test_no_match(self):
        job = _job(hard=["python", "docker"], soft=["leadership"])
        resume = _resume(skills=["java"])
        result = score_resume(job, resume)
        assert result.overall_score == 0.0
        assert result.grade == "F"
        assert result.total_matched == 0

    def test_weighted_scoring(self):
        job = _job(hard=["python", "docker"], soft=["leadership", "teamwork"])
        resume = _resume(skills=["python", "leadership"])
        result = score_resume(job, resume)
        # hard: 1/2 = 50%, soft: 1/2 = 50%
        # overall = 50*0.70 + 50*0.30 = 35+15 = 50.0
        assert result.overall_score == 50.0
        assert result.matched_hard_skills == ["python"]
        assert result.missing_hard_skills == ["docker"]

    def test_hard_skills_weighted_more_than_soft(self):
        # Asymmetric match rates make the 0.70/0.30 split observable: matching
        # only hard skills must outscore matching only soft skills. A symmetric
        # 50/50 case cannot catch a hard<->soft weight swap; this one can.
        job = _job(hard=["python", "docker"], soft=["leadership", "teamwork"])

        only_hard = score_resume(job, _resume(skills=["python", "docker"]))
        only_soft = score_resume(job, _resume(skills=["leadership", "teamwork"]))

        # hard 100% -> 100*0.70 = 70.0 ; soft 100% -> 100*0.30 = 30.0
        assert only_hard.overall_score == 70.0
        assert only_soft.overall_score == 30.0
        assert only_hard.overall_score > only_soft.overall_score

    def test_only_hard_skills_in_job(self):
        job = _job(hard=["python", "docker"], soft=[])
        resume = _resume(skills=["python"])
        result = score_resume(job, resume)
        assert result.overall_score == 50.0

    def test_only_soft_skills_in_job(self):
        job = _job(hard=[], soft=["leadership", "teamwork"])
        resume = _resume(skills=["leadership"])
        result = score_resume(job, resume)
        assert result.overall_score == 50.0

    def test_no_skills_in_job(self):
        job = _job(hard=[], soft=[])
        result = score_resume(job, _resume())
        assert result.overall_score == 0.0

    def test_skills_found_in_bullets(self):
        job = _job(hard=["python"])
        resume = _resume(bullets=["Built APIs with Python and FastAPI"])
        result = score_resume(job, resume)
        assert "python" in result.matched_hard_skills

    def test_skills_found_in_summary(self):
        job = _job(hard=["docker"])
        resume = _resume(summary="Experienced with Docker and Kubernetes")
        result = score_resume(job, resume)
        assert "docker" in result.matched_hard_skills


class TestScoreFromText:
    def test_matches_raw_text(self):
        job = _job(hard=["python", "docker"], soft=["leadership"])
        text = "I know Python and Docker and have strong leadership skills"
        result = score_from_text(job, text)
        assert result.overall_score == 100.0
        assert result.total_matched == 3

    def test_case_insensitive(self):
        job = _job(hard=["python"])
        result = score_from_text(job, "PYTHON developer")
        assert result.overall_score == 100.0
