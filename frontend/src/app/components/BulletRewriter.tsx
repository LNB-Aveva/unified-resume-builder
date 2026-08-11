"use client";

import { useState } from "react";
import { RewriteResponse, API_URL, connectionError } from "../types";
import { useLoadingMessages } from "../hooks/useLoadingMessages";
import { authFetch } from "../lib/authFetch";
import Spinner from "./Spinner";
import { DEMO_JOB_TITLE, DEMO_MISSING_KEYWORDS, DEMO_WEAK_BULLETS } from "../lib/demoData";
import TryDemoButton from "./TryDemoButton";

const LOADING_MESSAGES = [
  "Sending to AI model...",
  "Model is thinking... (first call can take ~15s)",
  "Analysing keywords to weave in...",
  "Rewriting your bullets...",
  "Almost there...",
];

function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return text;

  // Build a regex that matches any of the keywords (case-insensitive, whole-word-ish)
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    new RegExp(`^(${escaped.join("|")})$`, "i").test(part) ? (
      <mark key={i} className="bg-emerald-100 text-emerald-800 rounded px-0.5 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function BulletRewriter() {
  const [jobTitle, setJobTitle] = useState("");
  const [missingKeywords, setMissingKeywords] = useState("");
  const [bullets, setBullets] = useState("");

  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const { loadingMsg, start: startLoading, stop: stopLoading } = useLoadingMessages(LOADING_MESSAGES);

  const bulletLines = bullets.trim().split("\n").filter((l) => l.trim()).length;
  const overLimit = bulletLines > 5;

  async function handleRewrite() {
    if (!jobTitle.trim()) {
      setError("Please enter the Job Title.");
      return;
    }
    if (!bullets.trim()) {
      setError("Please paste at least one bullet point.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    startLoading();

    try {
      const res = await authFetch(`${API_URL}/api/v1/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle.trim(),
          missing_keywords: missingKeywords.trim(),
          bullets: bullets.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Server error ${res.status}`);
      }

      setResult(await res.json());
    } catch (err) {
      setError(connectionError(err));
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  async function handleCopyOne(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard access denied or unavailable — no-op
    }
  }

  async function handleCopyAll() {
    if (!result) return;
    const all = result.rewrites.map((r) => `• ${r.rewritten}`).join("\n");
    try {
      await navigator.clipboard.writeText(all);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // clipboard access denied or unavailable — no-op
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Form ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Job Title */}
        <div className="space-y-1.5">
          <label htmlFor="br-job-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Job Title <span className="text-red-400">*</span>
          </label>
          <input
            id="br-job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Missing Keywords */}
        <div className="space-y-1.5">
          <label htmlFor="br-keywords" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Missing Keywords
            <span className="ml-1.5 font-normal text-gray-500 dark:text-gray-400 text-xs">(from Gap Analysis above)</span>
          </label>
          <input
            id="br-keywords"
            type="text"
            value={missingKeywords}
            onChange={(e) => setMissingKeywords(e.target.value)}
            placeholder="e.g. Docker, Kubernetes, CI/CD, microservices"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Bullets textarea */}
        <div className="sm:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="br-bullets" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Your Resume Bullets <span className="text-red-400">*</span>
            </label>
            <span className={`text-xs font-medium ${overLimit ? "text-red-500" : "text-gray-400"}`}>
              {bulletLines}/5 bullets {overLimit && "— only first 5 will be rewritten"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Paste weak or generic bullets — one per line. AI rewrites each to include your missing keywords.
          </p>
          <textarea
            id="br-bullets"
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={"- Worked on backend services\n- Helped with deployments\n- Wrote code for the data pipeline"}
            rows={6}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y font-mono"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.includes("HUGGINGFACE_API_KEY") ? (
            <>
              <p className="font-semibold mb-1">API key not configured</p>
              <p>{error}</p>
              <p className="mt-2 text-xs">
                1. Go to{" "}
                <span className="font-mono bg-red-100 px-1 rounded">huggingface.co/settings/tokens</span>
                {" "}→ create a free Read token
                <br />
                2. Add it to{" "}
                <span className="font-mono bg-red-100 px-1 rounded">backend/.env</span>
                {" "}as{" "}
                <span className="font-mono bg-red-100 px-1 rounded">HUGGINGFACE_API_KEY=hf_...</span>
                <br />
                3. Restart the backend server
              </p>
            </>
          ) : (
            error
          )}
        </div>
      )}

      {/* Rewrite button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRewrite}
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner>{loadingMsg}</Spinner>
          ) : (
            "Rewrite Bullets with AI"
          )}
        </button>
        {!jobTitle.trim() && !bullets.trim() && (
          <TryDemoButton onClick={() => { setJobTitle(DEMO_JOB_TITLE); setMissingKeywords(DEMO_MISSING_KEYWORDS); setBullets(DEMO_WEAK_BULLETS); }} />
        )}
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="space-y-4">

          {/* Header row with "Copy All" */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {result.rewrites.length} bullet{result.rewrites.length !== 1 ? "s" : ""} rewritten
              </span>
            </div>

            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {copiedAll ? (
                <>
                  <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied all!
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy all rewrites
                </>
              )}
            </button>
          </div>

          {/* Before / After cards */}
          {result.rewrites.map((item, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              {/* Before */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Before</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.original || bullets.trim().split("\n").filter(l => l.trim())[i] || "—"}</p>
              </div>

              {/* After */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1.5">After</p>
                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                  {highlightKeywords(item.rewritten, item.keywords_woven)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  {/* Keywords added badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords_woven.length > 0 ? (
                      item.keywords_woven.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                        >
                          + {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">No keywords woven in</span>
                    )}
                  </div>

                  {/* Copy this bullet */}
                  <button
                    onClick={() => handleCopyOne(item.rewritten, i)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shrink-0"
                  >
                    {copiedIndex === i ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Tip */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 px-4 py-3">
            <svg className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs text-amber-800 dark:text-amber-300"><span className="font-semibold">Tip:</span> {result.tip}</p>
          </div>

          {/* Regenerate + model attribution */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleRewrite}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rewrite Again
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generated by {result.model_used} via HuggingFace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
