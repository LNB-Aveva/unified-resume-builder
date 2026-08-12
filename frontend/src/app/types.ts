export interface JobAnalysis {
  job_title: string;
  company: string | null;
  hard_skills: string[];
  soft_skills: string[];
  required_experience: string | null;
  keywords: string[];
  responsibilities: string[];
  language_warning?: string | null;
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
  domain_warning?: string | null;
  language_warning?: string | null;
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
  language_warning?: string | null;
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

export function extractApiDetail(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const { detail } = body as { detail?: unknown };
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "object" && first !== null && "msg" in first) {
      return String((first as { msg: unknown }).msg);
    }
  }
  return fallback;
}

export function connectionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "Failed to fetch" || msg === "Load failed") {
    return (
      "Could not reach the API server. " +
      "Check your connection, wait a moment, and try again."
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
  if (err instanceof SyntaxError || msg.includes("Unexpected token") || msg.includes("not valid JSON")) {
    return (
      "The server returned an unexpected response. " +
      "It may be restarting — please wait 30–60 seconds and try again."
    );
  }
  if (/^Server error:?\s*5\d\d$/.test(msg)) {
    return "The server encountered a temporary error. Please try again shortly.";
  }
  if (
    msg.includes("Not authenticated") ||
    msg.includes("Invalid authentication token") ||
    msg.includes("Could not validate credentials") ||
    /^Server error:?\s*401$/.test(msg)
  ) {
    return "Your session has expired. Please refresh the page and sign in again.";
  }
  return msg || "Something went wrong. Please try again.";
}
