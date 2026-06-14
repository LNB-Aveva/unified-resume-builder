"""
summarizer.py — Calls HuggingFace Inference API to generate resume summaries.

HOW THE HUGGINGFACE INFERENCE API WORKS:
  HuggingFace hosts hundreds of open-source AI models. Their free Inference API
  lets you call these models via HTTP — no GPU, no setup, no cost (within limits).

  In 2024 HuggingFace migrated to a new "router" endpoint that uses the
  OpenAI-compatible chat completions format. This is actually cleaner:
  - Old: POST api-inference.huggingface.co/models/<model>  (raw text generation)
  - New: POST router.huggingface.co/hf-inference/models/<model>/v1/chat/completions
         Body: {"messages": [{"role": "user", "content": "..."}], "max_tokens": 200}
         Response: {"choices": [{"message": {"content": "..."}}]}

  The "OpenAI-compatible" format means we could swap in OpenAI's API later by
  changing just the URL and key — same request/response shape. This is intentional
  design by HuggingFace so you can switch providers without rewriting your code.

MODEL CHOICE — why Mistral-7B-Instruct?
  Instruction-tuned models are trained to follow directions like:
    "Write a professional summary for a software engineer..."
  Non-instruct models just predict the next token (bad for structured tasks).
  Mistral-7B-Instruct is small enough to run fast on free tier, but good
  enough to produce coherent, professional prose.

PROMPT ENGINEERING (what we do here):
  Getting good output from an LLM requires careful prompt design:
  1. SYSTEM message: Tell it who it is and what constraints to follow
  2. USER message: Provide the job context + the candidate's experience
  3. CONSTRAINTS in the system prompt: "40-60 words", "no bullet points", "third person"

  Splitting role/constraints into system vs. content into user is cleaner than
  stuffing everything into one long prompt — models follow system instructions more reliably.

ENV VAR:
  Requires HUGGINGFACE_API_KEY in backend/.env
  Get a free key at https://huggingface.co/settings/tokens
"""

import os
import re
import httpx

from app.schemas.summary import SummaryRequest, SummaryResponse

_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
# api-inference.huggingface.co is the provider-agnostic serverless endpoint.
# It supports the same OpenAI-compatible chat completions format but is not
# locked to the hf-inference provider — works with far more free-tier models.
_HF_API_URL = f"https://api-inference.huggingface.co/models/{_MODEL}/v1/chat/completions"
_MAX_TOKENS = 200

_TIPS = [
    "Swap vague adjectives ('passionate', 'motivated') for specific achievements or numbers.",
    "Add the company name to make it feel personalised before you send.",
    "Lead with your strongest credential — years of experience or a marquee achievement.",
    "Match keywords exactly from the job description to pass ATS scanning.",
    "Keep it to 40-60 words — recruiters spend 7 seconds on a summary.",
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
        "Output the summary paragraph only — no preamble, no labels."
    )

    user = (
        f"Job title applying for: {req.job_title}\n"
        f"{years_line}\n"
        f"Job description excerpt:\n{req.job_description[:800].strip()}\n\n"
        f"Candidate's experience:\n{req.experience_bullets[:600].strip()}\n"
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
    """
    Call HuggingFace router endpoint (OpenAI-compatible) and return SummaryResponse.

    Raises:
        ValueError — if HUGGINGFACE_API_KEY is not set
        httpx.TimeoutException — if HF model cold-start exceeds 30s
        httpx.HTTPStatusError — if HF API returns an error (401, 503, etc.)
        RuntimeError — if the model returns empty output
    """
    api_key = os.environ.get("HUGGINGFACE_API_KEY", "").strip()
    if not api_key or api_key == "hf_your_key_here":
        raise ValueError(
            "HUGGINGFACE_API_KEY is not set. "
            "Get a free key at https://huggingface.co/settings/tokens "
            "and add it to backend/.env, then restart the server."
        )

    payload = {
        "model": _MODEL,
        "messages": _build_messages(req),
        "max_tokens": _MAX_TOKENS,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(_HF_API_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()

    # OpenAI-compatible response: {"choices": [{"message": {"content": "..."}}]}
    try:
        raw_text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected response shape from HuggingFace: {data}")

    summary = _clean_output(raw_text)
    if not summary:
        raise RuntimeError("Model returned an empty summary. Try again or simplify the input.")

    word_count = len(summary.split())
    tip = _TIPS[word_count % len(_TIPS)]

    return SummaryResponse(
        summary=summary,
        word_count=word_count,
        model_used=_MODEL,
        tip=tip,
    )
