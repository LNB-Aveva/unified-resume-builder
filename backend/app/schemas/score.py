"""
score.py — Data shapes for ATS scoring input and output.

WHY A SEPARATE SCHEMA FILE FOR SCORING?
Each schema file owns one "concept". Mixing scoring models into resume.py
or job.py would make those files hard to read. Separation of concerns:
every concept gets its own home.

HOW SCORING WORKS (the big picture):
  1. User gives us their resume + a job description
  2. We extract keywords from the job (keyword_extractor.py already does this)
  3. We compare: which job keywords appear in the resume? Which are missing?
  4. We compute a 0-100 score weighted by skill importance
  5. We return matched skills, missing skills, and a letter grade

WHY LETTER GRADES?
Raw percentages are hard to judge. Is 62% good? Bad? A letter grade gives
instant context — just like school. Users know "A = apply", "F = not ready".
"""

from pydantic import BaseModel

from app.schemas.job import JobDescription
from app.schemas.resume import ResumeData


class ScoreRequest(BaseModel):
    """
    Input to the scoring endpoint.

    WHY COMBINE JOB + RESUME IN ONE REQUEST?
    The score is a relationship between two documents — it has no meaning
    without both. Combining them into one request body makes the API intent
    crystal clear: "give me both, I'll compare them."
    """
    job: JobDescription
    resume: ResumeData


class ATSScore(BaseModel):
    """
    Output from the ATS scoring engine.

    The fields are organized in layers:
      - Summary: overall_score, grade (what users see first)
      - Breakdown: hard/soft skill sub-scores (explains the summary)
      - Detail: matched/missing lists (actionable — tells users what to fix)
    """
    # Summary
    overall_score: float        # 0.0 – 100.0
    grade: str                  # "A", "B", "C", "D", "F"
    grade_label: str            # "Excellent", "Strong", "Good", "Needs Work", "Poor"

    # Sub-scores (used to build the breakdown UI later)
    hard_skills_score: float    # 0.0 – 100.0 (weighted 70% of overall)
    soft_skills_score: float    # 0.0 – 100.0 (weighted 30% of overall)

    # Matched skills (resume HAS these — show in green in the UI)
    matched_hard_skills: list[str]
    matched_soft_skills: list[str]
    matched_keywords: list[str]  # union of matched hard + soft

    # Missing skills (resume LACKS these — show in red, prioritize for rewriting)
    missing_hard_skills: list[str]
    missing_soft_skills: list[str]
    missing_keywords: list[str]  # union of missing hard + soft

    # Counts (handy for UI progress bars)
    total_job_keywords: int
    total_matched: int
    total_missing: int
