"""Quota-free deterministic single-bullet rewrite preview."""

import re

_WEAK_OPENINGS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"^responsible for managing\b", re.IGNORECASE), "Managed"),
    (re.compile(r"^responsible for\b", re.IGNORECASE), "Delivered"),
    (re.compile(r"^helped with\b", re.IGNORECASE), "Supported"),
    (re.compile(r"^worked on improving\b", re.IGNORECASE), "Improved"),
    (re.compile(r"^worked on\b", re.IGNORECASE), "Developed"),
    (re.compile(r"^assisted with\b", re.IGNORECASE), "Supported"),
    (re.compile(r"^participated in\b", re.IGNORECASE), "Contributed to"),
)


async def preview_rewrite_bullet(bullet: str) -> dict[str, str]:
    original = bullet.lstrip("- ").lstrip("* ").strip()
    rewritten = re.sub(r"\s+", " ", original).rstrip(". ")
    improvement = "Focused the opening action"

    for pattern, replacement in _WEAK_OPENINGS:
        candidate, substitutions = pattern.subn(replacement, rewritten, count=1)
        if substitutions:
            rewritten = candidate
            improvement = "Replaced weak opening"
            break

    if rewritten:
        rewritten = rewritten[0].upper() + rewritten[1:]
    if not rewritten.endswith(("!", "?", ".")):
        rewritten += "."

    return {
        "original": original,
        "rewritten": rewritten,
        "improvement": improvement,
    }
