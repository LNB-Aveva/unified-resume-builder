/*
 * opengraph-image.tsx — Auto-generates the OG image served at /opengraph-image.
 *
 * WHY THIS FILE EXISTS:
 *   When you share any URL on LinkedIn, Twitter, Slack, or Discord, those platforms
 *   fetch the og:image meta tag and show a preview card. Without a good image, you
 *   get a blank card — which kills click-through rates on shared links.
 *
 * HOW NEXT.JS SERVES THIS:
 *   Next.js 13.3+ detects opengraph-image.tsx in the app/ directory automatically.
 *   It renders the JSX below using the ImageResponse API (an Edge Runtime canvas)
 *   and serves it at /opengraph-image with the correct Content-Type: image/png header.
 *   No static file, no image editing software, no extra packages needed.
 *
 * THE "runtime = edge" EXPORT:
 *   ImageResponse runs in Vercel's Edge Runtime (a V8 isolate, not Node.js).
 *   This is faster and cheaper for image generation. The constraint is that
 *   you can't use Node.js-specific APIs inside the component — but divs and
 *   inline styles work fine.
 *
 * FONTS:
 *   We use system-ui (a CSS generic that the edge runtime resolves to a platform
 *   sans-serif). For custom fonts you'd fetch a .ttf and pass it to ImageResponse
 *   options — skip that for now, system-ui looks clean.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ResumeAI — Free ATS Resume Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const features = [
    "Keyword Extractor",
    "Gap Analysis",
    "ATS Checker",
    "AI Cover Letter",
    "PDF Builder",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>
            ResumeAI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 960,
            marginBottom: 18,
          }}
        >
          Stop losing jobs to ATS filters.
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: 26,
            color: "#6B7280",
            textAlign: "center",
            maxWidth: 820,
            marginBottom: 44,
            lineHeight: 1.4,
          }}
        >
          9 free AI tools to get your resume past ATS and in front of humans.
          No sign-up. No paywall.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {features.map((f) => (
            <div
              key={f}
              style={{
                background: "#EEF2FF",
                color: "#4338CA",
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 20,
                fontWeight: 600,
                border: "1px solid #C7D2FE",
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            color: "#9CA3AF",
            fontSize: 18,
          }}
        >
          unified-resume-builder.vercel.app · 100% free · No account required
        </div>
      </div>
    ),
    { ...size }
  );
}
