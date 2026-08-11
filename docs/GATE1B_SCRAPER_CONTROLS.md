# Gate 1(b) — Scraper and Distributed-Automation Controls

## Current verdict

**Code deployed; production remains NO-GO until database rollout and proof.** The review
found a CAPTCHA-free identity-rotation path through Supabase anonymous sign-in
and a crawler amplification path through a remote Auth lookup on every public
page. Main CI run `31451072246` passed and the frontend/backend release
`6ab30a98d53e` contains the first remediation tranche. Migration 009, the
Anonymous Sign-Ins setting, the anonymous-user inventory, the final
anonymous-session/logging release, and the post-migration 26/26 workflow remain
unverified.

## Adversarial inventory

| Surface | What a scraper or botnet attempts | Control after this change | Remaining risk |
|---|---|---|---|
| Public marketing and blog pages | Copy all original content or consume Vercel requests | Static/SSG output, automatic Vercel DDoS mitigation, accurate robots/sitemap metadata, and no per-request Supabase `getUser()` lookup | Public text can be copied. A low-and-slow distributed crawler can consume Hobby-plan request allowance before it resembles a DDoS event. |
| Sitemap | Force unnecessary recrawls by observing a fresh `lastmod` on every request | Blog entries use their checked-in `updatedAt`; static entries no longer claim a fabricated modification time | Honest crawlers may still revisit based on their own policy. |
| Public keyword analysis | Consume backend CPU without an account | 50,000-character schema cap, 30/minute route limit, 1 MB body cap, 60-second timeout, 200/minute process-wide IP limit, and Render's automatic Cloudflare-backed DDoS protection | Distributed clients evade any IP-local threshold and can contend for the single Starter CPU. The route has no provider or database spend. |
| Public rewrite preview | Try to turn an unauthenticated demo into provider spend | Deterministic local transformation, 500-character input cap, 5/minute route limit, and no provider client import | Distributed calls can consume CPU, but not LLM quota or spend. |
| Protected backend routes | Rotate accounts and IPs to invoke paid AI or PDF/CPU work | Signed JWT, permanent-account claim check, per-route IP limits, durable per-user/global AI quota, body limits, and provider-not-called-on-denial tests | Solver-backed permanent account farms can consume the bounded 500-unit daily global allowance and deny service to legitimate users. |
| Supabase anonymous sign-in | Mint throw-away `authenticated` users without the email/OAuth controls, then write rows or invoke AI | Browser creation removed, API rejects `is_anonymous: true`, and migration 009 adds restrictive policies to all retained owner-data tables | Production Anonymous Sign-Ins setting and old anonymous-user count remain unverified. Existing anonymous Auth rows are not automatically cleaned by Supabase. |
| Direct PostgREST writes | Bypass the UI and fill tables | RLS ownership, restrictive permanent-user policy, validated content constraints, and per-user row ceilings | CAPTCHA/identity farms can multiply the per-user ceiling; total database usage must still be monitored. |
| Public shared-score RPC/page | Enumerate or bulk-read other users' resumes | Full UUID v4 IDs, single-row RPC, expiry/revocation, `noindex`, robots disallow, and response omits owner identity and raw resume text | Anyone with a valid link can see the intentionally shared score and keyword summary. Random invalid IDs still cause cheap indexed lookups. |
| Health endpoint | Hammer the rate-limit-exempt route | Constant small JSON response and Render edge protection | It remains intentionally exempt so Render and external uptime checks cannot lock themselves out. |

## Repository remediation

1. `JobTracker` no longer calls `signInAnonymously`; only a non-anonymous
   existing session can use cloud job storage.
2. FastAPI rejects a valid Supabase JWT carrying `is_anonymous: true` with HTTP
   403 before route logic, quota reservation, database work, or provider work.
3. Migration 009 adds `AS RESTRICTIVE FOR ALL TO authenticated` policies for
   `profiles`, `jobs`, `resumes`, `resume_versions`, `shared_scores`, and
   `ai_usage_daily`. These policies are combined with the existing owner RLS
   policies and cannot be bypassed by another permissive policy.
4. The Next.js proxy uses `supabase.auth.getClaims()`. With the production ES256
   signing key, Supabase verifies locally against cached JWKS instead of making
   an Auth-server request for every JWT. Anonymous public requests do not cause
   a user lookup.
5. The sitemap uses real blog update dates and stops marking every static page
   as modified at request time.
6. Auth and protected layouts consistently treat an existing anonymous session
   as signed out, preventing a redirect loop or a misleading half-authorized UI.
7. Backend access logs use the same spoof-resistant client-IP extraction as the
   rate limiter and record Render's `CF-Ray` identifier for incident tracing.
8. Migration 009 exposes a service-role-only catalog verifier; the protected
   workflow calls it as the sixth abuse-control test.

Focused verification on 2026-08-10: 101 tests passed. Full verification passed
550 backend tests with 30 credential-gated skips; Ruff and ESLint passed; and
the Next.js 16 production build compiled and generated all 32 routes.

## Production evidence

Six bounded requests were sent on 2026-08-10. No load or denial-of-service test
was performed; Render expressly prohibits DoS testing.

- `https://resumeai.cv/robots.txt`: HTTP 200; public pages allowed; account,
  resume, score, and tools prefixes disallowed.
- Before rollout, `https://resumeai.cv/sitemap.xml` returned HTTP 200 but every
  entry falsely carried the request timestamp.
- `https://resumeai.cv/blog`: HTTP 200 and `x-vercel-cache: PRERENDER`.
- Render `/health`: HTTP 200 at release `6fc4f7187961`; quota enforcement and
  backend quota configuration both `true`; Cloudflare supplied `CF-Ray`.
- Public preview: HTTP 200 with the deterministic transformation.
- Protected compliance route without a token: HTTP 401.

After the concurrent main push, CI run `31451072246` passed on head
`6ab30a98d53e`. Render `/health` reported that release with both safeguards
`true`. Production `sitemap.xml` then exposed only the real blog dates
`2026-07-04` and `2026-07-30`; localhost homepage, blog, sign-in, sitemap, and
backend health all returned 200. The database proof below is still mandatory.

## Required rollout and proof

Do not mark Gate 1(b) PASS until every item below is retained as evidence.

### 1. Back up and inspect anonymous users

In Supabase SQL Editor, run this read-only inventory before migration:

```sql
select
  count(*) filter (where is_anonymous is true) as anonymous_users,
  min(created_at) filter (where is_anonymous is true) as oldest_anonymous_user,
  max(created_at) filter (where is_anonymous is true) as newest_anonymous_user
from auth.users;
```

If the count is nonzero, inspect associated rows before deleting anything. The
product no longer needs anonymous accounts, but deletion is destructive and is
not part of migration 009. Take the same production backup used for schema
rollouts before any cleanup.

### 2. Disable anonymous sign-ins

In Supabase Dashboard, open Authentication settings and turn **Anonymous Sign-Ins**
off. Record the disabled status and date. CAPTCHA remains enabled for email
sign-up, password sign-in, and password reset.

### 3. Apply migration 009

Copy `supabase/migrations/009_reject_anonymous_automation.sql` into Supabase SQL
Editor and run it. Then verify the catalog:

```sql
select
  tablename,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and policyname = 'Permanent users only'
order by tablename;
```

Expected: exactly six rows; every row is `RESTRICTIVE`, applies to
`{authenticated}`, uses command `ALL`, and checks `is_anonymous`.

The migration also creates `verify_gate1b_automation_controls()`, revokes it
from browser roles, and grants it only to `service_role`. The protected
production workflow requires all five returned catalog checks to pass.

### 4. Prove the restrictive policy without retaining data

Run this in SQL Editor. The `insert` must fail with a row-level-security error.
Then run `rollback;` in the same editor session. If no permanent Auth user
exists, create a throw-away permanent test user through the real CAPTCHA flow
first and delete it after all proof is complete.

```sql
begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select id from auth.users where is_anonymous is not true limit 1),
    'role', 'authenticated',
    'is_anonymous', true
  )::text,
  true
);

set local role authenticated;

insert into public.jobs (user_id, company, title)
values (auth.uid(), 'Gate 1b rollback-only probe', 'Must be rejected');

rollback;
```

If the rejected statement aborts the transaction, issue `rollback;` as a
separate statement. Confirm no company named `Gate 1b rollback-only probe`
exists afterward.

### 5. Recheck the deployed release

The backend permanent-account check and frontend proxy/job/sitemap changes are
live at release `6ab30a98d53e`. Preserve these checks after migration 009:

- Render `/health` reports the new release and both quota safeguards `true`.
- `sitemap.xml` contains real 2026-07-04/2026-07-30 blog dates and no current
  request timestamp on static URLs.
- Homepage, blog, sign-in, sign-up, forgot-password, tools, and job tracker work.
- A permanent signed-in account can load/save a job and use one protected
  deterministic tool.
- The protected production RLS/abuse workflow passes 26/26 with zero skips:
  20 RLS tests and 6 abuse-control tests, including the migration 009 catalog
  proof.
- Anonymous-user inventory and any approved cleanup result are recorded.

## Incident response for a live scraper

1. Compare Vercel Firewall traffic, Render HTTP request rate/CPU, Supabase Auth
   and database growth, AI global quota, and provider usage.
2. If Vercel traffic is hostile, enable the free Attack Challenge Mode. Expect
   legitimate humans and search crawlers to be challenged until it is disabled.
3. Block identified source IPs or add a narrowly scoped Vercel custom rule. Do
   not block `robots.txt`, `sitemap.xml`, or uptime endpoints reflexively.
4. If Render CPU rises, identify the targeted route from structured access logs
   and temporarily reduce that route's application limit. Do not perform a DoS
   reproduction against production.
5. If AI global usage rises without matching legitimate activity, the durable
   500-unit ceiling remains the final spend boundary; disable the provider key
   or AI routes if the abuse persists.

## Accepted residual risks after proof

- `robots.txt` is advisory and public content cannot be made both indexable and
  impossible to copy.
- Vercel and Render automatically mitigate recognized DDoS traffic, but
  legitimate-looking distributed scraping can be served before detection.
- The backend's per-IP counters are process-local and reset on deploy/restart.
  Horizontal scaling would require a shared rate-limit store before adding
  instances.
- Solver-backed permanent account farms can cause availability denial up to the
  global quota, but cannot exceed the configured daily provider ceiling.
- Random public share-ID probes still reach an indexed database lookup; they do
  not reveal owner identity or resume text.

Official platform references:

- Supabase anonymous users and abuse prevention: <https://supabase.com/docs/guides/auth/auth-anonymous>
- Supabase cached JWT claim verification: <https://supabase.com/docs/reference/javascript/auth-getclaims>
- Vercel DDoS mitigation and Attack Challenge Mode: <https://vercel.com/docs/vercel-firewall/ddos-mitigation>
- Render automatic DDoS protection: <https://render.com/docs/ddos-protection>
- Render penetration-testing limits: <https://render.com/docs/penetration-testing>
