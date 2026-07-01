"""
rewriter.py — Rewrites resume bullet points to naturally weave in missing keywords.

THE PROBLEM THIS SOLVES:
  After the Gap Analysis shows "you're missing Docker, Kubernetes, CI/CD",
  the user knows WHAT to add but not HOW to work it into their existing bullets
  without sounding forced. This is a prompt engineering problem:

  Bad:   "Worked on backend systems (Docker, Kubernetes)"
  Good:  "Containerised backend services with Docker and orchestrated deployments
          via Kubernetes, cutting release cycle time by 30%."

HOW THE PROMPT IS ENGINEERED:
  Three competing concerns:
    1. ACCURACY — never invent metrics the user didn't claim
    2. NATURALNESS — keywords must fit the sentence, not be bolted on
    3. FORMAT — we need machine-parseable output (original / rewritten pairs)

  We use a delimited format instead of JSON because small 7B models are
  unreliable JSON emitters. Delimiter-separated blocks are far more robust:
    ORIGINAL: ...
    REWRITTEN: ...
    KEYWORDS: ...
    ---

  Temperature is set to 0.6 (slightly lower than the summary generator's 0.7)
  because rewrites need to be more controlled and factual — we want variation
  in phrasing but not hallucinated achievements.

5-BULLET CAP:
  The free-tier HuggingFace timeout is 30-45s. A 7B model doing 5 rewrites
  fits in ~500 tokens of output. More than 5 bullets risks a timeout and
  produces diminishing returns (recruiters only read 3-5 bullets per role).

PARSING STRATEGY:
  We split on "---" delimiters, then extract ORIGINAL/REWRITTEN/KEYWORDS
  with simple regex. If parsing fails (model drifts from format), we fall back
  to a line-by-line pairing so the endpoint never silently returns nothing.
"""

import os
import re
import httpx

from app.schemas.rewriter import BulletRewriteRequest, BulletRewriteResponse, RewrittenBullet

_MODEL = "Qwen/Qwen2.5-7B-Instruct:novita"
_HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
_MAX_TOKENS = 700

_TIPS = [
    "Use numbers wherever possible — '40% faster' beats 'significantly faster' every time.",
    "Start each bullet with a strong past-tense action verb: Led, Built, Reduced, Shipped, Optimized.",
    "One keyword per bullet is enough — cramming three in looks unnatural to a human reader.",
    "Keep bullets under 20 words — ATS parsers struggle with text that wraps across lines.",
    "Match keyword casing exactly as it appears in the job description (e.g. 'CI/CD' not 'ci/cd').",
]


def _build_messages(req: BulletRewriteRequest, bullets: list[str]) -> list[dict]:
    bullet_list = "\n".join(f"- {b.lstrip('- ').lstrip('• ')}" for b in bullets)

    system = (
        "You are an expert resume writer specialising in ATS optimisation. "
        "For each bullet point provided, rewrite it to: "
        "(1) open with a stronger past-tense action verb, "
        "(2) naturally incorporate one or two of the provided missing keywords — "
        "only where they fit the meaning of the original bullet, "
        "(3) preserve all factual content — NEVER invent metrics or achievements, "
        "(4) stay under 20 words. "
        "For EVERY bullet, output EXACTLY this block (nothing else between blocks):\n"
        "ORIGINAL: <copy the original bullet verbatim>\n"
        "REWRITTEN: <your rewritten version>\n"
        "KEYWORDS: <comma-separated keywords you wove in, or NONE if none fit>\n"
        "---\n"
        "Do not add commentary, numbering, or any text outside these blocks."
    )

    user = (
        f"Job title: {req.job_title}\n"
        f"Missing keywords to weave in: {req.missing_keywords}\n\n"
        f"Bullets to rewrite:\n{bullet_list}"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _parse_rewrites(raw: str, originals: list[str]) -> list[RewrittenBullet]:
    blocks = re.split(r"-{3,}", raw)
    results: list[RewrittenBullet] = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        orig_m = re.search(r"ORIGINAL:\s*(.+)", block, re.IGNORECASE)
        rew_m = re.search(r"REWRITTEN:\s*(.+)", block, re.IGNORECASE)
        kw_m = re.search(r"KEYWORDS:\s*(.+)", block, re.IGNORECASE)

        if not rew_m:
            continue

        original = orig_m.group(1).strip() if orig_m else ""
        rewritten = rew_m.group(1).strip()
        kw_raw = kw_m.group(1).strip() if kw_m else "NONE"

        keywords = (
            []
            if kw_raw.upper() == "NONE"
            else [k.strip() for k in kw_raw.split(",") if k.strip()]
        )

        results.append(RewrittenBullet(
            original=original,
            rewritten=rewritten,
            keywords_woven=keywords,
        ))

    # Fallback: model drifted from format — pair output lines with originals.
    # If the model returned no usable lines at all, return empty so the caller
    # raises RuntimeError instead of silently echoing originals back as "rewrites".
    if not results and originals:
        lines = [l.strip() for l in raw.splitlines() if l.strip() and not l.startswith("---")]
        if not lines:
            return results
        for i, orig in enumerate(originals):
            rewritten = lines[i] if i < len(lines) else orig
            results.append(RewrittenBullet(
                original=orig,
                rewritten=rewritten,
                keywords_woven=[],
            ))

    return results


async def rewrite_bullets(req: BulletRewriteRequest) -> BulletRewriteResponse:
    """
    Call HuggingFace router endpoint to rewrite resume bullets.

    Raises:
        ValueError — if HUGGINGFACE_API_KEY is not set
        httpx.TimeoutException — if HF model cold-start exceeds 45s
        httpx.HTTPStatusError — if HF API returns an error
        RuntimeError — if the model returns no parseable rewrites
    """
    api_key = os.environ.get("HUGGINGFACE_API_KEY", "").strip()
    if not api_key or api_key == "hf_your_key_here":
        raise ValueError(
            "HUGGINGFACE_API_KEY is not set. "
            "Get a free key at https://huggingface.co/settings/tokens "
            "and add it to backend/.env, then restart the server."
        )

    bullets = [b.strip() for b in req.bullets.strip().splitlines() if b.strip()]
    bullets = bullets[:5]   # hard cap: 5 bullets max to stay within free-tier timeout

    payload = {
        "model": _MODEL,
        "messages": _build_messages(req, bullets),
        "max_tokens": _MAX_TOKENS,
        "temperature": 0.6,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(_HF_API_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()

    try:
        raw_text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected response shape from HuggingFace: {data}")

    rewrites = _parse_rewrites(raw_text, bullets)
    if not rewrites:
        raise RuntimeError("Model returned no rewritten bullets. Try again or simplify the input.")

    total_words = sum(len(r.rewritten.split()) for r in rewrites)
    tip = _TIPS[total_words % len(_TIPS)]

    return BulletRewriteResponse(
        rewrites=rewrites,
        model_used=_MODEL,
        tip=tip,
    )
