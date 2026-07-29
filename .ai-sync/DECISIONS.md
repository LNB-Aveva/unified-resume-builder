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

### DEC-007: Cookie Consent — localStorage + Dynamic GA4 Loading
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** GDPR/ePrivacy requires consent before analytics/advertising cookies. GA4 was loading unconditionally.
- **Decision:** CookieConsent component stores consent in localStorage (`cookie_consent` key). GA4 scripts are dynamically injected only after "Accept". Cookie Settings button in footer resets consent.
- **Alternatives Considered:** Third-party consent SDK (CookieYes, OneTrust) — rejected; adds external dependency for a simple use case.
- **Files Affected:** `frontend/src/app/components/CookieConsent.tsx`, `frontend/src/app/layout.tsx`

### DEC-008: Account Deletion via SQL SECURITY DEFINER Function
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** Users need to delete their own auth.users row (GDPR Art. 17). Supabase client SDK cannot delete from auth.users directly.
- **Decision:** SQL function `delete_own_user()` with SECURITY DEFINER executes `delete from auth.users where id = auth.uid()`. Frontend server action deletes jobs → profiles → calls RPC → signs out.
- **Alternatives Considered:** Supabase Edge Function with service_role key — rejected; adds infra complexity. Admin API call from backend — rejected; backend doesn't connect to Supabase.
- **Files Affected:** `supabase-schema.sql`, `frontend/src/app/actions/auth.ts`

### DEC-009: Data Export as JSON Download (No Email)
- **Date:** 2026-07-29
- **Agent:** claude
- **Context:** GDPR data portability right requires users to export their data.
- **Decision:** Server action fetches profile + jobs from Supabase, returns JSON string. Client component creates a Blob and triggers browser download. No email, no S3, no background job.
- **Alternatives Considered:** Email export — rejected; requires email service. ZIP with PDF — rejected; overengineered for the data volume.
- **Files Affected:** `frontend/src/app/actions/auth.ts`, `frontend/src/app/(protected)/account/ExportDataButton.tsx`

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
