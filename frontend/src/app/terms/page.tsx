import type { Metadata } from "next";
import Link from "next/link";
import { getLegalConfig } from "@/app/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of ResumeAI resume analysis, generation, storage, sharing, and export tools.",
  alternates: { canonical: "/terms" },
};

const heading = "font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3";
const text = "text-gray-600 dark:text-gray-300 leading-relaxed";
const list = "list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed";

export default function TermsOfService() {
  const legal = getLegalConfig();

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-6 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: August 12, 2026</p>
      </div>

      <div className="prose prose-gray dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className={heading}>1. Operator and acceptance</h2>
          <p className={text}>
            ResumeAI is operated by <strong>{legal.controllerName}</strong>, located at
            <strong> {legal.controllerAddress}</strong>, {legal.controllerCountry}. By creating an
            account or using resumeai.cv, you agree to these Terms and acknowledge the{" "}
            <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</Link>.
            If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className={heading}>2. Eligibility and accounts</h2>
          <ul className={list}>
            <li>You must be at least {legal.minimumAge} and legally able to accept these Terms.</li>
            <li>You must provide accurate account information and protect your credentials.</li>
            <li>OAuth users must confirm age and accept these Terms before entering the tools.</li>
            <li>You may not create accounts to evade quotas, suspensions, or security controls.</li>
          </ul>
        </section>

        <section>
          <h2 className={heading}>3. Service and limits</h2>
          <p className={text}>
            ResumeAI provides text-based ATS analysis, keyword and compliance tools, generative AI
            assistance, resume saving/versioning, PDF export, public-by-link score sharing, and job
            tracking. Access is subject to documented fair-use quotas, storage ceilings, rate limits,
            provider availability, and maintenance. Features may change or be withdrawn.
          </p>
        </section>

        <section>
          <h2 className={heading}>4. Your content and sensitive information</h2>
          <p className={text}>
            You retain responsibility for content you submit and confirm that you have permission to
            process it. Do not submit Social Security or government ID numbers, financial credentials,
            medical or disability information, immigration status or work-authorization documents,
            another person&apos;s confidential resume, or content not needed for the requested task.
            You grant ResumeAI and its processors the limited right to
            process submitted content solely to provide, secure, and support the service as described
            in the Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className={heading}>5. AI and ATS limitations</h2>
          <ul className={list}>
            <li>Generative output may be inaccurate, incomplete, generic, or inappropriate; review it before use.</li>
            <li>Do not fabricate credentials, employment, education, or achievements.</li>
            <li>Scores are directional estimates, not guarantees of interview or hiring outcomes.</li>
            <li>Text analysis cannot verify visual layout in the original PDF or document.</li>
            <li>Language and skill-taxonomy coverage is primarily English and may not fit every profession.</li>
          </ul>
        </section>

        <section>
          <h2 className={heading}>6. Sharing</h2>
          <p className={text}>
            A shareable score is public to anyone who obtains its link. It exposes the displayed score,
            grade, labels, and keyword findings but not the stored raw resume text. You are responsible
            for recipients. You may revoke a link; otherwise public access expires after 30 days.
          </p>
        </section>

        <section>
          <h2 className={heading}>7. Acceptable use</h2>
          <ul className={list}>
            <li>Do not attack, scrape, reverse engineer, overload, or bypass access controls.</li>
            <li>Do not use automation outside normal product operation or create deceptive accounts.</li>
            <li>Do not submit unlawful, infringing, malicious, defamatory, or unauthorized personal data.</li>
            <li>Do not resell the service or misrepresent its output as professional, legal, or hiring advice.</li>
          </ul>
        </section>

        <section>
          <h2 className={heading}>8. Privacy, diagnostics and deletion</h2>
          <p className={text}>
            Data handling is described in the Privacy Policy. Sentry diagnostics are reduced to an
            allowlisted envelope with generic exception text and source locations; requests, user data,
            breadcrumbs, contexts, tags, extras, and performance traces are excluded. Account deletion
            removes active account-owned database records and clears ResumeAI storage in that browser.
            Infrastructure logs, vendor records, legal/security records, and backups follow their stated
            retention and deletion capabilities; deletion is not represented as instantaneous universal erasure.
          </p>
        </section>

        <section>
          <h2 className={heading}>9. Suspension and termination</h2>
          <p className={text}>
            You may delete your account from the Account page. We may restrict or terminate access for
            material breach, abuse, security risk, legal requirement, or service discontinuation. Where
            practicable and lawful, we will provide notice and an opportunity to export product data.
          </p>
        </section>

        <section>
          <h2 className={heading}>10. Disclaimers and liability</h2>
          <p className={text}>
            The service is provided “as is” and “as available” to the extent permitted by law. ResumeAI
            does not guarantee uninterrupted availability, a particular ATS result, employment, or the
            accuracy of AI output. Nothing in these Terms excludes rights or liability that cannot
            lawfully be excluded.
          </p>
          <p className={text}>
            These Terms are governed by the laws of the State of Illinois, United States, except
            where mandatory consumer or data-protection law in your jurisdiction provides stronger
            rights. Any dispute arising from these Terms or the service is subject to the
            non-exclusive jurisdiction of courts in Cook County, Illinois, except where mandatory
            local law provides otherwise. To the fullest extent permitted by applicable law, our
            aggregate liability for any claim arising from these Terms or the service is limited to
            the greater of: (a) amounts you paid us in the twelve months before the claim, or
            (b) US $50.
          </p>
        </section>

        <section>
          <h2 className={heading}>11. Changes and contact</h2>
          <p className={text}>
            Material changes will be dated and communicated when required. Questions or legal notices
            may be sent to{" "}
            <a href="mailto:support@resumeai.cv" className="text-indigo-600 dark:text-indigo-400 underline">
              support@resumeai.cv
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
