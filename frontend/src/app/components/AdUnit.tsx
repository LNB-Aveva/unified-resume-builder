"use client";

import { useEffect, useRef, useState } from "react";

const CONSENT_KEY = "cookie_consent";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdUnitProps) {
  const pushed = useRef(false);
  const [ready, setReady] = useState(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId) return;
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent !== "accepted") return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [adsenseId]);

  useEffect(() => {
    if (!ready || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense may throw if the slot was already initialized
    }
  }, [ready]);

  if (!adsenseId || !ready) return null;

  return (
    <aside className={className} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </aside>
  );
}
