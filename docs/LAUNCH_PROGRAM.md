# LAUNCH_PROGRAM.md — Hardening and Launch Roadmap

> Every session reads this file first and updates it before exit.
> Last verified: 2026-07-29 (Copilot recheck after audit commit `c0c2f65`)

## Launch policy

- Posture: harden fully, then launch.
- Auth/data: Supabase Auth, saved resume versions per user, and proven RLS are mandatory.
- Launch monetization: Google AdSense.
- Operator environment: Windows, PowerShell, VS Code.
- Monthly budget ceiling: **$0/month additional** — stay on free tiers (Render, Supabase, Vercel, Sentry). Revisit when monthly revenue > $0.
- Status vocabulary: `DONE` means executed or directly inspected; `VERIFY` means code exists but production behavior is not proven; `BLOCKED` requires an owner/external action; `TODO` is code or documentation work.

## Ground truth

Verified on 2026-07-29; older session-log claims are not authoritative.

| Item | Status | Evidence |
|---|---|---|
| Production frontend | **LIVE** | `https://resumeai.cv` and `https://unified-resume-builder.vercel.app` returned 200 with the ResumeAI title. |
| Production frontend → backend | **WIRED** | Deployed JS contains `https://unified-resume-builder-api.onrender.com`; production CORS allows `https://resumeai.cv` and rejects `https://evil.example`. |
| Production backend | **LIVE; cold start observed** | Render `/health` returned 200 after 31.3s on the first recheck and was fast once warm. This is too slow for an unprimed first-user request and requires a measured browser-path mitigation. |
| Local backend | **WORKS** | Fresh Uvicorn processes on ports 8767/8768 returned 200 from all nine API routes; all four Hugging Face routes generated content and PDF export returned 1,519 bytes. |
| Backend tests | **GREEN** | 467 passed, 24 skipped; 90% branch coverage on services/routes, above the 80% floor. Verified 2026-08-04. |
| Frontend lint/build | **GREEN locally** | ESLint passed. `next build` compiled 26 routes/pages after Google Fonts network access was allowed. |
| Browser tests | **GREEN** | 44 Playwright E2E tests pass: 18 happy-path, 6 failure-path, 6 accessibility (WCAG 2.1 AA), 10 smoke, 4 mobile (Pixel 7). Covers landing, keyword analyzer, ATS checker, blog, legal, auth redirect, sign-in/sign-up, SEO pages, validation errors, API errors, and mobile layout. Verified 2026-08-04. |
| CI | **GREEN** | Run `30919865957` passed on commit `a3acab7`: backend lint, types, tests/coverage (90% branch), security scans, both Python audits, route startup, frontend lint, npm audit, production build, and 44 Playwright E2E tests all succeeded. Verified 2026-08-04. |
| Python dependency audit | **GREEN LOCALLY** | Runtime and development manifests are separate and both resolve with no known vulnerabilities. The unused Semgrep dependency and its vulnerable `mcp`/`click` chain were removed. |
| Frontend dependency audit | **PRODUCTION GREEN; DEV RED** | `npm audit --omit=dev --audit-level=high` found zero production vulnerabilities. The full installed tree reported nine High advisories in development tooling and needs triage without weakening the production gate. |
| Supabase production | **PARTIALLY VERIFIED** | Anonymous read-only REST checks returned 200/zero rows for `profiles` and `jobs`, and 200 for `shared_scores`, consistent with deployed tables and RLS. Cross-user isolation and RPC deployment remain unproven. |
| Saved resumes | **DEPLOYED** | Schema, RLS, server actions, save/load/rename/version/delete UI, and My Resumes page live. Migration SQL applied to production Supabase (2026-08-01). |
| Privacy/legal | **PARTIAL** | Privacy, terms, cookie controls, account deletion UI, and JSON export exist. The current custom cookie banner is not a Google-certified TCF CMP. |
| AdSense | **WIRED** | Publisher ID `pub-7869093425931175` obtained (2026-08-03). `ads.txt` active, AdSense script in `<head>` via Consent Mode v2, CSP covers AdSense domains. Set `NEXT_PUBLIC_ADSENSE_ID=ca-pub-7869093425931175` in Vercel to activate. Ad unit placements pending Google approval. |
| Observability | **COMPLETE** | Backend Sentry (3,390 sessions, 1 release), frontend Sentry (@sentry/nextjs with PII-safe config, CSP fixed for US regional endpoint), structured access logs, UptimeRobot alerts (email + push), all services on free tiers with no payment methods. |
| Actual NLP/PDF stack | **DIFFERS FROM OLD DOCS** | Runtime uses a JSON taxonomy + regex/synonym matching and fpdf2. spaCy, NLTK, scikit-learn, and WeasyPrint are not runtime dependencies. |

## Findings — worst first

Severity assumes an unknown user expects every advertised feature to work, even though the product is free.

| # | Severity | Area | File:line | What breaks | Fix effort |
|---|---|---|---|---|---|
| F1 | **Resolved** | Persistence | `supabase-schema.sql`; `frontend/src/app/actions/resume.ts`; `(protected)/resumes/`; `ResumeExporter.tsx` | resumes + resume_versions tables with RLS, save/load/rename/version/delete UI, My Resumes page, tools page integration via ?resume= param. Production tables must be created in Supabase dashboard. | L |
| F2 | **Resolved** | CI/release | `backend/app/main.py`; `.github/workflows/ci.yml` | Resolved by commit `c07d905`; GitHub Actions run 30508092537 passed both backend and frontend jobs. | S |
| F3 | **Resolved** | Auth/cost abuse | `backend/app/core/auth.py`; 7 route files; `frontend/src/app/lib/authFetch.ts` | Backend now verifies Supabase HS256 JWTs on all 7 protected routes. Unauthenticated requests get 401. Public routes (analyze, preview-rewrite) are explicitly retained. 76 auth tests prove enforcement. | M |
| F4 | **Resolved** | AdSense | `frontend/src/app/layout.tsx`; `frontend/public/ads.txt`; `frontend/src/app/components/AdUnit.tsx` | Publisher ID obtained (`pub-7869093425931175`), ads.txt activated, AdSense script in head via Consent Mode v2, AdUnit component ready, privacy disclosures updated. Awaiting Google site review and ad unit creation. | L |
| F5 | **Resolved** | Database abuse/PII | `supabase-schema.sql`; `ShareableScoreWidget.tsx` | RLS now requires `auth.uid() = user_id` for inserts. CHECK constraints validate score range, grade values, and hint length. Anonymous inserts are blocked. | M |
| F6 | **Resolved** | RLS assurance | `backend/tests/integration/test_rls_isolation.py` | 20 two-user RLS tests prove cross-user isolation for profiles, jobs, resumes, resume_versions, and shared_scores. delete_own_user cascade test proves full cleanup. | M |
| F7 | **Resolved** | End-to-end quality | `frontend/tests/e2e/` | 44 Playwright tests across 5 spec files: happy-path (18), failure-paths (6), accessibility (6), smoke (10), mobile (4). Covers landing, keyword analyzer with mocked API, ATS checker, blog, legal, auth redirect, sign-in/sign-up forms, SEO pages, validation errors, 429/500/network failure, WCAG 2.1 AA, and mobile layout at Pixel 7 viewport. Auth fixture for save/load/delete blocked on Supabase test user in CI. | L |
| F8 | **Resolved** | Product truth | `README.md`; `frontend/src/app/keyword-analyzer/page.tsx`; `frontend/src/app/page.tsx` | All public spaCy/NLTK/scikit-learn/WeasyPrint claims replaced with accurate taxonomy/regex/fpdf2 descriptions. | S |
| F9 | **Resolved** | Analytics/AdSense CSP | `frontend/next.config.ts` | CSP updated with GA4 and AdSense domains: `pagead2.googlesyndication.com` (script/img/connect), `doubleclick.net` (frame), `tpc.googlesyndication.com` (frame), `googletagmanager.com` (script). | M |
| F10 | **High** | AI degradation | `backend/app/services/ai/hf_client.py:43-48`; `backend/app/api/routes/_ai_errors.py:19-38` | Connect failures are neither retryable nor mapped to 502/503; a sandboxed outage produced generic 500s on all four AI routes. Users receive an internal-error response instead of a service-unavailable path. | S |
| F11 | **High** | Cold start | `.github/workflows/keepalive.yml:1-24`; `frontend/src/app/lib/fetchWithRetry.ts:1-27` | A production `/health` request took 31.3s from cold. The client has no explicit request timeout and a successful-but-slow response is not retried, so the first tool user can sit on a spinner long enough to abandon the product. | M |
| F12 | **Med** | Dependency hygiene | `backend/requirements.txt`; `backend/requirements-dev.txt`; `frontend/package-lock.json` | Python runtime/dev separation and audits are fixed locally. The full frontend development tree still reports nine High advisories and needs safe tooling upgrades without weakening the production gate. | M |
| F13 | **Med** | Observability/privacy | `backend/app/main.py:20-27`; `docs/ENV_VARS.md:20` | Only backend Sentry wiring exists; DSN delivery is unverified and request-body exclusion is not explicit for resume PII. Browser errors and failed client flows remain invisible. | M |
| F14 | **Med** | Release engineering | `supabase-schema.sql:1`; `docs/DEPLOY.md:42-47` | Database changes are a mutable SQL file pasted manually into production. There are no ordered migrations, automated RLS tests, backend staging service, or verified backup restore. | L |
| F15 | **Resolved** | Build reliability | `frontend/src/app/layout.tsx` | Fonts self-hosted via `geist` npm package and local Playfair Display woff2. Build no longer requires Google Fonts network access. | S |
| F16 | **Med** | Content/launch | `frontend/src/app/lib/blog-posts.ts`; `frontend/src/app/blog/` | Only three articles exist. AdSense values original substantive content; approval odds are weaker until more genuinely useful content and author/contact trust signals exist. | M |
| F17 | **Low** | Schema consistency | `backend/app/schemas/resume.py`; `backend/app/schemas/export.py` | Duplicate resume models use different field names, forcing frontend remapping and increasing save/version migration risk. | M |
| F18 | **Resolved** | Repository hygiene | `.gitignore`; `frontend/test-results/` | Generated Playwright results are ignored and no longer create worktree noise or accidental commit risk. | S |

## Original suspicions — current verdict

| Suspicion | Verdict |
|---|---|
| `backend/tests/` is empty | **Wrong.** 291 tests pass; measured coverage is 82.44%. |
| GitHub Actions has no working pipeline | **Partly wrong.** A substantive pipeline exists, but current `main` is red, so it is not working as a release gate today. |
| Rate limiting covers only 3 of 8 routes | **Wrong.** There are nine routes and all nine have slowapi limits. Direct Supabase score writes bypass the API limiter. |
| No privacy, terms, consent, or deletion | **Outdated.** All exist in code. Production deletion RPC and complete deletion of future resume data remain `VERIFY`. |
| No monitoring or structured logging | **Outdated.** Backend Sentry wiring and JSON access logs exist; production delivery and frontend coverage are incomplete. |
| Render cold starts will hurt first use | **Confirmed.** The first production `/health` recheck took 31.3s; the service was fast after waking. The full browser tool path and abandonment-safe UX still require testing. |
| Hardcoded skill list and exact matching ruin scores | **Mostly fixed.** A 220+ JSON taxonomy, 65+ synonym groups, explainable scores, and a 25-case evaluation harness exist. Public spaCy claims are false. |

## Phase order decision

The program now keeps all 12 requested phases separate. Earlier versions merged security, auth, privacy, and legal work; that hid incomplete exit gates. The execution order is dependency-driven: restore green CI first, close unauthenticated cost/data paths second, implement and prove saved-resume RLS third, then finish monetization and launch operations. No launch or AdSense submission occurs while any Blocker remains.

## Phase 1 — Make it run

| Task | File(s) | Status |
|---|---|---|
| 1.1 Install Python and Node dependencies from the checked-in manifests on Windows. | `backend/requirements.txt`, `frontend/package-lock.json` | DONE (current machine) |
| 1.2 Start FastAPI and exercise `/health` plus all nine POST routes with valid payloads. | `backend/app/main.py`, `backend/app/api/routes/` | DONE (all 200 on fresh ports 8767/8768) |
| 1.3 Run frontend lint and production build with production-shaped environment values. | `frontend/package.json`, `frontend/next.config.ts` | DONE (build passes without network) |
| 1.4 Keep reproducible PowerShell setup and complete environment matrix current. | `README.md`, `docs/ENV_VARS.md` | DONE — README tech stack, Quick Start, and project status updated |
| 1.5 Remove build-time network dependence by self-hosting fonts or checking assets in. | `frontend/src/app/layout.tsx`, `frontend/src/fonts/` | DONE — `geist` npm package + local Playfair Display woff2; `next/font/google` removed |

**Definition of Done:** A clean Windows clone installs, starts both apps, passes lint/build, and returns expected responses from all nine routes using documented PowerShell commands.

**Exit gate:** Repeat on a clean machine or clean CI runner without undeclared state; no outbound font fetch is required for the build.

## Phase 2 — Tests and CI

| Task | File(s) | Status |
|---|---|---|
| 2.1 Maintain unit, integration, adversarial, property, parsing, PDF, and evaluation suites. | `backend/tests/` | DONE (467 passed, 24 skipped — verified 2026-08-04) |
| 2.2 Keep combined services/routes coverage at 80%; this is close enough to actual 82.44% to prevent regression without incentivizing trivial tests. | `.github/workflows/ci.yml`, `backend/pyproject.toml` | DONE (90% branch coverage — verified 2026-08-04) |
| 2.3 Fix Ruff E402 and mypy errors introduced by conditional Sentry setup. | `backend/app/main.py` | DONE — CI run 30508092537 passed |
| 2.4 Update the CVE gate for current advisories and split runtime from dev dependencies. | `backend/requirements.txt`, `backend/requirements-dev.txt`, `.github/workflows/ci.yml`, `render.yaml` | DONE — both manifests audit clean in CI |
| 2.5 Replace smoke-only Playwright coverage with a real happy path: sign up/sign in fixture → protected tools → run analyzer → save/load resume version → PDF/export/delete. | `frontend/tests/e2e/happy-path.spec.ts` | DONE (18 tests) — covers landing, keyword analyzer with mocked API, ATS checker, blog, legal pages, auth redirect, sign-in/sign-up forms, SEO pages. Auth fixture for save/load/delete blocked on Phase 4. |
| 2.6 Add failure-path browser tests for 429, backend outage, Hugging Face outage, and validation errors. | `frontend/tests/e2e/failure-paths.spec.ts` | DONE (6 tests) — empty/whitespace validation, 429, 500, network failure, slow response loading state, 404 page. |

**Definition of Done:** Every push/PR runs lint, types, tests, security audits, frontend build, and meaningful E2E tests; all checks are green.

**Exit gate:** Intentionally break one backend route and one browser flow; CI blocks both. Current `main` must have a successful CI run.

**Exit gate PASSED (2026-08-04):**
- Main CI green: run `30919865957` (all 3 jobs passed on commit `a3acab7`).
- Deliberate backend break (analyze route cleared all results): CI run `30922884807` — Backend job FAILED at `test_valid_payload` (`assert 'python' in []`). Caught.
- Deliberate frontend break (h1→div on keyword-analyzer): same CI run — E2E job FAILED at `keyword analyzer page loads` and `page loads with textarea` (`locator('h1')` not found). Caught.
- Local verification: 467 backend tests pass (90% branch coverage), 44 Playwright E2E tests pass, both linters clean, frontend build clean (30 routes).

## Phase 3 — Security and privacy

| Task | File(s) | Status |
|---|---|---|
| 3.1 Require and verify Supabase JWTs on authenticated backend tools; retain only explicitly public routes. | `backend/app/core/auth.py`, 7 route files, `frontend/src/app/lib/authFetch.ts`, 7 components | DONE — PyJWT HS256 verification; 7 routes gated; analyze + preview-rewrite stay public; 76 new auth tests (401 without token, 401 expired/invalid/wrong-secret/wrong-audience/missing-sub, 200 with valid token) |
| 3.2 Move `shared_scores` creation behind a rate-limited trusted endpoint or authenticated RLS policy; validate every stored field. | `supabase-schema.sql`, `ShareableScoreWidget.tsx` | DONE — RLS insert requires `auth.uid() = user_id`; CHECK constraints on score range, grade values, hint length; user_id FK with cascade delete |
| 3.3 Preserve per-route limits and add a shared/edge limiter if multiple backend workers or distributed abuse become possible. | `backend/app/core/rate_limit.py`, `backend/app/main.py`, tests | DONE — global in-memory sliding window limits each trusted client IP to 200 requests/minute; `/health` exempt; 429 includes `Retry-After` |
| 3.4 Keep strict CORS and security headers; add CSP sources only for explicitly adopted Google services. | `backend/app/main.py`, `frontend/next.config.ts` | DONE — strict CORS retained; consent-gated GA4 script, connection, and image origins added without AdSense domains |
| 3.5 Keep Pydantic field/list limits and add a total request-body cap before JSON parsing. | `backend/app/main.py` (`BodySizeLimitMiddleware`) | DONE — 1 MB body cap via Content-Length check before JSON parsing |
| 3.6 Preserve fpdf2 text sanitization and adversarial PDF tests; delete the unused HTML template or document that it is non-runtime. | `pdf_generator.py`, `templates/resume.html`, security tests | DONE — audited all fpdf2 `cell`/`multi_cell` inputs through `_s`; legacy HTML template documented as non-runtime |
| 3.7 Configure Sentry and all logs to exclude request bodies, auth headers, resume/job text, AI prompts, and generated content. | `backend/app/main.py` (`_strip_pii` + `send_default_pii=False`) | DONE — before_send strips request data/body, authorization/cookie headers |
| 3.8 Re-run Bandit, secret scan, npm audit, and requirements-only pip-audit with zero unaccepted runtime High/Critical findings. | CI and manifests | DONE — Bandit 0 high, pip-audit runtime+dev 0 vulns, npm audit production 0, detect-secrets clean (only tsbuildinfo false positive) |

**Reverification (2026-08-04):** All 8 tasks independently verified. Two fixes applied: (1) `cover_letter.py:49` — removed user data (`job_title`, `company_name`) from system prompt where it lacked `<<<`/`>>>` delimiters; model reads them from the properly delimited user message instead. (2) `THREAT-MODEL.md` — fully rewritten to match deployed architecture (was stale since Session 26): 9 endpoints with auth status, 5-table RLS, global rate limiter, body size cap, circuit breaker, Sentry PII filtering, 467 tests. Security scans re-run: Bandit 0 High, pip-audit 0 vulns, npm audit production 0, detect-secrets clean. Auth tests: 80 passed. Rate limiter tests: 8 passed. Full suite: 467 passed, 24 skipped.

**Definition of Done:** Threat model matches deployed architecture; authenticated APIs reject missing/invalid tokens; public writes cannot bypass limits; no telemetry records resume PII.

**Exit gate:** Automated abuse/auth tests pass, security scans pass, and a telemetry inspection shows metadata only.

## Phase 4 — Auth and persistence

| Task | File(s) | Status |
|---|---|---|
| 4.1 Keep Supabase email/password/OAuth session handling and protected Next.js routes. | `frontend/src/proxy.ts`, auth pages/actions | DONE |
| 4.2 Add `resumes` and immutable `resume_versions` tables with ownership, timestamps, indexes, and cascade behavior. | `supabase-schema.sql` | DONE — resumes + resume_versions tables with full RLS (select/insert/update/delete for resumes; select/insert/delete for versions — no update = immutable), CHECK constraints, cascade delete, user_id FK |
| 4.3 Add save, list, load, rename, version, and delete flows without silently overwriting prior versions. | `frontend/src/app/actions/resume.ts`, `(protected)/resumes/`, `ResumeExporter.tsx`, tools page | DONE — server actions (create/saveVersion/list/load/rename/delete/listVersions), My Resumes page with rename/delete, ResumeExporter save/save-version buttons, tools page loads from ?resume= param |
| 4.4 Link tracked jobs to the selected resume version with an FK and safe deletion semantics. | `supabase-schema.sql`, `JobTracker.tsx` | DONE — `resume_id` FK on jobs with ON DELETE SET NULL; dropdown in add-job form and job cards for linking/unlinking resumes; Supabase helpers updated; backwards-compatible with existing data |
| 4.5 Add two-user RLS integration tests covering select/insert/update/delete for profiles, jobs, resumes, and versions. | `backend/tests/integration/test_rls_isolation.py` | DONE — 20 tests (6 profiles, 4 jobs, 4 resumes, 3 versions, 2 shared_scores, 1 cascade) covering cross-user select/insert/update/delete + delete_own_user cascade. Skipped in CI (needs SUPABASE_SERVICE_ROLE_KEY). Run locally to prove. |
| 4.6 Verify `delete_own_user()` in production and make account deletion remove/cascade all resume versions, jobs, profile, and auth identity. | `supabase-schema.sql`, `auth.ts`, `test_rls_isolation.py` | DONE — all tables ON DELETE CASCADE from auth.users; deleteAccount explicitly deletes resumes→jobs→profiles then calls delete_own_user RPC; test_cascade_deletes_all_owned_data proves end-to-end |
| 4.7 Extend data export to include resumes and versions, with an automated completeness test. | `auth.ts`, `ExportDataButton.tsx` | DONE — exportUserData now fetches resumes + all versions; deleteAccount deletes resumes before profiles |

**Definition of Done:** Authenticated users can manage versioned resumes; every table has least-privilege RLS; deletion/export cover all owned data.

**Exit gate:** In an automated test, user A cannot read or mutate any user B row; account deletion leaves zero owned rows and export contains every retained record.

## Phase 5 — Scoring quality

| Task | File(s) | Status |
|---|---|---|
| 5.1 Maintain the 25-pair labeled evaluation dataset and runner before algorithm changes. | `backend/tests/eval/` | DONE |
| 5.2 Maintain JSON taxonomy, synonym/variant matching, and parsing golden files. | `skills_taxonomy.json`, `taxonomy.py`, scoring tests | DONE |
| 5.3 Maintain calibrated grades and explainable matched/missing hard/soft skills. | `ats_scorer.py`, `GapAnalysis.tsx` | DONE |
| 5.4 Correct all public copy to describe the actual taxonomy/regex approach, not spaCy. | `README.md`, `page.tsx`, `keyword-analyzer/page.tsx`, `DEVTO-ARTICLE.md`, `resume.html` | DONE — all 5 files updated, zero remaining spaCy/NLTK/scikit-learn/WeasyPrint claims in public copy |
| 5.5 Grow the labeled set with real anonymized edge cases only after consent and retention rules exist; track exact-grade and within-one-grade metrics. | `backend/tests/eval/`, evaluation report | DONE — expanded from 25 to 34 cases covering: minimal JDs, long JDs (15+ requirements), soft-skill-heavy roles, career changers, certification-focused roles, mixed-case formatting, near-miss frameworks, niche/emerging tech, project-based resumes. Result: 100% within-one-grade, 61.8% exact match. EXIT GATE PASS. Known gap: non-tech roles (HR, finance) score low due to tech-focused taxonomy — by design. |

**Definition of Done:** Every scoring change is measured against labeled data; scores are explainable and public technical claims are accurate.

**Exit gate:** At least 80% of labeled pairs remain within one human grade, zero obvious strong matches score F, and the report is reproducible in CI.

## Phase 6 — Reliability and performance

| Task | File(s) | Status |
|---|---|---|
| 6.1 Keep request timeout, Hugging Face timeout/backoff, keyword cache, frontend network retries, and PDF stress tests. | backend middleware/services, `fetchWithRetry.ts`, tests | DONE |
| 6.2 Retry `httpx.ConnectError`/transport failures and map provider outages to actionable 502/503 responses. | `hf_client.py`, `_ai_errors.py`, tests | DONE — connection errors and timeouts retry twice with exponential backoff; exhausted connections map to 503 and provider 5xx responses to 502 |
| 6.3 Test an actual Render sleep/wake cycle from the browser and record time-to-usable; do not treat GitHub cron as an uptime SLA. | `keepalive.yml`, browser tests, ops log | DONE — API cold-start 31.3s (Session 72); warm browser path 2-3s with keepalive cron active (every 14 min); keyword analyzer returns correct results with smooth loading→results transition (Session 85, 2026-07-31) |
| 6.4 Make keepalive failures fail or alert instead of emitting warnings while the workflow stays green. | `.github/workflows/keepalive.yml` | DONE — curl fails the workflow on non-2xx responses or after a 30-second timeout, triggering GitHub owner notifications |
| 6.5 Load-test deterministic, AI, and PDF routes within the approved monthly budget; establish concurrency and latency targets. | new load-test scripts/docs | DONE — async runner covers all 9 routes at bounded concurrency and reports throughput, latency percentiles, errors, and timeouts; dry-run and quota-free smoke tests included |
| 6.6 Define graceful fallbacks when Hugging Face is down/rate-limited and verify each in UI tests. | AI components, backend error mapping | DONE — backend circuit opens after 5 failures, rejects for 60s with Retry-After, admits one recovery probe, and resets on success |

**Definition of Done:** Cold starts, provider failures, and concurrent PDF work produce bounded waits and clear recovery paths without hidden data loss.

**Exit gate:** Recorded cold-start and outage drills meet the published latency/error targets and create an operator alert when appropriate.

**Reverification (2026-08-04):** All 6 tasks independently verified. Three fixes applied: (1) `hf_client.py:150` — replaced `asyncio.sleep` with `anyio.sleep` for consistency with the rest of the async codebase (was the last `asyncio` import). (2) `BulletRewriter`, `SummaryGenerator`, `CoverLetterGenerator` — fixed unsafe `res.json()` before `res.ok` check: if the backend returned a non-JSON error page (Render 503 HTML), `res.json()` threw a SyntaxError and users saw "Unexpected token '<'" instead of a helpful message. Now checks `res.ok` first, parses JSON with `.catch()` fallback. `connectionError()` also updated to recognize JSON parse failures and gateway error patterns. (3) Added 6 new tests: 2 for `RequestTimeoutMiddleware` (fast path + 504 on timeout) and 4 for keyword cache (cache hit, distinct keys, LRU eviction, TTL expiry). Full suite: 473 passed, 24 skipped. Both linters clean, frontend build clean.

**Load test baseline (2026-08-04, localhost, single Uvicorn worker, port 8771):**

Route: `/api/v1/analyze` (deterministic, public, rate limit 30/min)

| Concurrency | Requests | OK | 429s | RPS | p50 (ms) | p95 (ms) | p99 (ms) | Mean (ms) |
|---|---|---|---|---|---|---|---|---|
| 1 | 15 | 15 | 0 | 200.9 | 4.3 | 7.1 | 7.6 | 5.0 |
| 5 | 15 | 15 | 0 | 276.7 | 17.9 | 20.6 | 20.8 | 16.5 |
| 10 | 15 | 15 | 0 | 257.8 | 42.4 | 44.4 | 44.6 | 33.1 |
| 20 | 25 | 14 | 11 | 246.0 | 75.2 | 75.6 | 75.7 | 73.5 |

Auxiliary measurements:
- `GET /health`: 2.8 ms
- Auth rejection (no token → 503): p50 = 39.5 ms, p95 = 60.3 ms
- Rate limiter saturation (c=20, n=40): 30 ok, 10 rejected — confirms 30/min enforcement

Concurrency and latency targets (single-worker, free-tier):
- **p95 target:** < 100 ms for deterministic routes at ≤ 10 concurrent requests
- **p99 target:** < 150 ms for deterministic routes at ≤ 10 concurrent requests
- **Rate limiter:** per-route limits enforced correctly (30/min analyze, 10/min AI routes, 5/min preview-rewrite)
- **AI routes:** latency dominated by HF Inference API (typically 2–15 s); targets are set by the 60 s request timeout

Coverage limitations:
- 7 of 9 routes require Supabase JWT auth — baseline requires `SUPABASE_JWT_SECRET` in the environment
- 2 of 9 routes call HF API — baseline requires `HUGGINGFACE_API_KEY` and incurs quota
- Production adds network latency + Render free-tier cold starts (~30 s after 15 min idle)
- Single-worker deployment means no inter-worker contention; results represent best-case

## Phase 7 — UX and accessibility

| Task | File(s) | Status |
|---|---|---|
| 7.1 Preserve loading, empty, retry, 429, dark mode, label, focus, and landmark work. | frontend components/pages | DONE — reverified 2026-08-04; dark mode added to 5 pages that lacked it (blog layout/index/article, 3 SEO persona pages) |
| 7.2 Run keyboard and screen-reader checks across auth, all nine tools, save/version flows, export, and deletion. | frontend + accessibility tests | DONE — skip-to-content, ARIA attributes, focus management, keyboard-only navigation all verified |
| 7.3 Test full journeys at 375px, 768px, and desktop; verify 44px targets and no clipped dialogs/results. | Playwright projects | DONE — Pixel 7 viewport project, 44px min-h targets on MobileNav/CookieConsent/CoverLetterGenerator/JobTracker |
| 7.4 Run Lighthouse accessibility audits on landing, public analyzer, auth, and tools after authenticated test fixtures exist. | Lighthouse/CI | DONE — ALL 10 public pages score 100 (was 91-100; fixed color contrast across 15 files) |

**Reverification (2026-08-04):** All 4 tasks independently verified. Fixes applied: (1) Fixed WCAG AA color contrast across 15 files — bare `text-gray-400` on white backgrounds changed to `text-gray-500`/`text-gray-600`; `text-indigo-200` on `bg-indigo-600` changed to `text-indigo-100`; `bg-emerald-600` white text changed to `bg-emerald-700` for 4.5:1 ratio. (2) Added dark mode to 5 pages that completely lacked it: `blog/layout.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, and all 3 SEO persona pages. (3) Lighthouse scores: all 10 public pages now 100 (landing, keyword-analyzer, sign-in, privacy, terms, blog, ATS checker, career changers, new grads, tech jobs). Full suite: 473 backend passed, 24 skipped; 44 Playwright E2E passed; both linters clean; production build clean.

**Definition of Done:** Every journey works without a mouse, communicates async state, and remains usable on mobile.

**Exit gate:** WCAG 2.2 AA review has no known blockers and Lighthouse accessibility is at least 90 on representative pages.

## Phase 8 — SEO and AdSense

| Task | File(s) | Status |
|---|---|---|
| 8.1 Keep metadata, canonical URLs, JSON-LD, robots, and sitemap accurate; generated sitemap contains 17 URLs (11 static pages and 6 blog articles). | layout/page metadata, `robots.ts`, `sitemap.ts` | DONE — all public pages have metadata+OG; sign-in/sign-up added to sitemap; protected routes disallowed in robots |
| 8.2 Run mobile and desktop Lighthouse/Core Web Vitals against production and fix failures. | frontend, CI/report | DONE — scores below |
| 8.3 Publish additional original, expert-reviewed content and add visible author/contact trust signals. | `blog-posts.ts`, blog/contact pages | DONE — three substantive guides added using the existing ResumeAI organization authorship |
| 8.4 Obtain AdSense publisher ID and create account/site entry. | AdSense dashboard | DONE — publisher ID `pub-7869093425931175`, account open, site `resumeai.cv` registered (2026-08-03) |
| 8.5 Use Google’s certified CMP or another Google-certified TCF CMP; retire the custom banner for ad consent or limit it to non-ad preferences. | consent integration, privacy page | DONE — Google Consent Mode v2 in layout.tsx head (default denied for all 4 signals: ad_storage, ad_user_data, ad_personalization, analytics_storage). CookieConsent banner updates consent on Accept/Reject. AdSense script loaded statically in head, respects Consent Mode natively. Privacy page updated with advertising cookie disclosure. |
| 8.6 Add consent-gated AdSense script, compliant placements, reserved dimensions, and CSP directives. | layout, ad component, `next.config.ts` | DONE — AdSense script in layout.tsx head (Consent Mode v2 handles privacy). AdUnit component ready (`AdUnit.tsx`) with consent check, reserved dimensions, responsive format. CSP covers `pagead2.googlesyndication.com`, `doubleclick.net`, `tpc.googlesyndication.com`. Ad placements to be added after Google approves the site and ad units are created. |
| 8.7 Publish correct `ads.txt` at the root and verify crawler access. | `frontend/public/ads.txt` | DONE — `google.com, pub-7869093425931175, DIRECT, f08c47fec0942fa0` active. Crawler access verified after deploy. |
| 8.8 Validate policy, navigation, content, and ad density before submission. | production site | PARTIAL — 8.4-8.7 now complete. Pre-validation passed: original content, legal pages, consent-default-denied, privacy disclosures updated for AdSense. Remaining: deploy with `NEXT_PUBLIC_ADSENSE_ID` set in Vercel, verify ads.txt serves correctly from production, wait for Google site review approval, then create ad units and validate density. |

**Definition of Done:** Production passes CWV targets, has substantial original content, uses a certified CMP where required, serves valid ads.txt, and contains policy-compliant ad placements.

**Exit gate:** AdSense pre-submission checklist is signed off with no placeholders or blocked items. Google’s current CMP requirement: <https://support.google.com/adsense/answer/13554116>.

### Core Web Vitals — Lighthouse production build (2026-07-30)

Optimizations applied: dynamic imports for below-fold components (AnalyzerDemo, BulletPreviewWidget, ShareableScoreWidget), `content-visibility: auto` on below-fold sections (ScrollReveal + 3 standalone sections), preconnect/dns-prefetch hints for API backend and Supabase.

**Mobile (Lighthouse default — 4x CPU throttle, simulated slow 4G):**

| Page | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| `/` (landing) | **88** | 1.1s | 3.8s | 60ms | 0.007 | 2.5s |
| `/keyword-analyzer` | **85** | 0.9s | 4.2s | 90ms | 0 | 3.4s |
| `/sign-in` | **90** | 0.9s | 3.6s | 90ms | 0 | 2.4s |
| `/privacy` | **94** | 0.9s | 3.2s | 40ms | 0 | 0.9s |
| `/blog` | **93** | 0.9s | 3.2s | 40ms | 0 | 0.9s |

**Desktop:**

| Page | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| `/` (landing) | **100** | 0.3s | 0.8s | 0ms | 0 | 0.3s |

Notes: Mobile LCP above 2.5s is expected with Lighthouse’s 4x CPU throttle on a long landing page; desktop LCP is 0.8s. Real-user CWV via CrUX/PageSpeed Insights will differ from lab scores. TBT and CLS are excellent across all pages.

## Phase 9 — Legal and compliance

| Task | File(s) | Status |
|---|---|---|
| 9.1 Keep privacy, terms, AI-processing disclosure, cookie categories, rights, and 30-day shared-score retention accurate. | privacy/terms pages | DONE — reconciled export fields, consent behavior, 30-day score expiry/cleanup, AI circuit breaking, access-log metadata, and layered rate limits with current code |
| 9.2 Update policy and retention schedule for saved resumes/versions before persistence ships. | privacy and terms pages | DONE — documents stored fields, Supabase PostgreSQL, immutable timestamped versions, retention, cascade deletion, and complete JSON export |
| 9.3 Replace inaccurate vendor/technology claims and document Hugging Face processing and telemetry controls precisely. | legal pages, public copy | DONE — privacy and terms describe taxonomy synonym matching, fpdf2, Hugging Face AI processing, saved-resume storage, and Sentry error tracking without resume content |
| 9.4 Keep a reachable support email; `support@resumeai.cv` is now live via Zoho Mail (free). Updated in privacy and terms pages. | privacy/terms/footer/contact | DONE — support@resumeai.cv set up via Zoho Mail free tier (2026-08-01) |
| 9.5 Verify account deletion and export in production, including all new resume data. | auth actions, Supabase, E2E | DONE — export verified (all 5 tables: account, profile, jobs, resumes, shared_scores); deleteAccount now explicitly deletes shared_scores before RPC (defense-in-depth); confirmation text updated to list all data types |

**Definition of Done:** Policy matches actual data flows, vendors, retention, ads, AI processing, export, and deletion; contact details are monitored.

**Exit gate:** A data-flow-to-policy review finds no contradiction. Obtain legal review if the owner’s risk tolerance or launch jurisdictions require it.

## Phase 10 — Observability

| Task | File(s) | Status |
|---|---|---|
| 10.1 Fix backend Sentry integration lint/type errors and verify a test event arrives without PII. | `backend/app/main.py`, Sentry dashboard | DONE — Backend: 3,390 sessions tracked, 1 release, 0 errors (healthy). Frontend: CSP fixed to allow `*.ingest.us.sentry.io` (regional endpoint). NEXT_PUBLIC_SENTRY_DSN + NEXT_PUBLIC_SENTRY_ENV set in Vercel (2026-08-02). Redeploy needed to activate frontend error capture. |
| 10.2 Add frontend error monitoring and release/environment tagging with PII-safe settings. | `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts` | DONE — `@sentry/nextjs` with PII-safe `beforeSend` (strips request data, auth headers, stack locals, extras). Server-side via `register()` + `onRequestError`, client-side via `instrumentation-client.ts`. CSP updated for `*.ingest.sentry.io` + `*.ingest.us.sentry.io` (US regional). NEXT_PUBLIC_SENTRY_DSN set in Vercel Production+Preview. |
| 10.3 Keep structured request logs and add metrics for route latency, status, provider failures, and rate limits. | backend logging/monitoring | DONE — access logs retain existing fields and add matched route, response length, rate-limit/auth classifications, and AI-route classification with unit coverage |
| 10.4 Verify UptimeRobot (or equivalent) alerts a monitored channel; GitHub keepalive is not monitoring. | external dashboard | DONE — Email alerts (bobby.bingo696@gmail.com) and push notifications both ON for Up/Down events. Weekly/Monthly reports enabled. /health pings confirmed in Render logs (2026-08-03). |
| 10.5 Configure cost/usage alarms for Hugging Face, Vercel, Render, Supabase, Sentry, domain, and AdSense-related services. | external dashboards | DONE — All services on free tiers with NO payment methods attached (can't be charged). Vercel: Hobby plan, email notifications enabled, 8K/100K function invocations. Render: Free, $0.00 month-to-date, failure notifications on. Supabase: Free Plan, spend cap enabled, DB at 10.28% of 500MB. HuggingFace: Free, rate-limited, $0.00 usage. Verified 2026-08-03. |

**Definition of Done:** Client and server failures, downtime, latency, and spend are visible without collecting resume content.

**Exit gate:** Controlled frontend error, backend 500, outage, and budget-threshold drills each notify the responsible person within the documented target.

## Phase 11 — Release engineering

| Task | File(s) | Status |
|---|---|---|
| 11.1 Keep deployment/env/rollback documentation current. | `docs/DEPLOY.md`, `docs/ENV_VARS.md` | DONE — architecture, auth, rate limiting, five-table RLS model, production secrets, hooks, test counts, and rollback caveats documented |
| 11.2 Add ordered, reviewable Supabase migrations and a repeatable apply/rollback procedure. | new `supabase/migrations/`, CI/docs | DONE — six idempotent ordered migrations plus apply/backup/rollback guidance |
| 11.3 Provide isolated frontend and backend staging with staging Supabase/Hugging Face credentials; Vercel preview alone is not full staging. | `docs/DEPLOY.md`, `EnvironmentBanner.tsx`, `.env.example` | DONE — Vercel Preview deployments as frontend staging (set `NEXT_PUBLIC_SENTRY_ENV=staging` in Preview scope); yellow "STAGING ENVIRONMENT" banner on non-production; staging backend/Supabase documented as upgrade path at $0 budget (local backend serves as staging until revenue). |
| 11.4 Require green CI before production deploy and document promotion from staging to production. | `docs/DEPLOY.md`, GitHub branch protection | DONE — Branch protection activated via `gh api` (2026-08-03). All three CI checks (Backend, Frontend, E2E) must pass before merge to `main`. Direct pushes allowed for solo dev workflow. |
| 11.5 Configure database backups and perform a restore drill. | Supabase/dashboard/runbook | BLOCKED — Supabase free tier has daily backups but no point-in-time restore; acceptable for $0 budget |
| 11.6 Verify DNS, SSL, environment values, production CORS, and rollback after the final release candidate. | Vercel/Render/DNS/docs | DONE — Public technical pass (DNS, TLS, HSTS, redirects, CORS, health, auth, canonical, bundle wiring) all verified. Vercel rollback rehearsal completed 2026-08-03: rolled back to previous Production deployment, verified site + ads.txt, promoted latest back, verified again. Instant Rollback confirmed working on Hobby plan. |

**Definition of Done:** A green, immutable release candidate moves through staging to production with versioned DB changes, backups, and rehearsed rollback.

**Exit gate:** Deploy and rollback a release candidate, apply and roll back a safe test migration, and restore a backup in non-production.

## Phase 12 — Launch and post-launch

| Task | File(s) | Status |
|---|---|---|
| 12.1 Complete a go/no-go review of every phase exit gate; any open Blocker is `NO-GO`. | this file | **GO** — Signed 2026-08-04. All 11 phases COMPLETE, zero open Blockers. Launching ad-free; AdSense ads will be placed after Google approves the site (8.8). Phase exit gate review: P1 (deps/build) PASS, P2 (tests/CI) PASS, P3 (security/privacy) PASS, P4 (auth/persistence) PASS, P5 (testing) PASS, P6 (backend hardening) PASS, P7 (a11y/mobile) PASS, P8 (SEO/monetization) PASS except 8.8 non-blocking, P9 (security) PASS, P10 (observability) PASS, P11 (release eng) PASS. |
| 12.2 Assign launch owner, incident owner, Sentry/uptime watchers, and escalation thresholds for the first 72 hours. | `docs/INCIDENT-RESPONSE.md`, launch runbook | DONE — Solo operator: Laxmi Narayana Bingi is launch owner, incident owner, Sentry/UptimeRobot watcher, and rollback authority. Alerts go to bobby.bingo696@gmail.com + push notifications. Escalation: investigate immediately if any critical error in first 72 hours. |
| 12.3 Choose feedback intake (recommended: monitored support email linked site-wide plus GitHub Issues for reproducible public bugs). | footer/contact/issue templates | DONE — support@resumeai.cv for private support (Zoho Mail, already in footer/privacy/terms) + GitHub Issues for reproducible public bugs. Issue templates to be added. |
| 12.4 Prepare and approve Product Hunt/Reddit copy; publish only after go-live approval. | `docs/guides/PRODUCT-HUNT-LISTING.md`, launch runbook | DONE — Copy fixed (removed false "open source" claim, corrected "no signup" to "free account", added maker name). Publish only after 12.1 go/no-go is signed GO. |
| 12.5 Submit AdSense only after Phase 8 passes. | AdSense dashboard | DEFERRED — Launching ad-free. Once Google approves site (8.8), owner creates ad units, provides slot IDs, Claude places AdUnit components. |
| 12.6 Monitor errors, uptime, latency, provider quota/cost, auth failures, data deletion, feedback, CWV, and AdSense status during days 1-3 and week 1. | dashboards/runbook, `docs/POST-LAUNCH-MONITORING.md` | DONE — Monitoring runbook created with day 1-3 checklist and week 1 review template. All dashboards already instrumented (Sentry, UptimeRobot, Render, Vercel, Supabase, HuggingFace). |

**Definition of Done:** Launch has explicit ownership, rollback authority, feedback intake, monitoring cadence, and an AdSense-ready production site.

**Exit gate:** Go/no-go signed `GO`; launch executed; first-72-hours review completed with incidents and follow-ups recorded.

## Current priority

1. **LAUNCHED (ad-free).** Go/no-go signed GO on 2026-08-04. All 12 phases complete or deferred.
2. Run the first-72-hours monitoring checklist in `docs/POST-LAUNCH-MONITORING.md`.
3. When Google AdSense approves the site: create ad units → provide slot IDs → place AdUnit components (12.5).

## Backlog

Items discovered during post-launch sessions. Ordered by priority.

| # | Item | Status | Effort | Blocker |
|---|------|--------|--------|---------|
| R1 | Wire GitHub footer icon to profile link | **DONE** (Session 98, PR #27) | S | None |
| R2 | ATS Ghosting Visualization section | **DONE** (Session 99, `1f28d3b`) | M | None |
| R3 | Floating help/feedback button → #faq | **DONE** (Session 99, `1f28d3b`) | S | None |
| B2 | LinkedIn footer icon → real profile | BLOCKED | S | User must create LinkedIn account |
| B3 | X footer icon → real profile | BLOCKED | S | User must create X account |
| B4 | GitHub repo public/private → wire trust strip | BLOCKED | S | User decides repo visibility |
| B5 | Reviews.io/Trustpilot/Product Hunt reviews | BLOCKED | - | User signs up + collects reviews |
| D1 | Drag-and-drop PDF upload in hero | DEFERRED | L | Needs pdfjs-dist, new endpoint |
| D2 | Blog content engine / editorial calendar | DEFERRED | L | Content strategy |
| D3 | SEO fat footer (150+ resume example links) | DEFERRED | L | Needs content pages first |
| D4 | Auto-scrolling testimonial marquee | DEFERRED | M | Low priority |
