"""ATS keyword scoring: compares resume text against extracted job keywords."""

import re

from app.schemas.job import JobAnalysis
from app.schemas.resume import ResumeData
from app.schemas.score import ATSScore

_GRADE_MAP = [
    (90, "A", "Excellent match"),
    (80, "B", "Strong match"),
    (70, "C", "Good match"),
    (60, "D", "Needs improvement"),
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
    pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
    return bool(re.search(pattern, resume_text_lower, re.IGNORECASE))


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
    )


def score_resume(job_analysis: JobAnalysis, resume: ResumeData) -> ATSScore:
    return _score_skills(job_analysis, _build_resume_text(resume))


def score_from_text(job_analysis: JobAnalysis, resume_text: str) -> ATSScore:
    return _score_skills(job_analysis, resume_text.lower())
