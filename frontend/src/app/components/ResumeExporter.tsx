"use client";

/*
 * ResumeExporter.tsx — Build and download an ATS-friendly PDF resume.
 *
 * UX FLOW:
 *   1. User picks a template (Classic / Modern / Minimal) via visual cards.
 *   2. User fills in four collapsible sections: Personal, Experience,
 *      Education, Skills. Summary can be pasted from Step 4 above.
 *   3. "Download PDF" → POST /api/v1/export/pdf with all resume data
 *      + the chosen template name.
 *   4. Browser receives a binary PDF blob and triggers a file download.
 *
 * WHY DOWNLOADING A BLOB IS DIFFERENT FROM A NORMAL FETCH:
 *   Most API calls fetch JSON. This one returns raw bytes (application/pdf).
 *   We get a Blob from the response, create a temporary object URL for it,
 *   attach it to a hidden <a> element and programmatically click it —
 *   that's how browsers trigger "Save File" without a page navigation.
 *   After the click we revoke the URL to free memory.
 *
 * MULTI-ENTRY FORM STATE:
 *   Experience and Education are dynamic arrays. Each entry has a local id
 *   (crypto.randomUUID()) for React's `key` prop. When the user clicks
 *   "Add Role" / "Add Education" we append a blank entry; "Remove" filters it out.
 *   This is the standard React pattern for variable-length form sections.
 *
 * COLLAPSIBLE SECTIONS:
 *   We hide/show each section with a boolean toggle per section name.
 *   This keeps the form compact — users open only the section they're editing.
 */

import React, { useState } from "react";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
      className="flex w-full items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
    >
      {title}
      <svg
        className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export default function ResumeExporter() {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    personal: true, summary: false, experience: false, education: false, skills: false,
  });

  const [template, setTemplate] = useState<TemplateId>("classic");
  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: "", email: "", phone: "", location: "", linkedin: "", website: "",
  });
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([blankExp()]);
  const [education, setEducation] = useState<EducationEntry[]>([blankEdu()]);
  const [skills, setSkills] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        .map(({ bulletsText, id: _id, ...rest }) => ({
          ...rest,
          bullets: bulletsText.split("\n").map((l) => l.trim()).filter(Boolean),
        })),
      education: education
        .filter((e) => e.institution.trim() || e.degree.trim())
        .map(({ id: _id, ...rest }) => rest),
      skills: skills.trim(),
      filename: personal.full_name.trim() || "resume",
      template,
    };

    try {
      const res = await fetch(`${API_URL}/api/v1/export/pdf`, {
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

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="space-y-3">

      {/* ── 0. Template Picker ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Choose a template
        </p>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => {
            const selected = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`
                  relative flex flex-col items-stretch rounded-xl border-2 transition
                  ${selected
                    ? "border-indigo-500 shadow-md shadow-indigo-100"
                    : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"}
                `}
              >
                {/* Mini PDF preview */}
                <div className="relative overflow-hidden rounded-t-xl bg-white"
                     style={{ aspectRatio: "0.707 / 1", maxHeight: 120 }}>
                  {t.preview}
                </div>
                {/* Label row */}
                <div className={`
                  rounded-b-xl px-2 py-1.5 text-left
                  ${selected ? "bg-indigo-50" : "bg-gray-50"}
                `}>
                  <p className={`text-xs font-bold ${selected ? "text-indigo-700" : "text-gray-700"}`}>
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
          <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input className={inputCls} value={personal.full_name}
                  onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                  placeholder="Jane Smith" />
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input className={inputCls} type="email" value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  placeholder="jane@example.com" />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+44 7700 000000" />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  placeholder="London, UK" />
              </div>
              <div>
                <label className={labelCls}>LinkedIn</label>
                <input className={inputCls} value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/janesmith" />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} value={personal.website}
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
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400 mb-2">
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
              <div key={exp.id} className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Role {idx + 1}</p>
                  {experience.length > 1 && (
                    <button
                      onClick={() => setExperience((p) => p.filter((e) => e.id !== exp.id))}
                      className="text-xs text-red-400 hover:text-red-600 transition"
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
              <div key={edu.id} className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Entry {idx + 1}</p>
                  {education.length > 1 && (
                    <button
                      onClick={() => setEducation((p) => p.filter((e) => e.id !== edu.id))}
                      className="text-xs text-red-400 hover:text-red-600 transition"
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
                      placeholder="BSc Computer Science" />
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
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <textarea className={`${inputCls} resize-y`} rows={3}
              value={skills} onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, FastAPI, Docker, Kubernetes, PostgreSQL, React, TypeScript, AWS, CI/CD" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Generating PDF...
          </span>
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

      <p className="text-center text-xs text-gray-400">
        3 ATS-safe single-column templates · fpdf2 · No watermarks
      </p>
    </div>
  );
}
