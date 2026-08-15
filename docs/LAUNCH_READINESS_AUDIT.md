# Launch Readiness Audit — Current Main Rerun

> Audit date: 2026-08-11
> Audited base: `6fc4f71` on `main`
> Branch: `docs/gate1a-production-closeout`
> Reconciled: 2026-08-14 against current provider guidance, owner evidence, and the Gate 2/5 closeouts
> Rule: every `UNVERIFIED` launch gate is a `NO-GO` until it is proven.

## Current verdict

**NO-GO under the strict no-unverified rule.** The 2026-08-11 conditional verdict is historical. Gate 1(c) and the four `LEGAL_*` values remain production-proven, but current clearance is dependency-gated on the owner's Vercel plan decision, Gate 1(d) evidence/acceptance, and Gate 5 Render/database-recovery proof. Gate 5 has no remaining agent-side implementation or documentation item after the 2026-08-14 reconciliation; its remaining work is owner-controlled execution evidence.

Cost model verdict: Gate 3 is current and complete from the repository-review side. The recurring baseline is $7/mo only if Vercel confirms that this deployment qualifies for Hobby; otherwise the commercial baseline is $27/mo with Vercel Pro. Under the documented 10% AI-adoption assumption, 1,000 monthly users fit inside Hugging Face's $0.10 monthly credit, while 10,000 users need about $0.43 of purchased inference credits after that credit. The first modeled capacity cliff remains Supabase's 500 MB database. The row-only upper bound is approximately 9,600 users at ~52 KB/user, but Supabase's documented 40–60 MB base occupancy lowers a new project's modeled additional-user range to roughly 8,500–8,800 before indexes and current production data.

| Gate | Owner | Status |
|---|---|---|
| 1(a). Abusive user — spend amplification and resume theft | Claude + Copilot | **PASS** — production-proven 2026-08-10 |
| 1(b). Scraper and distributed automation | Claude + Copilot | **PASS** — production-proven 2026-08-11 |
| 1(c). Confused non-technical user | Claude + Copilot | **PASS** — production onboarding proof + 557 backend and 56/56 E2E tests |
| 1(d). Regulator reviewing resume-data handling | Copilot | **FAIL / NO-GO** — code complete; owner legal decisions required |
| 1(e). AdSense policy reviewer | Claude | **PASS for ad-free launch** — blocked before ad units only by TCF CMP |
| 2. Evidence-backed go/no-go checklist | Claude | **AGENT REVIEW COMPLETE — OWNER PLAN DECISION PENDING** |
| 3. 100 / 1,000 / 10,000-user cost model | Claude | **AGENT/REPOSITORY COMPLETE** — current Hobby/Pro branches, routed-AI token cost and database-capacity formula modeled |
| 4. Failure drills | Claude | **PASS** — 1 blocker fixed; non-English gap → post-launch backlog |
| 5. Independent rollback verification | Claude | **AGENT COMPLETE / OWNER PARTIAL** — Vercel rehearsed; Render and database recovery evidence pending |
| 6. Final verdict and top three accepted risks | Claude | **AGENT/REPOSITORY COMPLETE — OVERALL NO-GO** pending owner-controlled Gate 1(d), Vercel-plan and recovery evidence |

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
| Anonymous Supabase identities bypassed the permanent-account abuse boundary. | **Pass in production** | Release `2ffc8f91b4d1` removes browser creation, rejects anonymous JWTs with HTTP 403, and treats old anonymous sessions as signed out. Anonymous Sign-Ins is disabled; migration 009 proved six restrictive policies; the rollback-only anonymous insert failed with RLS error `42501`; and run `31532154382` passed 26/26 with zero skips. A verified logical/CSV backup preceded deletion of 131 empty anonymous users. One data-bearing user with three jobs is quarantined until 2026-09-10. | Delete the retained account and three jobs on 2026-09-10 unless ownership is resolved sooner; preserve the controls and protected workflow. |
| Public crawling amplified into a remote Supabase Auth lookup on every page. | **Pass in deployed code** | The proxy called `getUser()` for public static and SSG routes. Supabase documents that `getUser()` always contacts Auth; `getClaims()` verifies production ES256 tokens locally against cached JWKS. Release `2ffc8f91b4d1` uses `getClaims()`; main CI passed and public/auth localhost routes returned 200. | Preserve the cached-claims contract and smoke-test auth refresh after related dependency changes. |
| Sitemap timestamps falsely claimed every page changed on every request. | **Pass in production** | Bounded pre-change evidence showed the current request timestamp on every sitemap entry. The deployed sitemap uses checked-in article dates and omits fabricated static-page dates; production now exposes only `2026-07-04` and `2026-07-30`. | Keep article `updatedAt` accurate when content materially changes. |
| Robots directives do not stop an abusive scraper. | **Accepted residual after proof** | Protected/share routes are disallowed and score pages are `noindex`, but `robots.txt` is advisory. Public content must remain indexable. Vercel and Render provide automatic DDoS mitigation; Render is visibly behind Cloudflare (`CF-Ray` captured), and the app adds body, timeout, route, and global IP limits. | Retain the incident procedure in `docs/GATE1B_SCRAPER_CONTROLS.md`; use Vercel Attack Challenge Mode during an active attack. Process-local limits remain a documented scaling constraint. |
| Public AI preview was a direct cost surface. | **Pass** | `/api/v1/preview-rewrite` is deterministic, has a 500-character body field and 5/minute route limit, and imports no provider client. A bounded production request returned the local transformation. | Preserve the no-provider regression test. |
| Bulk cross-user Supabase reads are blocked. | **Pass with intentional public share lookup** | Post-migration production run `31532154382` passed 20/20 RLS and 6/6 abuse-control tests with zero skips. `shared_scores` has owner-only SELECT and a single-row SECURITY DEFINER RPC that omits `user_id` and resume text; full UUID share IDs are not feasibly enumerable. | Preserve the 26-test production verification and never widen the public RPC output. |

**Gate 1(b) verdict: PASS in code and production on 2026-08-11.** The detailed
attack inventory, remediation, backup and cleanup evidence, rollout SQL,
production proof, incident procedure, and residual-risk boundary are in
`docs/GATE1B_SCRAPER_CONTROLS.md`.

### C. Confused non-technical user

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| The site contradicted itself about usage limits. | **Resolved in code** | Landing, ATS-checker, preview, and new-grad copy now consistently state fair-use access; `Unlimited`, `no limits`, and the unlimited-rewrite error were removed from current product UI. | Recheck production copy after deployment. |
| Scope limitations are substantially clearer than in the closed audit. | Pass | Public copy states English-language and taxonomy limitations, says scoring is directional, and explains that pasted-text checks cannot inspect PDF/DOCX layout. Non-English detection now returns a warning. | Verify the actual deployed signed-in flow in Gate 4. |
| Signed-in AI Summary works through the deployed production stack. | Pass | The owner generated a 61-word summary on production with a real Supabase session and Hugging Face response. | Preserve as a release smoke test. |
| Terms/age acceptance could be repeated or bypassed through the legacy Skip path. | **Pass** | Account setup now renders acceptance only when metadata is missing, renders Skip only after acceptance, rejects unchecked required acceptance in the server action, and redirects ineligible protected-route users back to setup. The combined account/eligibility contract passes 5/5. | Preserve the eligibility contract test. |
| Steps 1–3 required users to re-paste the same job description and resume. | **Pass** | An in-memory working set now synchronizes the full-length inputs across Keyword Extraction, Gap Analysis, and Compliance Checker, prefills a deliberately loaded saved resume, shows live state, and clears both fields on request. It does not use browser storage. The flow passes in the full 56/56 desktop/mobile E2E suite, and the owner retained the deployed working-set surface. | Preserve the synchronization-and-clear E2E regression. |
| Continue to Tools redirected back to account setup after eligibility was saved. | **Pass in production** | The setup page used the current Auth user, but the proxy read older `user_metadata` embedded in the signed access token. The setup action now explicitly refreshes the session before redirecting. As a fallback for Continue, Skip, or direct navigation during the stale-token window, the proxy fetches the current user only when an authenticated protected/auth request has missing eligibility claims, then refreshes the token cookie when current eligibility is confirmed; anonymous public requests remain claim-only. On 2026-08-11 the owner completed account setup and retained a signed-in production screenshot at `resumeai.cv/tools`. | Preserve the account/scraper contracts and production onboarding smoke. |

**Gate 1(c) verdict: PASS.** All known
repository-side blockers and the previously deferred F1–F3 friction items are
closed, including the stale-claim redirect loop found during localhost review.
Final verification is Ruff clean, 557 backend tests passed with 30
credential-gated skips, ESLint clean, a successful 32-route production build,
and 56/56 desktop/mobile Playwright tests.
The owner then confirmed the corrected onboarding flow landed on the signed-in
production `/tools` page. No Gate 1(c) action remains.

### D. Regulator reviewing resume-data handling

| Finding | Severity | Evidence | Required closure |
|---|---|---|---|
| Public notice and eligibility controls now match the code. | **Production-proven / legal review required** | Privacy/Terms enumerate actual categories, purposes/bases, processors, transfers, sharing, retention, rights and deletion lag. The four owner-supplied legal values are deployed; both pages returned 200 and rendered the controller identity, United States, a non-placeholder address, and minimum age 16. Email and OAuth eligibility acceptance is recorded and route-enforced. | Obtain qualified policy/legal-basis review, including the publishable address and chosen minimum age. |
| The AI and telemetry paths are now deterministic and content-reduced. | **Code complete / contracts and historical review required** | AI is pinned to Together rather than `:fastest`; Sentry receives an allowlisted generic error envelope with traces disabled; provider response bodies cannot enter exceptions; adversarial tests pass. | Owner obtains HF/Together/Vercel contract and transfer proof, resolves content restrictions, and inspects/purges historical Sentry events. |
| Export, deletion, rights and privacy-incident operations are implemented/documented. | **Code complete / live drills required** | Export includes auth metadata/identities, quota and browser data; successful deletion clears product browser keys; copy discloses vendor/log/backup lag. DSAR, ROPA, DPIA and 72-hour incident procedures now exist. | Run and retain one signed-in rights/deletion drill and one breach tabletop; fill vendor retention/region/transfer evidence and approve the DPIA. |
| Data isolation and scheduled cleanup are effective narrow controls. | **PASS with residual risk** | Production evidence passed 20/20 RLS checks plus six abuse controls. Cleanup workflow run `31534423206` succeeded on 2026-08-11; public shares omit raw resume text. | Preserve regression and production evidence; alert on cleanup failure and prove expired-row absence periodically. |
| Owner-controlled privacy evidence is still missing. | **BLOCKER for EEA/UK; otherwise UNVERIFIED** | Controller establishment, US-focused scope and public legal values are proven. Applicable processor contracts/plans, account-specific regions/retention/transfers, legal review, historical Sentry inspection, live account drill and incident tabletop remain outside repository proof. | Complete `docs/GATE1D_OWNER_ACTIONS.md`; every applicable UNVERIFIED item remains no-go. |

**Gate 1(d) verdict: repository remediation complete; overall FAIL / NO-GO until
owner evidence closes.** The full initial findings, remediation table, field-level
inventory, and owner checklist are in `docs/GATE1D_DATA_HANDLING.md` and
`docs/GATE1D_OWNER_ACTIONS.md`.

### E. AdSense policy reviewer

Full adversarial review completed 2026-08-11 against the actual deployed code. The initial entry in this section was based on a stale read of `layout.tsx`; the real code is materially better and two of the original three findings were already resolved.

#### Consent and script architecture — what the code actually does

- `layout.tsx:136` — `gtag('consent','default',{...denied...,'wait_for_update':500})` runs as a synchronous inline script, first, before any Google network requests. This is correct Consent Mode v2 ordering.
- `CookieConsent.tsx:38-46` — `loadAdSense(adsenseId)` is called only when `preferences.advertising === true`. The adsbygoogle.js script is **never** loaded until the user explicitly enables the Advertising toggle.
- `AdUnit.tsx:25-31` — renders only when `consent.advertising === true` and re-evaluates on the `resumeai:consent-changed` custom event.
- `consent.ts` — v2 structured JSON with separate `analytics` and `advertising` booleans; backward-compatible with legacy "accepted"/"rejected" strings.
- `CookieConsent.tsx` UI — separate checkboxes for Analytics and Advertising, "Reject optional", "Save choices", and "Accept all" buttons.

This architecture is correct and would pass a technical Consent Mode review.

#### Finding table

| Finding | Severity | Evidence | Status |
|---|---|---|---|
| No certified TCF CMP | **BLOCKER before ad units** | Consent system sends correct Consent Mode v2 signals but generates no IAB TC string. Google requires a certified CMP for personalized ads to EEA/UK/CH users (requirement since Jan 2024; see policy reference below). `consent.ts` is a custom v2 format, not TCF. Without a certified CMP, Google either serves non-personalized ads only (50–80% CPM reduction) or disables EEA serving entirely. | Owner action: create European regulations message in AdSense → Privacy & messaging before placing any `<AdUnit>` in JSX. Not a blocker for current ad-free launch. |
| No ad placement/density review | **UNVERIFIED — pending Google site approval** | `AdUnit.tsx` is correctly consent-gated. No slot IDs or live placements exist while Google review is pending. | After Google approval: propose placements on a branch, review desktop/mobile density (max 1 per tool page initially), then production. |
| Privacy policy described old binary consent; now resolved | **Resolved in code — 2026-08-11** | `privacy/page.tsx` previously described "you choose Accept" (singular). Updated to describe granular Analytics/Advertising choice, lazy loading for each, and independent toggles. Date updated to 2026-08-11. | Done. |
| No minimum age in Terms | **Resolved in code — 2026-08-11** | `terms/page.tsx` §3 now leads with "You must be at least 13 years old to use this Service." Date updated to 2026-08-11. | Done. |
| Publisher identity infrastructure | **PASS in production** | `frontend/src/app/lib/legal.ts` reads `LEGAL_CONTROLLER_NAME`, `LEGAL_CONTROLLER_ADDRESS`, `LEGAL_CONTROLLER_COUNTRY`, and `LEGAL_MINIMUM_AGE` and fails closed if any is absent. Owner dashboard evidence showed all four in Production and Preview; the deployed Privacy and Terms pages returned 200 and rendered the configured values on 2026-08-11. | Preserve the fail-closed configuration and recheck both legal pages after changing any value. |
| Blog author attribution | **LOW / accepted** | JSON-LD author is `"@type": "Organization"`, no named bylines. Weakens E-E-A-T. Not a policy violation. | Accept as known weakness. Add byline post-launch. |
| Core review surfaces | **PASS** | Homepage, privacy, terms, robots, ads.txt return 200; six original articles; contact email; sitemap; publisher ID `pub-7869093425931175` in ads.txt with correct DIRECT tag and TAG ID. | Preserve. |
| `Unlimited` marketing copy | **PASS** | All product copy consistently states fair-use limits. Database-backed quota enforces it. | Confirmed. |
| Consent Mode ordering | **PASS** | Inline consent-default script runs first in `<head>` with `wait_for_update:500` before any Google network calls. | Confirmed in actual code. |
| adsbygoogle.js load gating | **PASS** | Script only loaded via `loadAdSense()` after `preferences.advertising === true`. | Confirmed in actual code. |
| AdUnit consent gating | **PASS** | `AdUnit` only renders when `consent.advertising === true`; re-evaluates on `resumeai:consent-changed`. | Confirmed in actual code. |
| Cookie settings accessibility | **PASS** | `CookieSettingsButton` in footer resets `CONSENT_KEY` and reloads. | Confirmed. |

**Gate 1(e) verdict: PASS for ad-free launch. BLOCKED before placing any `<AdUnit>` until the TCF CMP is configured in the AdSense dashboard.** The four `LEGAL_*` values are deployed and production-proven. All other medium findings are resolved in code (granular consent, adsbygoogle.js load-gating, minimum age, comprehensive privacy policy with controller section). The Sentry `beforeSend` type error in `sentryPrivacy.ts` was also fixed in this session (build was broken by mismatched `Event` vs `ErrorEvent` types).

Official policy references:

- Google certified CMP requirement: <https://support.google.com/adsense/answer/13554116>
- Google TCF integration and v2.3 transition: <https://support.google.com/adsense/answer/9804260>
- Consent Mode v2 developer guide: <https://developers.google.com/tag-platform/security/guides/consent>
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

### Closed — Gate 1(b) scraper-control rollout

Gate 1(b) found that Supabase anonymous users could reuse the `authenticated`
role and that public crawls caused a remote Auth lookup. The owner retained a
verified backup, disabled Anonymous Sign-Ins, applied and proved migration 009,
observed the expected rollback-only RLS rejection, passed protected run
`31532154382` 26/26 with zero skips, completed permanent-account UI smoke, and
deleted 131 empty anonymous users. One backed-up data-bearing account with three
jobs remains quarantined for scheduled deletion on 2026-09-10.

### Closed — LEGAL_* env vars deployed and production-proven

The `frontend/src/app/lib/legal.ts` module throws on first render in production if any of these four env vars are absent. On 2026-08-11 the owner supplied dashboard evidence showing all four in Production and Preview:

| Variable | Example value | Notes |
|---|---|---|
| `LEGAL_CONTROLLER_NAME` | `<legal person or entity>` | Legal name of the person or entity that operates resumeai.cv |
| `LEGAL_CONTROLLER_ADDRESS` | `<business or registered postal address>` | Owner/counsel confirms the publishable address |
| `LEGAL_CONTROLLER_COUNTRY` | `<country of establishment>` | Country of establishment |
| `LEGAL_MINIMUM_AGE` | `<owner-approved integer>` | Must be an integer 13–18; used in signup, OAuth onboarding, Privacy and Terms |

The deployed Privacy Policy and Terms both returned 200 and rendered the exact
controller name, United States, a non-placeholder address, and minimum age 16.
The address was verified without printing or copying it into repository
evidence. The fail-closed production behavior remains required.

### Required AdSense dashboard proof

In AdSense → Privacy & messaging, verify that a Google-certified European regulations message using current TCF is published for `resumeai.cv`, and review the US-state regulations message. Record only the message status and publish date; do not share account IDs beyond the already-public publisher ID.

## Pending owner decisions discovered in Gate 1

1. **Accurate usage copy:** resolved in code with fair-use wording.
2. **Durable AI quota architecture:** resolved and production-proven; direct client invocation is removed, quota reservation is backend-only, and a ceiling request returned HTTP 429.
3. **Git-history cleanup:** optional and destructive. Rotation makes the exposed value unusable; do not rewrite history without a separate explicit authorization and collaborator plan.
4. **Anonymous-user cleanup:** inspect the production count and related rows after backup. Deletion is appropriate only after the owner confirms that no retained guest data is needed; migration 009 deliberately does not delete rows.

## Gate 2 — Evidence-backed go/no-go checklist

Rule: every item that is `UNVERIFIED` or `NO-GO` blocks its applicable launch scope. An item blocked specifically before ads does not block the current ad-free launch.

Evidence sources: `backend/tests/`, `docs/LAUNCH_PROGRAM.md`, `docs/DEPLOY.md`, git log, and the baseline evidence section at the top of this document.

| Phase | Exit gate | Status | Evidence |
|---|---|---|---|
| **1 — Build** | Dependencies install cleanly; all 9 routes return 200; frontend build compiles without network fetches. | **PASS** | Geist/Playfair fonts self-hosted; build passes in CI (verified 2026-08-06). No outbound font fetch. |
| **2 — Tests/CI** | CI run green; 80%+ branch coverage; Playwright happy path + failure paths pass; pip-audit and npm audit report 0 High CVEs. | **PASS** | Main CI is green. Protected production run `31430596989` passed 20 RLS and 5 abuse tests with zero skips. Frontend lint/build pass with 32 routes. Dependency audits remain at zero unaccepted High findings. |
| **3 — Security/Privacy** | JWT auth on 7 routes; body cap enforced; Bandit 0 High; CORS strict; prompt injection sanitized; PII stripped from Sentry. | **PASS for Gate 1(a)** | Production ES256 auth, backend-only quota mutation, fail-fast production startup, deterministic preview, storage ceilings, Turnstile/Supabase CAPTCHA, quota accounting, and denial are production-proven. The remaining Gate 1 perspectives are assessed separately. |
| **4 — Auth/RLS** | User A cannot read/mutate user B rows; account deletion cascades all 5 tables; data export covers all retained records. | **PASS** | Protected production run `31430596989` passed all 20 RLS isolation and cascade tests with zero skips on 2026-08-10. |
| **5 — Scoring quality** | 80%+ of 25 labeled pairs within one human grade; zero obvious strong matches score F; report reproducible in CI. | **PASS** | Eval harness: 25/25 pairs pass grade calibration (≤1 grade delta from human reference). Golden-file tests for taxonomy parsing pass. Synonym map covers 65+ groups. |
| **6 — Backend hardening** | HF circuit breaker retries + opens after 5 failures; scheduled health/cleanup check; request timeout 60s; 9 routes load-tested at bounded concurrency. | **PASS** | Circuit breaker, timeouts, and Blueprint `plan: starter` confirmed. Owner confirmed Render Starter plan active 2026-08-11. |
| **7 — Accessibility/Mobile** | WCAG 2.2 AA — no known blockers; Lighthouse accessibility ≥90 on representative pages. | **PASS** | 10/10 pages pass axe-core WCAG 2.2 tags (verified 2026-08-07, Session 123). 6 non-automatable 2.2 AA criteria verified by manual audit. Lighthouse a11y 94 (was 90+ baseline). |
| **8 — SEO/Monetization** | Sitemap/canonical/legal/content surfaces pass; certified ad consent and live placements must be proven before monetization. | **BLOCKED BEFORE ADS** | Public review surfaces and `ads.txt` pass. The custom banner is not certified TCF proof; AdSense Privacy & messaging status remains owner-only and no live placement/density review exists. |
| **9 — Auth/Data security** | Owner-only share writes/reads, non-enumerable public RPC, high-entropy links, revocation, and quota-free preview. | **PASS** | New links retain full UUID v4 entropy and owner revocation. Public preview is deterministic. Post-migration run `31532154382` passed 20/20 RLS plus 6/6 abuse controls with zero skips. |
| **10 — Observability** | Backend/frontend Sentry are PII-safe; uptime and cleanup failures alert; approved fixed spend is monitored. | **PASS** | Content-free Sentry envelopes have adversarial tests. Cleanup run `31534423206` passed. Owner confirmed Render Starter and reviewed Hugging Face usage: 34 Together requests, under $0.01 usage and $0.00 charged, with no unexpected activity. Account-specific privacy evidence remains tracked in Gate 1(d), not this operational gate. |
| **11 — Release engineering** | Ordered idempotent migrations; independent application rollback rehearsed; backup and restore recovery proven; branch protection on `main`. | **PARTIAL — OWNER ACTION** | Nine ordered SQL migrations exist and verified manual backups preceded migrations 008 and 009. The owner rehearsed Vercel rollback, but no retained Render rollback or non-production database-restore rehearsal proves the remaining recovery paths. Branch protection remains proven. |
| **12 — Go/no-go** | Current Prompt 3 strict review has no unverified blocker for the intended launch scope. | **NO-GO — OWNER DECISIONS/EVIDENCE PENDING** | The former quota, Starter, RLS, provider-usage and Gate 4 blockers are closed. Current Vercel dashboard evidence proves Hobby with Fluid Compute, but Vercel restricts Hobby to personal, non-commercial use; the owner must upgrade to Pro or retain written Vercel confirmation that the deployment qualifies. Gate 1(d) and Gate 5 remain separately dependency-gated. The certified CMP remains required only before ads. |

### Gate 2 owner-controlled and scope-triggered items

| Item | Severity | Action |
|---|---|---|
| Gate 1(a) abuse controls | **CLOSED — 2026-08-10** | Migration, Render safeguards, real CAPTCHA flows, tokenless-auth rejection, 25/25 production tests, quota ledger creation, HTTP 429 denial, and fixture cleanup are proven. |
| Render Starter | **CLOSED — 2026-08-11** | Blueprint pinned to `plan: starter`; owner confirmed Starter plan active in dashboard. |
| RLS re-verification | **CLOSED — 2026-08-11** | Post-migration run `31532154382` passed 20/20 RLS plus 6/6 abuse controls with zero skips and no retained test users. |
| Vercel production plan eligibility | **OWNER DECISION — BLOCKS STRICT LAUNCH CLEARANCE** | Production is dashboard-proven on Hobby with Fluid Compute. Vercel's current [Hobby plan](https://vercel.com/docs/plans/hobby) and [fair-use guidance](https://vercel.com/docs/limits/fair-use-guidelines) restrict Hobby to personal, non-commercial use. Before strict launch clearance, the owner must either upgrade the production project/team to Pro and retain plan evidence, or retain written Vercel support confirmation that the current deployment qualifies for Hobby. After evidence arrives, update Gate 2 Phase 12 and refresh Gate 3's fixed-cost baseline. |
| TCF CMP for AdSense (Gate 1 §E) | **DEFERRED — owner decision** | Site is ad-free; Google site review pending. European regulations message not yet created (AdSense dashboard confirmed 2026-08-08). Required before placing any ad unit slots. Not a blocker for current ad-free launch. See memory: project_future_tcf_cmp. |
| HF provider incident/budget review | **CLOSED — 2026-08-08** | Unexpected usage: NO. HF billing shows 34 requests via Together AI, <$0.01, $0.00 charges for Aug 1–Sep 1 period. No unauthorized use. |
| Usage-limit copy | **CLOSED IN PRODUCTION — 2026-08-11** | Read-only production checks returned 200 for the landing, ATS checker, new-grad, tech-job and career-changer pages; each contained fair-use wording and none contained the superseded unlimited/no-limits claims. |

**Gate 2 verdict: agent reconciliation is complete; strict launch clearance remains owner-blocked.** Phases 1–7 and 9–10 retain their recorded PASS evidence. Production RLS/abuse controls, cleanup, provider-usage review, Render Starter, ES256 authentication, migrations, manual backup creation and fair-use copy are proven. Phase 11 is partial because the owner-executed Render rollback and non-production database restore remain unproven; no independently executable Gate 2 implementation or evidence item remains on the agent side. Phase 12 cannot pass until the owner resolves Vercel Hobby eligibility and the separately tracked Gate 1(d)/Gate 5 dependencies are closed. Phase 8 remains intentionally deferred for the ad-free scope; if monetization is later authorized, the owner must first publish a certified CMP, obtain Google site approval, create real ad units and provide their slot IDs. Only then can the agent place `<AdUnit>` instances and verify desktop/mobile density without inventing production identifiers or prematurely enabling ads.

---

## Gate 3 — Cost model

> Reconciled 2026-08-14 from the current [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), [Vercel pricing](https://vercel.com/pricing), [Render pricing](https://render.com/pricing), [Supabase pricing](https://supabase.com/pricing), [Supabase database-size guidance](https://supabase.com/docs/guides/platform/database-size), [Hugging Face routed-inference pricing](https://huggingface.co/docs/inference-providers/pricing), [Together AI pricing](https://www.together.ai/pricing), and [Sentry pricing](https://sentry.io/pricing/). Account-specific plan evidence is separated from public pricing.

### Service tier summary

| Service | Current/decision branch | Monthly cost | Current constraint |
|---|---|---|---|
| Vercel | Hobby now; Pro unless Vercel confirms Hobby eligibility | $0 if confirmed; otherwise $20 | Hobby includes 1,000,000 Function invocations but is restricted to personal, non-commercial use. Pro is $20/mo with $20 of included usage credit. |
| Render | Starter service in a Hobby workspace | $7 | 512 MB RAM, 0.5 CPU, always-on service. |
| Supabase | Free | $0 | 500 MB database, 50,000 MAUs, 1 GB file storage, 5 GB egress, and no included automatic backups or PITR. |
| Hugging Face | Free user, routed to pinned Together model | $0 recurring; purchased credits as used | $0.10 monthly routed-inference credit. Extra usage requires purchased credits and is passed through at provider rates. The pinned Qwen2.5 7B route is currently $0.30 per 1M input tokens and $0.30 per 1M output tokens. |
| Sentry | Business trial; expected Developer after expiry | $0 on Developer | Developer includes 5,000 errors and 5 million spans. Production tracing/replay sampling is disabled, so errors—not spans—are the relevant quota. Owner must confirm the post-trial plan. |
| **Recurring total before AI overage** | **Hobby-confirmed / Pro** | **$7 / $27 per month** | Hobby is not a valid commercial assumption without written Vercel confirmation. |

### Per-user footprint estimates

**Database row size:**
- `profiles`: ~0.5 KB/user
- `resumes` (avg 2 per user, ~8 KB each): ~16 KB/user
- `resume_versions` (avg 3 per resume, ~5 KB each): ~30 KB/user
- `jobs` (avg 5 per user): ~5 KB/user
- `shared_scores` (avg 1 per user): ~0.5 KB/user
- **Total DB per user: ~52 KB**

Theoretical row-only capacity is `500,000 KB / 52 KB ≈ 9,600 users`. Supabase documents approximately 40–60 MB of preoccupied space for a new project, which reduces the rough additional-user capacity to approximately 8,500–8,800 before indexes, WAL effects, extensions, and existing production rows. The operational formula is therefore `(500 MB - current database size) / measured per-user growth`; the owner must use the live Database Reports value rather than treating 9,600 as a safe target.

**Vercel traffic model:**
- First visit: ~350 KB (JS bundle, CDN-cached after first hit per edge node)
- Subsequent visits (cached): ~5 KB (HTML shell only)
- Serverless function invocations: ~3 per authenticated session and 5 sessions/user/month, or ~15 invocations/user/month. This is a planning assumption, not measured billing data.

**HuggingFace tokens per AI operation (estimated):**
| Operation | Input tokens | Output max | Total |
|---|---|---|---|
| Bullet rewrite (single) | ~500 | 250 | ~750 |
| Bullet rewrite (batch) | ~800 | 1,200 | ~2,000 |
| Summary | ~800 | 200 | ~1,000 |
| Cover letter | ~1,000 | 650 | ~1,650 |
| Preview rewrite (public) | ~200 | 150 | ~350 |

Assumed AI-feature adoption: 10% of monthly users complete one modeled AI session. Average session: one single rewrite plus one summary = approximately **1,300 input + 450 output = 1,750 tokens**. At the pinned route's current $0.30/M input and output rate, that is about **$0.000525/session** before the monthly credit. The $0.10 credit therefore covers about **190 modeled sessions**, corresponding to roughly **1,900 monthly users** at 10% adoption. Actual cost varies with prompt/output length, retries and provider price changes.

### Scenario table

| Scenario | DB used | Vercel invocations | Modeled AI sessions / tokens | Gross AI charge | Estimated recurring total, Hobby-confirmed / Pro | First capacity action |
|---|---|---|---|---|---|---|
| **100 users/mo** | ~5 MB (1% of 500 MB) | ~1,500 | ~10 / 17,500 | ~$0.005, covered by credit | **$7 / $27** | None in the modeled quotas. |
| **1,000 users/mo** | ~52 MB (10% of 500 MB) | ~15,000 | ~100 / 175,000 | ~$0.053, covered by credit | **$7 / $27** | None in the modeled quotas. |
| **10,000 users/mo** | ~520 MB of modeled user rows, before base/overhead | ~150,000 | ~1,000 / 1,750,000 | ~$0.525 gross; ~$0.425 after credit | **~$32.43 / ~$52.43**, including Supabase Pro and purchased HF credits | **Supabase Pro is required before this scenario.** |

Vercel plan eligibility is a launch prerequisite across every row, not a usage cliff. If the owner does not purchase HF credits, AI routes can become unavailable after the $0.10 credit is consumed; non-AI product paths remain separately available.

### Prerequisites and cliffs in order

1. **Vercel commercial eligibility — launch prerequisite, not capacity.** Current production evidence proves Hobby, while Vercel restricts Hobby to personal/non-commercial use. The owner must obtain written eligibility confirmation or upgrade to Pro. The cost model contains both branches, so no further calculation is blocked on that choice.

2. **Hugging Face $0.10 monthly credit — feature-availability threshold.** At the stated adoption/length assumptions it covers about 190 AI sessions, or ~1,900 monthly users. Resolution: purchase a deliberately bounded amount of credits and monitor actual routed usage. This replaces the unsupported approximate hourly-rate-limit claim.

3. **Supabase 500 MB database — first modeled storage cliff.** The row-only upper bound is approximately **9,600 users**, while the documented 40–60 MB base occupancy yields roughly **8,500–8,800 additional users** before other overhead. Actual production capacity is lower by the current database size and must be read from Database Reports. Resolution: remove data only under the documented retention policy or upgrade to Supabase Pro ($25/mo, 8 GB database and seven-day automatic backups).

4. **Vercel Hobby invocation allowance — later modeled capacity threshold.** At 15 invocations/user/month, 1,000,000 invocations corresponds to roughly 66,000 monthly users. A commercial deployment should already be on Pro unless Vercel grants an exception, so real Pro usage metrics—not this Hobby ceiling—must guide later scaling.

5. **Sentry/Render are not safely convertible to a user-count cliff.** Sentry's 5,000-error quota can be consumed by one noisy defect even with few users, while Render's 512 MB capacity depends on request mix and concurrency. Keep tracing/replay disabled, retain spike protection and alerts, and use measured load/usage data for upgrades.

### What the baseline budget buys

| Users/mo | Hobby-confirmed branch | Default commercial branch | Required action |
|---|---|---|---|
| 0–1,000 | $7/mo | $27/mo | HF usage remains within the modeled $0.10 credit. |
| 1,000–~1,900 | $7/mo | $27/mo | Monitor actual HF token usage; modeled usage still fits the monthly credit. |
| ~1,900 to the live DB threshold | $7 + purchased HF credits | $27 + purchased HF credits | Set an intentional HF credit budget; monitor actual Supabase database size and measured per-user growth. |
| Above the live DB threshold (raw upper bound ~9,600) | ~$32 + HF usage | ~$52 + HF usage | Upgrade Supabase before the 500 MB ceiling; verify managed backups and restore behavior. |

**Gate 3 verdict: AGENT/REPOSITORY COMPLETE.** Current limits, commercial-plan branches, AI token economics and the database cliff are modeled without inventing an owner plan choice. Remaining actions are owner-controlled plan/spend decisions and later comparison against measured production usage.

---

## Gate 4 — Failure drills

**Owner:** Claude — Session 148, 2026-08-11.

All six scenarios verified from code. One blocker found and fixed.

| Scenario | What the user sees | Verdict |
|---|---|---|
| HuggingFace down | 60 s request timeout fires first → 504 → "The request took too long… try again." After 5 consecutive failures circuit breaker opens → immediate 503 → "AI features are temporarily unavailable… retry in ~1 minute." No stack trace, no infinite spinner. | **PASS** |
| Supabase down | Protected page load → `authUnavailable = true` in proxy.ts → redirect to `/service-unavailable` → "Connection issue — your data is safe." AI tool call → quota check hits `httpx.TransportError` → 503 "AI usage controls are temporarily unavailable." Public keyword extractor (no auth/quota) still works. No stack trace. | **PASS** |
| Render sleeping | Render Starter plan (DEC-030) has no cold sleep. During deploy restart (seconds): `Failed to fetch` → connectionError → "Could not reach the API server. Check your connection, wait a moment, and try again." No spinner that never resolves. | **PASS** |
| Malformed PDF upload | No PDF upload feature exists. Users paste plain text only. Binary garbage pasted into a textarea returns low/empty scores — no error, no stack trace. User expectation gap (PDF upload) is a product scope decision, not a launch blocker. | **PASS (not applicable)** |
| 50-page resume (>50 000 chars) | **Was:** Pydantic 422 with array `detail` → `new Error(array)` → `new Error("[object Object]")` → user saw `[object Object]`. **Fixed (this session):** `extractApiDetail()` helper added to `types.ts`; all 8 components updated. Now extracts `detail[0].msg` → user sees "String should have at most 50000 characters." | **FIXED — PASS** |
| Non-English JD (no spaCy — pure regex) | spaCy is not in this stack. All NLP is regex + English skills taxonomy. Keyword extractor, gap analysis, and compliance checker all call `detect_non_english()` (promoted from `_detect_non_english`). All three now show an amber warning banner for non-English input. Summary generator and cover letter pass text to the AI model; non-English prompts may produce non-English output — acceptable for v1. | **FIXED — PASS** |

### Fixes applied this session

**Fix 1 — `extractApiDetail(body, fallback)`** in `frontend/src/app/types.ts` — extracts a plain string from either a Pydantic array-detail 422 or a string-detail response. Replaces the broken `(body as {detail?: string}).detail ?? fallback` pattern across GapAnalysis, ComplianceChecker, AnalyzerDemo, BulletRewriter, SummaryGenerator, CoverLetterGenerator, ResumeExporter, BulletPreviewWidget.

**Fix 2 — non-English language detection in gap + compliance routes** — `detect_non_english()` promoted to public in `keyword_extractor.py` (private alias kept for tests). `gap.py` and `compliance.py` now call it and set `language_warning` on the response via `model_copy`. `ATSScore` and `ComplianceReport` schemas gain `language_warning: str | None = None`. TypeScript interfaces updated. Amber warning banners added to GapAnalysis and ComplianceChecker.

ESLint clean. Ruff clean. 53 keyword+contract tests pass. 32-route production build passes.

**Gate 4 verdict: PASS** (all six scenarios handled).

---

## Gate 5 — Rollback verification

Application rollback goal: revert frontend and backend **independently** within five minutes of detecting a launch regression, without the rollback itself mutating Supabase data and with minimal user impact. Application rollback does not restore lost or corrupted database data; database recovery is a separate release-engineering proof.

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

**Database recovery boundary — Supabase:**
The production Supabase organization is on Free. Current official plan guidance and owner dashboard evidence confirm that Free includes neither automatic project backups nor point-in-time recovery. The owner created a manual logical `pg_dump` backup on 2026-08-07, and verified backups preceded migrations 008 and 009, but no retained evidence proves a restore into a safe non-production target.

Application rollback cannot recover deleted or corrupted rows. Before production DDL, run `scripts/backup-supabase.ps1`, verify the dump and manifest, and record reverse SQL. If data loss is suspected, preserve evidence and follow `docs/INCIDENT-RESPONSE.md`; do not claim recoverability until the applicable manual backup has passed a non-production restore rehearsal. Provider-managed daily backups require a paid Supabase plan.

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

These are procedure estimates, not retained measurements for every path. The owner completed a Vercel rollback, smoke verification, re-promotion and second verification on 2026-08-03. No retained evidence proves an owner-executed Render rollback or its recovery time.

**Gate 5 verdict: AGENT/REPOSITORY COMPLETE; OWNER EXECUTION PARTIAL.** The independent Vercel and Render procedures, verification steps, failure signals and database boundary are documented in `docs/ROLLBACK.md`. Vercel is owner-rehearsed. End-to-end Gate 5 remains open until the owner performs and records a controlled Render rollback-and-return rehearsal. Database recovery remains a separate open Phase 11 proof until a manual backup is restored successfully in non-production or a suitable managed-backup tier is adopted and tested.

---

## Gate 6 — Final verdict

**Original owner:** Session 149, 2026-08-11. **Current reconciliation:** 2026-08-14.

### Evidence summary

| Gate | Verdict |
|---|---|
| 1(a) Abusive user | PASS — production-proven 2026-08-10 |
| 1(b) Scraper automation | PASS — production-proven 2026-08-11 |
| 1(c) Confused non-technical user | PASS — production onboarding proof retained 2026-08-11 |
| 1(d) Regulator | FAIL / NO-GO pending owner evidence and final review (repository remediation complete) |
| 1(e) AdSense policy reviewer | PASS for ad-free launch |
| 2 Go/no-go checklist | AGENT REVIEW COMPLETE — Vercel plan decision and inherited owner dependencies remain |
| 3 Cost model | AGENT/REPOSITORY COMPLETE — current Vercel branches, HF token pricing and database-capacity formula modeled |
| 4 Failure drills | PASS — 2 blockers fixed (extractApiDetail + non-English warning in gap/compliance) |
| 5 Rollback | AGENT COMPLETE / OWNER PARTIAL — Vercel rehearsed; Render rollback and database recovery proof pending |

### Current verdict: NO-GO — agent/repository reconciliation complete; owner dependencies remain

The 2026-08-11 conditional verdict is superseded. Gate 2, Gate 3, Gate 4, and the repository-controlled portion of Gate 5 are now reconciled. There is no remaining independently executable Gate 6 implementation, research, calculation, runbook, or documentation item. Under the audit's strict rule, launch nevertheless remains NO-GO until the following owner-controlled dependencies are proven.

### Owner-controlled closure dependencies

1. **Vercel plan:** obtain written confirmation that this deployment qualifies for Hobby or upgrade to Pro. The refreshed Gate 3 model already covers both cost branches.
2. **Gate 1(d):** complete every applicable unchecked item in `docs/GATE1D_OWNER_ACTIONS.md`, including remaining retention/provider evidence, live rights/eligibility and consent drills, incident tabletop, DPIA sign-off, and final evidence review. The owner's US-focused/ad-free residual-risk decision and all four production `LEGAL_*` values remain closed evidence; they do not waive the audit's no-unverified rule.
3. **Gate 5/Phase 11:** execute and retain a controlled Render rollback-and-return rehearsal, then restore a verified manual backup into a safe non-production target or adopt and test a suitable managed-backup tier.
4. **Evidence closeout:** after the evidence above exists, the repository reviewer changes the inherited owner-dependent rows to their evidence-supported results and records the final GO/NO-GO. This is a dependency-gated status update, not unfinished agent implementation work.

AdSense/CMP work remains outside the ad-free launch scope. A certified CMP, Google approval, real ad-slot identifiers, and placement/density review become mandatory before any ad unit is enabled.

### Top three residual risks after the blockers close

**Risk 1 — Supabase capacity and recovery limits**
- **What:** The free database becomes read-only above 500 MB. At ~52 KB/user, 9,600 is only the row-only upper bound; documented base occupancy and current production data lower the safe threshold.
- **Consequence:** Writes fail at the capacity ceiling, and the current Free plan has no included automatic project backup or PITR.
- **Mitigation:** Track database size, upgrade before the ceiling, retain verified logical backups, and prove restoration separately from application rollback.

**Risk 2 — Process-local rate limits reset on Render restart**
- **What:** The in-memory sliding-window rate limiter (200 req/60 s global) and the HF circuit breaker reset to zero on any Render process restart — rolling update, crash, or scale event. A brief window during redeploy allows more requests than the steady-state limit.
- **Consequence:** A burst of API traffic arriving precisely during a redeploy could temporarily exceed the intended rate ceiling. The Supabase-backed AI quota (10 units/user/day, 500/day global) still applies and cannot be bypassed by this window, so the blast radius is limited to rate-limit headroom during the seconds of restart.
- **Mitigation:** Supabase-backed quota remains the primary spend guard. Revisit a shared limiter only if the service scales horizontally or traffic shows exploitation around deploys.

**Risk 3 — Routed-AI credit exhaustion and price variability**
- **What:** The free Hugging Face account supplies only $0.10/month of routed-inference credit, and the pinned Together model is usage-priced. Provider prices can change.
- **Consequence:** AI routes can become unavailable after credits are exhausted even when the rest of the application is healthy.
- **Mitigation:** Retain daily Supabase AI quotas, purchase only an owner-approved bounded credit amount, monitor actual token spend, and preserve the existing user-facing failure handling.

The scheduled 2026-09-10 deletion of the quarantined Gate 1(b) account remains a post-launch operational follow-up, not a hidden agent-side Gate 6 task.

**Gate 6 verdict: AGENT/REPOSITORY COMPLETE; OVERALL NO-GO PENDING OWNER-CONTROLLED EVIDENCE.** No commit, deployment, or launch announcement is authorized by this verdict.
