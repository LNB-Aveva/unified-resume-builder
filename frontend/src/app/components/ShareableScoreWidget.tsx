"use client";

import { useState } from "react";
import { ATSScore, API_URL, connectionError } from "../types";
import { authFetch } from "../lib/authFetch";
import { createClient } from "../lib/supabase/client";
import { getScoreStyle } from "../lib/score-styles";
import Spinner from "./Spinner";

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export default function ShareableScoreWidget() {
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [score, setScore] = useState<ATSScore | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  async function handleGenerate() {
    if (!jobText.trim() || !resumeText.trim()) {
      setError("Paste both a job description and your resume text to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    setShareUrl(null);
    setShareId(null);
    setScore(null);

    try {
      const res = await authFetch(`${API_URL}/api/v1/gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_text: jobText, resume_text: resumeText }),
      });
      if (res.status === 401) throw new Error("Sign in to generate a shareable score link.");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: ATSScore = await res.json();

      const id = generateId();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to share a score.");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error: dbError } = await supabase.from("shared_scores").insert({
        id,
        user_id: user.id,
        overall_score: data.overall_score,
        grade: data.grade,
        grade_label: data.grade_label,
        matched_keywords: data.matched_keywords,
        missing_keywords: data.missing_keywords,
        total_matched: data.total_matched,
        total_missing: data.total_missing,
        total_job_keywords: data.total_job_keywords,
        job_role_hint: jobText.slice(0, 200).trim(),
        expires_at: expiresAt,
      });
      if (dbError) throw new Error("Could not save your score. Please try again.");

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv";
      setShareUrl(`${siteUrl}/score/${id}`);
      setShareId(id);
      setScore(data);
    } catch (err) {
      setError(connectionError(err));
    } finally {
      setLoading(false);
    }
  }

  async function revokeShareLink() {
    if (!shareId) return;
    setRevoking(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from("shared_scores").delete().eq("id", shareId);
      if (dbError) throw new Error("Could not revoke this link. Please try again.");
      setShareUrl(null);
      setShareId(null);
      setScore(null);
    } catch (err) {
      setError(connectionError(err));
    } finally {
      setRevoking(false);
    }
  }

  function copyToClipboard() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const style = score ? getScoreStyle(score.overall_score) : null;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ssw-jd" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Job Description
          </label>
          <textarea
            id="ssw-jd"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description — title, requirements, responsibilities..."
            rows={8}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
        </div>
        <div>
          <label htmlFor="ssw-resume" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Your Resume (plain text)
          </label>
          <textarea
            id="ssw-resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume as plain text — copy from Word, Google Docs, or a PDF text layer..."
            rows={8}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-y"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !jobText.trim() || !resumeText.trim()}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner>Analyzing &amp; creating link…</Spinner> : "Generate My ATS Score Link"}
      </button>

      {shareUrl && score && style && (
        <div className={`rounded-2xl border ${style.result} p-6 space-y-5 animate-in fade-in duration-300`}>
          {/* Score summary */}
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  className={style.ring}
                  strokeWidth="3"
                  strokeDasharray="97.4"
                  strokeDashoffset={97.4 * (1 - score.overall_score / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${style.label}`}>
                {Math.round(score.overall_score)}%
              </span>
            </div>
            <div>
              <p className={`text-lg font-bold ${style.label}`}>{score.grade_label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {score.total_matched} of {score.total_job_keywords} keywords matched
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {score.total_missing} keywords missing from your resume
              </p>
            </div>
          </div>

          {score.domain_warning && (
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-4 py-3 text-sm text-purple-800 dark:text-purple-200">
              <strong>Limited coverage:</strong> {score.domain_warning}
            </div>
          )}

          {/* Share URL row */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Your shareable score link
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                {shareUrl}
              </code>
              <button
                onClick={copyToClipboard}
                className="shrink-0 min-h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={revokeShareLink}
                disabled={revoking}
                className="shrink-0 min-h-11 rounded-lg border border-red-200 dark:border-red-800 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors duration-150"
              >
                {revoking ? "Revoking…" : "Revoke"}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Anyone with this link can view your ATS score. Link expires in 30 days.
              Your resume text is never stored — only the score and keyword lists.
            </p>
          </div>

          {/* Sign-up nudge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Want to fix the {score.total_missing} missing keywords? Get fair-use AI rewrites, formatting checks, and PDF export with a free account.
            </p>
            <a
              href="/sign-up"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
            >
              Fix It Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
