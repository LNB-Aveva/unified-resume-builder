
from app.schemas.job import JobDescription
from app.services.nlp.keyword_extractor import (
    HARD_SKILLS,
    SOFT_SKILLS,
    _extract_education,
    _extract_experience,
    _extract_responsibilities,
    _match_skills,
    extract_keywords,
)

JOB_TEXT = """Senior Software Engineer
TechCorp Inc.

We are looking for an experienced Python developer with strong Docker and
Kubernetes skills. 5+ years of experience in building scalable microservices.

Requirements:
- Build and maintain REST APIs using Python and FastAPI
- Deploy services using Docker and Kubernetes
- Collaborate with cross-functional teams
- Strong communication and leadership skills

Education:
Bachelor's degree in Computer Science or related field

What we offer:
- Competitive salary
- Health insurance
- Remote work flexibility
"""


class TestMatchSkills:
    def test_finds_python(self):
        result = _match_skills("we need python and docker skills", HARD_SKILLS)
        assert "python" in result
        assert "docker" in result

    def test_word_boundary(self):
        result = _match_skills("building pythons is not programming", HARD_SKILLS)
        assert "python" not in result

    def test_nosql_does_not_match_sql(self):
        result = _match_skills("we use nosql databases like mongodb", HARD_SKILLS)
        assert "nosql" in result
        assert "sql" not in result

    def test_soft_skills(self):
        result = _match_skills("strong communication and leadership", SOFT_SKILLS)
        assert "communication" in result
        assert "leadership" in result

    def test_returns_sorted(self):
        result = _match_skills("docker python react", HARD_SKILLS)
        assert result == sorted(result)

    def test_cicd_with_slash(self):
        result = _match_skills("set up ci/cd pipelines", HARD_SKILLS)
        assert "ci/cd" in result

    def test_multiword_skills(self):
        result = _match_skills("applied machine learning to nlp problems", HARD_SKILLS)
        assert "machine learning" in result
        assert "nlp" in result

    def test_synonym_golang_matches_go(self):
        result = _match_skills("experience with golang microservices", HARD_SKILLS)
        assert "go" in result

    def test_synonym_reactjs_matches_react(self):
        result = _match_skills("built frontend with reactjs", HARD_SKILLS)
        assert "react" in result

    def test_synonym_js_matches_javascript(self):
        result = _match_skills("proficient in js and ts", HARD_SKILLS)
        assert "javascript" in result
        assert "typescript" in result

    def test_synonym_k8s_matches_kubernetes(self):
        result = _match_skills("deployed to k8s clusters", HARD_SKILLS)
        assert "kubernetes" in result

    def test_synonym_postgres_matches_postgresql(self):
        result = _match_skills("experience with postgres databases", HARD_SKILLS)
        assert "postgresql" in result

    def test_synonym_cicd_variations(self):
        result = _match_skills("set up continuous integration pipelines", HARD_SKILLS)
        assert "ci/cd" in result

    def test_synonym_does_not_create_duplicates(self):
        result = _match_skills("uses both react and reactjs daily", HARD_SKILLS)
        assert result.count("react") == 1


class TestExtractExperience:
    def test_standard_format(self):
        assert _extract_experience("5+ years of experience") is not None
        assert "5" in _extract_experience("5+ years of experience")

    def test_with_context(self):
        result = _extract_experience("3+ years of professional software development experience")
        assert result is not None
        assert "3" in result

    def test_no_experience(self):
        assert _extract_experience("We are looking for a great engineer") is None

    def test_singular_year(self):
        result = _extract_experience("1 year of experience in Python")
        assert result is not None


class TestExtractEducation:
    def test_bachelors(self):
        result = _extract_education("Bachelor's degree in Computer Science")
        assert result is not None
        assert any("Bachelor" in r for r in result)

    def test_masters(self):
        result = _extract_education("Master's in Data Science required")
        assert result is not None

    def test_phd(self):
        result = _extract_education("PhD in Machine Learning preferred")
        assert result is not None

    def test_no_education(self):
        assert _extract_education("No degree needed") is None


class TestExtractResponsibilities:
    def test_bullet_points(self):
        text = "Requirements:\n- Build APIs\n- Deploy services\n- Write tests"
        result = _extract_responsibilities(text)
        assert len(result) == 3
        assert "Build APIs" in result

    def test_benefits_section_skipped(self):
        text = (
            "Requirements:\n- Build APIs\n- Write code\n"
            "What we offer:\n- Free lunch\n- Health insurance"
        )
        result = _extract_responsibilities(text)
        assert len(result) == 2
        assert not any("lunch" in r.lower() for r in result)

    def test_benefits_word_in_responsibility_is_not_a_section_header(self):
        text = (
            "Responsibilities:\n"
            "- Explain benefits to employees\n"
            "- Maintain enrollment records"
        )
        result = _extract_responsibilities(text)
        assert result == [
            "Explain benefits to employees",
            "Maintain enrollment records",
        ]

    def test_responsibilities_after_benefits_are_included(self):
        text = (
            "Benefits:\n- Health insurance\n"
            "Responsibilities:\n- Build APIs\n- Write tests"
        )
        result = _extract_responsibilities(text)
        assert result == ["Build APIs", "Write tests"]

    def test_short_bullets_ignored(self):
        text = "- OK\n- This is a real requirement"
        result = _extract_responsibilities(text)
        assert len(result) == 1

    def test_various_bullet_chars(self):
        text = "* Build APIs\n- Deploy services"
        result = _extract_responsibilities(text)
        assert len(result) == 2


class TestExtractKeywords:
    def test_full_pipeline(self):
        job = JobDescription(raw_text=JOB_TEXT, company="TechCorp")
        result = extract_keywords(job)
        assert "python" in result.hard_skills
        assert "docker" in result.hard_skills
        assert "kubernetes" in result.hard_skills
        assert "communication" in result.soft_skills
        assert "leadership" in result.soft_skills
        assert result.required_experience is not None
        assert result.company == "TechCorp"

    def test_explicit_title(self):
        job = JobDescription(raw_text=JOB_TEXT, title="Staff Engineer")
        result = extract_keywords(job)
        assert result.job_title == "Staff Engineer"

    def test_inferred_title(self):
        job = JobDescription(raw_text=JOB_TEXT)
        result = extract_keywords(job)
        assert result.job_title == "Senior Software Engineer"

    def test_keywords_is_union(self):
        job = JobDescription(raw_text=JOB_TEXT)
        result = extract_keywords(job)
        for skill in result.hard_skills + result.soft_skills:
            assert skill in result.keywords

    def test_responsibilities_exclude_benefits(self):
        job = JobDescription(raw_text=JOB_TEXT)
        result = extract_keywords(job)
        assert len(result.responsibilities) > 0
        assert not any("salary" in r.lower() for r in result.responsibilities)
        assert not any("insurance" in r.lower() for r in result.responsibilities)

    def test_education_extracted(self):
        job = JobDescription(raw_text=JOB_TEXT)
        result = extract_keywords(job)
        assert result.education_requirements is not None

    def test_empty_job(self):
        job = JobDescription(raw_text="No skills mentioned here at all")
        result = extract_keywords(job)
        assert result.hard_skills == []
        assert result.soft_skills == []
        assert result.keywords == []
