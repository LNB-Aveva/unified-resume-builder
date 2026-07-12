---
name: project-resume-session10-07022026
description: Session 10 (2026-07-02) — Applied all HIGH+MEDIUM security fixes from audit + deep code review found 10 logic/edge-case issues
metadata: 
  node_type: memory
  type: project
  originSessionId: e8e96539-04d0-40e9-8079-20a5d7e811f1
---

## ResumeAI Session 10 — 2026-07-02

### Part 1: Security Fixes Applied (12 findings from Session 9 audit)

#### HIGH Priority (4 fixes applied)

1. **Error detail leakage fixed** — 4 route files (summary.py, rewrite.py, cover_letter.py, export.py)
   - Replaced internal error details with generic messages, added `logger.error()` for server-side logging
   - Also replaced `ValueError` detail leakage (was exposing API key setup instructions)

2. **Input size limits added** — 8 schema files
   - `max_length=50_000` on large text fields, `max_length=200` on names/titles
   - `max_length=320` on email, `max_length=500` on URLs, `ge=0, le=60` on years_experience
   - Files: job.py, gap.py, summary.py, rewriter.py, cover_letter.py, export.py, compliance.py, resume.py

3. **Rate limiting added to all 8 endpoints** — 5 previously unprotected
   - analyze/score/gap/compliance: `30/minute`, export: `15/minute`
   - summary/rewrite/cover_letter already had `10/minute`
   - Route params renamed (score_req, gap_req, comp_req, export_req) to avoid `request: Request` conflict

4. **Prompt injection sanitizer** — new file `backend/app/services/ai/sanitizer.py`
   - Applied to summarizer.py, rewriter.py, cover_letter.py
   - **BUG FOUND IN REVIEW**: strips "system:", "user:" from legitimate text (see Part 2, Finding #3)

#### MEDIUM Priority (3 fixes applied)

5. **FastAPI /docs disabled in production** — main.py checks `RENDER` or `ENV=production`
6. **CORS tightened** — methods `[GET, POST, OPTIONS]`, headers `[Content-Type, Authorization]`
7. **CSP + security headers** — frontend/next.config.ts: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### Part 2: Deep Code Review — 10 Findings

Full codebase review of all routes, services, schemas, and frontend components.

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | **HIGH** | ats_scorer.py:110-115 | Score capped at 30% for soft-skill-only jobs (30 = 0*0.7 + 100*0.3). Entire job categories (PM, HR, management) get wrong scores. Fix: redistribute weight across existing skill types. |
| 2 | **HIGH** | sanitizer.py:10 | Strips "system:", "user:" from legitimate resume text. "End user: Managed support" becomes "End Managed support". Fix: anchor pattern to line-start or standalone occurrence. |
| 3 | **MEDIUM** | checker.py:216 | Compliance score weights all 15 checks equally. 4 critical failures + 11 passes = 73% which looks decent. Should penalize critical failures more. |
| 4 | **MEDIUM** | keyword_extractor.py:46 | "go" in HARD_SKILLS matches English word "go" as false positive. |
| 5 | **MEDIUM** | pdf_generator.py:68-77 | _two_col() clips long job titles silently (cell() doesn't wrap). |
| 6 | **MEDIUM** | pdf_generator.py:54-55 | Non-Latin chars become "?" silently. "Jose Garcia" renders as "Jos? Garc?a". |
| 7 | **LOW** | keyword_extractor.py:34 | spaCy loaded at startup (200ms + 12MB) but never called. Dead dependency. |
| 8 | **LOW** | ats_scorer.py:103-108 | Each skill regex runs 2x (matched + missing as separate comprehensions). |
| 9 | **LOW** | keyword_extractor.py:157 | Only "-" bullets extracted; misses bullet chars used in compliance checker. |
| 10 | **LOW** | GapAnalysis.tsx:44 | API URL falls to localhost when env var missing — silent production failure. |

### Files Modified This Session (17 files + 1 new)

**Backend routes:** main.py, analyze.py, score.py, gap.py, compliance.py, export.py, summary.py, rewrite.py, cover_letter.py
**Schemas:** job.py, gap.py, summary.py, rewriter.py, cover_letter.py, export.py, resume.py
**AI services:** summarizer.py, rewriter.py, cover_letter.py
**New file:** sanitizer.py
**Frontend:** next.config.ts

### Build: All 19 Python files pass py_compile. Frontend config transpiles cleanly.

### NOT YET DONE
1. **CRITICAL**: Rotate Supabase service_role key (user action)
2. Fix code review findings #1 (ATS score formula) and #2 (sanitizer regex) — HIGH priority
3. Fix findings #3-6 (MEDIUM)
4. Commit + push all changes (17 modified + 1 new file)
5. Remove spaCy dependency (finding #7)

**Why:** Security hardening complete, deep review surfaced logic flaws in scoring engine and new sanitizer code.

See [[project-resume-session9-07012026]]
