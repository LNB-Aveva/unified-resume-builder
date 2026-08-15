# Record of Processing Activities (ROPA)

**Status:** Repository inventory and public provider evidence complete; account-specific owner evidence remains open
**Last reviewed:** 2026-08-11

The production controller identity is supplied by `LEGAL_CONTROLLER_NAME`,
`LEGAL_CONTROLLER_ADDRESS`, and `LEGAL_CONTROLLER_COUNTRY`. Vercel production
builds fail closed when these values or `LEGAL_MINIMUM_AGE` are absent.
Production verification on 2026-08-11 proved the individual controller name,
United States, a non-placeholder address, and minimum age 16 on both legal
pages. The address is deliberately omitted from this repository record.

## Processing inventory

| Activity | Data subjects and categories | Purpose / basis | Recipients | Retention / deletion |
|---|---|---|---|---|
| Account and authentication | Users; ID, email/phone, password hash, OAuth identity, auth/session/sign-in metadata, terms/newsletter/age metadata | Account/service delivery: contract; security: legitimate interests; newsletter: consent | Supabase; Google for OAuth; Vercel server actions | Active account; deletion removes Auth identity subject to provider logs/backups/legal holds |
| Profile and onboarding | Users; name, role, industry, experience, onboarding state | Personalization and account setup: contract | Supabase; Vercel | Active account or earlier edit/deletion |
| Saved resumes and versions | Users and people named in resumes; contact details, work, education, skills, free text, immutable versions | User-requested storage/versioning/export: contract | Vercel; Supabase | Until resume/account deletion; provider backup lag applies |
| Job tracker | Users and contacts named in notes; company/title/URL/status/notes/resume link | User-requested application tracking: contract | Vercel; Supabase; local browser fallback | Until row/account deletion; browser rows until cleared/migrated/deletion on that device |
| Local ATS analysis/PDF | Users and people named in content; resume/JD text and generated PDF | Requested analysis/export: contract | Browser; Render for API/PDF paths | Request memory; no intentional body persistence; logs exclude bodies |
| Generative AI | Users and people named in content; JD/resume/bullets/skills/company/experience/tone/interests; generated output | Requested generation: contract | Render; Hugging Face router; pinned Together AI provider | No intentional app persistence; vendor operational retention/settings require owner evidence |
| Public score sharing | Users; score/grade/labels/keywords/counts/role hint | User-requested public-by-link disclosure: contract/consent to disclosure | Supabase; anyone with link | Revocation or 30-day access expiry; hourly deletion cleanup |
| AI fair-use ledger | Users; ID, UTC date, units, timestamp | Abuse prevention and service sustainability: legitimate interests | Render; Supabase | Rolling 31 days or account deletion |
| Security/access logging | Users/visitors; IP, route/method/status/duration, request ID, content length, auth/rate flags, CF-Ray/security signals | Security, fraud, reliability: legitimate interests; legal obligation where applicable | Render/Vercel/Cloudflare/Supabase | Vendor plan setting; **OWNER EVIDENCE REQUIRED** |
| Error diagnostics | Users/visitors; generic error type and source location; no request/user/exception content by configured allowlist | Reliability/security: legitimate interests | Sentry | Dashboard setting; **OWNER EVIDENCE REQUIRED** |
| Analytics | Consenting visitors; device/client identifiers and interaction events | Product measurement: consent | Google Analytics | Property setting; **OWNER EVIDENCE REQUIRED** |
| Advertising | Consenting visitors; advertising storage/signals and ad events | Advertising: consent | Google AdSense | Account/property setting; **OWNER EVIDENCE REQUIRED**; no ad units until Gate 1(e) closes |
| Authentication bot checks | Email-auth visitors; IP/browser/security signals, token outcome | Abuse prevention/security: legitimate interests | Cloudflare Turnstile; Supabase | Vendor retention; **OWNER EVIDENCE REQUIRED** |
| Support and rights | Users/requesters; email, request, case metadata, response evidence | Support: contract; rights/legal compliance: legal obligation | Zoho Mail and relevant processors | Delete ordinary support email 12 months after case closure; retain minimal DSAR and incident-register metadata for three years after closure; delete temporary exports, identity-verification material and working attachments at closure and no later than seven days after secure delivery; documented legal holds may extend affected records with annual review |

## Systems and transfer register

| Processor | Role | Data location / transfer mechanism | Contract status |
|---|---|---|---|
| Supabase | Auth/database processor | West US (Oregon), AWS `us-west-2` | Owner supplied the current dashboard region and Free organization plan on 2026-08-13; the production Backups page on 2026-08-14 confirmed that Free includes no project backups. Free provides one-day API/database log retention. The 2026-06-01 public DPA is located |
| Vercel | Frontend/server-action processor | Functions: `iad1` (Washington, D.C., USA); static content: global CDN | Owner dashboard evidence on 2026-08-13 proved Hobby and Fluid Compute enabled; Hobby runtime logs retain one hour. Public DPA covers Pro/Enterprise and prohibits sensitive data, so covered-plan/content decision remains open before EEA/UK scope |
| Render | Backend processor | Oregon (US West), United States | Owner dashboard evidence on 2026-08-13 proved Hobby workspace and therefore 7-day log retention; backend service is Starter. Public DPA includes SCC/UK terms |
| Hugging Face | AI router processor/subprocessor | Router path to selected provider; **OWNER: confirm transfer path** | Router publicly states no body/response storage and up-to-30-day content-free debug logs; DPA advertised through Enterprise |
| Together AI | Pinned inference provider | North America per current provider documentation; **OWNER: retain applicable routed-service terms** | Public docs state default no input/output storage and training is opt-in. Owner sent a routed-request retention/terms/deletion inquiry to Hugging Face's published privacy contact on 2026-08-14; response remains pending |
| Sentry | Error processor | United States | Owner evidence on 2026-08-14 proved a Business trial with two days remaining and no payment method. Business error data has up to a 90-day lookback; Business spans have 30 days of full retention plus up to 13 months sampled; the post-trial Developer plan has a 30-day lookback. The owner permanently deleted the sole archived six-event JavaScript issue and proved both issue lists empty. The 30-day trace review exposed URL/query-bearing pre-allowlist spans in `javascript-nextjs` and 11 pre-allowlist spans in `python`; both old projects therefore required replacement because Sentry cannot individually delete spans. The application sets tracing/replay to zero, disables default PII and local variables, and allowlists error payload fields. Organization evidence proves required server-side/default scrubbing, IP suppression and Enhanced Privacy enabled, with shared issues, source fetching and minidump attachments disabled and no Global Safe Fields. Replacement `resumeai-frontend` is live through rotated Vercel Production/Preview configuration; replacement `resumeai-backend` is live through rotated Render configuration. Controlled production checks proved redaction, zero users, no traces/replays, matching live releases, and successful ingestion. Both sanitized tests and both old projects were permanently deleted. Final all-project evidence shows only the two empty replacements, no 90-day issues and no 30-day traces. Historical Sentry purge is complete; post-trial plan confirmation remains open and public DPA/transfer materials are located |
| Google | OAuth plus consented analytics/advertising | Global; US production account; **OWNER: retain applicable OAuth/transfer evidence** | Owner evidence on 2026-08-14 proves GA Data Processing Terms accepted 2026-06-14; event/user retention both two months; reset-on-activity, Signals, user-provided data, granular location/device data, ads personalization and all optional account sharing disabled. GA settings are complete for consent-gated ad-free scope; OAuth evidence and AdSense regional status remain open |
| Cloudflare | CAPTCHA/security processor | Global | Public self-serve DPA v6.4 and Turnstile privacy addendum located. Owner evidence on 2026-08-14 proves the production widget is limited to `resumeai.cv`, uses Managed mode, has pre-clearance disabled, and keeps its secret masked. Widget analytics is limited to seven days; billing shows no payment method or paid Turnstile subscription, consistent with Free. Applicable-agreement retention and subprocessor-change monitoring are ongoing operational duties |
| Zoho Mail | Support mailbox and Supabase Auth SMTP relay | Vendor-operated service; Free organization account | Owner attestation on 2026-08-14 confirms Free; dashboard evidence proves a 30-day Spam/Trash cleanup interval. Zoho documents a further 30-day server recovery window after Trash removal. Owner adopted deletion of ordinary support email 12 months after case closure; DSAR/incident/legal-hold records follow a separate restricted schedule |

## Review triggers

Review this record before adding a table/field, processor, SDK, log attribute,
new AI model/provider, new country, ad unit, marketing integration, or retention
change. A `:fastest`, `:cheapest`, or other dynamic AI provider suffix is not
permitted without a new processor review.

See `docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md` for dated official links and the
boundary between public facts and owner-controlled account evidence.
