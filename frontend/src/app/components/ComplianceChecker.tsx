"use client";

import { useState } from "react";
import { ComplianceCheck, ComplianceReport, API_URL, connectionError } from "../types";
import Spinner from "./Spinner";

const SEVERITY_STYLES: Record<string, { badge: string; row: string; dot: string }> = {
  critical:   { badge: "bg-red-100 text-red-700",    row: "border-red-100 bg-red-50",    dot: "bg-red-500"   },
  warning:    { badge: "bg-amber-100 text-amber-700", row: "border-amber-100 bg-amber-50", dot: "bg-amber-500" },
  suggestion: { badge: "bg-blue-100 text-blue-700",   row: "border-blue-100 bg-blue-50",  dot: "bg-blue-500"  },
};

export default function ComplianceChecker() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(connectionError(err));
    } finally {
      setLoading(false);
    }
  }

  const failed = result ? result.checks.filter((c) => !c.passed) : [];
  const passed = result ? result.checks.filter((c) => c.passed) : [];

  return (
    <div className="space-y-6">
      {/* Resume textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Your Resume Text
        </label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your full resume here (plain text from Word, Google Docs, or copy from PDF)..."
          rows={10}
          className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleCheck}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Spinner>Checking compliance...</Spinner>
        ) : (
          "Run ATS Compliance Check"
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-5">

          {/* Score row */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white ring-2 ring-gray-200">
              <span className={`text-3xl font-black ${result.overall_score >= 80 ? "text-emerald-600" : result.overall_score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                {result.overall_score}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ 100</span>
            </div>

            <div className="flex-1 space-y-1">
              <p className="font-semibold text-gray-900">
                {result.passed_count} of {result.total_checks} checks passed
              </p>
              <div className="flex gap-3 text-xs">
                {result.critical_issues > 0 && (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {result.critical_issues} critical
                  </span>
                )}
                {result.warnings > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {result.warnings} warnings
                  </span>
                )}
                {result.suggestions_failed > 0 && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {result.suggestions_failed} suggestions
                  </span>
                )}
                {result.critical_issues === 0 && result.warnings === 0 && (
                  <span className="text-emerald-600 font-medium">No critical issues</span>
                )}
              </div>
            </div>
          </div>

          {/* Issues to fix */}
          {failed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Issues to fix
              </p>
              <div className="space-y-2">
                {failed.map((check) => {
                  const style = SEVERITY_STYLES[check.severity] ?? SEVERITY_STYLES.suggestion;
                  return (
                    <div
                      key={check.rule}
                      className={`rounded-xl border p-3 ${style.row}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {check.rule}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                              {check.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{check.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passing checks (collapsible feel — show as compact list) */}
          {passed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Passing checks ({passed.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {passed.map((check) => (
                  <span
                    key={check.rule}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {check.rule}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
