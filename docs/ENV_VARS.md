# Environment Variable Matrix

All environment variables used by the application, where to set them, and what breaks without them.

---

## Backend (FastAPI on Render)

Set these in the **Render dashboard** (Settings → Environment) for production.
For local dev, copy `backend/.env.example` to `backend/.env`.

| Variable | Required | Where set | Default | What it controls | What breaks without it |
|----------|----------|-----------|---------|-----------------|----------------------|
| `HUGGINGFACE_API_KEY` | Yes (for AI features) | Render dashboard / `.env` | `""` | Auth for HuggingFace Inference API | `/summary`, `/rewrite`, and `/cover-letter` return 503; deterministic preview remains available |
| `FRONTEND_URL` | Yes (production) | Render dashboard | `""` | CORS allowed origins (comma-separated) | Frontend requests blocked by CORS in production |
| `PORT` | Auto | Injected by Render | `8000` | Server listen port | N/A — Render always injects this |
| `RENDER` | Auto | Injected by Render | `""` | Detects production (disables /docs, enables HSTS) | Swagger UI stays enabled in production |
| `ENV` | Optional | Render dashboard | `""` | Alternative production detection (`ENV=production`) | Falls back to `RENDER` env var check |
| `PYTHON_VERSION` | Yes | render.yaml | `3.13.0` | Python runtime on Render | Render picks its own default |
| `SENTRY_DSN` | No | Render dashboard / `.env` | `""` | Sentry error tracking DSN | Error tracking disabled (no errors sent to Sentry) |
| `SUPABASE_URL` | Yes (production) | Render dashboard / `.env` | `""` | Supabase project URL used to fetch public ES256/RS256 signing keys | Protected routes using current Supabase tokens return 503 |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (production) | Render dashboard / `.env` | `""` | Server-only credential for the backend-only atomic AI quota RPC | Production refuses to start; browser clients cannot consume quota directly |
| `SUPABASE_JWT_SECRET` | During HS256 migration only | Render dashboard / `.env` | `""` | Legacy HS256 token verification fallback | Legacy HS256 tokens cannot be verified |
| `AI_QUOTA_ENFORCEMENT` | Yes (production) | render.yaml / `.env` | `true` when `ENV=production`, otherwise `false` | Enables durable daily user/global AI units | Local dev bypasses the quota unless explicitly enabled; production fails closed |
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
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes (production auth abuse control) | Vercel dashboard / `.env.local` | `""` | Renders the free Cloudflare Turnstile check on email auth forms | CAPTCHA is absent; do not enable Supabase CAPTCHA until this is deployed |
| `NEXT_PUBLIC_GA_ID` | No | Vercel dashboard / `.env.local` | `""` | GA4 measurement ID (consent-gated) | Analytics disabled |
| `NEXT_PUBLIC_ADSENSE_ID` | No | Vercel dashboard / `.env.local` | `""` | AdSense publisher ID `ca-pub-XXX` (consent-gated) | Ads disabled; AdUnit component renders nothing |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Vercel dashboard / `.env.local` | `""` | Sentry DSN for frontend error tracking (PII-safe) | Frontend errors not reported to Sentry |
| `NEXT_PUBLIC_SENTRY_ENV` | No | Vercel dashboard / `.env.local` | `"production"` | Environment tag for Sentry + staging banner | Defaults to "production"; no staging indicator |
| `LEGAL_CONTROLLER_NAME` | Yes (Vercel Production) | Vercel dashboard / `.env.local` | Local-development label only | Public legal controller identity | Vercel Production build fails closed |
| `LEGAL_CONTROLLER_ADDRESS` | Yes (Vercel Production) | Vercel dashboard / `.env.local` | Local-development label only | Public controller postal/business address | Vercel Production build fails closed |
| `LEGAL_CONTROLLER_COUNTRY` | Yes (Vercel Production) | Vercel dashboard / `.env.local` | Local-development label only | Controller establishment/country | Vercel Production build fails closed |
| `LEGAL_MINIMUM_AGE` | Yes (Vercel Production) | Vercel dashboard / `.env.local` | `18` locally | Owner-approved account minimum age, integer 13–18 | Vercel Production build fails closed; signup eligibility is undefined |
| `CRON_SECRET` | Yes (for cleanup) | Vercel dashboard | — | Auth token for `/api/cron/cleanup` endpoint | Expired shared scores never cleaned up |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for cleanup) | Vercel dashboard | — | Server-only key for the service-role-restricted cleanup RPC | Cleanup returns 503 and the scheduled workflow fails/alerts |

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
| `SUPABASE_SERVICE_ROLE_KEY` | (set separately in Render and Vercel — server-only; never expose) |
| `SUPABASE_JWT_SECRET` | (legacy HS256 fallback in Render; do not expose to the frontend) |
| `AI_QUOTA_ENFORCEMENT` | `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (set in Vercel — public Cloudflare Turnstile site key) |
| `CRON_SECRET` | (set in Vercel + GitHub Actions secret — generate with `openssl rand -hex 32`) |
| `LEGAL_CONTROLLER_NAME` | (owner supplies non-secret public legal identity) |
| `LEGAL_CONTROLLER_ADDRESS` | (owner supplies non-secret public business/postal address) |
| `LEGAL_CONTROLLER_COUNTRY` | (owner supplies non-secret country) |
| `LEGAL_MINIMUM_AGE` | (owner/counsel-approved integer 13–18) |
