"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_KEY,
  createConsent,
  isGlobalPrivacyControlEnabled,
  parseConsent,
  type ConsentPreferences,
} from "@/app/lib/consent";

function updateConsentMode(preferences: ConsentPreferences) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  gtag?.("consent", "update", {
    ad_storage: preferences.advertising ? "granted" : "denied",
    ad_user_data: preferences.advertising ? "granted" : "denied",
    ad_personalization: preferences.advertising ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
  });
}

function loadGA4(gaId: string) {
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.async = true;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "ga4-init";
  inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
  document.head.appendChild(inline);
}

function loadAdSense(adsenseId: string) {
  if (document.getElementById("adsense-script")) return;
  const script = document.createElement("script");
  script.id = "adsense-script";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

export default function CookieConsent({
  gaId,
  adsenseId,
}: {
  gaId?: string;
  adsenseId?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [gpcEnabled, setGpcEnabled] = useState(false);

  useEffect(() => {
    const globalOptOut = isGlobalPrivacyControlEnabled();
    let consent = parseConsent(localStorage.getItem(CONSENT_KEY));
    if (globalOptOut && consent?.advertising) {
      consent = createConsent(consent.analytics, false);
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    }
    if (consent === null) {
      const timer = window.setTimeout(() => {
        setGpcEnabled(globalOptOut);
        setVisible(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    updateConsentMode(consent);
    if (consent.analytics && gaId) loadGA4(gaId);
    if (consent.advertising && adsenseId) loadAdSense(adsenseId);
  }, [adsenseId, gaId]);

  const savePreferences = useCallback(
    (analyticsChoice: boolean, advertisingChoice: boolean) => {
      const preferences = createConsent(
        analyticsChoice,
        advertisingChoice && !isGlobalPrivacyControlEnabled(),
      );
      localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
      setVisible(false);
      updateConsentMode(preferences);
      if (preferences.analytics && gaId) loadGA4(gaId);
      if (preferences.advertising && adsenseId) loadAdSense(adsenseId);
      window.dispatchEvent(
        new CustomEvent("resumeai:consent-changed", { detail: preferences }),
      );
    },
    [adsenseId, gaId],
  );

  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Cookie preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Choose optional data uses
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Authentication and security storage stays active. Analytics and advertising are
            independent choices. See our{" "}
            <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <strong className="block text-gray-900 dark:text-white">Analytics</strong>
              <span className="text-gray-600 dark:text-gray-300">
                Google Analytics usage measurement.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
            <input
              type="checkbox"
              checked={advertising && !gpcEnabled}
              onChange={(event) => setAdvertising(event.target.checked)}
              disabled={gpcEnabled}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <strong className="block text-gray-900 dark:text-white">Advertising</strong>
              <span className="text-gray-600 dark:text-gray-300">
                {gpcEnabled
                  ? "Disabled because your browser sent Global Privacy Control."
                  : "Google AdSense storage and personalization signals."}
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            onClick={() => savePreferences(false, false)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition min-h-[44px]"
          >
            Reject optional
          </button>
          <button
            onClick={() => savePreferences(analytics, advertising)}
            className="rounded-lg border border-indigo-300 dark:border-indigo-700 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition min-h-[44px]"
          >
            Save choices
          </button>
          <button
            onClick={() => savePreferences(true, !gpcEnabled)}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition min-h-[44px]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  const handleReset = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  }, []);

  return (
    <button
      onClick={handleReset}
      className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition"
    >
      Cookie Settings
    </button>
  );
}
