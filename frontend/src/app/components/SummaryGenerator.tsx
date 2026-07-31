"use client";

import { useState } from "react";
import { SummaryResponse, API_URL, connectionError } from "../types";
import { useLoadingMessages } from "../hooks/useLoadingMessages";
import { authFetch } from "../lib/authFetch";
import Spinner from "./Spinner";
import { DEMO_JOB_TITLE, DEMO_JOB_DESCRIPTION, DEMO_EXPERIENCE_BULLETS, DEMO_YEARS_EXPERIENCE, DEMO_SKILLS } from "../lib/demoData";
import TryDemoButton from "./TryDemoButton";

const LOADING_MESSAGES = [
  "Sending to AI model...",
  "Model is thinking... (first call can take ~15s)",
  "Generating your summary...",
  "Almost there...",
];

export default function SummaryGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceBullets, setExperienceBullets] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState("");

  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { loadingMsg, start: startLoading, stop: stopLoading } = useLoadingMessages(LOADING_MESSAGES);

  async function handleGenerate() {
    if (!jobTitle.trim() || !jobDescription.trim() || !experienceBullets.trim()) {
      setError("Please fill in Job Title, Job Description, and Your Experience.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    startLoading();

    try {
      const res = await authFetch(`${API_URL}/api/v1/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle.trim(),
          job_description: jobDescription.trim(),
          experience_bullets: experienceBullets.trim(),
          years_experience: parseInt(yearsExperience) || 0,
          skills: skills.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail ?? `Server error ${res.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(connectionError(err));
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordCountColor =
    !result ? "" :
    result.word_count < 30 ? "text-amber-600" :
    result.word_count > 80 ? "text-amber-600" :
    "text-emerald-600";

  return (
    <div className="space-y-6">

      {/* ── Form grid ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Job Title */}
        <div className="space-y-1.5">
          <label htmlFor="sum-job-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Job Title <span className="text-red-400">*</span>
          </label>
          <input
            id="sum-job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Years of experience */}
        <div className="space-y-1.5">
          <label htmlFor="sum-years" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Years of Experience
          </label>
          <input
            id="sum-years"
            type="number"
            min="0"
            max="40"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="e.g. 5"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Skills */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="sum-skills" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Key Skills (comma-separated)
          </label>
          <input
            id="sum-skills"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Python, React, AWS, Docker, PostgreSQL"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Job description */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="sum-jd" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Job Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="sum-jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description (first 2-3 paragraphs is enough)..."
            rows={5}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
        </div>

        {/* Experience bullets */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="sum-exp" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Your Experience Bullets <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1">
            Copy 3-5 bullet points from your resume — the AI will rewrite them into a summary paragraph.
          </p>
          <textarea
            id="sum-exp"
            value={experienceBullets}
            onChange={(e) => setExperienceBullets(e.target.value)}
            placeholder={"- Built REST APIs with FastAPI serving 10k daily requests\n- Led migration from monolith to microservices (reduced deploy time 60%)\n- Mentored 3 junior engineers on best practices"}
            rows={5}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
        </div>
      </div>

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

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner>{loadingMsg}</Spinner>
          ) : (
            "Generate Professional Summary"
          )}
        </button>
        {!jobTitle.trim() && !experienceBullets.trim() && (
          <TryDemoButton onClick={() => { setJobTitle(DEMO_JOB_TITLE); setJobDescription(DEMO_JOB_DESCRIPTION); setExperienceBullets(DEMO_EXPERIENCE_BULLETS); setYearsExperience(DEMO_YEARS_EXPERIENCE); setSkills(DEMO_SKILLS); }} />
        )}
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-6 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Generated Summary</span>
            </div>
            <span className={`text-xs font-semibold ${wordCountColor}`}>
              {result.word_count} words
              {result.word_count < 30 && " — too short"}
              {result.word_count > 80 && " — consider trimming"}
              {result.word_count >= 30 && result.word_count <= 80 && " — good length"}
            </span>
          </div>

          {/* The summary text */}
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 p-4">
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{result.summary}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
              className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 px-4 py-3">
            <svg className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs text-amber-800 dark:text-amber-300"><span className="font-semibold">Tip:</span> {result.tip}</p>
          </div>

          {/* Model attribution */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
            Generated by {result.model_used} via HuggingFace Inference API
          </p>
        </div>
      )}
    </div>
  );
}
