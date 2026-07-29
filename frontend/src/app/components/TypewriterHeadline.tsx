"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Land More Interviews.",
  "Get Hired Faster.",
  "Beat ATS Ghosting.",
  "Stand Out to Recruiters.",
];
const TYPE_MS = 65;
const DELETE_MS = 38;
const PAUSE_TYPED = 2500;
const PAUSE_DELETED = 380;

export default function TypewriterHeadline() {
  const [text, setText] = useState(PHRASES[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    requestAnimationFrame(() => setActive(true));
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const target = PHRASES[phraseIdx];

    if (!deleting && text === target) {
      const t = setTimeout(() => setDeleting(true), PAUSE_TYPED);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      const t = setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setDeleting(false);
      }, PAUSE_DELETED);
      return () => clearTimeout(t);
    }

    const speed = deleting ? DELETE_MS : TYPE_MS;
    const t = setTimeout(() => {
      setText((prev) =>
        deleting ? prev.slice(0, -1) : target.slice(0, prev.length + 1),
      );
    }, speed);
    return () => clearTimeout(t);
  }, [text, phraseIdx, deleting, active]);

  return (
    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
      {text}
      {active && (
        <span
          aria-hidden="true"
          className="inline-block ml-0.5 rounded-[1px] bg-gradient-to-b from-indigo-600 to-violet-600 align-middle"
          style={{
            width: "3px",
            height: "0.82em",
            opacity: cursorVisible ? 1 : 0,
            transition: "opacity 80ms",
          }}
        />
      )}
    </span>
  );
}
