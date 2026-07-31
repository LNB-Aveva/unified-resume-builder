import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free ATS Score Checker — Check Your Resume Score Instantly",
  description:
    "Free ATS score checker with no sign-up. Upload your resume and job description " +
    "to get an instant ATS match score, find missing keywords, and run 15 formatting " +
    "compliance checks. 100% free.",
  keywords: [
    "ATS score checker free",
    "free ATS resume checker",
    "ATS match score",
    "resume ATS score",
    "check ATS compatibility",
  ],
  openGraph: {
    title: "Free ATS Score Checker | ResumeAI",
    description:
      "Get your ATS match score instantly. Find missing keywords and fix formatting " +
      "issues that get your resume rejected. No sign-up, 100% free.",
  },
  alternates: {
    canonical: "/ats-checker",
  },
};

const faqItems = [
  {
    q: "What is an ATS score?",
    a: "An ATS score is a percentage that represents how well your resume matches a specific job description. ATS software compares keywords, skills, and qualifications in your resume against those in the job posting. A higher score means more keywords match, increasing your chances of passing the automated filter and reaching a human recruiter.",
  },
  {
    q: "What's a good ATS score?",
    a: "Aim for 70% or higher. Resumes scoring above 70% are roughly 3x more likely to reach a human reviewer. Below 40%, you're almost certainly filtered out. The exact threshold varies by company and ATS platform, so treat 70% as a minimum target.",
  },
  {
    q: "How is the ATS score calculated?",
    a: "Our scoring engine weights exact keyword matches most heavily — hard skills, tools, and certifications from the job description. Soft skills and job title alignment also contribute. The score reflects how well your resume's content matches what the ATS is scanning for, not just simple word counting.",
  },
  {
    q: "Can I check my resume for free?",
    a: "Yes, completely free with no limits. Unlike other tools that restrict you to 2 free scans per month, ResumeAI lets you check your resume against as many job descriptions as you want. No sign-up, no credit card, no paywall.",
  },
  {
    q: "Does ATS check formatting too?",
    a: "Yes — and most people miss this. Even a resume with perfect keyword matches can be rejected if the ATS parser can't read the file. Our compliance checker runs 15 formatting rules: single-column layout, no images, standard section headings, no text boxes, consistent dates, and more.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ResumeAI ATS Score Checker",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv") + "/ats-checker",
  description:
    "Free ATS resume score checker. Get your ATS match score, find missing keywords, and run 15 formatting compliance checks.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function ATSCheckerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">
              Blog
            </Link>
            <Link
              href="/#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Free &bull; No sign-up &bull; Unlimited scans
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-5">
          Free ATS Score Checker
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          75% of resumes are rejected by ATS before a human reads them. Check
          your ATS match score instantly — find missing keywords and formatting
          issues that get your resume filtered out.
        </p>

        <Link
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
        >
          Check Your ATS Score Free
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </section>

      {/* How ATS scoring works */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            How ATS Scoring Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Paste a job description",
                body: "Our NLP engine extracts every keyword the ATS is scanning for — hard skills, soft skills, certifications, and job title variants.",
              },
              {
                step: "2",
                title: "Paste your resume",
                body: "We compare your resume against the extracted keywords and calculate your match percentage. You see exactly which keywords are present vs missing.",
              },
              {
                step: "3",
                title: "Get your score + fixes",
                body: "See your ATS match score, a list of missing keywords, and 15 formatting compliance checks. Then use our AI tools to fix the gaps.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
          What Our ATS Checker Analyses
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xl mx-auto mb-8">
          Most ATS checkers only match keywords. We check both content and
          formatting — because keywords don&apos;t matter if the parser can&apos;t read
          your resume.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Keyword Analysis
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Hard skills extraction (tools, languages, frameworks)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Soft skills detection (leadership, collaboration)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Certification and qualification matching
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Job title variant detection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Match score with missing keyword list
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              15-Rule Format Compliance
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Single-column layout check
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                No images, graphics, or text boxes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Standard section headings verified
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Date format consistency
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Contact info, margins, fonts, and 10 more rules
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            ResumeAI vs Other ATS Checkers
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-indigo-700 dark:text-indigo-400">
                    ResumeAI
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">
                    Jobscan
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {[
                  ["Keyword extraction", true, true, true],
                  ["Gap analysis with score", true, true, false],
                  ["15-rule format compliance", true, false, false],
                  ["AI bullet rewriter", true, false, false],
                  ["AI cover letter generator", true, false, false],
                  ["PDF export (3 templates)", true, false, false],
                  ["Unlimited free scans", true, false, false],
                  ["No sign-up required", true, false, false],
                ].map(([feature, us, jobscan, others]) => (
                  <tr key={feature as string}>
                    <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">
                      {feature as string}
                    </td>
                    <td className="py-2.5 px-4 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {us ? "✓" : "✗"}
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-400 dark:text-gray-500">
                      {jobscan ? "✓" : "✗"}
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-400 dark:text-gray-500">
                      {others ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="py-2.5 px-4 font-semibold text-gray-700 dark:text-gray-200">
                    Price
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    Free
                  </td>
                  <td className="py-2.5 px-4 text-center text-gray-500 dark:text-gray-400">
                    $50/mo
                  </td>
                  <td className="py-2.5 px-4 text-center text-gray-500 dark:text-gray-400">
                    $20-30/mo
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          ATS Score Checker FAQ
        </h2>
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          {faqItems.map(({ q, a }) => (
            <details
              key={q}
              className="group py-5 cursor-pointer list-none"
            >
              <summary className="flex items-center justify-between gap-4 font-medium text-gray-900 dark:text-gray-100 text-sm select-none list-none marker:hidden">
                {q}
                <span className="shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Stop getting filtered by ATS
          </h2>
          <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto">
            Check your resume against any job description. Get your score, find
            missing keywords, and fix formatting issues — all free.
          </p>
          <Link
            href="/#demo"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition"
          >
            Check Your ATS Score Now
          </Link>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10">
        <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ResumeAI
            </span>
          </Link>
          <p className="text-xs text-gray-400 text-center">
            Free ATS resume checker &mdash; 9 AI tools, no sign-up required.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Home
            </Link>
            <span aria-hidden>&middot;</span>
            <Link href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
