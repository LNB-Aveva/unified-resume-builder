"use server";

import { createClient } from "@/app/lib/supabase/server";

export interface ResumeData {
  personal: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  skills: string;
  template: "classic" | "modern" | "minimal";
}

export interface ResumeSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  latest_version: number;
}

export interface ResumeVersion {
  id: string;
  version_number: number;
  resume_data: ResumeData;
  resume_text: string | null;
  created_at: string;
}

export async function createResume(
  title: string,
  data: ResumeData,
  resumeText?: string,
): Promise<{ id: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "Not authenticated" };

  const trimmed = title.trim();
  if (!trimmed || trimmed.length > 200)
    return { id: "", error: "Title must be 1-200 characters" };

  const { data: resume, error: insertErr } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title: trimmed })
    .select("id")
    .single();

  if (insertErr || !resume)
    return { id: "", error: "Failed to create resume." };

  const { error: versionErr } = await supabase
    .from("resume_versions")
    .insert({
      resume_id: resume.id,
      version_number: 1,
      resume_data: data,
      resume_text: resumeText ?? null,
    });

  if (versionErr)
    return { id: "", error: "Failed to save version." };

  return { id: resume.id };
}

export async function saveVersion(
  resumeId: string,
  data: ResumeData,
  resumeText?: string,
): Promise<{ version: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { version: 0, error: "Not authenticated" };

  const { data: resume } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) return { version: 0, error: "Resume not found." };

  const { data: latest } = await supabase
    .from("resume_versions")
    .select("version_number")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version_number ?? 0) + 1;

  const { error: versionErr } = await supabase
    .from("resume_versions")
    .insert({
      resume_id: resumeId,
      version_number: nextVersion,
      resume_data: data,
      resume_text: resumeText ?? null,
    });

  if (versionErr) return { version: 0, error: "Failed to save version." };

  await supabase
    .from("resumes")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  return { version: nextVersion };
}

export async function listResumes(): Promise<ResumeSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!resumes) return [];

  const result: ResumeSummary[] = [];
  for (const r of resumes) {
    const { data: ver } = await supabase
      .from("resume_versions")
      .select("version_number")
      .eq("resume_id", r.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    result.push({
      ...r,
      latest_version: ver?.version_number ?? 1,
    });
  }

  return result;
}

export async function loadResume(
  resumeId: string,
  versionNumber?: number,
): Promise<{ resume: { id: string; title: string } | null; version: ResumeVersion | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { resume: null, version: null, error: "Not authenticated" };

  const { data: resume } = await supabase
    .from("resumes")
    .select("id, title")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) return { resume: null, version: null, error: "Resume not found." };

  let query = supabase
    .from("resume_versions")
    .select("id, version_number, resume_data, resume_text, created_at")
    .eq("resume_id", resumeId);

  if (versionNumber) {
    query = query.eq("version_number", versionNumber);
  } else {
    query = query.order("version_number", { ascending: false }).limit(1);
  }

  const { data: version } = await query.single();

  if (!version) return { resume, version: null, error: "No versions found" };

  return {
    resume,
    version: version as ResumeVersion,
  };
}

export async function listVersions(
  resumeId: string,
): Promise<{ version_number: number; created_at: string }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: resume } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) return [];

  const { data } = await supabase
    .from("resume_versions")
    .select("version_number, created_at")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false });

  return data ?? [];
}

export async function renameResume(
  resumeId: string,
  newTitle: string,
): Promise<{ error?: string }> {
  const trimmed = newTitle.trim();
  if (!trimmed || trimmed.length > 200)
    return { error: "Title must be 1-200 characters" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("resumes")
    .update({ title: trimmed, updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  return error ? { error: "Failed to rename resume." } : {};
}

export async function deleteResume(
  resumeId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", user.id);

  return error ? { error: "Failed to delete resume." } : {};
}
