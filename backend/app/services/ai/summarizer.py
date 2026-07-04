import re

from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.ai.hf_client import call_hf
from app.services.ai.sanitizer import sanitize_for_prompt

_MAX_TOKENS = 200

_TIPS = [
    "Swap vague adjectives ('passionate', 'motivated') for specific achievements or numbers.",
    "Add the company name to make it feel personalised before you send.",
    "Lead with your strongest credential -- years of experience or a marquee achievement.",
    "Match keywords exactly from the job description to pass ATS scanning.",
    "Keep it to 40-60 words -- recruiters spend 7 seconds on a summary.",
]


def _build_messages(req: SummaryRequest) -> list[dict]:
    skills_line = f"Key skills: {req.skills.strip()}" if req.skills.strip() else ""
    years_line = f"{req.years_experience}+ years of experience." if req.years_experience > 0 else ""

    system = (
        "You are a professional resume writer. "
        "Write a concise, ATS-friendly professional summary in 2-3 sentences (40-60 words). "
        "Rules: third person, no bullet points, plain prose only, "
        "do not invent facts not provided, weave in keywords from the job description naturally, "
        "start with the candidate's title or years of experience. "
        "Output the summary paragraph only -- no preamble, no labels."
    )

    user = (
        f"Job title applying for: {sanitize_for_prompt(req.job_title)}\n"
        f"{years_line}\n"
        f"Job description excerpt:\n{sanitize_for_prompt(req.job_description[:800])}\n\n"
        f"Candidate's experience:\n{sanitize_for_prompt(req.experience_bullets[:600])}\n"
        f"{skills_line}"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user.strip()},
    ]


def _clean_output(raw: str) -> str:
    text = raw.strip().strip('"').strip("'")
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


async def generate_summary(req: SummaryRequest) -> SummaryResponse:
    raw_text = await call_hf(
        messages=_build_messages(req),
        max_tokens=_MAX_TOKENS,
        temperature=0.7,
        timeout=30.0,
    )

    summary = _clean_output(raw_text)
    if not summary:
        raise RuntimeError("Model returned an empty summary. Try again or simplify the input.")

    word_count = len(summary.split())
    tip = _TIPS[word_count % len(_TIPS)]

    return SummaryResponse(
        summary=summary,
        word_count=word_count,
        model_used="Qwen/Qwen2.5-7B-Instruct:fastest",
        tip=tip,
    )
