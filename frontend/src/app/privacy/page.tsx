import type { Metadata } from "next";
import Link from "next/link";
import { getLegalConfig } from "@/app/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ResumeAI collects, uses, shares, retains, exports, and deletes personal data.",
  alternates: { canonical: "/privacy" },
};

const heading = "font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3";
const text = "text-gray-600 dark:text-gray-300 leading-relaxed";
const list = "list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3";

export default function PrivacyPolicy() {
  const legal = getLegalConfig();

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-6 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: August 12, 2026</p>
      </div>

      <div className="prose prose-gray dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className={heading}>1. Controller and contact</h2>
          <p className={text}>
            The controller for ResumeAI at resumeai.cv is <strong>{legal.controllerName}</strong>,
            located at <strong>{legal.controllerAddress}</strong>, {legal.controllerCountry}. Privacy
            and rights requests may be sent to{" "}
            <a href="mailto:support@resumeai.cv" className="text-indigo-600 dark:text-indigo-400 underline">
              support@resumeai.cv
            </a>.
          </p>
        </section>

        <section>
          <h2 className={heading}>2. Data we collect</h2>
          <ul className={list}>
            <li><strong>Account and authentication:</strong> user ID, email, optional phone, password hash, authentication provider, identity/profile metadata, confirmation and sign-in timestamps, sessions, newsletter choice, age confirmation, and Terms acceptance timestamp.</li>
            <li><strong>Profile:</strong> full name, target role, industry, years of experience, and onboarding status.</li>
            <li><strong>Resume and job-search content:</strong> contact details, summaries, employment, education, skills, resume text and versions, job descriptions, company/title/URL, application status, notes, and linked resume.</li>
            <li><strong>AI inputs and outputs:</strong> text supplied for summaries, cover letters, bullet rewrites, and the generated response. ResumeAI does not intentionally persist these request/response bodies unless you separately save them as product data.</li>
            <li><strong>Shared scores:</strong> score, grade, labels, matched and missing keywords, counts, and optional role hint. Raw resume text is not stored in a share record.</li>
            <li><strong>Usage and security:</strong> daily AI units, IP address, request method/path/status/duration, request ID, content length, authentication/rate-limit outcome, security signals, device/browser data, and consented analytics or advertising events.</li>
            <li><strong>Browser storage:</strong> cookie preferences, theme, and browser-only job tracker entries when cloud storage is unavailable.</li>
          </ul>
          <p className={`${text} mt-3`}>
            Resume text and free-form notes can reveal sensitive information. Do not submit Social
            Security or government ID numbers, financial credentials, medical or disability details,
            immigration status or work-authorization documents, or other information that is not
            needed for the requested task.
          </p>
        </section>

        <section>
          <h2 className={heading}>3. Purposes and legal bases</h2>
          <ul className={list}>
            <li><strong>Contract/service delivery:</strong> create and secure accounts; save, version, export, and delete product data; analyze resumes; create PDFs; track applications; and provide requested AI output.</li>
            <li><strong>Legitimate interests:</strong> prevent abuse, enforce fair-use limits, troubleshoot reliability, maintain bounded security logs, and defend the service, balanced against user privacy.</li>
            <li><strong>Consent:</strong> optional analytics, advertising, and newsletter choices. These choices can be withdrawn without affecting account functionality.</li>
            <li><strong>Legal obligations:</strong> preserve or disclose limited records when required by valid law, enforce legal claims, or respond to authorities.</li>
          </ul>
        </section>

        <section>
          <h2 className={heading}>4. AI processing</h2>
          <p className={text}>
            AI features send the submitted text over HTTPS to the ResumeAI backend on Render, then
            through the Hugging Face inference router to the pinned Together AI provider for the
            requested generation. The model/provider selection is code-controlled rather than using
            automatic fastest-provider routing. ResumeAI does not use inputs or outputs to train its
            own models. Hugging Face and Together AI may process limited operational records under
            their contracts, settings, and privacy terms. Local keyword, scoring, and compliance tools
            do not use the generative AI provider.
          </p>
        </section>

        <section>
          <h2 className={heading}>5. Recipients and processors</h2>
          <ul className={list}>
            <li><strong>Supabase:</strong> authentication, email delivery, PostgreSQL product data, and quota records.</li>
            <li><strong>Vercel:</strong> frontend hosting, server actions, deployment, and platform logs.</li>
            <li><strong>Render:</strong> backend API hosting and application/platform logs.</li>
            <li><strong>Hugging Face and Together AI:</strong> routed AI inference.</li>
            <li><strong>Sentry:</strong> content-reduced error diagnostics.</li>
            <li><strong>Cloudflare Turnstile:</strong> authentication-form bot and abuse checks.</li>
            <li><strong>Google:</strong> OAuth sign-in; and, only after the relevant choice, Analytics and AdSense.</li>
          </ul>
          <p className={`${text} mt-3`}>
            We do not sell personal information. Public-by-link score sharing is an intentional
            disclosure initiated by the user; anyone who obtains the link can view its score and
            keyword findings until revocation or expiry.
          </p>
        </section>

        <section>
          <h2 className={heading}>6. International transfers</h2>
          <p className={text}>
            These providers may process personal data in the United States and other countries where
            they or their subprocessors operate. ResumeAI is operated from the United States and its
            initial launch is US-focused. Safeguards depend on the provider, account plan, service
            configuration, and applicable law, and may include contractual transfer mechanisms.
            Contact{" "}
            <a href="mailto:support@resumeai.cv" className="text-indigo-600 dark:text-indigo-400 underline">
              support@resumeai.cv
            </a>{" "}
            to request information about the transfer arrangements applicable to your data.
          </p>
        </section>

        <section>
          <h2 className={heading}>7. Retention</h2>
          <ul className={list}>
            <li><strong>Account, profile, jobs, saved resumes and versions:</strong> until you delete the item or account, subject to backup and legal-retention lag.</li>
            <li><strong>Shared scores:</strong> public access ends after 30 days or immediate owner revocation; hourly maintenance removes expired database records.</li>
            <li><strong>AI usage ledger:</strong> rolling 31-day retention, or account deletion if earlier.</li>
            <li><strong>Browser-only data:</strong> until cleared in browser settings or by the account-deletion flow on that browser.</li>
            <li><strong>Application and platform logs, Sentry, Analytics, AI routing/provider records, and backups:</strong> according to the configured vendor retention and any shorter deletion request that the provider supports. Current settings are recorded in ResumeAI&apos;s internal processing register.</li>
            <li><strong>Legal/security hold:</strong> limited records may be retained longer when reasonably necessary for fraud, security, disputes, or law.</li>
          </ul>
        </section>

        <section>
          <h2 className={heading}>8. Security and error reporting</h2>
          <p className={text}>
            Controls include HTTPS, Supabase authentication and row-level security, restrictive share
            payloads, request/body limits, rate and quota controls, security headers, and tested
            account cascades. Application access logs exclude request bodies. Sentry receives an
            allowlisted error envelope: exception text, requests, headers, user data, breadcrumbs,
            contexts, tags, extras, and performance traces are removed or disabled. Source location
            and generic error type may be retained. No system can guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className={heading}>9. Cookies and optional storage</h2>
          <p className={text}>
            Authentication and security storage is necessary for the service. Google Analytics and
            Google AdSense are separate optional choices. Their scripts are not loaded until the
            corresponding choice is granted. Choices are stored in local storage under
            <code> cookie_consent</code> and can be changed from Cookie Settings in the footer.
            A browser Global Privacy Control signal disables advertising consent.
            Withdrawing a choice stops future optional loading after the page reloads; it does not
            erase data already held by a provider.
          </p>
        </section>

        <section>
          <h2 className={heading}>10. Export, correction and deletion</h2>
          <p className={text}>
            The Account page downloads product-held account/authentication metadata, profile, jobs,
            resumes and versions, shares, AI usage records, and browser-only tracker data. Profile and
            saved product data can be corrected in the product. Account deletion removes the active
            Supabase identity and cascades through owned database records, signs out, and clears
            ResumeAI browser storage on the browser used for deletion. It does not promise immediate
            erasure from security/legal records, vendor systems, or backups; those follow the schedule
            and provider capabilities above.
          </p>
        </section>

        <section>
          <h2 className={heading}>11. Privacy rights</h2>
          <p className={text}>
            Depending on applicable law, you may request access, correction, deletion, portability,
            restriction, objection, withdrawal of consent, information about recipients, or an appeal
            of a denied request. You may also have the right to complain to your local data-protection
            authority. California residents may have rights to know, correct, delete, opt out of sale
            or sharing, limit certain sensitive-data uses, and receive equal service where the relevant
            law applies. ResumeAI does not discriminate for exercising privacy rights.
          </p>
          <p className={`${text} mt-3`}>
            Submit a request from the account email to{" "}
            <a href="mailto:support@resumeai.cv?subject=Privacy%20rights%20request" className="text-indigo-600 dark:text-indigo-400 underline">
              support@resumeai.cv
            </a>. We will verify identity, acknowledge the request, search applicable systems and
            processors, and respond within the legally required period. Authorized agents must provide
            proof of authority. If we deny or limit a request, we will explain why and provide any
            available appeal route.
          </p>
          <p className={`${text} mt-3`}>
            You may also file a complaint with the US Federal Trade Commission at{" "}
            <a href="https://reportfraud.ftc.gov" className="text-indigo-600 dark:text-indigo-400 underline" rel="noopener noreferrer" target="_blank">
              reportfraud.ftc.gov
            </a>
            , or with your state&apos;s attorney general or data-protection authority.
          </p>
        </section>

        <section>
          <h2 className={heading}>12. Age eligibility</h2>
          <p className={text}>
            ResumeAI is not directed to children. You must be at least {legal.minimumAge} to create an
            account. If we learn that an account was created below the configured minimum age, we will
            disable it and delete the associated product data, subject to legal and security retention.
          </p>
        </section>

        <section>
          <h2 className={heading}>13. Changes and contact</h2>
          <p className={text}>
            Material changes will be dated here and, when required, communicated in the product or by
            email. Questions, complaints, and rights requests should be sent to{" "}
            <a href="mailto:support@resumeai.cv" className="text-indigo-600 dark:text-indigo-400 underline">
              support@resumeai.cv
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
