"use client";

/*
 * AnalyzerDemo.tsx — Interactive job description keyword extractor.
 *
 * WHY "use client"?
 * This component needs:
 *   - useState (to hold the job text the user types)
 *   - Event handlers (onClick, onChange — user interactions)
 * Server Components can't do either. So we mark this file as a Client
 * Component. Only this file and what it imports runs in the browser.
 * The rest of the page (hero, how-it-works, footer) stays as a Server
 * Component — no JS sent to the browser for those sections.
 *
 * WHY FETCH DIRECTLY INSTEAD OF A SERVER ACTION?
 * We're calling an external API server (FastAPI at :8000), not Next.js's
 * own server. Server Actions are for mutations within Next.js itself.
 * For calling external APIs, client-side fetch is the right tool.
 */

import { useState } from "react";

// Type matches the JobAnalysis schema from our Python backend
interface JobAnalysis {
  job_title: string;
  company: string | null;
  hard_skills: string[];
  soft_skills: string[];
  required_experience: string | null;
  keywords: string[];
  responsibilities: string[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AnalyzerDemo() {
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<JobAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!jobText.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: jobText }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: JobAnalysis = await res.json();
      setResult(data);
    } catch {
      setError(
        "Could not connect to the backend. Make sure the FastAPI server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input area */}
      <div className="space-y-3">
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste a full job description here — title, requirements, responsibilities, everything..."
          rows={10}
          className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y"
        />

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
              Analyzing...
            </span>
          ) : (
            "Extract ATS Keywords"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-5 animate-in fade-in duration-300">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Detected role
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {result.job_title}
              {result.company && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  @ {result.company}
                </span>
              )}
            </h3>
            {result.required_experience && (
              <p className="mt-1 text-sm text-gray-500">
                {result.required_experience}
              </p>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Keywords" value={result.keywords.length} color="indigo" />
            <StatCard label="Hard Skills" value={result.hard_skills.length} color="blue" />
            <StatCard label="Soft Skills" value={result.soft_skills.length} color="violet" />
          </div>

          {/* Hard skills */}
          {result.hard_skills.length > 0 && (
            <SkillGroup
              title="Hard Skills"
              skills={result.hard_skills}
              chipClass="bg-blue-50 text-blue-700 border-blue-200"
            />
          )}

          {/* Soft skills */}
          {result.soft_skills.length > 0 && (
            <SkillGroup
              title="Soft Skills"
              skills={result.soft_skills}
              chipClass="bg-violet-50 text-violet-700 border-violet-200"
            />
          )}

          <p className="text-xs text-gray-400 pt-2">
            These {result.keywords.length} keywords are what ATS systems scan for.
            Next step: compare your resume against them.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "indigo" | "blue" | "violet";
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function SkillGroup({
  title,
  skills,
  chipClass,
}: {
  title: string;
  skills: string[];
  chipClass: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${chipClass}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
