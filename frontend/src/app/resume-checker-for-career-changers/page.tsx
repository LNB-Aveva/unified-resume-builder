import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Checker for Career Changers — Fix ATS Keyword Gaps",
  description:
    "Switching industries? ATS rejects career changers before a human reads them. " +
    "Our free tool finds recognized industry keyword gaps, runs 15 text-based checks, and " +
    "shows you exactly how to make your transferable skills visible to recruiters.",
  keywords: [
    "resume checker for career changers",
    "career change resume ATS",
    "ATS resume career transition",
    "resume keyword gap career change",
    "transferable skills resume checker",
  ],
  openGraph: {
    title: "Resume Checker for Career Changers | ResumeAI",
    description:
      "ATS rejects career changers for missing industry keywords — not missing skills. " +
      "Find the gaps and fix them free.",
  },
  alternates: {
    canonical: "/resume-checker-for-career-changers",
  },
};

const faqItems = [
  {
    q: "Can ATS tell I'm a career changer?",
    a: "Not directly — but ATS scores keyword density, and career changers often score low because they lack the exact vocabulary of the new industry. The system doesn't evaluate career narrative or transferable potential. It scans for specific terms from the job description. If those terms aren't in your resume, your score drops regardless of how qualified you are.",
  },
  {
    q: "How do I add keywords for a field I'm transitioning into?",
    a: "Use the Keyword Extractor (Tool 1) to identify recognized skills, certifications, tools, and role-specific terms in your target job description. Then review your experience for genuine equivalents you can honestly claim. Don't fabricate experience, but don't undersell transferable work either. If you used 'budget management' in your old role and the new JD says 'P&L ownership', compare the responsibilities before using the new vocabulary.",
  },
  {
    q: "Should my career change resume look different for ATS?",
    a: "Yes. A career transition resume needs heavier keyword focus in the skills section and summary, because your job titles won't match the target role. Lead with a strong professional summary that uses industry vocabulary, then back it up in your experience bullets. Use the Gap Analysis to see your match score before you apply.",
  },
  {
    q: "What ATS score should a career changer aim for?",
    a: "Aim for 65–70% minimum. Career changers typically score lower than direct-experience candidates, so you need to compensate with a higher keyword match rate. Our Gap Analysis tool shows your score and the exact missing keywords so you can close the gap before applying.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Resume Checker for Career Changers",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv") +
    "/resume-checker-for-career-changers",
  description:
    "Free ATS resume checker for career changers. Find missing industry keywords, fix formatting, and make your transferable skills visible to ATS systems.",
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "ATS doesn't translate your experience",
    body: "Systems scan for exact keywords from the new field, not transferable equivalents. A marketing manager applying for sales ops gets filtered out even when the skills map perfectly — because the vocabulary doesn't match.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    title: "You don't know the new industry's vocabulary",
    body: "Every field has its own ATS language. Finance uses \"P&L\" and \"ROI\"; tech uses \"sprint\" and \"CI/CD\"; healthcare uses \"HIPAA\" and \"EMR\". ATS looks for these exact terms and has no way to infer equivalents.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Career transition formats often break ATS",
    body: "Resumes designed to tell a transition story — skills-based layouts, columns, sidebars — are frequently ATS-incompatible. A resume that reads beautifully to a human may score zero if the parser can't read it.",
  },
];

const tools = [
  {
    step: "1",
    title: "Find recognized terms used in your new industry",
    body: "Paste an English job description from your target field. Our NLP engine identifies taxonomy skills, tools, certifications, and role-specific terms to highlight a possible vocabulary gap.",
    href: "/keyword-analyzer",
    cta: "Extract Keywords Free",
    color: "indigo",
  },
  {
    step: "2",
    title: "See your match score before you apply",
    body: "Paste your resume and an English job description. Get an explainable taxonomy match percentage and a list of missing recognized terms to review before submitting.",
    href: "/sign-up",
    cta: "Run Gap Analysis",
    color: "violet",
  },
  {
    step: "3",
    title: "Make sure your format passes all 15 ATS checks",
    body: "Career change resumes often use creative layouts to tell a transition story. Our ATS Compliance Checker runs 15 formatting rules to make sure the parser can actually read your resume.",
    href: "/ats-checker",
    cta: "Check ATS Compliance",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; btnBg: string }> = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-100 dark:border-indigo-800", btnBg: "bg-indigo-600 hover:bg-indigo-700" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-300", border: "border-violet-100 dark:border-violet-800", btnBg: "bg-violet-600 hover:bg-violet-700" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-100 dark:border-emerald-800", btnBg: "bg-emerald-700 hover:bg-emerald-800" },
};

export default function CareerChangersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/#tools" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition hidden sm:inline">All Tools</Link>
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
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Free &bull; No credit card &bull; Fair-use access
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-5">
            Career Changers: Stop Getting Rejected
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Before a Human Reads Your Resume
            </span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Career changes create a vocabulary problem: the same experience may be described
            differently in a new field. Our tools highlight recognized language gaps so you can
            revise truthfully; they do not predict an employer&apos;s ATS or hiring decision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/keyword-analyzer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              Find Missing Keywords Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="/ats-checker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              Check ATS Compliance
            </a>
          </div>

          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">9 free AI tools &mdash; no account required to try the keyword extractor</p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
            Why ATS Rejects Career Changers
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-xl mx-auto">
            It&apos;s not your qualifications — it&apos;s your vocabulary. Here&apos;s what&apos;s happening before a recruiter ever sees your name.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {painPoints.map(({ icon, title, body }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
            3 Free Tools to Fix It
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-xl mx-auto">
            No account needed to try the keyword extractor. Full access with a free account.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {tools.map(({ step, title, body, href, cta, color }) => {
              const c = colorMap[color];
              return (
                <div key={step} className={`rounded-2xl border ${c.border} ${c.bg} p-6 flex flex-col`}>
                  <div className={`text-xs font-bold ${c.text} uppercase tracking-widest mb-3`}>Step {step}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-5">{body}</p>
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
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqItems.map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{q}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white mb-4">
            Make Your Career Change Visible to ATS
          </h2>
          <p className="text-indigo-100 mb-8">
            9 free AI tools. No credit card. Your transferable skills deserve to be seen.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
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
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">ResumeAI</Link>
          <div className="flex items-center gap-6">
            <Link href="/resume-checker-for-career-changers" className="hover:text-gray-700 dark:hover:text-gray-300 transition">Career Changers</Link>
            <Link href="/ats-checker-for-new-grads" className="hover:text-gray-700 dark:hover:text-gray-300 transition">New Grads</Link>
            <Link href="/resume-checker-for-tech-jobs" className="hover:text-gray-700 dark:hover:text-gray-300 transition">Tech Jobs</Link>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition">Privacy</Link>
          </div>
          <span>&copy; {new Date().getFullYear()} ResumeAI</span>
        </div>
      </footer>
    </div>
  );
}
