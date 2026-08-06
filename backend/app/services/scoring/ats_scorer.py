"""ATS keyword scoring: compares resume text against extracted job keywords."""

import re

from app.schemas.job import JobAnalysis
from app.schemas.resume import ResumeData
from app.schemas.score import ATSScore
from app.services.nlp import taxonomy

_GRADE_MAP = [
    (85, "A", "Excellent match"),
    (65, "B", "Good match"),
    (50, "C", "Moderate match"),
    (30, "D", "Needs improvement"),
    (0,  "F", "Poor match -- likely filtered by ATS"),
]


def _build_resume_text(resume: ResumeData) -> str:
    parts = []
    if resume.summary:
        parts.append(resume.summary)
    for exp in resume.work_experience:
        parts.append(exp.job_title)
        parts.extend(exp.bullet_points)
    for edu in resume.education:
        parts.append(edu.degree)
    parts.extend(resume.skills)
    if resume.certifications:
        parts.extend(resume.certifications)
    if resume.projects:
        parts.extend(resume.projects)
    return " ".join(parts).lower()


def _skill_present(skill: str, resume_text_lower: str) -> bool:
    synonym_map = taxonomy.get_synonym_map()
    terms = [skill] + list(synonym_map.get(skill, ()))
    for term in terms:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(term) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, resume_text_lower, re.IGNORECASE):
            return True
    return False


def _compute_grade(score: float) -> tuple[str, str]:
    for threshold, letter, label in _GRADE_MAP:
        if score >= threshold:
            return letter, label
    return "F", "Poor match -- likely filtered by ATS"


def _score_skills(job_analysis: JobAnalysis, resume_text: str) -> ATSScore:
    matched_hard: list[str] = []
    missing_hard: list[str] = []
    for s in job_analysis.hard_skills:
        (matched_hard if _skill_present(s, resume_text) else missing_hard).append(s)

    matched_soft: list[str] = []
    missing_soft: list[str] = []
    for s in job_analysis.soft_skills:
        (matched_soft if _skill_present(s, resume_text) else missing_soft).append(s)

    hard_score = (len(matched_hard) / len(job_analysis.hard_skills) * 100
                  if job_analysis.hard_skills else 0.0)
    soft_score = (len(matched_soft) / len(job_analysis.soft_skills) * 100
                  if job_analysis.soft_skills else 0.0)

    has_hard = bool(job_analysis.hard_skills)
    has_soft = bool(job_analysis.soft_skills)
    if has_hard and has_soft:
        overall_score = round(hard_score * 0.70 + soft_score * 0.30, 1)
    elif has_hard:
        overall_score = round(hard_score, 1)
    elif has_soft:
        overall_score = round(soft_score, 1)
    else:
        overall_score = 0.0

    grade, grade_label = _compute_grade(overall_score)

    matched_keywords = sorted(set(matched_hard + matched_soft))
    missing_keywords = sorted(set(missing_hard + missing_soft))

    domain_warning: str | None = None
    coverage = job_analysis.taxonomy_coverage
    total_kw = len(job_analysis.keywords)
    has_few_hard = len(job_analysis.hard_skills) <= 1
    has_substance = len(job_analysis.responsibilities) >= 5
    if (coverage <= 0.5 and total_kw >= 3) or (has_few_hard and has_substance):
        domain_warning = (
            "This job description contains skills outside our taxonomy "
            "(optimized for tech roles). Scores for non-tech roles like HR, "
            "finance, healthcare, or education may be less accurate."
        )

    return ATSScore(
        overall_score=overall_score,
        grade=grade,
        grade_label=grade_label,
        hard_skills_score=round(hard_score, 1),
        soft_skills_score=round(soft_score, 1),
        matched_hard_skills=matched_hard,
        matched_soft_skills=matched_soft,
        matched_keywords=matched_keywords,
        missing_hard_skills=missing_hard,
        missing_soft_skills=missing_soft,
        missing_keywords=missing_keywords,
        total_job_keywords=len(job_analysis.keywords),
        total_matched=len(matched_keywords),
        total_missing=len(missing_keywords),
        domain_warning=domain_warning,
    )


def score_resume(job_analysis: JobAnalysis, resume: ResumeData) -> ATSScore:
    return _score_skills(job_analysis, _build_resume_text(resume))


def score_from_text(job_analysis: JobAnalysis, resume_text: str) -> ATSScore:
    return _score_skills(job_analysis, resume_text.lower())
