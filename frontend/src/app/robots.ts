/*
 * robots.ts — Generates /robots.txt via Next.js App Router file convention.
 *
 * WHY A DYNAMIC FILE INSTEAD OF A STATIC robots.txt IN /public?
 *   A static file works fine. But using robots.ts lets us insert the
 *   correct sitemap URL dynamically from NEXT_PUBLIC_SITE_URL — otherwise
 *   we'd need to hardcode the production domain in a static file, which
 *   would be wrong in preview deployments.
 *
 * HOW IT WORKS:
 *   Next.js automatically serves the return value of this default export
 *   as /robots.txt with the correct Content-Type header. No routing needed.
 *
 * WHAT WE TELL CRAWLERS:
 *   - Allow all bots to crawl everything (no private routes to hide)
 *   - Point them at the sitemap so they find all indexable pages
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
