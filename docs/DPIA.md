# Data Protection Impact Assessment — Pre-Launch Record

**Screening date:** 2026-08-11
**Outcome:** DPIA required before accepting EEA/UK resume data
**Status:** Technical assessment complete; controller/contracts/transfer evidence pending

## Why the threshold is treated as met

ResumeAI regularly processes detailed employment profiles and free-form resumes,
notes, and AI prompts. Those fields can reveal special-category or other highly
sensitive data even though the product does not request it. Generative AI adds a
new-technology and multi-processor chain. Public-by-link sharing and immutable
version history increase disclosure and retention consequences. The product does
not make hiring decisions, but the combined sensitivity, scale uncertainty, and
processor routing justify a full assessment instead of relying on the small-
business exception.

## Necessity and proportionality

- Core resume analysis needs job/resume text; account storage is optional until a
  user explicitly saves a resume.
- Local scoring/compliance paths avoid generative AI where it is not required.
- AI inputs are not intentionally persisted by the application.
- Users are warned not to submit government IDs, financial, medical, disability,
  or other unnecessary sensitive data.
- Public sharing excludes raw resume text and requires an explicit user action.
- Purpose-specific analytics/advertising choices are independent and optional.

## Risk assessment

| Risk | Likelihood / impact before controls | Implemented repository controls | Residual / owner action |
|---|---|---|---|
| Cross-user resume disclosure | Medium / severe | RLS, restrictive permanent-user policies, 20/20 production isolation suite, cascade tests | Preserve tests and re-run after schema/RPC changes |
| Guessing/public share exposure | Low / high | Full random identifier, single-record RPC, raw text/user ID omitted, user disclosure, revoke, 30-day expiry | Periodically prove expired rows absent |
| Sensitive resume content reaches telemetry | Medium / severe | Sentry allowlisted envelope, generic exception values, no requests/breadcrumbs/contexts/tags/extras/traces; provider bodies removed from exceptions | Owner inspects/purges historical events and proves plan/region/retention |
| Undisclosed/dynamic AI processor | High / high | Provider pinned to Together AI in code; dynamic routing suffix prohibited | Obtain Hugging Face/Together agreements, regions, settings and transfer basis |
| Processor contract does not permit data | High / severe | User minimization warning; documented processor inventory | Vercel covered plan/contract and content restriction decision; HF/Together DPA; no EEA/UK data until closed |
| Incomplete deletion/access response | High / high | Export expanded; browser data included/cleared; cascade deletion; DSAR runbook | Run full drill and record processor/back-up deletion capability |
| Excess retention/backups | Medium / high | 30-day shares, hourly cleanup, 31-day quota, category schedule | Prove vendor settings and manual backup register/destruction |
| Child account | Medium / high | Production-configured minimum age, recorded confirmation, OAuth onboarding blocks tools until acceptance | Owner chooses lawful age and documents under-age response drill |
| Optional tracking before consent | Medium / high | GA/AdSense scripts load only for the independent granted purpose | Certified CMP/GPC and regional messages remain Gate 1(e) owner work |
| Breach response misses deadline | Medium / severe | Privacy incident procedure and case log requirements added | Tabletop with owner; retain processor contacts and notification templates |

## Residual-risk decision

The repository controls materially reduce disclosure and telemetry risk, but the
controller must not sign this DPIA as acceptable for EEA/UK processing until all
of the following are evidenced:

1. Controller identity, establishment, representative/DPO decision, and target
   jurisdictions.
2. Covered processor contracts, permitted-content terms, subprocessors, regions,
   transfer mechanisms, and retention settings.
3. One completed rights/deletion drill and one privacy-breach tabletop.
4. Sentry historical-event review and vendor dashboard evidence.
5. Counsel or qualified privacy reviewer approval of legal bases, Article 9
   handling, transfer assessment, age threshold, and residual risks.

The controller records approval/rejection, date, reviewer, and review interval in
the private compliance register. Until then, the Gate 1(d) EEA/UK verdict remains
NO-GO.
