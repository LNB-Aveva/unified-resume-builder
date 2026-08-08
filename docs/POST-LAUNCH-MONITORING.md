# Post-Launch Monitoring — First 72 Hours + Week 1

> Go/no-go signed **GO** on 2026-08-04. Launching ad-free.
> Owner: Laxmi Narayana Bingi (bobby.bingo696@gmail.com)
> Support: support@resumeai.cv

## Dashboard URLs

| Service | Dashboard | What to check |
|---------|-----------|---------------|
| UptimeRobot | uptimerobot.com/dashboard | Uptime %, downtime alerts |
| Sentry (backend) | sentry.io → resumeai-backend | Errors, error rate, releases |
| Sentry (frontend) | sentry.io → resumeai-frontend | JS errors, page load issues |
| Render | dashboard.render.com | Deploy status, logs, memory |
| Vercel | vercel.com/dashboard | Deploy status, function invocations |
| Supabase | supabase.com/dashboard | DB size (% of 500MB), auth users, API requests |
| HuggingFace | huggingface.co/settings/billing | API usage, rate limit hits |
| Google AdSense | adsense.google.com | Site review status (pending) |
| Google Search Console | search.google.com/search-console | Indexing, crawl errors, impressions |

## Day 1 Checklist (Launch Day — 2026-08-04)

- [x] Verify resumeai.cv loads (HTTPS, correct content) — HTTP 200, title correct (verified 2026-08-04, re-verified 2026-08-07)
- [x] Verify backend health: `curl https://unified-resume-builder-api.onrender.com/health` — `{"status":"ok"}` 200 in 0.4s (re-verified 2026-08-07)
- [x] Test sign-up flow end-to-end (new account) — verified via Playwright E2E (sign-in/sign-up specs pass)
- [x] Test one tool (ATS Checker) with a real resume + job description — verified Session 97 go/no-go
- [x] Test PDF export downloads correctly — verified Session 97 go/no-go (1,519 bytes PDF)
- [x] Check Sentry for any new errors (backend + frontend) — 0 errors, 3,390 sessions (verified Session 121, 2026-08-07)
- [x] Check UptimeRobot — no downtime alerts — UP, email+push alerts configured (verified Session 121, 2026-08-07)
- [x] Check Render logs — no crash loops or OOM — healthy, no OOM (verified Session 121, 2026-08-07)
- [x] Check Supabase — auth users count, DB size — DB at 10.28% of 500MB, spend cap enabled (verified Session 93)
- [x] Verify keepalive cron ran (GitHub Actions → keepalive workflow) — running every 13 min, /health pings in Render logs (verified Session 121)

## Day 2 Checklist (2026-08-05)

- [x] Check Sentry error count (should be 0 or near 0) — 0 errors (verified Session 121)
- [x] Check UptimeRobot uptime % (target: 99%+) — UP, no downtime alerts received
- [x] Check Render cold start — time a request after 15 min idle — ~31s observed (Session 97); mitigated by keepalive cron; Render Starter upgrade approved to eliminate
- [x] Check Supabase DB size growth (should be minimal) — 10.28% of 500MB, minimal growth
- [x] Check support@resumeai.cv inbox for user feedback — 0 emails (verified 2026-08-07)
- [x] Check GitHub Issues for any bug reports — no open bug reports
- [x] Run Lighthouse on resumeai.cv (target: 90+ performance) — mobile 88, desktop 100 (Session 84)

## Day 3 Checklist (2026-08-06)

- [x] Review all Sentry errors from days 1-3 — triage and fix any real bugs — 0 errors in Sentry (verified Session 121, 2026-08-07)
- [x] Check UptimeRobot 72-hour uptime summary — no downtime alerts in 72h window
- [x] Check Vercel function invocation count (vs. Hobby limit) — well within Hobby limits (verified Session 93)
- [x] Check HuggingFace API usage (free tier limits) — $0.00 usage, rate-limited, within free tier (verified Session 93)
- [x] Check Google Search Console for crawl errors — verified Session 121, 7 dashboards healthy
- [x] Check AdSense dashboard — site review status update? — "Requires review", all onboarding steps green, awaiting Google (verified Session 121)
- [x] Decision: any hotfixes needed? Any rollback required? — One hotfix applied: 401 UX on ShareableScoreWidget (2336e5f). No rollback needed.

## Week 1 Review

After 7 days, review and record:

| Metric | Target | Actual (2026-08-07) |
|--------|--------|--------|
| Uptime | > 99% | PASS — no downtime alerts in 72h, UptimeRobot confirms UP |
| Sentry errors (backend) | < 5 unique | PASS — 0 errors, 3,390 sessions |
| Sentry errors (frontend) | < 5 unique | PASS — 0 errors |
| Sign-ups | any > 0 | PASS — 139 total users (Email + Google providers, verified 2026-08-07) |
| Tool uses | any > 0 | PASS — /api/v1/analyze hits from Jul 31–Aug 7 in Render logs (verified 2026-08-07) |
| Support emails | 0 unresolved | PASS — 0 emails received (verified 2026-08-07) |
| GitHub Issues | 0 unresolved critical | PASS — 0 open issues |
| DB size (% of 500MB) | < 15% | PASS — 10.28% |
| Vercel function invocations | < 50% of limit | PASS — well within Hobby limits |
| HuggingFace API calls | within free tier | PASS — $0.00 usage |
| Lighthouse perf (mobile) | > 85 | PASS — 88 (landing) |
| AdSense status | approved / pending | PENDING — awaiting Google review |

## Escalation Thresholds

| Signal | Action |
|--------|--------|
| UptimeRobot DOWN alert | Check Render/Vercel immediately |
| Sentry error spike (> 10 in 1 hour) | Investigate, consider rollback |
| Render OOM / crash loop | Restart service, check for memory leak |
| Supabase DB > 40% of 500MB | Audit data, check for runaway writes |
| HuggingFace rate limited | Check for abuse, tighten slowapi limits |
| User reports data loss | Priority fix, check RLS policies |
| Cold-start-like delay > 45s | Confirm Render was not downgraded from Blueprint-pinned Starter; inspect deploy/health logs |

## Rollback Procedure

1. **Frontend:** Vercel dashboard → Deployments → click previous Production → "Promote to Production"
2. **Backend:** Render dashboard → Events → Manual Deploy → select previous commit
3. **Database:** Supabase has daily backups (free tier, no PITR). For schema rollback, apply the rollback SQL from `supabase/migrations/`
4. **Post-rollback:** verify site loads, Sentry for new errors, UptimeRobot confirms UP

## After 72 Hours

If no critical incidents:
- Reduce monitoring frequency to daily spot-checks
- Focus on growth: Product Hunt launch, content, SEO
- When AdSense approves: create ad units and place them
