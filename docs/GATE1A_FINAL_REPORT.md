# Gate 1(a) Final Report — Abusive User and Resume-Theft Review

> Completed: 2026-08-10
> Scope: an abusive user attempting to increase AI-provider cost, exhaust shared
> resources, bypass quotas through account rotation, or access another user's
> resume data.
> Final verdict: **PASS — code and production evidence complete.**

## Executive result

The original review found three launch blockers:

1. Production AI quota enforcement had not been proven because a successful AI
   request did not create a daily usage row.
2. Browser-callable quota mutation and inexpensive account rotation could
   consume the global allowance or generate provider traffic.
3. Authenticated users could write directly to Supabase without durable
   per-user row and content-size ceilings.

All three blockers were remediated and proven in production. Cross-user resume
isolation, protected-route authentication, share-link entropy, and proxy-header
handling were also reverified. No paid service or add-on was required.

## Work completed in the repository

### AI spend containment

- Replaced the browser-callable quota mutation with a UUID-bound function that
  is executable only by Supabase `service_role`.
- Made the backend derive the quota identity from the verified access token;
  clients cannot choose another user ID.
- Kept atomic daily ceilings of 10 weighted units per user and 500 weighted
  units globally. Current route weights are one unit for Summary, two for Cover
  Letter, and five for Bullet Rewrite.
- Required quota reservation before any Hugging Face provider request and kept
  provider-not-called-on-denial regression coverage.
- Made production start fail closed if quota enforcement or the backend-only
  Supabase credential is absent.
- Added non-secret health indicators for quota enforcement, backend
  configuration, and deployed release identity.
- Kept the public preview deterministic so unauthenticated preview traffic does
  not create provider cost.

### Account-rotation resistance

- Added Cloudflare Turnstile token handling to email sign-up, password sign-in,
  and password-reset requests.
- Updated the Content Security Policy and environment guidance for Turnstile.
- Kept the Turnstile secret in Supabase rather than exposing it to the browser
  or repository.
- Changed production security-test authentication to service-role-generated
  magic links so CAPTCHA remains enabled during verification.
- Added regression coverage for raw and client-shaped Supabase responses and
  for every CAPTCHA-safe production test sign-in call.

### Supabase storage containment

Migration 008 added validated database constraints and serialized count
triggers. Direct PostgREST writes are now subject to these ceilings:

- 200 jobs per user;
- 50 resumes per user;
- 500 resume versions per user;
- 100 versions per resume;
- 100 shared scores per user;
- shared-score expiry no later than 31 days;
- bounded profile, job, resume-version, and shared-score content.

The profile constraint was corrected to support the production integer type for
`years_experience` while enforcing the UI-supported range of 0 through 50.

### Resume-theft defenses

- Reverified Row Level Security across profiles, jobs, resumes, resume versions,
  shared scores, and account-deletion cascades.
- Server actions retain authenticated `user_id` filtering in addition to RLS.
- Public score links use full UUID v4 entropy and support owner revocation.
- The public shared-score function returns only the intended score disclosure;
  it does not return `user_id`, contact information, or raw resume text.
- All seven protected backend routes reject anonymous requests.
- Strict Supabase JWT issuer and audience validation remains deployed.
- Forged Cloudflare identity headers were rejected, and rotating untrusted
  `X-Forwarded-For` values did not create independent rate-limit buckets in the
  controlled production probe.

### Verification automation

- Expanded the protected production workflow to run 20 RLS tests and five abuse
  tests.
- Ensured fixtures are created successfully before assertions and deleted in
  unconditional cleanup paths.
- Added coverage for oversized content, far-future share expiry, browser quota
  mutation denial, the 50-resume ceiling, and cross-user isolation.
- Added static schema and authorization contracts so incompatible migrations or
  public quota grants fail CI.

## Production actions completed by the owner

The owner completed the dashboard and real-user steps that cannot be performed
from repository code alone:

1. Created and verified a non-empty Supabase schema backup before migration.
2. Ran the production schema preflight and confirmed the profile column type
   and zero invalid rows.
3. Applied migration 008 and confirmed all six catalog checks returned `true`.
4. Configured Render with quota enforcement and the server-only Supabase
   credential, then redeployed the backend.
5. Created a real production Turnstile widget, configured the Vercel public site
   key, configured the Supabase private secret, and enabled CAPTCHA protection.
6. Verified sign-up, password sign-in, and password-reset flows in production.
7. Added the three protected GitHub environment secrets required by the
   production security workflow.
8. Generated a real AI Summary and confirmed creation of a one-unit daily usage
   row.
9. Set only the throwaway account to the ten-unit ceiling and confirmed the next
   Summary returned HTTP 429 with the fair-use reset message.
10. Deleted the quota-proof account and two stale cascade-test accounts, then
    confirmed zero matching test users remained.

No secret value, personal email address, or test-user identifier is retained in
this report.

## Production evidence

| Control | Result | Evidence |
|---|---|---|
| Migration 008 | **PASS** | Six of six catalog booleans returned `true`; integer profile preflight found zero invalid rows. |
| Render safeguards | **PASS** | `/health` returned status `ok`, release `ead449c1aade`, and both quota safeguards `true`. |
| Real CAPTCHA flows | **PASS** | Sign-up, password sign-in, and password reset succeeded with the production Turnstile widget. |
| Tokenless password auth | **PASS** | Supabase returned HTTP 400 `captcha_failed`. |
| Cross-user isolation | **PASS** | Protected workflow run `31430596989` passed 20/20 RLS tests with zero skips. |
| Abuse controls | **PASS** | The same run passed 5/5 abuse tests with zero skips. |
| Real quota accounting | **PASS** | A real Summary created a current-day ledger row with one unit. |
| Ceiling denial | **PASS** | At ten units, the next Summary returned HTTP 429 and the bounded reset message. |
| Fixture cleanup | **PASS** | Final matching-test-user count was zero. |
| Main CI after closeout | **PASS** | Run `31437751048` passed backend, frontend, security, dependency, startup, and Playwright jobs for `ba93d3c`. |

Protected production workflow:
<https://github.com/LNB-Aveva/unified-resume-builder/actions/runs/31430596989>

Final closeout CI:
<https://github.com/LNB-Aveva/unified-resume-builder/actions/runs/31437751048>

## Pull requests and saved history

- PR #56 / `789bac7`: primary Gate 1(a) quota, CAPTCHA, storage, workflow,
  frontend, and documentation hardening.
- PR #57 / `ead449c`: production-compatible profile constraint correction.
- PR #58 / `df0edb3`: CAPTCHA-safe protected-test authentication.
- PR #59 / `6fc4f71`: cascade verification, fixture cleanup, and regression
  correction.
- PR #60 / `ba93d3c`: production evidence closeout and PASS verdict.

All changes above are merged into and pushed to `main`.

## Residual risks accepted for Gate 1(a)

These risks are not eliminated, but none permits unbounded provider spending or
an unauthenticated cross-user resume read under the verified design:

1. **Distributed human or solver-backed accounts:** CAPTCHA adds friction but
   cannot stop a sufficiently motivated account farm. The global 500-unit daily
   database ceiling bounds provider exposure.
2. **Stolen access tokens:** an issued Supabase access token remains usable until
   expiry after logout. Short token lifetime and browser/XSS defenses remain
   necessary.
3. **Process-local IP limiting:** in-memory IP buckets reset on restart and are
   independent across multiple service instances. Durable database quota
   enforcement remains the cost-control authority.
4. **Intentional share disclosure:** anyone possessing a valid, unexpired share
   link can view the limited score/keyword result. Raw resume text and owner
   identity remain excluded, and the owner can revoke the link.

## Final decision and next scope

**Gate 1(a) is complete end to end from both the repository side and the owner
side. No further Gate 1(a) action is pending.**

This is not an overall launch GO. Gate 1(b) through Gate 1(e), Gate 4, and Gate 6
remain separate Prompt 3 work and must retain NO-GO status until individually
verified.
