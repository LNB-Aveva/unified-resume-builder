# Deployment Guide

## Architecture

```
User --> resumeai.cv (Vercel) --> API (Render Starter)
  |                |                    |
  |                v                    v
  |          Supabase Auth       Global IP limiter
  |          (issues JWT)          (200/minute)
  |                                     |
  +---- Bearer JWT ---------------------v
                                  Per-route slowapi
                                        |
                              +---------+---------+
                              |                   |
                       JWT require_auth     Public handlers
                              |                   |
                              +---------+---------+
                                        |
                              Hugging Face / PDF / NLP

Supabase PostgreSQL <--- RLS-scoped frontend data access
```

## What happens when you push to main

1. **Frontend (Vercel):** Auto-deploys on every push to `main`. Preview deployments created for PRs.
2. **Backend (Render):** Auto-deploys on every push to `main`. Blueprint pins the approved Starter instance so it remains always on.
3. **CI (GitHub Actions):** Runs on every push — backend tests (492+, with 20 credential-dependent RLS tests skipped), frontend lint, frontend build.

## Deploy checklist

Before pushing to main:

- [ ] `Set-Location backend; python -m pip install -r requirements-dev.txt` — development tools match CI
- [ ] `python -m ruff check app/ --config ruff.toml` and `python -m mypy app/ --config-file mypy.ini` — lint and types pass
- [ ] `python -m pytest -x -q` — all tests pass
- [ ] `Set-Location ..\frontend; npm run lint` — 0 errors, 0 warnings
- [ ] `npm run build` — clean build, no type errors
- [ ] No secrets in committed files (`.env`, API keys, etc.)
- [ ] Verify `SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and the legacy-fallback `SUPABASE_JWT_SECRET` are set in Render

### Gate 1 quota rollout order

The quota-enabled backend fails closed in production if its quota database configuration is missing. Deploy in this order:

1. Run `scripts/backup-supabase.ps1` and confirm a non-empty backup file.
2. Apply migrations through `008_abuse_controls.sql` in the Supabase SQL Editor.
3. Add the server-only `SUPABASE_SERVICE_ROLE_KEY` in Render. Never expose it to browser code or logs.
4. Configure and deploy the free Turnstile site key before enabling its secret in Supabase Auth.
5. Synchronize the Render Blueprint and confirm the service plan is **Starter** and `AI_QUOTA_ENFORCEMENT=true`.
6. Deploy, require `/health` to identify the release and report both quota safeguards `true`, then prove allowed and denied AI requests.
7. Dispatch the protected production workflow and retain its 20/20 RLS plus 6/6 abuse-control result.

Follow `docs/GATE1A_ABUSE_CONTROLS.md` for the exact safe order and verification commands.

## Rollback

### Frontend (Vercel)
Use the exact CLI/dashboard procedure and smoke checks in `docs/ROLLBACK.md`. The owner successfully rehearsed Vercel rollback and re-promotion on 2026-08-03.

### Backend (Render)
Use the exact deploy-ID discovery, rollback API request, health polling, authenticated smoke check and cleanup procedure in `docs/ROLLBACK.md`. The procedure is agent-verified, but an owner-executed Render rollback-and-return rehearsal is still pending and must not be represented as complete.

### Database (Supabase)
- No automated migrations — schema changes are applied manually via SQL Editor
- The production Free plan has no included automatic project backups or point-in-time recovery
- Keep `supabase-schema.sql` and the ordered migrations as schema sources of truth
- Supabase schema/data changes are not recoverable through a Vercel or Render rollback. Back up affected data, verify the dump/manifest, and record reverse SQL before applying production DDL.
- Manual backup creation is proven; a restore into a safe non-production target is not yet evidenced. Do not claim recoverability until that rehearsal passes.

## Environment variables

See [ENV_VARS.md](ENV_VARS.md) for the full matrix.

The backend requires `SUPABASE_JWT_SECRET` in production so protected routes can
verify Supabase access tokens. Set it as a secret in the Render dashboard; do not
expose it through a `NEXT_PUBLIC_` variable or commit it to an environment file.

## Database tables

All seven application tables have Row Level Security (RLS) enabled:

| Table | Purpose | RLS summary |
|---|---|---|
| `profiles` | Stores one user profile per Supabase account. | Users can select, insert, update, and delete only the row whose ID matches `auth.uid()`. |
| `jobs` | Stores each user's tracked job applications and optional resume association. | Users can select, insert, update, and delete only their own rows. |
| `shared_scores` | Stores expiring, shareable ATS score snapshots. | Owners can insert/select/delete their rows; public reads use a single-row SECURITY DEFINER RPC that omits `user_id`. |
| `resumes` | Stores named, current resume documents. | Users can select, insert, update, and delete only their own resumes. |
| `resume_versions` | Stores immutable historical snapshots linked to a resume. | A user can read, insert, and delete versions only through a resume they own; no update policy is granted. |
| `ai_usage_daily` | Stores per-user weighted AI units by UTC day. | Direct client access is denied; only the authenticated quota RPC can consume units. |
| `ai_global_usage_daily` | Stores global weighted AI units by UTC day. | Direct client access is denied; only the authenticated quota RPC can consume units. |

RLS is the database boundary for direct Supabase access. Application code should
still scope every query to the authenticated user and must never ship a service-role
key to the browser.

## Authentication

Supabase authenticates the user and issues an access token. The frontend sends that
token in the `Authorization: Bearer <token>` header. On protected backend routes,
FastAPI's `require_auth` verifies current ES256/RS256 tokens against the configured
project's JWKS with exact issuer and `authenticated` audience checks. HS256 through
`SUPABASE_JWT_SECRET` remains only as a legacy migration fallback. Missing, expired,
malformed, or incorrectly signed tokens return 401; missing verification
configuration returns 503.

| Access | Routes |
|---|---|
| Protected (7) | `POST /api/v1/score`, `/gap`, `/compliance`, `/rewrite`, `/summary`, `/cover-letter`, `/export/pdf` |
| Public (2) | `POST /api/v1/analyze`, `/preview-rewrite` |

The root and `/health` operational GET endpoints are also public; the 7-versus-2
count above refers to the nine application tool routes.

## Rate limiting

Two in-memory layers protect the API:

- Per-route slowapi limits: `analyze`, `score`, `gap`, and `compliance` are 30/minute;
  `export/pdf` is 15/minute; `rewrite`, `summary`, and `cover-letter` are 10/minute;
  `preview-rewrite` is 5/minute.
- A global per-IP sliding window allows 200 requests per 60 seconds across routes.
  It returns HTTP 429 with `Retry-After` when full. `/health` is exempt so uptime
  monitoring remains meaningful.

Both limiters are process-local. Revisit the design before running multiple backend
workers or instances, where a shared edge or Redis-backed limiter would be required
for a deployment-wide ceiling.

## Pre-commit hook

Enable the repository hook once per clone:

```powershell
git config core.hooksPath .githooks
```

`.githooks/pre-commit` automatically runs backend Ruff and frontend ESLint before
every commit. A lint failure rejects the commit; fix the errors and retry rather than
bypassing the hook.

## Staging environment

Staging isolates changes from production so deploys can be validated before going live.

### Frontend staging (Vercel preview deployments)

Every PR automatically gets a Vercel preview deployment. Configure Preview-scoped
env vars in Vercel dashboard (Project Settings → Environment Variables → Preview):

| Variable | Preview value |
|---|---|
| `NEXT_PUBLIC_SENTRY_ENV` | `staging` |
| `NEXT_PUBLIC_SITE_URL` | (leave empty — Vercel uses the preview URL) |

All other `NEXT_PUBLIC_*` variables inherit from Production unless overridden.
Preview deployments show a yellow "STAGING ENVIRONMENT" banner at the top.

### Backend staging (no additional-spend constraint)

The approved $7/month budget is allocated to the production Render Starter service.
A separate always-on staging backend requires additional spend that is not approved:

- Use local backend (`uvicorn app.main:app --reload`) as the staging backend
- Preview deployments that need a live backend must use the production API URL
- Never test destructive operations (account deletion, schema changes) against
  production — use local backend + local Supabase for those

### Staging Supabase

Supabase free tier allows 2 active projects. When ready:

1. Create a second project (e.g. `resumeai-staging`)
2. Apply migrations from `supabase/migrations/`
3. Set the staging project's URL and anon key as Preview env vars in Vercel
4. Set the staging JWT secret in the staging Render service (when created)

## Branch protection

GitHub branch protection prevents broken code from reaching `main`. Set up once:

```powershell
# Via GitHub web UI: Settings → Branches → Add rule for "main"
# Or via gh CLI (requires admin access):
gh api repos/LNB-Aveva/unified-resume-builder/branches/main/protection `
  --method PUT `
  --field required_status_checks='{"strict":true,"checks":[{"context":"Backend (Python)"},{"context":"Frontend (Next.js)"},{"context":"E2E (Playwright)"}]}' `
  --field enforce_admins=false `
  --field required_pull_request_reviews=null `
  --field restrictions=null
```

This requires all three CI jobs to pass before any merge to `main`. Direct pushes
still work (solo developer workflow) but CI runs on every push and flags failures.

## Cold start

Render Starter remains active between requests. If the dashboard shows Free, synchronize the Blueprint and confirm `render.yaml` still declares `plan: starter`.
Mitigations:
- GitHub Actions keepalive cron pings `/health` every 13 minutes
- Frontend uses `fetchWithRetry` with 3s delay between retries

## Monitoring

- **Backend errors:** Sentry via `SENTRY_DSN` in Render (PII-stripped: no request bodies, auth headers, or stack locals)
- **Frontend errors:** Sentry via `NEXT_PUBLIC_SENTRY_DSN` in Vercel (PII-stripped: same policy as backend)
- **Uptime:** UptimeRobot pings `/health`
- **Logs:** JSON-structured access logs with `X-Request-ID` header
- **CI:** GitHub Actions — check status at the repo's Actions tab
