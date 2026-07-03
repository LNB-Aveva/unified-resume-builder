"""Extracts hard skills, soft skills, and requirements from raw job descriptions."""

import re
from typing import Optional

from app.schemas.job import JobAnalysis, JobDescription

HARD_SKILLS: set[str] = {
    "python", "javascript", "typescript", "java", "c++", "c#", "golang",
    "rust", "ruby", "scala", "kotlin", "swift", "r language", "r programming", "matlab", "bash", "html", "css",
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "tailwind", "bootstrap",
    "fastapi", "django", "flask", "node.js", "express", "spring", "rails", "laravel",
    "sql", "nosql", "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis",
    "cassandra", "dynamodb", "firebase", "supabase", "elasticsearch",
    "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "data science", "huggingface",
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "jenkins", "linux", "git", "github", "gitlab",
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

_BENEFIT_HEADERS: set[str] = {
    "what we offer", "benefits", "perks", "compensation", "we offer",
    "salary", "what you get", "our benefits",
}

_EXPERIENCE_RE = re.compile(
    r'(\d+)\+?\s*(?:[-–]\s*\d+\+?)?\s*years?\s+(?:of\s+[^.\n]{0,40})?experience',
    re.IGNORECASE,
)

_EDUCATION_RE = re.compile(
    r"(?:bachelor'?s?|master'?s?|phd|doctorate|associate'?s?|mba)[^\n]*",
    re.IGNORECASE,
)


def _match_skills(text_lower: str, skill_set: set[str]) -> list[str]:
    found = []
    for skill in skill_set:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower, re.IGNORECASE):
            found.append(skill)
    return sorted(found)


def _extract_experience(text: str) -> Optional[str]:
    match = _EXPERIENCE_RE.search(text)
    return match.group(0).strip() if match else None


def _extract_education(text: str) -> Optional[list[str]]:
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

        if any(h in lower for h in _BENEFIT_HEADERS):
            in_benefits = True
            continue

        if in_benefits and (lower.endswith(":") or lower.endswith("requirements")):
            in_benefits = False
            continue

        if not in_benefits and any(stripped.startswith(c) for c in ("-", "*", "*", "·", "--")) and len(stripped) > 5:
            content = stripped[1:].strip()
            if content:
                responsibilities.append(content)

    return responsibilities


def _infer_job_title(job: JobDescription) -> str:
    if job.title:
        return job.title
    for line in job.raw_text.strip().split("\n")[:4]:
        line = line.strip()
        if line and len(line) < 100 and not line.startswith("-"):
            return line
    return "Unknown Position"


def extract_keywords(job: JobDescription) -> JobAnalysis:
    text = job.raw_text
    text_lower = text.lower()

    hard_skills = _match_skills(text_lower, HARD_SKILLS)
    soft_skills = _match_skills(text_lower, SOFT_SKILLS)
    experience = _extract_experience(text)
    education = _extract_education(text)
    responsibilities = _extract_responsibilities(text)
    job_title = _infer_job_title(job)

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
