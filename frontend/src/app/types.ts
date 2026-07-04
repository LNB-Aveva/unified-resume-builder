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
