import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ResumeAI privacy policy. Learn how we handle your data, what we collect, and how we protect your privacy.",
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <a href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition mb-6 inline-block">&larr; Back to home</a>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Last updated: July 22, 2026</p>
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
              <p>Text you paste into our tools (job descriptions, resume content, bullet points) is processed in your browser or sent to our backend API for AI features only. We do not store your resume content on our servers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Usage Data</h3>
              <p>We use Google Analytics to collect anonymous usage data (pages visited, features used, device type). This helps us improve the product. No personally identifiable information is sent to Google Analytics.</p>
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
            <li>To process AI-powered features (summary generation, cover letter generation, bullet rewriting) via our FastAPI backend and HuggingFace inference API</li>
            <li>To improve our website and user experience through anonymized analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Data Processing &amp; AI Features</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            When you use AI-powered tools (Summary Generator, Cover Letter Generator, Bullet Rewriter), your text is sent
            to our FastAPI backend and forwarded to HuggingFace&apos;s inference API for processing. This data is:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <li>Not stored or logged on our servers</li>
            <li>Not used to train any AI models</li>
            <li>Transmitted securely over HTTPS</li>
            <li>Processed only for the purpose of generating your requested output</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li><strong>Supabase</strong> &mdash; Authentication and user management</li>
            <li><strong>HuggingFace</strong> &mdash; AI inference for text generation features</li>
            <li><strong>Vercel</strong> &mdash; Website hosting and deployment</li>
            <li><strong>Google Analytics</strong> &mdash; Anonymous usage analytics</li>
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
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <li>Access your account information</li>
            <li>Delete your account and associated data</li>
            <li>Clear your browser localStorage at any time</li>
            <li>Opt out of Google Analytics using browser extensions</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-3">Cookies</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We use essential cookies for authentication session management (via Supabase) and analytics cookies (via Google Analytics).
            No advertising or tracking cookies are used.
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
