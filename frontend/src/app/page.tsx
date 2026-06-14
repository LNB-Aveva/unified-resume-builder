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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
            <a
              href="#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Try Free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Free • No sign-up required • Works instantly
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
          Stop losing jobs to ATS filters.
          <br />
          <span className="text-indigo-600">Find out why in 10 seconds.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          75% of resumes are rejected by ATS software before a human ever reads
          them. Paste any job description below and instantly see every keyword
          ATS systems scan for — then fix your resume to match.
        </p>

        <a
          href="#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
        >
          Analyze a Job Description
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="bg-gray-50 border-y border-gray-100 py-16"
      >
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Paste a job description",
                body: "Copy the full text of any job posting — title, requirements, responsibilities.",
              },
              {
                step: "2",
                title: "See every ATS keyword",
                body: "Our NLP engine identifies every hard skill, soft skill, and keyword ATS filters look for.",
              },
              {
                step: "3",
                title: "Fix keywords + format",
                body: "See matched vs missing keywords and run 15 ATS format checks. Fix both to maximize your chances.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                  {step}
                </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Try it now — free
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Now check your resume against the job
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check if ATS can even read your resume
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Keywords don&apos;t matter if ATS can&apos;t parse the file. Run 15 formatting
            checks to catch issues before you apply.
          </p>
        </div>
        <ComplianceChecker />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <p>
          Built with Next.js + FastAPI + spaCy &mdash; 100% free and open
          source.
        </p>
      </footer>
    </div>
  );
}
