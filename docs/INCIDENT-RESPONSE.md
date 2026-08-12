# Incident Response Plan — ResumeAI

Last updated: 2026-08-11

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

### 6. Suspected Personal-Data Breach

Start this procedure for lost credentials/backups, cross-user access, public
resume exposure, processor notification, telemetry containing resume content, or
any unauthorized destruction, loss, alteration, access, or disclosure.

1. **Open an incident record immediately.** Record discovery time in UTC, reporter,
   systems, data categories, approximate people/records, and known containment.
   Preserve relevant logs and configuration without copying resume bodies into
   the incident channel.
2. **Contain without destroying evidence.** Revoke shares/tokens, disable the
   affected route or processor, preserve access controls and hashes, and deploy a
   rollback only after recording the affected version/configuration.
3. **Start the notification assessment clock at awareness.** Where GDPR/UK GDPR
   applies, target a documented supervisory-authority decision within 72 hours.
   A processor notification does not reset that clock.
4. **Contact processors.** Use the retained security/privacy contacts for
   Supabase, Vercel, Render, Hugging Face, Together AI, Sentry, Google, and
   Cloudflare as applicable. Record ticket IDs, facts requested, and responses.
5. **Assess risk to people:** sensitivity, identifiability, volume, public access,
   encryption, malicious acquisition, likely consequences, children/vulnerable
   people, and effective containment.
6. **Decide and document notifications.** Record the legal reviewer, decision,
   reasoning, authority/jurisdiction, deadline, and content. If facts are
   incomplete, make staged notifications where permitted. High-risk affected
   people receive plain-language notice without undue delay where required.
7. **User notice must include:** what happened and when; affected data; likely
   consequences; containment; concrete protective steps; contact; and complaint
   route. Do not minimize uncertainty or make unsupported “no data accessed” claims.
8. **Recover and validate.** Run isolation tests, check retained fixtures, inspect
   Sentry/logs for content, verify provider actions, and monitor recurrence.
9. **Close with evidence.** Preserve timeline, decisions, notices, processor
   responses, affected versions, corrective actions, and deletion dates in the
   restricted incident register.

If the incident is not reported, the record must still explain why notification
was not legally required. Silence is not a decision record.

## Post-Incident

1. Document what happened, timeline, and root cause
2. Update threat model if new threat category identified
3. Add regression test if applicable
4. Update this plan if response was inadequate
5. Link any privacy request/deletion follow-up cases created under
   `docs/PRIVACY-REQUESTS.md`

## Contacts

- **Launch owner / incident owner:** Laxmi Narayana Bingi
- **Email:** support@resumeai.cv (public); private alert mailbox retained outside Git
- **Monitoring:** UptimeRobot (email + push), Sentry (backend + frontend), GitHub Actions CI
- **Rollback authority:** Laxmi Narayana Bingi (solo operator)
- Render support: dashboard.render.com
- Vercel support: vercel.com/support
- Supabase: supabase.com/dashboard
