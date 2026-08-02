import type { NextConfig } from "next";

const _backendUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://unified-resume-builder-api.onrender.com";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // GA4 domains — consent-gated in CookieConsent.tsx
              `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://www.google-analytics.com https://pagead2.googlesyndication.com",
              "font-src 'self' data:",
              `connect-src 'self' https://*.supabase.co ${_backendUrl} https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://*.ingest.sentry.io`,
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
