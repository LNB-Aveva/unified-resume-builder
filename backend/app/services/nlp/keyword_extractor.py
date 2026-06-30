"""
keyword_extractor.py — Extracts structured information from raw job descriptions.

HOW IT WORKS (the learning explanation):
  1. spaCy "reads" the text — it understands grammar, not just characters
  2. We scan for hard skills (Python, React, SQL...) using our own skills database
  3. We scan for soft skills (communication, leadership...) the same way
  4. We use regex to find experience requirements like "3+ years"
  5. We parse bullet points to extract responsibilities vs. benefits
  6. We return a clean JobAnalysis object that every other module can use

WHY A HARDCODED SKILLS LIST instead of pure AI?
  Pure NLP can't reliably distinguish "Java" (language) from "Java" (island).
  A curated list + NLP is the industry standard for ATS systems like Jobscan.
  We start with ~80 skills and grow the list over time.

WHY LOAD spaCy AT MODULE LEVEL (outside any function)?
  Loading the NLP model takes ~200ms. If we loaded it inside extract_keywords(),
  every single request would be 200ms slower. Module-level loading pays the cost
  once when the server starts, then every request reuses the same loaded model.
  This is called "eager initialization" and is a common backend performance pattern.
"""

import re
from typing import Optional

import spacy

from app.schemas.job import JobAnalysis, JobDescription

# Load the English NLP model once at startup
# en_core_web_sm = "English core model, small size"
# It knows grammar, parts of speech, named entities (company names, places, etc.)
nlp = spacy.load("en_core_web_sm")


# ============================================================
# Skills Databases
# ============================================================
# Keys are lowercase — we match against lowercased job text for case-insensitivity.
# "React" in the job description → "react" in our set → match!

HARD_SKILLS: set[str] = {
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "scala", "kotlin", "swift", "r language", "r programming", "matlab", "bash", "html", "css",
    # Frontend Frameworks
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "tailwind", "bootstrap",
    # Backend Frameworks
    "fastapi", "django", "flask", "node.js", "express", "spring", "rails", "laravel",
    # Databases
    "sql", "nosql", "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis",
    "cassandra", "dynamodb", "firebase", "supabase", "elasticsearch",
    # AI / ML / Data
    "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "data science", "huggingface",
    # Cloud & DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "jenkins", "linux", "git", "github", "gitlab",
    # Concepts & Methodologies
    "rest", "restful", "graphql", "microservices", "api", "ci/cd",
    "agile", "scrum", "kanban", "tdd", "unit testing", "open source",
}

SOFT_SKILLS: set[str] = {
    "communication", "leadership", "teamwork", "collaboration",
    "problem-solving", "problem solving", "attention to detail",
    "critical thinking", "time management", "adaptability",
    "creativity", "mentoring", "analytical", "self-motivated",
    "proactive", "organized", "presentation",
}

# Section headers that signal "benefits/compensation" content (skip for responsibilities)
_BENEFIT_HEADERS: set[str] = {
    "what we offer", "benefits", "perks", "compensation", "we offer",
    "salary", "what you get", "our benefits",
}

# Regex: matches "3+ years", "5 years of experience", "3+ years of professional software development experience"
# [^.\n]{0,40} allows any words between "of" and "experience" (up to 40 chars, no line breaks)
_EXPERIENCE_RE = re.compile(
    r'(\d+)\+?\s*(?:[-–]\s*\d+\+?)?\s*years?\s+(?:of\s+[^.\n]{0,40})?experience',
    re.IGNORECASE,
)

# Regex: education keywords — full words only (avoids false matches on "ms" in "AWS")
_EDUCATION_RE = re.compile(
    r"(?:bachelor'?s?|master'?s?|phd|doctorate|associate'?s?|mba)[^\n]*",
    re.IGNORECASE,
)


# ============================================================
# Internal Helper Functions
# ============================================================

def _match_skills(text_lower: str, skill_set: set[str]) -> list[str]:
    """
    Scan text_lower for each skill using word-boundary matching.

    WHY WORD BOUNDARIES?
    Without them, searching for "r" would match inside "javascript" or "Docker".
    The lookahead/lookbehind patterns ensure the skill is a standalone token.
    Example: "(?<![a-zA-Z0-9])python(?![a-zA-Z0-9])" matches "python" but not "pythons"
    """
    found = []
    for skill in skill_set:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower, re.IGNORECASE):
            found.append(skill)
    return sorted(found)


def _extract_experience(text: str) -> Optional[str]:
    """Return the first experience requirement found, e.g., '3+ years of experience'."""
    match = _EXPERIENCE_RE.search(text)
    return match.group(0).strip() if match else None


def _extract_education(text: str) -> Optional[list[str]]:
    """Return education requirements mentioned in the job description."""
    matches = _EDUCATION_RE.findall(text)
    cleaned = [m.strip() for m in matches if len(m.strip()) > 4]
    return cleaned if cleaned else None


def _extract_responsibilities(text: str) -> list[str]:
    """
    Extract bullet-point requirements from the job description.

    WHY PARSE BY LINES instead of spaCy sentences?
    Job descriptions are structured documents, not natural prose.
    Bullet points (- item) are the clearest signal of requirements.
    spaCy sentence parsing works better on flowing paragraphs — it gets
    confused by lists where each line is a fragment.
    """
    lines = text.split("\n")
    responsibilities = []
    in_benefits = False

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        # Entering a benefits/compensation section → stop collecting bullets
        if any(h in lower for h in _BENEFIT_HEADERS):
            in_benefits = True
            continue

        # Back to a requirements-like section → resume collecting
        if in_benefits and (lower.endswith(":") or lower.endswith("requirements")):
            in_benefits = False
            continue

        # Collect bullet points only when NOT in benefits section
        if not in_benefits and stripped.startswith("-") and len(stripped) > 5:
            content = stripped[1:].strip()
            if content:
                responsibilities.append(content)

    return responsibilities


def _infer_job_title(job: JobDescription) -> str:
    """Use explicit title if provided, else extract from first non-empty line."""
    if job.title:
        return job.title
    for line in job.raw_text.strip().split("\n")[:4]:
        line = line.strip()
        if line and len(line) < 100 and not line.startswith("-"):
            return line
    return "Unknown Position"


# ============================================================
# Main Public Function
# ============================================================

def extract_keywords(job: JobDescription) -> JobAnalysis:
    """
    Entry point: converts a raw job description into a structured JobAnalysis.

    Pipeline:
      raw_text → lowercase → skill scan → regex extraction → JobAnalysis

    All other modules (ATS scorer, gap analyzer, resume rewriter) consume
    the JobAnalysis object that this function produces. Getting this right
    is the most important step in the entire system.
    """
    text = job.raw_text
    text_lower = text.lower()

    hard_skills = _match_skills(text_lower, HARD_SKILLS)
    soft_skills = _match_skills(text_lower, SOFT_SKILLS)
    experience = _extract_experience(text)
    education = _extract_education(text)
    responsibilities = _extract_responsibilities(text)
    job_title = _infer_job_title(job)

    # keywords = union of all matched skills (no duplicates, alphabetically sorted)
    # WHY UNION? The ATS scorer will compare this list against the resume.
    # Keeping hard + soft together in one list simplifies that comparison.
    all_keywords = sorted(set(hard_skills + soft_skills))

    return JobAnalysis(
        job_title=job_title,
        company=job.company,
        hard_skills=hard_skills,
        soft_skills=soft_skills,
        required_experience=experience,
        education_requirements=education,
        keywords=all_keywords,
        responsibilities=responsibilities,
    )
