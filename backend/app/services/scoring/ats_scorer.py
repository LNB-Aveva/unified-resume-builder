"""
ats_scorer.py — Compares a resume against a job's extracted keywords.

HOW ATS SYSTEMS WORK IN THE REAL WORLD:
  Real ATS systems (Workday, Greenhouse, Lever) parse submitted resumes into
  plain text, then scan for keyword frequency matches. They don't understand
  context — they just count: "does 'Python' appear? does 'Docker' appear?"

  Our scorer replicates this mechanical matching, which is why optimizing
  for ATS keywords actually works as a job-search strategy.

SCORING FORMULA (and WHY these weights):
  overall = hard_skills_score * 0.70 + soft_skills_score * 0.30

  Hard skills (70%) — because ATS filters are almost always on technical skills.
  Hiring managers filter "must have Python" before "must be a good communicator."
  Soft skills (30%) — still matter for human review and final scoring stages.

WHAT "MATCH" MEANS HERE:
  A skill matches if it appears in either:
    a) The resume's explicit skills list ("Python", "React"...)
    b) The text of any work experience bullet point
    c) The text of the resume summary
  This mirrors how a real ATS parses the whole document, not just one section.
"""

import re

from app.schemas.resume import ResumeData
from app.schemas.job import JobAnalysis
from app.schemas.score import ATSScore


# Grade thresholds — mirroring how ATS pre-screening filters actually work.
# Below 60% = most ATS systems auto-reject before a human sees the resume.
_GRADE_MAP = [
    (90, "A", "Excellent match"),
    (80, "B", "Strong match"),
    (70, "C", "Good match"),
    (60, "D", "Needs improvement"),
    (0,  "F", "Poor match — likely filtered by ATS"),
]


def _build_resume_text(resume: ResumeData) -> str:
    """
    Flatten the entire resume into one lowercase string for keyword scanning.

    WHY FLATTEN EVERYTHING?
    A real ATS doesn't know "this is the Skills section" vs "this is Experience".
    It scans the full document. We replicate that by merging all text fields.
    """
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
    """
    Check if a skill appears in the resume text with word-boundary matching.

    WHY THE SAME BOUNDARY LOGIC AS THE EXTRACTOR?
    Consistency. "SQL" shouldn't match inside "NoSQL" in the job extractor,
    and it shouldn't match there in the scorer either. Same rule, same function.
    """
    pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
    return bool(re.search(pattern, resume_text_lower))


def _compute_grade(score: float) -> tuple[str, str]:
    """Return (letter_grade, label) for a given 0-100 score."""
    for threshold, letter, label in _GRADE_MAP:
        if score >= threshold:
            return letter, label
    return "F", "Poor match — likely filtered by ATS"


def score_resume(job_analysis: JobAnalysis, resume: ResumeData) -> ATSScore:
    """
    Core scoring function: returns an ATSScore comparing resume against job keywords.

    Steps:
      1. Flatten the resume into one searchable text blob
      2. For each job keyword, check if it's present in the resume
      3. Split results into matched / missing lists
      4. Apply weighted formula → overall score
      5. Assign letter grade
    """
    resume_text = _build_resume_text(resume)

    # Classify hard skills
    matched_hard = [s for s in job_analysis.hard_skills if _skill_present(s, resume_text)]
    missing_hard = [s for s in job_analysis.hard_skills if not _skill_present(s, resume_text)]

    # Classify soft skills
    matched_soft = [s for s in job_analysis.soft_skills if _skill_present(s, resume_text)]
    missing_soft = [s for s in job_analysis.soft_skills if not _skill_present(s, resume_text)]

    hard_score = (len(matched_hard) / len(job_analysis.hard_skills) * 100
                  if job_analysis.hard_skills else 0.0)
    soft_score = (len(matched_soft) / len(job_analysis.soft_skills) * 100
                  if job_analysis.soft_skills else 0.0)

    overall_score = round(hard_score * 0.70 + soft_score * 0.30, 1)
    hard_score = round(hard_score, 1)
    soft_score = round(soft_score, 1)

    grade, grade_label = _compute_grade(overall_score)

    matched_keywords = sorted(set(matched_hard + matched_soft))
    missing_keywords = sorted(set(missing_hard + missing_soft))

    return ATSScore(
        overall_score=overall_score,
        grade=grade,
        grade_label=grade_label,
        hard_skills_score=hard_score,
        soft_skills_score=soft_score,
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


def score_from_text(job_analysis: JobAnalysis, resume_text: str) -> ATSScore:
    """
    Like score_resume() but accepts raw resume text instead of a ResumeData object.

    WHY THIS VARIANT EXISTS:
    score_resume() requires structured data (work_experience, education objects).
    For the quick-demo "paste your resume" use case, users don't have their resume
    in structured JSON. This function skips the structuring step and scans raw text
    directly — same word-boundary matching logic, just no data conversion.

    Both functions produce identical ATSScore output. The difference is only in
    how the resume input is provided.
    """
    text_lower = resume_text.lower()

    matched_hard = [s for s in job_analysis.hard_skills if _skill_present(s, text_lower)]
    missing_hard = [s for s in job_analysis.hard_skills if not _skill_present(s, text_lower)]
    matched_soft = [s for s in job_analysis.soft_skills if _skill_present(s, text_lower)]
    missing_soft = [s for s in job_analysis.soft_skills if not _skill_present(s, text_lower)]

    hard_score = (len(matched_hard) / len(job_analysis.hard_skills) * 100
                  if job_analysis.hard_skills else 0.0)
    soft_score = (len(matched_soft) / len(job_analysis.soft_skills) * 100
                  if job_analysis.soft_skills else 0.0)

    overall_score = round(hard_score * 0.70 + soft_score * 0.30, 1)
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
