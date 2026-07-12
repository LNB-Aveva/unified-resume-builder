---
name: resume-seo-growth
description: "ResumeAI SEO growth plan — 3/4 items DONE, custom domain + backlinks remaining, artifact has full playbook"
metadata: 
  node_type: memory
  type: project
  originSessionId: dd80af89-9509-42e7-b556-366fd37e2421
---

## ResumeAI SEO & Growth Status (as of 2026-07-03)

### Completed Items
1. **Keyword Targeting** — PR #22 merged. Title leads with "Free ATS Resume Checker & Keyword Analyzer", brand name last. All 8 tool card headings, H1, H2s, meta description, OG tags, JSON-LD updated with high-traffic keywords.
2. **Blog / Multi-Page SEO** — PR #23 merged, verified live. `/blog` index + 3 full articles (~8,000 words total):
   - `/blog/how-to-beat-ats-filters-2026` — targets "how to beat ats" (~3,200/mo)
   - `/blog/ats-keywords-by-industry` — targets "ats keywords by industry" (~800/mo)
   - `/blog/free-ats-resume-checker-comparison` — targets "free ats resume checker" (~2,400/mo)
   - Blog data in `frontend/src/app/lib/blog-posts.ts` (plain TSX, no MDX deps)
   - Blog layout in `frontend/src/app/blog/layout.tsx` with shared nav/footer
3. **Landing Pages** — PR #24 MERGED (commit `b442388`), live on Vercel:
   - `/ats-checker` — targets "ats score checker free" (~1,900/mo), comparison table vs Jobscan, 5-item FAQ with schema
   - `/keyword-analyzer` — targets "resume keyword analyzer" (~1,200/mo), 4 keyword categories, 4-step guide, 4-item FAQ
   - Both have WebApplication + FAQPage JSON-LD, dedicated meta/OG tags
   - Sitemap updated with both URLs (priority 0.8)

### Remaining Items
4. **Custom Domain** — Detailed walkthrough in SEO Growth Playbook artifact. User budget $10-12/yr. Recommended: resumeai.tools (~$3-5/yr on Porkbun). Code changes needed: NEXT_PUBLIC_SITE_URL env var, CORS update, canonical URLs auto-update via env var.
5. **Backlinks** — Manual execution by user. Full templates in artifact: Reddit (4 subreddits), Product Hunt launch copy, LinkedIn posts, Show HN, Dev.to, directory listings. 4-week execution calendar provided.

### SEO Growth Playbook Artifact
- URL: https://claude.ai/code/artifact/8aeb44cc-7eaa-4b9e-83b5-c1c883b4efd5
- Contains: domain purchase walkthrough, backlink templates (Reddit/PH/LinkedIn/HN), keyword strategy, 4-week calendar

**Why:** Site is live and functional but needs SEO/marketing for organic traffic. Google already indexes it (AI Overview citation). Domain authority is the bottleneck.
**How to apply:** PR #24 needs merge → verify landing pages live → custom domain purchase → backlinks execution.
