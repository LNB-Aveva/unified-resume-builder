# Environment Variable Matrix

All environment variables used by the application, where to set them, and what breaks without them.

---

## Backend (FastAPI on Render)

Set these in the **Render dashboard** (Settings → Environment) for production.
For local dev, copy `backend/.env.example` to `backend/.env`.

| Variable | Required | Where set | Default | What it controls | What breaks without it |
|----------|----------|-----------|---------|-----------------|----------------------|
| `HUGGINGFACE_API_KEY` | Yes (for AI features) | Render dashboard / `.env` | `""` | Auth for HuggingFace Inference API | `/summary`, `/rewrite`, `/cover-letter`, `/preview-rewrite` return 503 |
| `FRONTEND_URL` | Yes (production) | Render dashboard | `""` | CORS allowed origins (comma-separated) | Frontend requests blocked by CORS in production |
| `PORT` | Auto | Injected by Render | `8000` | Server listen port | N/A — Render always injects this |
| `RENDER` | Auto | Injected by Render | `""` | Detects production (disables /docs, enables HSTS) | Swagger UI stays enabled in production |
| `ENV` | Optional | Render dashboard | `""` | Alternative production detection (`ENV=production`) | Falls back to `RENDER` env var check |
| `PYTHON_VERSION` | Yes | render.yaml | `3.11.0` | Python runtime on Render | Render picks its own default |
| `SENTRY_DSN` | No | Render dashboard / `.env` | `""` | Sentry error tracking DSN | Error tracking disabled (no errors sent to Sentry) |
| `SUPABASE_URL` | Yes (production) | Render dashboard / `.env` | `""` | Supabase project URL used to fetch public ES256/RS256 signing keys | Protected routes using current Supabase tokens return 503 |
| `SUPABASE_JWT_SECRET` | During HS256 migration only | Render dashboard / `.env` | `""` | Legacy HS256 token verification fallback | Legacy HS256 tokens cannot be verified |
| `DEBUG` | No | `.env` | `False` | Debug mode flag | N/A — defaults to off |

## Frontend (Next.js on Vercel)

Set these in **Vercel dashboard** (Project Settings → Environment Variables) for production.
For local dev, copy `frontend/.env.example` to `frontend/.env.local`.

| Variable | Required | Where set | Default | What it controls | What breaks without it |
|----------|----------|-----------|---------|-----------------|----------------------|
| `NEXT_PUBLIC_API_URL` | Yes | Vercel dashboard / `.env.local` | `http://localhost:8000` | Backend API base URL for all fetch calls | All tools fail — requests go to localhost |
| `NEXT_PUBLIC_SITE_URL` | Yes (production) | Vercel dashboard / `.env.local` | `http://localhost:3000` | Canonical URL for SEO, OG tags, auth redirects | Auth callbacks redirect to localhost; SEO canonical wrong |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Vercel dashboard / `.env.local` | — | Supabase project URL | Auth, profile, job tracker all broken |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Vercel dashboard / `.env.local` | — | Supabase anonymous API key | Same as above |
| `NEXT_PUBLIC_GA_ID` | No | Vercel dashboard / `.env.local` | `""` | GA4 measurement ID (consent-gated) | Analytics disabled |
| `NEXT_PUBLIC_ADSENSE_ID` | No | Vercel dashboard / `.env.local` | `""` | AdSense publisher ID `ca-pub-XXX` (consent-gated) | Ads disabled; AdUnit component renders nothing |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Vercel dashboard / `.env.local` | `""` | Sentry DSN for frontend error tracking (PII-safe) | Frontend errors not reported to Sentry |
| `NEXT_PUBLIC_SENTRY_ENV` | No | Vercel dashboard / `.env.local` | `"production"` | Environment tag for Sentry + staging banner | Defaults to "production"; no staging indicator |
| `CRON_SECRET` | Yes (for cleanup) | Vercel dashboard | — | Auth token for `/api/cron/cleanup` endpoint | Expired shared scores never cleaned up |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Vercel dashboard | — | Admin Supabase key for cleanup RPC (falls back to anon key) | Cleanup uses anon key (works if function has PUBLIC execute) |

## Production Values (Secrets Redacted)

| Variable | Production value |
|----------|-----------------|
| `NEXT_PUBLIC_API_URL` | `https://unified-resume-builder-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://resumeai.cv` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pagdtcttkviglyoeuagy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (set in Vercel — public but project-specific) |
| `HUGGINGFACE_API_KEY` | (set in Render — secret) |
| `FRONTEND_URL` | `https://resumeai.cv` |
| `SUPABASE_URL` | `https://pagdtcttkviglyoeuagy.supabase.co` |
| `SUPABASE_JWT_SECRET` | (legacy HS256 fallback in Render; do not expose to the frontend) |
| `CRON_SECRET` | (set in Vercel + GitHub Actions secret — generate with `openssl rand -hex 32`) |
