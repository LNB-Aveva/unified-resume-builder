import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ResumeAI privacy policy. Learn how we handle your data, what we collect, and how we protect your privacy.",
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition mb-6 inline-block">&larr; Back to home</Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Last updated: July 30, 2026</p>
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
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Keyword Data</h3>
              <p>We may use anonymized, aggregated keyword data from tool usage to improve our matching algorithms. This data cannot be linked back to individual users or resumes.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Usage Data</h3>
              <p>We use Google Analytics to collect anonymous usage data (pages visited, features used, device type). This helps us improve the product. No personally identifiable information is sent to Google Analytics.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Error Data</h3>
              <p>We use Sentry for backend error tracking. No resume content is transmitted to Sentry.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Local Storage</h3>
              <p>Job tracker data, resume text, and preferences are stored in your browser&apos;s localStorage. This data never leaves your device unless you explicitly use an AI-powered feature.</p>
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
            <li>To improve our matching algorithms using anonymized, aggregated keyword data</li>
            <li>To improve our website and user experience through anonymized analytics</li>
            <li>To display relevant advertisements through Google AdSense (with your consent)</li>
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
            <li>Not used to train any AI models</li>
            <li>Transmitted securely over HTTPS</li>
            <li>Processed only for the purpose of generating your requested output</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li><strong>Supabase</strong> &mdash; Authentication and storage for account data, saved resumes, and job tracking</li>
            <li><strong>Hugging Face</strong> &mdash; AI inference for summary generation, bullet rewriting, and cover letter generation</li>
            <li><strong>Sentry</strong> &mdash; Backend error tracking; no resume content is transmitted</li>
            <li><strong>Vercel</strong> &mdash; Website hosting and deployment</li>
            <li><strong>Google Analytics</strong> &mdash; Anonymous usage analytics (loaded only with your consent)</li>
            <li><strong>Google AdSense</strong> &mdash; Advertising (loaded only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Security</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We implement appropriate security measures including HTTPS encryption, secure authentication via Supabase,
            Content Security Policy headers, and regular security audits.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Retention</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>We retain your data according to the following schedule:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Account data</strong> (email, profile) &mdash; retained while your account is active. Deleted within 30 days of account deletion.</li>
              <li><strong>Job tracker entries</strong> &mdash; retained while your account is active. Deleted when you delete your account.</li>
              <li><strong>Shareable ATS score links</strong> &mdash; automatically expire and are deleted after 30 days.</li>
              <li><strong>Inactive accounts</strong> &mdash; accounts with no sign-in for 12 months may be deleted after notice to your registered email.</li>
              <li><strong>Anonymized keyword data</strong> &mdash; retained indefinitely for algorithm improvement. This data cannot be linked to individuals.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <li>Access your account information via the Account page</li>
            <li>Delete your account and all associated data (profile, job tracker entries) from the Account page</li>
            <li>Export your data from the Account page</li>
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
              <li><strong>Analytics cookies</strong> &mdash; Google Analytics (GA4) collects anonymous usage data. Loaded only after you consent.</li>
              <li><strong>Advertising cookies</strong> &mdash; Google AdSense may set cookies to display relevant ads. Loaded only after you consent.</li>
            </ul>
            <p>You can manage your cookie preferences at any time using the cookie consent banner or the cookie settings link in the site footer.</p>
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">GDPR (European Users)</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you are in the European Economic Area, you have additional rights under the General Data Protection Regulation, including
            the right to access, rectify, port, and erase your personal data. Our legal basis for processing is your consent (for analytics
            and advertising cookies) and legitimate interest (for providing the service). To exercise your rights, use the Account page
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
            <a href="mailto:lnbingi.work@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              lnbingi.work@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
