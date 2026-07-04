import type { Metadata } from "next";

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
    a: "Our engine uses NLP (Natural Language Processing) via spaCy to analyse the job description at a linguistic level — not just simple word counting. It identifies named entities, noun phrases, and domain-specific terminology to extract the keywords that matter. This catches terms that simple regex-based tools miss, like multi-word skills and abbreviation variants.",
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
    (process.env.NEXT_PUBLIC_SITE_URL ??
      "https://unified-resume-builder.vercel.app") + "/keyword-analyzer",
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
    <div className="min-h-screen bg-white">
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
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900">ResumeAI</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/blog" className="hover:text-gray-900 transition">
              Blog
            </a>
            <a
              href="/#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Try Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          NLP-powered &bull; Free &bull; No sign-up
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
          Resume Keyword Analyzer
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Paste any job description. Our NLP engine instantly extracts every
          keyword ATS systems scan for — hard skills, soft skills,
          certifications, tools, and job title variants.
        </p>

        <a
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </section>

      {/* What it extracts */}
      <section className="bg-gray-50 border-y border-gray-100 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            What Keywords Does ATS Scan For?
          </h2>
          <p className="text-gray-500 text-sm text-center max-w-xl mx-auto mb-8">
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
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How to Use Extracted Keywords
        </h2>
        <div className="space-y-6">
          {[
            {
              step: "1",
              title: "Extract keywords from the job posting",
              body: "Paste the full job description into the keyword analyzer. You'll get a categorised list of every keyword ATS is likely scanning for.",
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
              <div className="shrink-0 h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-100 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Keyword Analyzer FAQ
          </h2>
          <dl className="divide-y divide-gray-200">
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="group py-5 cursor-pointer list-none"
              >
                <summary className="flex items-center justify-between gap-4 font-medium text-gray-900 text-sm select-none list-none marker:hidden">
                  {q}
                  <span className="shrink-0 h-5 w-5 text-indigo-600 transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Ready to extract ATS keywords?
            </h2>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Paste any job description and see every keyword ATS is scanning
              for — in under 2 seconds. Free, no sign-up.
            </p>
            <a
              href="/#demo"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Try the Keyword Analyzer Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              ResumeAI
            </span>
          </a>
          <p className="text-xs text-gray-400 text-center">
            Free ATS resume checker &mdash; 9 AI tools, no sign-up required.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-700 transition">
              Home
            </a>
            <span aria-hidden>&middot;</span>
            <a href="/blog" className="hover:text-gray-700 transition">
              Blog
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
