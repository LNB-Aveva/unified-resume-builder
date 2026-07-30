# Deployment Guide

## Architecture

```
User --> resumeai.cv (Vercel) --> API (Render free tier)
                  |                        |
                  v                        v
              Supabase               HuggingFace
           (Auth + DB)            (AI Inference)
```

## What happens when you push to main

1. **Frontend (Vercel):** Auto-deploys on every push to `main`. Preview deployments created for PRs.
2. **Backend (Render):** Auto-deploys on every push to `main`. Free tier sleeps after 15 min idle.
3. **CI (GitHub Actions):** Runs on every push — backend tests (291+), frontend lint, frontend build.

## Deploy checklist

Before pushing to main:

- [ ] `Set-Location backend; python -m pip install -r requirements-dev.txt` — development tools match CI
- [ ] `python -m ruff check app/ --config ruff.toml` and `python -m mypy app/ --config-file mypy.ini` — lint and types pass
- [ ] `python -m pytest -x -q` — all tests pass
- [ ] `Set-Location ..\frontend; npm run lint` — 0 errors, 0 warnings
- [ ] `npm run build` — clean build, no type errors
- [ ] No secrets in committed files (`.env`, API keys, etc.)

## Rollback

### Frontend (Vercel)
1. Go to Vercel dashboard > Deployments
2. Find the last good deployment
3. Click "..." > "Promote to Production"
4. Takes effect in ~30 seconds

### Backend (Render)
1. Go to Render dashboard > Events
2. Find the last good deploy
3. Click "Rollback to this deploy"
4. Service restarts in ~60 seconds

### Database (Supabase)
- No automated migrations — schema changes are applied manually via SQL Editor
- Point-in-time recovery available on paid plans
- For free tier: keep `supabase-schema.sql` as the source of truth

## Environment variables

See [ENV_VARS.md](ENV_VARS.md) for the full matrix.

## Cold start

Render free tier sleeps after 15 min of inactivity. First request after sleep takes 30-60 seconds.
Mitigations:
- GitHub Actions keepalive cron pings `/health` every 14 minutes
- Frontend uses `fetchWithRetry` with 3s delay between retries

## Monitoring

- **Errors:** Sentry (when `SENTRY_DSN` is set)
- **Uptime:** UptimeRobot pings `/health`
- **Logs:** JSON-structured access logs with `X-Request-ID` header
- **CI:** GitHub Actions — check status at the repo's Actions tab
