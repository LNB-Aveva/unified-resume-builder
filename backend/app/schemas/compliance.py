"""
compliance.py — Data shapes for ATS compliance checking.

WHAT IS ATS COMPLIANCE?
Keyword matching (gap analysis) is only half the ATS problem.
The other half is FORMAT. An ATS that can't parse your resume will
reject it even if you have all the right keywords. Common culprits:
  - Tables (ATS reads them left-to-right, scrambling the text)
  - Images and graphics (ATS skips them entirely)
  - Fancy Unicode bullet points (►❖★ → garbled or invisible)
  - No standard section headers (no "Experience" → ATS can't categorize jobs)
  - First-person pronouns (unprofessional, penalized by some ATS filters)

WHY 15 CHECKS AND NOT 23?
We check what's detectable from plain text. Things like "no tables" or
"no images" can't be checked from pasted text — only from the actual file.
The 15 text-detectable checks cover the most common ATS formatting failures.
We'll add file-based checks (PDF parser) in a later session.
"""

from pydantic import BaseModel


class ComplianceCheck(BaseModel):
    """Result of a single formatting rule check."""
    rule: str          # Short rule name, e.g., "Email address present"
    passed: bool       # True = rule satisfied, False = violation found
    severity: str      # "critical" | "warning" | "suggestion"
    message: str       # Human-readable explanation (what was found / what to fix)


class ComplianceReport(BaseModel):
    """
    Full ATS compliance report for one resume.

    Severity levels (used to prioritize what to fix first):
      critical   — likely causes ATS rejection (missing contact info, no sections)
      warning    — reduces ATS score or readability
      suggestion — best practices, often ignored but worth knowing
    """
    overall_score: int         # 0-100 (passed_count / total_checks * 100)
    critical_issues: int       # Count of critical failures
    warnings: int              # Count of warning failures
    suggestions_failed: int    # Count of suggestion failures
    passed_count: int
    total_checks: int
    checks: list[ComplianceCheck]
