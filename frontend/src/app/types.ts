export interface JobAnalysis {
  job_title: string;
  company: string | null;
  hard_skills: string[];
  soft_skills: string[];
  required_experience: string | null;
  keywords: string[];
  responsibilities: string[];
}

export interface ATSScore {
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

export interface ComplianceCheck {
  rule: string;
  passed: boolean;
  severity: string;
  message: string;
}

export interface ComplianceReport {
  overall_score: number;
  critical_issues: number;
  warnings: number;
  suggestions_failed: number;
  passed_count: number;
  total_checks: number;
  checks: ComplianceCheck[];
}

export interface SummaryResponse {
  summary: string;
  word_count: number;
  model_used: string;
  tip: string;
}

export interface RewrittenBullet {
  original: string;
  rewritten: string;
  keywords_woven: string[];
}

export interface RewriteResponse {
  rewrites: RewrittenBullet[];
  model_used: string;
  tip: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
  word_count: number;
  model_used: string;
  tip: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function connectionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "Failed to fetch" || msg === "Load failed") {
    return (
      "Could not reach the API server. " +
      "The backend may be waking up (free tier sleeps after 15 min of inactivity). " +
      "Please wait 30–60 seconds and try again."
    );
  }
  if (msg.includes("Request timed out")) {
    return (
      "The request took too long and was stopped. " +
      "Please wait a moment and try again."
    );
  }
  if (msg.includes("AI service") || msg.includes("AI model timed out") || msg.includes("AI generation failed")) {
    return (
      "AI features are temporarily unavailable. " +
      "This usually resolves within a minute — please try again shortly."
    );
  }
  return msg || "Something went wrong. Please try again.";
}
