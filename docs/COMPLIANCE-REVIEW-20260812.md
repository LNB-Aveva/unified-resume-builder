# AI-Assisted Internal Compliance Review — ResumeAI

**Product:** ResumeAI (resumeai.cv)
**Review date:** 2026-08-12
**Review scope:** US-focused, ad-free launch
**Materials reviewed:** GATE1D_LAUNCH_SCOPE_DECISION.md, GATE1D_DATA_HANDLING.md,
GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md, ROPA.md, DPIA.md, PRIVACY-REQUESTS.md,
INCIDENT-RESPONSE.md, production Privacy Policy, production Terms of Service
**Method:** Document analysis against primary US statutory sources and regulator guidance.
Primary sources are cited with direct links.

This is an AI-assisted internal compliance analysis. It does not constitute legal
advice, does not create an attorney-client relationship, and does not substitute for a
determination by a licensed attorney on jurisdiction-specific questions.

---

## A. Executive Verdict

**ACCEPTABLE WITH DOCUMENTED RESIDUAL RISK** for the US-focused, ad-free launch.

Five accuracy issues were identified in the Privacy Policy and Terms. All five were
corrected on 2026-08-12. After correction, the public legal pages accurately describe
the service's documented processing. Procedures for rights requests, incidents,
processing records, and impact assessment are in place. Residual risks in Section H
are owner-controlled, acknowledged, and do not create an immediate FTC or Illinois
PIPA enforcement risk at current scale.

---

## B. Jurisdiction and Applicability Matrix

| Law | Threshold | Applies? | Factual basis |
|---|---|---|---|
| FTC Act § 5 (15 U.S.C. § 45) | All US businesses — no threshold | **YES** | Controller in Illinois; service operates in US commerce |
| COPPA (15 U.S.C. § 6501; 16 C.F.R. Part 312) | Service directed to children under 13, OR actual knowledge of under-13 user | **NO** | Resume/career service not directed to children; age-16 gate enforced at sign-up |
| Illinois PIPA (815 ILCS 530) | Collects PI of Illinois residents — no revenue floor | **YES** | Controller established in Illinois; breach-notification obligation applies |
| Illinois BIPA (740 ILCS 14) | Collection of biometric identifiers or information | **NO** | No biometric data collected |
| CCPA/CPRA (Cal. Civ. Code § 1798.100) | >$25M revenue; OR buys/sells PI of 100,000+ CA consumers; OR 50%+ revenue from data sale | **NO** (current scale) | Free SaaS, zero revenue; below all three thresholds. California rights language in policy is voluntary best practice |
| Virginia CDPA (Va. Code § 59.1-575) | PI of 100,000+ VA consumers, or 25,000+ with 50%+ data revenue | **NO** | Below threshold |
| Colorado CPA, Texas TDPSA, CT CTDPA | 100,000+ consumer thresholds | **NO** | Below threshold |
| Nevada SB 220 | Sale of covered information | **NO** | No sale of personal information occurs |
| GDPR (EU 2016/679, Art. 3(2)) | Offering goods/services to EEA persons OR monitoring EEA behavior | **NOT YET** | Active EEA marketing deferred per GATE1D_LAUNCH_SCOPE_DECISION.md; incidental organic access does not constitute "offering" per EDPB Guidelines 3/2018 §§ 18–22 |
| UK GDPR (retained by EU Withdrawal Act 2018) | Same targeting analysis | **NOT YET** | Same — UK marketing deferred |

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
| F2 | Moderate | Terms § 10 | FTC Act § 5; Illinois contract law | No governing law or jurisdiction specified. Creates ambiguity if a dispute arises; higher litigation risk for individual operator. | No | **CORRECTED 2026-08-12** |
| F3 | Moderate | Terms § 10 | Contract law; FTC § 5 | No liability cap. Individual operator has uncapped personal financial exposure for claims from free-tier users. | No | **CORRECTED 2026-08-12** |
| F4 | Low | Privacy Policy § 11 | FTC business guidance on privacy notices | No reference to FTC or state AG complaint channels. FTC guidance on privacy notices recommends disclosing complaint routes. | No | **CORRECTED 2026-08-12** |
| F5 | Low | Privacy § 2, Terms § 4 | FTC § 5; Illinois PIPA § 5 definition of PI | Immigration status and work-authorization documents absent from prohibited-data list. These are sensitive under Illinois PIPA's PI definition and commonly found in non-citizen job-seeker resumes. | No | **CORRECTED 2026-08-12** |
| F6 | Low/operational | INCIDENT-RESPONSE.md | Operational hygiene | Private Gmail address committed to internal repository document. Not a public page; low immediate risk. | No | Owner decision |
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
- Non-exclusive Cook County jurisdiction with mandatory-law carve-out
- Aggregate liability cap: greater of amounts paid in prior 12 months or US $50

### Terms — Last updated date
Updated from August 11, 2026 to August 12, 2026.

---

## E. Minors and COPPA

**Conclusion: COPPA does not apply. Minimum age 16 is legally defensible.**

COPPA (15 U.S.C. § 6501 et seq.; 16 C.F.R. Part 312, amended effective 2025-06-23,
90 Fed. Reg. 2460) applies to operators of websites or online services that are directed
to children under 13, or that have actual knowledge that a child under 13 is using the
service.

The FTC's multi-factor test for "directed to children" (16 C.F.R. § 312.2) considers:
subject matter, visual/audio content, use of animated characters, celebrities or music
popular with children, language, advertising, and whether empirical evidence shows a
significant portion of users are children. A resume/career/job-search service meets none
of these factors. The service's subject matter — professional resume building, ATS
analysis, job application tracking — is inherently adult- and career-oriented.

The 2025 COPPA amendment expanded parental-consent protections for under-13 children in
targeted advertising contexts. It does not extend COPPA's requirements to career services
or require parental consent for teen users aged 13–17.

Age 16 exceeds COPPA's 13-year floor, aligns with common professional-service minimums,
and corresponds to US minimum working age for most employment categories (29 U.S.C.
§ 203(l); 29 C.F.R. Part 570). Sign-up records age confirmation; OAuth onboarding gates
tools until acceptance; the deletion procedure for under-age accounts is documented.

No parental consent mechanism is required. The choice of minimum age 16 is appropriate
and defensible.

Sources:
- COPPA Rule text: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312 (accessed 2026-08-12)
- FTC COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions (accessed 2026-08-12)
- 2025 COPPA amendment: 90 Fed. Reg. 2460 (2025-01-14)

---

## F. Sensitive-Data Conclusion

**Conclusion: PASS for US-focused launch. Immigration-document gap corrected.**

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

The service's current approach — warnings at data collection points plus Sentry allowlist
scrubbing — is legally adequate for US law at this scale and subject matter. No technical
block is legally required; the warning plus user responsibility allocation is standard US
SaaS practice.

For EEA expansion (deferred): GDPR Article 9 requires an explicit legal condition for
processing special-category data (racial/ethnic origin, health, religious beliefs, union
membership, etc.) that may appear in free-form resumes. This must be addressed in the
DPIA before EEA marketing begins.

Sources:
- CCPA SPI definition: https://oag.ca.gov/privacy/ccpa (accessed 2026-08-12)
- Illinois PIPA: https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2702 (accessed 2026-08-12)

---

## G. EEA/UK Territorial Scope, Representative, and DPO

**Conclusion: No DPO, EEA representative, or UK representative is currently required.**

**GDPR territorial scope (Art. 3(2)):** GDPR applies to non-EU controllers that "offer
goods or services" to EEA data subjects or monitor their behavior in the Union. EDPB
Guidelines 3/2018 on territorial scope (§§ 18–22) require "envisaging" EEA users as
evidence of intent to offer — factors include EU-targeted advertising, EU-currency pricing,
EU-language content, EU TLD, and direct mentions of EU users. None of these are present.
The US-focused scope decision is recorded in GATE1D_LAUNCH_SCOPE_DECISION.md. Incidental
organic access by EEA users does not constitute targeting.

**UK GDPR (Art. 3(2), as retained):** Same analysis. UK marketing is deferred. Not
applicable.

**DPO (GDPR Art. 37):** Required for public authorities, large-scale systematic
monitoring of individuals, or large-scale processing of special-category data. This small
US SaaS meets none of these criteria. No DPO is required.

**EEA Article 27 representative:** Required for non-EU controllers meeting the targeting
test. Targeting test is not met. Not required.

**UK Article 27 representative:** Same analysis. Not required.

**Mandatory reassessment trigger:** Any EU/UK-targeted advertisement, EU-language landing
page, EU-currency pricing, or EU-region product decision requires reopening this analysis
before the activity launches.

Sources:
- GDPR Art. 3: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679 (accessed 2026-08-12)
- EDPB Guidelines 3/2018: https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3_en (accessed 2026-08-12)
- ICO guidance on UK GDPR scope: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/key-data-protection-themes/guide-to-the-uk-gdpr/ (accessed 2026-08-12)

---

## H. Accepted Residual Risks

The following risks are known, documented, and accepted for the US-focused, ad-free
launch. They do not create immediate enforcement risk but must be addressed per the owner
timeline in GATE1D_OWNER_ACTIONS.md.

| Risk | Reference | Priority |
|---|---|---|
| HF/Together AI contracts for routed traffic not yet documented | GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md | Before EEA marketing |
| Vercel Hobby plan / DPA coverage not resolved | GATE1D_PUBLIC_PROCESSOR_EVIDENCE.md | Before EEA marketing |
| Sentry pre-allowlist historical events not reviewed or purged | GATE1D_DATA_HANDLING.md | Within 30 days of launch |
| Live DSAR drill not yet completed | GATE1D_OWNER_ACTIONS.md § 4 | Before first external DSAR |
| Consent/GPC browser drill not yet completed | GATE1D_OWNER_ACTIONS.md § 5 | Within 14 days of launch |
| Incident tabletop not yet run | GATE1D_OWNER_ACTIONS.md § 6 | Within 60 days of launch |
| Individual operator (no LLC) — personal liability | Advisory | Before reaching 1,000 active users |

---

## J. Repository Changes Checklist

- [x] Privacy Policy § 2 — Added immigration documents to prohibited-data list
- [x] Privacy Policy § 6 — Rewrote international-transfers section; removed SCC implication; reflects processor-level arrangements and US-focused scope
- [x] Privacy Policy § 11 — Added FTC and state AG complaint route
- [x] Privacy Policy — Last updated date: August 12, 2026
- [x] Terms § 4 — Added immigration documents to prohibited-content list
- [x] Terms § 10 — Added Illinois governing law, non-exclusive Cook County jurisdiction, and US $50 aggregate liability cap
- [x] Terms — Last updated date: August 12, 2026
- [x] This review document created at docs/COMPLIANCE-REVIEW-20260812.md
- [ ] Owner: Set LEGAL_CONTROLLER_ADDRESS to a non-home postal address
- [ ] Owner: Complete items in GATE1D_OWNER_ACTIONS.md §§ 2–6
