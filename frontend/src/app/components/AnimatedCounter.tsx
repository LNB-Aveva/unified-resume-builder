"use client";

import { useEffect, useRef, useState } from "react";

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

interface Props {
  target: number;
  suffix?: string;
  locale?: boolean;
  duration?: number;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  locale = false,
  duration = 1500,
}: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      requestAnimationFrame(() => setCount(target));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setCount(Math.round(easeOutQuart(progress) * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  const formatted = locale ? count.toLocaleString("en-US") : String(count);

  return (
    <span ref={ref} suppressHydrationWarning>
      {formatted}
      {suffix}
    </span>
  );
}
