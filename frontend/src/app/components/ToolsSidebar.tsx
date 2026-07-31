"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "keyword-extractor", step: "1", label: "Keyword Extractor" },
  { id: "gap-analysis", step: "2", label: "Gap Analysis" },
  { id: "compliance-checker", step: "3", label: "Compliance Checker" },
  { id: "summary-generator", step: "4", label: "AI Summary" },
  { id: "cover-letter", step: "5", label: "Cover Letter" },
  { id: "bullet-rewriter", step: "6", label: "Bullet Rewriter" },
  { id: "pdf-export", step: "7", label: "PDF Export" },
  { id: "job-tracker", step: "8", label: "Job Tracker" },
];

export default function ToolsSidebar() {
  const [active, setActive] = useState("keyword-extractor");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Tool navigation" className="hidden xl:block sticky top-24 self-start w-56 shrink-0">
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 space-y-0.5">
        <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Tools
        </p>
        {sections.map(({ id, step, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              active === id
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-5 w-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                active === id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              }`}
            >
              {step}
            </span>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
