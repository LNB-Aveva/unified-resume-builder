import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ResumeAI privacy policy. Learn how we handle your data, what we collect, and how we protect your privacy.",
  openGraph: {
    title: "Privacy Policy — ResumeAI",
    description:
      "How ResumeAI handles saved resumes, AI processing, analytics, advertising, retention, export, and account deletion.",
  },
};

export default function PrivacyPolicy() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition mb-6 inline-block">&larr; Back to home</Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: July 30, 2026</p>
      </div>

      <div className="prose prose-gray dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            ResumeAI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website
            at resumeai.cv and our ATS resume tools.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Information We Collect</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Account Information</h3>
              <p>When you create an account, we collect your email address and password (hashed). This is managed securely through Supabase Authentication.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Resume Content</h3>
              <p>Text you paste into our tools (job descriptions, resume content, bullet points) is processed in your browser or sent to our backend API for analysis and AI features. We store resume content only when you explicitly use the saved-resume feature. When you use the shareable ATS score feature, we store the matched and missing keyword lists (not your resume text) for up to 30 days so the share link remains accessible.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Usage Data</h3>
              <p>After you consent, Google Analytics collects usage data such as pages visited, features used, and device type. For security, reliability, and rate limiting, our backend also processes request metadata including IP address, method, path, response status, and request duration. Resume and job-description content is not included in access logs.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Error Data</h3>
              <p>We use Sentry for frontend and backend error tracking. Our Sentry configuration removes request bodies, authentication headers, cookies, stack-frame variables, and other fields that could contain resume content before an event is sent.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Browser Storage</h3>
              <p>Resume drafts and preferences may be stored in your browser&apos;s localStorage. Job tracker data normally uses Supabase. If cloud storage is unavailable when the tracker opens, new browser-only entries may be stored locally and the page displays a warning. A failed cloud write is reported and is not presented as saved.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li>To provide and maintain our ATS resume tools</li>
            <li>To authenticate your account and manage sessions</li>
            <li>To process summary generation, bullet rewriting, and cover letter generation through our FastAPI backend using Hugging Face as the AI inference provider</li>
            <li>To analyze resume matches using a curated skill taxonomy with synonym matching and generate PDF exports with fpdf2</li>
            <li>To improve our website and user experience through anonymized analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Processing &amp; AI Features</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            When you use AI-powered tools (Summary Generator, Cover Letter Generator, Bullet Rewriter), your text is sent
            to our FastAPI backend and forwarded to Hugging Face&apos;s inference API for processing. This data is:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <li>Not stored or logged on our servers beyond the duration of the request</li>
            <li>Not used by ResumeAI to train our own models</li>
            <li>Transmitted securely over HTTPS</li>
            <li>Processed only for the purpose of generating your requested output</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            When our AI provider experiences sustained outages, the system temporarily pauses AI requests to prevent degraded responses, automatically recovering when service is restored.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            Hugging Face and the inference provider it routes the request to process the submitted text under their own terms and privacy practices. Do not submit information you do not want processed by those providers.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li><strong>Supabase</strong> &mdash; Authentication and storage for account data, saved resumes, and job tracking</li>
            <li><strong>Hugging Face</strong> &mdash; AI inference for summary generation, bullet rewriting, and cover letter generation</li>
            <li><strong>Sentry</strong> &mdash; Frontend and backend error tracking with application-level PII filtering</li>
            <li><strong>Vercel</strong> &mdash; Website hosting and deployment</li>
            <li><strong>Google Analytics</strong> &mdash; Anonymous usage analytics (loaded only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Security</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We implement appropriate security measures including HTTPS encryption, secure authentication via Supabase,
            Content Security Policy headers, and regular security audits. Tool endpoints have route-specific request limits,
            and the backend also applies a global limit of 200 requests per minute per IP address.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Retention</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>We retain your data according to the following schedule:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Account data</strong> (email, profile) &mdash; retained while your account is active and deleted when account deletion completes.</li>
              <li><strong>Job tracker entries</strong> &mdash; retained while your account is active. Deleted when you delete your account.</li>
              <li><strong>Saved resumes and versions</strong> &mdash; retained until you explicitly delete the resume or delete your account.</li>
              <li><strong>Shareable ATS score links</strong> &mdash; become inaccessible 30 days after creation. The underlying expired record may remain until maintenance cleanup or account deletion.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Saved Resumes and Version History</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              When you save a resume, we store its content, including personal information, work history, education,
              and skills, in Supabase&apos;s PostgreSQL database on the same infrastructure used for your other account data.
            </p>
            <p>
              Each save creates a new, immutable version snapshot with a timestamp. Previous versions cannot be changed
              and remain available to you until you delete the resume or your account. Deleting a resume removes that
              resume and all of its version snapshots.
            </p>
            <p>
              Deleting your account removes all saved resumes, all version snapshots, job tracker entries, profile data,
              and your authentication identity. Your JSON data export includes every saved resume and every version snapshot.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <li>Access your account information via the Account page</li>
            <li>Delete your account and all associated data (saved resumes and versions, job tracker entries, profile, and authentication identity) from the Account page</li>
            <li>Export your account email and creation date, profile, job tracker entries, saved-resume metadata, and every resume version snapshot from the Account page</li>
            <li>Withdraw cookie consent at any time by clicking the cookie settings link in the footer</li>
            <li>Clear your browser localStorage at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Cookies</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Essential cookies</strong> &mdash; required for authentication session management (via Supabase). These cannot be disabled.</li>
              <li><strong>Analytics cookies</strong> &mdash; Google Analytics (GA4) is loaded only after you choose Accept.</li>
              <li><strong>Advertising cookies</strong> &mdash; the Google AdSense site-verification script may load, but ResumeAI does not currently display ad units. Before ads are enabled, regions where Google requires a certified consent platform will use one.</li>
            </ul>
            <p>Your accepted or rejected choice is stored in your browser&apos;s localStorage under <code>cookie_consent</code>. You can reset that choice at any time using the cookie settings link in the site footer.</p>
            <p>
              If advertising is enabled, Google and other third-party vendors may use cookies to serve ads based on prior visits to this or other websites. You can manage personalized advertising in{" "}
              <a href="https://adssettings.google.com/" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2" rel="noopener noreferrer">
                Google Ads Settings
              </a>{" "}
              or review additional opt-out choices at{" "}
              <a href="https://www.aboutads.info/choices/" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2" rel="noopener noreferrer">
                YourAdChoices
              </a>.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">GDPR (European Users)</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you are in the European Economic Area, you have additional rights under the General Data Protection Regulation, including
            the right to access, rectify, port, and erase your personal data. Our legal basis for processing is your consent (for analytics and advertising)
            and legitimate interest (for providing and securing the service). To exercise your rights, use the Account page
            or contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">CCPA (California Users)</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you are a California resident, you have the right to know what personal information we collect, request its deletion,
            and opt out of the sale of personal information. We do not sell your personal information. To exercise your rights,
            use the Account page or contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Contact</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have questions about this Privacy Policy, please email us at{" "}
            <a href="mailto:support@resumeai.cv" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
              support@resumeai.cv
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
