import type { Metadata } from "next";
import Link from "next/link";
import AnalyzerDemo from "../components/AnalyzerDemo";

export const metadata: Metadata = {
  title: "Free Resume Keyword Analyzer — Extract ATS Keywords from Any Job",
  description:
    "Free ATS keyword analyzer. Paste any job description and instantly extract " +
    "every keyword ATS systems scan for — hard skills, soft skills, certifications, " +
    "and job title variants. No sign-up required.",
  keywords: [
    "resume keyword analyzer",
    "ATS keyword scanner",
    "ATS keyword extractor",
    "job description keyword tool",
    "resume keywords free",
  ],
  openGraph: {
    title: "Free Resume Keyword Analyzer | ResumeAI",
    description:
      "Extract every ATS keyword from any job description. Find out exactly " +
      "what skills and qualifications the ATS is scanning for. Free, no sign-up.",
  },
  alternates: {
    canonical: "/keyword-analyzer",
  },
};

const faqItems = [
  {
    q: "What is an ATS keyword analyzer?",
    a: "An ATS keyword analyzer reads a job description and identifies every keyword that an Applicant Tracking System is likely to scan for when filtering resumes. This includes hard skills (Python, Excel), soft skills (leadership, collaboration), certifications (PMP, AWS Certified), tools (Jira, Salesforce), and job title variants. Knowing these keywords lets you tailor your resume to pass the automated filter.",
  },
  {
    q: "How does the keyword extraction work?",
    a: "Our engine uses a curated skill taxonomy of 220+ skills with 65+ synonym groups to analyse the job description — not just simple word counting. It recognises abbreviation variants (e.g., 'JS' matches 'JavaScript'), multi-word skills, and domain-specific terminology to extract the keywords that matter. This catches terms that simple keyword-matching tools miss.",
  },
  {
    q: "Should I add every extracted keyword to my resume?",
    a: "Only add keywords for skills and experience you actually have. ATS gets you past the automated filter, but the recruiter interview will verify your claims. Focus on the keywords where you have genuine experience, and weave them naturally into your bullet points rather than stuffing them into a skills section.",
  },
  {
    q: "How is this different from just reading the job description?",
    a: "A job description often buries important keywords in long paragraphs, mentions the same skill under different names (e.g., 'project management' vs 'PM'), or uses industry jargon you might overlook. Our NLP engine catches all variants and presents them in a structured list, so you don't miss anything.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ResumeAI Keyword Analyzer",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv") + "/keyword-analyzer",
  description:
    "Free ATS keyword analyzer. Extract every keyword ATS systems scan for from any job description.",
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

export default function KeywordAnalyzerPage() {
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
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">
              Blog
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-white font-medium hover:opacity-90 transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          NLP-powered &bull; Free &bull; No sign-up required
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-5">
          Resume Keyword Analyzer
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          Paste any job description. Our NLP engine instantly extracts every
          keyword ATS systems scan for — hard skills, soft skills,
          certifications, tools, and job title variants.
        </p>

        <a
          href="#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
        >
          Analyse a Job Description Free
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
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        </a>
      </section>

      {/* ── Live Demo Tool ── */}
      <section id="demo" className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-14 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Try It Now — No Sign-Up Required
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Paste any job description below and hit Extract. See every ATS keyword instantly.
            </p>
          </div>
          <AnalyzerDemo publicMode={true} />
        </div>
      </section>

      {/* What it extracts */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
            What Keywords Does ATS Scan For?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xl mx-auto mb-8">
            ATS doesn&apos;t just count words. It looks for specific categories of
            keywords — and weights them differently.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Hard Skills & Tools",
                items:
                  "Programming languages, frameworks, software tools, platforms, databases. Example: Python, React, Tableau, AWS, Salesforce.",
              },
              {
                title: "Soft Skills",
                items:
                  "Interpersonal and leadership competencies. Example: cross-functional collaboration, stakeholder management, mentoring.",
              },
              {
                title: "Certifications & Qualifications",
                items:
                  "Professional certifications and degrees. Example: PMP, CPA, AWS Certified Solutions Architect, MBA.",
              },
              {
                title: "Job Title Variants",
                items:
                  "Different names for the same role. Example: Software Engineer vs SWE vs Developer vs Programmer.",
              },
            ].map(({ title, items }) => (
              <div
                key={title}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            How to Use Extracted Keywords
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Extract keywords from the job posting",
                body: "Paste the full job description into the keyword analyzer above. You'll get a categorised list of every keyword ATS is likely scanning for.",
              },
              {
                step: "2",
                title: "Run a gap analysis against your resume",
                body: "Paste your resume alongside the job description into our Gap Analysis tool. See exactly which keywords are present vs missing — and your ATS match score.",
              },
              {
                step: "3",
                title: "Add missing keywords naturally",
                body: "Weave missing keywords into your experience bullets. Use our AI Bullet Rewriter to do this automatically — it rewrites each bullet to include the keywords without inventing facts.",
              },
              {
                step: "4",
                title: "Verify and export",
                body: "Run the gap analysis again to verify your score improved (aim for 70%+). Then check formatting compliance and export as an ATS-safe PDF.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Keyword Analyzer FAQ
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-800 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Got your keywords? Now fix your resume.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
              Sign up free to run Gap Analysis, check ATS compliance, rewrite bullets,
              and export an ATS-safe PDF &mdash; all 9 tools, no credit card.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              Create Free Account
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">No credit card &middot; 10 seconds to sign up</p>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10">
        <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ResumeAI
            </span>
          </Link>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Free ATS resume checker &mdash; 9 AI tools, no sign-up required.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
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
