/*
 * page.tsx — The landing page (home page) of the Unified Resume Builder.
 *
 * WHY THIS IS A SERVER COMPONENT (no "use client"):
 * This page has no interactivity of its own — no buttons, no state.
 * The interactive part (the keyword extractor form) is in AnalyzerDemo.tsx
 * and is marked as a Client Component there. By keeping page.tsx as a
 * Server Component, Next.js can render it on the server and send pure HTML
 * to the browser instantly — great for SEO and first-load speed.
 *
 * PATTERN USED HERE: "Server Shell + Client Island"
 * The page is a static shell. AnalyzerDemo is a small interactive "island"
 * dropped into it. This is the recommended Next.js App Router pattern.
 */

import AnalyzerDemo from "./components/AnalyzerDemo";
import GapAnalysis from "./components/GapAnalysis";
import ComplianceChecker from "./components/ComplianceChecker";
import SummaryGenerator from "./components/SummaryGenerator";
import BulletRewriter from "./components/BulletRewriter";
import JobTracker from "./components/JobTracker";
import ResumeExporter from "./components/ResumeExporter";
import CoverLetterGenerator from "./components/CoverLetterGenerator";

const faqItems = [
  {
    q: "What is ATS and why do 75% of resumes get rejected before a human reads them?",
    a: "ATS (Applicant Tracking System) is software that companies use to automatically filter resumes before a recruiter ever sees them. It scans for specific keywords from the job description, checks formatting compatibility, and scores candidates. If your resume doesn't include the right keywords or uses incompatible formatting (tables, columns, graphics), it gets filtered out automatically — no matter how qualified you are.",
  },
  {
    q: "How do I know if my resume is ATS-compatible?",
    a: "Use our free ATS Compliance Checker (Step 3 above). It runs 15 formatting checks covering file format, column layout, tables, images, special characters, font readability, section headings, and more. You'll get a scored report showing exactly which rules your resume violates and how to fix them.",
  },
  {
    q: "What keywords should I include in my resume?",
    a: "Paste the job description into our Keyword Extractor (Step 1). Our NLP engine identifies every skill, tool, qualification, and role-specific term that ATS systems are likely scanning for — hard skills, soft skills, certifications, and job title variants. Then use the Gap Analysis (Step 2) to see exactly which of those keywords are missing from your resume.",
  },
  {
    q: "Is ResumeAI really free? Are there any hidden fees or premium tiers?",
    a: "Yes, 100% free. All 9 tools — keyword extractor, gap analysis, ATS compliance checker, AI summary generator, AI cover letter generator, AI bullet rewriter, PDF export, job application tracker, and visual templates — are available with no sign-up, no credit card, and no usage limits. We keep costs at zero by using free-tier infrastructure and open-source AI models.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No account required at all. Everything works immediately. Your resume data and job applications are stored locally in your browser (localStorage) — nothing is sent to a server or saved on our end. Your data stays private on your own device.",
  },
  {
    q: "What are the 15 ATS compliance rules you check?",
    a: "We check: single-column layout (no tables or columns), no images or graphics, standard section headings (Experience, Education, Skills), no headers/footers, no text boxes, no special characters in headings, consistent date formatting, standard bullet characters, no colour-coded text, readable font size (10pt+), contact information at the top, no hyperlink-only text, file type compatibility, page margin adequacy, and section order logic. Each rule comes with a pass/fail result and a fix suggestion.",
  },
  {
    q: "How accurate is the ATS match score?",
    a: "Our scoring engine matches the keyword logic used by common ATS platforms: it weights exact keyword matches (hard skills, tools, certifications) most heavily, followed by soft skills and job title alignment. The score is a directional guide — a score above 70% typically means strong keyword alignment. Real ATS systems vary by vendor, so treat the score as a minimum bar, not a guarantee.",
  },
  {
    q: "What PDF resume templates are available?",
    a: "Three ATS-safe single-column templates: Classic (indigo accent with horizontal rules — traditional and widely accepted), Modern (navy header band with teal section accents — clean and contemporary), and Minimal (zero colour, pure black-and-white — maximally conservative, best for strict ATS environments). All three are single-column with no graphics, tables, or special characters that could confuse parsers.",
  },
  {
    q: "Can I use ResumeAI for any industry or job type?",
    a: "Yes. The keyword extractor and gap analysis work for any job description — tech, finance, healthcare, marketing, engineering, sales, legal, and more. The AI models are general-purpose. The only limitation is that the skills database has broader coverage for tech and knowledge-work roles; if you're in a highly specialised trade, manually review the extracted keywords to ensure completeness.",
  },
  {
    q: "Is my resume data private and secure?",
    a: "Your data never leaves your browser unless you explicitly use an AI feature (Summary Generator, Cover Letter, or Bullet Rewriter). For those features, your text is sent to our FastAPI backend and forwarded to HuggingFace's inference API — it is not stored or logged. Job tracker data and resume content you enter into forms are stored only in your browser's localStorage and are never transmitted to our servers.",
  },
];

// JSON-LD structured data — tells Google this is a free web application.
// Google uses this to show rich results and understand the page without
// needing to execute JavaScript. "WebApplication" schema is the right type
// for an interactive online tool.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ResumeAI",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://unified-resume-builder.vercel.app",
  description:
    "Free ATS resume checker and keyword analyzer. Extract ATS keywords, score your resume, " +
    "run 15 compliance checks, generate AI cover letters, rewrite bullets, and export ATS-safe PDFs.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "ATS Keyword Extraction",
    "Resume Gap Analysis",
    "ATS Compliance Checker (15 rules)",
    "AI Professional Summary Generator",
    "AI Cover Letter Generator",
    "AI Bullet Rewriter",
    "PDF Resume Export (3 templates)",
    "Job Application Tracker",
  ],
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD — WebApplication + FAQPage schemas for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* ── Navigation ── */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition">
              How it works
            </a>
            <a href="/blog" className="hover:text-gray-900 transition">
              Blog
            </a>
            <a href="#faq" className="hover:text-gray-900 transition">
              FAQ
            </a>
            <a
              href="#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
            >
              Try Free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute top-[100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-3xl" />
          <div className="absolute top-[50px] right-[-100px] w-[350px] h-[350px] rounded-full bg-blue-100/30 blur-3xl" />
        </div>
      <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Free • No sign-up required • Works instantly
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
          Free ATS Resume Checker
          <br />
          <span className="text-indigo-600">& Keyword Analyzer</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          75% of resumes are rejected by ATS software before a human ever reads
          them. Scan any job description and get your ATS match score in
          10 seconds — no sign-up, no paywall, 9 AI tools, 100% free.
        </p>

        <a
          href="#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Analyze a Job Description
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>

        {/* Stat strip — trust signals at a glance */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12">
          {[
            { n: "9", label: "AI tools" },
            { n: "15", label: "ATS rules checked" },
            { n: "3", label: "PDF templates" },
            { n: "0", label: "sign-ups needed" },
            { n: "100%", label: "free forever" },
          ].map(({ n, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 group">
              <span className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">{n}</span>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="bg-gray-50 border-y border-gray-100 py-16"
      >
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 text-center mb-10">
            How It Works — 8 Free ATS Resume Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Extract ATS keywords from any job posting",
                body: "Paste any job description — our NLP engine instantly identifies every keyword ATS filters scan for.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
              },
              {
                step: "2",
                title: "Resume gap analysis — find missing keywords",
                body: "Paste your resume to see matched vs missing keywords and your ATS match score.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
              },
              {
                step: "3",
                title: "ATS compliance checker — 15 format rules",
                body: "Run 15 ATS format checks to catch issues that prevent parsers from reading your resume.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
              },
              {
                step: "4",
                title: "AI professional summary generator",
                body: "Paste your experience bullets — AI rewrites them into a tailored professional summary.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>,
              },
              {
                step: "5",
                title: "Free AI cover letter generator",
                body: "AI generates a 250-320 word cover letter tailored to the company. Formal or conversational tone.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>,
              },
              {
                step: "6",
                title: "AI bullet rewriter — add missing keywords",
                body: "AI rewrites each bullet to naturally include your missing keywords — without inventing facts.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>,
              },
              {
                step: "7",
                title: "Download PDF",
                body: "Choose from 3 ATS-safe templates (Classic, Modern, Minimal), fill in your details, and download a clean single-column PDF.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
              },
              {
                step: "8",
                title: "Track applications",
                body: "Save jobs, update status from Saved → Applied → Interview → Offer, add notes per role.",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>,
              },
            ].map(({ step, title, body, icon }) => (
              <div
                key={step}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  {icon}
                </div>
                <div className="text-xs font-semibold text-indigo-600 mb-1">Step {step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            ATS Keyword Extractor — Try it free
          </h2>
          <p className="text-gray-500 text-sm">
            Paste any job description. Results appear in under 2 seconds.
          </p>
        </div>

        {/* AnalyzerDemo is a Client Component — interactive form + results */}
        <AnalyzerDemo />
      </section>

      {/* ── Gap Analysis ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              Step 2
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
              Resume Gap Analysis — Find Missing Keywords
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Paste both documents. We&apos;ll show you exactly which keywords
              your resume is missing — and what to add to pass ATS filters.
            </p>
          </div>

          {/* GapAnalysis is a Client Component */}
          <GapAnalysis />
        </div>
      </section>

      {/* ── Compliance Checker ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
            Step 3
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            ATS Compliance Checker — 15 Format Rules
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Keywords don&apos;t matter if ATS can&apos;t parse the file. Run 15 formatting
            checks to catch issues before you apply.
          </p>
        </div>
        <ComplianceChecker />
      </section>

      {/* ── AI Summary Generator ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              Step 4
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
              AI Professional Summary Generator
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Paste your experience bullets and the job description — AI rewrites them into a
              concise, ATS-friendly &quot;About Me&quot; paragraph in seconds.
            </p>
          </div>
          <SummaryGenerator />
        </div>
      </section>

      {/* ── Cover Letter Generator ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
            Step 5
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            Free AI Cover Letter Generator
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Paste your key achievements and the job description — AI writes a personalised
            250–320 word cover letter. Choose formal or conversational tone.
          </p>
        </div>
        <CoverLetterGenerator />
      </section>

      {/* ── AI Bullet Rewriter ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              Step 6
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
              AI Bullet Rewriter — Add Missing Keywords
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Paste up to 5 bullets from your resume and the missing keywords from Step 2.
              AI rewrites each one to naturally include the keywords — without inventing facts.
            </p>
          </div>
          <BulletRewriter />
        </div>
      </section>

      {/* ── PDF Export ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
            Step 7
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            Download ATS-Friendly Resume as PDF
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Fill in your details — paste the AI summary from Step 4 and rewritten
            bullets from Step 6. Downloads as a clean, ATS-friendly PDF.
          </p>
        </div>
        <ResumeExporter />
      </section>

      {/* ── Job Application Tracker ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              Step 8
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
              Job Application Tracker
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Save the jobs you&apos;re applying to, track their status, and add notes — all stored
              privately in your browser. No sign-up required.
            </p>
          </div>
          <JobTracker />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-sm">
            Everything you need to know about ATS filters and how ResumeAI works.
          </p>
        </div>
        <dl className="divide-y divide-gray-100 space-y-1">
          {faqItems.map(({ q, a }) => (
            <details key={q} className="group py-5 cursor-pointer list-none">
              <summary className="flex items-center justify-between gap-4 font-medium text-gray-900 text-sm select-none list-none marker:hidden hover:text-indigo-700 transition-colors duration-150">
                {q}
                <span className="shrink-0 h-5 w-5 text-indigo-600 transition-transform duration-200 group-open:rotate-45">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-500 leading-7">{a}</p>
            </details>
          ))}
        </dl>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50/50 py-10">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">ResumeAI</span>
          </div>

          {/* Tech stack note */}
          <p className="text-xs text-gray-400 text-center">
            Built with Next.js · FastAPI · spaCy · HuggingFace · fpdf2 &mdash; open source, 100% free.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a
              href="https://github.com/LNB-Aveva/unified-resume-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition"
            >
              GitHub
            </a>
            <span aria-hidden>·</span>
            <a href="#demo" className="hover:text-gray-700 transition">
              Get started free
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
