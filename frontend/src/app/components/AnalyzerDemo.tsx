"use client";

import { useState } from "react";
import { JobAnalysis, API_URL, connectionError } from "../types";
import Spinner from "./Spinner";
import { DEMO_JOB_DESCRIPTION } from "../lib/demoData";
import TryDemoButton from "./TryDemoButton";

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
    } catch (err) {
      setError(connectionError(err));
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
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
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
              <Spinner>Analyzing...</Spinner>
            ) : (
              "Extract ATS Keywords"
            )}
          </button>
          {!jobText.trim() && (
            <TryDemoButton onClick={() => setJobText(DEMO_JOB_DESCRIPTION)} />
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 space-y-5 animate-in fade-in duration-300">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Detected role
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.job_title}
              {result.company && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
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
            <StatCard label="Total keywords" value={result.keywords.length} color="indigo" />
            <StatCard label="Hard skills" value={result.hard_skills.length} color="blue" />
            <StatCard label="Soft skills" value={result.soft_skills.length} color="violet" />
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

          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
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
    indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
    violet: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
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
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
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
