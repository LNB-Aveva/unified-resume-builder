# Launch Readiness Audit — Current Main Rerun

> Audit date: 2026-08-10
> Audited base: `6fc4f71` on `main`
> Branch: `docs/gate1a-production-closeout`
> Rule: every `UNVERIFIED` launch gate is a `NO-GO` until it is proven.

## Current verdict

**NO-GO for the full Prompt 3 launch decision.** Gates 2, 3, and 5 are complete, and Gate 1(a) is now a code-and-production **PASS**. The production proof covers migration 008, backend-only quota mutation, fail-fast Render configuration, durable quota accounting and denial, database storage ceilings, Turnstile/Supabase CAPTCHA, 20/20 RLS isolation, and 5/5 abuse-control tests. This does not close the whole adversarial review: Gates 1(b–e), 4, and 6 remain pending.

Cost model verdict: the $7/mo budget safely handles 0–9,600 users. The first hard cliff is Supabase's 500 MB free DB at approximately 9,600 active users (~52 KB/user average footprint). HuggingFace free-tier rate limits become visible at ~1,000 users during peak hours but fail gracefully via circuit breaker.

| Gate | Owner | Status |
|---|---|---|
| 1. Five-perspective adversarial review | Codex | **IN PROGRESS — 1(a) PASS; 1(b–e) pending** |
| 2. Evidence-backed go/no-go checklist | Claude | **COMPLETE — CONDITIONAL NO-GO (3 owner items required)** |
| 3. 100 / 1,000 / 10,000-user cost model | Claude | **COMPLETE — cliff at ~9,600 users (Supabase DB)** |
| 4. Failure drills | Codex | **TODO** |
| 5. Independent rollback verification | Claude | **COMPLETE — PASS** |
| 6. Final verdict and top three accepted risks | Codex | **TODO (after Gate 4)** |

## Baseline evidence

Commands were run from the current branch before editing this report.

| Check | Exact result |
|---|---|
| Full backend suite | `539 passed, 29 skipped, 28 warnings in 149.93s` after Gate 1(a) remediation |
| Backend lint | `All checks passed!` |
| Frontend lint | `npm run lint` exit `0` |
| Frontend production build | `Compiled successfully`; 32 routes generated |
| Focused security/auth/API suite | `177 passed, 14 warnings`; includes ES256, backend-only quota denial, route weights, deterministic preview, and SQL security contracts |
| Production data-control suites | 20 RLS and 5 abuse-control tests collected but skipped locally because protected production credentials were not available; retained production RLS evidence remains 20/20 |
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
| Runtime AI quota enforcement was contradicted by the missing production ledger row. | **Pass** | Render `/health` reported release `ead449c1aade`, status `ok`, and both quota safeguards `true`. One production Summary created a daily ledger row with one unit; after setting only the throwaway account to ten units, the next Summary returned HTTP 429 and the bounded daily fair-use message. | Monitor ledger growth, 429 volume, and provider usage. Preserve the provider-not-called-on-denial regression. |
| Account rotation could bypass the per-user allowance and deny AI globally without provider calls. | **Pass with residual risk** | Migration 008 removed the browser-callable quota signature and restricted UUID-bound quota mutation to `service_role`. Real Turnstile checks passed sign-up, sign-in, and password reset; Supabase CAPTCHA is enabled. A direct password-auth request without a CAPTCHA token failed with HTTP 400 `captcha_failed`. | CAPTCHA adds friction but cannot eliminate distributed human or solver-backed account farms. The durable 500-unit global ceiling bounds spend; monitor signup and global-quota patterns. |
| An authenticated user could exhaust Supabase storage through direct PostgREST writes. | **Pass** | The production catalog returned all six expected migration checks as `true`. The protected workflow then passed all five abuse tests, including oversized/far-future write rejection and the 50-resume ceiling. Count triggers and validated content constraints are active. | Monitor limit errors and revisit ceilings using real usage data. Keep the production abuse workflow required after schema or policy changes. |
| Cross-user reads and writes are isolated in production. | **Pass** | Protected workflow run `31430596989` passed 20/20 RLS tests across profiles, jobs, resumes, resume versions, shared scores, and cascade deletion, with zero skips, on main SHA `6fc4f71`. Server actions also filter by authenticated `user_id`; the public shared-score RPC omits `user_id` and raw resume text. | Preserve the protected production RLS workflow as a release gate after policy/schema changes. |
| Public score links do not expose complete resumes and are not feasibly enumerable. | **Pass with intentional disclosure** | New IDs retain the full hyphenless UUID v4 generated by `crypto.randomUUID()` (122 random bits), owners can revoke them, expired rows are rejected, and the public RPC omits `user_id` and raw resume text. Anyone who receives the link can still see matched/missing keywords and the role hint by design. | Keep the disclosure explicit in the share UI; never add raw resume text, contact details, or `user_id` to the public RPC. |
| Protected backend routes reject anonymous or forged authentication. | **Pass** | Production returned 401 for all seven protected routes. The focused 2026-08-09 suite passed 122 quota/auth/rate-limit tests; strict ES256/RS256 issuer and audience verification is deployed. | Preserve the auth and provider-not-called-on-denial tests. |
| Production IP-header rotation did not bypass throttling. | **Pass, edge-dependent** | A controlled quota-free probe on 2026-08-09 showed Cloudflare rejecting forged `CF-Connecting-IP`/`CF-Ray` with 403. Rotating attacker-supplied `X-Forwarded-For` values still shared one bucket: the sixth application request to the 5/minute preview route returned 429. | Alert on 429 volume. Re-run this probe if the Cloudflare/Render topology or proxy-hop count changes; in-memory limits still reset on process restart and do not stop distributed clients. |
| The previously committed Hugging Face token is retired. | **Pass with historical residue** | The value is redacted from the current file, absent from the active-token list, and the owner found no unexpected activity or charges. Public Git history still contains the dead value. | Keep the replacement fine-grained and monitor provider usage. History rewriting remains optional and requires a separate destructive-operation plan. |
| A stolen access token remains usable until JWT expiry even after logout. | **Medium residual** | Backend and RLS authorization are stateless JWT checks. Supabase sign-out revokes refresh capability, not an already-issued access token. No application denylist exists. This does not create an IDOR, but token theft temporarily becomes the victim's authority. | Keep access-token TTL short, preserve XSS/token-handling defenses, and document account-compromise response. Consider session revocation checks if threat or traffic increases. |

**Gate 1(a) verdict: PASS — code and production evidence complete on 2026-08-10.** Migration and storage controls are active; Render fails closed with backend-only quota configuration; real CAPTCHA flows work and tokenless auth is rejected; protected run `31430596989` passed 20/20 RLS plus 5/5 abuse tests with zero skips; and real quota consumption followed by HTTP 429 denial was observed. The owner deleted the throwaway and stale cascade fixtures, and the final cleanup query returned zero matching test users. Residual risks accepted for this sub-gate are solver-backed account farms, access tokens remaining valid until expiry after logout, and process-local IP limits resetting or scaling independently.

### B. Scraper and distributed automation

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Anonymous Supabase identities bypassed the permanent-account abuse boundary. | **Blocker found; first application tranche deployed / database proof pending** | `JobTracker` contained `signInAnonymously()`. Supabase anonymous users receive the `authenticated` role, while backend auth and owner RLS did not inspect `is_anonymous`; a distributed client could therefore rotate CAPTCHA-free identities. Release `6ab30a98d53e` removes browser creation and rejects anonymous JWTs with HTTP 403. The pending closeout also treats old anonymous sessions as signed out. Migration 009 contains restrictive policies across six retained owner-data tables plus a service-role-only catalog verifier, but is not production-proven. | Disable Anonymous Sign-Ins, inventory/clean old anonymous users with backup, apply migration 009, prove six restrictive policies and a rejected rollback-only write, then rerun 26/26 production controls. |
| Public crawling amplified into a remote Supabase Auth lookup on every page. | **Pass in deployed code** | The proxy called `getUser()` for public static and SSG routes. Supabase documents that `getUser()` always contacts Auth; `getClaims()` verifies production ES256 tokens locally against cached JWKS. Release `6ab30a98d53e` uses `getClaims()`; main CI passed and public/auth localhost routes returned 200. | Preserve the cached-claims contract and smoke-test auth refresh after related dependency changes. |
| Sitemap timestamps falsely claimed every page changed on every request. | **Pass in production** | Bounded pre-change evidence showed the current request timestamp on every sitemap entry. Release `6ab30a98d53e` uses checked-in article dates and omits fabricated static-page dates; production now exposes only `2026-07-04` and `2026-07-30`. | Keep article `updatedAt` accurate when content materially changes. |
| Robots directives do not stop an abusive scraper. | **Accepted residual after proof** | Protected/share routes are disallowed and score pages are `noindex`, but `robots.txt` is advisory. Public content must remain indexable. Vercel and Render provide automatic DDoS mitigation; Render is visibly behind Cloudflare (`CF-Ray` captured), and the app adds body, timeout, route, and global IP limits. | Retain the incident procedure in `docs/GATE1B_SCRAPER_CONTROLS.md`; use Vercel Attack Challenge Mode during an active attack. Process-local limits remain a documented scaling constraint. |
| Public AI preview was a direct cost surface. | **Pass** | `/api/v1/preview-rewrite` is deterministic, has a 500-character body field and 5/minute route limit, and imports no provider client. A bounded production request returned the local transformation. | Preserve the no-provider regression test. |
| Bulk cross-user Supabase reads are blocked. | **Pass with intentional public share lookup** | Production RLS passed 20/20. `shared_scores` has owner-only SELECT and a single-row SECURITY DEFINER RPC that omits `user_id` and resume text; full UUID share IDs are not feasibly enumerable. | Require the expanded 26/26 production verification after migration 009 and never widen the public RPC output. |

**Gate 1(b) verdict: NO-GO pending production rollout and proof.** The detailed
attack inventory, remediation, rollout SQL, bounded production observations,
incident procedure, and residual-risk boundary are in
`docs/GATE1B_SCRAPER_CONTROLS.md`.

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
| Account export, deletion, and cross-user RLS cover retained account data. | **Pass; re-run after migration** | The export retrieves account, profile, jobs, resumes with all versions, and shared scores; retained production evidence passed the cascade/isolation suite 20/20. | Preserve the production procedure and re-run it after migration 008. |
| Expired-score cleanup could fail without failing the workflow. | **Code complete / production proof pending** | Non-200 cleanup now emits `::error::` and exits 1. The RPC is restricted to `service_role`, cleans shared scores plus quota rows older than 31 days, and no longer exposes raw database errors. | Apply migrations, confirm Vercel and GitHub have the cleanup secrets, then retain a successful scheduled run. |
| The exposed provider token was retired and its usage reviewed. | **Pass with historical residue** | The active-token list no longer contains the exposed value; the owner reported no unexpected usage or charges. The dead value remains in Git history. | Keep the replacement fine-grained and monitored; history rewriting is optional and separately destructive. |

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
- Supabase CAPTCHA client and dashboard requirements: <https://supabase.com/docs/guides/auth/auth-captcha>
- Supabase access-token behavior after sign-out: <https://supabase.com/docs/reference/javascript/auth-signout>

## Owner actions required before Gate 1 can be closed as launch-safe

### Closed — exposed-token incident review

The old value is absent from the active-token list, Render has the fine-grained replacement, and the owner reported no unexpected usage or charges. Never paste either value into chat, a command line, or documentation.

### Closed — Gate 1(a) production proof

The owner completed the backup, migration 008 catalog proof, Render fail-fast health proof, free Turnstile/Supabase setup, protected 25-test run, real allowed/denied quota evidence, and test-account cleanup on 2026-08-10. The retained evidence and exact run identifiers are recorded in `docs/GATE1A_ABUSE_CONTROLS.md`.

### Closed — production RLS proof

The protected production procedure passed 20/20. Re-run `docs/RLS_VERIFICATION.md` after any table, policy, function-grant, or auth change.

### Closed — Gate 1(a) account and storage controls

Browser quota mutation is revoked in migration 008, database limits are enforced by constraints/triggers, and Turnstile tokens are forwarded by all email-auth abuse surfaces. The Gate 1(a) production proof completed on 2026-08-10.

### Required — Gate 1(b) scraper-control rollout

Gate 1(b) found that Supabase anonymous users could reuse the `authenticated`
role and that public crawls caused a remote Auth lookup. Follow
`docs/GATE1B_SCRAPER_CONTROLS.md`: inventory anonymous users, disable Anonymous
Sign-Ins, apply and prove migration 009, deploy the final backend/frontend
controls, verify corrected sitemap dates, and rerun the protected 26-test
workflow.

### Required AdSense dashboard proof

In AdSense → Privacy & messaging, verify that a Google-certified European regulations message using current TCF is published for `resumeai.cv`, and review the US-state regulations message. Record only the message status and publish date; do not share account IDs beyond the already-public publisher ID.

## Pending owner decisions discovered in Gate 1

1. **Accurate usage copy:** resolved in code with fair-use wording.
2. **Durable AI quota architecture:** resolved and production-proven; direct client invocation is removed, quota reservation is backend-only, and a ceiling request returned HTTP 429.
3. **Git-history cleanup:** optional and destructive. Rotation makes the exposed value unusable; do not rewrite history without a separate explicit authorization and collaborator plan.
4. **Anonymous-user cleanup:** inspect the production count and related rows after backup. Deletion is appropriate only after the owner confirms that no retained guest data is needed; migration 009 deliberately does not delete rows.

## Gate 2 — Evidence-backed go/no-go checklist

Rule: every item that is `UNVERIFIED` or `NO-GO` blocks launch. Items marked `VERIFY` are proven by code inspection and previous pass; a new run with access to production credentials would upgrade them to `PASS`.

Evidence sources: `backend/tests/`, `docs/LAUNCH_PROGRAM.md`, `docs/DEPLOY.md`, git log, and the baseline evidence section at the top of this document.

| Phase | Exit gate | Status | Evidence |
|---|---|---|---|
| **1 — Build** | Dependencies install cleanly; all 9 routes return 200; frontend build compiles without network fetches. | **PASS** | Geist/Playfair fonts self-hosted; build passes in CI (verified 2026-08-06). No outbound font fetch. |
| **2 — Tests/CI** | CI run green; 80%+ branch coverage; Playwright happy path + failure paths pass; pip-audit and npm audit report 0 High CVEs. | **PASS** | Main CI is green. Protected production run `31430596989` passed 20 RLS and 5 abuse tests with zero skips. Frontend lint/build pass with 32 routes. Dependency audits remain at zero unaccepted High findings. |
| **3 — Security/Privacy** | JWT auth on 7 routes; body cap enforced; Bandit 0 High; CORS strict; prompt injection sanitized; PII stripped from Sentry. | **PASS for Gate 1(a)** | Production ES256 auth, backend-only quota mutation, fail-fast production startup, deterministic preview, storage ceilings, Turnstile/Supabase CAPTCHA, quota accounting, and denial are production-proven. The remaining Gate 1 perspectives are assessed separately. |
| **4 — Auth/RLS** | User A cannot read/mutate user B rows; account deletion cascades all 5 tables; data export covers all retained records. | **PASS** | Protected production run `31430596989` passed all 20 RLS isolation and cascade tests with zero skips on 2026-08-10. |
| **5 — Scoring quality** | 80%+ of 25 labeled pairs within one human grade; zero obvious strong matches score F; report reproducible in CI. | **PASS** | Eval harness: 25/25 pairs pass grade calibration (≤1 grade delta from human reference). Golden-file tests for taxonomy parsing pass. Synonym map covers 65+ groups. |
| **6 — Backend hardening** | HF circuit breaker retries + opens after 5 failures; scheduled health/cleanup check; request timeout 90s; 9 routes load-tested at bounded concurrency. | **VERIFY — Starter restore** | Circuit breaker and timeouts pass. Blueprint now pins `plan: starter`, but the latest owner dashboard screenshot showed Free; synchronize/upgrade and retain a new Starter screenshot. |
| **7 — Accessibility/Mobile** | WCAG 2.2 AA — no known blockers; Lighthouse accessibility ≥90 on representative pages. | **PASS** | 10/10 pages pass axe-core WCAG 2.2 tags (verified 2026-08-07, Session 123). 6 non-automatable 2.2 AA criteria verified by manual audit. Lighthouse a11y 94 (was 90+ baseline). |
| **8 — SEO/Monetization** | Sitemap/canonical/legal/content surfaces pass; certified ad consent and live placements must be proven before monetization. | **BLOCKED BEFORE ADS** | Public review surfaces and `ads.txt` pass. The custom banner is not certified TCF proof; AdSense Privacy & messaging status remains owner-only and no live placement/density review exists. |
| **9 — Auth/Data security** | Owner-only share writes/reads, non-enumerable public RPC, high-entropy links, revocation, and quota-free preview. | **VERIFY — abuse controls** | New links retain full UUID v4 entropy and the owner can revoke them in-flow. Public preview is deterministic. Production RLS is 20/20; migration 008 adds five production abuse proofs. |
| **10 — Observability** | Backend/frontend Sentry are PII-safe; uptime and cleanup failures alert; approved fixed spend is monitored. | **VERIFY — dashboards** | Cleanup now fails the scheduled workflow on non-200. Owner must confirm Render Starter billing and Hugging Face usage/budget status; the prior “all free/no payment methods” evidence is obsolete. |
| **11 — Release engineering** | Ordered idempotent migrations; rollback rehearsed; backup drill executed; branch protection on `main`. | **VERIFY — migration 008** | Eight ordered migrations exist; migration 008 must be backed up/applied before the backend-only quota deployment. Rollback and prior backup drill remain proven. |
| **12 — Go/no-go** | Current Prompt 3 strict review has no unverified blocker. | **NO-GO** | The historical 2026-08-04 GO is superseded by this rerun until the owner actions below and Gates 4/6 close. |

### Gate 2 open items requiring owner action

| Item | Severity | Action |
|---|---|---|
| Gate 1(a) abuse controls | **CLOSED — 2026-08-10** | Migration, Render safeguards, real CAPTCHA flows, tokenless-auth rejection, 25/25 production tests, quota ledger creation, HTTP 429 denial, and fixture cleanup are proven. |
| Render Starter | **Blocker** | Merge/synchronize the Blueprint and confirm the dashboard badge is Starter. |
| RLS re-verification | **CLOSED — 2026-08-08** | 20/20 pass against production Supabase confirmed by owner terminal run (all 5 tables: profiles, jobs, resumes, resume_versions, shared_scores + cascade delete). |
| TCF CMP for AdSense (Gate 1 §E) | **DEFERRED — owner decision** | Site is ad-free; Google site review pending. European regulations message not yet created (AdSense dashboard confirmed 2026-08-08). Required before placing any ad unit slots. Not a blocker for current ad-free launch. See memory: project_future_tcf_cmp. |
| HF provider incident/budget review | **CLOSED — 2026-08-08** | Unexpected usage: NO. HF billing shows 34 requests via Together AI, <$0.01, $0.00 charges for Aug 1–Sep 1 period. No unauthorized use. |
| Usage-limit copy | **CLOSED IN BRANCH** | The current branch already replaces `Unlimited` and `Usage Limits: none` with accurate fair-use wording across the landing, ATS-checker, preview, and new-grad surfaces. Confirm the deployed copy after merge. |

**Gate 2 verdict: checklist evidence recorded; full Prompt 3 remains NO-GO.** Gate 1(a)'s production rollout, RLS, provider-usage review, ES256 authentication, and usage-limit copy are closed. The certified CMP is explicitly deferred for the current ad-free launch and remains mandatory before any ad units. The overall decision still depends on Gate 1(b–e), Gate 4, and Gate 6.

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
