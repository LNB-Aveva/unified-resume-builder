import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getScoreStyle } from "../../lib/score-styles";

interface SharedScore {
  id: string;
  overall_score: number;
  grade: string;
  grade_label: string;
  matched_keywords: string[];
  missing_keywords: string[];
  total_matched: number;
  total_missing: number;
  total_job_keywords: number;
  job_role_hint: string | null;
  created_at: string;
  expires_at: string;
}

async function getScore(id: string): Promise<SharedScore | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("shared_scores")
    .select("*")
    .eq("id", id)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as SharedScore;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const score = await getScore(id);
  if (!score) {
    return { title: "Score Not Found — ResumeAI" };
  }
  const pct = Math.round(score.overall_score);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv";
  return {
    title: `${pct}% ATS Match Score — ResumeAI`,
    description: `${score.grade_label}. ${score.total_matched} of ${score.total_job_keywords} ATS keywords matched. Check your own resume score free at ResumeAI.`,
    openGraph: {
      title: `I scored ${pct}% on my ATS match — check yours free`,
      description: `${score.grade_label}. ${score.total_matched} keywords matched, ${score.total_missing} missing. Get your ATS resume score at ResumeAI.`,
      url: `${siteUrl}/score/${id}`,
      siteName: "ResumeAI",
    },
    twitter: {
      card: "summary",
      title: `I scored ${pct}% ATS match on my resume`,
      description: `${score.grade_label}. See how your resume stacks up — free ATS score at ResumeAI.`,
    },
  };
}

export default async function SharedScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const score = await getScore(id);

  if (!score) {
    notFound();
  }

  const pct = Math.round(score.overall_score);
  const style = getScoreStyle(pct);
  const ringColor = style.ring;
  const labelColor = style.label;
  const matchedChip =
    "bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300";
  const missingChip =
    "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </a>
          <a
            href="/sign-up"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Check My Score Free
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Score card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 sm:p-10">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            ATS Resume Score Report
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
            {/* Donut */}
            <div className="relative h-36 w-36 shrink-0">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-100 dark:stroke-gray-700" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  className={ringColor}
                  strokeWidth="3"
                  strokeDasharray="97.4"
                  strokeDashoffset={97.4 * (1 - pct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${labelColor}`}>{pct}%</span>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{score.grade}</span>
              </div>
            </div>

            {/* Grade info */}
            <div className="text-center sm:text-left">
              <h1 className={`text-2xl sm:text-3xl font-bold ${labelColor} mb-2`}>
                {score.grade_label}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base mb-4">
                {score.total_matched} of {score.total_job_keywords} keywords matched &middot; {score.total_missing} missing
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{score.total_matched}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">matched</div>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{score.total_missing}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">missing</div>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{score.total_job_keywords}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">total keywords</div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {score.matched_keywords.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Matched Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {score.matched_keywords.map((kw) => (
                  <span key={kw} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${matchedChip}`}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {score.missing_keywords.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Missing — Add These to Your Resume
              </p>
              <div className="flex flex-wrap gap-2">
                {score.missing_keywords.map((kw) => (
                  <span key={kw} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${missingChip}`}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative">
            <p className="text-indigo-200 text-sm font-medium mb-3">Get your own score</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              How well does your resume match?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-md mx-auto">
              Paste any job description + your resume. Get your ATS score, find missing keywords,
              and rewrite weak bullets — all free, no credit card.
            </p>
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Check My ATS Score — Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <p className="text-indigo-200 text-xs mt-4">9 free AI tools &middot; No credit card &middot; Sign up in 10 seconds</p>
          </div>
        </div>

        {/* Footer attribution */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Score generated with{" "}
          <a href="/" className="text-indigo-500 hover:text-indigo-600 transition">
            ResumeAI
          </a>{" "}
          — free ATS resume checker
        </p>
      </main>
    </div>
  );
}
