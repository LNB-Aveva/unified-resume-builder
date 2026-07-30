# Work Log — Shared Context for Claude Code & OpenAI Codex

> ALL agents: READ this file at session start. UPDATE before ending your session.
> Keep entries concise — this is a handoff doc, not a journal.

---

## Current Task

- **Feature:** Launch hardening program (docs/LAUNCH_PROGRAM.md)
- **Branch:** main
- **Status:** CI is green. Remaining launch Blockers are saved resume/version persistence, backend token verification, anonymous score writes bypassing API limits, and AdSense readiness. Follow the refreshed 12-phase program.

---

## Active Session

| Field      | Value                      |
|------------|----------------------------|
| Agent      | codex                      |
| Started    | 2026-07-29                 |
| Working On | CI restored and verified green remotely; next priority is backend JWT enforcement and closing anonymous score writes. |

---

## Session History

<!-- Most recent on top. Keep last 10 sessions. -->

### Session 73 — 2026-07-29
- **Agent:** codex
- **Did:**
  - Fixed all Ruff and mypy failures in conditional Sentry initialization and structured log formatting
  - Split production and development Python manifests; removed unused Semgrep and the vulnerable `mcp`/`click` chain
  - Replaced CI's permanent vulnerability ignore list with fail-closed audits of both manifests
  - Updated PowerShell setup/deployment instructions and dependency threat-model evidence
  - Verified 291 tests at 82.44% coverage, Ruff, mypy, Bandit, secret scanning, both Python audits, CI YAML parsing, all route registration, and a fresh localhost server on port 8770
  - Committed and pushed `c07d905`; GitHub Actions run 30508092537 passed both backend and frontend jobs
  - Ignored generated Playwright `frontend/test-results/` output and closed repository-hygiene finding F18
- **Files Changed:**
  - `backend/app/main.py`, `backend/requirements.txt`, `backend/requirements-dev.txt`
  - `.github/workflows/ci.yml`, `README.md`
  - `docs/DEPLOY.md`, `docs/THREAT-MODEL.md`, `docs/LAUNCH_PROGRAM.md`
  - `.ai-sync/WORKLOG.md`, `.ai-sync/DECISIONS.md`
  - `.gitignore`
- **Next:** Authenticate cost-bearing backend routes and close anonymous `shared_scores` writes
- **Blockers:** None for CI restoration

### Session 72 — 2026-07-29
- **Agent:** codex
- **Did:**
  - Revalidated the Session 71 audit without feature-code changes
  - Confirmed 291 backend tests at 82.44% coverage, frontend lint/build, six Playwright smoke tests, all nine local POST routes, and four live Hugging Face calls
  - Reconfirmed Ruff/mypy failures, four Python advisories, zero production npm advisories but nine High dev-tree advisories, live Vercel/Render wiring, production CORS, missing ads.txt, CSP blockers, and red GitHub Actions
  - Observed a 31.3-second Render cold start and updated `docs/LAUNCH_PROGRAM.md` from `VERIFY` to confirmed risk
  - Reconfirmed production Supabase has `profiles`, `jobs`, and `shared_scores`, but no `resumes` or `resume_versions`; RPC exposure could not be rechecked because the schema root now requires a service-role key
- **Files Changed:**
  - `docs/LAUNCH_PROGRAM.md`
  - `.ai-sync/WORKLOG.md`
- **Next:** Restore green CI first; then authenticate cost-bearing routes and implement saved resume/version persistence with two-user RLS tests
- **Blockers:** Monthly budget ceiling, AdSense publisher/CMP setup, Sentry/uptime/cost dashboards, support contact, backup plan, and production RPC/RLS proof require owner or privileged environment access

### Session 71 — 2026-07-29
- **Agent:** codex
- **Did:**
  - Re-audited all 234 tracked files and refreshed `docs/LAUNCH_PROGRAM.md` into a 12-phase, evidence-based program
  - Installed/verified dependencies; ran 291 backend tests at 82.44% coverage, frontend lint/build, six Playwright smoke tests, Bandit, npm audit, pip-audit, Ruff, and mypy
  - Started a fresh backend and hit all nine routes; all returned 200 with outbound Hugging Face access
  - Verified production frontend, compiled Render API target, backend health, production CORS, security headers, robots, sitemap, and missing ads.txt
  - Verified production Supabase exposes `profiles`, `jobs`, and `shared_scores`; confirmed `resumes` and `resume_versions` are missing
  - Found current `main` CI red, backend AI routes unauthenticated, anonymous direct `shared_scores` writes, CSP-blocked GA4, shallow E2E coverage, stale public stack claims, and current Python advisories
- **Files Changed:**
  - `docs/LAUNCH_PROGRAM.md`
  - `.ai-sync/WORKLOG.md`
  - `.ai-sync/DECISIONS.md`
- **Next:** Restore green CI first; then authenticate cost-bearing routes and implement saved resume/version persistence with two-user RLS tests
- **Blockers:** AdSense publisher ID/certified CMP setup, Sentry DSN/dashboard verification, uptime/cost alarms, backup plan, and monthly budget ceiling require owner input

### Session 70 — 2026-07-29
- **Agent:** claude
- **Did:**
  - Completed remaining `<a>`→`<Link>` conversions across ALL pages (20+ files) — lint 0 errors
  - Raised CI coverage floor from 60% to 80% (verified 82.44%)
  - Phase 6 COMPLETE (all 6 tasks):
    - 6.1: ats-checker full dark mode classes
    - 6.2: Loading states already covered (useLoadingMessages + Spinner)
    - 6.3: 429 rate limit handling added to connectionError()
    - 6.4: Empty states already covered (quick-start guide on tools page)
    - 6.5: WCAG: skip-to-content link, `<main>` landmark, focus-visible ring
    - 6.6: Mobile: all touch targets verified ≥44px from prior sessions
  - Phase 7 started:
    - 7.2: Structured JSON logging middleware (AccessLogMiddleware with request_id, method, path, status, duration_ms, client IP)
  - MobileNav `<a>`→`<Link>` conversion
  - Frontend build clean, 291 backend tests passing
- **Also completed (same session, later commits):**
  - Phase 7: Sentry SDK integration (SENTRY_DSN env var), structured logging
  - Phase 8: statuses updated (sitemap/robots/JSON-LD already done, AdSense/contact BLOCKED)
  - Phase 9: DEPLOY.md created, ENV_VARS.md updated, rollback procedures documented
  - MobileNav `<a>`→`<Link>` fix (8e16510)
- **Commits:** d1a4ea7 (Phase 5), 08cd494 (Phase 6), be0b750 (Phases 7-9), 8e16510 (MobileNav fix)
- **Next:** Phase 10 (Launch) — or unblock pending items

### Session 69 — 2026-07-29
- **Agent:** claude
- **Did:**
  - Completed Phase 4 (Reliability & Performance) — all 6 tasks DONE (commit 555a031)
  - Completed Phase 5 (Tests & CI Hardening) — all 5 tasks DONE
  - 5.1: Golden-file parsing tests — 19 tests for summary/cover-letter/preview `_clean_output()` + regex parsing
  - 5.2: Playwright E2E — 6 smoke tests (landing, footer, keyword-analyzer, ats-checker, blog, privacy)
  - 5.3: Coverage floor — `--cov-fail-under=60` in CI (actual coverage: 82%)
  - 5.4: Frontend lint in CI — `npm run lint` step added, all `<a>`→`<Link>` errors fixed (13+ pages), react-compiler warnings fixed, ResumeExporter unused-var warnings fixed
  - 5.5: Node.js pinned to 20.18 in CI
  - 291 tests passing (up from 272)
- **Files Changed:**
  - `backend/tests/unit/test_ai_parsing.py` (new — 19 golden-file tests)
  - `frontend/tests/e2e/smoke.spec.ts` (new — 6 Playwright smoke tests)
  - `frontend/playwright.config.ts` (new — Playwright config)
  - `.github/workflows/ci.yml` (coverage floor + frontend lint + Node pin)
  - `frontend/src/app/components/AnimatedCounter.tsx` (react-compiler fix)
  - `frontend/src/app/components/ThemeToggle.tsx` (react-compiler fix)
  - `frontend/src/app/components/TypewriterHeadline.tsx` (react-compiler fix)
  - `frontend/src/app/components/HeroScoreCard.tsx` (react-compiler fix)
  - `frontend/src/app/components/BulletRewriter.tsx` (removed unused import)
  - `frontend/src/app/components/ComplianceChecker.tsx` (removed unused import)
  - `frontend/src/app/components/ResumeExporter.tsx` (unused-var lint fix)
  - 13+ page files (`<a>` → `<Link>` conversion)
  - `docs/LAUNCH_PROGRAM.md` (Phase 5 marked complete)
- **Next Steps:**
  - Phase 6: UX & Accessibility
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

---

## Shared Context

- **Stack:** Next.js 16 (frontend/) + FastAPI (backend/) + Supabase auth/db
- **Domain:** resumeai.cv (Vercel deploy)
- **Backend deploy:** Render (render.yaml)
- **Tests:** 291 passing (backend pytest), 82.44% measured services/routes coverage; frontend lint/build and six smoke tests pass locally
- **proxy.ts IS the Next.js middleware** — never recreate middleware.ts
- **Commit rule:** no Co-Authored-By, no AI attribution, ever
- **Localhost rule:** make changes → localhost:3000 → user approves → then commit
- **Tool count:** 9 tools (FAQ names 9 distinct tools — never change without user sign-off)
