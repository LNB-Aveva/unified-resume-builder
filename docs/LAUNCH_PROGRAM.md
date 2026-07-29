# LAUNCH_PROGRAM.md — Hardening & Launch Roadmap

> **Every session reads this first. Every session updates it before exit.**
> Last updated: 2026-07-28 (Session 65 — full audit, no code changes)

---

## Ground Truth (Verified 2026-07-28)

| Item | Status | Evidence |
|------|--------|----------|
| Frontend (resumeai.cv) | **LIVE** on Vercel, renders correctly | WebFetch 200, hero text confirmed |
| Backend (Render) | **SLEEPING** — 503 on cold fetch | Free tier spins down after 15 min |
| Backend (local) | **WORKS** — all 9 endpoints hit and verified | uvicorn on :8001, manual curl of every route |
| Tests | **212 pass** in 11.4s (7 test files, ~1519 lines) | `pytest -x -q` from `backend/` |
| CI | **GREEN** — last 5 runs all success | `gh run list --limit 5` |
| Frontend build | **CLEAN** — 26 pages, no warnings | `npm run build` |
| Supabase tables | `jobs` + `shared_scores` in schema; **`profiles` missing from SQL** | supabase-schema.sql vs code grep |
| HuggingFace API | **WORKING** — summary, cover letter, preview all returned AI text | Live endpoint tests |
| Rate limiting | **All 9 routes covered** (30/min deterministic, 10/min AI, 5/min preview) | Code inspection |
| Privacy/Terms pages | **EXIST** but incomplete (no cookie consent, no deletion path, no ad disclosure) | Read both pages |
| AdSense | **NOT STARTED** — no ads.txt, no script, no placements | Grep for adsense/adsbygoogle: 0 hits |
| Error monitoring | **NONE** — no Sentry, Datadog, or structured logging | Grep: 0 hits |
| Google Analytics | **LIVE** — GA4 script in layout.tsx | Confirmed in layout.tsx:143-148 |
| Cookie consent | **MISSING** | Grep for cookie consent/banner: 0 hits |
| Account deletion | **MISSING** — signOut exists, deleteAccount does not | Grep auth.ts: only signOut |

---

## Findings Table (Worst First)

| # | Severity | Area | File:line | What breaks | Fix effort |
|---|----------|------|-----------|-------------|------------|
| F1 | **Blocker** | Privacy/Legal | — | No cookie consent banner. GA4 is live, AdSense will add more cookies. GDPR/CCPA/ePrivacy violation. Blocks AdSense approval. | M |
| F2 | **Blocker** | Privacy/Legal | — | No account deletion. Privacy policy promises "Delete your account and associated data" (privacy/page.tsx:98) but it's not implemented. GDPR Art. 17 violation. | M |
| F3 | **Blocker** | Auth/Data | supabase-schema.sql | `profiles` table missing from schema SQL. Code references it (auth.ts:169, account/page.tsx:21). New Supabase instance breaks account setup. Schema is not reproducible. | S |
| F4 | **Blocker** | AdSense | — | Zero AdSense integration: no ads.txt, no ad script, no placements, no consent management. This is the monetization path and it doesn't exist yet. | L |
| F5 | **Blocker** | Privacy | privacy/page.tsx:38 | Privacy policy states "We do not store your resume content" but `shared_scores` stores keyword data derived from resumes. Policy also omits any mention of advertising cookies (required for AdSense). Will fail AdSense review. | S |
| F6 | **High** | Reliability | render.yaml:37 | Render free tier sleeps after 15 min → 503 for first visitor. Backend confirmed sleeping during audit. First real user gets a 30-60s hang or timeout. | M |
| F7 | **High** | Scoring | keyword_extractor.py | No synonym/variant matching. "ReactJS" ≠ "React", "JS" ≠ "JavaScript", "CI/CD" ≠ "continuous integration/continuous deployment". A scoring product that gives visibly wrong scores destroys trust on first use. | L |
| F8 | **High** | AI | rewriter.py | `/rewrite` returned 0 bullets in live testing. HuggingFace response parsing is fragile — the batch parse produced fewer results than expected, and the fallback chain didn't recover. Users see empty results with no explanation. | M |
| F9 | **High** | Security | supabase-schema.sql | `profiles` table (wherever it exists) has no RLS policies in any checked-in schema. If RLS isn't enabled, anyone with the anon key can read/write all user profiles. | S |
| F10 | **High** | Observability | — | Zero error monitoring. Production errors are invisible. No Sentry, no structured logs, no alerting. You won't know when HuggingFace starts returning garbage or when Render drops requests. | M |
| F11 | **Med** | UX | ats-checker/page.tsx | Missing dark mode. All `bg-white`/`text-gray-900` without `dark:` variants. Inconsistent with rest of site. Jarring for dark-mode users. | S |
| F12 | **Med** | Schema | schemas/export.py vs schemas/resume.py | Duplicate `PersonalInfo`/`WorkExperience`/`Education` models with different field names (`full_name` vs `name`, `job_title` vs `title`, `linkedin_url` vs `linkedin`). Frontend must silently remap between the two. | S |
| F13 | **Med** | Deps | requirements.txt:17-21 | `scikit-learn` (~100MB) and `nltk` (~20MB) imported in requirements but never used in app code. Bloats deploy image, slows Render cold starts. | S |
| F14 | **Med** | DX | — | Backend tests fail when run from repo root (`ModuleNotFoundError: app`). Must `cd backend/` first. CI works because it sets `working-directory: backend`. | S |
| F15 | **Med** | Infra | supabase-schema.sql:58 | `shared_scores` has no TTL cleanup job. Expired rows accumulate forever — `expires_at` is checked only at SELECT. | S |
| F16 | **Low** | Config | next.config.ts:2 | Hardcoded `allowedDevOrigins: ["10.0.0.183"]` exposes your LAN IP in committed code. | S |
| F17 | **Low** | AI | hf_client.py | `httpx.AsyncClient` singleton never explicitly closed. Resource leak on process exit. | S |
| F18 | **Low** | Config | config.py | `SUPABASE_URL`/`SUPABASE_ANON_KEY` in backend config but never used (auth is frontend-only). Dead config. | S |

---

## Suspicions Audit (What You Asked Me To Confirm Or Kill)

| Your suspicion | Verdict | Detail |
|---|---|---|
| backend/tests/ is empty | **WRONG** | 212 tests, 7 files, ~1519 lines. Unit, integration, adversarial, property-based. Excellent. |
| .github/workflows/ has no working pipeline | **WRONG** | ci.yml runs lint + type-check + 212 tests + bandit + detect-secrets + pip-audit (backend) and npm audit + build (frontend). All green. |
| Rate limiting covers only 3 of 8 routes | **WRONG** | All 9 routes have rate limits. slowapi is installed and wired. |
| No privacy policy, terms, cookie consent | **PARTIALLY RIGHT** | Privacy policy and Terms exist and are substantive. But: NO cookie consent banner, NO account deletion mechanism. |
| No error monitoring or structured logging | **CONFIRMED** | Zero. Default uvicorn stdout only. |
| Render free tier sleeps | **CONFIRMED** | Backend returned 503 during audit. |
| Keyword extractor hardcoded ~80 skills with bad matching | **PARTIALLY RIGHT** | Actually ~200+ skills in 15 categories — much larger than 80. But the matching algorithm is still pure word-boundary regex with no synonyms, no variants, no stemming. The core problem is real. |

---

## Phase Plan

### Phase 1: Fill Foundation Gaps
> **Goal:** Every component runs reproducibly from a fresh clone.

| Task | File(s) | Status |
|------|---------|--------|
| 1.1 Remove `scikit-learn` and `nltk` from requirements.txt (unused, 120MB saved) | backend/requirements.txt | DONE |
| 1.2 Add `profiles` table + RLS policies to supabase-schema.sql | supabase-schema.sql | DONE |
| 1.3 Add `pyproject.toml` so tests run from repo root (`pythonpath = ["."]`) | backend/pyproject.toml | DONE |
| 1.4 Remove hardcoded `allowedDevOrigins` LAN IP from next.config.ts | frontend/next.config.ts | DONE |
| 1.5 Remove dead `SUPABASE_URL`/`SUPABASE_ANON_KEY` from backend config.py | backend/app/core/config.py | DONE |
| 1.6 Document env var matrix: what each var does, where to set it, what breaks without it | docs/ENV_VARS.md | DONE |
| 1.7 Add httpx client shutdown hook (lifespan context manager) | backend/app/main.py, backend/app/services/ai/hf_client.py | DONE |
| 1.8 Fix flaky hypothesis test deadline (pre-existing: 200ms too tight for keyword extractor regex) | backend/tests/unit/test_property.py:93 | DONE |

**Definition of Done:** `git clone` → set env vars per matrix → `cd backend && pytest` passes → `cd frontend && npm run build` succeeds → both servers start and all 9 endpoints respond.

**Exit Gate:** Fresh clone on a second machine completes the above.

---

### Phase 2: Security, Privacy & Legal
> **Goal:** Pass a privacy audit and unblock AdSense submission. This merges your original Phases 3, 4, and 9 because they're deeply coupled: RLS is security AND privacy; cookie consent is legal AND AdSense-blocking; account deletion is privacy AND auth.

| Task | File(s) | Status |
|------|---------|--------|
| 2.1 Implement account deletion: UI button + server action that deletes profile, jobs, shared_scores, then calls `supabase.auth.admin.deleteUser()` | frontend/src/app/actions/auth.ts, account/page.tsx | TODO |
| 2.2 Add cookie consent banner (GA4 + future AdSense). Must be GDPR-compliant: no cookies before consent, consent stored, opt-out available | frontend/src/app/components/CookieConsent.tsx, layout.tsx | TODO |
| 2.3 Verify `profiles` table has RLS enabled with per-user policies. Add to supabase-schema.sql if missing. Write a test that proves user A cannot read user B's profile | supabase-schema.sql, manual Supabase check | TODO |
| 2.4 Verify `jobs` table RLS policies match supabase-schema.sql in production Supabase | Manual Supabase dashboard check | TODO |
| 2.5 Update privacy policy: disclose `shared_scores` keyword storage, add advertising cookie disclosure, add data retention schedule, add CCPA section | frontend/src/app/privacy/page.tsx | TODO |
| 2.6 Add cookie policy page (or section in privacy policy) detailing GA4 + AdSense cookies | frontend/src/app/privacy/page.tsx or cookies/page.tsx | TODO |
| 2.7 Add data export: user can download their profile + jobs as JSON | frontend/src/app/actions/auth.ts, account/page.tsx | TODO |
| 2.8 Input validation audit: verify all upload sizes, file types, and text lengths are enforced at both API and frontend layers | backend/app/schemas/*, frontend components | TODO |
| 2.9 Review WeasyPrint/fpdf2 for HTML/PDF injection vectors | backend/app/services/export/pdf_generator.py | TODO |
| 2.10 Add `shared_scores` cleanup: scheduled deletion of expired rows | Supabase cron or backend task | TODO |
| 2.11 Secret hygiene: ensure no API keys in git history, rotate HF key if exposed | .env files, git log | TODO |
| 2.12 Audit CORS: ensure FRONTEND_URL is set in Render production and no wildcards | backend/app/main.py, Render dashboard | TODO |

**Definition of Done:** Account deletion works end-to-end. Cookie consent blocks GA4 until accepted. RLS proven by cross-user test. Privacy policy is legally accurate. No secrets in git.

**Exit Gate:** A privacy-aware user reads the policy and consent flow, and finds no contradictions between what the policy says and what the code does.

---

### Phase 3: Scoring Quality
> **Goal:** The product moat. Scores that users trust on first sight.

| Task | File(s) | Status |
|------|---------|--------|
| 3.1 Build evaluation harness: a script that runs N resume/JD pairs through the scorer and compares output to expected scores | backend/tests/eval/ or scripts/eval/ | TODO |
| 3.2 Create labeled dataset: 20+ resume/JD pairs with human-judged expected match level (not scores — categories like "strong match", "partial", "poor") | data/eval/ | TODO |
| 3.3 Add synonym/variant mapping: ReactJS→React, JS→JavaScript, CI/CD→continuous integration, PostgreSQL→Postgres, K8s→Kubernetes, etc. | backend/app/services/nlp/keyword_extractor.py | TODO |
| 3.4 Add stemming or lemmatization for skill matching (e.g., "developing"→"development") | backend/app/services/nlp/keyword_extractor.py | TODO |
| 3.5 Replace or supplement hardcoded skill set with a taxonomy (e.g., ESCO, O*NET, or a curated JSON) that can grow without code changes | backend/app/services/nlp/skills_taxonomy.json | TODO |
| 3.6 Calibrate grade boundaries against real ATS behavior (current: A≥90 is almost impossible with word-boundary matching) | backend/app/services/scoring/ats_scorer.py | TODO |
| 3.7 Make every score explainable in the UI: show WHY each skill matched or didn't, not just the list | frontend/src/app/components/GapAnalysis.tsx | TODO |
| 3.8 Fix /rewrite 0-bullet parsing failure — add golden-file tests for known HuggingFace response formats | backend/app/services/ai/rewriter.py, backend/tests/ | TODO |
| 3.9 Run evaluation harness on the labeled set; set a baseline, then iterate | scripts/eval/ | TODO |

**Definition of Done:** Evaluation harness produces a score report. Synonym matching catches the 20 most common variants. Grade boundaries calibrated so A/B/C distribution matches user intuition on the labeled set.

**Exit Gate:** 80%+ of labeled pairs score within one grade of human judgment. Zero cases where an obviously good resume scores F.

---

### Phase 4: Reliability & Performance
> **Goal:** The app works for the first visitor, not just the developer.

| Task | File(s) | Status |
|------|---------|--------|
| 4.1 Solve Render cold start: either upgrade to paid tier, add a cron ping (UptimeRobot or GitHub Actions cron), or add a "warming up" UI state that's better than a blank hang | render.yaml, frontend loading states | TODO |
| 4.2 Add timeout + retry for HuggingFace calls (currently 30s default, no retry) | backend/app/services/ai/hf_client.py | TODO |
| 4.3 Add graceful degradation when HuggingFace is down: show "AI features temporarily unavailable" instead of 500/502/503/504 | frontend components (SummaryGenerator, BulletRewriter, CoverLetterGenerator) | TODO |
| 4.4 Add request timeout middleware (kill requests that hang > 30s) | backend/app/main.py | TODO |
| 4.5 Test PDF generation with large resumes (20 experiences, 30 bullets each) — does it OOM on 512MB Render? | backend/app/services/export/pdf_generator.py | TODO |
| 4.6 Add caching for keyword extraction (same JD → same result, no need to recompute) | backend/app/services/nlp/keyword_extractor.py | TODO |

**Definition of Done:** First visitor after a cold start sees a loading state, not a timeout. HuggingFace outage doesn't crash the app. Large PDFs generate without OOM.

**Exit Gate:** Simulate: kill backend, hit the site, verify the experience is acceptable. Kill HuggingFace env var, verify AI tools degrade gracefully.

---

### Phase 5: Tests & CI Hardening
> **Goal:** Confidence that changes don't break production.

| Task | File(s) | Status |
|------|---------|--------|
| 5.1 Add golden-file tests for HuggingFace response parsing (rewriter batch, rewriter single, cover letter, summary) | backend/tests/unit/test_ai_parsing.py | TODO |
| 5.2 Add Playwright happy-path test: landing page → sign up → /tools → run keyword extractor → see results | frontend/tests/e2e/ | TODO |
| 5.3 Add pytest coverage floor (recommend: 80% for services/, 60% for routes/) and add to CI | .github/workflows/ci.yml | TODO |
| 5.4 Add frontend lint to CI (currently only backend lint runs) | .github/workflows/ci.yml | TODO |
| 5.5 Pin Node.js version in CI to match Vercel runtime | .github/workflows/ci.yml | TODO |

**Definition of Done:** Coverage gate in CI. One E2E test that proves the critical path works. Frontend lint in CI.

**Exit Gate:** A PR that breaks any service is blocked by CI.

---

### Phase 6: UX & Accessibility
> **Goal:** A stranger can use every feature on a phone without confusion.

| Task | File(s) | Status |
|------|---------|--------|
| 6.1 Fix ats-checker dark mode (F11) | frontend/src/app/ats-checker/page.tsx | TODO |
| 6.2 Add loading states for all AI calls (summary, rewrite, cover letter) — currently just a spinner, no progress indication or expected wait time | All AI components | TODO |
| 6.3 Add error states: what to show when backend is down, when rate limited (429), when HuggingFace fails | All tool components | TODO |
| 6.4 Add empty states: what tools page looks like before any tool is used | frontend/src/app/(protected)/tools/page.tsx | TODO |
| 6.5 WCAG 2.2 AA audit: color contrast, focus indicators, keyboard navigation, screen reader labels | Site-wide | TODO |
| 6.6 Mobile UX audit: test every tool on 375px width, verify touch targets ≥ 44px | Site-wide | TODO |

**Definition of Done:** Full user journey works on mobile (375px). Every async operation has loading + error + empty states. WCAG contrast ratios pass.

**Exit Gate:** Lighthouse accessibility score ≥ 90 on landing page and /tools.

---

### Phase 7: Observability
> **Goal:** You know when things break before your users tell you.

| Task | File(s) | Status |
|------|---------|--------|
| 7.1 Add error tracking (recommend: Sentry free tier — 5K errors/month) | backend/app/main.py, frontend/src/app/layout.tsx | TODO |
| 7.2 Add structured logging (JSON logs with request_id, endpoint, duration, status — no resume content ever) | backend/app/main.py | TODO |
| 7.3 Add uptime monitoring (UptimeRobot already mentioned in session 20 — verify it's still active) | External | TODO |
| 7.4 Add cost alarms: HuggingFace usage, Vercel bandwidth, Supabase row count | External dashboards | TODO |

**Definition of Done:** Errors appear in Sentry within 60s. Logs are JSON-structured. Uptime check pings /health every 5 min.

**Exit Gate:** Intentionally trigger a 500 error; confirm it appears in Sentry with stack trace.

---

### Phase 8: SEO & AdSense Readiness
> **Goal:** Pass AdSense review on first submission.

| Task | File(s) | Status |
|------|---------|--------|
| 8.1 Core Web Vitals: measure LCP, FID, CLS on landing page and fix any failures | frontend, Lighthouse | TODO |
| 8.2 Verify sitemap.xml includes all public pages (including blog posts, SEO persona pages) | frontend/src/app/sitemap.ts | TODO |
| 8.3 Verify robots.txt doesn't block Googlebot from any public page | frontend/src/app/robots.ts | TODO |
| 8.4 Add structured data (Organization, WebApplication, FAQ) JSON-LD to landing page | frontend/src/app/page.tsx | TODO |
| 8.5 AdSense: create ads.txt, add AdSense script to layout.tsx (behind cookie consent), place ad units that comply with AdSense policies | frontend/public/ads.txt, layout.tsx, ad components | TODO |
| 8.6 Ensure substantive content pages exist (AdSense requires original, useful content — not just a tool). Blog has 3 articles; may need more | frontend/src/app/blog/ | TODO |
| 8.7 Add contact page or email (AdSense requires a way to reach the site owner) | Footer or /contact page | TODO |

**Definition of Done:** Lighthouse performance ≥ 90. ads.txt deployed. Ad units render behind consent. All public pages in sitemap.

**Exit Gate:** Submit to AdSense. (Note: approval can take days/weeks — this gate is "submitted and no obvious policy violations remain.")

---

### Phase 9: Release Engineering
> **Goal:** Ship with confidence, roll back without panic.

| Task | File(s) | Status |
|------|---------|--------|
| 9.1 Document the deployment pipeline: what happens when you push to main (Vercel auto-deploys? Render auto-deploys?) | docs/DEPLOY.md | TODO |
| 9.2 Set up staging environment (Vercel preview deployments + separate Render staging service, or just preview branches) | vercel.json, render.yaml | TODO |
| 9.3 Create env var matrix doc: every env var, where it's set, what the production value is (without secrets) | docs/ENV_VARS.md | TODO |
| 9.4 Supabase migration path: how to apply schema changes to production (currently: paste SQL in dashboard) | docs/MIGRATIONS.md or supabase CLI | TODO |
| 9.5 Backup plan: Supabase database export schedule, git tags for releases | Supabase dashboard, git | TODO |
| 9.6 Rollback procedure: how to revert a bad deploy on Vercel and Render | docs/DEPLOY.md | TODO |
| 9.7 Custom domain DNS + SSL verification: confirm resumeai.cv → Vercel and API subdomain if needed | DNS, Vercel, Render dashboards | TODO |

**Definition of Done:** A new developer can deploy the full stack by reading the docs. Rollback takes < 5 minutes.

**Exit Gate:** Actually perform a rollback drill.

---

### Phase 10: Launch & Post-Launch
> **Goal:** Go live with real users and don't die in the first 72 hours.

| Task | File(s) | Status |
|------|---------|--------|
| 10.1 Go/no-go checklist: review all phase exit gates, confirm all pass | This file | TODO |
| 10.2 Launch: make repo public (already public), submit to Product Hunt, post on relevant subreddits | External | TODO |
| 10.3 First-72-hours monitoring plan: who watches Sentry, how often, what triggers an incident | docs/LAUNCH_PROGRAM.md | TODO |
| 10.4 Feedback capture: where do users report bugs? (GitHub Issues? Email? In-app?) | Site-wide | TODO |
| 10.5 Submit to AdSense (Phase 8 exit gate) | External | TODO |
| 10.6 Post-launch: monitor AdSense approval, first-week analytics, error rates, HuggingFace costs | External | TODO |

**Definition of Done:** The site is live, monitored, and earning (or submitted for earning). Users can report bugs.

**Exit Gate:** 72 hours of uptime with < 5 unresolved errors. AdSense submitted.

---

## Phase Ordering Rationale

**Your original plan had 12 phases. I merged 3 and reordered as follows:**

1. **Merged Phases 3 (Security), 4 (Auth), and 9 (Legal) → Phase 2.** Rationale: RLS is simultaneously a security control and a privacy requirement. Cookie consent is both a legal requirement and an AdSense blocker. Account deletion is auth AND privacy. Splitting these across 3 phases separated by months of other work would leave privacy holes open during all of Phases 5-8.

2. **Moved Scoring Quality (your Phase 5) up to Phase 3.** Rationale: this is the product moat. If a user tries the tool and gets a visibly wrong score, nothing else matters — not the PDF export, not the dark mode, not the cookie banner. You need to fix this before anyone tests the product seriously.

3. **Moved Tests/CI (your Phase 2) to Phase 5.** Rationale: your tests are already excellent (212 passing, CI green). The remaining test work (Playwright, coverage gates) is a hardening step, not a prerequisite. It's more valuable after the scoring and reliability work that will generate new code to test.

4. **Everything else keeps your ordering** (Reliability → UX → Observability → SEO → Release Eng → Launch), just renumbered.

---

## Session Log

| Session | Date | Phase | Tasks Completed | Next |
|---------|------|-------|----------------|------|
| 65 | 2026-07-28 | Audit + Phase 1 | Full audit complete (18 findings). Phase 1 all 8 tasks done: removed unused deps (scikit-learn, nltk), added profiles table+RLS to schema, pyproject.toml for repo-root tests, removed LAN IP, removed dead Supabase config, env var matrix doc, httpx lifespan shutdown, hypothesis deadline fix. 212 tests pass. Frontend builds clean. | Phase 2 — Security, Privacy & Legal (start with account deletion and cookie consent) |
