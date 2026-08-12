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
| Support and rights | Users/requesters; email, request, case metadata, response evidence | Support: contract; rights/legal compliance: legal obligation | Email provider and relevant processors | Case schedule and legal hold; delete working exports after closure |

## Systems and transfer register

| Processor | Role | Data location / transfer mechanism | Contract status |
|---|---|---|---|
| Supabase | Auth/database processor | One selected AWS project region; **OWNER: record actual region and transfer mechanism** | 2026-06-01 public DPA located; Free public baseline is one-day logs and no included automatic backups; retain account evidence |
| Vercel | Frontend/server-action processor | Primarily US with possible global processing; **OWNER: record runtime regions** | Current public DPA covers Pro/Enterprise and prohibits sensitive data; dashboard shows Hobby, so covered-plan/content decision remains open |
| Render | Backend processor | **OWNER: record service region and workspace plan** | Public DPA includes SCC/UK terms; public log retention is 7/14/30 days by workspace plan, not service instance type |
| Hugging Face | AI router processor/subprocessor | Router path to selected provider; **OWNER: confirm transfer path** | Router publicly states no body/response storage and up-to-30-day content-free debug logs; DPA advertised through Enterprise |
| Together AI | Pinned inference provider | North America per current provider documentation; **OWNER: retain applicable routed-service terms** | Public docs state default no input/output storage and optional ZDR, but HF-routed applicability requires written confirmation |
| Sentry | Error processor | US or Germany selectable; **OWNER: record actual region, plan and retention** | Public DPA/transfer materials located; allowlist control implemented; historical inspection/purge remains open |
| Google | OAuth plus consented analytics/advertising | Global; **OWNER: retain applicable terms/settings/transfer basis** | GA public retention choices are 2 or 14 months; actual property setting and AdSense regional status remain open |
| Cloudflare | CAPTCHA/security processor | Global; **OWNER: retain applicable account evidence** | Public self-serve DPA v6.4 and Turnstile privacy addendum located; account/version/subprocessor evidence remains open |

## Review triggers

Review this record before adding a table/field, processor, SDK, log attribute,
new AI model/provider, new country, ad unit, marketing integration, or retention
change. A `:fastest`, `:cheapest`, or other dynamic AI provider suffix is not
permitted without a new processor review.

See `docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md` for dated official links and the
boundary between public facts and owner-controlled account evidence.
