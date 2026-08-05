"""Extracts hard skills, soft skills, and requirements from raw job descriptions."""

import hashlib
import re
import time
from collections import OrderedDict

from app.schemas.job import JobAnalysis, JobDescription
from app.services.nlp import taxonomy

_CACHE_MAX_SIZE = 128
_CACHE_TTL = 300  # 5 minutes
_cache: OrderedDict[str, tuple[float, JobAnalysis]] = OrderedDict()

HARD_SKILLS: frozenset[str] = taxonomy.get_hard_skills()
SOFT_SKILLS: frozenset[str] = taxonomy.get_soft_skills()

_BENEFIT_HEADERS: set[str] = {
    "what we offer", "benefits", "perks", "compensation", "we offer",
    "salary", "what you get", "our benefits", "equal opportunity",
    "eeo", "affirmative action", "accommodation",
}

_RESPONSIBILITY_HEADERS: set[str] = {
    "responsibilities", "requirements", "qualifications", "what you'll do",
    "what you will do", "the role", "role overview", "job duties", "duties",
}


def _is_section_header(line: str, headers: set[str]) -> bool:
    """Match a section heading: exact match (after stripping colon) or header is a prefix word."""
    normalized = line.strip().lower().rstrip(":").strip()
    return normalized in headers or any(normalized.startswith(h + " ") for h in headers)

_EXPERIENCE_RE = re.compile(
    r'(\d+)\+?\s*(?:[-–]\s*\d+\+?)?\s*years?\s+(?:of\s+[^.\n]{0,40})?experience',
    re.IGNORECASE,
)

_EDUCATION_RE = re.compile(
    r"(?:bachelor'?s?|master'?s?|phd|doctorate|associate'?s?|mba|bs|ms|ba|ma)[^\n]*",
    re.IGNORECASE,
)

_SKILL_CONTEXT_RE = re.compile(
    r'(?:experience (?:with|in|using)|profici(?:ent|ency) (?:in|with)|'
    r'knowledge of|expertise in|familiarity with|skilled in|'
    r'working knowledge of|background in|hands.on (?:with|experience))\s+'
    r'([A-Za-z][A-Za-z0-9][A-Za-z0-9\s\+\#\.\/\-]{1,25}?)(?=[,\.\n]|\s+and\s|\s+or\s|\Z)',
    re.IGNORECASE,
)


def _match_skills(text_lower: str, skill_set: set[str] | frozenset[str]) -> list[str]:
    synonym_map = taxonomy.get_synonym_map()
    found: set[str] = set()
    for skill in skill_set:
        terms = [skill] + list(synonym_map.get(skill, ()))
        for term in terms:
            pattern = r"(?<![a-zA-Z0-9])" + re.escape(term) + r"(?![a-zA-Z0-9])"
            if re.search(pattern, text_lower, re.IGNORECASE):
                found.add(skill)
                break
    return _dedup_substrings(sorted(found))


def _dedup_substrings(skills: list[str]) -> list[str]:
    """Drop a shorter skill only when a longer compound skill covers it as a whole word.

    e.g. "lean" → dropped when "lean manufacturing" is also found.
         "excel" → dropped when "microsoft excel" is also found.
         "erp"  → kept even though "powerpoint" accidentally contains those letters.
    """
    lower_set = {s.lower() for s in skills}
    result = []
    for s in skills:
        sl = s.lower()
        absorbed = any(
            sl != other and (
                other.startswith(sl + " ")
                or other.endswith(" " + sl)
                or (" " + sl + " ") in other
            )
            for other in lower_set
        )
        if not absorbed:
            result.append(s)
    return result


def _extract_context_skills(text: str, known_hard: list[str], known_soft: list[str]) -> list[str]:
    """Extract skills from 'experience with X' patterns not already captured by the predefined lists."""
    already_found = {s.lower() for s in known_hard + known_soft}
    extracted = []
    for match in _SKILL_CONTEXT_RE.finditer(text):
        phrase = match.group(1).strip().rstrip(".,;:")
        phrase_lower = phrase.lower()
        # Skip if phrase overlaps with an already-found skill (handles "CI/CD pipelines" vs "ci/cd")
        if any(known in phrase_lower or phrase_lower in known for known in already_found):
            continue
        if (
            len(phrase) >= 2
            and len(phrase) <= 40
            and phrase_lower not in already_found
            and not any(c.isdigit() for c in phrase)
            and phrase_lower not in _BENEFIT_HEADERS
        ):
            extracted.append(phrase_lower)
            already_found.add(phrase_lower)
    return sorted(set(extracted))


def _extract_experience(text: str) -> str | None:
    match = _EXPERIENCE_RE.search(text)
    return match.group(0).strip() if match else None


def _extract_education(text: str) -> list[str] | None:
    matches = _EDUCATION_RE.findall(text)
    cleaned = [m.strip() for m in matches if len(m.strip()) > 4]
    return cleaned if cleaned else None


def _extract_responsibilities(text: str) -> list[str]:
    lines = text.split("\n")
    responsibilities = []
    in_benefits = False

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        if _is_section_header(lower, _BENEFIT_HEADERS):
            in_benefits = True
            continue

        if in_benefits and _is_section_header(lower, _RESPONSIBILITY_HEADERS):
            in_benefits = False
            continue

        if not in_benefits and len(stripped) > 5:
            for prefix in ("--", "-", "*", "•", "·", "–"):
                if stripped.startswith(prefix):
                    content = stripped[len(prefix):].strip()
                    if content:
                        responsibilities.append(content)
                    break

    return responsibilities


def _infer_job_title(job: JobDescription) -> str:
    if job.title:
        return job.title
    for line in job.raw_text.strip().split("\n")[:4]:
        line = line.strip()
        if line and len(line) < 100 and not line.startswith("-"):
            return line
    return "Unknown Position"


def _cache_key(job: JobDescription) -> str:
    raw = f"{job.raw_text}|{job.title or ''}|{job.company or ''}"
    return hashlib.sha256(raw.encode()).hexdigest()


def extract_keywords(job: JobDescription) -> JobAnalysis:
    key = _cache_key(job)
    now = time.monotonic()

    if key in _cache:
        ts, result = _cache[key]
        if now - ts < _CACHE_TTL:
            _cache.move_to_end(key)
            return result
        del _cache[key]

    text = job.raw_text
    text_lower = text.lower()

    hard_skills = _match_skills(text_lower, HARD_SKILLS)
    soft_skills = _match_skills(text_lower, SOFT_SKILLS)
    context_skills = _extract_context_skills(text, hard_skills, soft_skills)
    experience = _extract_experience(text)
    education = _extract_education(text)
    responsibilities = _extract_responsibilities(text)
    job_title = _infer_job_title(job)

    all_keywords = sorted(set(hard_skills + soft_skills + context_skills))

    total_extracted = len(hard_skills) + len(context_skills) + len(soft_skills)
    taxonomy_coverage = (
        (len(hard_skills) + len(soft_skills)) / total_extracted
        if total_extracted > 0
        else 1.0
    )

    result = JobAnalysis(
        job_title=job_title,
        company=job.company,
        hard_skills=hard_skills + context_skills,
        soft_skills=soft_skills,
        required_experience=experience,
        education_requirements=education,
        keywords=all_keywords,
        responsibilities=responsibilities,
        taxonomy_coverage=round(taxonomy_coverage, 2),
    )

    _cache[key] = (now, result)
    if len(_cache) > _CACHE_MAX_SIZE:
        _cache.popitem(last=False)

    return result
