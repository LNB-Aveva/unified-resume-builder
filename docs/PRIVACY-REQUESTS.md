# Privacy Rights Request Procedure

**Owner:** Launch owner / privacy request owner
**Intake:** `support@resumeai.cv`
**Last reviewed:** 2026-08-11

This runbook applies to access, correction, deletion, portability, restriction,
objection, consent withdrawal, recipient information, opt-out, and appeal
requests. It complements the self-service Account page; it is not replaced by
the JSON download button.

Ordinary support email that is not part of a privacy-rights request, incident,
legal hold, or other documented exception is deleted 12 months after case
closure. Privacy-rights and incident records follow the separate restricted
register schedule, and working exports are deleted when the case closes.

## Service levels

- Acknowledge within 3 business days.
- Complete within 30 calendar days when GDPR/UK GDPR applies, unless a lawful
  extension is documented and communicated before the original deadline.
- Complete within 45 calendar days when CCPA/CPRA applies, unless a lawful
  extension is documented and communicated before the original deadline.
- Use the shorter applicable deadline when scope is uncertain.
- Never charge unless the applicable law permits it and the request is
  demonstrably excessive or repetitive.

## Request log

Create one row in the private request register for every request:

| Field | Required value |
|---|---|
| Case ID | `PRIV-YYYYMMDD-NNN` |
| Received / acknowledged / due / completed | UTC timestamps |
| Requester | Account ID and masked email; do not copy resume data into the register |
| Jurisdiction asserted | Country/state and basis supplied by requester |
| Request types | Access, correction, delete, etc. |
| Verification method | Existing authenticated session or email control; exceptions documented |
| Systems searched | Checklist below |
| Processor tickets | Vendor, ticket ID, opened/completed time |
| Decision | Fulfilled, partially fulfilled, denied, no data, withdrawn |
| Legal/security retention | Category, reason, review/deletion date |
| Response evidence | Location of response and export hash, not the export itself |
| Appeal | Date, reviewer, result |

Keep the register access-restricted. Do not store identity documents unless
strictly necessary; delete verification material as soon as the request closes.

## Procedure

1. **Acknowledge and classify.** Record the request and deadline. Do not ask the
   user to identify a statute before helping them.
2. **Verify proportionately.** Prefer an authenticated Account-page action or a
   confirmation sent to the existing account email. Ask for additional evidence
   only when account control is insufficient. Authorized agents must show
   authority and, where permitted, direct user verification.
3. **Preserve security.** Never disclose another user's data. Do not email raw
   exports to a newly supplied address until the existing account email or
   authenticated session confirms the change.
4. **Search every applicable system:**
   - Supabase Auth: identity, metadata, identities, confirmation/sign-in facts.
   - Supabase tables: `profiles`, `jobs`, `resumes`, `resume_versions`,
     `shared_scores`, and `ai_usage_daily`.
   - Browser-only `resumeai_jobs` when the requester can use the affected device.
   - Vercel and Render platform/application logs for the documented retention window.
   - Sentry error events.
   - Hugging Face router and the pinned Together AI provider when provider records
     can be linked and the request is supported.
   - Google Analytics/AdSense and Google OAuth, where identifiers can be linked.
   - Cloudflare Turnstile and Supabase authentication email delivery when relevant.
   - Support mailbox, incident register, manual backups, and legal/security holds.
5. **Fulfill by request type.** Correct source records, create a structured export,
   revoke shares, run account deletion, clear supported processor records, or
   restrict/flag records as required. Record every action and failure.
6. **Handle backups honestly.** Do not restore a backup merely to delete one row.
   Record the backup expiry date and ensure deleted data is not reintroduced if a
   restore occurs.
7. **Review.** A second check compares the request with the systems checklist and
   confirms no other person's data is present in an export.
8. **Respond securely.** Provide scope, actions, unresolved retention, recipients,
   legal basis for any limitation, complaint/appeal route, and a secure download.
9. **Close and delete working files.** Record completion, hash the final export if
   needed for proof, then remove temporary exports and verification attachments.

## Self-service export boundary

The Account-page download includes application-held account/auth metadata,
profile, jobs, resumes and versions, shared scores, the user AI-usage ledger, and
browser-only job/preference data on that device. It does not by itself fulfill a
legal access request involving platform logs, support records, processors,
backups, or inferred security records. Use this runbook for those requests.

## Drill before launch

Using a synthetic permanent account:

1. Save a profile, two resume versions, one job, one shared score, and consume an
   AI quota unit; create one browser-only job fixture.
2. Export and verify every category is present and belongs to that user.
3. Submit a correction and verify the export changes.
4. Delete the account; prove zero owned database rows and cleared browser keys.
5. Search processor dashboards/logs within their retention windows and record
   what can and cannot be deleted.
6. Close the case with timestamps and evidence links in the private register.
