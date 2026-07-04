import pytest

from app.services.compliance.checker import check_resume


GOOD_RESUME = """Jane Developer
jane@email.com | 555-123-4567
linkedin.com/in/janedev

Professional Summary
Experienced software engineer with 5 years building scalable web applications.

Work Experience
Senior Developer, TechCorp
Jan 2020 - Present
- Developed REST APIs serving 10,000+ requests per day
- Built CI/CD pipelines reducing deployment time by 40%
- Led migration from monolith to microservices architecture

Education
Bachelor's in Computer Science, State University, 2018

Skills
Python, JavaScript, Docker, Kubernetes, AWS, React
"""


class TestOverallStructure:
    def test_returns_15_checks(self):
        report = check_resume(GOOD_RESUME)
        assert report.total_checks == 15

    def test_good_resume_high_score(self):
        report = check_resume(GOOD_RESUME)
        assert report.overall_score >= 90
        assert report.critical_issues == 0

    def test_empty_resume_low_score(self):
        report = check_resume("Hello world")
        assert report.overall_score < 50
        assert report.critical_issues > 0


class TestCriticalChecks:
    def test_email_detected(self):
        report = check_resume(GOOD_RESUME)
        email_check = next(c for c in report.checks if "Email" in c.rule)
        assert email_check.passed

    def test_email_missing(self):
        text = GOOD_RESUME.replace("jane@email.com", "jane at email dot com")
        report = check_resume(text)
        email_check = next(c for c in report.checks if "Email" in c.rule)
        assert not email_check.passed
        assert email_check.severity == "critical"

    def test_phone_detected(self):
        report = check_resume(GOOD_RESUME)
        phone_check = next(c for c in report.checks if "Phone" in c.rule)
        assert phone_check.passed

    def test_phone_missing(self):
        text = GOOD_RESUME.replace("555-123-4567", "")
        report = check_resume(text)
        phone_check = next(c for c in report.checks if "Phone" in c.rule)
        assert not phone_check.passed

    def test_date_range_not_counted_as_phone(self):
        text = "jane@test.com\n2020-2023\nWork Experience\nEducation\nBS CS"
        report = check_resume(text)
        phone_check = next(c for c in report.checks if "Phone" in c.rule)
        assert not phone_check.passed

    def test_experience_section(self):
        report = check_resume(GOOD_RESUME)
        exp_check = next(c for c in report.checks if "Experience section" in c.rule)
        assert exp_check.passed

    def test_education_section(self):
        report = check_resume(GOOD_RESUME)
        edu_check = next(c for c in report.checks if "Education section" in c.rule)
        assert edu_check.passed


class TestWarnings:
    def test_pronouns_detected(self):
        text = GOOD_RESUME + "\nI managed a team of 5 developers"
        report = check_resume(text)
        pron_check = next(c for c in report.checks if "pronoun" in c.rule.lower())
        assert not pron_check.passed

    def test_no_pronouns(self):
        report = check_resume(GOOD_RESUME)
        pron_check = next(c for c in report.checks if "pronoun" in c.rule.lower())
        assert pron_check.passed

    def test_too_short(self):
        text = "jane@t.com 555-1234567\nWork Experience\nEducation\nSkills\n- Built APIs"
        report = check_resume(text)
        length_check = next(c for c in report.checks if "length" in c.rule.lower())
        assert not length_check.passed

    def test_fancy_bullets_detected(self):
        text = GOOD_RESUME.replace("- Developed", "► Developed")
        report = check_resume(text)
        bullet_check = next(c for c in report.checks if "bullet char" in c.rule.lower())
        assert not bullet_check.passed

    def test_action_verbs_found(self):
        report = check_resume(GOOD_RESUME)
        verb_check = next(c for c in report.checks if "action verb" in c.rule.lower())
        assert verb_check.passed

    def test_dates_found(self):
        report = check_resume(GOOD_RESUME)
        date_check = next(c for c in report.checks if "Date format" in c.rule)
        assert date_check.passed


class TestSuggestions:
    def test_linkedin_detected(self):
        report = check_resume(GOOD_RESUME)
        li_check = next(c for c in report.checks if "LinkedIn" in c.rule)
        assert li_check.passed

    def test_references_line_flagged(self):
        text = GOOD_RESUME + "\nReferences available upon request"
        report = check_resume(text)
        ref_check = next(c for c in report.checks if "References" in c.rule)
        assert not ref_check.passed

    def test_buzzwords_flagged(self):
        text = GOOD_RESUME + "\nI am a team player and hard worker"
        report = check_resume(text)
        bw_check = next(c for c in report.checks if "buzzword" in c.rule.lower())
        assert not bw_check.passed

    def test_quantified_achievements(self):
        report = check_resume(GOOD_RESUME)
        quant_check = next(c for c in report.checks if "Quantified" in c.rule)
        assert quant_check.passed


class TestSeverityWeighting:
    def test_critical_failure_hurts_more(self):
        full = check_resume(GOOD_RESUME)
        no_email = check_resume(GOOD_RESUME.replace("jane@email.com", "removed"))
        assert full.overall_score > no_email.overall_score
        diff = full.overall_score - no_email.overall_score
        assert diff >= 5
