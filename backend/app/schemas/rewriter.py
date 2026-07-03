"""
rewriter.py — Pydantic schemas for the AI Bullet Point Rewriter.

INPUT DESIGN:
  - job_title: the role the user is applying for (sets tone/vocabulary)
  - missing_keywords: comma-separated keywords from the Gap Analysis
    (e.g. "Docker, Kubernetes, CI/CD, microservices")
  - bullets: newline-separated bullet points from the user's resume
    We cap at 5 bullets to stay within HuggingFace free-tier token limits

OUTPUT DESIGN:
  - rewrites: list of original/rewritten pairs so the user can diff them
  - keywords_woven: which keywords from the missing list were actually added
    (lets the frontend highlight them)
  - model_used: for transparency
  - tip: one actionable coaching tip

WHY KEEP ORIGINAL:
  The user needs to see what changed. Side-by-side comparison builds trust
  and lets them decide whether to accept the rewrite or keep their own version.
"""

from pydantic import BaseModel, Field


class BulletRewriteRequest(BaseModel):
    job_title: str = Field(..., max_length=200)
    missing_keywords: str = Field(..., max_length=2_000)
    bullets: str = Field(..., max_length=5_000)


class RewrittenBullet(BaseModel):
    original: str
    rewritten: str
    keywords_woven: list[str]   # subset of missing_keywords that were added


class BulletRewriteResponse(BaseModel):
    rewrites: list[RewrittenBullet]
    model_used: str
    tip: str
