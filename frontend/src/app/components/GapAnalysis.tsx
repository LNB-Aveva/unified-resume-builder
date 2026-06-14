"use client";

/*
 * GapAnalysis.tsx — Side-by-side resume vs. job gap analysis.
 *
 * WHAT THIS COMPONENT DOES:
 * User pastes both a job description AND their resume text.
 * We call POST /api/v1/gap and display:
 *   - An ATS score (0-100) with a letter grade
 *   - Two columns: skills you HAVE (green) vs skills you're MISSING (red)
 *   - A priority action list: "Add these X keywords to your resume"
 *
 * WHY TWO TEXTAREAS INSTEAD OF FILE UPLOAD?
 * File parsing (PDF, DOCX) requires extra libraries and server infrastructure.
 * Plain text paste works everywhere, needs no dependencies, and works 100%
 * of the time — even if the user copies from LinkedIn or a Google Doc.
 * We'll add file upload in a later session once the core UX is validated.
 *
 * WHAT IS "GAP ANALYSIS" (the concept)?
 * The "gap" is the difference between what the job WANTS and what your
 * resume SHOWS. Green = you have it. Red = you don't (but should add it).
 * This is exactly how Jobscan and Teal show their keyword comparison.
 */

import { useState } from "react";

interface ATSScore {
  overall_score: number;
  grade: string;
  grade_label: string;
  hard_skills_score: number;
  soft_skills_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  matched_hard_skills: string[];
  missing_hard_skills: string[];
  matched_soft_skills: string[];
  missing_soft_skills: string[];
  total_job_keywords: number;
  total_matched: number;
  total_missing: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const GRADE_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  B: { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200"    },
  C: { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200"   },
  D: { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-200"  },
  F: { bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200"     },
};

export default function GapAnalysis() {
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ATSScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!jobText.trim() || !resumeText.trim()) {
      setError("Please paste both a job description and your resume text.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_text: jobText, resume_text: resumeText }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch {
      setError("Could not connect to the backend. Make sure the FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  const gradeStyle = result ? (GRADE_STYLES[result.grade] ?? GRADE_STYLES["F"]) : null;

  // Score bar width capped at 100%
  const barWidth = result ? `${Math.min(result.overall_score, 100)}%` : "0%";

  return (
    <div className="space-y-6">
      {/* Two-column paste area */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Job Description
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={12}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y"
          />
          <p className="text-xs text-gray-400">
            {jobText.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Your Resume
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here (plain text — copy from Word, Google Docs, or PDF)..."
            rows={12}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y"
          />
          <p className="text-xs text-gray-400">
            {resumeText.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Analyzing your gap...
          </span>
        ) : (
          "Analyze My Gap"
        )}
      </button>

      {/* Results */}
      {result && gradeStyle && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-6">

          {/* Score header */}
          <div className="flex items-center gap-4">
            <div
              className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ring-2 ${gradeStyle.bg} ${gradeStyle.ring}`}
            >
              <span className={`text-3xl font-black ${gradeStyle.text}`}>
                {result.grade}
              </span>
              <span className={`text-xs font-semibold ${gradeStyle.text} opacity-70`}>
                Grade
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-end justify-between mb-1">
                <p className="text-lg font-bold text-gray-900">
                  {result.overall_score}
                  <span className="text-sm font-normal text-gray-400">/100</span>
                </p>
                <p className={`text-sm font-semibold ${gradeStyle.text}`}>
                  {result.grade_label}
                </p>
              </div>
              {/* Score bar */}
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: barWidth,
                    background:
                      result.overall_score >= 80
                        ? "#10b981"
                        : result.overall_score >= 60
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  Hard skills: {result.hard_skills_score}%
                </p>
                <p className="text-xs text-gray-400">
                  Soft skills: {result.soft_skills_score}%
                </p>
              </div>
            </div>
          </div>

          {/* ATS context message */}
          {result.overall_score < 60 && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <strong>ATS Risk:</strong> Scores below 60% are typically auto-rejected before
              a human reads the resume. Adding {result.total_missing} missing keywords
              could push this above 70%.
            </div>
          )}
          {result.overall_score >= 60 && result.overall_score < 80 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
              <strong>Getting closer:</strong> Add{" "}
              {Math.ceil(result.total_missing * 0.5)} more missing keywords to reach
              a strong match (80%+).
            </div>
          )}
          {result.overall_score >= 80 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              <strong>Strong match!</strong> Your resume is well-aligned with this role.
              Focus on tailoring your bullet points to naturally include any remaining keywords.
            </div>
          )}

          {/* Side-by-side skill columns */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Matched — green */}
            <div className="rounded-xl bg-white border border-emerald-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                  ✓
                </span>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Skills You Have ({result.total_matched})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.length > 0 ? (
                  result.matched_keywords.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 capitalize"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">None matched yet</p>
                )}
              </div>
            </div>

            {/* Missing — red */}
            <div className="rounded-xl bg-white border border-red-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  ✗
                </span>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Missing Keywords ({result.total_missing})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.length > 0 ? (
                  result.missing_keywords.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 capitalize"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 italic font-medium">
                    All keywords matched!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action hint */}
          {result.missing_keywords.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                What to do next
              </p>
              <p className="text-sm text-gray-600">
                Add these top missing keywords naturally into your resume bullet points:{" "}
                <span className="font-semibold text-gray-900">
                  {result.missing_keywords.slice(0, 5).join(", ")}
                  {result.missing_keywords.length > 5
                    ? ` +${result.missing_keywords.length - 5} more`
                    : ""}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
