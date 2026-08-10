"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = "resumeai-turnstile-script";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({ pending }: { pending: boolean }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const wasPendingRef = useRef(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    let disposed = false;
    const renderWidget = () => {
      if (disposed || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "auto",
        callback: (nextToken) => {
          setToken(nextToken);
          setError(false);
        },
        "expired-callback": () => setToken(""),
        "error-callback": () => {
          setToken("");
          setError(true);
        },
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (script) {
      script.addEventListener("load", renderWidget);
    } else {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      disposed = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (wasPendingRef.current && !pending && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      requestAnimationFrame(() => {
        setToken("");
        setError(false);
      });
    }
    wasPendingRef.current = pending;
  }, [pending]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" aria-label="Security verification" />
      <input type="hidden" name="captchaToken" value={token} />
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          The security check could not load. Check your connection and try again.
        </p>
      )}
      <noscript>
        <p className="text-xs text-red-600">JavaScript is required for the security check.</p>
      </noscript>
    </div>
  );
}
