"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/auth";

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-red-300 dark:border-red-800 px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
      >
        Delete Account
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
        This will permanently delete your account, profile, resumes, job tracker entries, and shared scores. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            startTransition(async () => {
              const result = await deleteAccount();
              if (result?.message) {
                setError(result.message);
                return;
              }
              if (result?.success) {
                for (const key of ["resumeai_jobs", "cookie_consent", "theme"]) {
                  localStorage.removeItem(key);
                }
                window.location.assign("/");
              }
            });
          }}
          disabled={isPending}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Delete Account Data"}
        </button>
      </div>
    </div>
  );
}
