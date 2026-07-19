# Incident Response Plan — ResumeAI

Last updated: 2026-07-19

## Scope

This plan covers security incidents for resumeai.cv (frontend on Vercel, backend on Render, database on Supabase).

## Severity Levels

| Level | Definition | Response Time |
|-------|-----------|---------------|
| Critical | Data breach, RCE, credential leak | Immediate (< 1 hour) |
| High | Service compromise, API abuse at scale | Same day |
| Medium | Single-user impact, rate limit bypass | 24 hours |
| Low | Information disclosure (non-sensitive) | Next session |

## Detection

- UptimeRobot: alerts on downtime (frontend + backend)
- GitHub Dependabot: alerts on new CVEs
- CI pip-audit + npm audit: blocks vulnerable code from merging
- Render logs: manual review for anomalous traffic patterns
- Cloudflare dashboard: DDoS/bot traffic visibility

## Response Procedures

### 1. Credential Leak (API key exposed)

1. Rotate the key immediately (HuggingFace dashboard)
2. Update `.env` on Render
3. Check Render logs for unauthorized usage during exposure window
4. Update local `.env`
5. Run `detect-secrets scan` to verify no other leaks

### 2. Dependency CVE (Critical/High)

1. Run `pip-audit` / `npm audit` to identify affected package
2. Upgrade if fix available; if not, assess exploitability in our context
3. If exploitable: take service offline, patch, redeploy
4. If not exploitable: document in threat model, add `--ignore-vuln` to CI
5. Push fix, verify CI green

### 3. Service Abuse (Rate Limit Bypass)

1. Check Cloudflare analytics for traffic patterns
2. If distributed: enable Cloudflare Under Attack mode
3. If single-IP: Cloudflare firewall rule to block
4. Review rate limiter config (slowapi)
5. Consider reducing limits temporarily

### 4. Backend Down (Render)

1. Check Render dashboard for deploy status
2. Check logs for crash cause (OOM, import error, dependency issue)
3. If bad deploy: rollback via Render dashboard
4. If resource exhaustion: restart service
5. Verify via UptimeRobot

### 5. Frontend Down (Vercel)

1. Check Vercel dashboard for build status
2. If build failure: check recent commits, revert if needed
3. Verify DNS (Cloudflare) pointing correctly
4. Check Vercel status page for platform issues

## Post-Incident

1. Document what happened, timeline, and root cause
2. Update threat model if new threat category identified
3. Add regression test if applicable
4. Update this plan if response was inadequate

## Contacts

- Primary responder: Repository owner
- Render support: dashboard.render.com
- Vercel support: vercel.com/support
- Cloudflare: dash.cloudflare.com
- Supabase: app.supabase.com
