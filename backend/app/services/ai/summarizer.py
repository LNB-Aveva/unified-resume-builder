"""
summarizer.py — Calls HuggingFace Inference API to generate resume summaries.

HOW THE HUGGINGFACE INFERENCE API WORKS:
  HuggingFace hosts hundreds of open-source AI models. Their free Inference API
  lets you call these models via HTTP — no GPU, no setup, no cost (within limits).

  Flow:
    1. You craft a "prompt" — instructions + context for the model
    2. POST to https://api-inference.huggingface.co/models/<model-name>
    3. The model generates text and returns it as JSON

  This is the same pattern as OpenAI's API, except:
    - Model is open-source (no per-token billing up to rate limits)
    - Quality is slightly lower than GPT-4, but fine for resume summaries
    - Rate limit: ~30k tokens/month free — enough for hundreds of summaries

MODEL CHOICE — why Mistral-7B-Instruct?
  Instruction-tuned models are trained to follow directions like:
    "Write a professional summary for a software engineer..."
  Non-instruct models just predict the next token (bad for structured tasks).
  Mistral-7B-Instruct is small enough to run fast on free tier, but good
  enough to produce coherent, professional prose.

PROMPT ENGINEERING (what we do here):
  Getting good output from an LLM requires careful prompt design:
  1. ROLE: Tell it who it is ("You are a professional resume writer")
  2. TASK: Be specific about what to produce ("2-3 sentences, no fluff")
  3. CONTEXT: Give it the job title, bullets, skills
  4. CONSTRAINTS: "Do not invent facts", "use keywords from the job description"

  This is called "prompt engineering" — a key skill when building AI features.

ENV VAR:
  Requires HUGGINGFACE_API_KEY in the environment (or .env file).
  Users get a free key at https://huggingface.co/settings/tokens
"""

import os
import re
import httpx

from app.schemas.summary import SummaryRequest, SummaryResponse

_HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

# Max tokens to generate — a 3-sentence summary is ~60-80 tokens
_MAX_NEW_TOKENS = 200

# Tips to append to every response (cycled by word count as a simple heuristic)
_TIPS = [
    "Swap vague adjectives ('passionate', 'motivated') for specific achievements or numbers.",
    "Add the company name to make it feel personalised before you send.",
    "Lead with your strongest credential — years of experience or a marquee achievement.",
    "Match keywords exactly from the job description to pass ATS scanning.",
    "Keep it to 40-60 words — recruiters spend 7 seconds on a summary.",
]


def _build_prompt(req: SummaryRequest) -> str:
    skills_line = f"Key skills: {req.skills.strip()}\n" if req.skills.strip() else ""
    years_line = f"{req.years_experience}+ years of experience. " if req.years_experience > 0 else ""

    return (
        f"<s>[INST] You are a professional resume writer. "
        f"Write a concise, ATS-friendly professional summary (2-3 sentences, 40-60 words) "
        f"for a {req.job_title} role. "
        f"Do not invent facts. Use only what is provided below. "
        f"Write in third person. Start with the candidate's title or years of experience. "
        f"Weave in keywords from the job description naturally. "
        f"No bullet points. Plain prose only.\n\n"
        f"Job description excerpt:\n{req.job_description[:800].strip()}\n\n"
        f"Candidate's experience:\n{req.experience_bullets[:600].strip()}\n\n"
        f"{skills_line}"
        f"Output the summary only — no preamble, no labels, just the paragraph. [/INST]"
    )


def _clean_output(raw: str) -> str:
    """Strip the model's instruction echo and any metadata it returns."""
    # Remove [INST]...[/INST] wrappers if model echoes them
    text = re.sub(r"\[/?INST\]", "", raw)
    # Remove leading/trailing whitespace and quotes
    text = text.strip().strip('"').strip("'")
    # Collapse multiple blank lines
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


async def generate_summary(req: SummaryRequest) -> SummaryResponse:
    """
    Call HuggingFace Inference API and return a structured SummaryResponse.

    Raises:
        ValueError — if the API key is not configured
        httpx.HTTPStatusError — if the API returns an error (e.g. model loading)
        RuntimeError — if the model returns empty output
    """
    api_key = os.environ.get("HUGGINGFACE_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "HUGGINGFACE_API_KEY is not set. "
            "Get a free key at https://huggingface.co/settings/tokens "
            "and add it to backend/.env"
        )

    prompt = _build_prompt(req)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": _MAX_NEW_TOKENS,
            "temperature": 0.7,
            "do_sample": True,
            "return_full_text": False,  # only return the generated part, not the prompt
        },
    }

    headers = {"Authorization": f"Bearer {api_key}"}

    # httpx is async-native (unlike requests which blocks the event loop)
    # timeout=30s because free-tier models cold-start and can take ~20s first call
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(_HF_API_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()

    # HF Inference API returns: [{"generated_text": "..."}]
    if not data or not isinstance(data, list) or "generated_text" not in data[0]:
        raise RuntimeError(f"Unexpected response from HuggingFace API: {data}")

    raw_text = data[0]["generated_text"]
    summary = _clean_output(raw_text)

    if not summary:
        raise RuntimeError("Model returned an empty summary. Try again or simplify the input.")

    word_count = len(summary.split())
    tip = _TIPS[word_count % len(_TIPS)]

    return SummaryResponse(
        summary=summary,
        word_count=word_count,
        model_used="mistralai/Mistral-7B-Instruct-v0.3",
        tip=tip,
    )
