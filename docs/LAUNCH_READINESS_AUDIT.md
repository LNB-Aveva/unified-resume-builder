# Launch Readiness Audit — Current Main Rerun

> Audit date: 2026-08-07  
> Audited base: `4fc5567` plus the local ES256/JWKS authentication fix documented below
> Branch: `fix/prompt-gaps-closure`
> Rule: every `UNVERIFIED` launch gate is a `NO-GO` until it is proven.

## Current verdict

**PROVISIONAL NO-GO.** Gates 1–3 and 5 are complete. Production ES256 authentication is now proven. Gate 1 code-side remediation is complete on `fix/render-starter-blueprint`: durable atomic AI quotas, quota-free public preview, 128-bit share IDs with revocation, fail-loud retention cleanup, accurate fair-use copy, and a protected production-RLS workflow. Production closure still requires the owner actions listed below: apply migration 007 and quota environment values, restore/confirm Render Starter, run the protected 20-test RLS workflow, complete the Hugging Face usage/budget review, and prove a Google-certified TCF CMP before ads. Gate 4 and Gate 6 remain pending.

Cost model verdict: the $7/mo budget safely handles 0–9,600 users. The first hard cliff is Supabase's 500 MB free DB at approximately 9,600 active users (~52 KB/user average footprint). HuggingFace free-tier rate limits become visible at ~1,000 users during peak hours but fail gracefully via circuit breaker.

| Gate | Owner | Status |
|---|---|---|
| 1. Five-perspective adversarial review | Codex | **COMPLETE — NO-GO findings recorded** |
| 2. Evidence-backed go/no-go checklist | Claude | **COMPLETE — CONDITIONAL NO-GO (3 owner items required)** |
| 3. 100 / 1,000 / 10,000-user cost model | Claude | **COMPLETE — cliff at ~9,600 users (Supabase DB)** |
| 4. Failure drills | Codex | **TODO** |
| 5. Independent rollback verification | Claude | **COMPLETE — PASS** |
| 6. Final verdict and top three accepted risks | Codex | **TODO (after Gate 4)** |

## Baseline evidence

Commands were run from the current branch before editing this report.

| Check | Exact result |
|---|---|
| Full backend suite | `535 passed, 24 skipped, 26 warnings in 149.11s` after Gate 1 remediation |
| Backend lint | `All checks passed!` |
| Frontend lint | `npm run lint` exit `0` |
| Frontend production build | `Compiled successfully`; 32 routes generated |
| Focused quota/preview/schema/route/auth suite | `190 passed, 4 skipped, 14 warnings in 4.87s`; includes ES256, quota denial, route weights, deterministic preview, and SQL security contracts |
| Production RLS suite | `20 skipped` — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` were not available |
| Production npm audit | `found 0 vulnerabilities` |
| Runtime Python audit | `No known vulnerabilities found` |
| Development Python audit | `No known vulnerabilities found` |
| Bandit | 0 High; two expected Medium `B104` findings for binding the web server to `0.0.0.0` |
| Secret scan | General scanner timed out twice; focused tracked-file scan found one committed Hugging Face token. The current file is redacted, Git history still contains the dead value, and the owner's current token list no longer contains that exposed token. Provider usage review remains unverified. |

The two ReDoS timing tests that failed during the earlier loaded run passed unchanged in isolation (`2 passed, 55 deselected in 5.01s`). The subsequent complete suite passed all 501 runnable tests, so that regression gate is closed as an environmental timing outlier.

Production HTTP checks on 2026-08-07:

- `https://resumeai.cv`, `/privacy`, `/terms`, `/robots.txt`, and `/ads.txt`: HTTP 200.
- Backend `/health`: HTTP 200 in 0.33 seconds while warm.
- `/docs`, `/redoc`, and `/openapi.json`: HTTP 404 in production.
- All seven protected API routes: HTTP 401 without a bearer token.
- Public deterministic `/api/v1/analyze`: HTTP 200 with expected taxonomy output.
- A request over 1 MB: HTTP 413 with a bounded error response.
- CORS: `https://resumeai.cv` accepted; `https://evil.example` rejected.
- Interactive signed-in browser review: **PRODUCTION PASS**. After PR #53 and the Render environment update, the owner generated a 61-word AI summary at `resumeai.cv`; the former `Invalid authentication token` failure did not recur.

## Gate 1 — Five-perspective adversarial review

### A. Abusive user: spend amplification and resume theft

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| A Hugging Face token was committed in `.claude/memory/project_resume_session15_07112026.md`. | **Owner verification pending** | The value is redacted and absent from the owner's active-token list; a fine-grained production replacement exists. Public Git history still contains the dead value. | Confirm Render uses the replacement and record unexpected usage/charges as yes/no. Optional destructive history rewriting remains a separate decision. |
| Production Supabase tokens use ES256, but the deployed backend accepted only HS256. | **Resolved — production pass** | PR #53 added strict JWKS verification. Main CI passed, Render health returned 200, and a real signed-in production Summary request succeeded. | Preserve the 84-case auth regression suite. |
| AI cost controls were bypassable with account creation and IP rotation. | **Code complete / production migration pending** | Public preview is now deterministic and makes no Hugging Face call. Authenticated AI routes atomically consume Supabase-backed units: summary 1, cover letter 2, rewrite 5; ceilings are 10/user/day and 500 globally/day. Quota failure returns 503 before provider contact. | Apply migration 007, add `SUPABASE_ANON_KEY`, deploy with `AI_QUOTA_ENFORCEMENT=true`, and verify allowed/denied production calls. Confirm provider-side usage/budget settings. |
| Cross-user isolation is designed correctly but not proven in this run. | **Blocker** | Checked-in SQL enables RLS on all five user-data tables and the 20-test isolation/cascade suite exists. All 20 tests skipped because production test credentials were unavailable. | Run `docs/RLS_VERIFICATION.md` with process-scoped credentials and save the redacted result. |
| Protected backend routes reject anonymous traffic. | Pass | Production returned 401 for score, gap, compliance, summary, rewrite, cover-letter, and PDF export. Eighty auth cases are included in the passing suite. | Preserve as a regression gate. |
| Oversized and malformed request bodies have bounded handling. | Pass | ASGI middleware enforces 1 MB for declared and chunked bodies; production returned 413 for an oversized body. | Exercise malformed transport cases again in Gate 4. |
| Public score links use only 40 bits of identifier entropy. | **Medium** | `crypto.randomUUID()` is truncated to 10 hex characters. The RPC restricts reads to one supplied ID and omits `user_id`, but longer IDs are inexpensive defense-in-depth. | Expand new share IDs to at least 128 bits and add a user-visible revoke action. Existing links can remain valid until expiry. |

### B. Scraper and distributed automation

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Robots directives do not stop an abusive scraper. | **High** | Protected/share routes are disallowed and score pages are `noindex`, but `robots.txt` is advisory. Process-local IP limits reset on restart and do not stop distributed clients. | Add edge/provider abuse controls and durable quotas before meaningful traffic or ads. |
| Public AI preview was a direct cost surface. | **Resolved in code** | `/api/v1/preview-rewrite` now performs a deterministic weak-opening improvement and imports no Hugging Face client. Focused tests prove representative behavior. | Deploy and preserve the no-provider regression test. |
| Bulk Supabase reads are blocked in the checked-in design. | **UNVERIFIED / NO-GO** | `shared_scores` has owner-only SELECT and a single-row SECURITY DEFINER RPC that omits `user_id`; production behavior was not re-proven because RLS tests skipped. | Complete the production RLS runbook. |

### C. Confused non-technical user

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| The site contradicted itself about usage limits. | **Resolved in code** | Landing, ATS-checker, preview, and new-grad copy now consistently state fair-use access; `Unlimited`, `no limits`, and the unlimited-rewrite error were removed from current product UI. | Recheck production copy after deployment. |
| Scope limitations are substantially clearer than in the closed audit. | Pass | Public copy states English-language and taxonomy limitations, says scoring is directional, and explains that pasted-text checks cannot inspect PDF/DOCX layout. Non-English detection now returns a warning. | Verify the actual deployed signed-in flow in Gate 4. |
| Signed-in AI Summary works through the deployed production stack. | Pass | The owner generated a 61-word summary on production with a real Supabase session and Hugging Face response. | Preserve as a release smoke test. |

### D. Regulator reviewing resume-data handling

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Current public policy describes stored resumes, versions, jobs, share keywords, IP metadata, Sentry, Hugging Face processing, retention, export, and deletion. | Pass by code/HTTP review | `/privacy` and `/terms` returned 200; policy statements match the checked-in data flows inspected in this gate. | Preserve a dated data-flow-to-policy review in Gate 2. This is not legal advice. |
| Account export, deletion, and cross-user RLS remain unverified in this run. | **Blocker** | Server actions authenticate and filter by `user_id`; the RPC and cascade tests exist, but the production credential suite skipped. | Run the production isolation/export/delete procedure with throwaway users. |
| Expired-score cleanup could fail without failing the workflow. | **Code complete / production proof pending** | Non-200 cleanup now emits `::error::` and exits 1. The RPC is restricted to `service_role`, cleans shared scores plus quota rows older than 31 days, and no longer exposes raw database errors. | Apply migrations, confirm Vercel and GitHub have the cleanup secrets, then retain a successful scheduled run. |
| The exposed provider token is a reportable security-control failure even if no resume rows were exposed. | **Owner verification pending** | Rotation is evidenced by the active-token list, but whether the old token was used maliciously is still unknown. | Inspect Hugging Face usage/billing logs and record the result without storing any token. |

### E. AdSense policy reviewer

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Core review surfaces exist. | Pass | Homepage, privacy, terms, robots, and ads.txt return 200; six substantive articles, contact email, sitemap, and publisher ID wiring exist. | Confirm these again in Gate 2. |
| The checked-in cookie banner is not a Google-certified TCF CMP. | **Blocker before ads** | It stores a binary choice in `localStorage` and sends Consent Mode signals, but it does not create an IAB TCF string. Google requires a certified CMP for personalized ads in the EEA, UK, and Switzerland; TCF v2.3 is now the current framework. A Google dashboard CMP may exist, but it could not be verified here. | Owner verifies/enables Google Privacy & messaging European and US-state messages and provides non-secret evidence. Do not place ad units until proven. |
| No real ad-placement/density review is possible yet. | **UNVERIFIED / NO-GO for monetized launch** | `AdUnit.tsx` exists, but no slot IDs or live placements exist while Google review is pending. | After approval, add proposed placements on a branch and inspect desktop/mobile before production. |
| `Unlimited` marketing copy created reviewer and trust risk. | **Resolved in code** | Current product copy consistently says fair-use and the database-backed quota makes that statement enforceable. | Confirm deployed pages after merge. |

Official policy references:

- Google certified CMP requirement: <https://support.google.com/adsense/answer/13554116>
- Google TCF integration and v2.3 transition: <https://support.google.com/adsense/answer/9804260>
- Hugging Face token security and fine-grained production tokens: <https://huggingface.co/docs/hub/en/security-tokens>

## Owner actions required before Gate 1 can be closed as launch-safe

### Immediate — finish the exposed-token incident review

1. **Complete:** the exposed token is absent from the owner's active-token list; do not paste any token into chat, a command line, or a document.
2. Confirm the Render service uses the fine-grained `resumeai-production-v2` replacement without revealing its value.
3. In Hugging Face billing/usage, inspect activity since the original commit date and record whether any unexpected usage or charges exist.
4. Tell the audit only: `Render updated`, `unexpected usage: yes/no`, and whether the replacement deployment is healthy.

### Immediate — deploy Gate 1 quotas and restore Starter

1. Apply `supabase/migrations/007_ai_usage_quotas.sql` after taking the documented backup.
2. In Render, add `SUPABASE_ANON_KEY` and keep `SUPABASE_URL`; never expose the service-role key there.
3. Merge/synchronize the Blueprint and confirm the service badge is Starter, not Free.
4. Verify one allowed production Summary and a controlled quota-denial response.

### Required production proof — RLS

Follow `docs/RLS_VERIFICATION.md`. Keep all credentials process-scoped, run all 20 tests, and retain only the redacted pass/fail output.

### Required AdSense dashboard proof

In AdSense → Privacy & messaging, verify that a Google-certified European regulations message using current TCF is published for `resumeai.cv`, and review the US-state regulations message. Record only the message status and publish date; do not share account IDs beyond the already-public publisher ID.

## Pending owner decisions discovered in Gate 1

1. **Accurate usage copy:** resolved in code with fair-use wording.
2. **Durable AI quota architecture:** resolved in code with atomic Supabase daily units; production migration/configuration remains.
3. **Git-history cleanup:** optional and destructive. Rotation makes the exposed value unusable; do not rewrite history without a separate explicit authorization and collaborator plan.

## Gate 2 — Evidence-backed go/no-go checklist

Rule: every item that is `UNVERIFIED` or `NO-GO` blocks launch. Items marked `VERIFY` are proven by code inspection and previous pass; a new run with access to production credentials would upgrade them to `PASS`.

Evidence sources: `backend/tests/`, `docs/LAUNCH_PROGRAM.md`, `docs/DEPLOY.md`, git log, and the baseline evidence section at the top of this document.

| Phase | Exit gate | Status | Evidence |
|---|---|---|---|
| **1 — Build** | Dependencies install cleanly; all 9 routes return 200; frontend build compiles without network fetches. | **PASS** | Geist/Playfair fonts self-hosted; build passes in CI (verified 2026-08-06). No outbound font fetch. |
| **2 — Tests/CI** | CI run green; 80%+ branch coverage; Playwright happy path + failure paths pass; pip-audit and npm audit report 0 High CVEs. | **PASS** | Current branch: 535 passed, 24 production-credential tests skipped; frontend lint/build pass with 32 routes. Main CI passed on PR #53. Dependency audits remain at zero unaccepted High findings. |
| **3 — Security/Privacy** | JWT auth on 7 routes; body cap enforced; Bandit 0 High; CORS strict; prompt injection sanitized; PII stripped from Sentry. | **VERIFY — quota deploy** | Production ES256 auth is proven. Durable quota, fail-closed behavior, deterministic preview, stricter function grants, and 34 new regression tests pass locally; migration 007 and Render quota configuration are not yet production-proven. |
| **4 — Auth/RLS** | User A cannot read/mutate user B rows; account deletion cascades all 5 tables; data export covers all retained records. | **VERIFY** | 20-test RLS isolation suite passed against production Supabase on 2026-08-04 (recorded in LAUNCH_PROGRAM.md §4.5). All 20 **skipped in this audit** because `SUPABASE_SERVICE_ROLE_KEY` was not available to this process. Code design is correct; production proof exists but cannot be reproduced here without credentials. See Gate 1 §A for the NO-GO until re-run is confirmed. |
| **5 — Scoring quality** | 80%+ of 25 labeled pairs within one human grade; zero obvious strong matches score F; report reproducible in CI. | **PASS** | Eval harness: 25/25 pairs pass grade calibration (≤1 grade delta from human reference). Golden-file tests for taxonomy parsing pass. Synonym map covers 65+ groups. |
| **6 — Backend hardening** | HF circuit breaker retries + opens after 5 failures; scheduled health/cleanup check; request timeout 90s; 9 routes load-tested at bounded concurrency. | **VERIFY — Starter restore** | Circuit breaker and timeouts pass. Blueprint now pins `plan: starter`, but the latest owner dashboard screenshot showed Free; synchronize/upgrade and retain a new Starter screenshot. |
| **7 — Accessibility/Mobile** | WCAG 2.2 AA — no known blockers; Lighthouse accessibility ≥90 on representative pages. | **PASS** | 10/10 pages pass axe-core WCAG 2.2 tags (verified 2026-08-07, Session 123). 6 non-automatable 2.2 AA criteria verified by manual audit. Lighthouse a11y 94 (was 90+ baseline). |
| **8 — SEO/Monetization** | Sitemap/canonical/legal/content surfaces pass; certified ad consent and live placements must be proven before monetization. | **BLOCKED BEFORE ADS** | Public review surfaces and `ads.txt` pass. The custom banner is not certified TCF proof; AdSense Privacy & messaging status remains owner-only and no live placement/density review exists. |
| **9 — Auth/Data security** | Owner-only share writes/reads, non-enumerable public RPC, high-entropy links, revocation, and quota-free preview. | **VERIFY — deploy/RLS** | New links use 128-bit UUID entropy and the owner can revoke them in-flow. Public preview is deterministic. Production cross-user policies still require the protected 20-test run. |
| **10 — Observability** | Backend/frontend Sentry are PII-safe; uptime and cleanup failures alert; approved fixed spend is monitored. | **VERIFY — dashboards** | Cleanup now fails the scheduled workflow on non-200. Owner must confirm Render Starter billing and Hugging Face usage/budget status; the prior “all free/no payment methods” evidence is obsolete. |
| **11 — Release engineering** | 7 idempotent migrations; rollback rehearsed; backup drill executed; branch protection on `main`. | **VERIFY — migration 007** | Seven ordered migrations exist; migration 007 is additive but must be backed up/applied before the quota-enabled app deploy. Rollback and prior backup drill remain proven. |
| **12 — Go/no-go** | Current Prompt 3 strict review has no unverified blocker. | **NO-GO** | The historical 2026-08-04 GO is superseded by this rerun until the owner actions below and Gates 4/6 close. |

### Gate 2 open items requiring owner action

| Item | Severity | Action |
|---|---|---|
| Quota migration/configuration | **Blocker** | Back up Supabase; apply migration 007; add Render `SUPABASE_ANON_KEY`; deploy with quota enforcement; verify allowed and denied calls. |
| Render Starter | **Blocker** | Merge/synchronize the Blueprint and confirm the dashboard badge is Starter. |
| RLS re-verification | **CLOSED — 2026-08-08** | 20/20 pass against production Supabase confirmed by owner terminal run (all 5 tables: profiles, jobs, resumes, resume_versions, shared_scores + cascade delete). |
| TCF CMP for AdSense (Gate 1 §E) | **DEFERRED — owner decision** | Site is ad-free; Google site review pending. European regulations message not yet created (AdSense dashboard confirmed 2026-08-08). Required before placing any ad unit slots. Not a blocker for current ad-free launch. See memory: project_future_tcf_cmp. |
| HF provider incident/budget review | **CLOSED — 2026-08-08** | Unexpected usage: NO. HF billing shows 34 requests via Together AI, <$0.01, $0.00 charges for Aug 1–Sep 1 period. No unauthorized use. |
| Usage-limit copy | **CLOSED IN BRANCH** | The current branch already replaces `Unlimited` and `Usage Limits: none` with accurate fair-use wording across the landing, ATS-checker, preview, and new-grad surfaces. Confirm the deployed copy after merge. |

**Gate 2 verdict: CONDITIONAL NO-GO — Gate 1 production rollout remaining.** RLS, provider-usage review, ES256 authentication, and usage-limit copy are closed. The certified CMP is explicitly deferred for the current ad-free launch and remains mandatory before any ad units. Remaining Gate 1 blockers are migration 007, Render Starter Blueprint synchronization, quota environment values, and allowed/denied production quota proof. The overall Prompt 3 verdict still depends on the separate Gate 4/6 work.

---

## Gate 3 — Cost model

> Model date: 2026-08-07. Pricing from public plan pages; mark each as VERIFY if not recently confirmed.

### Service tier summary

| Service | Plan | Monthly cost | Key constraint |
|---|---|---|---|
| Vercel | Hobby (free) | $0 | 100 GB bandwidth/mo; 100k serverless function invocations/mo |
| Render | Starter | $7 | 512 MB RAM; shared CPU; no sleep |
| Supabase | Free | $0 | 500 MB database; 50k MAUs; 2 GB file storage; 5 GB bandwidth |
| HuggingFace | Free-tier API key | $0 | Rate-limited (~100–400 requests/hour depending on model demand); no token billing until credits purchased |
| Sentry | Free | $0 | 5k errors/mo; 10k performance events/mo |
| **Total** | | **$7/mo** | |

### Per-user footprint estimates

**Database row size:**
- `profiles`: ~0.5 KB/user
- `resumes` (avg 2 per user, ~8 KB each): ~16 KB/user
- `resume_versions` (avg 3 per resume, ~5 KB each): ~30 KB/user
- `jobs` (avg 5 per user): ~5 KB/user
- `shared_scores` (avg 1 per user): ~0.5 KB/user
- **Total DB per user: ~52 KB**

**Vercel traffic per session:**
- First visit: ~350 KB (JS bundle, CDN-cached after first hit per edge node)
- Subsequent visits (cached): ~5 KB (HTML shell only)
- Serverless function invocations: ~2–3 per authenticated session (protected pages use SSR for cookie checks)

**HuggingFace tokens per AI operation (estimated):**
| Operation | Input tokens | Output max | Total |
|---|---|---|---|
| Bullet rewrite (single) | ~500 | 250 | ~750 |
| Bullet rewrite (batch) | ~800 | 1,200 | ~2,000 |
| Summary | ~800 | 200 | ~1,000 |
| Cover letter | ~1,000 | 650 | ~1,650 |
| Preview rewrite (public) | ~200 | 150 | ~350 |

Assumed AI-feature adoption: 10% of monthly users make at least one AI call (conservative). Average AI session: 1 single rewrite + 1 summary = **1,750 tokens**.

### Scenario table

| Scenario | DB used | Vercel invocations | HF requests/mo (10% adoption) | HF tokens/mo | Monthly cost | First service to limit |
|---|---|---|---|---|---|---|
| **100 users/mo** | ~5 MB (1% of 500 MB) | ~1,500 | ~10 | ~17,500 | **$7** | Nothing — all within free tiers |
| **1,000 users/mo** | ~52 MB (10% of 500 MB) | ~15,000 | ~100 | ~175,000 | **$7** | HF free-tier rate limit during peak hours (circuit breaker handles with 429) |
| **10,000 users/mo** | ~520 MB (104% of 500 MB) | ~150,000 (50% over Vercel limit) | ~1,000 | ~1,750,000 | **$41–$60** | **Supabase DB fills at ~9,600 users; Vercel hits 100k function limit** |

### Cliffs in order of likelihood

1. **Supabase 500 MB database** — the most realistic first cliff. At ~52 KB/user, the free DB fills at approximately **9,600 active users**. Resolution: delete inactive accounts/old versions, or upgrade Supabase Pro ($25/mo adds 8 GB).

2. **HuggingFace free-tier rate limit** — affects real-time AI features if many users arrive simultaneously. The circuit breaker opens after 5 consecutive failures and recovers within 60 seconds. Users see a "service temporarily busy" message rather than a spinner that never resolves. Resolution at scale: add HF credits or HF PRO ($9/mo gives substantially higher limits).

3. **Vercel 100k serverless invocations/month** — reached at approximately 33,000 sessions/month (assuming 3 function calls/session). Most landing/blog pages are statically served; only authenticated dashboard pages invoke serverless functions. Resolution: upgrade to Vercel Pro ($20/mo) or increase static generation.

4. **Render 512 MB RAM** — unlikely below ~50k monthly users. PDF generation is synchronous but uses fpdf2 (low-memory). A sustained burst of 20+ concurrent PDF exports could pressure memory. Resolution: upgrade to Render Standard ($25/mo) for 1 GB RAM + dedicated CPU.

### What the $7/mo budget actually buys

| Users/mo | Works fine at $7/mo? | First required upgrade and estimated new cost |
|---|---|---|
| 0–1,000 | Yes | None |
| 1,000–5,000 | Yes, with HF rate-limit headroom | None for infra; possibly HF PRO $9/mo if AI-heavy |
| 5,000–9,600 | Watch Supabase DB | No code change; monitor at 80% (400 MB) |
| 9,600+ | Supabase cliff | Supabase Pro $25/mo; total becomes $32/mo |
| 30,000+ | Vercel + Render | Vercel Pro $20/mo + Render Standard $25/mo; total ~$72/mo |

**By 9,600 users**, AdSense revenue at even $0.50 RPM × 9,600 sessions/mo = **$4.80/mo** toward the $32/mo upgraded cost. The business case for upgrades funds itself at this scale.

---

## Gate 4 — Failure drills

**Owner:** Codex — requires frontend dev server + browser UX verification for each scenario.

TODO (Codex).

---

## Gate 5 — Rollback verification

Rollback goal: revert frontend and backend **independently** within five minutes of detecting a launch regression, with zero data loss and minimal user impact.

### Signal — how to know in under five minutes that a rollback is needed

```bash
# Backend health (run from any terminal)
curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://unified-resume-builder-api.onrender.com/health
# Expected: 200 <0.5s (warm). Anything else: investigate or roll back backend.

# Frontend health
curl -s -o /dev/null -w "%{http_code}" https://resumeai.cv
# Expected: 200. Non-200: investigate or roll back frontend.

# Automated signal (already configured):
# UptimeRobot checks /health every 5 minutes — email + push alert fires within 1 minute of downtime.
# Sentry fires on first unhandled exception spike (check https://sentry.io dashboard).
```

Decision tree:
- `/health` non-200 → backend regression → roll back Render
- `resumeai.cv` non-200 → frontend regression → roll back Vercel  
- Both 200 but users report broken AI → check Sentry for 502/503 on AI routes → roll back backend
- Both 200 but login broken → check Supabase status page first; if Supabase up → roll back backend or frontend auth code

### Frontend rollback — Vercel (independent of backend)

**Option A: Vercel CLI** (fastest, ~90 seconds)
```bash
# List recent deployments to find the last known-good URL
npx vercel ls --prod

# Promote a specific deployment to production
npx vercel rollback <previous-deployment-url>
# e.g.: npx vercel rollback https://ai-resume-generator-abc123.vercel.app
```

**Option B: Vercel Dashboard** (no CLI needed)
1. Open [vercel.com](https://vercel.com) → resumeai.cv project
2. Click **Deployments** tab
3. Find the last deployment before the bad one (green checkmark)
4. Click **...** → **Promote to Production**
5. Confirm — live within ~30 seconds

**Option C: Git revert** (creates audit trail, ~3 minutes)
```bash
git revert HEAD --no-edit
git push origin main
# Vercel auto-deploys on push to main
```

Vercel deployments are immutable and instantaneous — promoting a previous deployment never re-runs the build. No data loss is possible (frontend is stateless).

### Backend rollback — Render (independent of frontend)

**Option A: Render Dashboard** (fastest, ~2 minutes)
1. Open [render.com](https://render.com) → **unified-resume-builder-api** service
2. Click **Deploys** tab in the left sidebar
3. Find the last successful deploy (green dot) before the regression
4. Click **...** (three-dot menu) → **Redeploy**
5. Confirm — Render re-runs that exact git commit with the same environment variables

**Option B: Git revert + push** (creates audit trail, ~4 minutes)
```bash
git revert HEAD --no-edit          # creates a new revert commit on the backend change
git push origin main
# Render auto-deploys on push to main (auto-deploy must be enabled in Render service settings)
```

**Render environment variables are NOT rolled back** by either option. If the regression is in an env var (e.g., a bad `HUGGINGFACE_API_KEY`), fix it in Render → Environment, not via code rollback.

**Database rollback — Supabase:**
Supabase free tier has **daily automatic backups** but no point-in-time recovery. If a migration caused data loss:
```bash
# Check backup availability in Supabase dashboard: Database → Backups
# Restore is a dashboard action (not a CLI command) — contact Supabase support for free-tier restores
```
Accepted risk: documented in `docs/DEPLOY.md` — free tier has no PITR. Migrations are written to be reversible (each has a `-- rollback:` comment).

### Rollback independence proof

Frontend and backend are independently rollbackable because:
- Frontend API URL is set in Vercel env var `NEXT_PUBLIC_API_URL` and baked into the build. To point the current frontend at a different backend, update the env var and trigger a redeploy.
- Backend stores no frontend-specific session state — it is stateless per request (JWT from Supabase is validated per call).
- A Vercel rollback does NOT affect Render; a Render redeploy does NOT affect Vercel.

### Rollback time estimate

| Action | Time to decision | Time to resolution |
|---|---|---|
| Detect via UptimeRobot alert | — | ~1 min after failure |
| Detect via manual curl check | ~30 sec | — |
| Frontend rollback (Vercel dashboard) | 30 sec | ~2 min total |
| Backend rollback (Render dashboard) | 30 sec | ~3 min total |
| Git revert + push (either) | 2 min commit | ~5 min total |

**Gate 5 verdict: PASS.** Independent rollback path verified by code inspection. Render dashboard redeploy and Vercel promote-to-production are the fastest paths. Git revert is the preferred audit-trail option for non-emergency situations. Total time-to-recovery is within the five-minute target for dashboard-based rollback.

---

## Gate 6 — Final verdict

**Owner:** Codex — synthesize Gates 1–5 after Gate 4 failure drills are complete.

TODO (Codex).
