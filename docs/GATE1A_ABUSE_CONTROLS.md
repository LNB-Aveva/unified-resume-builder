# Gate 1(a) Abuse-Control Production Runbook

This runbook closes the production-only evidence for AI spend containment,
account-rotation resistance, and direct Supabase storage abuse. The code and
tests are repository-controlled; the dashboard steps require the launch owner.

Cloudflare Turnstile's Free plan is sufficient. No Vercel, Render, Supabase, or
Cloudflare paid upgrade is required by this runbook.

## Required order

Do not enable Supabase CAPTCHA before the frontend containing the Turnstile
site key is deployed. Do not deploy the backend-only quota code before migration
008 and the Render service-role value are ready: the backend intentionally
refuses to start when a production safeguard is missing.

### 1. Back up Supabase

From the repository root, follow `scripts/backup-supabase.ps1` and retain the
non-empty backup outside Git. Stop if the backup cannot be read.

### 2. Apply migration 008

In Supabase Dashboard → SQL Editor for project `pagdtcttkviglyoeuagy`, paste and
run `supabase/migrations/008_abuse_controls.sql`.

Then run this non-secret verification query:

```sql
select
  to_regprocedure('public.consume_ai_quota(integer)') is null
    as old_client_quota_removed,
  to_regprocedure('public.consume_ai_quota(uuid,integer)') is not null
    as backend_quota_present,
  not has_function_privilege(
    'authenticated',
    'public.consume_ai_quota(uuid,integer)',
    'EXECUTE'
  ) as browser_quota_denied,
  has_function_privilege(
    'service_role',
    'public.consume_ai_quota(uuid,integer)',
    'EXECUTE'
  ) as backend_quota_allowed,
  (
    select count(*) = 4
    from pg_trigger
    where tgname in (
      'enforce_jobs_storage_limit',
      'enforce_resumes_storage_limit',
      'enforce_resume_versions_storage_limit',
      'enforce_shared_scores_storage_limit'
    ) and not tgisinternal
  ) as four_storage_triggers_present,
  (
    select count(*) = 4
    from pg_constraint
    where convalidated
      and conname in (
      'profiles_content_size',
      'jobs_content_size',
      'resume_versions_content_size',
      'shared_scores_content_size'
    )
  ) as four_content_limits_present;
```

All six columns must be `true`. A missing function, grant, trigger, or fully
validated constraint is a launch blocker.

### 3. Configure and deploy Render

In Render → `unified-resume-builder-api` → Environment:

1. Add `SUPABASE_SERVICE_ROLE_KEY` using the server-only service-role value from
   the same Supabase project. Do not paste it into chat, source, screenshots, or
   a command line.
2. Keep `SUPABASE_URL=https://pagdtcttkviglyoeuagy.supabase.co`.
3. Confirm `AI_QUOTA_ENFORCEMENT=true`.
4. Deploy the reviewed revision. `SUPABASE_ANON_KEY` is no longer used by the
   backend and may be removed from Render after the new deployment is healthy.

Verify from PowerShell:

```powershell
$health = Invoke-RestMethod `
  -Uri 'https://unified-resume-builder-api.onrender.com/health' `
  -TimeoutSec 30
$health | ConvertTo-Json -Depth 4

if ($health.status -ne 'ok') { throw 'Backend health is not OK.' }
if ($health.release -eq 'local') { throw 'Render release identity is missing.' }
if (-not $health.safeguards.ai_quota_enforcement) {
  throw 'Production AI quota enforcement is not active.'
}
if (-not $health.safeguards.ai_quota_backend_configured) {
  throw 'Backend quota credential is not configured.'
}
```

### 4. Create the free Turnstile widget

In Cloudflare Dashboard → Turnstile:

1. Create one **Managed** widget named `ResumeAI production auth`.
2. Allow only `resumeai.cv` (and `www.resumeai.cv` only if that hostname is used).
3. Copy the public site key and private secret separately.
4. In Vercel, set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the public site key for
   Production.
5. Redeploy the frontend and confirm `/sign-up`, `/sign-in`, and
   `/forgot-password` show the security check without console/CSP errors.
6. In Supabase Dashboard → Authentication → Bot and Abuse Protection, choose
   Cloudflare Turnstile, enter the private secret, and enable CAPTCHA.

Never put the Turnstile secret in Vercel or the repository. Supabase performs
the server-side token verification.

### 5. Run the protected production verification

After the code is merged to `main`, dispatch the existing protected workflow:

```powershell
gh workflow run production-rls.yml --ref main
gh run list --workflow production-rls.yml --limit 1
```

Approve the `production-rls` environment when prompted. The run must report:

- 20/20 RLS isolation tests passed;
- 5/5 abuse-control tests passed;
- zero skips.

The abuse tests create and delete one throwaway `abuse-controls-*` user, prove
that browser JWTs cannot call quota mutation, reject oversized/far-future
writes, and verify the 50-resume ceiling.

### 6. Prove real quota consumption and denial

Use a throwaway signed-in account on `resumeai.cv`:

1. Generate exactly one AI Summary.
2. In Supabase SQL Editor, replace the placeholder email and run:

```sql
select d.usage_date, u.email, d.units_used
from public.ai_usage_daily d
join auth.users u on u.id = d.user_id
where lower(u.email) = lower('REPLACE_WITH_THROWAWAY_EMAIL')
  and d.usage_date = (now() at time zone 'utc')::date;
```

The row must exist and `units_used` must be at least 1. No row means NO-GO.

3. Set only that throwaway user to the user ceiling:

```sql
update public.ai_usage_daily d
set units_used = 10, updated_at = now()
from auth.users u
where u.id = d.user_id
  and lower(u.email) = lower('REPLACE_WITH_THROWAWAY_EMAIL')
  and d.usage_date = (now() at time zone 'utc')::date;
```

4. Attempt one more Summary. The user must see the daily fair-use message and
   the network response must be HTTP 429. The focused regression suite proves
   the provider function is not called after this denial.
5. Delete the throwaway account when evidence is recorded; the usage row
   cascades with the Auth user.

## Gate closure

Gate 1(a) can move from NO-GO to code-and-production PASS only when:

- the migration query returns six `true` values;
- Render health reports the expected release and both safeguards `true`;
- Turnstile is visible and Supabase CAPTCHA is enabled;
- the protected workflow reports 25 passed and zero skipped;
- one Summary creates a ledger row and the ceiling test returns 429.

## Production closure evidence — 2026-08-10

All closure conditions passed. No paid service or add-on was required.

- **Backup:** a non-empty 20.9 KB production schema backup was retained locally
  outside Git. It contained the seven required public-schema table markers.
- **Migration:** the production preflight confirmed `years_experience` is an
  integer with zero invalid rows. Migration 008 then completed, and all six
  catalog-verification values returned `true`.
- **Render:** `/health` returned status `ok`, release `ead449c1aade`,
  `ai_quota_enforcement: true`, and
  `ai_quota_backend_configured: true`.
- **CAPTCHA:** the real production Turnstile widget passed sign-up, password
  sign-in, and password reset. Supabase CAPTCHA is enabled. A direct password
  authentication request without a CAPTCHA token returned HTTP 400 with
  `captcha_failed`.
- **Production suites:** protected workflow run
  [31430596989](https://github.com/LNB-Aveva/unified-resume-builder/actions/runs/31430596989)
  ran against main SHA `6fc4f71879619c58c248f39a80c63a271a3a5979` and
  passed 20/20 RLS tests plus 5/5 abuse-control tests with zero skips.
- **Real quota behavior:** one Summary from an owner-controlled throwaway
  account created a current-day `ai_usage_daily` row with one unit. After only
  that row was set to the ten-unit ceiling, the next Summary returned HTTP 429
  and displayed: `Daily AI fair-use allowance reached. Your allowance resets
  at 00:00 UTC.`
- **Cleanup:** the owner deleted the quota-proof account and two stale cascade
  fixtures. The final query returned `remaining_gate1a_test_users = 0`.

**Final Gate 1(a) verdict: PASS.** The remaining accepted risks are distributed
human or solver-backed account creation, stolen access tokens remaining usable
until expiry, and process-local IP limits resetting or scaling independently.
The durable database quotas bound provider spend even when those edge controls
are bypassed.
