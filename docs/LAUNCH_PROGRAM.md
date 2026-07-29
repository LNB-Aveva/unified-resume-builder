# LAUNCH_PROGRAM.md — Hardening and Launch Roadmap

> Every session reads this file first and updates it before exit.
> Last verified: 2026-07-29 (Codex audit after Session 70, commit `e8671bb`)

## Launch policy

- Posture: harden fully, then launch.
- Auth/data: Supabase Auth, saved resume versions per user, and proven RLS are mandatory.
- Launch monetization: Google AdSense.
- Operator environment: Windows, PowerShell, VS Code.
- Monthly budget ceiling: **BLOCKED — owner must supply `$___/month` before paid infrastructure is approved.**
- Status vocabulary: `DONE` means executed or directly inspected; `VERIFY` means code exists but production behavior is not proven; `BLOCKED` requires an owner/external action; `TODO` is code or documentation work.

## Ground truth

Verified on 2026-07-29; older session-log claims are not authoritative.

| Item | Status | Evidence |
|---|---|---|
| Production frontend | **LIVE** | `https://resumeai.cv` and `https://unified-resume-builder.vercel.app` returned 200 with the ResumeAI title. |
| Production frontend → backend | **WIRED** | Deployed JS contains `https://unified-resume-builder-api.onrender.com`; production CORS allows `https://resumeai.cv` and rejects `https://evil.example`. |
| Production backend | **LIVE during audit** | Render `/health` returned 200 in 0.39s. A sleep/cold-start cycle was not observed, so cold-start behavior remains `VERIFY`. |
| Local backend | **WORKS** | A fresh Uvicorn process on port 8766 returned 200 from all nine API routes; all four Hugging Face routes generated content and PDF export returned 1,504 bytes. |
| Backend tests | **GREEN** | 291 passed; measured services/routes coverage 82.44%, above the 80% floor. |
| Frontend lint/build | **GREEN locally** | ESLint passed. `next build` compiled 26 routes/pages after Google Fonts network access was allowed. |
| Browser tests | **GREEN but shallow** | Six Playwright smoke tests passed; they only check page rendering, not sign-up, auth, tools, persistence, or error recovery. |
| CI | **RED — BLOCKER** | Current `main` and the preceding two commits failed. Run 30488009367 stops at Ruff E402 errors in `backend/app/main.py:29-32`. Local mypy also reports two errors. |
| Python dependency audit | **RED** | Requirements audit found four advisories: three in `mcp 1.23.3` and one in `click 8.1.8`. Render installs dev/security tooling because runtime and dev dependencies share one file. |
| Frontend dependency audit | **GREEN** | `npm audit` and `npm audit --omit=dev --audit-level=high` both found zero vulnerabilities after install. |
| Supabase production | **PARTIALLY VERIFIED** | Anonymous read-only REST checks returned 200/zero rows for `profiles` and `jobs`, and 200 for `shared_scores`, consistent with deployed tables and RLS. Cross-user isolation and RPC deployment remain unproven. |
| Saved resumes | **MISSING — BLOCKER** | Production REST returned 404 for both `resumes` and `resume_versions`; neither table nor UI persistence exists in the repo. |
| Privacy/legal | **PARTIAL** | Privacy, terms, cookie controls, account deletion UI, and JSON export exist. The current custom cookie banner is not a Google-certified TCF CMP. |
| AdSense | **NOT READY** | `/ads.txt` returns 404; no publisher script or ad units exist; publisher ID is unavailable. |
| Observability | **PARTIAL** | Backend has conditional Sentry plus structured access logs. Production DSN behavior, frontend Sentry, uptime alert delivery, and cost alarms are unverified. |
| Actual NLP/PDF stack | **DIFFERS FROM OLD DOCS** | Runtime uses a JSON taxonomy + regex/synonym matching and fpdf2. spaCy, NLTK, scikit-learn, and WeasyPrint are not runtime dependencies. |

## Findings — worst first

Severity assumes an unknown user expects every advertised feature to work, even though the product is free.

| # | Severity | Area | File:line | What breaks | Fix effort |
|---|---|---|---|---|---|
| F1 | **Blocker** | Persistence | `supabase-schema.sql:5-110`; `README.md:14` | The product promises saved resumes and linked versions, but production and source contain no `resumes` or `resume_versions` table and no save/load UI. The settled product requirement is not implemented. | L |
| F2 | **Blocker** | CI/release | `backend/app/main.py:29-32`; `.github/workflows/ci.yml:34-42` | Current `main` is red in GitHub Actions. Ruff blocks the pipeline before tests/security checks; local mypy also fails at `main.py:43,45`. A broken main branch cannot be a release candidate. | S |
| F3 | **Blocker** | Auth/cost abuse | `backend/app/api/routes/rewrite.py:11-23`; `backend/app/api/routes/summary.py:11-22`; `frontend/src/proxy.ts:4-18` | UI routes are auth-gated, but the backend verifies no Supabase JWT. Anyone can call all AI endpoints directly and consume Hugging Face quota. CORS is not authentication. | M |
| F4 | **Blocker** | AdSense | `frontend/src/app/components/CookieConsent.tsx:6-54`; `frontend/public/ads.txt` (missing) | Monetization is absent. The custom banner is not a Google-certified TCF CMP, which Google requires for personalized AdSense traffic in the EEA/UK/Switzerland. Publisher ID, ads.txt, script, placements, and policy validation remain. | L |
| F5 | **High** | Database abuse/PII | `supabase-schema.sql:96-106`; `frontend/src/app/components/ShareableScoreWidget.tsx:42-57` | Anonymous clients insert directly into `shared_scores` under `with check (true)`. The comment claims API rate limiting, but no API mediates the write. Attackers can fill the table and store arbitrary derived resume/job keyword data. | M |
| F6 | **High** | RLS assurance | `supabase-schema.sql:18-34,52-73`; `backend/tests/` | Policies exist and anonymous reads return no user rows, but there is no two-user test proving user A cannot select/update/delete user B’s profile, jobs, or future resume versions. Mandatory RLS is not yet proven. | M |
| F7 | **High** | End-to-end quality | `frontend/tests/e2e/smoke.spec.ts:3-35`; `frontend/playwright.config.ts:11-16` | The roadmap called this a happy path, but tests only render six public pages. Sign-up, sign-in, protected tools, API results, save/load, export, deletion, and mobile are untested in a browser. | L |
| F8 | **High** | Product truth | `README.md:23-26`; `frontend/src/app/keyword-analyzer/page.tsx:36`; `frontend/src/app/page.tsx:1260-1270` | Public copy claims spaCy NLP and old docs claim NLTK/scikit-learn/WeasyPrint. The app actually uses regex/taxonomy and fpdf2. False technical claims damage trust and can weaken AdSense review. | S |
| F9 | **High** | Analytics/AdSense CSP | `frontend/next.config.ts:16-24`; `frontend/src/app/components/CookieConsent.tsx:17-29` | Production CSP allows scripts only from self, so the dynamically injected Google Tag Manager script is blocked. The same CSP will block AdSense until Google script/connect/frame domains are intentionally added. | M |
| F10 | **High** | AI degradation | `backend/app/services/ai/hf_client.py:43-48`; `backend/app/api/routes/_ai_errors.py:19-38` | Connect failures are neither retryable nor mapped to 502/503; a sandboxed outage produced generic 500s on all four AI routes. Users receive an internal-error response instead of a service-unavailable path. | S |
| F11 | **Med** | Dependency hygiene | `backend/requirements.txt:47-79`; `render.yaml:25` | Runtime deploy installs test/security tools and their vulnerable transitive packages. Audit found current `mcp` and `click` advisories, and CI’s ignore list is already stale. | M |
| F12 | **Med** | Observability/privacy | `backend/app/main.py:20-27`; `docs/ENV_VARS.md:20` | Only backend Sentry wiring exists; DSN delivery is unverified and request-body exclusion is not explicit for resume PII. Browser errors and failed client flows remain invisible. | M |
| F13 | **Med** | Release engineering | `supabase-schema.sql:1`; `docs/DEPLOY.md:42-47` | Database changes are a mutable SQL file pasted manually into production. There are no ordered migrations, automated RLS tests, backend staging service, or verified backup restore. | L |
| F14 | **Med** | Build reliability | `frontend/src/app/layout.tsx:2-22` | The production build fetches three Google fonts. It failed in restricted networking and only passed with outbound access, making reproducibility dependent on Google availability. | S |
| F15 | **Med** | Content/launch | `frontend/src/app/lib/blog-posts.ts`; `frontend/src/app/blog/` | Only three articles exist. AdSense values original substantive content; approval odds are weaker until more genuinely useful content and author/contact trust signals exist. | M |
| F16 | **Low** | Schema consistency | `backend/app/schemas/resume.py`; `backend/app/schemas/export.py` | Duplicate resume models use different field names, forcing frontend remapping and increasing save/version migration risk. | M |
| F17 | **Low** | Repository hygiene | `.gitignore:60-67`; `frontend/test-results/` | Playwright output is untracked and not ignored. It adds worktree noise and can be accidentally committed. | S |

## Original suspicions — current verdict

| Suspicion | Verdict |
|---|---|
| `backend/tests/` is empty | **Wrong.** 291 tests pass; measured coverage is 82.44%. |
| GitHub Actions has no working pipeline | **Partly wrong.** A substantive pipeline exists, but current `main` is red, so it is not working as a release gate today. |
| Rate limiting covers only 3 of 8 routes | **Wrong.** There are nine routes and all nine have slowapi limits. Direct Supabase score writes bypass the API limiter. |
| No privacy, terms, consent, or deletion | **Outdated.** All exist in code. Production deletion RPC and complete deletion of future resume data remain `VERIFY`. |
| No monitoring or structured logging | **Outdated.** Backend Sentry wiring and JSON access logs exist; production delivery and frontend coverage are incomplete. |
| Render cold starts will hurt first use | **Risk remains.** Keepalive and frontend retries exist, and production was warm during this audit; an actual sleep/wake test is still required. |
| Hardcoded skill list and exact matching ruin scores | **Mostly fixed.** A 220+ JSON taxonomy, 65+ synonym groups, explainable scores, and a 25-case evaluation harness exist. Public spaCy claims are false. |

## Phase order decision

The program now keeps all 12 requested phases separate. Earlier versions merged security, auth, privacy, and legal work; that hid incomplete exit gates. The execution order is dependency-driven: restore green CI first, close unauthenticated cost/data paths second, implement and prove saved-resume RLS third, then finish monetization and launch operations. No launch or AdSense submission occurs while any Blocker remains.

## Phase 1 — Make it run

| Task | File(s) | Status |
|---|---|---|
| 1.1 Install Python and Node dependencies from the checked-in manifests on Windows. | `backend/requirements.txt`, `frontend/package-lock.json` | DONE (current machine) |
| 1.2 Start FastAPI and exercise `/health` plus all nine POST routes with valid payloads. | `backend/app/main.py`, `backend/app/api/routes/` | DONE (all 200 on fresh port 8766) |
| 1.3 Run frontend lint and production build with production-shaped environment values. | `frontend/package.json`, `frontend/next.config.ts` | DONE (build requires font network) |
| 1.4 Keep reproducible PowerShell setup and complete environment matrix current. | `README.md`, `docs/ENV_VARS.md` | TODO (README stack is stale) |
| 1.5 Remove build-time network dependence by self-hosting fonts or checking assets in. | `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css` | TODO |

**Definition of Done:** A clean Windows clone installs, starts both apps, passes lint/build, and returns expected responses from all nine routes using documented PowerShell commands.

**Exit gate:** Repeat on a clean machine or clean CI runner without undeclared state; no outbound font fetch is required for the build.

## Phase 2 — Tests and CI

| Task | File(s) | Status |
|---|---|---|
| 2.1 Maintain unit, integration, adversarial, property, parsing, PDF, and evaluation suites. | `backend/tests/` | DONE (291 pass) |
| 2.2 Keep combined services/routes coverage at 80%; this is close enough to actual 82.44% to prevent regression without incentivizing trivial tests. | `.github/workflows/ci.yml`, `backend/pyproject.toml` | DONE |
| 2.3 Fix Ruff E402 and mypy errors introduced by conditional Sentry setup. | `backend/app/main.py` | TODO — BLOCKER |
| 2.4 Update the CVE gate for current advisories and split runtime from dev dependencies. | `backend/requirements.txt`, `.github/workflows/ci.yml`, `render.yaml` | TODO |
| 2.5 Replace smoke-only Playwright coverage with a real happy path: sign up/sign in fixture → protected tools → run analyzer → save/load resume version → PDF/export/delete. | `frontend/tests/e2e/`, `frontend/playwright.config.ts` | TODO |
| 2.6 Add failure-path browser tests for 429, backend outage, Hugging Face outage, and validation errors. | `frontend/tests/e2e/`, tool components | TODO |

**Definition of Done:** Every push/PR runs lint, types, tests, security audits, frontend build, and meaningful E2E tests; all checks are green.

**Exit gate:** Intentionally break one backend route and one browser flow; CI blocks both. Current `main` must have a successful CI run.

## Phase 3 — Security and privacy

| Task | File(s) | Status |
|---|---|---|
| 3.1 Require and verify Supabase JWTs on authenticated backend tools; retain only explicitly public routes. | `backend/app/core/`, `backend/app/api/routes/`, frontend API client | TODO — BLOCKER |
| 3.2 Move `shared_scores` creation behind a rate-limited trusted endpoint or authenticated RLS policy; validate every stored field. | `supabase-schema.sql`, `ShareableScoreWidget.tsx`, new backend route | TODO |
| 3.3 Preserve per-route limits and add a shared/edge limiter if multiple backend workers or distributed abuse become possible. | `backend/app/core/rate_limit.py`, Render/Cloudflare config | TODO |
| 3.4 Keep strict CORS and security headers; add CSP sources only for explicitly adopted Google services. | `backend/app/main.py`, `frontend/next.config.ts` | PARTIAL (CORS live test passed) |
| 3.5 Keep Pydantic field/list limits and add a total request-body cap before JSON parsing. | `backend/app/schemas/`, `backend/app/main.py` | PARTIAL |
| 3.6 Preserve fpdf2 text sanitization and adversarial PDF tests; delete the unused HTML template or document that it is non-runtime. | `pdf_generator.py`, `templates/resume.html`, security tests | PARTIAL |
| 3.7 Configure Sentry and all logs to exclude request bodies, auth headers, resume/job text, AI prompts, and generated content. | `backend/app/main.py`, Sentry config, `docs/THREAT-MODEL.md` | TODO |
| 3.8 Re-run Bandit, secret scan, npm audit, and requirements-only pip-audit with zero unaccepted runtime High/Critical findings. | CI and manifests | TODO |

**Definition of Done:** Threat model matches deployed architecture; authenticated APIs reject missing/invalid tokens; public writes cannot bypass limits; no telemetry records resume PII.

**Exit gate:** Automated abuse/auth tests pass, security scans pass, and a telemetry inspection shows metadata only.

## Phase 4 — Auth and persistence

| Task | File(s) | Status |
|---|---|---|
| 4.1 Keep Supabase email/password/OAuth session handling and protected Next.js routes. | `frontend/src/proxy.ts`, auth pages/actions | DONE |
| 4.2 Add `resumes` and immutable `resume_versions` tables with ownership, timestamps, indexes, and cascade behavior. | versioned Supabase migrations | TODO — BLOCKER |
| 4.3 Add save, list, load, rename, version, and delete flows without silently overwriting prior versions. | `frontend/src/app/(protected)/`, resume components/actions | TODO |
| 4.4 Link tracked jobs to the selected resume version with an FK and safe deletion semantics. | jobs migration, `JobTracker.tsx` | TODO |
| 4.5 Add two-user RLS integration tests covering select/insert/update/delete for profiles, jobs, resumes, and versions. | Supabase test harness/CI | TODO — mandatory proof |
| 4.6 Verify `delete_own_user()` in production and make account deletion remove/cascade all resume versions, jobs, profile, and auth identity. | migrations, `auth.ts`, E2E tests | VERIFY |
| 4.7 Extend data export to include resumes and versions, with an automated completeness test. | `auth.ts`, `ExportDataButton.tsx` | TODO after 4.2 |

**Definition of Done:** Authenticated users can manage versioned resumes; every table has least-privilege RLS; deletion/export cover all owned data.

**Exit gate:** In an automated test, user A cannot read or mutate any user B row; account deletion leaves zero owned rows and export contains every retained record.

## Phase 5 — Scoring quality

| Task | File(s) | Status |
|---|---|---|
| 5.1 Maintain the 25-pair labeled evaluation dataset and runner before algorithm changes. | `backend/tests/eval/` | DONE |
| 5.2 Maintain JSON taxonomy, synonym/variant matching, and parsing golden files. | `skills_taxonomy.json`, `taxonomy.py`, scoring tests | DONE |
| 5.3 Maintain calibrated grades and explainable matched/missing hard/soft skills. | `ats_scorer.py`, `GapAnalysis.tsx` | DONE |
| 5.4 Correct all public copy to describe the actual taxonomy/regex approach, not spaCy. | `README.md`, landing and SEO pages | TODO |
| 5.5 Grow the labeled set with real anonymized edge cases only after consent and retention rules exist; track exact-grade and within-one-grade metrics. | `backend/tests/eval/`, evaluation report | TODO post-launch |

**Definition of Done:** Every scoring change is measured against labeled data; scores are explainable and public technical claims are accurate.

**Exit gate:** At least 80% of labeled pairs remain within one human grade, zero obvious strong matches score F, and the report is reproducible in CI.

## Phase 6 — Reliability and performance

| Task | File(s) | Status |
|---|---|---|
| 6.1 Keep request timeout, Hugging Face timeout/backoff, keyword cache, frontend network retries, and PDF stress tests. | backend middleware/services, `fetchWithRetry.ts`, tests | DONE |
| 6.2 Retry `httpx.ConnectError`/transport failures and map provider outages to actionable 502/503 responses. | `hf_client.py`, `_ai_errors.py`, tests | TODO |
| 6.3 Test an actual Render sleep/wake cycle from the browser and record time-to-usable; do not treat GitHub cron as an uptime SLA. | `keepalive.yml`, browser tests, ops log | VERIFY |
| 6.4 Make keepalive failures fail or alert instead of emitting warnings while the workflow stays green. | `.github/workflows/keepalive.yml` | TODO |
| 6.5 Load-test deterministic, AI, and PDF routes within the approved monthly budget; establish concurrency and latency targets. | new load-test scripts/docs | TODO |
| 6.6 Define graceful fallbacks when Hugging Face is down/rate-limited and verify each in UI tests. | AI components, backend error mapping | TODO |

**Definition of Done:** Cold starts, provider failures, and concurrent PDF work produce bounded waits and clear recovery paths without hidden data loss.

**Exit gate:** Recorded cold-start and outage drills meet the published latency/error targets and create an operator alert when appropriate.

## Phase 7 — UX and accessibility

| Task | File(s) | Status |
|---|---|---|
| 7.1 Preserve loading, empty, retry, 429, dark mode, label, focus, and landmark work. | frontend components/pages | DONE by inspection/tests |
| 7.2 Run keyboard and screen-reader checks across auth, all nine tools, save/version flows, export, and deletion. | frontend + accessibility tests | TODO |
| 7.3 Test full journeys at 375px, 768px, and desktop; verify 44px targets and no clipped dialogs/results. | Playwright projects | TODO |
| 7.4 Run Lighthouse accessibility audits on landing, public analyzer, auth, and tools after authenticated test fixtures exist. | Lighthouse/CI | TODO |

**Definition of Done:** Every journey works without a mouse, communicates async state, and remains usable on mobile.

**Exit gate:** WCAG 2.2 AA review has no known blockers and Lighthouse accessibility is at least 90 on representative pages.

## Phase 8 — SEO and AdSense

| Task | File(s) | Status |
|---|---|---|
| 8.1 Keep metadata, canonical URLs, JSON-LD, robots, and sitemap accurate; live sitemap currently contains 12 URLs. | layout/page metadata, `robots.ts`, `sitemap.ts` | DONE/VERIFY after new pages |
| 8.2 Run mobile and desktop Lighthouse/Core Web Vitals against production and fix failures. | frontend, CI/report | TODO |
| 8.3 Publish additional original, expert-reviewed content and add visible author/contact trust signals. | `blog-posts.ts`, blog/contact pages | TODO |
| 8.4 Obtain AdSense publisher ID and create account/site entry. | AdSense dashboard | BLOCKED — owner |
| 8.5 Use Google’s certified CMP or another Google-certified TCF CMP; retire the custom banner for ad consent or limit it to non-ad preferences. | consent integration, privacy page | BLOCKED on AdSense setup/owner choice |
| 8.6 Add consent-gated AdSense script, compliant placements, reserved dimensions, and CSP directives. | layout, ad component, `next.config.ts` | TODO after 8.4-8.5 |
| 8.7 Publish correct `ads.txt` at the root and verify crawler access. | `frontend/public/ads.txt` | TODO after publisher ID |
| 8.8 Validate policy, navigation, content, and ad density before submission. | production site | TODO |

**Definition of Done:** Production passes CWV targets, has substantial original content, uses a certified CMP where required, serves valid ads.txt, and contains policy-compliant ad placements.

**Exit gate:** AdSense pre-submission checklist is signed off with no placeholders or blocked items. Google’s current CMP requirement: <https://support.google.com/adsense/answer/13554116>.

## Phase 9 — Legal and compliance

| Task | File(s) | Status |
|---|---|---|
| 9.1 Keep privacy, terms, AI-processing disclosure, cookie categories, rights, and 30-day shared-score retention accurate. | privacy/terms pages | PARTIAL |
| 9.2 Update policy and retention schedule for saved resumes/versions before persistence ships. | privacy page, retention docs | TODO after Phase 4 design |
| 9.3 Replace inaccurate vendor/technology claims and document Hugging Face processing and telemetry controls precisely. | legal pages, public copy | TODO |
| 9.4 Keep a reachable support email; `lnbingi.work@gmail.com` currently appears in privacy and terms. Add a dedicated contact route if that is the launch identity. | privacy/terms/footer/contact | VERIFY owner acceptance |
| 9.5 Verify account deletion and export in production, including all new resume data. | auth actions, Supabase, E2E | TODO after Phase 4 |

**Definition of Done:** Policy matches actual data flows, vendors, retention, ads, AI processing, export, and deletion; contact details are monitored.

**Exit gate:** A data-flow-to-policy review finds no contradiction. Obtain legal review if the owner’s risk tolerance or launch jurisdictions require it.

## Phase 10 — Observability

| Task | File(s) | Status |
|---|---|---|
| 10.1 Fix backend Sentry integration lint/type errors and verify a test event arrives without PII. | `backend/app/main.py`, Sentry dashboard | TODO/BLOCKED on DSN |
| 10.2 Add frontend error monitoring and release/environment tagging with PII-safe settings. | frontend instrumentation, package manifest | TODO |
| 10.3 Keep structured request logs and add metrics for route latency, status, provider failures, and rate limits. | backend logging/monitoring | PARTIAL |
| 10.4 Verify UptimeRobot (or equivalent) alerts a monitored channel; GitHub keepalive is not monitoring. | external dashboard | BLOCKED — owner |
| 10.5 Configure cost/usage alarms for Hugging Face, Vercel, Render, Supabase, Sentry, domain, and AdSense-related services. | external dashboards | BLOCKED — owner and budget ceiling |

**Definition of Done:** Client and server failures, downtime, latency, and spend are visible without collecting resume content.

**Exit gate:** Controlled frontend error, backend 500, outage, and budget-threshold drills each notify the responsible person within the documented target.

## Phase 11 — Release engineering

| Task | File(s) | Status |
|---|---|---|
| 11.1 Keep deployment/env/rollback documentation current. | `docs/DEPLOY.md`, `docs/ENV_VARS.md` | PARTIAL |
| 11.2 Add ordered, reviewable Supabase migrations and a repeatable apply/rollback procedure. | new `supabase/migrations/`, CI/docs | TODO |
| 11.3 Provide isolated frontend and backend staging with staging Supabase/Hugging Face credentials; Vercel preview alone is not full staging. | hosting config/dashboards | TODO |
| 11.4 Require green CI before production deploy and document promotion from staging to production. | GitHub/Vercel/Render settings, docs | TODO |
| 11.5 Configure database backups and perform a restore drill. | Supabase/dashboard/runbook | BLOCKED on plan/budget |
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

1. Restore green CI on `main`.
2. Authenticate cost-bearing backend routes and close anonymous `shared_scores` writes.
3. Implement saved resumes/versioning with automated two-user RLS proof.
4. Complete certified consent, content, observability, and release gates before AdSense submission or launch promotion.
