# Gate 1(d) — Regulator Review of Resume-Data Handling

**Review date:** 2026-08-11
**Scope:** The checked-in application, public legal pages, production-safe HTTP
checks, retained production security evidence, and publicly available processor
terms. This is a launch-readiness control review, not a legal opinion.

## Verdict

**NO-GO for a launch that accepts resume data from EEA/UK users.** The product has
credible database isolation controls, but it cannot presently demonstrate a
complete controller notice, a stable and contractually covered processor chain,
or fulfillment of the deletion promise shown in the account UI. The Sentry
disclosure is also stronger than the implemented scrubber can prove.

**US-only launch is also UNVERIFIED.** CCPA applicability cannot be decided from
the repository because the legal entity, revenue, California record counts, and
sale/share facts are absent. Other state-law scope cannot be assessed for the
same reason. Even where a privacy statute does not apply, inaccurate public
privacy promises remain an FTC/deception risk.

No item below is treated as passing merely because the product is small or the
service is on a free plan.

## Regulator's first requests

A regulator should be expected to ask for the following documents immediately:

1. The controller's legal name, address, jurisdiction, privacy contact, and any
   representative or DPO details.
2. A record of processing activities: data category, source, purpose, legal
   basis, system, processor, location, retention, deletion method, and recipient.
3. Executed or incorporated DPAs and transfer mechanisms for every processor and
   subprocessor that can receive resume data.
4. Evidence that access, correction, export, deletion, objection, restriction,
   complaint, and consent-withdrawal requests are identified, authenticated,
   timed, fulfilled, and logged.
5. A privacy-incident register and a breach procedure capable of meeting the
   GDPR 72-hour supervisory-authority clock where applicable.
6. Evidence supporting each public promise, especially “Delete Everything,”
   retention periods, AI-provider use, and the statement that no resume content
   is sent to Sentry.

The initial repository could not produce items 1–5. The remediation completed
later on 2026-08-11 now supplies the processing inventory, rights runbook,
privacy-incident procedure, and DPIA screening. Controller facts, contracts,
dashboard evidence, live drills, and formal approval remain owner-controlled.

## Initial evidence-based checklist (pre-remediation snapshot)

The table below preserves what triggered the no-go. It is superseded for current
repository status by the remediation table that follows it; owner-controlled
FAIL/UNVERIFIED items remain open.

| Control | Status | Evidence | Required proof or remediation |
|---|---|---|---|
| Controller identity and contact details | **FAIL — BLOCKER** | `frontend/src/app/privacy/page.tsx` identifies only “ResumeAI” and `support@resumeai.cv`. It gives no legal entity, postal address, establishment/jurisdiction, EU/UK representative, or DPO basis. The Terms have the same defect. | Publish the actual legal controller and address. Determine establishment and whether an EU/UK representative or DPO is required. |
| Complete notice at collection | **FAIL — BLOCKER** | The policy omits or incompletely describes Google OAuth/profile and login metadata, newsletter preference, terms timestamp, quota ledger, detailed job notes, browser-only job data, and vendor error/telemetry data. It omits Render, the currently selected underlying inference provider, Google OAuth, and AdSense from the recipient list. | Build and approve a field-level processing inventory, then rewrite the notice from that inventory. Link the notice at every collection point. |
| Purpose and legal basis | **FAIL — BLOCKER for EEA/UK** | The policy says consent covers analytics/advertising and legitimate interests cover providing and securing the service. It does not separately map account creation, saved resumes, job tracking, AI inference, public sharing, support, security, and legal retention to a basis. Contract necessity is not addressed. No legitimate-interest assessment exists. | Map every purpose to a specific basis; document any legitimate-interest assessment and the consequences of withholding required data. |
| Special-category/sensitive resume content | **FAIL — BLOCKER** | Free-form resumes, job notes, and AI prompts can reveal health, disability, race/ethnicity, religion, political activity, union membership, sexual orientation, immigration facts, or government identifiers. There is no warning, exclusion, explicit-consent flow, Article 9 condition, or processor-routing control for this material. Both Vercel's and Sentry's public DPAs prohibit customers from submitting sensitive/special-category data. | Decide what data is permitted. Add collection minimization and user warnings/technical controls; establish the Article 9 or state-sensitive-data basis where required; keep prohibited data out of Vercel and Sentry or obtain a contract/architecture that expressly permits it. |
| Processor contracts | **FAIL — BLOCKER for EEA/UK** | Supabase and Render publish DPAs. Vercel's public DPA says it applies to Pro and Enterprise customers, while this deployment is documented as Hobby; that DPA also prohibits sensitive data, so upgrading alone would not close the content issue. Hugging Face says its DPA is available through Enterprise, while the current integration uses the inference router. No executed plan/DPA evidence is retained for Vercel or Hugging Face. | Use plans/contracts that provide an applicable Article 28 DPA, retain copies and effective dates, and record controller/processor roles. Separately satisfy provider content restrictions. Do not send EEA/UK resume data through an uncovered processor. |
| Stable AI subprocessor chain | **FAIL — BLOCKER** | `backend/app/services/ai/hf_client.py` uses `Qwen/Qwen2.5-7B-Instruct:fastest`. Hugging Face documents that `:fastest` automatically selects a provider; the current model page identifies Together AI, but that can change without a code deployment. The privacy notice names only Hugging Face and does not identify the current provider or routing variability. | Pin an approved provider or implement a controlled provider allowlist. Retain its DPA, region, subprocessor list, retention/training settings, and change-review evidence. Update the notice before provider changes. |
| International transfers and data location | **FAIL — BLOCKER for EEA/UK** | The policy gives no processing countries, transfer mechanism, adequacy/SCC basis, or way to obtain safeguards. Supabase project region, Vercel/Render processing locations, Sentry region, and AI-provider region are not evidenced in the repository. | Record each processing location and transfer mechanism, conduct any required transfer assessment, and disclose how users can obtain a copy of safeguards. |
| Data minimization and isolation | **PASS with residual risk** | Production RLS/isolation evidence passed 20/20 tests and six abuse controls. Public score lookup is single-record, uses a full UUID, and omits `user_id` and raw resume text. Backend access logs record bounded request metadata and not request bodies. | Preserve the production test evidence. Add regression tests whenever a table, RPC, log field, or share payload changes. |
| Public sharing transparency | **PASS with residual risk** | `ShareableScoreWidget.tsx` tells the user that anyone with the link can see the score and that it expires in 30 days. The payload contains score/grade and keyword findings, not the raw resume. | State in the privacy notice that this is public-by-link, list the exact fields, and preserve immediate revocation. |
| Retention schedule | **FAIL** | The policy covers saved resumes, job entries, and 30-day share access, but not exact retention for account/auth metadata, quota rows, application/security logs, Sentry, GA, AI routing/provider records, backups, or browser storage. It acknowledges expired share records may await cleanup without stating the cleanup interval. | Publish a category-level schedule with active, backup, log, and deletion-lag periods. Configure vendor settings to match and retain screenshots/exports as evidence. |
| Automated expiry | **PASS in production** | `.github/workflows/keepalive.yml` runs guarded cleanup. GitHub Actions run `31534423206` succeeded on 2026-08-11, including expired-share cleanup and backend health. Quota rows older than 31 days are also removed. | Alert on missed/failed runs and periodically prove that expired rows are actually absent, not merely that the workflow returned success. |
| User export/access | **FAIL** | `exportUserData` exports account email/creation time, profile, jobs, resumes/versions, and shares. It omits the quota ledger, user metadata such as newsletter and terms acceptance, OAuth/login metadata, sessions, application/security logs, vendor data, and local-only job records. No manual DSAR path exists for data that cannot be self-exported. | Distinguish “download product data” from a legal access response, or expand it. Add a documented DSAR workflow for all systems and processors, with identity verification and response logging. |
| Account deletion | **FAIL — BLOCKER** | Database cascade deletion is well tested for stored product tables, but the UI says “Delete Everything” and the policy says all associated data is removed. Deletion does not clear `resumeai_jobs`, cookie consent, or theme data in local storage; it does not prove erasure from backups, logs, GA/Sentry, Hugging Face, or the selected inference provider. | Narrow the promise to what is true and disclose deletion lag/legal exceptions. Clear product data from the browser, propagate deletion where data is retained by processors, and document backup expiry. |
| Rights handling | **FAIL — BLOCKER for EEA/UK; UNVERIFIED for US states** | The policy lists some rights but no submission/verification procedure, response deadline, authorized-agent process, correction/restriction/objection workflow, complaint authority, appeal process, or denial handling. California language omits correction, limitation of sensitive PI, and non-discrimination. | Create a DSAR runbook and request log. Publish applicable rights and mechanics by jurisdiction only after entity/scope facts are known. Test a complete request before launch. |
| Consent and withdrawal | **FAIL for advertising; PARTIAL for analytics** | `CookieConsent.tsx` offers one accept/reject choice for analytics and advertising together. GA is injected after acceptance, but the production AdSense script is included by `layout.tsx` before a choice. There is no granular purpose/vendor control or Global Privacy Control handling. | Gate all non-essential advertising storage/access behind a compliant CMP and applicable signals. Provide granular withdrawal as easily as acceptance. Gate 1(e) owns the advertising implementation decision. |
| Sentry content exclusion | **FAIL — BLOCKER** | The frontend/backend scrubbers remove request bodies and selected headers/fields, but do not prove removal from exception messages, breadcrumbs, contexts, tags, transactions, or span attributes. `hf_client.py` can place the provider's full unexpected response into a `RuntimeError`; Sentry can capture exception text. The Terms' absolute “No resume content is transmitted to Sentry” claim is therefore unsupported. | Stop including provider bodies in exceptions; scrub or disable telemetry on sensitive paths; add adversarial tests for every Sentry event surface; inspect and purge historical events if needed; rewrite the public claim to match proven behavior. |
| Privacy/security incident response | **FAIL — BLOCKER for EEA/UK** | `docs/INCIDENT-RESPONSE.md` covers outage, key, and abuse scenarios, not personal-data breach assessment. There is no privacy incident register, processor notification tree, 72-hour decision clock, authority notice template, high-risk user notice, or evidence-preservation procedure. | Add and tabletop a privacy-breach runbook. Record who decides reportability, when the clock starts, processor contacts, evidence, notifications, and post-incident corrective actions. |
| Backup accuracy and erasure | **FAIL** | `docs/POST-LAUNCH-MONITORING.md` says Supabase Free has daily backups. Gate 1(b) established that the Free plan has no scheduled backups and used owner-created logical/CSV backups. Retention and secure destruction for those manual backups are not documented. | Correct the runbook, inventory all manual backups, set access/retention/deletion controls, and test restoration without exposing production resume data. |
| Children/minors | **UNVERIFIED** | The service has no stated minimum age, parental-consent flow, or actual-knowledge procedure. A resume product is not inherently child-directed, but student users can include minors. | Set and enforce an age boundary appropriate to the intended audience; add a procedure for suspected under-age accounts and deletion. |
| Records of processing / DPIA | **FAIL — BLOCKER for EEA/UK launch** | No ROPA, data-protection impact assessment screening, or documented high-risk decision exists. The under-250 employee exception is not a safe assumption for regular processing of personal resumes and possible special-category data. | Complete a ROPA and a documented DPIA threshold assessment before accepting EEA/UK resume data. |
| Live consent/account verification | **UNVERIFIED** | The in-app browser was unavailable during this review. Bounded HTTP checks proved the deployed legal/auth pages and pre-consent AdSense script, but did not prove interactive consent withdrawal, OAuth notices, export contents, or deletion behavior in the deployed UI. | Repeat signed-in, browser-visible tests and retain screenshots/network evidence. UNVERIFIED remains no-go. |

## Repository remediation status

| Area | Repository status | Owner-controlled closure still required |
|---|---|---|
| Controller identity and age | **Code complete / owner blocker** | `legal.ts` makes Vercel Production fail closed until controller name, address, country, and minimum age are configured. Owner/counsel must supply and approve the facts. |
| Notice, purposes, recipients, transfers, retention | **Code complete / legal review pending** | Privacy and Terms now enumerate the actual data and processor chain, map purposes/bases, disclose transfers and deletion lag, and avoid absolute Sentry/deletion claims. Owner/counsel approves jurisdictional accuracy and vendor settings. |
| AI provider stability | **Code complete / contract pending** | Model routing is pinned to `Qwen/Qwen2.5-7B-Instruct:together`; tests prohibit `:fastest`. Owner obtains Hugging Face/Together contract, region, retention, ZDR/training and transfer proof. |
| Sentry content exclusion | **Code complete / historical review pending** | Backend and frontend rebuild events from a content-free allowlist, genericize exception values, disable traces, and test that adversarial sentinel data is absent. Owner inspects/purges historical events and records Sentry plan/region/retention. |
| Sensitive-data minimization | **Code complete / processor-content decision pending** | Collection surfaces warn against government IDs, financial, medical/disability and unnecessary sensitive data. Owner resolves Vercel/Sentry content restrictions and Article 9/state-sensitive-data basis. |
| Product export | **Code complete / live drill pending** | Export includes account/auth metadata, identities, profile, jobs, resumes/versions, shares, AI usage and browser-only jobs/preferences. Platform/vendor/support data follows the manual DSAR runbook. |
| Account deletion | **Code complete / live drill and vendor evidence pending** | The misleading button/copy is removed; successful deletion clears all three ResumeAI local-storage keys and the policy states log/vendor/backup limits. Owner proves the deployed cascade/browser behavior and processor retention. |
| Rights operations | **Runbook complete / drill pending** | `docs/PRIVACY-REQUESTS.md` defines deadlines, verification, system search, processors, appeals, secure response and evidence. Owner runs and records a synthetic case. |
| Consent | **Code complete / certified CMP owner work pending** | GA and AdSense scripts are independently gated; banner offers granular choices and withdrawal. Gate 1(e) owns certified CMP, TCF/GPC and regional-message proof. |
| Incident response | **Procedure complete / tabletop pending** | Incident plan now includes awareness time, 72-hour decision path, processor escalation, authority/user notices, evidence and non-reporting records. Owner runs a tabletop. |
| ROPA and DPIA | **Drafts complete / approval pending** | `docs/ROPA.md` and `docs/DPIA.md` record processing and risk. Owner fills vendor evidence and obtains qualified review/sign-off. |
| Backup statement | **Corrected / inventory pending** | Monitoring no longer claims Supabase Free scheduled backups. Owner inventories, protects, expires and proves destruction/restoration of manual backups. |
| Minors | **Code complete / age choice pending** | Production requires an owner-selected age from 13–18; sign-up and OAuth onboarding record confirmation and protected routes enforce it. Owner/counsel chooses the age and runs the under-age response drill. |
| Live behavior | **UNVERIFIED / NO-GO** | Local and then deployed signed-in export, deletion, OAuth eligibility, consent/network and policy/controller checks still require retained evidence. |

## Initial data-flow inventory found in code (pre-remediation snapshot)

| Data or action | Source | Storage / recipient | Current deletion/export boundary |
|---|---|---|---|
| Email, password hash, auth identity, sessions, login metadata | Sign-up/sign-in; Google OAuth | Supabase Auth; Google for OAuth | Auth identity is deleted by the database function; sessions/vendor metadata are not represented in self-export. |
| Full name, target role, industry, experience, onboarding state | Account setup | Supabase `profiles` | Database cascade; profile is exported. |
| Newsletter preference and terms-acceptance timestamp | Sign-up/setup | Supabase Auth user metadata | Deleted with auth identity, but not self-exported or accurately inventoried in the notice. |
| Resume identity/contact fields, summary, work, education, skills, full text, template | Resume builder/save | Browser; Vercel server action; Supabase `resumes` and immutable `resume_versions` | Saved versions cascade and are exported. Unsaved/browser state and processor copies are outside that proof. |
| Company, title, URL, status, notes, date, linked resume | Job tracker | Supabase `jobs` or browser `resumeai_jobs` fallback | Supabase rows cascade/export. Browser-only rows survive account deletion and are absent from export. |
| Job description, resume text, bullet points, skills, company, experience, tone, interests | AI tools | Browser to Render; Hugging Face router; dynamically selected inference provider | Not intentionally stored by the app. Provider/routing logs, retention settings, and deletion paths are not proven. |
| Score, grade, labels, matched/missing keywords, counts, role hint | Share action | Supabase `shared_scores`; public-by-link RPC | Owner revoke/cascade; scheduled 30-day expiry; included in export. |
| AI usage units and date | AI calls | Supabase `ai_usage_daily` | 31-day cleanup and account cascade; omitted from export. |
| IP, request path/method/status/duration, request ID, security/rate flags | Requests | Render application logs; platform/CDN logs | Request bodies are excluded in app logs. Exact platform retention and DSAR/deletion treatment are unverified. |
| Errors, performance traces, device/session telemetry | Runtime | Sentry | Scrubbing is incomplete for exception-derived content; region/retention and deletion propagation are unverified. |
| Analytics and advertising identifiers/events | Site visit | Google Analytics/AdSense and browser storage | GA consent is gated; AdSense script is not. Vendor retention/settings and rights workflow are unverified. |

## Five launch-blocking closure packages

### 1. Identify the controller and scope

- Supply legal entity name, postal address, establishment, target launch
  countries, revenue/record-count facts, and intended minimum user age.
- Obtain counsel's jurisdiction/scope decision. Do not use a generic worldwide
  rights paragraph as a substitute.

### 2. Make the processor chain defensible

- Inventory Vercel, Render, Supabase, Hugging Face, the pinned inference
  provider, Sentry, Google, Cloudflare, and email delivery.
- Retain applicable DPAs, subprocessors, regions, transfer mechanisms, plan
  names, and retention settings.
- Pin the AI provider; `:fastest` is not an auditable subprocessor policy.

### 3. Make public promises true

- Replace “Delete Everything” with an accurate scope and deletion timetable.
- Fix or qualify the Sentry claim only after technical remediation and event
  inspection.
- Rewrite the privacy notice from the approved processing inventory, including
  public-by-link sharing and international transfers.

### 4. Build real rights and incident operations

- Create a DSAR intake/authentication/fulfillment log and processor escalation
  procedure; run one access/export/correction/deletion drill.
- Create and tabletop a personal-data breach runbook, including the 72-hour
  assessment path where GDPR applies.

### 5. Prove the deployment, not only the repository

- Retain screenshots/settings for Supabase region and retention, Vercel plan,
  Render workspace/log retention, Sentry region/retention, GA retention,
  Hugging Face/provider privacy settings, and the production CMP.
- Re-run the live account/export/delete/consent tests with a synthetic account.

## Official references used for the control criteria

- European Commission, required transparency information:
  <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr/what-information-must-be-given-individuals-whose-data-collected_en>
- European Commission, controller/processor roles and obligations:
  <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/controllerprocessor/what-data-controller-or-data-processor_en>
- European Commission, international transfers:
  <https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations/what-rules-apply-if-my-organisation-transfers-data-outside-eu_en>
- European Commission, SME/record-keeping applicability:
  <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/application-regulation/do-rules-apply-smes_en>
- European Commission, breach notification and DPIA obligations:
  <https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en>
- California Privacy Protection Agency, CCPA thresholds and request mechanics:
  <https://cppa.ca.gov/faq>
- California Attorney General, consumer rights and response timing:
  <https://oag.ca.gov/privacy/ccpa>
- FTC privacy and data-security guidance:
  <https://www.ftc.gov/business-guidance/privacy-security>
- Hugging Face inference-provider security and routing:
  <https://huggingface.co/docs/inference-providers/security>
  and <https://huggingface.co/docs/inference-providers/en/index>
- Together AI privacy/security for the currently selected provider:
  <https://docs.together.ai/docs/privacy-and-security>
- Supabase DPA: <https://supabase.com/legal/customer-resources/data-processing-addendum>
- Render DPA: <https://render.com/dpa>
- Vercel DPA: <https://vercel.com/legal/dpa>
- Sentry DPA: <https://sentry.io/legal/dpa/>

## Gate result

Gate 1(d) remains **FAIL / NO-GO** as of 2026-08-11. Repository remediation is
complete and verified by focused tests, lint, and production build, but the
owner-controlled contracts, controller facts, vendor settings, live rights drill,
historical Sentry review, incident tabletop, and formal legal/DPIA approval are
not yet proven. `docs/GATE1D_OWNER_ACTIONS.md` is the closure checklist. Statements
from an operator or unchecked dashboard assumptions do not count as proof.
