"""
gap.py — Schema for the gap analysis endpoint.

WHY A SEPARATE ENDPOINT FROM /score?
The /score endpoint requires a structured ResumeData object (with work experience,
education, certifications formatted as typed fields). That's good for the
full product but is too much friction for a quick demo.

/gap accepts raw text for both the job and resume — just paste and go.
It returns the same ATSScore response shape, so the frontend doesn't need
to learn a new response format.

This is called "progressive disclosure": start simple (raw text), add structure
later (full ResumeData) as users get more invested in the product.
"""

from pydantic import BaseModel


class GapRequest(BaseModel):
    """Raw text input for the gap analysis endpoint."""
    job_text: str     # Full job description pasted by the user
    resume_text: str  # Full resume text pasted by the user (plain text, not JSON)
