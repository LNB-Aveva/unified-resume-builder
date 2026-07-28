# Decisions Log — Shared Architectural Decisions

> ALL agents: READ before making changes that affect architecture or patterns.
> APPEND new decisions when you make a non-trivial design choice.
> Never delete or modify existing entries — they are historical record.

---

## Format

### DEC-NNN: Short Title
- **Date:** YYYY-MM-DD
- **Agent:** claude / codex / manual
- **Context:** why this decision was needed
- **Decision:** what was decided
- **Alternatives Considered:** what was rejected and why
- **Files Affected:** key files

---

## Decisions

### DEC-006: Tool Count Fixed at 9
- **Date:** 2026-07-25
- **Agent:** claude
- **Context:** FAQ section lists tool names; changing the count would require updating multiple hardcoded strings across the site.
- **Decision:** Tool count stays at 9 permanently. Do not add or remove tools from the count without explicit user sign-off.
- **Alternatives Considered:** Dynamic count — rejected because it adds complexity for no user-visible benefit.
- **Files Affected:** `frontend/src/app/page.tsx`, FAQ section

### DEC-004: proxy.ts IS the Middleware
- **Date:** 2026-07-24
- **Agent:** claude
- **Context:** Next.js 16 changed middleware conventions; a previous session accidentally created middleware.ts alongside proxy.ts, causing a conflict.
- **Decision:** `frontend/src/app/proxy.ts` is the sole Next.js middleware file. Never create or restore `middleware.ts`.
- **Alternatives Considered:** Rename to middleware.ts — rejected; proxy.ts is established and deletion of middleware.ts was the fix.
- **Files Affected:** `frontend/src/app/proxy.ts`

### DEC-003: Auth Gating via Supabase (All Tools)
- **Date:** 2026-07-19
- **Agent:** claude
- **Context:** PLG strategy requires one un-gated tool (Keyword Extractor) for SEO/conversion, all others require sign-in.
- **Decision:** Supabase Auth gates all tools except the Keyword Extractor. Free tier Supabase (project: pagdtcttkviglyoeuagy).
- **Alternatives Considered:** No gating — rejected; needed for conversion funnel. Full gating — rejected; kills PLG SEO traffic.
- **Files Affected:** `frontend/src/app/proxy.ts`, all tool route pages

### DEC-002: Git History — No AI Attribution
- **Date:** 2026-07-25
- **Agent:** claude
- **Context:** Co-Authored-By lines were present in 113 commits; cleaned in Session 55 via git filter-branch.
- **Decision:** No Co-Authored-By, no AI tool names, no AI attribution in any commit message or file — ever.
- **Alternatives Considered:** Keeping attribution — rejected by user; not appropriate for this project.
- **Files Affected:** git history (all commits)

### DEC-001: Next.js Frontend + FastAPI Backend Split
- **Date:** 2026-07-12
- **Agent:** manual
- **Context:** Initial architecture decision for resumeai.cv.
- **Decision:** Frontend in `frontend/` (Next.js 16, Vercel), backend in `backend/` (FastAPI, Render). CORS configured for both prod and localhost.
- **Alternatives Considered:** Monorepo with Next.js API routes — rejected; FastAPI needed for Python ML/AI libraries (HuggingFace, fpdf2).
- **Files Affected:** `frontend/`, `backend/`, `render.yaml`, `vercel.json`
