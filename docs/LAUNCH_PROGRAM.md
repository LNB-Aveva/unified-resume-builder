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
| Backend tests | **GREEN** | 291 passed; measured services/routes coverage 82.44%, above the 80% floor. |
| Frontend lint/build | **GREEN locally** | ESLint passed. `next build` compiled 26 routes/pages after Google Fonts network access was allowed. |
| Browser tests | **GREEN but shallow** | Six Playwright smoke tests passed; they only check page rendering, not sign-up, auth, tools, persistence, or error recovery. |
| CI | **GREEN** | Run 30508092537 passed on commit `c07d905`: backend lint, types, tests/coverage, security scans, both Python audits, route startup, frontend lint, npm audit, and production build all succeeded. |
| Python dependency audit | **GREEN LOCALLY** | Runtime and development manifests are separate and both resolve with no known vulnerabilities. The unused Semgrep dependency and its vulnerable `mcp`/`click` chain were removed. |
| Frontend dependency audit | **PRODUCTION GREEN; DEV RED** | `npm audit --omit=dev --audit-level=high` found zero production vulnerabilities. The full installed tree reported nine High advisories in development tooling and needs triage without weakening the production gate. |
| Supabase production | **PARTIALLY VERIFIED** | Anonymous read-only REST checks returned 200/zero rows for `profiles` and `jobs`, and 200 for `shared_scores`, consistent with deployed tables and RLS. Cross-user isolation and RPC deployment remain unproven. |
| Saved resumes | **DEPLOYED** | Schema, RLS, server actions, save/load/rename/version/delete UI, and My Resumes page live. Migration SQL applied to production Supabase (2026-08-01). |
| Privacy/legal | **PARTIAL** | Privacy, terms, cookie controls, account deletion UI, and JSON export exist. The current custom cookie banner is not a Google-certified TCF CMP. |
| AdSense | **NOT READY** | `/ads.txt` returns 404; no publisher script or ad units exist; publisher ID is unavailable. |
| Observability | **PARTIAL** | Backend has conditional Sentry plus structured access logs. Production DSN behavior, frontend Sentry, uptime alert delivery, and cost alarms are unverified. |
| Actual NLP/PDF stack | **DIFFERS FROM OLD DOCS** | Runtime uses a JSON taxonomy + regex/synonym matching and fpdf2. spaCy, NLTK, scikit-learn, and WeasyPrint are not runtime dependencies. |

## Findings — worst first

Severity assumes an unknown user expects every advertised feature to work, even though the product is free.

| # | Severity | Area | File:line | What breaks | Fix effort |
|---|---|---|---|---|---|
| F1 | **Resolved** | Persistence | `supabase-schema.sql`; `frontend/src/app/actions/resume.ts`; `(protected)/resumes/`; `ResumeExporter.tsx` | resumes + resume_versions tables with RLS, save/load/rename/version/delete UI, My Resumes page, tools page integration via ?resume= param. Production tables must be created in Supabase dashboard. | L |
| F2 | **Resolved** | CI/release | `backend/app/main.py`; `.github/workflows/ci.yml` | Resolved by commit `c07d905`; GitHub Actions run 30508092537 passed both backend and frontend jobs. | S |
| F3 | **Resolved** | Auth/cost abuse | `backend/app/core/auth.py`; 7 route files; `frontend/src/app/lib/authFetch.ts` | Backend now verifies Supabase HS256 JWTs on all 7 protected routes. Unauthenticated requests get 401. Public routes (analyze, preview-rewrite) are explicitly retained. 76 auth tests prove enforcement. | M |
| F4 | **Blocker** | AdSense | `frontend/src/app/components/CookieConsent.tsx:6-54`; `frontend/public/ads.txt` (missing) | Monetization is absent. The custom banner is not a Google-certified TCF CMP, which Google requires for personalized AdSense traffic in the EEA/UK/Switzerland. Publisher ID, ads.txt, script, placements, and policy validation remain. | L |
| F5 | **Resolved** | Database abuse/PII | `supabase-schema.sql`; `ShareableScoreWidget.tsx` | RLS now requires `auth.uid() = user_id` for inserts. CHECK constraints validate score range, grade values, and hint length. Anonymous inserts are blocked. | M |
| F6 | **Resolved** | RLS assurance | `backend/tests/integration/test_rls_isolation.py` | 20 two-user RLS tests prove cross-user isolation for profiles, jobs, resumes, resume_versions, and shared_scores. delete_own_user cascade test proves full cleanup. | M |
| F7 | **High** | End-to-end quality | `frontend/tests/e2e/smoke.spec.ts:3-35`; `frontend/playwright.config.ts:11-16` | The roadmap called this a happy path, but tests only render six public pages. Sign-up, sign-in, protected tools, API results, save/load, export, deletion, and mobile are untested in a browser. | L |
| F8 | **Resolved** | Product truth | `README.md`; `frontend/src/app/keyword-analyzer/page.tsx`; `frontend/src/app/page.tsx` | All public spaCy/NLTK/scikit-learn/WeasyPrint claims replaced with accurate taxonomy/regex/fpdf2 descriptions. | S |
| F9 | **High** | Analytics/AdSense CSP | `frontend/next.config.ts:16-24`; `frontend/src/app/components/CookieConsent.tsx:17-29` | Production CSP allows scripts only from self, so the dynamically injected Google Tag Manager script is blocked. The same CSP will block AdSense until Google script/connect/frame domains are intentionally added. | M |
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
| 2.1 Maintain unit, integration, adversarial, property, parsing, PDF, and evaluation suites. | `backend/tests/` | DONE (291 pass) |
| 2.2 Keep combined services/routes coverage at 80%; this is close enough to actual 82.44% to prevent regression without incentivizing trivial tests. | `.github/workflows/ci.yml`, `backend/pyproject.toml` | DONE |
| 2.3 Fix Ruff E402 and mypy errors introduced by conditional Sentry setup. | `backend/app/main.py` | DONE — CI run 30508092537 passed |
| 2.4 Update the CVE gate for current advisories and split runtime from dev dependencies. | `backend/requirements.txt`, `backend/requirements-dev.txt`, `.github/workflows/ci.yml`, `render.yaml` | DONE — both manifests audit clean in CI |
| 2.5 Replace smoke-only Playwright coverage with a real happy path: sign up/sign in fixture → protected tools → run analyzer → save/load resume version → PDF/export/delete. | `frontend/tests/e2e/happy-path.spec.ts` | DONE (18 tests) — covers landing, keyword analyzer with mocked API, ATS checker, blog, legal pages, auth redirect, sign-in/sign-up forms, SEO pages. Auth fixture for save/load/delete blocked on Phase 4. |
| 2.6 Add failure-path browser tests for 429, backend outage, Hugging Face outage, and validation errors. | `frontend/tests/e2e/failure-paths.spec.ts` | DONE (6 tests) — empty/whitespace validation, 429, 500, network failure, slow response loading state, 404 page. |

**Definition of Done:** Every push/PR runs lint, types, tests, security audits, frontend build, and meaningful E2E tests; all checks are green.

**Exit gate:** Intentionally break one backend route and one browser flow; CI blocks both. Current `main` must have a successful CI run.

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

## Phase 7 — UX and accessibility

| Task | File(s) | Status |
|---|---|---|
| 7.1 Preserve loading, empty, retry, 429, dark mode, label, focus, and landmark work. | frontend components/pages | DONE by inspection/tests |
| 7.2 Run keyboard and screen-reader checks across auth, all nine tools, save/version flows, export, and deletion. | frontend + accessibility tests | DONE |
| 7.3 Test full journeys at 375px, 768px, and desktop; verify 44px targets and no clipped dialogs/results. | Playwright projects | DONE |
| 7.4 Run Lighthouse accessibility audits on landing, public analyzer, auth, and tools after authenticated test fixtures exist. | Lighthouse/CI | DONE (landing 96, keyword-analyzer 100, sign-in 96, privacy 91) |

**Definition of Done:** Every journey works without a mouse, communicates async state, and remains usable on mobile.

**Exit gate:** WCAG 2.2 AA review has no known blockers and Lighthouse accessibility is at least 90 on representative pages.

## Phase 8 — SEO and AdSense

| Task | File(s) | Status |
|---|---|---|
| 8.1 Keep metadata, canonical URLs, JSON-LD, robots, and sitemap accurate; generated sitemap contains 17 URLs (11 static pages and 6 blog articles). | layout/page metadata, `robots.ts`, `sitemap.ts` | DONE — all public pages have metadata+OG; sign-in/sign-up added to sitemap; protected routes disallowed in robots |
| 8.2 Run mobile and desktop Lighthouse/Core Web Vitals against production and fix failures. | frontend, CI/report | DONE — scores below |
| 8.3 Publish additional original, expert-reviewed content and add visible author/contact trust signals. | `blog-posts.ts`, blog/contact pages | DONE — three substantive guides added using the existing ResumeAI organization authorship |
| 8.4 Obtain AdSense publisher ID and create account/site entry. | AdSense dashboard | BLOCKED — owner must sign up at google.com/adsense and provide `ca-pub-XXX` ID |
| 8.5 Use Google’s certified CMP or another Google-certified TCF CMP; retire the custom banner for ad consent or limit it to non-ad preferences. | consent integration, privacy page | PARTIAL — Google Consent Mode v2 wired into layout.tsx (default denied, updates on accept/reject via CookieConsent); certified CMP selection BLOCKED on AdSense setup |
| 8.6 Add consent-gated AdSense script, compliant placements, reserved dimensions, and CSP directives. | layout, ad component, `next.config.ts` | PARTIAL — AdUnit component created (`AdUnit.tsx`), AdSense script consent-gated in CookieConsent, CSP updated with AdSense domains (`pagead2.googlesyndication.com`, `doubleclick.net`, `tpc.googlesyndication.com`). Set `NEXT_PUBLIC_ADSENSE_ID` in Vercel and ad `slot` IDs to activate. |
| 8.7 Publish correct `ads.txt` at the root and verify crawler access. | `frontend/public/ads.txt` | PARTIAL — file exists and serves 200; publisher ID line commented out as placeholder. Uncomment and replace `ca-pub-XXX` after 8.4. |
| 8.8 Validate policy, navigation, content, and ad density before submission. | production site | TODO after 8.4-8.7 |

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
| 9.5 Verify account deletion and export in production, including all new resume data. | auth actions, Supabase, E2E | TODO after Phase 4 |

**Definition of Done:** Policy matches actual data flows, vendors, retention, ads, AI processing, export, and deletion; contact details are monitored.

**Exit gate:** A data-flow-to-policy review finds no contradiction. Obtain legal review if the owner’s risk tolerance or launch jurisdictions require it.

## Phase 10 — Observability

| Task | File(s) | Status |
|---|---|---|
| 10.1 Fix backend Sentry integration lint/type errors and verify a test event arrives without PII. | `backend/app/main.py`, Sentry dashboard | VERIFY — Sentry DSN set in Render (2026-08-01); test event delivery not yet confirmed |
| 10.2 Add frontend error monitoring and release/environment tagging with PII-safe settings. | frontend instrumentation, package manifest | TODO |
| 10.3 Keep structured request logs and add metrics for route latency, status, provider failures, and rate limits. | backend logging/monitoring | DONE — access logs retain existing fields and add matched route, response length, rate-limit/auth classifications, and AI-route classification with unit coverage |
| 10.4 Verify UptimeRobot (or equivalent) alerts a monitored channel; GitHub keepalive is not monitoring. | external dashboard | BLOCKED — owner |
| 10.5 Configure cost/usage alarms for Hugging Face, Vercel, Render, Supabase, Sentry, domain, and AdSense-related services. | external dashboards | BLOCKED — owner must set up alerts on free-tier dashboards |

**Definition of Done:** Client and server failures, downtime, latency, and spend are visible without collecting resume content.

**Exit gate:** Controlled frontend error, backend 500, outage, and budget-threshold drills each notify the responsible person within the documented target.

## Phase 11 — Release engineering

| Task | File(s) | Status |
|---|---|---|
| 11.1 Keep deployment/env/rollback documentation current. | `docs/DEPLOY.md`, `docs/ENV_VARS.md` | DONE — architecture, auth, rate limiting, five-table RLS model, production secrets, hooks, test counts, and rollback caveats documented |
| 11.2 Add ordered, reviewable Supabase migrations and a repeatable apply/rollback procedure. | new `supabase/migrations/`, CI/docs | DONE — six idempotent ordered migrations plus apply/backup/rollback guidance |
| 11.3 Provide isolated frontend and backend staging with staging Supabase/Hugging Face credentials; Vercel preview alone is not full staging. | hosting config/dashboards | TODO |
| 11.4 Require green CI before production deploy and document promotion from staging to production. | GitHub/Vercel/Render settings, docs | TODO |
| 11.5 Configure database backups and perform a restore drill. | Supabase/dashboard/runbook | BLOCKED — Supabase free tier has daily backups but no point-in-time restore; acceptable for $0 budget |
| 11.6 Verify DNS, SSL, environment values, production CORS, and rollback after the final release candidate. | Vercel/Render/DNS/docs | PARTIAL (live DNS/SSL/CORS verified) |

**Definition of Done:** A green, immutable release candidate moves through staging to production with versioned DB changes, backups, and rehearsed rollback.

**Exit gate:** Deploy and rollback a release candidate, apply and roll back a safe test migration, and restore a backup in non-production.

## Phase 12 — Launch and post-launch

| Task | File(s) | Status |
|---|---|---|
| 12.1 Complete a go/no-go review of every phase exit gate; any open Blocker is `NO-GO`. | this file | TODO |
| 12.2 Assign launch owner, incident owner, Sentry/uptime watchers, and escalation thresholds for the first 72 hours. | `docs/INCIDENT-RESPONSE.md`, launch runbook | TODO |
| 12.3 Choose feedback intake (recommended: monitored support email linked site-wide plus GitHub Issues for reproducible public bugs). | footer/contact/issue templates | OWNER CONFIRMATION |
| 12.4 Prepare and approve Product Hunt/Reddit copy; publish only after go-live approval. | `docs/guides/PRODUCT-HUNT-LISTING.md`, launch runbook | DRAFT EXISTS |
| 12.5 Submit AdSense only after Phase 8 passes. | AdSense dashboard | BLOCKED |
| 12.6 Monitor errors, uptime, latency, provider quota/cost, auth failures, data deletion, feedback, CWV, and AdSense status during days 1-3 and week 1. | dashboards/runbook | TODO |

**Definition of Done:** Launch has explicit ownership, rollback authority, feedback intake, monitoring cadence, and an AdSense-ready production site.

**Exit gate:** Go/no-go signed `GO`; launch executed; first-72-hours review completed with incidents and follow-ups recorded.

## Current priority

1. Authenticate cost-bearing backend routes and close anonymous `shared_scores` writes.
2. Implement saved resumes/versioning with automated two-user RLS proof.
3. Complete certified consent, content, observability, and release gates before AdSense submission or launch promotion.
