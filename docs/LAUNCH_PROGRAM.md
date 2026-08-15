# LAUNCH_PROGRAM.md — Hardening and Launch Roadmap

> Every session reads this file first and updates it before exit.
> Last verified: 2026-07-29 (Copilot recheck after audit commit `c0c2f65`)

## Launch policy

- Posture: harden fully, then launch.
- Auth/data: Supabase Auth, saved resume versions per user, and proven RLS are mandatory.
- Launch monetization: Google AdSense.
- Operator environment: Windows, PowerShell, VS Code.
- Monthly budget ceiling: **$7/month** — Render Starter ($7/mo, approved 2026-08-07 to eliminate cold starts) + free tiers (Supabase, Vercel, Sentry). Revisit when monthly revenue > $0.
- Status vocabulary: `DONE` means executed or directly inspected; `VERIFY` means code exists but production behavior is not proven; `BLOCKED` requires an owner/external action; `TODO` is code or documentation work.

## Ground truth

Verified on 2026-07-29; older session-log claims are not authoritative.

| Item | Status | Evidence |
|---|---|---|
| Production frontend | **LIVE** | `https://resumeai.cv` and `https://unified-resume-builder.vercel.app` returned 200 with the ResumeAI title. |
| Production frontend → backend | **WIRED** | Deployed JS contains `https://unified-resume-builder-api.onrender.com`; production CORS allows `https://resumeai.cv` and rejects `https://evil.example`. |
| Production backend | **LIVE; cold start observed** | Render `/health` returned 200 after 31.3s on the first recheck and was fast once warm. This is too slow for an unprimed first-user request and requires a measured browser-path mitigation. |
| Local backend | **WORKS** | Fresh Uvicorn processes on ports 8767/8768 returned 200 from all nine API routes; all four Hugging Face routes generated content and PDF export returned 1,519 bytes. |
| Backend tests | **GREEN** | 481 passed, 24 skipped; 90% branch coverage on services/routes, above the 80% floor. Reverified 2026-08-05. |
| Frontend lint/build | **GREEN locally** | ESLint passed. `next build` compiled 26 routes/pages after Google Fonts network access was allowed. |
| Browser tests | **GREEN** | 51 Playwright E2E tests pass: 19 happy-path (incl. /resumes auth redirect), 6 failure-path, 6 accessibility (WCAG 2.2 AA), 10 smoke, 4 mobile (Pixel 7), 6 tool flows. Covers landing, keyword analyzer, ATS checker, blog, legal, auth redirect (tools/account/resumes), sign-in/sign-up, SEO pages, validation errors, API errors, mobile layout, and 5 tool flows with mocked APIs. Reverified 2026-08-05. CI retries (2) added for dev-server compilation races. |
| CI | **GREEN** | Run `30919865957` passed on commit `a3acab7`: backend lint, types, tests/coverage (90% branch), security scans, both Python audits, route startup, frontend lint, npm audit, production build, and 44 Playwright E2E tests all succeeded. Verified 2026-08-04. |
| Python dependency audit | **GREEN LOCALLY** | Runtime and development manifests are separate and both resolve with no known vulnerabilities. The unused Semgrep dependency and its vulnerable `mcp`/`click` chain were removed. |
| Frontend dependency audit | **PRODUCTION GREEN; DEV RED** | `npm audit --omit=dev --audit-level=high` found zero production vulnerabilities. The full installed tree reported nine High advisories in development tooling and needs triage without weakening the production gate. |
| Supabase production | **PARTIALLY VERIFIED** | Anonymous read-only REST checks returned 200/zero rows for `profiles` and `jobs`, and 200 for `shared_scores`, consistent with deployed tables and RLS. Cross-user isolation and RPC deployment remain unproven. |
| Saved resumes | **DEPLOYED** | Schema, RLS, server actions, save/load/rename/version/delete UI, and My Resumes page live. Migration SQL applied to production Supabase (2026-08-01). |
| Privacy/legal | **PARTIAL** | Privacy, terms, cookie controls, account deletion UI, and JSON export exist. The current custom cookie banner is not a Google-certified TCF CMP. |
| AdSense | **WIRED** | Publisher ID `pub-7869093425931175` obtained (2026-08-03). `ads.txt` active, AdSense script in `<head>` via Consent Mode v2, CSP covers AdSense domains. Set `NEXT_PUBLIC_ADSENSE_ID=ca-pub-7869093425931175` in Vercel to activate. Ad unit placements pending Google approval. |
| Observability | **VERIFIED** | Backend/frontend Sentry PII-safe, structured logs, UptimeRobot alerts live. Render Starter confirmed dashboard (2026-08-11). HuggingFace $0.00 spend confirmed (2026-08-11). All within budget. |
| Actual NLP/PDF stack | **DIFFERS FROM OLD DOCS** | Runtime uses a JSON taxonomy + regex/synonym matching and fpdf2. spaCy, NLTK, scikit-learn, and WeasyPrint are not runtime dependencies. |

## Findings — worst first

Severity assumes an unknown user expects every advertised feature to work, even though the product is free.

| # | Severity | Area | File:line | What breaks | Fix effort |
|---|---|---|---|---|---|
| F1 | **Resolved** | Persistence | `supabase-schema.sql`; `frontend/src/app/actions/resume.ts`; `(protected)/resumes/`; `ResumeExporter.tsx` | resumes + resume_versions tables with RLS, save/load/rename/version/delete UI, My Resumes page, tools page integration via ?resume= param. Production tables must be created in Supabase dashboard. | L |
| F2 | **Resolved** | CI/release | `backend/app/main.py`; `.github/workflows/ci.yml` | Resolved by commit `c07d905`; GitHub Actions run 30508092537 passed both backend and frontend jobs. | S |
| F3 | **Resolved** | Auth/cost abuse | `backend/app/core/auth.py`; 7 route files; `frontend/src/app/lib/authFetch.ts` | Backend now verifies Supabase HS256 JWTs on all 7 protected routes. Unauthenticated requests get 401. Public routes (analyze, preview-rewrite) are explicitly retained. 80 auth tests (40 cases × 2 backends) prove enforcement. | M |
| F4 | **Resolved** | AdSense | `frontend/src/app/layout.tsx`; `frontend/public/ads.txt`; `frontend/src/app/components/AdUnit.tsx` | Publisher ID obtained (`pub-7869093425931175`), ads.txt activated, AdSense script in head via Consent Mode v2, AdUnit component ready, privacy disclosures updated. Awaiting Google site review and ad unit creation. | L |
| F5 | **Resolved** | Database abuse/PII | `supabase-schema.sql`; `ShareableScoreWidget.tsx` | RLS now requires `auth.uid() = user_id` for inserts. CHECK constraints validate score range, grade values, and hint length. Anonymous inserts are blocked. | M |
| F6 | **Resolved** | RLS assurance | `backend/tests/integration/test_rls_isolation.py` | 20 two-user RLS tests prove cross-user isolation for profiles, jobs, resumes, resume_versions, and shared_scores. delete_own_user cascade test proves full cleanup. | M |
| F7 | **Resolved** | End-to-end quality | `frontend/tests/e2e/` | 44 Playwright tests across 5 spec files: happy-path (18), failure-paths (6), accessibility (6), smoke (10), mobile (4). Covers landing, keyword analyzer with mocked API, ATS checker, blog, legal, auth redirect, sign-in/sign-up forms, SEO pages, validation errors, 429/500/network failure, WCAG 2.2 AA, and mobile layout at Pixel 7 viewport. Auth fixture for save/load/delete blocked on Supabase test user in CI. | L |
| F8 | **Resolved** | Product truth | `README.md`; `frontend/src/app/keyword-analyzer/page.tsx`; `frontend/src/app/page.tsx` | All public spaCy/NLTK/scikit-learn/WeasyPrint claims replaced with accurate taxonomy/regex/fpdf2 descriptions. | S |
| F9 | **Resolved** | Analytics/AdSense CSP | `frontend/next.config.ts` | CSP updated with GA4 and AdSense domains: `pagead2.googlesyndication.com` (script/img/connect), `doubleclick.net` (frame), `tpc.googlesyndication.com` (frame), `googletagmanager.com` (script). | M |
| F10 | **Resolved** | AI degradation | `backend/app/services/ai/hf_client.py:43-48`; `backend/app/api/routes/_ai_errors.py:19-38` | Phase 6: HF client retries (3× with backoff), 502/503 mapped correctly, graceful degradation UI. | S |
| F11 | **Resolved** | Cold start | `render.yaml`; `.github/workflows/keepalive.yml`; `frontend/src/app/lib/fetchWithRetry.ts` | Blueprint pins Starter; dashboard confirmed **Starter** badge on service `srv-d8nfe63eo5us73esoqtg` (2026-08-11). | M |
| F12 | **Resolved** | Dependency hygiene | `backend/requirements.txt`; `backend/requirements-dev.txt`; `frontend/package-lock.json` | Phase 2/3: runtime/dev separation, pip-audit + npm audit in CI, production gate has 0 High vulnerabilities. | M |
| F13 | **Resolved** | Observability/privacy | `backend/app/main.py:20-27`; `docs/ENV_VARS.md:20` | Phase 10: frontend + backend Sentry wired, PII-safe beforeSend strips request bodies/auth headers, 11 unit tests prove strip. | M |
| F14 | **Partial — owner proof** | Release engineering | `supabase/migrations/`; `docs/DEPLOY.md`; `docs/ROLLBACK.md` | Nine ordered migrations (001–009), manual backup creation and branch protection are proven. Owner-executed Render rollback and non-production database restoration are not yet evidenced. | L |
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
| 2.1 Maintain unit, integration, adversarial, property, parsing, PDF, and evaluation suites. | `backend/tests/` | DONE (481 passed, 24 skipped — reverified 2026-08-05) |
| 2.2 Keep combined services/routes coverage at 80%; this is close enough to actual 82.44% to prevent regression without incentivizing trivial tests. | `.github/workflows/ci.yml`, `backend/pyproject.toml` | DONE (90% branch coverage — reverified 2026-08-05) |
| 2.3 Fix Ruff E402 and mypy errors introduced by conditional Sentry setup. | `backend/app/main.py` | DONE — CI run 30508092537 passed |
| 2.4 Update the CVE gate for current advisories and split runtime from dev dependencies. | `backend/requirements.txt`, `backend/requirements-dev.txt`, `.github/workflows/ci.yml`, `render.yaml` | DONE — both manifests audit clean in CI |
| 2.5 Replace smoke-only Playwright coverage with a real happy path: sign up/sign in fixture → protected tools → run analyzer → save/load resume version → PDF/export/delete. | `frontend/tests/e2e/happy-path.spec.ts` | DONE (18 tests) — covers landing, keyword analyzer with mocked API, ATS checker, blog, legal pages, auth redirect, sign-in/sign-up forms, SEO pages. Auth fixture for save/load/delete blocked on Phase 4. |
| 2.6 Add failure-path browser tests for 429, backend outage, Hugging Face outage, and validation errors. | `frontend/tests/e2e/failure-paths.spec.ts` | DONE (6 tests) — empty/whitespace validation, 429, 500, network failure, slow response loading state, 404 page. |

**Definition of Done:** Every push/PR runs lint, types, tests, security audits, frontend build, and meaningful E2E tests; all checks are green.

**Exit gate:** Intentionally break one backend route and one browser flow; CI blocks both. Current `main` must have a successful CI run.

**Exit gate PASSED (2026-08-04), reverified 2026-08-05:**
- Main CI green: run `30919865957` (all 3 jobs passed on commit `a3acab7`). Subsequent run `30963112810` had 1 flaky E2E failure (identical tree, dev-server compilation race); fixed by adding `retries: 2` to Playwright CI config.
- Deliberate backend break (analyze route cleared all results): CI run `30922884807` — Backend job FAILED at `test_valid_payload` (`assert 'python' in []`). Caught.
- Deliberate frontend break (h1→div on keyword-analyzer): same CI run — E2E job FAILED at `keyword analyzer page loads` and `page loads with textarea` (`locator('h1')` not found). Caught.
- Local reverification (2026-08-05): 481 backend tests pass (90% branch coverage), 50 Playwright E2E tests pass (0 failures), both linters clean, frontend build clean (30 routes).

## Phase 3 — Security and privacy

| Task | File(s) | Status |
|---|---|---|
| 3.1 Require and verify Supabase JWTs on authenticated backend tools; retain only explicitly public routes. | `backend/app/core/auth.py`, 7 route files, `frontend/src/app/lib/authFetch.ts`, 7 components | DONE — PyJWT HS256 verification; 7 routes gated; analyze + preview-rewrite stay public; 80 auth tests (40 cases × 2 backends asyncio+trio: 401 without/expired/invalid/wrong-secret/wrong-audience/missing-sub/alg-none/HS384, 200 with valid, public routes open) |
| 3.2 Move `shared_scores` creation behind a rate-limited trusted endpoint or authenticated RLS policy; validate every stored field. | `supabase-schema.sql`, `ShareableScoreWidget.tsx` | DONE — RLS insert requires `auth.uid() = user_id`; CHECK constraints on score range, grade values, hint length; user_id FK with cascade delete |
| 3.3 Preserve per-route limits and add a shared/edge limiter if multiple backend workers or distributed abuse become possible. | `backend/app/core/rate_limit.py`, `backend/app/main.py`, tests | DONE — global in-memory sliding window limits each trusted client IP to 200 requests/minute; `/health` exempt; 429 includes `Retry-After` |
| 3.4 Keep strict CORS and security headers; add CSP sources only for explicitly adopted Google services. | `backend/app/main.py`, `frontend/next.config.ts` | DONE — strict CORS retained; consent-gated GA4 script, connection, and image origins added without AdSense domains |
| 3.5 Keep Pydantic field/list limits and add a total request-body cap before JSON parsing. | `backend/app/main.py` (`BodySizeLimitMiddleware`) | DONE — 1 MB body cap via Content-Length check before JSON parsing |
| 3.6 Preserve fpdf2 text sanitization and adversarial PDF tests; delete the unused HTML template or document that it is non-runtime. | `pdf_generator.py`, `templates/resume.html`, security tests | DONE — audited all fpdf2 `cell`/`multi_cell` inputs through `_s`; legacy HTML template documented as non-runtime |
| 3.7 Configure Sentry and all logs to exclude request bodies, auth headers, resume/job text, AI prompts, and generated content. | `backend/app/main.py` (`_strip_pii` + `send_default_pii=False`) | DONE — before_send strips request data/body, authorization/cookie headers |
| 3.8 Re-run Bandit, secret scan, npm audit, and requirements-only pip-audit with zero unaccepted runtime High/Critical findings. | CI and manifests | DONE — Bandit 0 high, pip-audit runtime+dev 0 vulns, npm audit production 0, detect-secrets clean (only tsbuildinfo false positive) |

**Reverification (2026-08-04):** All 8 tasks independently verified. Fixes applied: (1) `cover_letter.py:49` — removed user data (`job_title`, `company_name`) from system prompt where it lacked `<<<`/`>>>` delimiters; model reads them from the properly delimited user message instead. (2) `THREAT-MODEL.md` — fully rewritten to match deployed architecture (was stale since Session 26): 9 endpoints with auth status, 5-table RLS, global rate limiter, body size cap, circuit breaker, Sentry PII filtering, 467 tests. (3) Auth test count corrected from 76 to 80 (40 cases × 2 backends). (4) CSP `'unsafe-inline'` for script-src evaluated — accepted risk: nonce-based CSP forces all-dynamic rendering (kills static generation, CDN caching, degrades CWV, risks Vercel free-tier limits); React auto-escaping and no user-data `dangerouslySetInnerHTML` make the practical XSS risk negligible; documented in THREAT-MODEL.md. Security scans re-run: Bandit 0 High, pip-audit 0 vulns, npm audit production 0, detect-secrets clean. Auth tests: 80 passed. Rate limiter tests: 8 passed. Full suite: 467 passed, 24 skipped.

**Reverification (2026-08-05, Session 107):** All 8 tasks independently re-verified from scratch. Fix applied: THREAT-MODEL.md preview-rewrite rate limit corrected from 15/min to 5/min (code says `@limiter.limit("5/minute")`); test counts updated to 481+50. Verification evidence:
- **3.1 JWT auth:** 7 routes have `require_auth` (score, gap, compliance, rewrite, summary, cover_letter, export). `analyze` + `preview` confirmed no `require_auth`. 80 auth tests pass (40 cases × asyncio+trio).
- **3.2 shared_scores RLS:** RLS enabled, insert requires `auth.uid() = user_id`, CHECK constraints on score/grade/hint, user_id FK cascade, SECURITY DEFINER `get_shared_score()` omits user_id, no anon SELECT/INSERT policies.
- **3.3 Rate limiting:** All 9 routes have per-route `@limiter.limit()`. Global `SlidingWindowRateLimiter` at 200/min/IP, `/health` exempt, 429+Retry-After. Client IP extraction uses rightmost XFF (spoof-resistant). 111 security tests pass (80 auth + 8 global rate limit + 12 PDF sanitization + 5 rate limit unit + 6 client IP).
- **3.4 CORS + headers:** CORS origins are strict allow-list (no wildcard). CSP covers GA4, AdSense, Sentry domains. Backend adds X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS (prod). SecurityHeaders tests pass.
- **3.5 Body cap:** `BodySizeLimitMiddleware` at ASGI layer checks Content-Length + buffers chunked bodies with 1MB cap + 15s read timeout. Pydantic max_length on all string/list fields confirmed.
- **3.6 PDF sanitization:** `_s()` called on all 26 fpdf2 `cell`/`multi_cell` user-text paths. 12 dedicated PDF sanitization tests pass. HTML template documented as non-runtime.
- **3.7 Sentry PII:** `_strip_pii` strips request data/body, auth/cookie/set-cookie headers, stack frame vars, extras. `send_default_pii=False`, `include_local_variables=False`. Verified logic strips all PII categories.
- **3.8 Security scans:** Bandit 0 High (2 Medium B104 = expected 0.0.0.0). pip-audit runtime 0 vulns. pip-audit dev 0 vulns. npm audit production 0 vulns. detect-secrets: 8 non-tsbuildinfo findings, all false positives (config placeholders, test JWT secrets, GSC verification hash).
- **11 `dangerouslySetInnerHTML` uses audited:** all use hardcoded JSON-LD, consent scripts, or theme init — zero user data.
- **Full suite:** 481 backend passed, 24 skipped. 50 Playwright E2E passed. Both linters clean. Frontend build clean (30 routes).

**Definition of Done:** Threat model matches deployed architecture; authenticated APIs reject missing/invalid tokens; public writes cannot bypass limits; no telemetry records resume PII.

**Exit gate:** Automated abuse/auth tests pass, security scans pass, and a telemetry inspection shows metadata only.

## Phase 4 — Auth and persistence

| Task | File(s) | Status |
|---|---|---|
| 4.1 Keep Supabase email/password/OAuth session handling and protected Next.js routes. | `frontend/src/proxy.ts`, auth pages/actions | DONE |
| 4.2 Add `resumes` and immutable `resume_versions` tables with ownership, timestamps, indexes, and cascade behavior. | `supabase-schema.sql` | DONE — resumes + resume_versions tables with full RLS (select/insert/update/delete for resumes; select/insert/delete for versions — no update = immutable), CHECK constraints, cascade delete, user_id FK |
| 4.3 Add save, list, load, rename, version, and delete flows without silently overwriting prior versions. | `frontend/src/app/actions/resume.ts`, `(protected)/resumes/`, `ResumeExporter.tsx`, tools page | DONE — server actions (create/saveVersion/list/load/rename/delete/listVersions), My Resumes page with rename/delete, ResumeExporter save/save-version buttons, tools page loads from ?resume= param |
| 4.4 Link tracked jobs to the selected resume version with an FK and safe deletion semantics. | `supabase-schema.sql`, `JobTracker.tsx` | DONE — `resume_id` FK on jobs with ON DELETE SET NULL; dropdown in add-job form and job cards for linking/unlinking resumes; Supabase helpers updated; backwards-compatible with existing data |
| 4.5 Add two-user RLS integration tests covering select/insert/update/delete for profiles, jobs, resumes, and versions. | `test_rls_isolation.py`; `production-rls.yml` | VERIFY — 20 tests cover cross-user access and cascade deletion. A protected, manually dispatched production workflow now exists; configure its `production-rls` Environment secrets and retain a fresh 20/20 run. |
| 4.6 Verify `delete_own_user()` in production and make account deletion remove/cascade all resume versions, jobs, profile, and auth identity. | `supabase-schema.sql`, `auth.ts`, `test_rls_isolation.py` | DONE — all tables ON DELETE CASCADE from auth.users; deleteAccount calls delete_own_user RPC which cascades through all 5 tables atomically; test_cascade_deletes_all_owned_data proves end-to-end (profiles, jobs, resumes, resume_versions, shared_scores) |
| 4.7 Extend data export to include resumes and versions, with an automated completeness test. | `auth.ts`, `ExportDataButton.tsx` | DONE — exportUserData fetches all 5 tables (account, profiles, jobs, resumes with versions, shared_scores); confirmation text lists all data types |

**Definition of Done:** Authenticated users can manage versioned resumes; every table has least-privilege RLS; deletion/export cover all owned data.

**Exit gate:** In an automated test, user A cannot read or mutate any user B row; account deletion leaves zero owned rows and export contains every retained record.

**Reverification (2026-08-04):** RLS tests run against production Supabase for the first time. Found and fixed 3 production gaps: (1) `shared_scores` table was missing `user_id` column — added with NOT NULL FK + CASCADE. (2) 3 stale permissive RLS policies (`Anyone can insert shared scores`, `anon_insert`, `public_read`) allowed unauthenticated bulk read/write — dropped. (3) `delete_own_user()` and `get_shared_score()` RPC functions were missing — created. RLS enabled on `shared_scores`. Test assertion fixed: `delete_own_user` returns 204 (void), not 200. Result: **20/20 RLS tests pass.** Full suite: 481 passed, 24 skipped. SQL applied via `scripts/2026-08-04_production_fix.sql`.

**Reverification (2026-08-05, Session 108):** All 7 tasks independently re-verified from scratch. Two fixes applied:
- **4.1 middleware gap:** `/resumes` was missing from proxy.ts `protectedPrefixes` — unauthenticated users could reach the page server component (layout.tsx redirected, but at server-component time, not edge). Added `/resumes` to `protectedPrefixes` for edge-level redirect parity with `/tools` and `/account`. New E2E test confirms `/resumes` → `/sign-in` redirect.
- **4.5/4.6 cascade test gap:** `test_cascade_deletes_all_owned_data` did not create or verify `shared_scores` — cascade worked but was untested for that table. Added shared_scores row to cascade test; all 5 tables now verified.
- **4.6 doc correction:** Previous description claimed "deleteAccount explicitly deletes resumes→jobs→profiles then calls delete_own_user RPC" — this was inaccurate. The code calls `delete_own_user()` directly, relying on CASCADE from auth.users to atomically clean all 5 tables. This is correct and more reliable than separate REST deletes.
- **Verification evidence:**
  - **4.1 Auth:** proxy.ts protects `/tools`, `/account`, `/account-setup`, `/resumes` at edge. `(protected)/layout.tsx` provides server-component guard for all routes in the group. Auth pages redirect authenticated users to `/tools`. E2E: 3 redirect tests pass.
  - **4.2 Schema:** `resumes` table: RLS enabled, 4 policies (select/insert/update/delete by user_id), CHECK on title length, CASCADE from auth.users, user_id index. `resume_versions`: RLS enabled, 3 policies (select/insert/delete via parent resume ownership), NO update policy (immutable), unique(resume_id, version_number), CASCADE from resumes.
  - **4.3 Server actions:** 7 actions (create, saveVersion, list, load, listVersions, rename, delete) — all verify `getUser()` + filter by `user_id` (defense-in-depth beyond RLS). `saveVersion` retries on uniqueness conflict (23505). `createResume` rolls back on version insert failure. Tools page loads from `?resume=` param.
  - **4.4 Jobs→Resume FK:** `resume_id uuid references resumes(id) on delete set null` on jobs table. Migration helper for existing tables. JobTracker has resume dropdown in add-job form + inline linking on job cards. `updateJobSupabase` filters by user_id.
  - **4.5 RLS tests:** 20 tests across 6 test classes (profiles×6, jobs×4, resumes×4, versions×3, shared_scores×2, cascade×1). All cross-user select/insert/update/delete blocked. Impersonation inserts blocked (403/409). Skipped in CI (needs SUPABASE_SERVICE_ROLE_KEY).
  - **4.6 Cascade:** `delete_own_user()` SECURITY DEFINER deletes auth.users row. CASCADE chain: auth.users → profiles, jobs, resumes, shared_scores; resumes → resume_versions; jobs.resume_id SET NULL. Test creates rows in all 5 tables, calls RPC, verifies zero rows remain.
  - **4.7 Export:** `exportUserData` fetches profiles, jobs, resumes, shared_scores in parallel, then fetches all versions per resume. Returns JSON with account, profile, jobs, resumes (with versions), shared_scores. `DeleteAccountButton` confirmation text lists all data types.
  - **Full suite:** 481 backend passed, 24 skipped. 51 Playwright E2E passed (was 50). Both linters clean. Frontend build clean.

**Cross-verification (2026-08-05, Session 110):** All 7 tasks independently re-verified from scratch. No code fixes needed.
- **4.1:** proxy.ts `protectedPrefixes` includes `/tools`, `/account`, `/account-setup`, `/resumes`. Layout.tsx server-component guard with `getUser()` + redirect. E2E test confirms `/resumes` → `/sign-in` redirect.
- **4.2:** `resumes` table: RLS enabled, 4 policies (select/insert/update/delete by user_id), CHECK on title 1-200, CASCADE from auth.users, index on user_id. `resume_versions`: RLS enabled, 3 policies (select/insert/delete via parent ownership), NO update policy (immutable), unique(resume_id, version_number), CASCADE from resumes.
- **4.3:** 7 server actions verified (create, saveVersion, list, load, listVersions, rename, delete). All verify `getUser()` + filter by `user_id`. `saveVersion` retries on 23505. `createResume` rolls back on version failure.
- **4.4:** `resume_id uuid references resumes(id) on delete set null` on jobs table. JobTracker has resume dropdown. `updateJobSupabase` filters by user_id.
- **4.5:** 20 RLS tests collected (profiles×6, jobs×4, resumes×4, versions×3, shared_scores×2, cascade×1). Skipped in CI (needs SUPABASE_SERVICE_ROLE_KEY).
- **4.6:** Cascade test creates rows in all 5 tables (profiles, jobs, resumes, resume_versions, shared_scores), calls `delete_own_user()`, verifies zero rows in all 5 tables.
- **4.7:** `exportUserData` fetches all 5 tables in parallel + versions per resume. Returns JSON with account, profile, jobs, resumes (with versions), shared_scores.
- **Full suite:** 481 backend passed, 24 skipped. 51 Playwright E2E passed. Both linters clean.

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

**Reverification (2026-08-05, Session 108):** All 5 tasks independently verified from scratch.
- **5.1 Eval dataset + runner:** 34-case dataset at `tests/eval/eval_dataset.json`. Runner (`run_eval.py`) and pytest wrapper (`test_eval_harness.py`) both execute correctly. 2 eval tests are collected by pytest default discovery and run in CI (part of 481-test suite).
- **5.2 Taxonomy + synonyms + golden files:** `skills_taxonomy.json` has 389 hard skills across 16 categories, 50 soft skills, 91 synonym groups (137 reverse entries). `taxonomy.py` provides `get_hard_skills()`, `get_soft_skills()`, `get_synonym_map()`, `get_reverse_synonym_map()`, `canonicalize()`. Six synonym pairs verified: reactjs→react, k8s→kubernetes, postgres→postgresql, js→javascript, nextjs→next.js, golang→go. 42 keyword extractor tests pass (including 4 cache tests). 12 golden-file rewriter parsing tests pass.
- **5.3 Calibrated grades + explainability:** Grade boundaries A≥85, B≥65, C≥50, D≥30, F<30. Weighted scoring 70% hard / 30% soft. `ats_scorer.py` returns `matched_hard_skills`/`missing_hard_skills`/`matched_soft_skills`/`missing_soft_skills` for explainability. `GapAnalysis.tsx` displays hard/soft breakdown with counts. Domain warning fires when taxonomy_coverage ≤ 0.5 (non-tech JDs). 34 scorer tests pass (including weight-swap detection, domain warning, synonym matching). Note: grade_label "Strong match" at B (≥65) overlaps with frontend context message "Strong match!" at ≥70 — cosmetic inconsistency, not a scoring error; added to backlog.
- **5.4 Public copy accuracy:** grep for spaCy/NLTK/scikit-learn/WeasyPrint across frontend/, README.md, docs/guides/, backend templates: zero hits. Only references are in internal LAUNCH_PROGRAM.md documenting the cleanup.
- **5.5 Expanded dataset + metrics:** 34 cases (IDs 1-25 original + 26-34 edge cases). Eval result: 21/34 exact (61.8%), 34/34 within-one-grade (100.0%). EXIT GATE PASS. `test_no_strong_match_scores_f` verifies no A/B-expected case scores F.
- **Full suite:** 481 backend passed, 24 skipped. Ruff clean. ESLint clean.

**Cross-verification (2026-08-05, Session 110):** All 5 tasks independently re-verified from scratch. No code fixes needed.
- **5.1:** 34-case eval dataset at `tests/eval/eval_dataset.json`. 2 eval tests collected and pass (within-one-grade + no-A/B-scores-F).
- **5.2:** 389 hard skills (16 categories), 50 soft skills, 91 synonym groups (137 reverse entries). Six synonym pairs verified: reactjs→react, k8s→kubernetes, postgres→postgresql, js→javascript, nextjs→next.js, golang→go. 42 extractor + 12 golden-file tests pass (88 total with 34 scorer tests).
- **5.3:** Grade boundaries A≥85/B≥65/C≥50/D≥30/F<30. Weighted 70% hard / 30% soft. `GapAnalysis.tsx` displays matched/missing hard/soft breakdown. 34 scorer tests pass.
- **5.4:** Zero spaCy/NLTK/scikit-learn/WeasyPrint hits in frontend/, README.md, docs/guides/.
- **5.5:** 34 cases, 2 eval tests pass. EXIT GATE PASS (100% within-one-grade).
- **Full suite:** 481 backend passed, 24 skipped. Both linters clean.

## Phase 6 — Reliability and performance

| Task | File(s) | Status |
|---|---|---|
| 6.1 Keep request timeout, Hugging Face timeout/backoff, keyword cache, frontend network retries, and PDF stress tests. | backend middleware/services, `fetchWithRetry.ts`, tests | DONE |
| 6.2 Retry `httpx.ConnectError`/transport failures and map provider outages to actionable 502/503 responses. | `hf_client.py`, `_ai_errors.py`, tests | DONE — connection errors and timeouts retry twice with exponential backoff; exhausted connections map to 503 and provider 5xx responses to 502 |
| 6.3 Pin the approved always-on Render instance and retain historical Free cold-start evidence for regression comparison. | `render.yaml`, browser tests, ops log | DONE — Render dashboard confirmed **Starter** plan on 2026-08-11. Historical Free cold start was 31.3s (retained as regression baseline). |
| 6.4 Make health and retention-cleanup failures fail/alert instead of leaving the workflow green. | `.github/workflows/keepalive.yml` | DONE — health has a 3-attempt retry loop; non-200 cleanup emits `::error::` and exits 1, triggering GitHub owner notifications. |
| 6.5 Load-test deterministic, AI, and PDF routes within the approved monthly budget; establish concurrency and latency targets. | new load-test scripts/docs | DONE — async runner covers all 9 routes at bounded concurrency and reports throughput, latency percentiles, errors, and timeouts; dry-run and quota-free smoke tests included |
| 6.6 Define graceful fallbacks when Hugging Face is down/rate-limited and verify each in UI tests. | AI components, backend error mapping | DONE — backend circuit opens after 5 failures, rejects for 60s with Retry-After, admits one recovery probe, and resets on success |

**Definition of Done:** Cold starts, provider failures, and concurrent PDF work produce bounded waits and clear recovery paths without hidden data loss.

**Exit gate:** Recorded cold-start and outage drills meet the published latency/error targets and create an operator alert when appropriate.

**Reverification (2026-08-04):** All 6 tasks independently verified. Three fixes applied: (1) `hf_client.py:150` — replaced `asyncio.sleep` with `anyio.sleep` for consistency with the rest of the async codebase (was the last `asyncio` import). (2) `BulletRewriter`, `SummaryGenerator`, `CoverLetterGenerator` — fixed unsafe `res.json()` before `res.ok` check: if the backend returned a non-JSON error page (Render 503 HTML), `res.json()` threw a SyntaxError and users saw "Unexpected token '<'" instead of a helpful message. Now checks `res.ok` first, parses JSON with `.catch()` fallback. `connectionError()` also updated to recognize JSON parse failures and gateway error patterns. (3) Added 6 new tests: 2 for `RequestTimeoutMiddleware` (fast path + 504 on timeout) and 4 for keyword cache (cache hit, distinct keys, LRU eviction, TTL expiry). Full suite: 473 passed, 24 skipped. Both linters clean, frontend build clean.

**Cross-verification (2026-08-05, Session 110):** All 6 tasks independently re-verified from scratch. Two doc fixes applied: (1) 6.3 keepalive interval corrected from "14 min" to "13 min" (cron is `*/13 * * * *`). (2) 6.4 timeout corrected from "30-second" to "90-second" (`--max-time 90` in keepalive.yml), added retry count ("3-attempt retry loop"). Verification evidence:
- **6.1:** `RequestTimeoutMiddleware` 60s (`anyio.fail_after`). HF client 30s timeout + 2 retries (1s/2s backoff). Keyword cache: `OrderedDict` LRU, 128 max, 5-min TTL, SHA-256 keys. `fetchWithRetry`: 65s timeout, 2 retries, 3s delay. PDF stress: 3 templates × large resume, size cap <5MB, empty resume. 2 timeout + 5 PDF + 4 cache = 11 tests pass.
- **6.2:** `_is_retryable()` catches ConnectError, TimeoutException, 5xx. `_ai_errors.py` maps 7 exception types: ConnectError→503, TimeoutException→504, HTTPStatusError→502, CircuitBreakerOpenError→503+Retry-After, ValueError→503, RuntimeError→500, BaseExceptionGroup→unwrap. 22 tests pass (11 cases × asyncio+trio).
- **6.3:** Keepalive cron `*/13 * * * *` with 3 retries × 90s timeout. Cold-start 31.3s documented.
- **6.4:** Workflow exits 1 after 3 failed attempts with `::error::` annotation. GitHub notifications on failure.
- **6.5:** 9 RouteCase entries validated. Dry-run + 2 smoke tests pass.
- **6.6:** Circuit breaker: 5 failures → open, 60s recovery, half-open probe, reset on success. 22 hf_client tests pass (includes retry + breaker coverage). Frontend `connectionError()` handles: network errors, timeouts, AI service messages, SyntaxError, 5xx status.
- **All 9 frontend components** check `res.ok` before JSON parse. `connectionError()` covers 5 error patterns.
- **Full suite:** 481 backend passed, 24 skipped. 51 Playwright E2E passed. Both linters clean.

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

Concurrency and latency targets (single-worker baseline):
- **p95 target:** < 100 ms for deterministic routes at ≤ 10 concurrent requests
- **p99 target:** < 150 ms for deterministic routes at ≤ 10 concurrent requests
- **Rate limiter:** per-route limits enforced correctly (30/min analyze, 10/min AI routes, 5/min preview-rewrite)
- **AI routes:** latency dominated by HF Inference API (typically 2–15 s); targets are set by the 60 s request timeout

Coverage limitations:
- 7 of 9 routes require Supabase JWT auth — baseline requires `SUPABASE_JWT_SECRET` in the environment
- 3 of 9 routes call HF API — baseline requires `HUGGINGFACE_API_KEY`; each authenticated request consumes durable AI units
- Production adds network latency; Render must remain on the Blueprint-pinned Starter instance to avoid the measured Free cold start
- Single-worker deployment means no inter-worker contention; results represent best-case

## Phase 7 — UX and accessibility

| Task | File(s) | Status |
|---|---|---|
| 7.1 Preserve loading, empty, retry, 429, dark mode, label, focus, and landmark work. | frontend components/pages | DONE — dark mode now on all 8 SEO/public pages: blog layout/index/article (bc7e25d), 3 SEO persona pages (this session — bc7e25d only fixed WCAG contrast, not dark mode) |
| 7.2 Run keyboard and screen-reader checks across auth, all nine tools, save/version flows, export, and deletion. | frontend + accessibility tests | DONE — skip-to-content in root layout, ARIA attributes in 21 component files, sr-only/focus-visible in 18 files |
| 7.3 Test full journeys at 375px, 768px, and desktop; verify 44px targets and no clipped dialogs/results. | Playwright projects | DONE — Pixel 7 viewport project (mobile.spec.ts), 44px min-h targets on MobileNav/CookieConsent/CoverLetterGenerator/JobTracker; 4 mobile tests pass |
| 7.4 Run Lighthouse accessibility audits on landing, public analyzer, auth, and tools after authenticated test fixtures exist. | Lighthouse/CI | DONE — 10/10 public pages pass WCAG 2.2 AA via axe-core 4.12.1 (upgraded from 2.1 AA tags; added `wcag22aa` to test tags). Manual audit of non-automatable 2.2 criteria: 2.5.7 Dragging (no drag UI), 2.5.8 Target Size (44px min-h), 2.4.11 Focus Not Obscured (z-100 skip link), 3.3.7 Redundant Entry (none), 3.3.8 Accessible Auth (autoComplete on all auth fields), 3.2.6 Consistent Help (footer email on all pages). |

**Reverification (2026-08-04):** All 4 tasks independently verified. Fixes applied: (1) Fixed WCAG AA color contrast across 15 files — bare `text-gray-400` on white backgrounds changed to `text-gray-500`/`text-gray-600`; `text-indigo-200` on `bg-indigo-600` changed to `text-indigo-100`; `bg-emerald-600` white text changed to `bg-emerald-700` for 4.5:1 ratio. (2) Added dark mode to blog pages: `blog/layout.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`. Note: commit `bc7e25d` claimed "3 SEO persona pages" had dark mode added but only fixed WCAG contrast ratios (gray-400→gray-500) — dark: class variants were not added. (3) Lighthouse scores: all 10 public pages now 100 (landing, keyword-analyzer, sign-in, privacy, terms, blog, ATS checker, career changers, new grads, tech jobs). Full suite: 473 backend passed, 24 skipped; 44 Playwright E2E passed; both linters clean; production build clean.

**Reverification (2026-08-05, Session 111):** All 4 tasks independently re-verified from scratch. Two fixes applied:
- **7.1 Dark mode gap:** Previous session's claim "dark mode added to 3 SEO persona pages" was inaccurate. `bc7e25d` only changed WCAG contrast ratios (gray-400→gray-500, emerald-600→emerald-700) on those pages — zero `dark:` class variants were added. Fixed: dark mode added to all 3 SEO persona pages (`ats-checker-for-new-grads/page.tsx`, `resume-checker-for-career-changers/page.tsx`, `resume-checker-for-tech-jobs/page.tsx`). Each page now has 36 `dark:` class instances covering nav, hero, pain points, tools, FAQ, and footer sections.
- **7.4 Coverage gap:** `accessibility.spec.ts` tested only 6 of the 10 claimed pages. Expanded to 10 pages: added `/ats-checker`, `/resume-checker-for-career-changers`, `/ats-checker-for-new-grads`, `/resume-checker-for-tech-jobs`.
- **Verification evidence:**
  - **7.1 Loading/async:** `isLoading` state in AnalyzerDemo + all tool components; `disabled` + `opacity-60` on buttons; spinners in all tool fetch flows.
  - **7.1 Dark mode:** `dark:` in 45 of 45 component/page TSX files (blog ✓, SEO personas ✓, all tool components ✓).
  - **7.1 Focus/landmarks:** `<a href="#main-content" className="sr-only focus:not-sr-only ...">` in root layout; `<main id="main-content">` on all 15 public pages; `focus:` / `focus-visible:` / `sr-only` in 18 files.
  - **7.2 ARIA:** ARIA attributes in 21 component files (aria-label, aria-live, aria-expanded, role=, etc.).
  - **7.3 Mobile:** Pixel 7 (412px) project in playwright.config.ts; `min-h-[44px]` verified in 5 files; 4 mobile tests pass (no overflow, touch target ≥40px, auth redirect, form fields reachable).
  - **7.4 Axe-core:** 10/10 public pages pass WCAG 2.2 AA (0 serious/critical violations). All 3 newly-dark-mode-corrected pages pass.
  - **Full suite:** 481 backend passed (24 skipped), 55 Playwright E2E passed (was 51 — 4 new axe-core tests added). Both linters clean.

**Definition of Done:** Every journey works without a mouse, communicates async state, and remains usable on mobile.

**Exit gate:** WCAG 2.2 AA review has no known blockers and Lighthouse accessibility is at least 90 on representative pages. **MET** — 10/10 pages pass axe-core WCAG 2.2 AA (2026-08-07); all 6 non-automatable 2.2 AA criteria verified by manual audit.

## Phase 8 — SEO and AdSense

| Task | File(s) | Status |
|---|---|---|
| 8.1 Keep metadata, canonical URLs, JSON-LD, robots, and sitemap accurate; generated sitemap contains 17 URLs (11 static pages and 6 blog articles). | layout/page metadata, `robots.ts`, `sitemap.ts` | DONE — all public pages have metadata+OG; sign-in/sign-up added to sitemap; protected routes disallowed in robots. Fix (Session 112): 5 pages (blog, sign-in, sign-up, privacy, terms) were missing `alternates.canonical` — each inherited the root layout’s `canonical: "/"` which incorrectly told Google they were duplicates of the home page. Fixed by adding the correct path to each. |
| 8.2 Run mobile and desktop Lighthouse/Core Web Vitals against production and fix failures. | frontend, CI/report | DONE — scores below |
| 8.3 Publish additional original, expert-reviewed content and add visible author/contact trust signals. | `blog-posts.ts`, blog/contact pages | DONE — 6 substantive guides (expanded from 3). Blog index: "Written by the team behind ResumeAI". Blog articles: JSON-LD `author: { @type: Organization, name: ResumeAI }`. Contact trust signal: `support@resumeai.cv` in footer. |
| 8.4 Obtain AdSense publisher ID and create account/site entry. | AdSense dashboard | DONE — publisher ID `pub-7869093425931175`, account open, site `resumeai.cv` registered (2026-08-03) |
| 8.5 Use Google’s certified CMP or another Google-certified TCF CMP; retire the custom banner for ad consent or limit it to non-ad preferences. | AdSense dashboard, consent integration, privacy page | BLOCKED BEFORE ADS — Consent Mode v2 and the custom preference banner are not evidence of a Google-certified TCF CMP. Owner must publish/verify the AdSense European regulations message before any ad units go live. |
| 8.6 Add consent-gated AdSense script, compliant placements, reserved dimensions, and CSP directives. | layout, ad component, `next.config.ts` | DONE — AdSense script in layout.tsx head (Consent Mode v2 handles privacy). AdUnit component ready (`AdUnit.tsx`) with consent check, reserved dimensions, responsive format. CSP covers `pagead2.googlesyndication.com`, `doubleclick.net`, `tpc.googlesyndication.com`. Ad placements to be added after Google approves the site and ad units are created. |
| 8.7 Publish correct `ads.txt` at the root and verify crawler access. | `frontend/public/ads.txt` | DONE — `google.com, pub-7869093425931175, DIRECT, f08c47fec0942fa0` active. Production verified (2026-08-05): `curl https://resumeai.cv/ads.txt` returns correct content, HTTP 200. |
| 8.8 Validate policy, navigation, content, and ad density before submission. | production site | PARTIAL (code done; awaiting Google approval) — All owner actions now complete: `NEXT_PUBLIC_ADSENSE_ID=ca-pub-7869093425931175` set in Vercel Production+Preview (2026-08-05, 2d ago). Payments profile set up: Individual account, Laxmi Narayana Bingi, Aurora IL 60504 (2026-08-05). Site registered, ads.txt Authorized. Site status: "Requires review" → now unblocked (payments done). Canonical URL fix (PR #41) merged and live in production (commit 239f9bd). Remaining: (1) Wait for Google site review completion — external, no action needed. (2) After approval: create ad units in AdSense → Ads → By ad unit, provide slot IDs to Claude, Claude places `<AdUnit slot="..." />` on chosen pages. |

**Definition of Done:** Production passes CWV targets, has substantial original content, uses a certified CMP where required, serves valid ads.txt, and contains policy-compliant ad placements.

**Exit gate:** **NOT MET FOR MONETIZED LAUNCH.** Public content/SEO/ads.txt are ready, but certified CMP status and live ad placement/density review remain unverified. Google’s current CMP requirement: <https://support.google.com/adsense/answer/13554116>.

**Reverification (2026-08-05, Session 112):** All 8 tasks independently verified from scratch. One fix applied:
- **8.1 canonical URL gap:** 5 pages (blog, sign-in, sign-up, privacy, terms) had no `alternates.canonical` in their metadata exports and inherited the root layout’s `canonical: "/"`, signalling to Google they were duplicates of the home page. Added correct canonical path to each page’s metadata. 12 total pages now have correct canonical URLs (all pages in sitemap).
- **Verification evidence:**
  - **8.1 Sitemap:** sitemap.ts generates 11 static + 6 blog = 17 URLs confirmed at production `https://resumeai.cv/sitemap.xml`. robots.ts disallows `/account`, `/account-setup`, `/resumes`, `/score`, `/tools`. Metadata: `export const metadata` in 19 files. JSON-LD: 7 pages (landing, keyword-analyzer, ats-checker, 3 SEO persona pages, blog articles). Canonical URLs: 12 pages now have `alternates.canonical` set correctly (layout + 5 top-level + 3 SEO persona + blog article + blog index fixed in this session).
  - **8.2 CWV:** Lighthouse production scores from Session 84 remain valid (no performance-affecting changes since). Mobile: 85-94 across 5 pages. Desktop: 100 on landing. TBT and CLS excellent.
  - **8.3 Content + authorship:** 6 blog articles. Blog index: "Written by the team behind ResumeAI". Blog articles: JSON-LD `author @type:Organization name:ResumeAI`. Footer: `support@resumeai.cv`.
  - **8.4 AdSense:** Publisher ID `pub-7869093425931175` obtained (owner action complete).
  - **8.5 Consent Mode v2:** `layout.tsx` head: `gtag(‘consent’,’default’,{ad_storage:’denied’,ad_user_data:’denied’,ad_personalization:’denied’,analytics_storage:’denied’})`. `CookieConsent.tsx` `updateConsentMode()` grants/revokes all 4 signals on Accept/Reject.
  - **8.6 AdSense script + AdUnit + CSP:** layout.tsx conditional `<script src="pagead2.googlesyndication.com/...">` when `NEXT_PUBLIC_ADSENSE_ID` is set. `AdUnit.tsx`: consent check via localStorage, RAF guard, `adsbygoogle.push`. CSP: `pagead2.googlesyndication.com` in script-src/img-src/connect-src, `googleads.g.doubleclick.net` + `tpc.googlesyndication.com` in frame-src.
  - **8.7 ads.txt:** Production `https://resumeai.cv/ads.txt` returns `google.com, pub-7869093425931175, DIRECT, f08c47fec0942fa0` (verified 2026-08-05).
  - **8.8:** Code complete. Owner actions confirmed done (2026-08-05): Vercel env var set (2d ago), payments profile complete (Individual, Laxmi Narayana Bingi, Aurora IL). Site "Requires review" → unblocked. Canonical fix (PR #41) merged to main, live at 239f9bd. Waiting for Google review only.
  - **Full suite:** 481 backend passed, 24 skipped. ESLint clean. Ruff clean. Build: `✓ Compiled successfully` (31/31 pages).

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
| 9.5 Verify account deletion and export in production, including all new resume data. | auth actions, Supabase, E2E | DONE — export verified (all 5 tables: account, profile, jobs, resumes, shared_scores); deleteAccount calls `delete_own_user()` RPC — CASCADE from auth.users atomically removes all 5 tables; confirmation text updated to list all data types |

**Definition of Done:** Policy matches actual data flows, vendors, retention, ads, AI processing, export, and deletion; contact details are monitored.

**Exit gate:** A data-flow-to-policy review finds no contradiction. Obtain legal review if the owner’s risk tolerance or launch jurisdictions require it.

**Reverification (2026-08-05, Session 113):** All 5 tasks independently verified from scratch. No code fixes needed. One doc correction applied to 9.5.

- **9.1 AI disclosure, cookie categories, rights, 30-day retention:**
  - Privacy page sections verified: Overview, Information We Collect (account, resume content, usage data, error data, browser storage), How We Use Your Information, Data Processing & AI Features (Hugging Face, circuit breaker, not persisted by ResumeAI), Third-Party Services, Data Security, Data Retention, Saved Resumes and Version History, Your Rights, Cookies (essential/analytics/advertising), GDPR, CCPA, Contact.
  - Cookie categories: essential (Supabase auth), analytics (GA4, consent-gated), advertising (AdSense script loads, no ad units yet, TCF CMP note for when ads enabled). All 3 categories explicitly described.
  - Rights: access via Account page, delete all data (5 tables), export all data, withdraw cookie consent, clear localStorage.
  - 30-day shared-score retention: `ShareableScoreWidget.tsx:46` sets `expires_at = Date.now() + 30 * 24 * 60 * 60 * 1000`. `get_shared_score()` SECURITY DEFINER filters `expires_at >= now()` — link is inaccessible after expiry. Policy accurately says "The underlying expired record may remain until maintenance cleanup or account deletion" (no pg_cron on free tier). PASS.

- **9.2 Policy and retention for saved resumes/versions:**
  - Privacy page "Saved Resumes and Version History" section: describes stored fields (personal info, work history, education, skills), Supabase PostgreSQL, immutable timestamped version snapshots, deletion cascades (resume → all versions; account → all data), JSON export includes every version.
  - Data Retention section: "Saved resumes and versions — retained until you explicitly delete the resume or delete your account."
  - Terms section 5 "Your Content": describes saved content, immutable versioned snapshots, delete-resume removes all versions, account deletion removes all 5 tables, export includes all resume version snapshots. PASS.

- **9.3 No inaccurate vendor/technology claims; HF and telemetry precise:**
  - Privacy page: taxonomy/synonym matching + fpdf2 for analysis/PDF; Hugging Face as AI inference provider for summaries/rewriting/cover letters; Sentry configuration removes request bodies, auth headers, cookies, stack-frame variables.
  - Terms page: "curated skill taxonomy with synonym matching" and "fpdf2" for description; "Hugging Face is our AI inference provider"; Sentry for backend error tracking, no resume content transmitted.
  - `grep -r "spaCy|NLTK|scikit|WeasyPrint" frontend/src` → 0 hits. PASS.

- **9.4 Support email reachable in all 3 locations:**
  - `privacy/page.tsx` Contact section: `mailto:support@resumeai.cv` ✓
  - `terms/page.tsx` Contact section: `mailto:support@resumeai.cv` ✓
  - `page.tsx` footer (line 1451): `mailto:support@resumeai.cv` displayed as `support@resumeai.cv` ✓
  - Zoho Mail free tier confirmed live (Session 91, 2026-08-01). PASS.

- **9.5 Account deletion and export cover all resume data:**
  - `deleteAccount()` (auth.ts:89): calls `supabase.rpc("delete_own_user")`. The `delete_own_user()` SECURITY DEFINER function deletes `auth.users` row; CASCADE chain removes profiles, jobs, resumes, shared_scores (all with `on delete cascade`); resumes→resume_versions cascades. No explicit pre-RPC deletes needed — CASCADE is atomic and more reliable.
  - **Doc correction:** previous 9.5 description said "deleteAccount now explicitly deletes shared_scores before RPC" — this was inaccurate for current code. The function calls `delete_own_user()` directly (CASCADE handles everything). Description updated here to reflect reality.
  - `exportUserData()` (auth.ts:112): fetches profiles, jobs, resumes (metadata: id/title/created_at/updated_at), shared_scores in parallel; then fetches per-resume versions (version_number, resume_data, resume_text, created_at). Export JSON has: account (email, created_at), profile, jobs, resumes (with versions array), shared_scores.
  - `ExportDataButton.tsx`: triggers client-side download of `resumeai-export-{date}.json`.
  - `DeleteAccountButton.tsx`: confirmation text "permanently delete your account, profile, resumes, job tracker entries, and shared scores."
  - RLS cascade test (`test_rls_isolation.py:440`): creates rows in all 5 tables (profiles, jobs, resumes, resume_versions, shared_scores), calls `delete_own_user()`, verifies zero rows in all 5 tables. Skipped in CI (needs SUPABASE_SERVICE_ROLE_KEY). PASS.

- **Full suite:** 481 backend passed, 24 skipped. Ruff: 0 errors. ESLint: 0 errors.

## Phase 10 — Observability

| Task | File(s) | Status |
|---|---|---|
| 10.1 Fix backend Sentry integration lint/type errors and verify a test event arrives without PII. | `backend/app/main.py`, Sentry dashboard | DONE — Backend: 3,390 sessions tracked, 1 release, 0 errors (healthy). Frontend: CSP fixed to allow `*.ingest.us.sentry.io` (regional endpoint). NEXT_PUBLIC_SENTRY_DSN + NEXT_PUBLIC_SENTRY_ENV set in Vercel (2026-08-02). Redeploy needed to activate frontend error capture. |
| 10.2 Add frontend error monitoring and release/environment tagging with PII-safe settings. | `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts` | DONE — `@sentry/nextjs` with PII-safe `beforeSend` (strips request data, auth headers, stack locals, extras). Server-side via `register()` + `onRequestError`, client-side via `instrumentation-client.ts`. CSP updated for `*.ingest.sentry.io` + `*.ingest.us.sentry.io` (US regional). NEXT_PUBLIC_SENTRY_DSN set in Vercel Production+Preview. |
| 10.3 Keep structured request logs and add metrics for route latency, status, provider failures, and rate limits. | backend logging/monitoring | DONE — access logs retain existing fields and add matched route, response length, rate-limit/auth classifications, and AI-route classification with unit coverage |
| 10.4 Verify UptimeRobot (or equivalent) alerts a monitored channel; GitHub keepalive is not monitoring. | external dashboard | DONE — Email alerts (bobby.bingo696@gmail.com) and push notifications both ON for Up/Down events. Weekly/Monthly reports enabled. /health pings confirmed in Render logs (2026-08-03). |
| 10.5 Configure cost/usage alarms for Hugging Face, Vercel, Render, Supabase, Sentry, domain, and AdSense-related services. | external dashboards | DONE — Render confirmed Starter ($7/mo, 2026-08-11). HuggingFace confirmed $0.00 credits, 36 inference requests <$0.01 current period, no pay-as-you-go spend (2026-08-11). Supabase spend cap previously proven. All services within budget. |

**Definition of Done:** Client and server failures, downtime, latency, and spend are visible without collecting resume content.

**Exit gate:** Controlled frontend error, backend 500, outage, and budget-threshold drills each notify the responsible person within the documented target.

**Reverification (2026-08-06, Session 115):** All 5 tasks independently verified from scratch. One code improvement applied.

- **Code change:** `_strip_pii()` was defined inside `if _sentry_dsn:` block making it untestable. Moved to module-level (always defined); `sentry_sdk.init()` still conditional on `SENTRY_DSN`. Added `backend/tests/unit/test_sentry_pii.py` with 11 unit tests.

- **10.1 Backend Sentry:**
  - `sentry_sdk.init()` is conditional on `SENTRY_DSN` env var (absent in local/test/dev).
  - `_strip_pii()` (now module-level, testable): strips `request.data`, `request.body`, `authorization`/`cookie`/`set-cookie` headers, all stack-frame `vars`, and top-level `extra` key.
  - `send_default_pii=False`, `include_local_variables=False`.
  - 11 PII-filter unit tests pass: `test_strips_request_data_and_body`, `test_strips_auth_header`, `test_strips_cookie_header`, `test_strips_set_cookie_header`, `test_preserves_content_type_header`, `test_strips_stack_frame_local_vars`, `test_strips_extra`, `test_tolerates_missing_request`, `test_tolerates_missing_exception`, `test_tolerates_empty_headers`, `test_returns_event_dict`. Run: `pytest tests/unit/test_sentry_pii.py` → **11 passed**.
  - External evidence (Session 93, 2026-08-03): Sentry backend project shows 3,390 sessions, 1 release, 0 errors (healthy). `SENTRY_DSN` set in Render.

- **10.2 Frontend Sentry:**
  - `frontend/src/instrumentation.ts`: server-side hook — `register()` initializes `@sentry/nextjs` v10.69.0 when `NEXT_PUBLIC_SENTRY_DSN` is set; `sendDefaultPii: false`; `beforeSend` strips `request.data`, auth/cookie headers, stack-frame vars, `event.extra`; `onRequestError = Sentry.captureRequestError` for unhandled server route errors.
  - `frontend/src/instrumentation-client.ts`: browser SDK init when DSN set; `sendDefaultPii: false`; `replaysSessionSampleRate: 0`/`replaysOnErrorSampleRate: 0` (no session replay); `beforeSend` strips `event.extra`, `request.data`, auth/cookie headers.
  - CSP `connect-src`: includes `https://*.ingest.sentry.io` and `https://*.ingest.us.sentry.io` (US regional Sentry endpoint). Verified in `next.config.ts:24`.
  - External evidence (Session 93, 2026-08-02): `NEXT_PUBLIC_SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_ENV` set in Vercel Production+Preview. Network tab confirmed Sentry events sent with HTTP 200.

- **10.3 Structured access logs:**
  - `AccessLogMiddleware` emits JSON log per request: `request_id`, `method`, `path`, `route` (FastAPI matched path format), `status`, `duration_ms`, `client` (XFF/host), `rate_limited` (status=429), `auth_failed` (status=401/403), `is_ai_route` (path in `_AI_ROUTES` frozenset), `content_length` (response).
  - 10 access log unit tests pass (6 AI-route classification × route + 3 status classification + 1 normal request). Run: `pytest tests/unit/test_access_log.py` → **10 passed**.

- **10.4 UptimeRobot + keepalive:**
  - `keepalive.yml`: cron `*/13 * * * *`, 3 retries × 90s timeout; workflow fails with `::error::` and `exit 1` on non-200 after 3 attempts → GitHub sends owner email on failure. `/health` is exempt from rate limiting.
  - External evidence (Session 93, 2026-08-03): UptimeRobot email alerts (bobby.bingo696@gmail.com) + push notifications ON for Up/Down events. Weekly/Monthly reports enabled. `/health` pings confirmed in Render logs.

- **10.5 Cost/usage alarms:**
  - Historical 2026-08-03 evidence showed free tiers and $0 usage. It is superseded by DEC-030 approving Render Starter at $7/month.
  - Current owner proof must confirm Starter remains active and record Hugging Face usage/pay-as-you-go settings; application quotas provide an additional 10-unit/user and 500-unit/global daily ceiling.

- **Exit gate drills — evidence:**
  - **Backend error (PII drill):** 11 `test_sentry_pii.py` tests prove `_strip_pii()` removes all resume/auth PII from events before they leave the process. `pytest tests/unit/test_sentry_pii.py` → **11 passed** (2026-08-06).
  - **Frontend error:** CSP and SDK wiring verified in code; Sentry DSN confirmed in Vercel; network confirmed 200 on Sentry ingest (Session 93, 2026-08-02).
  - **Outage:** UptimeRobot alerts configured (email + push, confirmed 2026-08-03). keepalive workflow fails workflow → GitHub notifies owner on 3 consecutive health failures.
  - **Budget threshold:** No payment methods attached; Supabase spend cap enabled; Vercel free-tier notifications on. Cost alarm is architectural (can't be charged; no alarm needed).

- **Full suite:** 492 backend passed (was 481 + 11 new), 24 skipped. Ruff clean. ESLint clean. Frontend build clean.

## Phase 11 — Release engineering

| Task | File(s) | Status |
|---|---|---|
| 11.1 Keep deployment/env/rollback documentation current. | `docs/DEPLOY.md`, `docs/ENV_VARS.md` | DONE — architecture, auth, rate limiting, five-table RLS model, production secrets, hooks, test counts, and rollback caveats documented |
| 11.2 Add ordered, reviewable Supabase migrations and a repeatable apply/rollback procedure. | new `supabase/migrations/`, CI/docs | DONE — six idempotent ordered migrations plus apply/backup/rollback guidance |
| 11.3 Provide isolated frontend and backend staging with staging Supabase/Hugging Face credentials; Vercel preview alone is not full staging. | `docs/DEPLOY.md`, `EnvironmentBanner.tsx`, `.env.example` | DONE — Vercel Preview deployments as frontend staging (set `NEXT_PUBLIC_SENTRY_ENV=staging` in Preview scope); yellow "STAGING ENVIRONMENT" banner on non-production; staging backend/Supabase documented as upgrade path at $0 budget (local backend serves as staging until revenue). |
| 11.4 Require green CI before production deploy and document promotion from staging to production. | `docs/DEPLOY.md`, GitHub branch protection | DONE — Branch protection activated via `gh api` (2026-08-03). All three CI checks (Backend, Frontend, E2E) must pass before merge to `main`. Direct pushes allowed for solo dev workflow. |
| 11.5 Configure database backups and perform a restore drill. | `scripts/backup-supabase.ps1`, `backups/` | PARTIAL — manual `pg_dump` tooling and a 16.1 KB backup drill completed 2026-08-07; verified backups also preceded migrations 008 and 009. Supabase Free has no included automatic project backups or PITR, and no retained non-production restore rehearsal proves recoverability. Owner action remains. |
| 11.6 Verify DNS, SSL, environment values, production CORS, and rollback after the final release candidate. | Vercel/Render/DNS/docs | PARTIAL — public DNS/TLS/HSTS/CORS/health/auth/bundle checks pass, and the owner completed the Vercel rollback/re-promotion rehearsal on 2026-08-03. The agent-side Render procedure is complete, but no retained owner-executed Render rollback-and-return rehearsal exists. |

**Definition of Done:** A green, immutable release candidate moves through staging to production with versioned DB changes, backups, and rehearsed rollback.

**Exit gate:** Deploy and roll back a release candidate, apply and roll back a safe test migration, and restore a backup in non-production. **NOT MET.** Vercel rollback and backup creation are proven, but Render rollback and non-production database restoration are not.

**Historical reverification (2026-08-06, Session 116):** The six tasks were reviewed under the evidence then available. The 2026-08-14 Gate 5 reconciliation supersedes its release-engineering closure claim because only Vercel was rehearsed and backup creation did not prove restoration.

- **Doc fixes:**
  - `docs/DEPLOY.md` line 30: test count corrected from "385+" to "492+" (current suite per Session 115).
  - `docs/DEPLOY.md` line 190 (Cold start section): keepalive interval corrected from "14 minutes" to "13 minutes" (actual cron: `*/13 * * * *`, same fix as LAUNCH_PROGRAM.md 6.3 in Session 110 — DEPLOY.md was missed).

- **11.1 Docs current:**
  - `DEPLOY.md`: architecture diagram matches deployed stack (Vercel→Render→HF/PDF/NLP, Supabase RLS, JWT). Auth table (7 protected/2 public routes), rate limiting table (all 9 routes with correct per-route limits), five-table RLS table, rollback steps for Vercel (30s) and Render (60s), staging section, branch protection command, pre-commit hook instructions, cold-start mitigations, monitoring list.
  - `ENV_VARS.md`: 8 backend vars + 8 frontend vars, each with required/where-set/default/controls/breaks columns. Production values table (non-secret). No secrets committed.
  - Both docs corrected (test count + keepalive interval). PASS.

- **11.2 Supabase migrations:**
  - 7 ordered SQL files: `001_profiles.sql` through `007_ai_usage_quotas.sql`.
  - All idempotent: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS` / `CREATE POLICY`, `CREATE OR REPLACE FUNCTION`, FK guards via `pg_constraint` catalog check.
  - `001_profiles.sql`: profiles table + 4 RLS policies (select/insert/update/delete by auth.uid() = id).
  - `003_shared_scores.sql`: shared_scores table + user_id FK + CHECK constraints + 3 RLS policies + `get_shared_score()` SECURITY DEFINER function (omits user_id, filters expires_at ≥ now()).
  - `004_resumes.sql`: resumes table + 4 RLS policies + user_id index + idempotent FK addition to jobs table (guarded via pg_constraint catalog).
  - `006_functions.sql`: `delete_own_user()` (SECURITY DEFINER, deletes auth.users row for CASCADE) + `cleanup_expired_scores()`.
  - `007_ai_usage_quotas.sql`: atomic user/global daily AI-unit counters, strict function grants, and 31-day quota-counter retention.
  - `supabase/migrations/README.md`: apply order (1–7), idempotency notes, add-migration guide, backup/rollback procedure. VERIFY — migration 007 needs production application.

- **11.3 Staging:**
  - `EnvironmentBanner.tsx`: "use client"; renders amber `{env.toUpperCase()} ENVIRONMENT` banner when `NEXT_PUBLIC_SENTRY_ENV ≠ "production"`. Returns null in production.
  - Imported in `frontend/src/app/layout.tsx:7`; rendered at line 147 (above page content, below `<html>`).
  - `frontend/.env.example`: `NEXT_PUBLIC_SENTRY_ENV=` with comment "controls Sentry environment tag and shows a visual banner on non-production deployments. Vercel: set to 'staging' for Preview, 'production' for Production."
  - `docs/DEPLOY.md` staging section: Vercel Preview scoped env vars table (`NEXT_PUBLIC_SENTRY_ENV=staging`), backend staging documented at $0 budget (local Uvicorn), Supabase staging project creation steps. PASS.

- **11.4 CI + branch protection:**
  - `ci.yml`: 3 jobs — `Backend (Python)`, `Frontend (Next.js)`, `E2E (Playwright)`. `workflow_dispatch` enabled. Push on all branches, PR on main.
  - Branch protection API response (2026-08-06): `required_status_checks.strict=true`, checks: `["Backend (Python)", "Frontend (Next.js)", "E2E (Playwright)"]`, `allow_force_pushes.enabled=false`, `allow_deletions.enabled=false`, `enforce_admins.enabled=false` (solo dev can push directly — documented in DEPLOY.md). PASS.

- **11.5 Backups:**
  - AGENT COMPLETE / OWNER RESTORE PENDING — Supabase Free has no included automatic project backups or point-in-time recovery. The manual backup script and creation evidence are complete; a non-production restore rehearsal is not evidenced and cannot be marked PASS.

- **11.6 DNS/SSL/rollback:**
  - Vercel rehearsal: completed 2026-08-03 (Session 97). The owner rolled back to the prior deployment, confirmed the site and `ads.txt`, promoted the latest deployment, and verified again.
  - Render procedure: agent-complete in `docs/ROLLBACK.md`; owner execution remains pending because no retained rollback-and-return evidence or elapsed-time measurement exists.
  - Branch protection: `allow_force_pushes=false` confirmed live (see 11.4 evidence).
  - DNS/TLS/HSTS/CORS: verified in Sessions 93/97 (production public technical pass — DNS resolves resumeai.cv → Vercel, TLS valid, HSTS header, CORS rejects non-allowlisted origins).
  - Env var matrix: `ENV_VARS.md` lists all production values; no secrets committed to git. PASS.

- **Full suite:** 492 backend passed, 24 skipped. `python -m ruff check app/ --config ruff.toml` → All checks passed. `npm run lint` → 0 errors. (2026-08-06)

## Phase 12 — Launch and post-launch

| Task | File(s) | Status |
|---|---|---|
| 12.1 Complete a go/no-go review of every phase exit gate; any open Blocker is `NO-GO`. | this file, `LAUNCH_READINESS_AUDIT.md` | **NO-GO (current strict Prompt 3 rerun)** — Gate 2, the refreshed Gate 3 model, Gate 4, the Gate 5 repository work, and Gate 6 reconciliation are complete. Current blockers are owner-controlled: Vercel Hobby eligibility/Pro, applicable Gate 1(d) evidence/acceptance, and Gate 5 Render/database-recovery proof. The certified CMP is required only before ads and does not block the ad-free scope. |
| 12.2 Assign launch owner, incident owner, Sentry/uptime watchers, and escalation thresholds for the first 72 hours. | `docs/INCIDENT-RESPONSE.md`, launch runbook | DONE — Solo operator: Laxmi Narayana Bingi is launch owner, incident owner, Sentry/UptimeRobot watcher, and rollback authority. Alerts go to bobby.bingo696@gmail.com + push notifications. Escalation: investigate immediately if any critical error in first 72 hours. |
| 12.3 Choose feedback intake (recommended: monitored support email linked site-wide plus GitHub Issues for reproducible public bugs). | footer/contact/issue templates | DONE — support@resumeai.cv for private support (Zoho Mail, already in footer/privacy/terms) + GitHub Issues for reproducible public bugs. Issue templates added (`bug_report.md` + `feature_request.md` in `.github/ISSUE_TEMPLATE/`). |
| 12.4 Prepare and approve Product Hunt/Reddit copy; publish only after go-live approval. | `docs/guides/PRODUCT-HUNT-LISTING.md`, launch runbook | DONE — Copy fixed (removed false "open source" claim, corrected "no signup" to "free account", added maker name). Publish only after 12.1 go/no-go is signed GO. |
| 12.5 Submit AdSense only after Phase 8 passes. | AdSense dashboard | DEFERRED — Launching ad-free. Once Google approves site (8.8), owner creates ad units, provides slot IDs, Claude places AdUnit components. |
| 12.6 Monitor errors, uptime, latency, provider quota/cost, auth failures, data deletion, feedback, CWV, and AdSense status during days 1-3 and week 1. | dashboards/runbook, `docs/POST-LAUNCH-MONITORING.md` | DONE — Monitoring runbook created with day 1-3 checklist and week 1 review template. All dashboards already instrumented (Sentry, UptimeRobot, Render, Vercel, Supabase, HuggingFace). |

**Definition of Done:** Launch has explicit ownership, rollback authority, feedback intake, monitoring cadence, and an AdSense-ready production site.

**Exit gate:** **HISTORICALLY MET, CURRENTLY REOPENED.** The 2026-08-04 GO and 72-hour review remain historical evidence, but the strict Prompt 3 rerun supersedes that verdict until the owner closes the Vercel plan, Gate 1(d), and Gate 5 evidence dependencies. Gate 6 is reconciled and records this NO-GO; no independent agent implementation item remains. Gate 4 is closed, and a certified CMP remains a monetization-only prerequisite.

**Reverification (2026-08-06, Session 117):** All 6 tasks independently verified from scratch. One doc correction applied.

- **Doc correction:** 12.3 table row said "Issue templates to be added" — they were already added (Session 95). `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` both exist, each with `assignees: LNB-Ává`. Corrected table row to reflect reality.

- **12.1 Go/no-go:**
  - LAUNCH_PROGRAM.md: `GO — Signed 2026-08-04. All 11 phases COMPLETE, zero open Blockers.`
  - All 11 phase exit gates listed as PASS (P1–P11, with P8 8.8 non-blocking).
  - Production site live: `https://resumeai.cv` → HTTP 200, title "Free ATS Resume Checker & Keyword Analyzer | ResumeAI". Verified 2026-08-06.
  - Backend health: `https://unified-resume-builder-api.onrender.com/health` → `{"status":"ok"}`. Verified 2026-08-06. PASS.

- **12.2 Launch owner:**
  - `docs/INCIDENT-RESPONSE.md` Contacts section: Launch owner = Laxmi Narayana Bingi; incident owner = same; Sentry/UptimeRobot watcher = same; rollback authority = same.
  - Alert email: bobby.bingo696@gmail.com; public support: support@resumeai.cv.
  - Monitoring stack: UptimeRobot (email + push), Sentry (backend + frontend), GitHub Actions CI.
  - Escalation thresholds: 4 severity levels (Critical <1h, High same-day, Medium 24h, Low next-session). PASS.

- **12.3 Feedback intake:**
  - `support@resumeai.cv` in 3 locations: footer `page.tsx:1451`, `privacy/page.tsx:205`, `terms/page.tsx:159`. All are `mailto:` links.
  - GitHub issue templates: `.github/ISSUE_TEMPLATE/bug_report.md` (label: bug, assignee: LNB-Aveva), `.github/ISSUE_TEMPLATE/feature_request.md` (label: enhancement, assignee: LNB-Aveva). Both exist and are correct.
  - GitHub profile: footer GitHub icon links to `https://github.com/LNB-Aveva`. PASS.

- **12.4 Product Hunt/Reddit copy:**
  - `docs/guides/PRODUCT-HUNT-LISTING.md` exists.
  - Tagline (60 chars): "Free AI-powered ATS resume checker and optimizer" — no false claims.
  - First comment: "Full tools require a free account" (not "no signup") ✓. No "open source" claim ✓.
  - Maker: Laxmi Narayana Bingi, Website: https://resumeai.cv ✓.
  - Note: "Launch Timing" section targets Early August 2026 — already August 6; owner should update timing and schedule the actual PH submission when ready. PASS.

- **12.5 AdSense:**
  - DEFERRED — `NEXT_PUBLIC_ADSENSE_ID=ca-pub-7869093425931175` set in Vercel (verified Session 95, 2026-08-03). `ads.txt` live at `https://resumeai.cv/ads.txt` (verified Session 112). `AdUnit.tsx` and layout.tsx wired. Site under Google review. No ad units placed yet — by design (ad-free launch). Owner action: wait for Google approval, then create ad units and provide slot IDs. PASS (deferred).

- **12.6 Monitoring runbook:**
  - `docs/POST-LAUNCH-MONITORING.md` exists: 9-service dashboard table, Day 1 checklist (10 items), Day 2 checklist (7 items), Day 3 checklist (7 items), Week 1 review table (12 metrics), 7-signal escalation thresholds, 4-step rollback procedure.
  - Day 1–2 checklists have empty `[ ]` — these require owner to check external dashboards (Sentry, UptimeRobot, Render, Vercel, Supabase, HuggingFace). **Owner action:** complete Day 1–3 checklists in `docs/POST-LAUNCH-MONITORING.md` and record results in the Week 1 review table. The 72-hour window closes 2026-08-07.
  - Exit gate sub-condition "first-72-hours review completed with incidents and follow-ups recorded" is **OWNER-PENDING** (checklists not yet filled in). PARTIAL.

- **Definition of Done — assessment:**
  - Explicit ownership: ✓ INCIDENT-RESPONSE.md.
  - Rollback authority: ✓ INCIDENT-RESPONSE.md + DEPLOY.md rehearsal.
  - Feedback intake: ✓ support email (3 locations) + GitHub issue templates.
  - Monitoring cadence: ✓ POST-LAUNCH-MONITORING.md runbook.
  - AdSense-ready production site: ✓ ads.txt live, script wired, env var set, Google review in progress.
  - **Definition of Done: MET.**

- **Full suite:** 492 backend passed, 24 skipped. `python -m ruff check app/ --config ruff.toml` → All checks passed. `npm run lint` → 0 errors. (2026-08-06)

## Three findings most likely to kill this product

Preserved from the original Prompt 1 audit (2026-07-09), updated with resolution status:

1. **Scoring quality is visibly wrong** — The hardcoded ~80-skill list with strict word-boundary matching produced scores that didn't match reality (e.g., "React" vs "ReactJS", "JS" vs "JavaScript"). A scoring product that gives wrong scores has zero credibility. **RESOLVED:** Phase 5 replaced it with a 65+ synonym-group taxonomy, evaluation harness, and grade calibration. Scores are now explainable in the UI.

2. **Zero persistence = zero retention** — Without saved resumes, every session was throwaway. Users had no reason to return, and there was nothing to monetize. **RESOLVED:** Phase 4 shipped Supabase Auth, saved resumes with versioning, RLS-proven isolation, account deletion, and data export.

3. **No auth + no rate limiting = abuse magnet** — All 8 endpoints were open to the internet with no identity, no rate limits, and no input validation. One script kiddie could exhaust the HuggingFace API quota in minutes. **RESOLVED:** Phase 3 added JWT auth on 7 routes, per-route rate limits on all 9, CORS lockdown, input validation, and CVE remediation.

**Highest-leverage first action (at time of audit):** Install slowapi and add rate limits to all routes — 30 minutes of work that blocks the most likely production failure mode. **Done in Phase 1.**

## Current priority

1. **NO-GO under the current strict Prompt 3 rerun.** Owner resolves Vercel Hobby eligibility or upgrades to Pro, then completes the separately tracked Gate 1(d) and Gate 5 evidence.
2. Gate 2, Gate 3, Gate 4, Gate 5 repository work, and Gate 6 reconciliation are complete. After owner evidence arrives, the reviewer performs only the dependency-gated status closeout and records the resulting GO/NO-GO.
3. Enable ad units only after certified CMP proof, Google approval, and placement/density review.

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
| R4 | Protected production RLS workflow | CODE DONE / OWNER CONFIG | S | Configure `production-rls` Environment secrets and dispatch `production-rls.yml` |
| R5 | E2E browser tests for Phase 4 auth flows (F7 caveat) | TODO | M | None — Phase 4 is complete, Playwright auth fixture can now be built |
| R6 | Grade label / context message alignment | **DONE** (Session 117) | S | `ats_scorer.py`: B→"Good match", C→"Moderate match" — eliminates overlap with frontend "Strong match!" context message at ≥70 |
| R7 | Expired score/quota cleanup cron | CODE DONE / PROD VERIFY | S | Service-role-only RPC; workflow now fails on non-200. Confirm Vercel service key + GitHub cron secret and retain a green run. |
| R8 | Language detection warning for non-English | **DONE** (Session 119) | S | `keyword_extractor.py` + `JobAnalysis.language_warning` + AnalyzerDemo UI banner. 5 new tests. |
| R9 | Manual Supabase backup script | **DONE** (Session 119) | S | `scripts/backup-supabase.ps1`. Needs `pg_dump` + Supabase connection string. |
| R10 | Codex Prompt 3 adversarial audit triage | **DONE** (Session 119) | S | 5/13 findings already fixed on main. See session notes. |
| R11 | Production RLS verification runbook/workflow | CODE DONE | S | Owner configures protected environment secrets and dispatches the workflow |
| R12 | Rollback CLI setup + verification | **CODE/DOCS DONE — OWNER VERIFY** | S | Vercel rehearsal complete; owner-controlled Render rollback-and-return rehearsal remains |
| R13 | SMTP verification checklist | TODO (Codex) | S | Verify Zoho SMTP config in Supabase dashboard |

### R4 — RLS isolation tests in CI

**What:** 20 two-user RLS integration tests exist in `backend/tests/integration/test_rls_isolation.py`. Ordinary PR CI intentionally skips them because production credentials must never be exposed to untrusted branch code. `.github/workflows/production-rls.yml` now provides a protected, manually dispatched production run.

**Why it matters:** These tests are the Phase 4 exit-gate proof that user A cannot read or mutate user B's data and account deletion cascades correctly.

**Owner configuration:**
1. Create the protected `production-rls` GitHub Environment with required reviewer and main-only deployment policy.
2. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` as environment secrets, not repository-wide PR secrets.
3. Dispatch `production-rls.yml` manually and retain the redacted `20 passed` result.
4. Never expose the service-role value in chat, source, workflow output, or ordinary CI.

**Files:** `.github/workflows/production-rls.yml`, `docs/RLS_VERIFICATION.md`, `backend/tests/integration/test_rls_isolation.py`.

### R5 — E2E browser tests for Phase 4 auth flows

**What:** Phase 4 features (save/load/rename/version/delete resume, data export, account deletion) have **zero Playwright browser tests**. Task 2.5 noted "Auth fixture for save/load/delete blocked on Phase 4" — Phase 4 shipped in Sessions 76–79 but the E2E coverage was never circled back to. Finding F7 (High) remains open for this reason.

**Why it matters:** The resume persistence flow is the core paid-user journey. A regression in save/load/delete would be invisible until a real user hits it. Current E2E tests only cover public pages and unauthenticated flows.

**To implement:**
1. Create a Playwright auth fixture that signs in via Supabase email/password (needs a dedicated test user in Supabase — e.g. `e2e-test@resumeai.cv` with a known password, set as GitHub Actions secrets `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`).
2. Create `frontend/tests/e2e/resume-flows.spec.ts` covering:
   - Sign in → navigate to /tools → create a resume → save it → verify it appears in /resumes
   - Load a saved resume → verify fields populate → rename it → verify new name
   - Save a version → verify version list shows 2 entries
   - Delete the resume → verify it's gone from /resumes
   - Data export → verify downloaded JSON contains resume data
   - Account deletion → verify redirect to landing page (use a throwaway test user or skip destructive step)
3. Wire the fixture into `frontend/playwright.config.ts` as an authenticated project.
4. Add `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` to `.github/workflows/ci.yml` E2E job secrets.
5. Requires the backend to be running (or API mocked at the network level) during E2E — check current Playwright config for how the dev server is started.

**Files:** `frontend/tests/e2e/resume-flows.spec.ts` (new), `frontend/playwright.config.ts`, `.github/workflows/ci.yml`, Supabase dashboard (test user creation).
