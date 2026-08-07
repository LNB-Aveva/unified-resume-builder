# Supabase Auth SMTP Verification Checklist

This checklist verifies that production Supabase Auth mail is sent through the `support@resumeai.cv` Zoho mailbox and that sign-up and recovery links return to `https://resumeai.cv`.

Supabase's default SMTP is not production-ready: it currently sends only to project-team addresses, is limited to two messages per hour, and has no delivery SLA. Do not mark this gate complete until a non-team external inbox receives the production messages.

## Expected production configuration

Open Supabase Dashboard → Settings → Authentication → SMTP Settings. Depending on the current dashboard navigation, the same page may appear under Authentication → Email/SMTP.

| Setting | Expected value |
|---|---|
| Custom SMTP | Enabled |
| Sender email | `support@resumeai.cv` |
| Sender name | `ResumeAI` |
| SMTP host | `smtp.zoho.com` |
| SMTP port | `587` with TLS/STARTTLS, or `465` with SSL |
| Username | Full mailbox address: `support@resumeai.cv` |
| Password | Zoho mailbox password or application-specific password when 2FA requires it |

The authenticated mailbox must match the sender address or an allowed alias. Never store the SMTP password in Git, Vercel public variables, screenshots, or test logs.

## Preflight

From PowerShell:

```powershell
Resolve-DnsName -Type MX resumeai.cv
Resolve-DnsName -Type TXT resumeai.cv
Test-NetConnection smtp.zoho.com -Port 587
Test-NetConnection smtp.zoho.com -Port 465
```

Pass conditions:

- MX records point to the configured Zoho mail service.
- SPF is present; DKIM and DMARC should also be configured for deliverability.
- At least the configured SMTP port is reachable.

In Supabase Authentication settings, also verify:

- Email provider/sign-ups are enabled.
- Site URL is `https://resumeai.cv`.
- Allowed redirect URLs include `https://resumeai.cv/auth/callback` and the production reset-password callback used by the application.
- Secure Email Change is enabled if email change is intended to require confirmation at both old and new addresses.
- Auth email rate limits are appropriate for launch traffic. Custom SMTP starts with a conservative Supabase Auth limit; increasing it does not change Zoho's own account limits.

## Test-account rules

- Use dedicated external inboxes that are not members of the Supabase organization.
- Do not use the owner's primary account for destructive tests.
- Use unique aliases so messages can be correlated, for example `resumeai-smtp+signup@...`.
- Record message timestamps and final status, but never record tokens or full confirmation URLs.
- Delete test users after evidence is captured.

## 1. Sign-up confirmation

1. Open `https://resumeai.cv/sign-up` in a private browser window.
2. Register a new external test address.
3. Confirm the UI redirects to `/verify-email` and does not expose a provider error.
4. Verify the message arrives from `support@resumeai.cv` within five minutes.
5. Inspect headers to confirm Zoho handled the message and SPF/DKIM/DMARC results pass.
6. Click the confirmation link once.
7. Confirm it returns through `https://resumeai.cv/auth/callback` and the user can sign in.

Repository path exercised: `signUp()` in `frontend/src/app/actions/auth.ts`, which sets `emailRedirectTo` to `/auth/callback`.

## 2. Password reset

1. Open `https://resumeai.cv/forgot-password`.
2. Request a reset for the confirmed external test account.
3. Verify the recovery message arrives from `support@resumeai.cv` within five minutes.
4. Click the link and confirm it reaches `/auth/callback?next=/reset-password`, then `/reset-password`.
5. Set a new password.
6. Confirm the old password fails and the new password succeeds.
7. Confirm the link cannot be reused after successful reset.

Repository path exercised: `forgotPassword()` calls `resetPasswordForEmail()` with the production callback; `resetPassword()` calls `updateUser()` with the new password.

## 3. Email-change delivery

Current `main` does not expose a user-facing action that calls `supabase.auth.updateUser({ email: ... })`. Therefore:

- SMTP delivery for Supabase's Change Email Address template can be tested with a dedicated Auth test account through the Supabase Auth API or a temporary administrative test procedure.
- ResumeAI cannot claim that account email change works end to end until a user-facing flow exists and is tested.
- Do not use Dashboard admin email editing as proof; an admin operation can bypass the confirmation flow being verified.

When the Auth-level test is performed:

1. Enable Secure Email Change.
2. Request a change from one controlled external inbox to another.
3. Confirm the expected message reaches both the current and new address.
4. Confirm neither address changes prematurely.
5. Complete both confirmations and verify sign-in works only with the new address.
6. Verify the security notification reaches the old address if that notification is enabled.

Until those steps pass, record email-change status as `UNVERIFIED`, not failed SMTP.

## 4. Template review

In Supabase Dashboard → Authentication → Email Templates, review at minimum:

- Confirm signup
- Reset password
- Change email address
- Password changed notification
- Email address changed notification

For each template:

- Subject identifies ResumeAI and the requested action without urgency/spam language.
- The action link uses the supported `{{ .ConfirmationURL }}` or token variables.
- Production links resolve to `https://resumeai.cv`, never localhost or a Vercel preview.
- No resume content, job description, password, access token, or service key is included.
- The message explains what to do if the recipient did not request the action.
- `support@resumeai.cv` is present for assistance.
- Email-provider click tracking is disabled so confirmation URLs are not rewritten.
- Both HTML and plain-text rendering are readable on mobile.

## Evidence record

| Check | Required evidence | Result |
|---|---|---|
| Custom SMTP enabled | Dashboard screenshot with password hidden | `[ ]` |
| Non-team sign-up delivery | Timestamp, recipient domain, From header, auth result | `[ ]` |
| Password reset | Timestamp, callback destination, old/new password behavior | `[ ]` |
| Email change | Two-inbox confirmation evidence, or `UNVERIFIED — no app flow` | `[ ]` |
| Template review | Reviewer/date and template names | `[ ]` |
| DNS authentication | SPF/DKIM/DMARC result summary | `[ ]` |
| Auth logs | No SMTP/template errors for test events | `[ ]` |

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| `Email address not authorized` | Supabase default SMTP is still active | Re-enable/save custom SMTP and retry with a new test address. |
| SMTP authentication/535 error | Wrong username/password or Zoho 2FA requires an app password | Use the full mailbox address and generate an application-specific password if required. |
| Connection timeout | Wrong port/security mode or network block | Test ports 587 and 465; match TLS to 587 or SSL to 465. |
| Supabase says sent, inbox receives nothing | Zoho rejection, spam placement, or DNS authentication issue | Check Supabase Auth logs, Zoho sent/security logs, spam folder, SPF, DKIM, and DMARC. |
| Link points to localhost/preview | Site URL or redirect allow list is wrong | Correct Supabase Auth URL configuration and `NEXT_PUBLIC_SITE_URL`, then generate a fresh message. |
| Link is already invalid | Mail security scanner prefetched the confirmation URL | Disable email tracking; consider an OTP or intermediate confirmation page if prefetching continues. |
| Template silently falls back | Invalid Go-template syntax | Check Auth logs for `templatemailer_template_body_parse_error` and correct the supported variables. |
| Rate-limit response | Supabase Auth or Zoho sending limit reached | Stop repeated tests, review both providers' limits, and retry after the documented window. |

## References

- Supabase custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase email templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Zoho SMTP configuration: https://www.zoho.com/mail/help/zoho-smtp.html
- Application auth actions: `frontend/src/app/actions/auth.ts`

