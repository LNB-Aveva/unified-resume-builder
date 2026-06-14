"""
checker.py — ATS compliance checker: 15 text-detectable formatting rules.

HOW ATS FORMAT SCANNING WORKS IN THE REAL WORLD:
  When you upload a resume to an ATS (Workday, Greenhouse, iCIMS), it runs
  an HTML/PDF parser to extract plain text. Anything the parser can't read
  becomes invisible — your experience, your skills, your name.

  This checker replicates the text-quality tests those parsers do. We can't
  detect tables or images from pasted text (that requires the actual file),
  but we can catch the 15 most common text-detectable failures.

SEVERITY LEVELS (and what they mean for your job search):
  critical   — Resume may be auto-rejected before a human ever reads it.
               Fix these before sending the resume anywhere.
  warning    — Reduces ATS score or parse quality. Fix these for better results.
  suggestion — Best practices. Nice to fix but not urgent.

WHY PLAIN TEXT INPUT?
  File parsing (PDF/DOCX → text) requires additional libraries (PyMuPDF,
  python-docx) and adds server complexity. For the MVP, we ask users to
  paste their resume text — which they already did for the gap analysis.
  File upload is planned for a future session.
"""

import re

from app.schemas.compliance import ComplianceCheck, ComplianceReport


# ── Regex patterns ──────────────────────────────────────────────────────────

_EMAIL = re.compile(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b')
_PHONE = re.compile(r'[\+\(]?\d[\d\s\-\(\)\.]{5,}\d')
_LINKEDIN = re.compile(r'linkedin\.com/in/', re.I)
_PRONOUN = re.compile(r'\b(I am|I\'ve|I\'m|I have|I led|I built|my |myself\b)\b', re.I)
_DATE_MONTH_YEAR = re.compile(
    r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|'
    r'January|February|March|April|June|July|August|September|October|November|December)'
    r'\s+\d{4}\b',
    re.I,
)
_NUMBERS_IN_CONTEXT = re.compile(
    r'\d+\s*[\+%xX]?\s*(?:users?|requests?|customers?|clients?|people|team|'
    r'percent|%|million|k\b|thousand|\$|revenue|leads?|reduction|faster|improvement)',
    re.I,
)
_FANCY_BULLETS = re.compile(r'[►❖★◆▪◼◻○●➤➢➣➔⬢⬡]')
_REFERENCES = re.compile(r'references\s+(available|upon\s+request)', re.I)
_ALL_CAPS_LINE = re.compile(r'^[A-Z][A-Z\s\d]{19,}$')  # 20+ chars, all caps

# Standard section headers ATS systems look for
_EXPERIENCE_HEADERS = {'experience', 'work history', 'employment', 'professional experience', 'career history', 'work experience'}
_EDUCATION_HEADERS  = {'education', 'academic background', 'qualifications', 'academic history', 'schooling'}
_SKILLS_HEADERS     = {'skills', 'technical skills', 'competencies', 'core competencies', 'technologies', 'technical proficiencies'}
_SUMMARY_HEADERS    = {'summary', 'professional summary', 'profile', 'objective', 'about me', 'career objective'}

# Action verbs common in strong resume bullets
_ACTION_VERBS = {
    'developed', 'built', 'created', 'designed', 'implemented', 'managed',
    'led', 'improved', 'increased', 'reduced', 'launched', 'optimized',
    'automated', 'analyzed', 'deployed', 'maintained', 'architected',
    'mentored', 'delivered', 'collaborated', 'spearheaded', 'drove',
    'achieved', 'established', 'streamlined', 'migrated', 'integrated',
}

# Phrases that weaken a resume with no substance behind them
_BUZZWORDS = {
    'team player', 'hard worker', 'go-getter', 'dynamic professional',
    'synergy', 'passionate about', 'detail-oriented', 'self-starter',
    'results-driven', 'think outside the box', 'value add',
}


# ── Individual check helpers ─────────────────────────────────────────────────

def _has_section(text_lower: str, headers: set[str]) -> bool:
    """Return True if any section header appears as a standalone line or heading."""
    for line in text_lower.split('\n'):
        line = line.strip()
        if line in headers or any(line.startswith(h) for h in headers):
            return True
    return False


def _bullet_lines(lines: list[str]) -> list[str]:
    """Return lines that look like bullet points."""
    return [l for l in lines if l.startswith(('-', '•', '*', '·', '–'))]


# ── Main public function ─────────────────────────────────────────────────────

def check_resume(resume_text: str) -> ComplianceReport:
    """
    Run all 15 compliance checks and return a ComplianceReport.

    All checks are text-based — no file required.
    Each check returns a ComplianceCheck with pass/fail + explanation.
    """
    text = resume_text.strip()
    text_lower = text.lower()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    word_count = len(text.split())
    bullets = _bullet_lines(lines)
    bullet_text = ' '.join(bullets).lower()
    checks: list[ComplianceCheck] = []

    def add(rule: str, passed: bool, severity: str, ok: str, fail: str) -> None:
        checks.append(ComplianceCheck(
            rule=rule, passed=passed, severity=severity,
            message=ok if passed else fail,
        ))

    # ── CRITICAL ────────────────────────────────────────────────────────────

    add("Email address present",
        bool(_EMAIL.search(text)), "critical",
        "Email address found",
        "No email detected — ATS and recruiters can't contact you")

    add("Phone number present",
        bool(_PHONE.search(text)), "critical",
        "Phone number found",
        "No phone number detected — add it to your contact section")

    has_exp = _has_section(text_lower, _EXPERIENCE_HEADERS)
    add("Experience section present", has_exp, "critical",
        "Experience section found",
        "No experience section — use a standard header like 'Work Experience'")

    has_edu = _has_section(text_lower, _EDUCATION_HEADERS)
    add("Education section present", has_edu, "critical",
        "Education section found",
        "No education section detected — ATS may mark this field empty")

    # ── WARNINGS ────────────────────────────────────────────────────────────

    has_skills = _has_section(text_lower, _SKILLS_HEADERS)
    add("Skills section present", has_skills, "warning",
        "Skills/Competencies section found",
        "No skills section — ATS keyword matching relies on this section")

    length_ok = 200 <= word_count <= 1200
    add("Resume length appropriate (200–1200 words)", length_ok, "warning",
        f"Good length ({word_count} words)",
        f"Resume {'too short' if word_count < 200 else 'very long'} "
        f"({word_count} words) — aim for 400–800 words for a 1-page resume")

    pronoun_match = _PRONOUN.search(text)
    pronoun_fail_msg = (
        f"Found '{pronoun_match.group(0).strip()}' — remove 'I', 'my' from bullets; start with action verbs instead"
        if pronoun_match else ""
    )
    add("No first-person pronouns (I, my, myself)",
        pronoun_match is None, "warning",
        "No first-person pronouns found",
        pronoun_fail_msg)

    has_action = any(v in bullet_text for v in _ACTION_VERBS) if bullets else \
                 any(v in text_lower for v in _ACTION_VERBS)
    add("Uses action verbs in bullet points", has_action, "warning",
        "Action verbs found",
        "No action verbs detected — start bullets with 'Developed', 'Led', 'Built', 'Reduced', etc.")

    dates_found = _DATE_MONTH_YEAR.findall(text)
    add("Date format detected (Month Year)",
        len(dates_found) >= 1, "warning",
        f"Found {len(dates_found)} dates in Month Year format",
        "No standard dates found — use 'Jan 2023 – Present' format for each role")

    fancy_found = _FANCY_BULLETS.search(text)
    add("Uses standard bullet characters (- • *)",
        fancy_found is None, "warning",
        "Standard bullet characters used",
        "Fancy bullet symbols detected (►❖★) — replace with - or • for ATS compatibility")

    # ── SUGGESTIONS ─────────────────────────────────────────────────────────

    add("LinkedIn URL present",
        bool(_LINKEDIN.search(text)), "suggestion",
        "LinkedIn URL found",
        "No LinkedIn URL — add linkedin.com/in/yourname to contact section")

    add("No 'References available upon request'",
        not bool(_REFERENCES.search(text)), "suggestion",
        "Good — no references line",
        "Remove 'References available upon request' — it wastes space and is assumed")

    quant_found = _NUMBERS_IN_CONTEXT.search(text)
    add("Quantified achievements present",
        quant_found is not None, "suggestion",
        "Found quantified achievement (numbers + impact context)",
        "Add numbers to bullets: '40% faster', '10,000 users', '$2M revenue', 'team of 5'")

    buzzwords_found = [p for p in _BUZZWORDS if p in text_lower]
    add("No overused buzzwords",
        len(buzzwords_found) == 0, "suggestion",
        "No overused buzzwords found",
        f"Replace vague phrases with specific achievements: {', '.join(buzzwords_found[:3])}")

    caps_lines = sum(1 for line in lines if _ALL_CAPS_LINE.match(line))
    add("No excessive ALL-CAPS body text",
        caps_lines <= 1, "suggestion",
        "No excessive all-caps body text",
        f"{caps_lines} lines in ALL-CAPS — this can indicate copy-paste formatting issues")

    # ── Totals ───────────────────────────────────────────────────────────────

    passed_count = sum(1 for c in checks if c.passed)
    critical_issues = sum(1 for c in checks if not c.passed and c.severity == "critical")
    warnings_count = sum(1 for c in checks if not c.passed and c.severity == "warning")
    suggestions_failed = sum(1 for c in checks if not c.passed and c.severity == "suggestion")
    overall_score = round(passed_count / len(checks) * 100)

    return ComplianceReport(
        overall_score=overall_score,
        critical_issues=critical_issues,
        warnings=warnings_count,
        suggestions_failed=suggestions_failed,
        passed_count=passed_count,
        total_checks=len(checks),
        checks=checks,
    )
