---
name: project-ai-resume-generator
description: "AI Resume Generator (ResumeAI) — full-stack app at bingis-projects/AI Resume Generator, FastAPI backend + Next.js 16 frontend, deploy to Render + Vercel"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5ddfbd49-f786-4d69-aa8d-39188197c19f
---

## AI Resume Generator (ResumeAI) — Project Status as of 2026-06-30

**Location:** `C:\Users\laxminarayana.bingi\my-workspace\bingis-projects\AI Resume Generator`
**GitHub repo:** `https://github.com/LNB-Aveva/unified-resume-builder` (separate repo for deployment, code also tracked in my-workspace monorepo)

**Tech Stack:**
- Backend: Python + FastAPI, spaCy NLP, HuggingFace Mistral-7B (free tier), fpdf2 for PDF, slowapi rate limiting
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Deployment: Render (backend free tier) + Vercel (frontend), render.yaml + vercel.json configured
- Database: Supabase planned but NOT implemented — Job Tracker uses localStorage
- HuggingFace token: "resume-builder" (hf_....myyL), READ permission, created ~Jun 14

**Deployment URLs:**
- Backend: `https://unified-resume-builder-api.onrender.com` (Render, free tier — sleeps after 15 min)
- Frontend: `https://unified-resume-builder.vercel.app` (Vercel, always on)
- Render service ID: srv-d8nfe63eo5us73esoqtg
- PR #18 merged code review fixes + deployment config (2026-06-30)

**Backend — 8 API endpoints all implemented + tested:**
1. POST /api/v1/analyze — keyword extraction (spaCy NLP, 80+ skills DB)
2. POST /api/v1/score — ATS match scoring (70% hard / 30% soft)
3. POST /api/v1/gap — gap analysis (text-only, no structured resume needed)
4. POST /api/v1/compliance — 15-check ATS compliance checker
5. POST /api/v1/summary — AI professional summary (HuggingFace, rate-limited 10/min)
6. POST /api/v1/rewrite — AI bullet rewriter (HuggingFace, rate-limited 10/min)
7. POST /api/v1/cover-letter — AI cover letter generator (HuggingFace, rate-limited 10/min)
8. POST /api/v1/export/pdf — PDF export (3 templates: classic, modern, minimal)

**Frontend — 8 components implemented:**
AnalyzerDemo, GapAnalysis, ComplianceChecker, SummaryGenerator, BulletRewriter, CoverLetterGenerator, ResumeExporter, JobTracker
- Full landing page with hero, how-it-works, FAQ (10 items), JSON-LD SEO (XSS-sanitized), OG tags, GA4 ready
- SEO: sitemap.ts, robots.ts, opengraph-image.tsx, Google Search Console verified

**Env vars needed for production:**
- Render: HUGGINGFACE_API_KEY, FRONTEND_URL (= Vercel URL)
- Vercel: NEXT_PUBLIC_API_URL (= Render URL), NEXT_PUBLIC_SITE_URL, optionally NEXT_PUBLIC_GA_ID

**Why:** Personal SaaS project to learn full-stack dev and potentially generate passive revenue via ads, donations, and SEO traffic. [[feedback_new_chat_instructions]] [[project-resume-code-review]]

**How to apply:** Run backend from `backend/` with `uvicorn app.main:app --reload`. Run frontend from `frontend/` with `npm run dev`. HUGGINGFACE_API_KEY required in backend/.env for AI features.
