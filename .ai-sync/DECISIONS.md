# Decisions Log — Shared Architectural Decisions

> ALL agents: READ before making changes that affect architecture or patterns.
> APPEND new decisions when you make a non-trivial design choice.
> Never delete or modify existing entries — they are historical record.

---

## Format

### DEC-NNN: Short Title
- **Date:** YYYY-MM-DD
- **Agent:** claude / codex / manual
- **Context:** why this decision was needed
- **Decision:** what was decided
- **Alternatives Considered:** what was rejected and why
- **Files Affected:** key files

---

## Decisions

### DEC-023: Production-Readiness Review Fixes (H1/H3/M1/M2/M3/M6/M8)
- **Date:** 2026-07-30
- **Agent:** manual
- **Context:** Full-stack production-readiness review surfaced launch blockers: rate limiting collapsed to a single bucket on Render, `shared_scores` was anon-bulk-readable, Sentry could leak resume text via exception locals, and the 1 MB body cap was bypassable via chunked encoding.
- **Decision:**
  - Run uvicorn with `--proxy-headers --forwarded-allow-ips="*"` so `request.client.host` is the real client IP (rate limiter keys per user, not per Render proxy).
  - Lock down `shared_scores`: remove the anon `SELECT` policy; public share pages read one row via `SECURITY DEFINER` RPC `get_shared_score(id)` that omits `user_id`; add owner `SELECT`/`DELETE` policies.
  - Sentry `include_local_variables=False` and scrub exception frame `vars`/`extra` in `before_send`.
  - Enforce the 1 MB body cap at the ASGI layer (buffer + replay) so a missing `Content-Length` cannot bypass it.
  - Declare `SUPABASE_JWT_SECRET`, `SENTRY_DSN`, `ENV` in `render.yaml`; bump `PYTHON_VERSION` to 3.13.
  - Widen CI coverage to `--cov=app` (includes `app/core`); still ≥80% (87%).
- **Alternatives Considered:** Keeping the broad `shared_scores` SELECT policy with a longer share id — rejected because the anon key is public and PostgREST would still allow bulk listing. Trusting `X-Forwarded-For` inside `get_client_ip` regardless of proxy — rejected in favor of uvicorn's vetted proxy-header handling.
- **Files Affected:** `render.yaml`, `backend/app/main.py`, `supabase-schema.sql`, `scripts/2026-07-30_shared_scores_rls_patch.sql`, `.github/workflows/ci.yml`, `frontend/src/app/score/[id]/page.tsx`, `frontend/src/app/actions/auth.ts`

### DEC-022: Process-Local Hugging Face Circuit Breaker
- **Date:** 2026-07-30
- **Agent:** codex
- **Context:** Retries handle brief Hugging Face transport failures, but sustained outages still made every API request wait through provider timeouts and retries.
- **Decision:** Count terminal connection, timeout, and provider 5xx failures per process. Open after five consecutive failed logical calls for 60 seconds, reject calls immediately while open, admit one half-open probe after recovery time, close on success, and restart the 60-second interval if the probe fails. Return HTTP 503 with `Retry-After: 60` while unavailable.
- **Alternatives Considered:** Count each internal retry attempt — rejected because the breaker should represent failed user-level calls. Distributed Redis state — rejected because current deployment is single-worker and adding infrastructure is unnecessary for this recovery guard.
- **Files Affected:** `backend/app/services/ai/hf_client.py`, `backend/app/api/routes/_ai_errors.py`, `backend/tests/unit/test_hf_client.py`

### DEC-021: Per-Process Global IP Sliding-Window Limit
- **Date:** 2026-07-30
- **Agent:** codex
- **Context:** Existing slowapi limits protect individual routes, but the API lacked a middleware-level safety net across all routes.
- **Decision:** Apply a lock-protected in-memory sliding window of 200 requests per 60 seconds per trusted client IP before routing. Exempt `/health`, return 429 with `Retry-After`, and periodically discard expired IP buckets.
- **Alternatives Considered:** Redis or an edge-wide limiter — rejected for this phase because it adds infrastructure; the per-process limiter is appropriate for the current single-worker deployment and can be replaced if the service scales horizontally. Token bucket — rejected because a sliding window gives direct, deterministic minute-boundary behavior.
- **Files Affected:** `backend/app/core/rate_limit.py`, `backend/app/main.py`, `backend/tests/integration/test_global_rate_limit.py`

### DEC-020: Repository-Local Codex Mode Launcher
- **Date:** 2026-07-29
- **Agent:** codex
- **Context:** Codex has a native Plan interaction mode, while day-to-day autonomy is controlled separately through sandbox and approval settings. The team wanted a Claude/Copilot-style mode chooser without repeatedly typing launch flags or changing personal global configuration.
- **Decision:** Provide `.ai-sync/codex-mode.ps1` with Auto, Plan, Edit, Normal/read-only, and unattended workspace choices. Use only documented Codex 0.146.0 flags. Plan launches read-only and directs the user to the native `/plan` or Shift+Tab toggle because the CLI has no supported Plan-mode launch flag. Do not expose unsandboxed `--yolo` in the chooser.
- **Alternatives Considered:** Write global profile files under `~/.codex` — rejected because repository tooling should not mutate personal configuration. Treat Plan as an approval preset — rejected because Plan is an interaction mode, not a sandbox policy. Include `--yolo` — rejected because it disables both safeguards and is inappropriate as a routine project mode.
- **Files Affected:** `.ai-sync/codex-mode.ps1`, `.ai-sync/README.md`

### DEC-019: Separate Runtime and Development Python Dependencies
- **Date:** 2026-07-29
- **Agent:** codex
- **Context:** Render installed the full test/security toolchain from `requirements.txt`, and the unused Semgrep package introduced vulnerable `mcp` and `click` dependencies. CI carried a growing permanent vulnerability ignore list.
- **Decision:** Keep deployable packages in `backend/requirements.txt`, put test/lint/audit tools in `backend/requirements-dev.txt`, remove unused Semgrep, and make CI audit both manifests without ignored advisories.
- **Alternatives Considered:** Keep one manifest with documented ignores — rejected because it deploys unnecessary tools and turns accepted advisories into permanent CI policy. Retain Semgrep in the dev manifest — rejected because neither CI nor pre-commit invokes it.
- **Files Affected:** `backend/requirements.txt`, `backend/requirements-dev.txt`, `.github/workflows/ci.yml`, deployment/security documentation

### DEC-018: Restore Twelve Separate Launch Gates
- **Date:** 2026-07-29
- **Agent:** codex
- **Context:** The prior roadmap merged security, privacy, legal, auth, persistence, observability, and release work. That allowed code-complete subtasks to obscure unproven exit gates, including missing saved-resume persistence, cross-user RLS tests, and red CI.
- **Decision:** Track the launch program as twelve separate phases with explicit Definitions of Done and exit gates. Execution priority is green CI, authenticated/capped data and AI paths, saved resume versioning with RLS proof, then AdSense/operations/release gates. Any open Blocker makes launch a no-go.
- **Alternatives Considered:** Keep the compressed ten-phase roadmap — rejected because phase-level completion labels were masking mandatory unfinished work.
- **Files Affected:** `docs/LAUNCH_PROGRAM.md`

### DEC-017: Coverage Floor Raised to 80%
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** CI was using `--cov-fail-under=60` but actual coverage was 82.44%. The gap let coverage regressions go unnoticed.
- **Decision:** Raised floor to 80%. Still leaves 2.4% headroom for adding new uncovered code paths.
- **Files Affected:** .github/workflows/ci.yml

---

### DEC-016: Structured JSON Access Logging
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** No structured logging existed — only uvicorn's default access log. Need machine-parseable logs for debugging and future integration with log aggregators.
- **Decision:** Custom `AccessLogMiddleware` with `_JSONFormatter`. Each request gets a short UUID (`X-Request-ID` header). Log fields: ts, level, method, path, status, duration_ms, client IP. No resume content is ever logged.
- **Alternatives Considered:** Sentry performance tracing (overkill for current scale), python-json-logger library (unnecessary dependency for a simple formatter).
- **Files Affected:** backend/app/main.py

---

### DEC-015: react-compiler lint — requestAnimationFrame wrapper
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** React Compiler ESLint rule flags `setState` inside `useEffect` cleanup/body. `// eslint-disable-line` doesn't suppress the `react-compiler/react-compiler` rule.
- **Decision:** Wrap `setState` calls in `requestAnimationFrame()` to defer the state update out of the effect synchronous body. Applied to AnimatedCounter, ThemeToggle, TypewriterHeadline, HeroScoreCard.
- **Files Affected:** frontend/src/app/components/{AnimatedCounter,ThemeToggle,TypewriterHeadline,HeroScoreCard}.tsx

---

### DEC-014: Coverage floor at 60% (actual 82%)
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Need a safety net that blocks PRs which delete tests or reduce coverage, but not so aggressive it blocks new feature work in uncovered areas.
- **Decision:** Set `--cov-fail-under=60` in CI for `app/services` + `app/api/routes`. Conservative floor — actual coverage is 82%, so there's headroom for new untested code without blocking CI.
- **Files Affected:** .github/workflows/ci.yml

---

### DEC-013: Keyword Extraction Cache (SHA-256 + OrderedDict + TTL)
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Keyword extraction runs regex across 220+ skills on every request. Same JD produces identical results — wasted CPU on repeated calls.
- **Decision:** In-memory OrderedDict keyed by SHA-256(raw_text + title + company). Max 128 entries, 5-minute TTL. Evicts LRU on overflow.
- **Alternatives Considered:** functools.lru_cache — rejected; doesn't support TTL. Redis — rejected; adds infra dependency for a cache that's fine in-process.
- **Files Affected:** `backend/app/services/nlp/keyword_extractor.py`

### DEC-012: Request Timeout via anyio.fail_after (60s)
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** No request timeout existed. A hanging HuggingFace call could block a request indefinitely, exhausting Render's connection pool.
- **Decision:** RequestTimeoutMiddleware using `anyio.fail_after(60)` wraps all requests. Returns 504 on timeout. Used anyio instead of asyncio for trio test compatibility.
- **Alternatives Considered:** asyncio.wait_for — rejected; breaks trio-backed tests. uvicorn timeout flag — rejected; kills the worker, not the request.
- **Files Affected:** `backend/app/main.py`

### DEC-011: Grade Boundaries — A≥85, B≥65, C≥50, D≥30, F<30
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Old boundaries (A≥90, B≥80, C≥70, D≥60) made A nearly unreachable with keyword matching. A resume matching 73% of keywords got "C" which felt wrong.
- **Decision:** Lowered all thresholds. Calibrated against 25 labeled resume/JD pairs. Exit gate: 100% within-one-grade.
- **Alternatives Considered:** Keeping old boundaries — rejected; users would lose trust when a strong match shows C/D.
- **Files Affected:** `backend/app/services/scoring/ats_scorer.py`, frontend threshold colors, `backend/tests/`

### DEC-010: Skills Taxonomy as JSON + Synonym Map
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Hardcoded skill sets (230+ entries) couldn't grow without code changes. No synonym matching meant "ReactJS" ≠ "React" and "K8s" ≠ "Kubernetes".
- **Decision:** Externalized all skills to `skills_taxonomy.json` with categories and a synonym map. taxonomy.py loads and provides lookup functions. Both extractor and scorer check synonyms.
- **Alternatives Considered:** nltk/spaCy for NLP matching — rejected; adds 100MB+ dependency. Simple synonym map covers the common cases.
- **Files Affected:** `backend/app/services/nlp/skills_taxonomy.json`, `taxonomy.py`, `keyword_extractor.py`, `ats_scorer.py`

### DEC-007: Cookie Consent — localStorage + Dynamic GA4 Loading
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** GDPR/ePrivacy requires consent before analytics/advertising cookies. GA4 was loading unconditionally.
- **Decision:** CookieConsent component stores consent in localStorage (`cookie_consent` key). GA4 scripts are dynamically injected only after "Accept". Cookie Settings button in footer resets consent.
- **Alternatives Considered:** Third-party consent SDK (CookieYes, OneTrust) — rejected; adds external dependency for a simple use case.
- **Files Affected:** `frontend/src/app/components/CookieConsent.tsx`, `frontend/src/app/layout.tsx`

### DEC-008: Account Deletion via SQL SECURITY DEFINER Function
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Users need to delete their own auth.users row (GDPR Art. 17). Supabase client SDK cannot delete from auth.users directly.
- **Decision:** SQL function `delete_own_user()` with SECURITY DEFINER executes `delete from auth.users where id = auth.uid()`. Frontend server action deletes jobs → profiles → calls RPC → signs out.
- **Alternatives Considered:** Supabase Edge Function with service_role key — rejected; adds infra complexity. Admin API call from backend — rejected; backend doesn't connect to Supabase.
- **Files Affected:** `supabase-schema.sql`, `frontend/src/app/actions/auth.ts`

### DEC-009: Data Export as JSON Download (No Email)
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** GDPR data portability right requires users to export their data.
- **Decision:** Server action fetches profile + jobs from Supabase, returns JSON string. Client component creates a Blob and triggers browser download. No email, no S3, no background job.
- **Alternatives Considered:** Email export — rejected; requires email service. ZIP with PDF — rejected; overengineered for the data volume.
- **Files Affected:** `frontend/src/app/actions/auth.ts`, `frontend/src/app/(protected)/account/ExportDataButton.tsx`

### DEC-006: Tool Count Fixed at 9
- **Date:** 2026-07-25
- **Agent:** claude
- **Context:** FAQ section lists tool names; changing the count would require updating multiple hardcoded strings across the site.
- **Decision:** Tool count stays at 9 permanently. Do not add or remove tools from the count without explicit user sign-off.
- **Alternatives Considered:** Dynamic count — rejected because it adds complexity for no user-visible benefit.
- **Files Affected:** `frontend/src/app/page.tsx`, FAQ section

### DEC-004: proxy.ts IS the Middleware
- **Date:** 2026-07-24
- **Agent:** claude
- **Context:** Next.js 16 changed middleware conventions; a previous session accidentally created middleware.ts alongside proxy.ts, causing a conflict.
- **Decision:** `frontend/src/app/proxy.ts` is the sole Next.js middleware file. Never create or restore `middleware.ts`.
- **Alternatives Considered:** Rename to middleware.ts — rejected; proxy.ts is established and deletion of middleware.ts was the fix.
- **Files Affected:** `frontend/src/app/proxy.ts`

### DEC-003: Auth Gating via Supabase (All Tools)
- **Date:** 2026-07-19
- **Agent:** claude
- **Context:** PLG strategy requires one un-gated tool (Keyword Extractor) for SEO/conversion, all others require sign-in.
- **Decision:** Supabase Auth gates all tools except the Keyword Extractor. Free tier Supabase (project: pagdtcttkviglyoeuagy).
- **Alternatives Considered:** No gating — rejected; needed for conversion funnel. Full gating — rejected; kills PLG SEO traffic.
- **Files Affected:** `frontend/src/app/proxy.ts`, all tool route pages

### DEC-002: Git History — No AI Attribution
- **Date:** 2026-07-25
- **Agent:** claude
- **Context:** Co-Authored-By lines were present in 113 commits; cleaned in Session 55 via git filter-branch.
- **Decision:** No Co-Authored-By, no AI tool names, no AI attribution in any commit message or file — ever.
- **Alternatives Considered:** Keeping attribution — rejected by user; not appropriate for this project.
- **Files Affected:** git history (all commits)

### DEC-001: Next.js Frontend + FastAPI Backend Split
- **Date:** 2026-07-12
- **Agent:** manual
- **Context:** Initial architecture decision for resumeai.cv.
- **Decision:** Frontend in `frontend/` (Next.js 16, Vercel), backend in `backend/` (FastAPI, Render). CORS configured for both prod and localhost.
- **Alternatives Considered:** Monorepo with Next.js API routes — rejected; FastAPI needed for Python ML/AI libraries (HuggingFace, fpdf2).
- **Files Affected:** `frontend/`, `backend/`, `render.yaml`, `vercel.json`
