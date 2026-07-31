import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ResumeAI terms of service. Understand the rules and guidelines for using our free ATS resume tools.",
};

export default function TermsOfService() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition mb-6 inline-block">&larr; Back to home</Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Last updated: July 30, 2026</p>
      </div>

      <div className="prose prose-gray dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using ResumeAI at resumeai.cv (&ldquo;the Service&rdquo;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            ResumeAI provides free ATS (Applicant Tracking System) resume optimization tools, including keyword extraction,
            gap analysis, compliance checking, AI-powered text generation, PDF export, and job application tracking.
            Resume matching uses a curated skill taxonomy with synonym matching, and PDF exports are generated with fpdf2.
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Accounts</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li>You must provide a valid email address to create an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must not create accounts for fraudulent or abusive purposes</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">4. Acceptable Use</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to exploit, hack, or disrupt the Service</li>
            <li>Submit content that is defamatory, harassing, or violates third-party rights</li>
            <li>Use automated scripts or bots to access the Service beyond normal usage</li>
            <li>Resell or redistribute the Service without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">5. Your Content</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              You retain ownership of all content you submit to the Service (resume text, job descriptions, bullet points).
              We do not claim any rights to your content. You are responsible for the accuracy of resume content you store
              or use through the Service.
            </p>
            <p>
              Your resume content is stored only when you explicitly use the saved-resume feature. Saved content may include
              personal information, work history, education, and skills, and is stored in Supabase&apos;s PostgreSQL database on
              the same infrastructure as your other account data. Each save creates an immutable, timestamped version snapshot;
              older versions remain available until you delete the resume or your account.
            </p>
            <p>
              Deleting a resume removes it and all of its versions. Account deletion removes all resumes, all version snapshots,
              jobs, profile data, and your authentication identity. Your JSON data export includes your account email and creation
              date, profile, jobs, saved-resume metadata, and all resume version snapshots. When you create a shareable ATS score
              link, the score and matched and missing keyword lists expire 30 days after creation; expired records are removed by
              the cleanup process based on their expiration timestamp.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">6. AI-Generated Content</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Hugging Face is our AI inference provider for summaries, rewritten bullets, and cover letters. Content generated
            by these tools is provided as a starting point.
            You are responsible for reviewing and editing all AI-generated content before using it. We do not guarantee
            that AI-generated content is accurate, complete, or free from errors. AI outputs should not be used verbatim
            without review.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            When our AI provider experiences sustained outages, the system temporarily pauses AI requests to prevent degraded responses, automatically recovering when service is restored.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            We use Sentry for backend error tracking. No resume content is transmitted to Sentry.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">7. No Guarantees</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            ResumeAI is a tool to help optimize your resume for ATS systems. We do not guarantee that using our tools will
            result in job interviews, job offers, or any specific outcome. ATS scoring is directional and varies by vendor.
            Your career outcomes depend on many factors beyond resume formatting and keywords.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">8. Service Availability</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily
            unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify,
            suspend, or discontinue any part of the Service at any time. Tool endpoints are subject to route-specific request
            limits, and the backend also enforces a global limit of 200 requests per minute per IP address. Requests that exceed
            an applicable limit may be temporarily rejected.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">9. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            To the maximum extent permitted by law, ResumeAI and its contributors shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the Service. The Service is provided
            free of charge, and our total liability shall not exceed the amount you paid for the Service (which is zero).
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">10. Free Service</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            ResumeAI is provided free of charge. The Service at resumeai.cv is governed by these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">11. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may update these Terms from time to time. Changes will be posted on this page with an updated
            &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance
            of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">12. Contact</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have questions about these Terms, please email us at{" "}
            <a href="mailto:lnbingi.work@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              lnbingi.work@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
