"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "../types";
import { authFetch } from "../lib/authFetch";
import Spinner from "./Spinner";
import { DEMO_PERSONAL, DEMO_SUMMARY, DEMO_EXPERIENCE, DEMO_EDUCATION, DEMO_RESUME_SKILLS } from "../lib/demoData";
import TryDemoButton from "./TryDemoButton";
import { createResume, saveVersion, type ResumeData } from "../actions/resume";

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  bulletsText: string;  // newline-separated in the form; split on submit
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

type TemplateId = "classic" | "modern" | "minimal";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  tagline: string;
  preview: React.ReactNode;
}[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "Indigo accents · ruled sections",
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-1.5">
        {/* name bar */}
        <div className="h-2 w-3/4 rounded bg-indigo-500" />
        {/* contact */}
        <div className="h-1 w-1/2 rounded bg-gray-300" />
        {/* thick rule */}
        <div className="mt-0.5 h-0.5 w-full rounded bg-indigo-400" />
        {/* section */}
        <div className="mt-1 h-1 w-1/3 rounded bg-indigo-400" />
        <div className="h-px w-full rounded bg-indigo-200" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="h-1 w-5/6 rounded bg-gray-200" />
        {/* section */}
        <div className="mt-1 h-1 w-1/3 rounded bg-indigo-400" />
        <div className="h-px w-full rounded bg-indigo-200" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="h-1 w-4/5 rounded bg-gray-200" />
        <div className="h-1 w-3/4 rounded bg-gray-200" />
      </div>
    ),
  },
  {
    id: "modern",
    label: "Modern",
    tagline: "Dark navy header band · teal accents",
    preview: (
      <div className="w-full h-full flex flex-col gap-1">
        {/* header band */}
        <div className="w-full rounded-t bg-slate-900 px-1.5 py-1.5 flex flex-col gap-0.5">
          <div className="h-2 w-3/4 rounded bg-white/80" />
          <div className="h-1 w-1/2 rounded bg-slate-400" />
        </div>
        <div className="flex flex-col gap-1 px-1.5 pt-0.5">
          {/* section title + teal underline */}
          <div className="h-1 w-1/3 rounded bg-slate-800" />
          <div className="h-0.5 w-8 rounded bg-teal-400" />
          <div className="h-1 w-full rounded bg-gray-200" />
          <div className="h-1 w-5/6 rounded bg-gray-200" />
          {/* section */}
          <div className="mt-1 h-1 w-1/3 rounded bg-slate-800" />
          <div className="h-0.5 w-8 rounded bg-teal-400" />
          <div className="h-1 w-full rounded bg-gray-200" />
          <div className="h-1 w-3/4 rounded bg-gray-200" />
          <div className="h-1 w-4/5 rounded bg-gray-200" />
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    label: "Minimal",
    tagline: "No colour · whitespace-first typography",
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-1.5">
        {/* large name */}
        <div className="h-3 w-3/4 rounded bg-black" />
        {/* contact */}
        <div className="h-1 w-1/2 rounded bg-gray-400" />
        {/* thin separator */}
        <div className="mt-0.5 h-px w-full rounded bg-gray-300" />
        {/* section label (gray caps) */}
        <div className="mt-1.5 h-1 w-1/4 rounded bg-gray-400" />
        <div className="h-px w-full rounded bg-gray-200" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="h-1 w-5/6 rounded bg-gray-200" />
        {/* section */}
        <div className="mt-2 h-1 w-1/4 rounded bg-gray-400" />
        <div className="h-px w-full rounded bg-gray-200" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="h-1 w-2/3 rounded bg-gray-200" />
      </div>
    ),
  },
];


function blankExp(): ExperienceEntry {
  return { id: crypto.randomUUID(), company: "", title: "", start_date: "", end_date: "Present", bulletsText: "" };
}

function blankEdu(): EducationEntry {
  return { id: crypto.randomUUID(), institution: "", degree: "", field: "", year: "" };
}

type SectionKey = "personal" | "summary" | "experience" | "education" | "skills";

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      {title}
      <svg
        className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface ResumeExporterProps {
  initialResumeId?: string;
  initialTitle?: string;
  initialData?: ResumeData;
  initialVersion?: number;
}

export default function ResumeExporter({
  initialResumeId,
  initialTitle,
  initialData,
  initialVersion,
}: ResumeExporterProps = {}) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    personal: true, summary: false, experience: false, education: false, skills: false,
  });

  const [template, setTemplate] = useState<TemplateId>(initialData?.template ?? "classic");
  const [personal, setPersonal] = useState<PersonalInfo>(
    initialData?.personal ?? { full_name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
  );
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [experience, setExperience] = useState<ExperienceEntry[]>(() => {
    if (initialData?.experience?.length) {
      return initialData.experience.map((e) => ({
        id: crypto.randomUUID(),
        company: e.company,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        bulletsText: e.bullets.join("\n"),
      }));
    }
    return [blankExp()];
  });
  const [education, setEducation] = useState<EducationEntry[]>(() => {
    if (initialData?.education?.length) {
      return initialData.education.map((e) => ({
        id: crypto.randomUUID(),
        ...e,
      }));
    }
    return [blankEdu()];
  });
  const [skills, setSkills] = useState(initialData?.skills ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [resumeId, setResumeId] = useState<string | undefined>(initialResumeId);
  const [resumeTitle, setResumeTitle] = useState(initialTitle ?? "");
  const [currentVersion, setCurrentVersion] = useState(initialVersion ?? 0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState("");

  useEffect(() => {
    if (initialData) {
      requestAnimationFrame(() => {
        setOpen({ personal: true, summary: true, experience: true, education: true, skills: true });
      });
    }
  }, [initialData]);

  function buildResumeData(): ResumeData {
    return {
      personal,
      summary: summary.trim(),
      experience: experience
        .filter((e) => e.company.trim() || e.title.trim())
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ bulletsText, id: _eid, ...rest }) => ({
          ...rest,
          bullets: bulletsText.split("\n").map((l) => l.trim()).filter(Boolean),
        })),
      education: education
        .filter((e) => e.institution.trim() || e.degree.trim())
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ id: _eduid, ...rest }) => rest),
      skills: skills.trim(),
      template,
    };
  }

  async function handleSave() {
    if (!personal.full_name.trim()) {
      setError("Fill in at least your name before saving.");
      return;
    }
    if (resumeId) {
      setSaving(true);
      const { version, error: err } = await saveVersion(resumeId, buildResumeData());
      setSaving(false);
      if (err) { setError(err); return; }
      setCurrentVersion(version);
      setSaveSuccess(`Saved as v${version}`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } else {
      setSaveAsTitle(personal.full_name.trim() + " Resume");
      setShowSaveDialog(true);
    }
  }

  async function handleSaveAs() {
    if (!saveAsTitle.trim()) return;
    setSaving(true);
    const { id, error: err } = await createResume(saveAsTitle.trim(), buildResumeData());
    setSaving(false);
    if (err) { setError(err); setShowSaveDialog(false); return; }
    setResumeId(id);
    setResumeTitle(saveAsTitle.trim());
    setCurrentVersion(1);
    setShowSaveDialog(false);
    setSaveSuccess("Resume saved!");
    setTimeout(() => setSaveSuccess(null), 3000);
  }

  function toggle(key: SectionKey) {
    setOpen((p) => ({ ...p, [key]: !p[key] }));
  }

  function updateExp(id: string, field: keyof ExperienceEntry, value: string) {
    setExperience((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
  }

  function updateEdu(id: string, field: keyof EducationEntry, value: string) {
    setEducation((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
  }

  async function handleDownload() {
    if (!personal.full_name.trim() || !personal.email.trim()) {
      setError("Full Name and Email are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      personal,
      summary: summary.trim(),
      experience: experience
        .filter((e) => e.company.trim() || e.title.trim())
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ bulletsText, id: _eid, ...rest }) => ({
          ...rest,
          bullets: bulletsText.split("\n").map((l) => l.trim()).filter(Boolean),
        })),
      education: education
        .filter((e) => e.institution.trim() || e.degree.trim())
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ id: _eduid, ...rest }) => rest),
      skills: skills.trim(),
      filename: personal.full_name.trim() || "resume",
      template,
    };

    try {
      const res = await authFetch(`${API_URL}/api/v1/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? `Server error ${res.status}`);
      }

      // Binary download: get Blob → object URL → hidden <a> click
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(personal.full_name.trim() || "resume").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-3">

      {/* ── 0. Template Picker ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Choose a template
        </p>
        <div role="radiogroup" aria-label="Resume template" className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => {
            const selected = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTemplate(t.id)}
                className={`
                  relative flex flex-col items-stretch rounded-xl border-2 transition
                  ${selected
                    ? "border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm"}
                `}
              >
                {/* Mini PDF preview */}
                <div className="relative overflow-hidden rounded-t-xl bg-white dark:bg-gray-800"
                     style={{ aspectRatio: "0.707 / 1", maxHeight: 120 }}>
                  {t.preview}
                </div>
                {/* Label row */}
                <div className={`
                  rounded-b-xl px-2 py-1.5 text-left
                  ${selected ? "bg-indigo-50 dark:bg-indigo-950" : "bg-gray-50 dark:bg-gray-800"}
                `}>
                  <p className={`text-xs font-bold ${selected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200"}`}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 hidden sm:block">
                    {t.tagline}
                  </p>
                </div>
                {/* Selected tick */}
                {selected && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. Personal Info ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader title="1 · Personal Information" open={open.personal} onToggle={() => toggle("personal")} />
        {open.personal && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="re-fullname" className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input id="re-fullname" className={inputCls} value={personal.full_name}
                  onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                  placeholder="Jane Smith" />
              </div>
              <div>
                <label htmlFor="re-email" className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input id="re-email" className={inputCls} type="email" value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  placeholder="jane@example.com" />
              </div>
              <div>
                <label htmlFor="re-phone" className={labelCls}>Phone</label>
                <input id="re-phone" className={inputCls} value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+44 7700 000000" />
              </div>
              <div>
                <label htmlFor="re-location" className={labelCls}>Location</label>
                <input id="re-location" className={inputCls} value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  placeholder="London, UK" />
              </div>
              <div>
                <label htmlFor="re-linkedin" className={labelCls}>LinkedIn</label>
                <input id="re-linkedin" className={inputCls} value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/janesmith" />
              </div>
              <div>
                <label htmlFor="re-website" className={labelCls}>Website</label>
                <input id="re-website" className={inputCls} value={personal.website}
                  onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                  placeholder="janesmith.dev" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Professional Summary ───────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader title="2 · Professional Summary" open={open.summary} onToggle={() => toggle("summary")} />
        {open.summary && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              Tip: paste the AI summary you generated in Step 4 above.
            </p>
            <textarea className={`${inputCls} resize-y`} rows={4}
              value={summary} onChange={(e) => setSummary(e.target.value)}
              placeholder="Experienced software engineer with 5+ years building scalable backend systems..." />
          </div>
        )}
      </div>

      {/* ── 3. Work Experience ───────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader title="3 · Work Experience" open={open.experience} onToggle={() => toggle("experience")} />
        {open.experience && (
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Role {idx + 1}</p>
                  {experience.length > 1 && (
                    <button
                      onClick={() => setExperience((p) => p.filter((e) => e.id !== exp.id))}
                      className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input className={inputCls} value={exp.title}
                      onChange={(e) => updateExp(exp.id, "title", e.target.value)}
                      placeholder="Senior Software Engineer" />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input className={inputCls} value={exp.company}
                      onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                      placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input className={inputCls} value={exp.start_date}
                      onChange={(e) => updateExp(exp.id, "start_date", e.target.value)}
                      placeholder="Jan 2021" />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input className={inputCls} value={exp.end_date}
                      onChange={(e) => updateExp(exp.id, "end_date", e.target.value)}
                      placeholder="Present" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Bullets <span className="font-normal text-gray-400">(one per line — paste rewritten bullets from Step 5)</span>
                  </label>
                  <textarea className={`${inputCls} resize-y font-mono`} rows={4}
                    value={exp.bulletsText}
                    onChange={(e) => updateExp(exp.id, "bulletsText", e.target.value)}
                    placeholder={"- Built REST APIs serving 50k daily requests\n- Led migration to microservices, reducing latency 35%"} />
                </div>
              </div>
            ))}
            <button
              onClick={() => setExperience((p) => [...p, blankExp()])}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add another role
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Education ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader title="4 · Education" open={open.education} onToggle={() => toggle("education")} />
        {open.education && (
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={edu.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Entry {idx + 1}</p>
                  {education.length > 1 && (
                    <button
                      onClick={() => setEducation((p) => p.filter((e) => e.id !== edu.id))}
                      className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Institution</label>
                    <input className={inputCls} value={edu.institution}
                      onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
                      placeholder="University of Manchester" />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input className={inputCls} value={edu.degree}
                      onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                      placeholder="BSc" />
                  </div>
                  <div>
                    <label className={labelCls}>Field of Study</label>
                    <input className={inputCls} value={edu.field}
                      onChange={(e) => updateEdu(edu.id, "field", e.target.value)}
                      placeholder="Computer Science" />
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <input className={inputCls} value={edu.year}
                      onChange={(e) => updateEdu(edu.id, "year", e.target.value)}
                      placeholder="2019" />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setEducation((p) => [...p, blankEdu()])}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add another entry
            </button>
          </div>
        )}
      </div>

      {/* ── 5. Skills ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader title="5 · Skills" open={open.skills} onToggle={() => toggle("skills")} />
        {open.skills && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <textarea className={`${inputCls} resize-y`} rows={3}
              value={skills} onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, FastAPI, Docker, Kubernetes, PostgreSQL, React, TypeScript, AWS, CI/CD" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loaded resume indicator */}
      {resumeId && resumeTitle && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5">
          <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{resumeTitle}</span>
          {currentVersion > 0 && (
            <span className="text-xs text-indigo-400 dark:text-indigo-500">v{currentVersion}</span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner>Generating PDF...</Spinner>
          ) : success ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Downloaded!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Resume
            </span>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 px-5 py-3.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-100 dark:hover:bg-indigo-900 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <Spinner>Saving...</Spinner>
          ) : saveSuccess ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {saveSuccess}
            </span>
          ) : resumeId ? (
            "Save Version"
          ) : (
            "Save Resume"
          )}
        </button>

        {!personal.full_name.trim() && !personal.email.trim() && !summary.trim() && experience.length === 0 && (
          <TryDemoButton onClick={() => {
            setPersonal(DEMO_PERSONAL);
            setSummary(DEMO_SUMMARY);
            setExperience(DEMO_EXPERIENCE.map((e) => ({ ...e, id: crypto.randomUUID() })));
            setEducation(DEMO_EDUCATION.map((e) => ({ ...e, id: crypto.randomUUID() })));
            setSkills(DEMO_RESUME_SKILLS);
            setOpen({ personal: true, summary: true, experience: true, education: true, skills: true });
          }} />
        )}
      </div>

      {/* Save-as dialog */}
      {showSaveDialog && (
        <div role="dialog" aria-label="Save resume as" className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Save Resume As
          </p>
          <input
            autoFocus
            value={saveAsTitle}
            onChange={(e) => setSaveAsTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveAs(); }}
            placeholder="e.g. Software Engineer Resume"
            className="w-full rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveAs}
              disabled={saving || !saveAsTitle.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="rounded-lg px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        3 ATS-safe single-column templates · fpdf2 · No watermarks
      </p>
    </div>
  );
}
