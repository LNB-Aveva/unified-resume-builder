"use client";

import { useEffect, useState } from "react";

const MATCHED = ["Python", "React", "AWS", "Docker", "CI/CD", "PostgreSQL", "REST API", "Agile"];
const MISSING = ["Kubernetes", "Terraform", "GraphQL", "TypeScript"];

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

export default function HeroScoreCard() {
  const [ringActive, setRingActive] = useState(false);
  const [score, setScore] = useState(0);
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setRingActive(true);
      setScore(85);
      setPillsVisible(true);
      return;
    }

    // Ring + score start after a short paint delay
    const t1 = setTimeout(() => {
      setRingActive(true);

      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / 1400, 1);
        setScore(Math.round(easeOutQuart(progress) * 85));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 350);

    // Pills appear after ring is ~halfway drawn
    const t2 = setTimeout(() => setPillsVisible(true), 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative hidden lg:block">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 p-6 space-y-5 rotate-1 hover:rotate-0 transition-transform duration-500">

        {/* Window chrome */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-400">ATS Analysis Result</span>
        </div>

        {/* Score donut */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="currentColor" strokeWidth="8"
                className="text-gray-100 dark:text-gray-700"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset="264"
                strokeLinecap="round"
                className="text-emerald-500"
                style={
                  ringActive
                    ? { animation: "ring-draw 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards" }
                    : {}
                }
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white" suppressHydrationWarning>
                {score}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Strong ATS Match</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">23 of 27 keywords found</p>
          </div>
        </div>

        {/* Matched keywords */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Matched Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {MATCHED.map((kw, i) => (
              <span
                key={kw}
                className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                style={{
                  opacity: pillsVisible ? 1 : 0,
                  transform: pillsVisible ? "none" : "scale(0.8) translateY(4px)",
                  transition: pillsVisible
                    ? `opacity 0.28s ease ${i * 0.06}s, transform 0.28s ease ${i * 0.06}s`
                    : "none",
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing keywords */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Missing &mdash; Add These</p>
          <div className="flex flex-wrap gap-1.5">
            {MISSING.map((kw, i) => (
              <span
                key={kw}
                className="rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                style={{
                  opacity: pillsVisible ? 1 : 0,
                  transform: pillsVisible ? "none" : "scale(0.8) translateY(4px)",
                  transition: pillsVisible
                    ? `opacity 0.28s ease ${(MATCHED.length + i) * 0.06}s, transform 0.28s ease ${(MATCHED.length + i) * 0.06}s`
                    : "none",
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Compliance row */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">ATS Compliance</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">15/15 passed</span>
        </div>
      </div>

      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-blue-950 opacity-60 blur-xl" />
    </div>
  );
}
