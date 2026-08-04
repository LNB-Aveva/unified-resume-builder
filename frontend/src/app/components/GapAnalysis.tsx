"use client";

import { useState, useMemo } from "react";
import { ATSScore, API_URL, connectionError } from "../types";
import { authFetch } from "../lib/authFetch";
import Spinner from "./Spinner";
import { DEMO_JOB_DESCRIPTION, DEMO_RESUME_TEXT } from "../lib/demoData";
import TryDemoButton from "./TryDemoButton";

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
  const jobWordCount = useMemo(() => jobText.trim().split(/\s+/).filter(Boolean).length, [jobText]);
  const resumeWordCount = useMemo(() => resumeText.trim().split(/\s+/).filter(Boolean).length, [resumeText]);

  async function handleAnalyze() {
    if (!jobText.trim() || !resumeText.trim()) {
      setError("Please paste both a job description and your resume text.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await authFetch(`${API_URL}/api/v1/gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_text: jobText, resume_text: resumeText }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(connectionError(err));
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
          <label htmlFor="gap-job-desc" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Job Description
          </label>
          <textarea
            id="gap-job-desc"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={12}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {jobWordCount} words
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="gap-resume" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Your Resume
          </label>
          <textarea
            id="gap-resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here (plain text — copy from Word, Google Docs, or PDF)..."
            rows={12}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {resumeWordCount} words
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner>Analyzing your gap...</Spinner>
          ) : (
            "Analyze My Gap"
          )}
        </button>
        {!jobText.trim() && !resumeText.trim() && (
          <TryDemoButton onClick={() => { setJobText(DEMO_JOB_DESCRIPTION); setResumeText(DEMO_RESUME_TEXT); }} />
        )}
      </div>

      {/* Results */}
      {result && gradeStyle && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 space-y-6">

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
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.overall_score}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/100</span>
                </p>
                <p className={`text-sm font-semibold ${gradeStyle.text}`}>
                  {result.grade_label}
                </p>
              </div>
              {/* Score bar */}
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: barWidth,
                    background:
                      result.overall_score >= 70
                        ? "#10b981"
                        : result.overall_score >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hard skills: {result.hard_skills_score}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Soft skills: {result.soft_skills_score}%
                </p>
              </div>
            </div>
          </div>

          {/* ATS context message */}
          {result.overall_score < 50 && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <strong>ATS Risk:</strong> Scores below 50% are typically auto-rejected before
              a human reads the resume. Adding {result.total_missing} missing keywords
              could push this above 65%.
            </div>
          )}
          {result.overall_score >= 50 && result.overall_score < 70 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
              <strong>Getting closer:</strong> Add{" "}
              {Math.ceil(result.total_missing * 0.5)} more missing keywords to reach
              a strong match (70%+).
            </div>
          )}
          {result.overall_score >= 70 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              <strong>Strong match!</strong> Your resume is well-aligned with this role.
              Focus on tailoring your bullet points to naturally include any remaining keywords.
            </div>
          )}

          {/* Hard Skills breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Hard Skills ({result.matched_hard_skills.length}/{result.matched_hard_skills.length + result.missing_hard_skills.length})
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 p-3 space-y-2">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Found in your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_hard_skills.length > 0 ? (
                    result.matched_hard_skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 capitalize">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">None matched</p>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-red-100 dark:border-red-800 p-3 space-y-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Add to your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_hard_skills.length > 0 ? (
                    result.missing_hard_skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-300 capitalize">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-600 italic font-medium">All hard skills matched!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Soft Skills breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Soft Skills ({result.matched_soft_skills.length}/{result.matched_soft_skills.length + result.missing_soft_skills.length})
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 p-3 space-y-2">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Found in your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_soft_skills.length > 0 ? (
                    result.matched_soft_skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">None matched</p>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-red-100 dark:border-red-800 p-3 space-y-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Add to your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_soft_skills.length > 0 ? (
                    result.missing_soft_skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-300 capitalize">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-600 italic font-medium">All soft skills matched!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action hint */}
          {result.missing_keywords.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                What to do next
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add these top missing keywords naturally into your resume bullet points:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
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
