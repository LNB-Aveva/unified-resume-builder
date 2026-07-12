---
name: project-resume-code-review
description: "2026-06-29 high-effort code review of AI Resume Generator — 10 confirmed findings, 8 angles, 44 raw candidates"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5ddfbd49-f786-4d69-aa8d-39188197c19f
---

## Code Review Results — AI Resume Generator (2026-06-29)

**Review scope:** Entire codebase (102 files, 15,260 lines) — 8 parallel finder angles, 44 raw candidates, 18 unique after dedup, 10 confirmed.

### 10 Confirmed Findings (severity order):

1. **SECURITY: XSS in JSON-LD** (`page.tsx:117,121`) — `JSON.stringify` without `<` → `<` sanitization. Violates Next.js json-ld.md docs required by `frontend/AGENTS.md`.
2. **BREAKING: Env var name mismatch** (`.env.example:16` + `config.py:39`) — Root docs say `HUGGINGFACE_API_TOKEN`, code reads `HUGGINGFACE_API_KEY`. All 3 AI endpoints 503 if following docs.
3. **SECURITY: DEBUG=True in production** (`config.py:33`) — Default True, `render.yaml` never overrides. Exposes stack traces.
4. **SECURITY: No rate limiting** (`main.py:103`) — All 8 routes including AI endpoints have zero auth/rate limiting. HuggingFace quota drain risk.
5. **CORRECTNESS: ATS score inflated** (`ats_scorer.py:111`) — Empty hard_skills → 100.0 default → 70+ point inflation.
6. **CORRECTNESS: Rewriter silent fallback** (`rewriter.py:124`) — Empty model response → fallback returns unchanged bullets as "rewrites" with no error.
7. **CORRECTNESS: "r" matches "r&d"** (`keyword_extractor.py:43`) — Single-char skill false positive for R programming language.
8. **CORRECTNESS: Phone regex matches dates** (`checker.py:34`) — "2020-2023" matched as phone number.
9. **CORRECTNESS: Pronoun regex too narrow** (`checker.py:36`) — Only 6 phrases; misses "I developed", "I managed", etc.
10. **DATA LOSS: Education field missing** (`ResumeExporter.tsx:155`) — No `<input>` for field of study → always blank in PDF.

### Notable runners-up (not in top 10):
- `GapAnalysis.tsx:79` — catch swallows all errors as "can't connect"
- `job.py:20` — no max_length on raw_text (DoS)
- `ats_scorer.py:143` — score_from_text duplicates score_resume
- 3x duplicated HF API client code
- `ai_modules/` entirely dead scaffolding
- `ComplianceRequest` defined in route instead of schemas

### Refuted (2):
- BulletRewriter RegExp g+test() lastIndex bug — REFUTED (split resets lastIndex)
- Empty missing_keywords guard — REFUTED (documented design decision)

### All 10 Fixed (2026-06-29):
1. `page.tsx:117,121` — Added `.replace(/</g, '\\u003c')` to both JSON-LD blocks
2. `.env.example:16` + `config.py:39` — Renamed to `HUGGINGFACE_API_KEY` everywhere
3. `config.py:33` — Changed DEBUG default from `True` to `False`
4. `summary.py`, `rewrite.py`, `cover_letter.py` — Added slowapi rate limiting (10/min per IP) + added slowapi to requirements.txt
5. `ats_scorer.py:111` — Changed empty-skills default from 100.0 to 0.0 (both score_resume and score_from_text)
6. `rewriter.py:124` — Fallback now returns empty list when model returns no content, triggering RuntimeError
7. `keyword_extractor.py:43` — Replaced single-char `"r"` with `"r language"`, `"r programming"`
8. `checker.py:34` — Changed phone regex min length from 5 to 7 to avoid matching date ranges
9. `checker.py:36` — Replaced 6-phrase hardcoded list with `I\s+[a-z]+\b` pattern to catch all first-person constructions
10. `ResumeExporter.tsx` — Added Field of Study `<input>` that maps to `edu.field`

**Why:** Baseline quality audit before deploying to production. [[project-ai-resume-generator]]
**How to apply:** All fixes applied. Run backend tests and frontend build to verify no regressions.
