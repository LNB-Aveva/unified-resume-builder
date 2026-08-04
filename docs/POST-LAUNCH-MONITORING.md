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

## Day 1 Checklist (Launch Day)

- [ ] Verify resumeai.cv loads (HTTPS, correct content)
- [ ] Verify backend health: `curl https://unified-resume-builder-api.onrender.com/health`
- [ ] Test sign-up flow end-to-end (new account)
- [ ] Test one tool (ATS Checker) with a real resume + job description
- [ ] Test PDF export downloads correctly
- [ ] Check Sentry for any new errors (backend + frontend)
- [ ] Check UptimeRobot — no downtime alerts
- [ ] Check Render logs — no crash loops or OOM
- [ ] Check Supabase — auth users count, DB size
- [ ] Verify keepalive cron ran (GitHub Actions → keepalive workflow)

## Day 2 Checklist

- [ ] Check Sentry error count (should be 0 or near 0)
- [ ] Check UptimeRobot uptime % (target: 99%+)
- [ ] Check Render cold start — time a request after 15 min idle
- [ ] Check Supabase DB size growth (should be minimal)
- [ ] Check support@resumeai.cv inbox for user feedback
- [ ] Check GitHub Issues for any bug reports
- [ ] Run Lighthouse on resumeai.cv (target: 90+ performance)

## Day 3 Checklist

- [ ] Review all Sentry errors from days 1-3 — triage and fix any real bugs
- [ ] Check UptimeRobot 72-hour uptime summary
- [ ] Check Vercel function invocation count (vs. Hobby limit)
- [ ] Check HuggingFace API usage (free tier limits)
- [ ] Check Google Search Console for crawl errors
- [ ] Check AdSense dashboard — site review status update?
- [ ] Decision: any hotfixes needed? Any rollback required?

## Week 1 Review

After 7 days, review and record:

| Metric | Target | Actual |
|--------|--------|--------|
| Uptime | > 99% | |
| Sentry errors (backend) | < 5 unique | |
| Sentry errors (frontend) | < 5 unique | |
| Sign-ups | any > 0 | |
| Tool uses | any > 0 | |
| Support emails | 0 unresolved | |
| GitHub Issues | 0 unresolved critical | |
| DB size (% of 500MB) | < 15% | |
| Vercel function invocations | < 50% of limit | |
| HuggingFace API calls | within free tier | |
| Lighthouse perf (mobile) | > 85 | |
| AdSense status | approved / pending | |

## Escalation Thresholds

| Signal | Action |
|--------|--------|
| UptimeRobot DOWN alert | Check Render/Vercel immediately |
| Sentry error spike (> 10 in 1 hour) | Investigate, consider rollback |
| Render OOM / crash loop | Restart service, check for memory leak |
| Supabase DB > 40% of 500MB | Audit data, check for runaway writes |
| HuggingFace rate limited | Check for abuse, tighten slowapi limits |
| User reports data loss | Priority fix, check RLS policies |
| Cold start > 45s | Check Render free tier, consider keepalive frequency |

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
