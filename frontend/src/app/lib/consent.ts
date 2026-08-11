export const CONSENT_KEY = "cookie_consent";

export type ConsentPreferences = {
  version: 2;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
};

export function parseConsent(raw: string | null): ConsentPreferences | null {
  if (!raw) return null;

  if (raw === "accepted" || raw === "rejected") {
    const granted = raw === "accepted";
    return {
      version: 2,
      analytics: granted,
      advertising: granted,
      updatedAt: "legacy",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (
      parsed.version === 2 &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.advertising === "boolean"
    ) {
      return {
        version: 2,
        analytics: parsed.analytics,
        advertising: parsed.advertising,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "unknown",
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function createConsent(
  analytics: boolean,
  advertising: boolean,
): ConsentPreferences {
  return {
    version: 2,
    analytics,
    advertising,
    updatedAt: new Date().toISOString(),
  };
}

export function isGlobalPrivacyControlEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}
