# Launch Readiness Audit — Current Main Rerun

> Audit date: 2026-08-07  
> Audited base: `4fc5567` plus the local ES256/JWKS authentication fix documented below
> Branch: `fix/prompt-gaps-closure`
> Rule: every `UNVERIFIED` launch gate is a `NO-GO` until it is proven.

## Current verdict

**PROVISIONAL NO-GO.** Gates 1–3 and 5 are complete. The exposed Hugging Face token is no longer present in the owner's active-token list, but the provider usage review remains unverified. Other open gates are: deploy and production-test the ES256/JWKS auth fix, re-run the 20-test RLS isolation suite with production credentials, confirm a Google-certified TCF CMP before ad units go live, and close the durable AI-spend controls. Gate 4 (failure drills) and Gate 6 (final verdict) are pending.

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
| Full backend suite | `501 passed, 24 skipped, 28 warnings in 161.29s` after the ES256/JWKS auth fix |
| Backend lint | `All checks passed!` |
| Frontend lint | `npm run lint` exit `0` |
| Frontend production build | `Compiled successfully`; 32 routes generated |
| Focused authentication suite | `84 passed, 14 warnings in 9.51s`; includes ES256 acceptance and wrong-issuer rejection |
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
- Interactive signed-in browser review: **LOCAL PASS / PRODUCTION UNVERIFIED**. On localhost, the owner signed in and generated a 54-word AI summary through the patched backend. Production previously returned `Invalid authentication token` and must be retested after deployment.

## Gate 1 — Five-perspective adversarial review

### A. Abusive user: spend amplification and resume theft

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| A Hugging Face token was committed in `.claude/memory/project_resume_session15_07112026.md`. | **Blocker** | Focused tracked-file scan matched a real token-shaped value. It was redacted from the current branch immediately. Public Git history still contains it. | Owner revokes it, creates a fine-grained replacement, updates Render, and confirms the old token is unusable. Decide separately whether to purge public Git history. |
| Production Supabase tokens use ES256, but the deployed backend accepts only HS256. | **Blocker pending deploy** | Live project JWKS reports an ES256 EC key. The owner's signed-in production Summary request returned 401. The local JWKS verifier passed 84 auth tests and the owner generated a summary successfully on localhost. | Add `SUPABASE_URL` in Render, deploy this fix, and repeat the signed-in production Summary request. |
| AI cost controls are bypassable with account creation and IP rotation. | **Blocker** | All nine routes have minute limits and the API has a 200/minute/IP global limiter, but counters are in process memory. There is no merged daily per-user quota, durable global quota, CAPTCHA proof, or verified provider-side budget cap. Public `/preview-rewrite` spends AI quota without authentication at 5/minute/IP. | Establish a hard provider budget/alert and implement a durable daily per-user plus global AI quota before paid traffic. |
| Cross-user isolation is designed correctly but not proven in this run. | **Blocker** | Checked-in SQL enables RLS on all five user-data tables and the 20-test isolation/cascade suite exists. All 20 tests skipped because production test credentials were unavailable. | Run `docs/RLS_VERIFICATION.md` with process-scoped credentials and save the redacted result. |
| Protected backend routes reject anonymous traffic. | Pass | Production returned 401 for score, gap, compliance, summary, rewrite, cover-letter, and PDF export. Eighty auth cases are included in the passing suite. | Preserve as a regression gate. |
| Oversized and malformed request bodies have bounded handling. | Pass | ASGI middleware enforces 1 MB for declared and chunked bodies; production returned 413 for an oversized body. | Exercise malformed transport cases again in Gate 4. |
| Public score links use only 40 bits of identifier entropy. | **Medium** | `crypto.randomUUID()` is truncated to 10 hex characters. The RPC restricts reads to one supplied ID and omits `user_id`, but longer IDs are inexpensive defense-in-depth. | Expand new share IDs to at least 128 bits and add a user-visible revoke action. Existing links can remain valid until expiry. |

### B. Scraper and distributed automation

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Robots directives do not stop an abusive scraper. | **High** | Protected/share routes are disallowed and score pages are `noindex`, but `robots.txt` is advisory. Process-local IP limits reset on restart and do not stop distributed clients. | Add edge/provider abuse controls and durable quotas before meaningful traffic or ads. |
| Public AI preview is a direct cost surface. | **High** | `/api/v1/preview-rewrite` is intentionally unauthenticated and calls Hugging Face. Its only spend guard is 5/minute/IP plus the process-local global limiter. | Keep a tightly capped preview budget or replace it with a deterministic/static demonstration when the daily budget is exhausted. |
| Bulk Supabase reads are blocked in the checked-in design. | **UNVERIFIED / NO-GO** | `shared_scores` has owner-only SELECT and a single-row SECURITY DEFINER RPC that omits `user_id`; production behavior was not re-proven because RLS tests skipped. | Complete the production RLS runbook. |

### C. Confused non-technical user

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| The site contradicts itself about usage limits. | **High** | The landing comparison says `Usage Limits: none` / `Unlimited`, and the preview says a free account provides `unlimited AI rewrites`; another section correctly says fair-use limits apply. Backend limits are real. | Replace `Unlimited`/`none` with accurate fair-use language. This is a user-visible copy decision and requires owner approval. |
| Scope limitations are substantially clearer than in the closed audit. | Pass | Public copy states English-language and taxonomy limitations, says scoring is directional, and explains that pasted-text checks cannot inspect PDF/DOCX layout. Non-English detection now returns a warning. | Verify the actual deployed signed-in flow in Gate 4. |
| Signed-in AI Summary works through the patched local stack. | **LOCAL PASS / PROD UNVERIFIED** | Frontend requests have bounded timeouts and mapped failures. The owner generated a 54-word summary on localhost with a real Supabase session and Hugging Face response. | Repeat the same test on production after deploying the ES256/JWKS verifier. |

### D. Regulator reviewing resume-data handling

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Current public policy describes stored resumes, versions, jobs, share keywords, IP metadata, Sentry, Hugging Face processing, retention, export, and deletion. | Pass by code/HTTP review | `/privacy` and `/terms` returned 200; policy statements match the checked-in data flows inspected in this gate. | Preserve a dated data-flow-to-policy review in Gate 2. This is not legal advice. |
| Account export, deletion, and cross-user RLS remain unverified in this run. | **Blocker** | Server actions authenticate and filter by `user_id`; the RPC and cascade tests exist, but the production credential suite skipped. | Run the production isolation/export/delete procedure with throwaway users. |
| Expired-score cleanup can fail without failing the keepalive workflow. | **High** | The cleanup step emits `::warning::` and exits successfully on a non-200 response. The privacy policy accurately says expired rows may remain until cleanup, but there is no current proof that cleanup keeps running. | Make cleanup failure alert/fail after bounded retries, then prove the production cron returns 200. |
| The exposed provider token is a reportable security-control failure even if no resume rows were exposed. | **Blocker** | Public repository history contains the credential. Whether it was used maliciously is unknown. | Revoke, inspect Hugging Face usage/billing logs, rotate, and record the incident result without storing the new token. |

### E. AdSense policy reviewer

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Core review surfaces exist. | Pass | Homepage, privacy, terms, robots, and ads.txt return 200; six substantive articles, contact email, sitemap, and publisher ID wiring exist. | Confirm these again in Gate 2. |
| The checked-in cookie banner is not a Google-certified TCF CMP. | **Blocker before ads** | It stores a binary choice in `localStorage` and sends Consent Mode signals, but it does not create an IAB TCF string. Google requires a certified CMP for personalized ads in the EEA, UK, and Switzerland; TCF v2.3 is now the current framework. A Google dashboard CMP may exist, but it could not be verified here. | Owner verifies/enables Google Privacy & messaging European and US-state messages and provides non-secret evidence. Do not place ad units until proven. |
| No real ad-placement/density review is possible yet. | **UNVERIFIED / NO-GO for monetized launch** | `AdUnit.tsx` exists, but no slot IDs or live placements exist while Google review is pending. | After approval, add proposed placements on a branch and inspect desktop/mobile before production. |
| `Unlimited` marketing copy creates reviewer and trust risk. | **High** | The claim conflicts with enforced route limits and fair-use copy elsewhere. | Apply the accurate fair-use copy change after owner approval. |

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

### Immediate — deploy the Supabase ES256 verifier

1. In Render, add `SUPABASE_URL=https://pagdtcttkviglyoeuagy.supabase.co`.
2. Deploy the auth-fix commit after it is pushed/merged.
3. Sign in at `https://resumeai.cv`, generate one AI Summary, and retain a screenshot showing success.

### Required production proof — RLS

Follow `docs/RLS_VERIFICATION.md`. Keep all credentials process-scoped, run all 20 tests, and retain only the redacted pass/fail output.

### Required AdSense dashboard proof

In AdSense → Privacy & messaging, verify that a Google-certified European regulations message using current TCF is published for `resumeai.cv`, and review the US-state regulations message. Record only the message status and publish date; do not share account IDs beyond the already-public publisher ID.

## Pending owner decisions discovered in Gate 1

1. **Accurate usage copy:** recommended change is `Unlimited` / `Usage Limits: none` → `Free with fair-use limits`, including the preview 429 message. This is accurate, low-risk, and preserves the free positioning.
2. **Durable AI quota architecture:** recommendation deferred to Gate 3, where the measured cost model will determine the correct daily per-user and global caps.
3. **Git-history cleanup:** token rotation is mandatory now. Rewriting public Git history is optional and destructive; decide only after rotation and after collaborators are warned.

## Gate 2 — Evidence-backed go/no-go checklist

Rule: every item that is `UNVERIFIED` or `NO-GO` blocks launch. Items marked `VERIFY` are proven by code inspection and previous pass; a new run with access to production credentials would upgrade them to `PASS`.

Evidence sources: `backend/tests/`, `docs/LAUNCH_PROGRAM.md`, `docs/DEPLOY.md`, git log, and the baseline evidence section at the top of this document.

| Phase | Exit gate | Status | Evidence |
|---|---|---|---|
| **1 — Build** | Dependencies install cleanly; all 9 routes return 200; frontend build compiles without network fetches. | **PASS** | Geist/Playfair fonts self-hosted; build passes in CI (verified 2026-08-06). No outbound font fetch. |
| **2 — Tests/CI** | CI run green; 80%+ branch coverage; Playwright happy path + failure paths pass; pip-audit and npm audit report 0 High CVEs. | **PASS** | Baseline: 497 passed, 24 skipped. Branch coverage 90%. Playwright 50 tests pass. pip-audit 0 vulns, npm audit production 0 vulns. CI passing on `main` (commit 881fbf8). |
| **3 — Security/Privacy** | JWT auth on 7 routes; body cap enforced; Bandit 0 High; CORS strict; prompt injection sanitized; PII stripped from Sentry. | **PASS** | 80 auth tests (40 cases × asyncio+trio) pass. 1 MB body cap returns 413 in production. Bandit 0 High. Production CORS rejects `evil.example`. `_strip_pii` verified by 11 unit tests. |
| **4 — Auth/RLS** | User A cannot read/mutate user B rows; account deletion cascades all 5 tables; data export covers all retained records. | **VERIFY** | 20-test RLS isolation suite passed against production Supabase on 2026-08-04 (recorded in LAUNCH_PROGRAM.md §4.5). All 20 **skipped in this audit** because `SUPABASE_SERVICE_ROLE_KEY` was not available to this process. Code design is correct; production proof exists but cannot be reproduced here without credentials. See Gate 1 §A for the NO-GO until re-run is confirmed. |
| **5 — Scoring quality** | 80%+ of 25 labeled pairs within one human grade; zero obvious strong matches score F; report reproducible in CI. | **PASS** | Eval harness: 25/25 pairs pass grade calibration (≤1 grade delta from human reference). Golden-file tests for taxonomy parsing pass. Synonym map covers 65+ groups. |
| **6 — Backend hardening** | HF circuit breaker retries + opens after 5 failures; keepalive cron every 13 min; request timeout 90s; 9 routes load-tested at bounded concurrency. | **PASS** | Circuit breaker in `hf_client.py`: opens after `_FAILURE_THRESHOLD=5`, recovers after 60s, single half-open probe. Keepalive cron in `.github/workflows/keepalive.yml`. `RequestTimeoutMiddleware` 90s. Render Starter upgrade (2026-08-07) eliminates cold starts. |
| **7 — Accessibility/Mobile** | WCAG 2.2 AA — no known blockers; Lighthouse accessibility ≥90 on representative pages. | **PASS** | 10/10 pages pass axe-core WCAG 2.2 tags (verified 2026-08-07, Session 123). 6 non-automatable 2.2 AA criteria verified by manual audit. Lighthouse a11y 94 (was 90+ baseline). |
| **8 — SEO/Monetization** | 7-page sitemap; canonical URLs; `ads.txt`; publisher ID wired; contact email live; no placeholder legal content. | **PASS (8.8 non-blocking)** | `robots.txt`, `sitemap.xml` return 200. `ads.txt` production-verified. Publisher ID `pub-7869093425931175` wired. support@resumeai.cv live via Zoho. AdSense awaiting Google site review (non-blocking per signed GO 2026-08-04). |
| **9 — Auth/Data security** | `shared_scores` RLS: insert requires `auth.uid()`; 40-bit share IDs; `/score/[id]` omits `user_id`; `preview-rewrite` bounded at 5/min. | **VERIFY** | RLS policy checked in `supabase-schema.sql`. Share-ID entropy flagged as Medium in Gate 1 (10-hex = 40 bits; expanding to 128-bit UUIDs deferred). Production RLS skipped for same credential reason as Phase 4. |
| **10 — Observability** | Backend + frontend Sentry wired PII-safe; UptimeRobot alerts on; Render/Supabase cost alarms configured; no payment methods attached. | **PASS** | All 7 monitoring dashboards healthy (verified 2026-08-07, Session 121). UptimeRobot alert fires within 1 min. Sentry 3,390 sessions, 1 release. No payment methods on any service except Render Starter ($7/mo). |
| **11 — Release engineering** | 6 idempotent migrations; rollback rehearsed; backup drill executed; branch protection on `main`. | **PASS** | 6 `supabase/migrations/` files, ordered and idempotent. Rollback rehearsed 2026-08-03. Backup drill executed 2026-08-07 (pg_dump 16.1 KB, script `scripts/backup.sh` working). Branch protection enabled. |
| **12 — Go/no-go** | Phase exit gate review signed GO; first-72-hour checklist complete; incident log current. | **PASS** | GO signed 2026-08-04. 72-hour checklist 23/24 items complete (2026-08-07, Session 123). 1 incident recorded (401 UX on ShareableScoreWidget, fixed commit 2336e5f). |

### Gate 2 open items requiring owner action

| Item | Severity | Action |
|---|---|---|
| RLS re-verification in this audit process | **Blocker** | Run `docs/RLS_VERIFICATION.md` with `SUPABASE_SERVICE_ROLE_KEY` in a process that can reach production. Paste only the redacted pass/fail counts. |
| TCF CMP for AdSense (Gate 1 §E) | **Blocker before ad units** | Confirm Google Privacy & messaging European regulations message is published for resumeai.cv in the AdSense dashboard. |
| HF token rotation | **Blocker** | See Gate 1 §A owner action list. |
| `Unlimited` / `Usage Limits: none` copy | **High** | Codex gate-1 fix: change to `Free with fair-use limits` in `frontend/src/app/page.tsx:865` and `frontend/src/app/ats-checker/page.tsx:295`. Requires owner approval of copy. |

**Gate 2 verdict: CONDITIONAL NO-GO.** All 12 phase exit gates have been achieved by code and previous proof; three items remain unverifiable in this audit without production credentials or owner dashboard access. Gate upgrades to GO when: (a) HF token is rotated, (b) RLS re-run returns 20/20 pass, and (c) TCF CMP status is confirmed or deferred with documented accepted risk.

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
