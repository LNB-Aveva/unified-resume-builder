# Gate 1(d) — Owner-Only Closure Checklist

Repository work is complete when this checklist is handed over. Gate 1(d) stays
NO-GO until every applicable item below has retained, non-secret evidence.

## 1. Legal identity and market decision

- [x] Decide launch countries: US-focused initial launch from Illinois, United
  States; defer active EEA/UK marketing until the applicable Gate 1(d) closure
  work is complete. Retained decision: `docs/GATE1D_LAUNCH_SCOPE_DECISION.md`.
- [x] Set Vercel Production variables: `LEGAL_CONTROLLER_NAME`,
  `LEGAL_CONTROLLER_ADDRESS`, `LEGAL_CONTROLLER_COUNTRY`, and
  `LEGAL_MINIMUM_AGE` (integer 13–18). Production builds now fail closed without
  them. Owner dashboard evidence showed all four in Production and Preview on
  2026-08-11. The deployed Privacy and Terms pages returned 200 and rendered
  the exact controller name, United States, a non-placeholder address, and
  minimum age 16; the address value was not copied into repository evidence.
- [x] **AI-assisted internal review conducted 2026-08-12** — see
  `docs/COMPLIANCE-REVIEW-20260812.md`. Covers controller identity, FTC/COPPA/
  Illinois PIPA applicability, governing law, legal bases, minimum age 16, and
  all five corrected Privacy/Terms accuracy issues with primary-source citations.
  Qualified counsel was not engaged. Owner accepts documented residual risk for
  the US-focused, ad-free launch scope. EEA/UK and advertising scope require
  separate qualified review before activation.

**Evidence:** `docs/COMPLIANCE-REVIEW-20260812.md` (committed 3ee2703).
Do not publish a home address without confirming the appropriate business/postal
address.

## 2. Processor and transfer chain

Current public terms, plan boundaries, default retention statements, and the
remaining account-specific evidence are recorded in
`docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md`.

- [x] **Vercel Hobby DPA** — no explicit acceptance button exists for free-tier
  users. The DPA at vercel.com/legal/dpa applies automatically through their
  Terms of Service accepted at signup. US-only processing on the Hobby plan is
  covered. Before activating EEA/UK traffic, upgrade to a paid plan and resolve
  the sensitive-data prohibition clause in the DPA.
- [x] **Together AI prompt storage and training defaults for HF-routed calls** —
  production authenticates to `router.huggingface.co` with a Hugging Face token
  and does not use a customer-owned Together API key. Hugging Face documents
  that this routed mode requires no separate provider account. Together's
  current privacy/security documentation says inputs and outputs are not stored
  by default and training-data sharing is opt-in and disabled by default. A
  Together profile setting or screenshot would therefore not govern these
  routed calls. Retain the public-provider evidence; resolve temporary-cache
  duration, region and contractual assurance with the other account/processor
  evidence in §3.
- [x] **Other providers** (Supabase, Render, Sentry, Google, Cloudflare) — no
  separate DPA acceptance button exists for free-tier accounts. Acceptance is
  implicit through Terms of Service agreed at signup. For the US-only, ad-free
  launch scope this is sufficient. Record plan/region/retention in ROPA.md.
- [x] **Subprocessor notices** — not available on free tiers. Skipped for
  launch scope; revisit on paid plan upgrade.

**Evidence:** pinned `:together` route, Hugging Face routed-request documentation,
and Together AI default storage/training documentation retained in
`docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md`. Vercel/Supabase/Render/Sentry/Google/
Cloudflare noted as signup-accepted.

## 3. Retention and deletion evidence

Public retention baselines are recorded in
`docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md`; the unchecked items below require
the actual account settings or private operational register.

- [ ] Record actual Render and Vercel log retention, Supabase Auth/database backup
  behavior, Sentry retention/region, GA retention, Hugging Face/Together settings,
  Cloudflare retention, and email/support retention.
- [ ] Inventory every manual production backup: creator, UTC time, encrypted
  location, hash, authorized users, purpose, expiry date, and destruction proof.
  The Git-ignored private register now records every discovered local dump,
  device encryption, owner-only access, UTC metadata, hashes, purpose and fixed
  action dates. The owner confirmed there are no off-workspace copies. Retain
  destruction proof when each copy expires before checking this item.
- [x] Set a maximum retention for the private DSAR and incident registers and
  temporary exports. Owner approved three years after case/incident closure for
  minimal register metadata and deletion of temporary exports, identity-
  verification material and working attachments at closure and no later than
  seven days after secure delivery. Legal holds require a documented exception;
  incident-register extensions are reviewed at least annually.
- [x] Inspect and purge historical Sentry events that may contain request,
  exception, breadcrumb, context, tag, extra, or span content from before the
  allowlist deployment.

## 4. Live rights drill

- [x] Deploy the repository changes after localhost approval. The configured
  legal pages and current eligibility flow are live in production.
- [ ] Use a synthetic permanent account to run the complete drill in
  `docs/PRIVACY-REQUESTS.md`: create each data category, export, correct, delete,
  prove database zero rows, prove browser keys cleared, and record processor/log
  limitations.
- [ ] Verify email and Google OAuth users cannot enter tools without the
  configured age/Terms confirmation.
- [x] Verify Privacy and Terms display the configured controller facts. Both
  returned 200 on 2026-08-11 and rendered the exact controller name, United
  States, a non-placeholder address, and minimum age 16 without copying the
  address into repository evidence.

**Evidence:** redacted screenshots, case timestamps, export category checklist,
queries showing zero owned rows, and cleanup confirmation. Never retain the test
resume longer than needed.

## 5. Consent and advertising boundary

- [ ] Prove with a clean browser that neither GA nor AdSense scripts load before
  the relevant independent choice; verify reject, analytics-only, advertising-
  only, accept-all, withdrawal, and reload behavior.
- [ ] Confirm the implemented Global Privacy Control advertising opt-out in the
  clean-browser drill. Complete Gate 1(e): certified CMP/TCF and required regional messages
  before ad units. The repository's granular banner is not claimed to be a
  Google-certified CMP.

## 6. Privacy incident tabletop and sign-off

- [ ] Tabletop a cross-user resume exposure using `docs/INCIDENT-RESPONSE.md`.
  Record detection, containment, 72-hour decision deadline, processor contacts,
  regulator/user decision, recovery tests, and lessons.
- [ ] Review and sign `docs/DPIA.md`; do not approve EEA/UK residual risk while any
  listed prerequisite is missing.
- [ ] Final Gate 1(d) reviewer changes every applicable FAIL/UNVERIFIED row in
  `docs/GATE1D_DATA_HANDLING.md` only after checking evidence.
