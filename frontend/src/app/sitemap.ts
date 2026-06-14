/*
 * sitemap.ts — Generates /sitemap.xml via Next.js App Router file convention.
 *
 * WHY A SITEMAP MATTERS:
 *   Search engine crawlers discover pages by following links. A sitemap is a
 *   shortcut — it tells Google "here are all the pages you should know about"
 *   without making it hunt through every link. For a single-page app like this
 *   where all tools live on "/" there's only one entry, but the sitemap also
 *   signals freshness (lastModified) which can improve crawl frequency.
 *
 * changeFrequency: "weekly" — tells Google to re-crawl roughly once a week.
 *   Accurate metadata here helps — "daily" on a page that barely changes
 *   trains Google to trust your signals less over time.
 *
 * priority: 1 — the homepage is the most important page. This is relative
 *   to other pages in your own sitemap (not compared to other sites).
 */

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.vercel.app";
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
