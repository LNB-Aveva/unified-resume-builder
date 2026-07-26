"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

const PHASE_MS = [4500, 4500, 6000] as const;
const FADE_MS = 280;
const PHASES = ["ATS Score", "Gap Analysis", "AI Rewriter"] as const;
type PhaseIdx = 0 | 1 | 2;

// ── Data ──────────────────────────────────────────────────────────────
const MATCHED = ["Python", "React", "AWS", "Docker", "CI/CD", "PostgreSQL"];
const MISSING_KW = ["Kubernetes", "Terraform", "GraphQL", "TypeScript"];

const GAP_MISSING_KW = ["Kubernetes", "Terraform", "GraphQL", "TypeScript", "Redis"];
const GAP_PRESENT_KW = ["Python", "React", "AWS", "Docker", "CI/CD"];

const WEAK =
  "Worked on backend services and helped improve system performance.";
const STRONG =
  "Optimized FastAPI microservices with PostgreSQL pooling, reducing API latency by 40% across 3M monthly requests.";
const HIGHLIGHTS = ["FastAPI", "PostgreSQL", "40%"];

// ── Helpers ───────────────────────────────────────────────────────────
function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

function highlightBullet(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rem = text;
  while (rem.length > 0) {
    let best = rem.length;
    let bestKw = "";
    for (const kw of HIGHLIGHTS) {
      const idx = rem.indexOf(kw);
      if (idx !== -1 && idx < best) {
        best = idx;
        bestKw = kw;
      }
    }
    if (!bestKw) {
      parts.push(rem);
      break;
    }
    if (best > 0) parts.push(rem.slice(0, best));
    parts.push(
      <mark
        key={parts.length}
        className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded px-0.5 not-italic font-semibold"
      >
        {bestKw}
      </mark>,
    );
    rem = rem.slice(best + bestKw.length);
  }
  return parts;
}

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ── Panel 0: ATS Score ────────────────────────────────────────────────
function ScorePanel() {
  const [ringActive, setRingActive] = useState(false);
  const [score, setScore] = useState(0);
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    if (prefersReduced()) {
      setRingActive(true);
      setScore(85);
      setPillsVisible(true);
      return;
    }
    let rafId: number;
    const t1 = setTimeout(() => {
      setRingActive(true);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1400, 1);
        setScore(Math.round(easeOutQuart(p) * 85));
        if (p < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, 350);
    const t2 = setTimeout(() => setPillsVisible(true), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-100 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="264"
              strokeDashoffset="264"
              strokeLinecap="round"
              className="text-emerald-500"
              style={
                ringActive
                  ? {
                      animation:
                        "ring-draw 1.4s cubic-bezier(0.4,0,0.2,1) forwards",
                    }
                  : {}
              }
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-xl font-bold text-gray-900 dark:text-white"
              suppressHydrationWarning
            >
              {score}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Strong ATS Match
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            23 of 27 keywords found
          </p>
          <div className="flex items-center gap-1 mt-2">
            <svg
              className="h-3.5 w-3.5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              15/15 ATS checks passed
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Matched Keywords
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MATCHED.map((kw, i) => (
            <span
              key={kw}
              className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible ? "none" : "scale(0.8) translateY(4px)",
                transition: pillsVisible
                  ? `opacity 0.25s ease ${i * 0.055}s, transform 0.25s ease ${i * 0.055}s`
                  : "none",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Missing — Add These
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MISSING_KW.map((kw, i) => (
            <span
              key={kw}
              className="rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible ? "none" : "scale(0.8) translateY(4px)",
                transition: pillsVisible
                  ? `opacity 0.25s ease ${(MATCHED.length + i) * 0.055}s, transform 0.25s ease ${(MATCHED.length + i) * 0.055}s`
                  : "none",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel 1: Gap Analysis ─────────────────────────────────────────────
function GapPanel() {
  const [barW, setBarW] = useState(0);
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    if (prefersReduced()) {
      setBarW(68);
      setPillsVisible(true);
      return;
    }
    let rafId: number;
    const t1 = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1000, 1);
        setBarW(Math.round(easeOutQuart(p) * 68));
        if (p < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, 300);
    const t2 = setTimeout(() => setPillsVisible(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Resume Match Score
          </p>
          <span
            className="text-xs font-bold text-amber-600 dark:text-amber-400"
            suppressHydrationWarning
          >
            {barW}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
            style={{ width: `${barW}%`, transition: "none" }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Target: 85%+ to pass ATS filter
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Keywords to Add
          </p>
          <span className="text-xs text-red-500 dark:text-red-400 font-semibold">
            {GAP_MISSING_KW.length} gaps
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GAP_MISSING_KW.map((kw, i) => (
            <span
              key={kw}
              className="inline-flex items-center gap-0.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible
                  ? "none"
                  : "scale(0.85) translateY(3px)",
                transition: pillsVisible
                  ? `opacity 0.22s ease ${i * 0.06}s, transform 0.22s ease ${i * 0.06}s`
                  : "none",
              }}
            >
              <span className="opacity-60 text-[10px]">+</span>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Already Matched
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GAP_PRESENT_KW.map((kw, i) => (
            <span
              key={kw}
              className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible
                  ? "none"
                  : "scale(0.85) translateY(3px)",
                transition: pillsVisible
                  ? `opacity 0.22s ease ${(GAP_MISSING_KW.length + i) * 0.055}s, transform 0.22s ease ${(GAP_MISSING_KW.length + i) * 0.055}s`
                  : "none",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 px-4 py-2.5 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
        Add 5 keywords → reach 85%+ ATS match score
      </div>
    </div>
  );
}

// ── Panel 2: Bullet Rewriter ──────────────────────────────────────────
function RewriterPanel() {
  const [thinking, setThinking] = useState(false);
  const [showStrong, setShowStrong] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (prefersReduced()) {
      setShowStrong(true);
      setTyped(STRONG);
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const t1 = setTimeout(() => setThinking(true), 400);
    const t2 = setTimeout(() => {
      setThinking(false);
      setShowStrong(true);
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setTyped(STRONG.slice(0, i));
        if (i >= STRONG.length) {
          clearInterval(intervalId!);
          intervalId = null;
        }
      }, 22);
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Before
        </p>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed italic">
            &ldquo;{WEAK}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ${
            thinking
              ? "border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
              : showStrong
                ? "border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500"
          }`}
        >
          <svg
            className={`h-3 w-3 ${thinking ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
          {thinking ? "Rewriting…" : showStrong ? "AI Rewrite ✓" : "AI Rewriter"}
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          After
        </p>
        <div
          className={`rounded-xl border px-4 py-3 min-h-[68px] transition-colors duration-300 ${
            showStrong
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          }`}
        >
          {showStrong ? (
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
              &ldquo;{highlightBullet(typed)}
              {typed.length < STRONG.length && (
                <span className="inline-block w-[2px] h-[0.85em] bg-emerald-500 ml-0.5 align-middle animate-pulse" />
              )}
              &rdquo;
            </p>
          ) : thinking ? (
            <div className="flex items-center gap-1.5 justify-center pt-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {showStrong && typed.length === STRONG.length && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            3 ATS keywords
          </span>{" "}
          woven in naturally
        </p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function HeroScoreCard() {
  const [phase, setPhase] = useState<PhaseIdx>(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const jumpTo = useCallback(
    (p: PhaseIdx) => {
      if (p === phase) return;
      setVisible(false);
      setTimeout(() => {
        setPhase(p);
        setProgress(0);
        setVisible(true);
      }, FADE_MS);
    },
    [phase],
  );

  // Auto-advance timer — restarts each phase change
  useEffect(() => {
    if (prefersReduced()) return;
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    let startTime: number | null = null;
    let transitioning = false;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / PHASE_MS[phase], 1);
      setProgress(p);
      if (p >= 1 && !transitioning) {
        transitioning = true;
        setVisible(false);
        timeoutId = setTimeout(() => {
          setPhase((prev) => ((prev + 1) % 3) as PhaseIdx);
          setProgress(0);
          setVisible(true);
        }, FADE_MS + 20);
        return;
      }
      if (!transitioning) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [phase]);

  return (
    <div className="relative hidden lg:block">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 p-6 rotate-1 hover:rotate-0 transition-transform duration-500">

        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            ResumeAI — Live Preview
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 mb-5">
          {PHASES.map((label, i) => (
            <button
              key={label}
              onClick={() => jumpTo(i as PhaseIdx)}
              aria-pressed={phase === i}
              className={`relative flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 overflow-hidden ${
                phase === i
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {label}
              {phase === i && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 bg-indigo-500"
                  style={{ width: `${progress * 100}%`, transition: "none" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Animated content */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(5px)",
            transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
          }}
        >
          {phase === 0 && <ScorePanel />}
          {phase === 1 && <GapPanel />}
          {phase === 2 && <RewriterPanel />}
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-blue-950 opacity-60 blur-xl" />
    </div>
  );
}
