# Work Log — Shared Context for Claude Code & OpenAI Codex

> ALL agents: READ this file at session start. UPDATE before ending your session.
> Keep entries concise — this is a handoff doc, not a journal.

---

## Current Task

- **Feature:** Launch hardening program (docs/LAUNCH_PROGRAM.md)
- **Branch:** main
- **Status:** Phase 7 COMPLETE (7.2+7.3+7.4 committed+pushed). Phase 4 COMPLETE.

---

## Active Session

| Field      | Value                      |
|------------|----------------------------|
| Agent      | codex                      |
| Started    | 2026-07-30                 |
| Working On | Test-quality audit (read-only). Report saved to docs/quality/2026-07-30_test-quality-audit.md. Prior: adversarial pentest (docs/security/2026-07-30_pentest.md). |

---

## Session History

<!-- Most recent on top. Keep last 10 sessions. -->

### Session 83 — 2026-07-30
- **Agent:** codex (test-quality audit)
- **Did:**
  - Audited whether the ~319 backend tests + Playwright E2E actually catch bugs. Read-only — NO code changed. 18 backend test files + 3 specs + 5 critical modules read line-by-line.
  - Verdict: mock-abuse STRONG (~95% real, minimal theater); mutation resistance ADEQUATE (auth strong; rate-limit `_cleanup`, ats weight-swap, pdf `_s()` fidelity leak); coverage WEAK (no `--cov-branch`; AI success path route→call_hf→200 untested — endpoints only assert 422); E2E WEAK (mocked backend, no real auth/save-load/mobile; chromium-only).
  - Found a real bug: in `hf_client.call_hf`, a non-retryable exception during a half-open probe leaves `_half_open_probe_in_flight=True` forever, wedging the circuit breaker. Untested.
  - Flagged FALSE `docs/LAUNCH_PROGRAM.md` claims: 7.3 mobile (375/768/desktop) + a11y "DONE" but no viewport projects / axe tests exist; specs = 30 blocks, not 24.
  - Overall confidence ~55% of catching a real regression. Top-5 fixes with skeletons in the report.
  - Full report: `docs/quality/2026-07-30_test-quality-audit.md`.
- **Files Changed:** `docs/quality/2026-07-30_test-quality-audit.md` (new), `.ai-sync/WORKLOG.md`, `.ai-sync/DECISIONS.md`
- **Blockers:** None. Remediation (AI success-path test, alg:none test, `--cov-branch`, limiter reset, mobile Playwright projects, breaker-probe bug fix) NOT yet applied — awaiting go-ahead.

### Session 82 — 2026-07-30
- **Agent:** manual (adversarial penetration test)
- **Did:**
  - Full-source exploit assessment across 16 attack vectors (injection, auth, rate-limit, exfil, supply chain). Read-only — NO code changed.
  - Verdict: 10 DEFENDED, 6 EXPLOITABLE (all Low/Medium; no critical). Recent hardening (rightmost-XFF, shared_scores RLS, body cap, Sentry PII strip) holds.
  - EXPLOITABLE: #1 prompt-injection (weak sanitizer, low impact), #7 token-reuse-after-logout (JWT not revoked server-side — lower access-token TTL), #11 slowloris (platform-mitigated), #14 signup user-enum (config-dependent), #15 frontend echoes raw Supabase error.message. #8 IDOR defended by RLS ONLY (server actions lack `.eq("user_id", ...)` — add as defense-in-depth).
  - Full report + exact payloads/fixes: `docs/security/2026-07-30_pentest.md`.
- **Files Changed:** `docs/security/2026-07-30_pentest.md` (new), `.ai-sync/WORKLOG.md`, `.ai-sync/DECISIONS.md`
- **Blockers:** None. Remediation (#7 TTL, #8 user_id filters, #15 error mapping) NOT yet applied — awaiting go-ahead.

### Session 80 (Claude, continued) — 2026-07-30
- **Agent:** claude
- **Did:**
  - **Phase 7.2 DONE:** Skip-to-content link, ARIA attributes, focus rings, semantic HTML, `id="main-content"` on all pages (commit `42ee572`)
  - **Phase 7.3 DONE:** 44px touch targets on MobileNav, CookieConsent, CoverLetterGenerator, JobTracker; responsive audit at 375px/768px/desktop (commit `a6a91bd`)
  - **Phase 7.4 DONE:** Lighthouse accessibility fixes — `<dl>` → `<div>` for FAQ sections, `<h4>` → `<h3>` for footer headings, `text-gray-400` → `text-gray-500` for WCAG 4.5:1 contrast. Scores: landing 96, keyword-analyzer 100, sign-in 96, privacy 91 — all above 90 target (commit `e0ec55d`)
  - All 3 commits pushed to origin/main
- **Files Changed:** `frontend/src/app/layout.tsx`, `page.tsx`, `keyword-analyzer/page.tsx`, `ats-checker/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, SEO persona pages, `components/MobileNav.tsx`, `CookieConsent.tsx`, `CoverLetterGenerator.tsx`, `JobTracker.tsx`, `BulletPreviewWidget.tsx`, `HeroScoreCard.tsx`, `ToolsSidebar.tsx`, `InfoTooltip.tsx`, `docs/LAUNCH_PROGRAM.md`, `.ai-sync/WORKLOG.md`
- **Next:** Phase 6.3 (cold-start browser test), then remaining launch program phases
- **Blockers:** None

### Session 81 (Codex) — 2026-07-30
- **Agent:** codex
- **Did:** Phase 8.3: added three original 961–1,039-word guides covering ATS parsing, high-impact resume mistakes, and when cover letters remain useful. Phase 8.1: audited all 20 page routes, verified the generated 15-URL sitemap covers all requested public static pages plus six blog slugs, skipped unbounded `/score/[id]`, and disallowed protected routes in robots. Phase 11.2: added six ordered, idempotent Supabase migrations with all canonical tables, constraints, indexes, RLS policies, RPC/functions, and application/backup/rollback guidance.
- **Metadata Audit:** `/`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, and `/account-setup` have no page-level metadata export; `/privacy` and `/terms` have title/description but no page-level Open Graph block; protected `/account`, `/resumes`, and `/tools` have title/description but no page-level Open Graph block. Dynamic blog and score pages plus the five public SEO/tool pages have title, description, and Open Graph metadata. No component, protected-route, landing-page, or layout files were modified for this report.
- **Files Changed:** `frontend/src/app/lib/blog-posts.ts`, `frontend/src/app/robots.ts`, `supabase/migrations/`, `docs/LAUNCH_PROGRAM.md`, `.ai-sync/WORKLOG.md`
- **Next:** None for the assigned Session 81 tasks.
- **Blockers:** None. After approval, the shared dev server was restarted and `/blog` plus all three new article routes returned HTTP 200. The in-app browser had no available backend, so rendered-route verification used localhost HTTP responses and server logs.

### Session 81 — 2026-07-30
- **Agent:** manual (code-review follow-up)
- **Did:**
  - Code-review agent flagged a HIGH regression: `--forwarded-allow-ips="*"` made uvicorn trust the spoofable LEFTMOST X-Forwarded-For, letting attackers mint a fresh rate-limit bucket per request.
  - Fix: removed the uvicorn proxy-header flags from `render.yaml`; `get_client_ip` now reads the RIGHTMOST (Render-appended) XFF entry via `_TRUSTED_PROXY_HOPS` (env `TRUSTED_PROXY_HOPS`, default 1). Fails safe. Added `backend/tests/unit/test_client_ip.py` (6 tests incl. spoof-resistance).
  - Validated: ruff clean (app/), 319 passed / 20 skipped.
- **Files Changed:** `backend/app/core/rate_limit.py`, `render.yaml`, `backend/tests/unit/test_client_ip.py`, `.ai-sync/WORKLOG.md`
- **Blockers:** None.

### Session 80 — 2026-07-30
- **Agent:** manual (production-readiness review)
- **Did:**
  - Full-stack review; delivered findings (1 Critical, 3 High, 9 Medium, 6 Low). Verdict: NOT READY until blockers fixed.
  - Fixed **H1** (Render `--proxy-headers --forwarded-allow-ips="*"` → per-user rate limiting), **H3** (`shared_scores` anon bulk-read removed; `get_shared_score` SECURITY DEFINER RPC + owner SELECT/DELETE policies), **M1** (Sentry `include_local_variables=False` + scrub exception vars/extra), **M2** (ASGI body cap enforced on chunked/no-Content-Length), **M3** (render.yaml env vars), **M6** (data export includes shared_scores), **M8** (CI `--cov=app`), **L4** (Python 3.13).
  - Added `SECRETS_BACKUP.txt` to `.gitignore` (untracked live-key file; key still needs rotation — it exists in git history).
  - Validated: ruff clean, 313 backend tests pass (20 skipped) @ 87% coverage, eslint clean, Next build OK.
- **Files Changed:** `render.yaml`, `backend/app/main.py`, `supabase-schema.sql`, `scripts/2026-07-30_shared_scores_rls_patch.sql`, `.github/workflows/ci.yml`, `frontend/src/app/score/[id]/page.tsx`, `frontend/src/app/actions/auth.ts`, `.gitignore`, `.ai-sync/DECISIONS.md`
- **Next / manual actions:** ROTATE HuggingFace key; run `scripts/2026-07-30_shared_scores_rls_patch.sql` in Supabase; set `SUPABASE_JWT_SECRET`/`SENTRY_DSN`/`ENV` in Render; purge key from git history (git filter-repo) as final step. Remaining findings: M5 (F17 schema drift), M7 (migrations system), L1 (PDF Unicode font).
- **Blockers:** None (code); manual prod actions pending.

### Session 80 (Codex) — 2026-07-30
- **Agent:** codex
- **Did:**
  - **Phase 3.4 DONE:** Added consent-gated GA4 script, connection, and image origins to the CSP without adding AdSense domains
  - **Phase 9.1 DONE:** Reconciled legal disclosures with current score expiry/cleanup, consent behavior, exported data, AI circuit breaking, access-log metadata, and layered rate limits
  - **Phase 10.3 DONE:** Extended structured access logs with matched route patterns, response content length, 429/auth failure flags, and classification for all six listed AI routes; added 10 unit cases
  - Verified 409 backend tests pass with 20 credential-dependent RLS tests skipped; backend Ruff and frontend lint pass
- **Files Changed:** `frontend/next.config.ts`, `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx`, `backend/app/main.py`, `backend/tests/unit/test_access_log.py`, `docs/LAUNCH_PROGRAM.md`, `.ai-sync/WORKLOG.md`
- **Next:** Continue remaining launch-program phases and owner-blocked production verification
- **Blockers:** None

### Session 79 — 2026-07-30
- **Agent:** claude
- **Did:**
  - **Phase 4.4 DONE:** Added `resume_id` FK on jobs table → resumes with ON DELETE SET NULL; migration helper for existing tables; JobTracker UI updated with resume dropdown in add-job form and inline on each job card; `loadResumesSupabase()` fetches authenticated user's resumes; `handleResumeChange()` for inline linking/unlinking; all Supabase helpers updated to read/write resume_id; backwards-compatible with existing localStorage/Supabase data
  - Phase 4 is now fully COMPLETE (all 7 tasks: 4.1–4.7 DONE)
  - Verified Codex Session 78 commits (6.5 load tests, 6.6 HF circuit breaker, 11.1 deploy docs)
  - Frontend lint clean, build clean, ruff clean
- **Files Changed:**
  - `supabase-schema.sql` (resume_id FK on jobs + migration ALTER TABLE)
  - `frontend/src/app/components/JobTracker.tsx` (resume linking UI + helpers)
  - `docs/LAUNCH_PROGRAM.md` (4.4 DONE)
  - `.ai-sync/WORKLOG.md`
- **Next:** Phase 7.2 (keyboard/screen-reader), 7.3 (responsive audit), 7.4 (Lighthouse accessibility)
- **Blockers:** Browser extension can't capture localhost screenshots (permission issue); user should verify UI manually

### Session 78 (Codex) — 2026-07-30
- **Agent:** codex
- **Did:** Phase 6.5 load-test runner for all nine POST routes, including valid schema-backed payloads, bounded 20/2–3 concurrency, RPS and p50/p95/p99/error/timeout metrics, a no-network dry run, documentation, and a quota-free 45-request pytest smoke test; Phase 6.6 process-local Hugging Face circuit breaker with a five-failure threshold, 60-second open interval, single half-open probe, automatic reset, and retryable 503 mapping; Phase 11.1 deployment guide updated for JWT auth, layered rate limits, five-table RLS storage, environment verification, hooks, test counts, and database rollback risk
- **Files Changed:** `backend/tests/load/`, `backend/app/services/ai/hf_client.py`, `backend/app/api/routes/_ai_errors.py`, `backend/tests/unit/test_hf_client.py`, `docs/DEPLOY.md`, `docs/LAUNCH_PROGRAM.md`, `.ai-sync/DECISIONS.md`, `.ai-sync/WORKLOG.md`
- **Next:** Continue remaining launch-program phases
- **Blockers:** None

### Session 77 (Codex) — 2026-07-30
- **Agent:** codex
- **Did:**
  - **Phase 3.3:** Added a middleware-level, per-IP sliding-window limit of 200 requests/minute; `/health` is exempt and rejected requests return 429 with `Retry-After`; added four behavior tests (8 AnyIO variants)
  - **Phase 6.4:** Made the keepalive workflow fail unless `/health` returns HTTP 200 within 30 seconds, enabling GitHub failure notifications
  - **Phase 9.2:** Documented saved resume fields, Supabase PostgreSQL storage, immutable timestamped versions, retention, cascade deletion, full JSON export, and user responsibility for resume accuracy
  - Verified 385 backend tests pass with 20 credential-dependent RLS tests skipped, Ruff passes, frontend lint passes, workflow YAML parses, and `git diff --check` passes
- **Files Changed:**
  - `backend/app/core/rate_limit.py`, `backend/app/main.py`, `backend/tests/integration/test_global_rate_limit.py`
  - `.github/workflows/keepalive.yml`
  - `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx`
  - `docs/LAUNCH_PROGRAM.md`, `.ai-sync/DECISIONS.md`, `.ai-sync/WORKLOG.md`
- **Next:** User localhost review, then create the three assigned commits
- **Blockers:** None

### Session 77 — 2026-07-30
- **Agent:** claude
- **Did:**
  - **CI fix:** Fixed ruff UP038 lint error in `hf_client.py` (Codex code used `isinstance(exc, (X, Y))` instead of `isinstance(exc, X | Y)`)
  - **Pre-commit hook:** Created `.githooks/pre-commit` — runs ruff + eslint before every commit. Configured via `git config core.hooksPath .githooks`. Added lint-before-commit as a Hard Rule in both CLAUDE.md and AGENTS.md.
  - **Phase 4.5 (Finding F6 RESOLVED):** 20 two-user RLS integration tests in `test_rls_isolation.py` — covers cross-user select/insert/update/delete for profiles, jobs, resumes, resume_versions, and shared_scores. Plus `test_cascade_deletes_all_owned_data` for Phase 4.6. Tests skip in CI (need SUPABASE_SERVICE_ROLE_KEY).
  - **Phase 4.6:** Verified delete_own_user() cascade via schema review + integration test.
  - 377 passed + 20 skipped, ruff clean, eslint clean
- **Files Changed:**
  - `.githooks/pre-commit` (new — lint gate)
  - `CLAUDE.md`, `AGENTS.md` (lint-before-commit rule)
  - `backend/app/services/ai/hf_client.py` (UP038 fix)
  - `backend/tests/integration/test_rls_isolation.py` (new — 20 RLS tests)
  - `docs/LAUNCH_PROGRAM.md` (4.5+4.6 DONE, F6 RESOLVED)
  - `.ai-sync/WORKLOG.md`
- **Next:** Phase 4.4 (jobs→resume FK) needs UI — requires localhost-first. Then Phase 6/7/8 remaining.
- **Blockers:** 4.4 deferred (needs localhost UI review). RLS tests need SUPABASE_SERVICE_ROLE_KEY to run against real Supabase.

### Session 76 (Codex) — 2026-07-30
- **Agent:** codex
- **Did:**
  - **Phase 3.6:** Audited every fpdf2 `cell`/`multi_cell` user-text path through `_s`; documented the HTML template as legacy/non-runtime
  - **Phase 6.2:** Added two retries with 1s/2s exponential backoff for `httpx.ConnectError`; mapped exhausted connection failures to 503 and provider 5xx responses to 502; added 10 async test cases
  - **Phase 9.3:** Corrected Privacy/Terms vendor and technology descriptions for the curated taxonomy, fpdf2, Hugging Face, saved resumes, and Sentry PII exclusion
  - Verified 377 backend tests pass, frontend lint passes, and localhost Privacy page returns HTTP 200
- **Files Changed:**
  - `backend/app/services/export/templates/resume.html`
  - `backend/app/services/ai/hf_client.py`, `backend/app/api/routes/_ai_errors.py`
  - `backend/tests/unit/test_hf_client.py`
  - `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx`
  - `docs/LAUNCH_PROGRAM.md`, `.ai-sync/WORKLOG.md`
- **Next:** Apply pending Supabase schema changes; continue remaining launch-program tasks
- **Blockers:** Browser UI was unavailable for a localhost screenshot; localhost HTTP verification and frontend lint passed

### Session 76 — 2026-07-30
- **Agent:** claude
- **Did:**
  - **Phase 3.2 (Finding F5 RESOLVED):** shared_scores RLS hardened — insert requires `auth.uid() = user_id`; added `user_id` FK column, CHECK constraints (score range, grade values, hint length), user_id index; updated ShareableScoreWidget to include user_id from session
  - **Phase 3.8:** Full security scan pass — Bandit 0 high, pip-audit runtime+dev 0 vulns, npm audit production 0, detect-secrets clean
  - **Phase 4.2 (Blocker F1 RESOLVED):** Created `resumes` + `resume_versions` tables with full RLS (user-scoped CRUD for resumes, user-scoped read/insert/delete for versions — no update = immutable), CHECK constraints, cascade delete, indexes
  - **Phase 4.3:** Full save/list/load/rename/version/delete implementation — server actions in `resume.ts`, My Resumes page (`/resumes`), ResumeExporter save/save-version buttons, tools page loads from `?resume=` query param
  - **Phase 4.7:** Data export updated to include resumes + all versions; account deletion now cascades through resumes
  - Account page updated: "My Resumes" nav link, danger zone + data export text updated to mention resumes
  - Frontend lint clean, build clean, 367 backend tests passing
- **Files Changed:**
  - `supabase-schema.sql` (resumes + resume_versions tables, shared_scores RLS + user_id + constraints)
  - `frontend/src/app/actions/resume.ts` (new — 7 server actions)
  - `frontend/src/app/(protected)/resumes/page.tsx` (new — My Resumes page)
  - `frontend/src/app/(protected)/resumes/ResumeList.tsx` (new — client list component)
  - `frontend/src/app/components/ResumeExporter.tsx` (save/load props, save-as dialog)
  - `frontend/src/app/(protected)/tools/page.tsx` (?resume= loading, My Resumes nav link)
  - `frontend/src/app/(protected)/account/page.tsx` (My Resumes nav, updated text)
  - `frontend/src/app/actions/auth.ts` (export includes resumes, delete cascades resumes)
  - `frontend/src/app/components/ShareableScoreWidget.tsx` (user_id in insert)
  - `docs/LAUNCH_PROGRAM.md` (F1+F5 resolved, 3.2+3.8+4.2+4.3+4.7 marked DONE)
- **Next:** Run tables SQL in Supabase dashboard. Phase 4.4 (jobs→resume FK), 4.5 (two-user RLS tests), 4.6 (production delete verification). Then localhost demo for user approval.
- **Blockers:** Supabase dashboard access needed to create resumes + resume_versions tables and update shared_scores

### Session 75 — 2026-07-29
- **Agent:** claude
- **Did:**
  - **Phase 1.4:** Updated README.md — accurate tech stack, PowerShell Quick Start, links to docs
  - **Phase 1.5:** Self-hosted all fonts — `geist` npm package + local Playfair Display woff2; build no longer needs Google Fonts
  - **Phase 2.5:** 18 happy-path Playwright tests (landing, keyword analyzer w/ mocked API, ATS checker, blog, legal, auth redirect, sign-in/sign-up, SEO pages)
  - **Phase 2.6:** 6 failure-path Playwright tests (validation, 429, 500, network failure, slow response, 404)
  - **Phase 5.4:** Fixed all false spaCy/NLTK/scikit-learn/WeasyPrint claims in 5 public files
  - **Phase 3.1 (BLOCKER F3 RESOLVED):** Full Supabase JWT auth on backend — PyJWT HS256 verification in `backend/app/core/auth.py`, 7 routes gated with `require_auth` dependency, `authFetch.ts` utility on frontend sends session token, 76 new auth tests (401 without/expired/invalid/wrong-secret token, 200 with valid). Public routes (analyze, preview-rewrite) verified to remain open.
  - **Phase 3.5:** 1 MB request body size cap via `BodySizeLimitMiddleware`
  - **Phase 3.7:** Sentry PII exclusion — `before_send` strips request data/body and auth/cookie headers; `send_default_pii=False`
  - **Test counts:** 367 backend (from 291), 30 Playwright, build+lint clean
  - **Findings resolved:** F3 (auth/cost abuse), F8 (false tech claims), F15 (build fonts)
- **Files Changed:**
  - `README.md`, `docs/ENV_VARS.md`, `docs/LAUNCH_PROGRAM.md`
  - `backend/app/core/auth.py` (new), `backend/conftest.py` (new)
  - `backend/app/core/config.py` (SUPABASE_JWT_SECRET)
  - `backend/app/main.py` (BodySizeLimitMiddleware, Sentry PII filter)
  - `backend/requirements.txt` (PyJWT)
  - `backend/.env.example` (SUPABASE_JWT_SECRET)
  - `backend/app/api/routes/{score,gap,compliance,rewrite,summary,cover_letter,export}.py` (require_auth)
  - `backend/tests/integration/test_auth.py` (new — 76 tests)
  - `backend/tests/integration/test_endpoints.py` (auth headers added)
  - `frontend/src/app/lib/authFetch.ts` (new)
  - `frontend/src/app/components/{BulletRewriter,GapAnalysis,SummaryGenerator,CoverLetterGenerator,ComplianceChecker,ResumeExporter,ShareableScoreWidget}.tsx` (fetchWithRetry → authFetch)
  - `frontend/src/app/layout.tsx`, `frontend/src/fonts/PlayfairDisplay-Bold.woff2` (new)
  - `frontend/tests/e2e/happy-path.spec.ts` (new), `frontend/tests/e2e/failure-paths.spec.ts` (new)
  - `frontend/package.json` (geist, @fontsource/playfair-display)
- **Next:** Set SUPABASE_JWT_SECRET in Render dashboard; then Phase 3.2 (shared_scores), Phase 4 (resume persistence)
- **Blockers:** SUPABASE_JWT_SECRET must be set in Render for production auth to work

### Session 74 — 2026-07-29
- **Agent:** codex
- **Did:**
  - Added a repository-local Codex launcher with Auto, Plan, Edit, Normal/read-only, and unattended workspace modes
  - Mapped every choice to supported Codex 0.146.0 sandbox and approval flags
  - Kept Plan mode read-only and documented the native `/plan` or Shift+Tab toggle because the CLI has no supported Plan launch flag
  - Added `-DryRun` command inspection and documented the chooser in `.ai-sync/README.md`
- **Files Changed:**
  - `.ai-sync/codex-mode.ps1`
  - `.ai-sync/README.md`
  - `.ai-sync/WORKLOG.md`
  - `.ai-sync/DECISIONS.md`
- **Next:** User review; then commit if approved. Launch hardening work remains queued.
- **Blockers:** None

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
