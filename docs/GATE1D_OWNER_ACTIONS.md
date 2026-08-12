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
- [ ] Have qualified counsel/privacy reviewer confirm controller identity,
  governing law, jurisdiction-specific scope, legal bases, Article 9/sensitive
  data handling, minimum age, representative/DPO need, and the revised public
  Privacy Policy/Terms.

**Evidence:** dated decision memo and screenshot/export of variable names and
non-sensitive values. Do not publish a home address without confirming the
appropriate business/postal address.

## 2. Processor and transfer chain

Current public terms, plan boundaries, default retention statements, and the
remaining account-specific evidence are recorded in
`docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md`.

- [ ] Move Vercel to a plan/agreement covered by its DPA before EEA/UK data, and
  resolve the DPA's sensitive-data prohibition; an upgrade alone is not enough.
- [ ] Obtain/retain the applicable Hugging Face DPA and approve the pinned
  Together AI provider, including DPA, content terms, subprocessors, privacy/ZDR
  setting, region, retention, and transfer mechanism.
- [ ] Retain current Supabase, Render, Sentry, Google, and Cloudflare terms/DPAs as
  applicable; record plan, region, subprocessors, transfer safeguard and privacy
  contact in `docs/ROPA.md` or the private evidence register.
- [ ] Subscribe to subprocessor-change notices where available.

**Evidence:** contract PDFs/effective dates, plan invoices or dashboard
screenshots, region/settings screenshots, subprocessor lists and transfer memo.

## 3. Retention and deletion evidence

Public retention baselines are recorded in
`docs/GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md`; the unchecked items below require
the actual account settings or private operational register.

- [ ] Record actual Render and Vercel log retention, Supabase Auth/database backup
  behavior, Sentry retention/region, GA retention, Hugging Face/Together settings,
  Cloudflare retention, and email/support retention.
- [ ] Inventory every manual production backup: creator, UTC time, encrypted
  location, hash, authorized users, purpose, expiry date, and destruction proof.
- [ ] Set a maximum retention for the private DSAR and incident registers and
  temporary exports.
- [ ] Inspect and purge historical Sentry events that may contain request,
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
