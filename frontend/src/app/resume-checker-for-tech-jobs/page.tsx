import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Checker for Tech Jobs — Review Job Description Keywords",
  description:
    "Software engineers and developers: ATS rejects tech resumes for missing specific " +
    "technologies, not missing skills. Our free keyword extractor shows exactly which tools, " +
    "languages, and frameworks its taxonomy recognizes. No subscription fee today.",
  keywords: [
    "resume checker for tech jobs",
    "ATS resume checker software engineer",
    "tech resume ATS keywords",
    "software engineer resume ATS",
    "developer resume keyword checker",
  ],
  openGraph: {
    title: "Resume Checker for Tech Jobs | ResumeAI",
    description:
      "Tech roles list 20+ specific technologies. ATS filters candidates who don't match them. " +
      "Find every missing keyword in your tech resume — free.",
  },
  alternates: {
    canonical: "/resume-checker-for-tech-jobs",
  },
};

const faqItems = [
  {
    q: "How do I know which technologies to list for each job?",
    a: "Use the Keyword Extractor — paste the job description and it identifies every technology, language, framework, and certification the ATS is scanning for. This is faster and more accurate than reading the JD manually, because NLP catches synonyms and variants you'd miss (e.g. 'Kubernetes' vs 'K8s', 'PostgreSQL' vs 'Postgres').",
  },
  {
    q: "Does ATS score GitHub links on my resume?",
    a: "No. ATS systems parse text, not URLs. A GitHub link doesn't contribute to your keyword score. Instead, extract the technologies from your GitHub projects and list them as text keywords in your Skills section and experience bullets. The link can stay as supplementary info, but the keywords are what actually move your score.",
  },
  {
    q: "Should I use a skills matrix or table on my tech resume?",
    a: "No. Tables and multi-column layouts break most ATS parsers. The parser reads your resume top-to-bottom and assigns text to incorrect fields when encountering tables. List skills as plain comma-separated text under a simple 'Technical Skills' or 'Skills' heading. Our ATS Compliance Checker flags this automatically.",
  },
  {
    q: "How many programming languages should I list?",
    a: "List all languages you're genuinely proficient in, but prioritize the ones that appear in each specific job description. Use our Gap Analysis to see which technologies from the JD are missing from your resume — those are the ones to add (or confirm you have listed). Don't pad with languages you barely know; ATS scores quantity but interviewers will probe depth.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Resume Checker for Tech Jobs",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv") +
    "/resume-checker-for-tech-jobs",
  description:
    "Free ATS resume checker for software engineers and developers. Extract exact technology keywords from any job description, see your match score, and fix formatting issues that break tech resume parsing.",
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
};

const painPoints = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: "Tech JDs list 20+ tools — ATS checks every one",
    body: "Miss \"TypeScript\" when the JD says TypeScript and your score drops — even if you know JavaScript deeply. ATS doesn't infer technology equivalents. It matches exact strings. One missing keyword can drop you below the filter threshold.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: "Job title variants trip ATS matching",
    body: "\"Software Engineer\", \"Software Developer\", \"SWE\", \"SDE\" — ATS may scan for the exact title variant in the JD. If your title doesn't match, ATS may score you lower before looking at anything else. Our tools show the exact title keywords used in each posting.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Tech resume formatting breaks ATS parsers",
    body: "Multi-column skill matrices, GitHub icon rows, side project layouts, and badge-style formatting all corrupt ATS parsing. Your keywords land in the wrong fields — or nowhere. A resume that looks sharp in PDF can score zero in ATS.",
  },
];

const tools = [
  {
    step: "1",
    title: "Pull every technology from the job description",
    body: "Paste any tech job description — SWE, ML, DevOps, data, product. Our NLP engine identifies every language, framework, tool, platform, and certification ATS is scanning for. Catches variants you'd miss reading manually (Kubernetes/K8s, Postgres/PostgreSQL, React/ReactJS).",
    href: "/keyword-analyzer",
    cta: "Extract Tech Keywords Free",
    color: "indigo",
  },
  {
    step: "2",
    title: "See your exact technology match score",
    body: "Paste your resume and an English tech job description. Get an explainable taxonomy percentage and a clear list of recognized technologies found or missing. Review relevance before adding anything.",
    href: "/sign-up",
    cta: "Run Gap Analysis",
    color: "violet",
  },
  {
    step: "3",
    title: "Fix the formatting issues that break tech resume parsing",
    body: "Run 15 text-based formatting checks. Skill matrices, multi-column layouts, icon rows, and project card formats are flagged. Get a specific pass/fail for each rule with instructions to fix it before your next application.",
    href: "/ats-checker",
    cta: "Check ATS Compliance",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; btnBg: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", btnBg: "bg-indigo-600 hover:bg-indigo-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", btnBg: "bg-violet-600 hover:bg-violet-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", btnBg: "bg-emerald-700 hover:bg-emerald-800" },
};

export default function TechJobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/#tools" className="text-gray-500 hover:text-gray-900 transition hidden sm:inline">All Tools</Link>
            <Link href="/sign-up" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-white font-semibold text-sm shadow hover:shadow-md transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-emerald-100/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free &bull; No credit card &bull; Fair-use access
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
            Tech Resume Checker: Stop Getting Filtered
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
              for Missing Technologies
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Software engineering roles list 15–25 specific technologies. ATS filters every candidate
            who doesn&apos;t match enough of them. Our free tools scan any job description and show
            you the exact stack keywords your resume needs — before you apply.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/keyword-analyzer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              Extract Tech Keywords Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="/ats-checker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Check Resume Format
            </a>
          </div>

          <p className="mt-5 text-sm text-gray-500">9 free AI tools &mdash; keyword extractor requires no account</p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            Why Tech Resumes Fail ATS
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            These are the exact reasons strong engineers get filtered before a recruiter reads their resume.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {painPoints.map(({ icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            3 Free Tools for Tech Job Seekers
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            No account needed for the keyword extractor. Full access with a free account — no credit card.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {tools.map(({ step, title, body, href, cta, color }) => {
              const c = colorMap[color];
              return (
                <div key={step} className={`rounded-2xl border ${c.border} ${c.bg} p-6 flex flex-col`}>
                  <div className={`text-xs font-bold ${c.text} uppercase tracking-widest mb-3`}>Step {step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">{body}</p>
                  <a
                    href={href}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl ${c.btnBg} px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200`}
                  >
                    {cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqItems.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-indigo-600">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white mb-4">
            Review the Keywords. Improve the Draft.
          </h2>
          <p className="text-emerald-100 mb-8">
            9 tools for software engineers. No subscription fee today. Fair-use limits apply.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
          >
            Create Free Account
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="font-semibold text-gray-700 hover:text-indigo-600 transition">ResumeAI</Link>
          <div className="flex items-center gap-6">
            <Link href="/resume-checker-for-career-changers" className="hover:text-gray-700 transition">Career Changers</Link>
            <Link href="/ats-checker-for-new-grads" className="hover:text-gray-700 transition">New Grads</Link>
            <Link href="/resume-checker-for-tech-jobs" className="hover:text-gray-700 transition">Tech Jobs</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition">Privacy</Link>
          </div>
          <span>&copy; {new Date().getFullYear()} ResumeAI</span>
        </div>
      </footer>
    </div>
  );
}
