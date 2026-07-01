"""
cover_letter.py — Generates tailored cover letters via HuggingFace Inference API.

PROMPT ENGINEERING — COVER LETTER vs SUMMARY:

  The professional summary (Session 3) is 40-60 words, third person, no fluff.
  A cover letter is the opposite: 250-350 words, first person, narrative arc,
  and it MUST feel personal to the specific company and role.

  Key prompt differences:
    1. LONGER OUTPUT — we set max_tokens=600 (vs 200 for summary).
       Cover letters need 3-4 full paragraphs.

    2. STRUCTURE GUIDANCE — we tell the model the four-paragraph formula:
         Para 1: Hook — why THIS company, why THIS role excites you
         Para 2: What you bring — your strongest 1-2 achievements, role-specific
         Para 3: Bridge — connect your experience to their specific needs
         Para 4: Close — confident call to action, no "I hope to hear from you"

    3. TONE FORK — two distinct system prompts:
         formal:         "Dear Hiring Team, ... Yours sincerely"
         conversational: warmer opener, contractions allowed, energy-forward

    4. ANTI-CLICHE RULES — small models love filler phrases:
         Banned: "I am writing to express my interest in..."
                 "I am a passionate and motivated..."
                 "I would be a great fit because..."
         These phrases appear in most training data cover letters and models
         default to them without explicit instructions to avoid them.

    5. NO INVENTED FACTS — same rule as bullet rewriter. The model must
       only use achievements from experience_summary, not invent metrics.

TEMPERATURE 0.75:
  Slightly higher than both the summary (0.7) and rewriter (0.6).
  Cover letters benefit from more natural, varied sentence rhythm —
  a temperature that's too low produces wooden, repetitive prose.

POST-PROCESSING:
  We strip any "Dear [Name]," or "Yours sincerely," boilerplate the model
  sometimes prepends/appends unprompted, leaving just the letter body.
  The user can add salutation/sign-off when they paste it into their email.
"""

import os
import re
import httpx

from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse

_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
_HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{_MODEL}/v1/chat/completions"
_MAX_TOKENS = 650

_TIPS_FORMAL = [
    "Replace 'Dear Hiring Team' with the hiring manager's actual name — it triples open rates.",
    "Add one specific fact about the company (a recent product launch, award, or mission statement) to the opening.",
    "Quantify your biggest achievement in the second paragraph — numbers make claims credible.",
    "Cut the last sentence of your closing and replace it with a specific date: 'I would welcome a call the week of [date].'",
    "Read it aloud — if you wouldn't say a sentence out loud, rewrite it.",
]

_TIPS_CONVERSATIONAL = [
    "Drop the 'Dear Hiring Team' entirely — start straight with your hook sentence.",
    "Mention something specific from their careers page or LinkedIn about the team culture.",
    "Use the word 'because' at least once — it signals you have reasons, not just enthusiasm.",
    "End with energy, not apology: 'I'd love to chat' beats 'I hope to hear from you.'",
    "Keep paragraphs to 3-4 sentences max — conversational means scannable.",
]


def _build_messages(req: CoverLetterRequest) -> list[dict]:
    skills_line = f"Key skills: {req.skills.strip()}" if req.skills.strip() else ""

    if req.tone == "conversational":
        tone_instructions = (
            "Tone: warm, energetic, and direct. Contractions are fine. "
            "Short punchy sentences mixed with longer ones. "
            "Show personality — this should sound like a real person, not a template. "
            "Opening: do NOT start with 'Dear' — start with a compelling hook sentence "
            "about why this specific company or role excites you. "
            "Closing: confident and forward-looking, e.g. 'I'd love to discuss...' "
            "or 'Looking forward to exploring this with you.' No sign-off needed."
        )
    else:
        tone_instructions = (
            "Tone: professional and confident. No contractions. "
            "Open with 'Dear Hiring Team,' on the first line. "
            "Close with 'Yours sincerely,' followed by a blank line for the candidate's name. "
            "Language should be polished but not stiff — avoid passive voice where possible."
        )

    system = (
        "You are an expert career coach and cover letter writer. "
        f"Write a tailored cover letter for the role of {req.job_title} at {req.company_name}. "
        "Structure: exactly 4 paragraphs.\n"
        "  Para 1 (Hook): Open with why THIS company and THIS specific role appeal to you. "
        "Reference something specific about the company from the job description. "
        "NEVER start with 'I am writing to apply for' or 'I am excited to apply for'.\n"
        "  Para 2 (Evidence): Highlight your single strongest relevant achievement from the "
        "experience provided. Use specific detail. Do not invent metrics.\n"
        "  Para 3 (Bridge): Connect your background directly to 2-3 keywords from the job "
        "description. Show you understand what the role actually needs.\n"
        "  Para 4 (Close): Confident call to action. No 'I hope to hear from you.'\n"
        f"{tone_instructions}\n"
        "Target length: 250-320 words. "
        "BANNED phrases: 'I am passionate', 'I am a motivated', 'I would be a great fit', "
        "'I am writing to express my interest', 'hard-working', 'team player', 'go-getter'. "
        "Output the letter text only — no preamble, no labels, no 'Here is your cover letter:'."
    )

    user = (
        f"Job title: {req.job_title}\n"
        f"Company: {req.company_name}\n"
        f"Job description excerpt:\n{req.job_description[:900].strip()}\n\n"
        f"Candidate's key experience:\n{req.experience_summary[:600].strip()}\n"
        f"{skills_line}"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user.strip()},
    ]


def _clean_output(raw: str) -> str:
    text = raw.strip()
    # Strip markdown fences if the model wraps in ```
    text = re.sub(r"^```[^\n]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    # Strip "Here is your cover letter:" style preambles
    text = re.sub(r"^(Here is|Below is|This is)[^\n]*\n+", "", text, flags=re.IGNORECASE)
    return text.strip()


async def generate_cover_letter(req: CoverLetterRequest) -> CoverLetterResponse:
    """
    Call HuggingFace serverless endpoint and return a CoverLetterResponse.

    Raises:
        ValueError — if HUGGINGFACE_API_KEY is not set
        httpx.TimeoutException — if HF model cold-start exceeds 45s
        httpx.HTTPStatusError — if HF API returns an error
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
        "temperature": 0.75,
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

    letter = _clean_output(raw_text)
    if not letter:
        raise RuntimeError("Model returned an empty cover letter. Try again.")

    word_count = len(letter.split())
    tips = _TIPS_CONVERSATIONAL if req.tone == "conversational" else _TIPS_FORMAL
    tip = tips[word_count % len(tips)]

    return CoverLetterResponse(
        cover_letter=letter,
        word_count=word_count,
        model_used=_MODEL,
        tip=tip,
    )
