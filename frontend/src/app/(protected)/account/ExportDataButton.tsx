"use client";

import { useState, useTransition } from "react";
import { exportUserData } from "@/app/actions/auth";

export default function ExportDataButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      const result = await exportUserData();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.json) {
        const blob = new Blob([result.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resumeai-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
      >
        {isPending ? "Exporting..." : "Download My Data"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
