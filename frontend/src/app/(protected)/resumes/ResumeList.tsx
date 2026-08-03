"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ResumeSummary } from "@/app/actions/resume";
import { deleteResume, renameResume } from "@/app/actions/resume";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ResumeList({ initial }: { initial: ResumeSummary[] }) {
  const [resumes, setResumes] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function startRename(r: ResumeSummary) {
    setEditingId(r.id);
    setEditTitle(r.title);
  }

  function confirmRename(id: string) {
    startTransition(async () => {
      const { error } = await renameResume(id, editTitle);
      if (!error) {
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, title: editTitle.trim() } : r)),
        );
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}" and all its versions? This cannot be undone.`)) return;
    startTransition(async () => {
      const { error } = await deleteResume(id);
      if (!error) setResumes((prev) => prev.filter((r) => r.id !== id));
    });
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
        <svg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No saved resumes yet. Go to{" "}
          <Link href="/tools#pdf-export" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            PDF Export
          </Link>{" "}
          to create and save your first resume.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-center justify-between gap-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition"
        >
          <div className="flex-1 min-w-0">
            {editingId === r.id ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename(r.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                />
                <button
                  onClick={() => confirmRename(r.id)}
                  disabled={pending}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <Link
                  href={`/tools?resume=${r.id}`}
                  className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block"
                >
                  {r.title}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  v{r.latest_version} &middot; Updated {formatDate(r.updated_at)}
                </p>
              </>
            )}
          </div>

          {editingId !== r.id && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/tools?resume=${r.id}`}
                className="rounded-lg bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
              >
                Open
              </Link>
              <button
                onClick={() => startRename(r)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Rename
              </button>
              <button
                onClick={() => handleDelete(r.id, r.title)}
                disabled={pending}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
