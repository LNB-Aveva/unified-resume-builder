"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getSupabase, supabaseEnabled } from "../lib/supabase";

type Status = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

interface TrackedJob {
  id: string;
  company: string;
  title: string;
  url: string;
  status: Status;
  notes: string;
  resumeId: string | null;
  dateAdded: string;
}

interface ResumeBrief {
  id: string;
  title: string;
}

const STORAGE_KEY = "resumeai_jobs";

const STATUS_CONFIG: Record<Status, { label: string; color: string; dot: string }> = {
  Saved:     { label: "Saved",     color: "bg-gray-100 text-gray-600",       dot: "bg-gray-400" },
  Applied:   { label: "Applied",   color: "bg-blue-50 text-blue-700",        dot: "bg-blue-500" },
  Interview: { label: "Interview", color: "bg-amber-50 text-amber-700",      dot: "bg-amber-500" },
  Offer:     { label: "Offer",     color: "bg-emerald-50 text-emerald-700",  dot: "bg-emerald-500" },
  Rejected:  { label: "Rejected",  color: "bg-red-50 text-red-600",          dot: "bg-red-400" },
};

const STATUS_ORDER: Status[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── localStorage helpers (fallback when Supabase is not configured) ──

function loadJobsLocal(): TrackedJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedJob[]) : [];
  } catch {
    return [];
  }
}

function saveJobsLocal(jobs: TrackedJob[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    return true;
  } catch {
    return false;
  }
}

// ── Supabase helpers ──

async function ensureAnonSession(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: { session }, error: sessionError } = await sb.auth.getSession();
  if (sessionError) throw sessionError;
  if (session?.user?.id) return session.user.id;

  const { data, error } = await sb.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) return null;
  return data.user.id;
}

async function loadJobsSupabase(): Promise<TrackedJob[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const userId = await ensureAnonSession();
  if (!userId) return [];

  const { data, error } = await sb
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("date_added", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    company: row.company,
    title: row.title,
    url: row.url ?? "",
    status: row.status as Status,
    notes: row.notes ?? "",
    resumeId: row.resume_id ?? null,
    dateAdded: row.date_added,
  }));
}

async function insertJobSupabase(job: TrackedJob): Promise<boolean> {
  try {
    const sb = getSupabase();
    if (!sb) return false;

    const userId = await ensureAnonSession();
    if (!userId) return false;

    const { error } = await sb.from("jobs").insert({
      id: job.id,
      user_id: userId,
      company: job.company,
      title: job.title,
      url: job.url || null,
      status: job.status,
      notes: job.notes || null,
      resume_id: job.resumeId || null,
      date_added: job.dateAdded,
    });

    return !error;
  } catch {
    return false;
  }
}

async function loadResumesSupabase(): Promise<ResumeBrief[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user?.id || session.user.is_anonymous) return [];

  const { data, error } = await sb
    .from("resumes")
    .select("id, title")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

async function updateJobSupabase(id: string, fields: Partial<{ status: string; notes: string; resume_id: string | null }>): Promise<boolean> {
  try {
    const sb = getSupabase();
    if (!sb) return false;

    const userId = await ensureAnonSession();
    if (!userId) return false;

    const { error } = await sb.from("jobs").update(fields).eq("id", id).eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}

async function deleteJobSupabase(id: string): Promise<boolean> {
  try {
    const sb = getSupabase();
    if (!sb) return false;

    const userId = await ensureAnonSession();
    if (!userId) return false;

    const { error } = await sb.from("jobs").delete().eq("id", id).eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}

// ── Component ──

export default function JobTracker() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [useSupabase, setUseSupabase] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [resumes, setResumes] = useState<ResumeBrief[]>([]);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (supabaseEnabled) {
          const sessionReady = await ensureAnonSession();
          const sbJobs = sessionReady ? await loadJobsSupabase() : [];
          if (sessionReady) {
            // Migrate browser-only rows without overwriting cloud rows.
            const localJobs = loadJobsLocal();
            if (localJobs.length > 0) {
              const cloudIds = new Set(sbJobs.map((job) => job.id));
              for (const job of localJobs.filter((job) => !cloudIds.has(job.id))) {
                if (!(await insertJobSupabase(job))) {
                  throw new Error("Failed to migrate a browser-saved job");
                }
              }
              const migrated = await loadJobsSupabase();
              setJobs(migrated);
              localStorage.removeItem(STORAGE_KEY);
            } else {
              setJobs(sbJobs);
            }
            setUseSupabase(true);
            const userResumes = await loadResumesSupabase();
            setResumes(userResumes);
          } else {
            setJobs(loadJobsLocal());
          }
        } else {
          setJobs(loadJobsLocal());
        }
      } catch {
        setJobs(loadJobsLocal());
        setUseSupabase(false);
        setSyncError(
          "Cloud storage is temporarily unavailable. Cloud jobs may be missing; new jobs will stay in this browser until you reload.",
        );
      } finally {
        setIsHydrated(true);
      }
    }
    init();
  }, []);

  const persistLocal = useCallback((updated: TrackedJob[]): boolean => {
    if (useSupabase) return true;
    const saved = saveJobsLocal(updated);
    if (!saved) {
      setSyncError("Your browser could not save the latest change. Check storage settings before leaving this page.");
    }
    return saved;
  }, [useSupabase]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: jobs.length };
    STATUS_ORDER.forEach((s) => { c[s] = jobs.filter((j) => j.status === s).length; });
    return c;
  }, [jobs]);

  const filtered = useMemo(
    () => filterStatus === "All" ? jobs : jobs.filter((j) => j.status === filterStatus),
    [jobs, filterStatus]
  );

  async function handleAdd() {
    if (!company.trim() || !title.trim()) {
      setFormError("Company and Job Title are required.");
      return;
    }
    const newJob: TrackedJob = {
      id: crypto.randomUUID(),
      company: company.trim(),
      title: title.trim(),
      url: url.trim(),
      notes: notes.trim(),
      resumeId: selectedResumeId || null,
      status: "Saved",
      dateAdded: new Date().toISOString(),
    };

    const updated = [newJob, ...jobs];
    if (useSupabase) {
      if (!(await insertJobSupabase(newJob))) {
        setFormError("Could not save this job to the cloud. Your form is still here; please try again.");
        setSyncError("Cloud sync failed. The last change was not saved.");
        return;
      }
    } else if (!saveJobsLocal(updated)) {
      setFormError("Your browser could not save this job. Check storage settings and try again.");
      return;
    }
    setJobs(updated);
    setSyncError(null);

    setCompany(""); setTitle(""); setUrl(""); setNotes(""); setSelectedResumeId("");
    setFormError("");
    setShowForm(false);
  }

  async function handleStatusChange(id: string, status: Status) {
    const updated = jobs.map((j) => j.id === id ? { ...j, status } : j);
    if (useSupabase && !(await updateJobSupabase(id, { status }))) {
      setSyncError("Cloud sync failed. The status change was not saved.");
      return;
    }
    if (!persistLocal(updated)) return;
    setJobs(updated);
    setSyncError(null);
  }

  async function handleResumeChange(id: string, resumeId: string | null) {
    const updated = jobs.map((j) => j.id === id ? { ...j, resumeId } : j);
    if (useSupabase && !(await updateJobSupabase(id, { resume_id: resumeId }))) {
      setSyncError("Cloud sync failed. The resume link was not saved.");
      return;
    }
    if (!persistLocal(updated)) return;
    setJobs(updated);
    setSyncError(null);
  }

  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNotesChange(id: string, newNotes: string) {
    const updated = jobs.map((j) => j.id === id ? { ...j, notes: newNotes } : j);
    setJobs(updated);
    persistLocal(updated);

    if (useSupabase) {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      notesTimerRef.current = setTimeout(() => {
        updateJobSupabase(id, { notes: newNotes }).then((saved) => {
          setSyncError(saved ? null : "Cloud sync failed. Your latest notes are visible here but are not saved.");
        });
      }, 500);
    }
  }

  async function handleDelete(id: string) {
    const updated = jobs.filter((j) => j.id !== id);
    if (useSupabase && !(await deleteJobSupabase(id))) {
      setSyncError("Cloud sync failed. The job was not deleted.");
      return;
    }
    if (!persistLocal(updated)) return;
    setJobs(updated);
    setSyncError(null);
    if (expandedId === id) setExpandedId(null);
  }

  if (!isHydrated) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading tracker...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {syncError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {syncError}
        </div>
      )}

      {/* ── Header row: status filter pills + Add button ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition
                ${filterStatus === s
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
              {s !== "All" && (
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              )}
              {s}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                ${filterStatus === s ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Add Job button */}
        <button
          onClick={() => { setShowForm((p) => !p); setFormError(""); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Save a Job
        </button>
      </div>

      {/* ── Add Job form ── */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Save a new job</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="jt-company" className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                id="jt-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={200}
                placeholder="e.g. Accenture"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="jt-title" className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                id="jt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g. Senior Software Engineer"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="jt-url" className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Job URL</label>
              <input
                id="jt-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                maxLength={2000}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="jt-notes" className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Notes</label>
              <textarea
                id="jt-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={20000}
                placeholder="e.g. Referral from John, $65k range, hybrid 2 days..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none"
              />
            </div>
            {resumes.length > 0 && (
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="jt-resume" className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Link Resume</label>
                <select
                  id="jt-resume"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 cursor-pointer"
                >
                  <option value="">No resume linked</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-xs text-red-600">{formError}</p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Save Job
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state — skeleton preview ── */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="text-center mb-2">
            <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {filterStatus === "All" ? "No jobs saved yet" : `No jobs with status "${filterStatus}"`}
            </p>
            {filterStatus === "All" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Click &ldquo;Save a Job&rdquo; above — your dashboard will look like this:
              </p>
            )}
          </div>

          {/* Skeleton job cards */}
          {filterStatus === "All" && (
            <div className="space-y-3 opacity-40 pointer-events-none select-none" aria-hidden="true">
              {[
                { title: "Senior Software Engineer", company: "Acme Corp", status: "Applied", color: "bg-blue-500" },
                { title: "Full Stack Developer", company: "TechStart Inc", status: "Interview", color: "bg-amber-500" },
                { title: "Backend Engineer", company: "CloudScale", status: "Saved", color: "bg-gray-400" },
              ].map((mock) => (
                <div key={mock.title} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{mock.company[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{mock.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{mock.company}</p>
                  </div>
                  <span className={`${mock.color} rounded-full px-2.5 py-0.5 text-xs font-semibold text-white`}>{mock.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Job cards ── */}
      <div className="space-y-3">
        {filtered.map((job) => {
          const cfg = STATUS_CONFIG[job.status];
          const isExpanded = expandedId === job.id;

          return (
            <div key={job.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-start gap-3 px-5 py-4">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {job.company.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {job.company}
                    {job.url && (
                      <>
                        {" · "}
                        <a
                          href={/^https?:\/\//i.test(job.url) ? job.url : `https://${job.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:underline"
                        >
                          View posting
                        </a>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value as Status)}
                    aria-label={`Status for ${job.title} at ${job.company}`}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 outline-none focus:border-indigo-400 cursor-pointer min-h-[44px]"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 pb-3 -mt-1">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Saved {formatDate(job.dateAdded)}</p>
                  {resumes.length > 0 && (
                    <select
                      value={job.resumeId ?? ""}
                      onChange={(e) => handleResumeChange(job.id, e.target.value || null)}
                      aria-label={`Linked resume for ${job.title}`}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 outline-none focus:border-indigo-400 cursor-pointer truncate max-w-[160px]"
                      title={job.resumeId ? resumes.find((r) => r.id === job.resumeId)?.title ?? "Unknown resume" : "Link a resume"}
                    >
                      <option value="">No resume</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    aria-expanded={isExpanded}
                    aria-label={`Notes for ${job.title}`}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition min-h-[44px]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notes
                    {job.notes && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(job.id)}
                    aria-label={`Delete ${job.title} at ${job.company}`}
                    className="rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition min-h-[44px] flex items-center"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expandable notes editor */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
                  <textarea
                    value={job.notes}
                    onChange={(e) => handleNotesChange(job.id, e.target.value)}
                    maxLength={20000}
                    placeholder="Add notes — salary range, referral, interview round, next steps..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {syncError ? "Check the warning above before leaving this page." : "Notes auto-save as you type."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Storage notice */}
      {jobs.length > 0 && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked
          {useSupabase ? " · Synced to cloud" : " · Saved in your browser · Clears if you clear browser data"}
        </p>
      )}
    </div>
  );
}
