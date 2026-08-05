import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ATS Checker for New Grads — Get Your Entry-Level Resume Past ATS",
  description:
    "Our free ATS-oriented checker helps new grads find recognized keyword gaps, review " +
    "college resume text issues, and explain the resulting match score. No sign-up is needed for the public demo.",
  keywords: [
    "ATS checker for new grads",
    "ATS resume checker for college students",
    "entry level resume ATS",
    "new graduate resume ATS",
    "college resume ATS check",
  ],
  openGraph: {
    title: "ATS Checker for New Grads | ResumeAI",
    description:
      "Get your entry-level resume past ATS without experience. Find missing keywords " +
      "and fix the formatting mistakes ATS rejects new grads for. Free.",
  },
  alternates: {
    canonical: "/ats-checker-for-new-grads",
  },
};

const faqItems = [
  {
    q: "Can a new grad with no experience pass ATS?",
    a: "Yes — ATS scores keyword match, not years of experience. A resume with the right keywords from coursework, internships, projects, and certifications can score above 70% even without full-time work history. The key is extracting the exact terms from each job description and ensuring they appear in your resume naturally.",
  },
  {
    q: "What should I put on my resume if I have no work experience?",
    a: "Relevant coursework, class projects with outcomes, internships (paid or unpaid), part-time jobs, extracurriculars in leadership roles, volunteer work, certifications, and academic competitions. ATS doesn't distinguish between job experience and project experience — it only looks for keywords. Describe your projects using the same vocabulary as the job description.",
  },
  {
    q: "How should a new grad format their resume for ATS?",
    a: "Single-column layout, standard section headings (Summary, Education, Experience or Projects, Skills), no tables, no graphics, no columns, no text boxes. Font size 10pt or larger. Contact info at the top. Consistent date formatting. Our ATS Compliance Checker runs 15 of these rules automatically and tells you exactly what to fix.",
  },
  {
    q: "Should I include GPA on my resume for ATS?",
    a: "GPA doesn't affect your ATS keyword score — ATS doesn't filter by GPA. But recruiters look for it manually if they're hiring from specific schools or programs. Include it (3.5+) under your Education section with a clear label. Don't put it in a header or sidebar where parsers might miss it.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "ATS Checker for New Grads",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv") +
    "/ats-checker-for-new-grads",
  description:
    "Free ATS-oriented resume checker for new graduates. Find recognized keyword gaps and review text-based resume checks.",
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    title: "No work experience means fewer ATS keywords",
    body: "ATS scores by keyword density. Internships, coursework, and projects use different vocabulary than full-time job descriptions. Without the right terms explicitly stated, your score stays low — even if you have the skills.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "College resume formats fail ATS",
    body: "Objective statements, multi-column layouts, decorative lines, and photo headers all break ATS parsers. The resume template your career center gave you may look professional but score zero in ATS systems.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 10.5 6.75 6.75 10.5h9l-6.75 6.75" />
      </svg>
    ),
    title: "Entry-level JDs still demand 10+ requirements",
    body: "\"Entry-level\" doesn't mean ATS is lenient. Job descriptions for new grad roles still list 10–15 specific skills, tools, and qualifications. Missing 5 of them drops your score below the cutoff automatically.",
  },
];

const tools = [
  {
    step: "1",
    title: "Find recognized terms in the entry-level job description",
    body: "Paste an English job description. Our NLP engine identifies taxonomy skills, tools, certifications, and role-specific terms — including ones you may genuinely have from coursework and projects but forgot to list.",
    href: "/keyword-analyzer",
    cta: "Extract Keywords Free",
    color: "indigo",
  },
  {
    step: "2",
    title: "Turn your coursework into ATS-friendly language",
    body: "Our AI Summary Generator takes your experience — internships, projects, activities — and writes a professional summary using the same vocabulary as your target role. Paste your bullets and the job description, get a scored summary in seconds.",
    href: "/sign-up",
    cta: "Generate Summary",
    color: "violet",
  },
  {
    step: "3",
    title: "Fix the 15 formatting mistakes college resumes make",
    body: "Run 15 text-based formatting checks on your resume. Columns, objective statements, tables, image headers, and inconsistent dates are flagged. Get a pass/fail on every rule with specific fix instructions.",
    href: "/ats-checker",
    cta: "Check ATS Compliance",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; btnBg: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", btnBg: "bg-indigo-600 hover:bg-indigo-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", btnBg: "bg-violet-600 hover:bg-violet-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", btnBg: "bg-emerald-600 hover:bg-emerald-700" },
};

export default function NewGradsPage() {
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
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-100/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-4 py-1.5 text-xs font-semibold text-violet-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Free &bull; No credit card &bull; Fair-use access
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
            New Grads: Get Your Resume Past ATS
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Without Years of Experience
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Entry-level postings often use specific skills and role language. Our tools show
            which recognized terms are present or missing so you can make an informed,
            truthful revision; they do not predict a recruiter&apos;s decision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/keyword-analyzer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              Find Missing Keywords Free
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

          <p className="mt-5 text-sm text-gray-400">9 free AI tools &mdash; keyword extractor requires no account</p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            Why Entry-Level Resumes Fail ATS
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            It&apos;s not your qualifications. These are the specific reasons new grad resumes get filtered before a human reads them.
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
            3 Free Tools Built for New Grads
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            No account needed for the keyword extractor. Sign up free for full access to all 9 tools.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {tools.map(({ step, title, body, href, cta, color }) => {
              const c = colorMap[color];
              return (
                <div key={step} className={`rounded-2xl border ${c.border} ${c.bg} p-6 flex flex-col`}>
                  <div className={`text-xs font-bold ${c.text} uppercase tracking-widest mb-3`}>Step {step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">{body}</p>
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
      <section className="py-16 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white mb-4">
            Land Your First Role — Start Free Today
          </h2>
          <p className="text-violet-100 mb-8">
            9 free AI tools for new grads. No credit card. No limits. Just results.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-violet-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
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
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
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
