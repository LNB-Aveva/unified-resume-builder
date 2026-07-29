"""Loads the skills taxonomy from JSON and provides lookup functions."""

import json
from functools import lru_cache
from pathlib import Path

_TAXONOMY_PATH = Path(__file__).parent / "skills_taxonomy.json"


@lru_cache(maxsize=1)
def _load_taxonomy() -> dict:
    with open(_TAXONOMY_PATH, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_hard_skills() -> frozenset[str]:
    data = _load_taxonomy()
    skills: set[str] = set()
    for category_skills in data["hard_skills"].values():
        skills.update(s.lower() for s in category_skills)
    return frozenset(skills)


@lru_cache(maxsize=1)
def get_soft_skills() -> frozenset[str]:
    data = _load_taxonomy()
    return frozenset(s.lower() for s in data["soft_skills"])


@lru_cache(maxsize=1)
def get_synonym_map() -> dict[str, tuple[str, ...]]:
    data = _load_taxonomy()
    return {
        k.lower(): tuple(s.lower() for s in v)
        for k, v in data.get("synonyms", {}).items()
    }


@lru_cache(maxsize=1)
def get_reverse_synonym_map() -> dict[str, str]:
    result: dict[str, str] = {}
    for canonical, synonyms in get_synonym_map().items():
        for syn in synonyms:
            result[syn] = canonical
    return result


def canonicalize(term: str) -> str:
    return get_reverse_synonym_map().get(term.lower(), term.lower())


@lru_cache(maxsize=1)
def get_categories() -> dict[str, str]:
    """Skill name → category for UI display."""
    data = _load_taxonomy()
    result: dict[str, str] = {}
    for category, skills in data["hard_skills"].items():
        for skill in skills:
            result[skill.lower()] = category
    return result
