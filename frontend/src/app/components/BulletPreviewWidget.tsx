"use client";

import { useState } from "react";
import { API_URL } from "../types";

const EXAMPLES = [
  "Responsible for managing the sales team and hitting targets",
  "Helped with customer service issues and resolved complaints",
  "Worked on improving the company website performance",
];

interface PreviewResult {
  original: string;
  rewritten: string;
  improvement: string;
}

export default function BulletPreviewWidget() {
  const [bullet, setBullet] = useState("");
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(false);

  async function handleRewrite() {
    const trimmed = bullet.trim();
    if (trimmed.length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/preview-rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: trimmed }),
      });
      if (res.status === 429) {
        setError("Preview limit reached. Create a free account for unlimited AI rewrites.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "Rewrite failed. Try again.");
      }
      const data: PreviewResult = await res.json();
      setResult(data);
      setUsed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
      {/* Example chips */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setBullet(ex); setResult(null); setError(null); }}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors truncate max-w-[260px]"
              title={ex}
            >
              &ldquo;{ex.length > 48 ? ex.slice(0, 48) + "…" : ex}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={bullet}
        onChange={(e) => { setBullet(e.target.value); setResult(null); setError(null); }}
        placeholder="Paste your resume bullet here, e.g. &quot;Responsible for managing the sales team&quot;"
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleRewrite}
        disabled={loading || bullet.trim().length < 10}
        className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 transition-all duration-200"
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Rewriting…
          </>
        ) : (
          <>
            Rewrite This Bullet
            <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-4" />
          <div className="h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
          {error.includes("limit") && (
            <a href="/sign-up" className="ml-2 font-semibold underline hover:no-underline">
              Create free account →
            </a>
          )}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-6 space-y-3">
          {/* Before */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Before</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.original}</p>
          </div>

          {/* Divider arrow */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
              {result.improvement}
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">After (AI rewritten)</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{result.rewritten}</p>
          </div>

          {/* Upsell CTA */}
          {used && (
            <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-800/50 p-5 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Rewrite all your bullets with keyword targeting — free with an account.
              </p>
              <a
                href="/sign-up"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
              >
                Get Full AI Toolkit Free
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
