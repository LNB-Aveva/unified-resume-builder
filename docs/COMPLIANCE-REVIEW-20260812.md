# Internal Compliance Issue-Spotting Review — ResumeAI

**Product:** ResumeAI (resumeai.cv)
**Review date:** 2026-08-12
**Review scope:** US-focused, ad-free launch
**Materials reviewed:** GATE1D_LAUNCH_SCOPE_DECISION.md, GATE1D_DATA_HANDLING.md,
GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md, ROPA.md, DPIA.md, PRIVACY-REQUESTS.md,
INCIDENT-RESPONSE.md, production Privacy Policy, production Terms of Service
**Method:** Internal document analysis against primary statutory sources and regulator guidance.
Primary sources are cited with direct links.

This is an internal issue-spotting record, not legal advice or counsel approval. It does
not create an attorney-client relationship or determine jurisdiction-specific legal
questions. Gate 1(d)'s qualified-review and owner-evidence items remain open.

---

## A. Executive Verdict

**INTERNAL CONDITIONAL ASSESSMENT — NOT LEGAL CLEARANCE** for the US-focused,
ad-free launch.

Five accuracy issues were identified in the Privacy Policy and Terms. All five were
corrected on 2026-08-12. The changes improve alignment between the public pages and
documented processing. Procedures for rights requests, incidents, processing records,
and impact assessment are in place. This review does not establish that every law is
inapplicable or that the remaining owner-controlled risks are legally accepted.

---

## B. Jurisdiction and Applicability Matrix

| Law | Threshold | Applies? | Factual basis |
|---|---|---|---|
| FTC Act § 5 (15 U.S.C. § 45) | All US businesses — no threshold | **YES** | Controller in Illinois; service operates in US commerce |
| COPPA (15 U.S.C. § 6501; 16 C.F.R. Part 312) | Service directed to children under 13, OR actual knowledge of under-13 user | **Not indicated on documented facts; monitor** | Resume/career service is not designed for children; age-16 self-attestation is enforced at sign-up, but actual knowledge would require reassessment |
| Illinois PIPA (815 ILCS 530) | Collects PI of Illinois residents — no revenue floor | **YES** | Controller established in Illinois; breach-notification obligation applies |
| Illinois BIPA (740 ILCS 14) | Collection of biometric identifiers or information | **NO** | No biometric data collected |
| CCPA/CPRA (Cal. Civ. Code § 1798.100) | $26.625M annual gross revenue (effective 2025); OR buys, sells, or shares PI of 100,000+ CA consumers/households; OR 50%+ revenue from selling or sharing PI | **Not indicated on recorded metrics** | Reassess against actual annual revenue, California volume, and sale/sharing facts |
| Virginia CDPA (Va. Code § 59.1-575) | PI of 100,000+ VA consumers, or 25,000+ with 50%+ data revenue | **NO** | Below threshold |
| Other state comprehensive privacy laws | Thresholds, exemptions, and duties vary by state | **Not determined collectively** | Maintain actual state/consumer/revenue metrics and reassess individually; do not use one 100,000-consumer test for every state |
| Nevada SB 220 | Sale of covered information | **NO** | No sale of personal information occurs |
| GDPR (EU 2016/679, Art. 3(2)) | Offering goods/services to EEA persons OR monitoring EEA behavior | **Targeting not established on recorded facts; qualified review pending** | Active EEA marketing is deferred; reassess actual users, marketing, monitoring, and regional features |
| UK GDPR | Similar territorial-scope analysis | **Targeting not established on recorded facts; qualified review pending** | Active UK marketing is deferred; reassess before regional activity |

Primary sources:
- FTC Act: https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act (accessed 2026-08-12)
- COPPA Rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa (accessed 2026-08-12)
- Illinois PIPA: https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2702 (accessed 2026-08-12)
- CCPA thresholds: https://cppa.ca.gov/faq (accessed 2026-08-12)
- EDPB Guidelines 3/2018: https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3_en (accessed 2026-08-12)

---

## C. Finding Table

| # | Severity | Area | Controlling authority | Finding | Launch block? | Status |
|---|---|---|---|---|---|---|
| F1 | Moderate | Privacy Policy § 6 | FTC Act § 5 deception standard | "Where required, transfers rely on…standard contractual clauses" implied operator-executed SCCs. Transfer mechanisms are processor-level only; operator has not documented executed SCCs. Statement could mislead users into believing their data has protections not verified to be in place. | No | **CORRECTED 2026-08-12** |
| F2 | Moderate | Terms § 10 | Contract drafting | Governing-law and non-exclusive Illinois forum language was added with mandatory-law carve-outs. Its enforceability remains a qualified-review question. | No | **TEXT ADDED; REVIEW PENDING** |
| F3 | Moderate | Terms § 10 | Contract drafting | A US $50 minimum aggregate-liability cap was added with a non-waivable-rights carve-out. Its enforceability and suitability remain qualified-review questions. | No | **TEXT ADDED; REVIEW PENDING** |
| F4 | Low | Privacy Policy § 11 | Transparency | FTC and state complaint routes were added as optional user guidance; this review does not claim the sentence is universally required. | No | **ADDED 2026-08-12** |
| F5 | Low | Privacy § 2, Terms § 4 | Data minimization | Immigration/work-authorization documents may contain government identifiers or other sensitive content even though immigration status itself is not categorically covered by Illinois PIPA's breach definition. The warnings now discourage submission. | No | **IMPROVED 2026-08-12** |
| F6 | Low/operational | INCIDENT-RESPONSE.md | Operational hygiene | A private alert address appeared in a tracked runbook. The current file now refers only to an out-of-repository private alert mailbox; prior Git history is unchanged. | No | **CURRENT FILE CORRECTED 2026-08-12** |
| F7 | Owner-controlled | Processor contracts | FTC § 5 accuracy | HF/Together DPA for routed traffic not documented; Vercel Hobby plan may not be covered by Vercel DPA; Sentry historical events not reviewed. Items documented in GATE1D_OWNER_ACTIONS.md. | No (EEA gating required) | Open — owner |
| F8 | Owner-controlled | Operational drills | FTC § 5 accuracy | DSAR, consent/GPC, and incident tabletop not yet completed. Policy accurately describes procedures; gap is operational, not disclosure. | No | Open — owner |

---

## D. Applied Redlines

### Privacy Policy — Section 2 (prohibited data warning)
Added "immigration status or work-authorization documents" to the prohibited-data list.

### Privacy Policy — Section 6 (International Transfers)
Replaced claim of operator-level SCCs with accurate description of processor-level transfer
arrangements and US-focused launch scope. Added direct contact link.

### Privacy Policy — Section 11 (Rights)
Added FTC complaint route paragraph at end of section, with link to reportfraud.ftc.gov
and reference to state attorneys general.

### Privacy Policy — Last updated date
Updated from August 11, 2026 to August 12, 2026.

### Terms — Section 4 (Prohibited content)
Added "immigration status or work-authorization documents" to the prohibited-content list.

### Terms — Section 10 (Disclaimers and liability)
Replaced vague "governing law and forum" sentence with:
- Express Illinois governing law with mandatory-law carve-out
- Non-exclusive Illinois jurisdiction with mandatory-law carve-out
- Aggregate liability cap: greater of amounts paid in prior 12 months or US $50

### Terms — Last updated date
Updated from August 11, 2026 to August 12, 2026.

---

## E. Minors and COPPA

**Internal conclusion: COPPA applicability is not indicated by the documented product
design; age 16 is a conservative product boundary, not a legal clearance.**

COPPA (15 U.S.C. § 6501 et seq.; 16 C.F.R. Part 312, amended effective 2025-06-23,
90 Fed. Reg. 2460) applies to operators of websites or online services that are directed
to children under 13, or that have actual knowledge that a child under 13 is using the
service.

The FTC's multi-factor test for "directed to children" (16 C.F.R. § 312.2) considers:
subject matter, visual/audio content, use of animated characters, celebrities or music
popular with children, language, advertising, and whether empirical evidence shows a
significant portion of users are children. A resume/career/job-search service meets none
of these factors. The service's subject matter — professional resume building, ATS
analysis, and job application tracking — is oriented toward careers rather than children.

The 2025 COPPA amendment expanded parental-consent protections for under-13 children in
targeted advertising contexts. It does not extend COPPA's requirements to career services
or require parental consent for teen users aged 13–17.

Age 16 exceeds COPPA's under-13 boundary. Sign-up records a self-attestation rather than
a date of birth, and OAuth onboarding gates tools until acceptance. Actual knowledge of
an under-13 user, product changes directed toward children, or applicable state teen-
privacy rules would require reassessment. No test should fabricate a birth year because
the product does not collect one.

Sources:
- COPPA Rule text: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312 (accessed 2026-08-12)
- FTC COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions (accessed 2026-08-12)
- 2025 COPPA amendment: 90 Fed. Reg. 2460 (2025-01-14)

---

## F. Sensitive-Data Conclusion

**Internal conclusion: minimization warnings improved; processor and jurisdictional
questions remain open.**

Under CCPA/CPRA (Cal. Civ. Code § 1798.121), "sensitive personal information" is a
defined category comprising: SSN, driver's license/state ID/passport number, financial
account credentials, precise geolocation, racial/ethnic origin, religious beliefs, union
membership, contents of personal communications, genetic data, biometric data, health/sex
life/sexual orientation data. Employment history and resume content are ordinary personal
information — not SPI — under this definition.

Under Illinois PIPA (815 ILCS 530/5), personal information whose breach triggers
notification is: last name plus first name or initial combined with SSN, driver's license/
state ID number, financial account credentials, medical or health insurance information,
username/email with password or security question, or biometric data. Employment history
is not listed. Immigration status and work-authorization documents (e.g., visa type, I-9
eligibility, work permit numbers) can contain SSNs or government ID numbers that would
trigger Illinois PIPA breach notification if exposed. These are now listed in the
prohibited-data warnings in both the Privacy Policy and Terms (F5 corrected).

Warnings at collection points and Sentry allowlist scrubbing reduce risk, but warnings do
not prove that each processor contract permits incidental sensitive content or determine
whether additional technical controls are required under every applicable law.

For EEA expansion (deferred): GDPR Article 9 requires an explicit legal condition for
processing special-category data (racial/ethnic origin, health, religious beliefs, union
membership, etc.) that may appear in free-form resumes. This must be addressed in the
DPIA before EEA marketing begins.

Sources:
- CCPA SPI definition: https://oag.ca.gov/privacy/ccpa (accessed 2026-08-12)
- Illinois PIPA: https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2702 (accessed 2026-08-12)

---

## G. EEA/UK Territorial Scope, Representative, and DPO

**Internal conclusion: current records do not establish EEA/UK targeting; representative
and DPO determinations remain subject to qualified review and actual operating facts.**

**GDPR territorial scope (Art. 3(2)):** GDPR applies to non-EU controllers that "offer
goods or services" to EEA data subjects or monitor their behavior in the Union. EDPB
Guidelines 3/2018 on territorial scope (§§ 18–22) require "envisaging" EEA users as
evidence of intent to offer — factors include EU-targeted advertising, EU-currency pricing,
EU-language content, EU TLD, and direct mentions of EU users. None of these are present.
The US-focused scope decision is recorded in GATE1D_LAUNCH_SCOPE_DECISION.md. Incidental
organic access by EEA users does not constitute targeting.

**UK GDPR:** The recorded scope similarly defers UK marketing. Actual UK offering or
monitoring facts must be reassessed.

**DPO (GDPR Art. 37):** Required for public authorities, large-scale systematic
monitoring of individuals, or large-scale processing of special-category data. The
documented current scale does not indicate those triggers, but this is not a final legal
determination.

**EEA Article 27 representative:** The recorded US-focused scope does not establish the
targeting predicate. Reassess before EEA activity or if actual operating facts change.

**UK representative:** Apply the same fact-dependent reassessment for UK activity.

**Mandatory reassessment trigger:** Any EU/UK-targeted advertisement, EU-language landing
page, EU-currency pricing, or EU-region product decision requires reopening this analysis
before the activity launches.

Sources:
- GDPR Art. 3: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679 (accessed 2026-08-12)
- EDPB Guidelines 3/2018: https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3_en (accessed 2026-08-12)
- ICO guidance on UK GDPR scope: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/key-data-protection-themes/guide-to-the-uk-gdpr/ (accessed 2026-08-12)

---

## H. Open and Unresolved Risks

The following risks are known and documented. This internal review does not accept them
as a matter of law or establish that they present no enforcement risk. Address them using
the evidence requirements in GATE1D_OWNER_ACTIONS.md.

| Risk | Reference | Priority |
|---|---|---|
| HF/Together AI contracts for routed traffic not yet documented | GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md | Before EEA marketing |
| Vercel Hobby plan / DPA coverage not resolved | GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md | Before EEA marketing |
| Sentry pre-allowlist historical events not reviewed or purged | GATE1D_DATA_HANDLING.md | Owner checklist |
| Live DSAR drill not yet completed | GATE1D_OWNER_ACTIONS.md § 4 | Owner checklist |
| Consent/GPC browser drill not yet completed | GATE1D_OWNER_ACTIONS.md § 5 | Owner checklist |
| Incident tabletop not yet run | GATE1D_OWNER_ACTIONS.md § 6 | Owner checklist |
| Individual operator structure and liability | Qualified business/legal advice unavailable | Unresolved |

---

## J. Repository Changes Checklist

- [x] Privacy Policy § 2 — Added immigration documents to prohibited-data list
- [x] Privacy Policy § 6 — Rewrote international-transfers section; removed SCC implication; reflects processor-level arrangements and US-focused scope
- [x] Privacy Policy § 11 — Added FTC and state AG complaint route
- [x] Privacy Policy — Last updated date: August 12, 2026
- [x] Terms § 4 — Added immigration documents to prohibited-content list
- [x] Terms § 10 — Added Illinois governing law, non-exclusive Illinois jurisdiction, and US $50 aggregate liability cap; qualified review remains pending
- [x] Terms — Last updated date: August 12, 2026
- [x] This internal review document created at docs/COMPLIANCE-REVIEW-20260812.md
- [ ] Owner: Privately confirm that the published controller address is suitable and intentionally public; use an authorized business mailing address if desired
- [ ] Owner: Complete items in GATE1D_OWNER_ACTIONS.md §§ 2–6
