"use client";

import { useState } from "react";
import { CoverLetterResponse, API_URL } from "../types";
import { useLoadingMessages } from "../hooks/useLoadingMessages";
import Spinner from "./Spinner";

type Tone = "formal" | "conversational";

const LOADING_MESSAGES = [
  "Sending to AI model...",
  "Crafting your opening hook...",
  "Writing the body paragraphs...",
  "Polishing the closing...",
  "Almost there...",
];

function wordCountColor(count: number): string {
  if (count >= 250 && count <= 350) return "text-emerald-600";
  if (count >= 200 && count <= 400) return "text-amber-600";
  return "text-red-500";
}

function wordCountLabel(count: number): string {
  if (count < 200) return "too short";
  if (count >= 250 && count <= 350) return "ideal length";
  if (count > 400) return "consider trimming";
  return "slightly off target";
}

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState<Tone>("formal");

  const [result, setResult] = useState<CoverLetterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { loadingMsg, start: startLoading, stop: stopLoading } = useLoadingMessages(LOADING_MESSAGES, 4500);

  async function handleGenerate() {
    if (!jobTitle.trim() || !companyName.trim() || !jobDescription.trim() || !experienceSummary.trim()) {
      setError("Please fill in Job Title, Company, Job Description, and Your Key Experience.");
      return;
    }
    if (jobDescription.length > 900) {
      setError(`Job Description is too long (${jobDescription.length}/900 chars). Please trim it to the most relevant paragraphs.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    startLoading();

    try {
      const res = await fetch(`${API_URL}/api/v1/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle.trim(),
          company_name: companyName.trim(),
          job_description: jobDescription.trim(),
          experience_summary: experienceSummary.trim(),
          skills: skills.trim(),
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { detail?: string }).detail ?? `Server error ${res.status}`);
      }
      setResult(data as CoverLetterResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg === "Failed to fetch") {
        setError(
          "Could not reach the API server. " +
          "The backend may be waking up (free tier sleeps after 15 min of inactivity). " +
          "Please wait 30-60 seconds and try again."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6">

      {/* ── Tone switcher ── */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Tone:</span>
        <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
          {(["formal", "conversational"] as Tone[]).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition
                ${tone === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {tone === "formal"
            ? "Traditional business style · Dear Hiring Team"
            : "Warm & direct · Starts with a hook, no 'Dear...'"}
        </span>
      </div>

      {/* ── Form grid ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Job Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className={inputCls}
          />
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Company Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Accenture"
            className={inputCls}
          />
        </div>

        {/* Skills */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Key Skills
            <span className="ml-1.5 font-normal text-gray-400 text-xs">(optional — comma-separated)</span>
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Python, FastAPI, Docker, Kubernetes, React"
            className={inputCls}
          />
        </div>

        {/* Job Description */}
        <div className="sm:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Job Description <span className="text-red-400">*</span>
            </label>
            <span className={`text-xs font-medium ${jobDescription.length > 900 ? "text-red-500" : jobDescription.length > 800 ? "text-amber-600" : "text-gray-400"}`}>
              {jobDescription.length}/900 chars
            </span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the first 2-3 paragraphs of the job posting..."
            rows={5}
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Experience Summary */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Your Key Experience <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 -mt-1">
            Paste 3-5 achievement bullets from your resume. The AI uses these as evidence — no facts will be invented.
          </p>
          <textarea
            value={experienceSummary}
            onChange={(e) => setExperienceSummary(e.target.value)}
            placeholder={
              tone === "formal"
                ? "- Led backend migration reducing latency by 35%\n- Managed team of 4 engineers across 3 time zones\n- Built CI/CD pipeline cutting deploy time from 2 hours to 8 minutes"
                : "- Shipped 3 major product features that 10k users actually use\n- Cut infra costs by 40% by rightsizing our Kubernetes clusters\n- Mentored 2 junior devs — both got promoted within 18 months"
            }
            rows={5}
            className={`${inputCls} resize-y`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.includes("HUGGINGFACE_API_KEY") ? (
            <>
              <p className="font-semibold mb-1">API key not configured</p>
              <p>{error}</p>
              <p className="mt-2 text-xs">
                Add <span className="font-mono bg-red-100 px-1 rounded">HUGGINGFACE_API_KEY=hf_...</span>
                {" "}to <span className="font-mono bg-red-100 px-1 rounded">backend/.env</span> and restart the server.
              </p>
            </>
          ) : (
            error
          )}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Spinner>{loadingMsg}</Spinner>
        ) : (
          "Generate Cover Letter"
        )}
      </button>

      {/* ── Result ── */}
      {result && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                AI Generated Cover Letter
                <span className="ml-2 text-xs font-normal text-gray-500 capitalize">· {tone}</span>
              </span>
            </div>

            {/* Word count badge */}
            <span className={`text-xs font-semibold ${wordCountColor(result.word_count)}`}>
              {result.word_count} words · {wordCountLabel(result.word_count)}
            </span>
          </div>

          {/* Letter text */}
          <div className="rounded-xl bg-white border border-indigo-100 p-5">
            {result.cover_letter.split("\n\n").map((para, i) => (
              <p key={i} className={`text-sm text-gray-800 leading-relaxed ${i > 0 ? "mt-4" : ""}`}>
                {para}
              </p>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              {copied ? (
                <>
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to clipboard
                </>
              )}
            </button>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>

            {/* Tone switcher in result (quick switch without scrolling up) */}
            <button
              onClick={() => { setTone(tone === "formal" ? "conversational" : "formal"); setResult(null); }}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Try {tone === "formal" ? "conversational" : "formal"} tone
            </button>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <svg className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs text-amber-800"><span className="font-semibold">Tip:</span> {result.tip}</p>
          </div>

          <p className="text-xs text-gray-400 text-right">
            Generated by {result.model_used} via HuggingFace Inference API
          </p>
        </div>
      )}
    </div>
  );
}
