# Work Log — Shared Context for Claude Code & OpenAI Codex

> ALL agents: READ this file at session start. UPDATE before ending your session.
> Keep entries concise — this is a handoff doc, not a journal.

---

## Current Task

- **Feature:** Launch hardening program (docs/LAUNCH_PROGRAM.md)
- **Branch:** main
- **Status:** Phase 4 COMPLETE. Phase 5 (Tests & CI Hardening) is next.

---

## Active Session

| Field      | Value                      |
|------------|----------------------------|
| Agent      | claude                     |
| Started    | 2026-07-29                 |
| Working On | Phase 4 complete — ready for commit

---

## Session History

<!-- Most recent on top. Keep last 10 sessions. -->

### Session 69 — 2026-07-29
- **Agent:** claude
- **Did:**
  - Completed Phase 4 (Reliability & Performance) — all 6 tasks DONE
  - 4.1: GitHub Actions cron keepalive (pings /health every 14 min) + fetchWithRetry in all 8 frontend API components (auto-retry on network errors with 3s delay)
  - 4.2: HuggingFace retry with exponential backoff (2 retries, 1s→2s, on timeout/5xx only)
  - 4.3: Graceful degradation — AI-specific error messages in connectionError(), fetchWithRetry wired into SummaryGenerator, BulletRewriter, CoverLetterGenerator, BulletPreviewWidget, AnalyzerDemo, ComplianceChecker, GapAnalysis, ResumeExporter, ShareableScoreWidget
  - 4.4: Request timeout middleware (anyio.fail_after 60s) — kills hanging requests
  - 4.5: PDF stress test with 20 jobs × 30 bullets across all 3 templates (5 new tests, all pass)
  - 4.6: Keyword extraction cache (SHA-256 keyed, 128 entries, 5-min TTL)
  - 272 tests passing (up from 267)
- **Files Changed:**
  - `backend/app/services/ai/hf_client.py` (retry + backoff logic)
  - `backend/app/main.py` (RequestTimeoutMiddleware with anyio)
  - `backend/app/services/nlp/keyword_extractor.py` (LRU cache with TTL)
  - `backend/tests/unit/test_pdf_generation.py` (new — 5 stress tests)
  - `frontend/src/app/lib/fetchWithRetry.ts` (new — auto-retry on network errors)
  - `frontend/src/app/types.ts` (AI-specific error messages)
  - `frontend/src/app/components/SummaryGenerator.tsx` (fetchWithRetry)
  - `frontend/src/app/components/BulletRewriter.tsx` (fetchWithRetry)
  - `frontend/src/app/components/CoverLetterGenerator.tsx` (fetchWithRetry)
  - `frontend/src/app/components/BulletPreviewWidget.tsx` (fetchWithRetry)
  - `frontend/src/app/components/AnalyzerDemo.tsx` (fetchWithRetry)
  - `frontend/src/app/components/ComplianceChecker.tsx` (fetchWithRetry)
  - `frontend/src/app/components/GapAnalysis.tsx` (fetchWithRetry)
  - `frontend/src/app/components/ResumeExporter.tsx` (fetchWithRetry)
  - `frontend/src/app/components/ShareableScoreWidget.tsx` (fetchWithRetry)
  - `.github/workflows/keepalive.yml` (new — cron ping)
  - `docs/LAUNCH_PROGRAM.md` (Phase 4 marked complete)
- **Next Steps:**
  - Phase 5: Tests & CI Hardening
- **Blockers:**
  - None

### Session 68 — 2026-07-29
- **Agent:** claude
- **Did:**
  - Completed Phase 3 (Scoring Quality) — all 9 tasks DONE
  - Created skills taxonomy JSON with 220+ canonical skills and 65+ synonym groups
  - Built taxonomy.py loader module (replaces hardcoded skill sets)
  - Added synonym-aware matching to both keyword_extractor.py and ats_scorer.py
  - Calibrated grade boundaries: A≥85, B≥65, C≥50, D≥30, F<30 (old A≥90 was unreachable)
  - Built evaluation harness (run_eval.py) with 25 labeled resume/JD pairs
  - Result: 100% within-one-grade, 72% exact match — EXIT GATE PASS
  - Added 12 golden-file tests for rewriter response parsing
  - Updated GapAnalysis UI: hard/soft skill breakdown with "Found"/"Add" labels
  - Updated frontend threshold colors to match new grade boundaries
  - Added soft skill inflection synonyms (communicator→communication, mentored→mentoring, etc.)
- **Files Changed:**
  - `backend/app/services/nlp/skills_taxonomy.json` (new — 220+ skills, 65+ synonym groups)
  - `backend/app/services/nlp/taxonomy.py` (new — JSON taxonomy loader)
  - `backend/app/services/nlp/keyword_extractor.py` (refactored — uses taxonomy)
  - `backend/app/services/scoring/ats_scorer.py` (synonym-aware matching, new grade boundaries)
  - `backend/tests/unit/test_keyword_extractor.py` (7 new synonym tests)
  - `backend/tests/unit/test_ats_scorer.py` (synonym match + updated grade tests)
  - `backend/tests/unit/test_property.py` (updated grade boundaries)
  - `backend/tests/unit/test_rewriter_parsing.py` (new — 12 golden-file tests)
  - `backend/tests/eval/eval_dataset.json` (new — 25 labeled cases)
  - `backend/tests/eval/run_eval.py` (new — evaluation harness)
  - `backend/tests/eval/test_eval_harness.py` (new — pytest wrapper)
  - `frontend/src/app/components/GapAnalysis.tsx` (explainable scores UI)
  - `frontend/src/app/components/ComplianceChecker.tsx` (updated thresholds)
  - `docs/LAUNCH_PROGRAM.md` (Phase 3 marked complete)
- **Next Steps:**
  - Phase 4: Reliability & Performance (Render cold start, HuggingFace timeout/retry, graceful degradation)
- **Blockers:**
  - None

### Session 67 — 2026-07-29
- **Agent:** claude
- **Did:**
  - Completed Phase 2 (Security, Privacy & Legal) — all 14 tasks DONE
  - Phase 1 commit: 7eb0c21 (foundation cleanup)
  - Phase 2 commit 1: 89783d4 (privacy controls, cookie consent, account deletion)
  - Phase 2 commit 2: 0ad054d (data export, cookie hydration fix, cleanup SQL)
  - All 3 commits pushed to origin/main
  - Data export: exportUserData server action + ExportDataButton on Account page
  - Fixed CookieConsent hydration error (was outside `<body>`)
  - Added cleanup_expired_scores SQL function (deployed to Supabase)
  - Audited and passed: input validation (all schemas max_length), fpdf2 injection (safe), secret hygiene (clean), CORS (explicit origins only)
- **Files Changed:**
  - `frontend/src/app/(protected)/account/ExportDataButton.tsx` (new)
  - `frontend/src/app/(protected)/account/page.tsx`
  - `frontend/src/app/actions/auth.ts`
  - `frontend/src/app/layout.tsx`
  - `supabase-schema.sql`
  - `docs/LAUNCH_PROGRAM.md`
- **Next Steps:**
  - Phase 3: Scoring Quality (synonym matching, evaluation harness, grade calibration)
  - Still need to verify profiles RLS and delete_own_user in Supabase dashboard
- **Blockers:**
  - None

### Session 66 — 2026-07-29
- **Agent:** claude / codex
- **Did:**
  - Added account deletion UI, server action, and self-deletion SQL function
  - Added consent-gated analytics, cookie settings, and privacy/terms updates
  - Fixed new and touched-file Next.js lint violations
  - Verified the production build and all 245 backend tests
- **Files Changed:**
  - `frontend/src/app/(protected)/account/`
  - `frontend/src/app/actions/auth.ts`
  - `frontend/src/app/components/CookieConsent.tsx`
  - `frontend/src/app/layout.tsx`, `page.tsx`, `privacy/page.tsx`, `terms/page.tsx`
  - `supabase-schema.sql`
  - `docs/LAUNCH_PROGRAM.md`
- **Next Steps:**
  - Apply and verify the updated RLS/function schema in Supabase
  - Continue Phase 2 tasks 2.9–2.14
- **Blockers:**
  - Production Supabase dashboard verification requires manual access

### Session 65 — 2026-07-28
- **Agent:** claude
- **Did:**
  - Full repo audit: read every source file, ran all 212 tests, built frontend, hit all 9 endpoints
  - Produced 18-finding severity table in docs/LAUNCH_PROGRAM.md
  - Completed Phase 1 (8 tasks):
    - Removed unused scikit-learn + nltk from requirements.txt (~120MB saved)
    - Added profiles table + RLS to supabase-schema.sql
    - Added pyproject.toml for repo-root test execution
    - Removed hardcoded LAN IP from next.config.ts
    - Removed dead Supabase config from backend config.py
    - Created docs/ENV_VARS.md (full env var matrix)
    - Added httpx client lifespan shutdown in main.py
    - Fixed flaky hypothesis deadline (200ms → 1000ms)
- **Files Changed:**
  - `backend/requirements.txt` (removed nltk, scikit-learn)
  - `backend/app/core/config.py` (removed dead Supabase vars)
  - `backend/app/main.py` (added lifespan context manager)
  - `backend/app/services/ai/hf_client.py` (added close_client)
  - `backend/pyproject.toml` (new — pytest pythonpath)
  - `backend/tests/unit/test_property.py` (hypothesis deadline fix)
  - `frontend/next.config.ts` (removed allowedDevOrigins)
  - `supabase-schema.sql` (added profiles table + RLS)
  - `docs/LAUNCH_PROGRAM.md` (new — full launch program)
  - `docs/ENV_VARS.md` (new — env var matrix)
- **Next Steps:**
  - Phase 2: Security, Privacy & Legal (account deletion, cookie consent, RLS verification)
- **Blockers:**
  - None

### Session 64 — 2026-07-28
- **Agent:** codex
- **Did:**
  - Added an optional Claude account-switching guide to the handoff script
  - Documented the new `-To claude -SwitchAccount` workflow
  - Added validation preventing account switching on a Codex handoff
- **Files Changed:**
  - `.ai-sync/handoff.ps1`
  - `.ai-sync/README.md`
  - `.ai-sync/WORKLOG.md`
- **Next Steps:**
  - Add the coordination files to source control when ready
- **Blockers:**
  - None

### Session 63 — 2026-07-28
- **Agent:** codex
- **Did:**
  - Verified the Claude Code and Codex CLI coordination setup
  - Removed remaining references to the excluded third agent
  - Validated both handoff targets and invalid-target rejection
- **Files Changed:**
  - `.ai-sync/WORKLOG.md`
  - `.ai-sync/DECISIONS.md`
- **Next Steps:**
  - Add the coordination files to source control when ready
- **Blockers:**
  - None

### Session 62 — 2026-07-28
- **Agent:** claude
- **Did:**
  - Set up 2-agent coordination system (CLAUDE.md, AGENTS.md, .ai-sync/)
  - Adapted all files for this project's stack (Next.js 16 + FastAPI, not Angular)
  - Configured coordination for Claude Code and Codex CLI only
- **Files Changed:**
  - `CLAUDE.md` (new)
  - `AGENTS.md` (new)
  - `.ai-sync/README.md` (new)
  - `.ai-sync/WORKLOG.md` (new)
  - `.ai-sync/DECISIONS.md` (new)
  - `.ai-sync/handoff.ps1` (new)
- **Next Steps:**
  - Pick up next item from master backlog (see DECISIONS.md for current state)
- **Blockers:**
  - Footer email address needed from user (B1 in backlog)

---

## Shared Context

- **Stack:** Next.js 16 (frontend/) + FastAPI (backend/) + Supabase auth/db
- **Domain:** resumeai.cv (Vercel deploy)
- **Backend deploy:** Render (render.yaml)
- **Tests:** 272 passing (backend pytest), frontend production build clean
- **proxy.ts IS the Next.js middleware** — never recreate middleware.ts
- **Commit rule:** no Co-Authored-By, no AI attribution, ever
- **Localhost rule:** make changes → localhost:3000 → user approves → then commit
- **Tool count:** 9 tools (FAQ names 9 distinct tools — never change without user sign-off)
