# Work Log — Shared Context for Claude Code & OpenAI Codex

> ALL agents: READ this file at session start. UPDATE before ending your session.
> Keep entries concise — this is a handoff doc, not a journal.

---

## Current Task

- **Feature:** Launch hardening program (docs/LAUNCH_PROGRAM.md)
- **Branch:** main
- **Status:** Phase 2 partially complete; dashboard verification and tasks 2.9–2.14 remain.

---

## Active Session

| Field      | Value                      |
|------------|----------------------------|
| Agent      | —                          |
| Started    | —                          |
| Working On | —                          |

---

## Session History

<!-- Most recent on top. Keep last 10 sessions. -->

### Session 66 — 2026-07-29
- **Agent:** claude / codex
- **Did:**
  - Added account deletion UI, server action, and self-deletion SQL function
  - Added consent-gated analytics, cookie settings, and privacy/terms updates
  - Fixed new and touched-file Next.js lint violations
  - Verified the production build and all 245 backend tests
- **Files Changed:**
  - `frontend/src/app/(protected)/account/`
  - `frontend/src/app/actions/auth.ts`
  - `frontend/src/app/components/CookieConsent.tsx`
  - `frontend/src/app/layout.tsx`, `page.tsx`, `privacy/page.tsx`, `terms/page.tsx`
  - `supabase-schema.sql`
  - `docs/LAUNCH_PROGRAM.md`
- **Next Steps:**
  - Apply and verify the updated RLS/function schema in Supabase
  - Continue Phase 2 tasks 2.9–2.14
- **Blockers:**
  - Production Supabase dashboard verification requires manual access

### Session 65 — 2026-07-28
- **Agent:** claude
- **Did:**
  - Full repo audit: read every source file, ran all 212 tests, built frontend, hit all 9 endpoints
  - Produced 18-finding severity table in docs/LAUNCH_PROGRAM.md
  - Completed Phase 1 (8 tasks):
    - Removed unused scikit-learn + nltk from requirements.txt (~120MB saved)
    - Added profiles table + RLS to supabase-schema.sql
    - Added pyproject.toml for repo-root test execution
    - Removed hardcoded LAN IP from next.config.ts
    - Removed dead Supabase config from backend config.py
    - Created docs/ENV_VARS.md (full env var matrix)
    - Added httpx client lifespan shutdown in main.py
    - Fixed flaky hypothesis deadline (200ms → 1000ms)
- **Files Changed:**
  - `backend/requirements.txt` (removed nltk, scikit-learn)
  - `backend/app/core/config.py` (removed dead Supabase vars)
  - `backend/app/main.py` (added lifespan context manager)
  - `backend/app/services/ai/hf_client.py` (added close_client)
  - `backend/pyproject.toml` (new — pytest pythonpath)
  - `backend/tests/unit/test_property.py` (hypothesis deadline fix)
  - `frontend/next.config.ts` (removed allowedDevOrigins)
  - `supabase-schema.sql` (added profiles table + RLS)
  - `docs/LAUNCH_PROGRAM.md` (new — full launch program)
  - `docs/ENV_VARS.md` (new — env var matrix)
- **Next Steps:**
  - Phase 2: Security, Privacy & Legal (account deletion, cookie consent, RLS verification)
- **Blockers:**
  - None

### Session 64 — 2026-07-28
- **Agent:** codex
- **Did:**
  - Added an optional Claude account-switching guide to the handoff script
  - Documented the new `-To claude -SwitchAccount` workflow
  - Added validation preventing account switching on a Codex handoff
- **Files Changed:**
  - `.ai-sync/handoff.ps1`
  - `.ai-sync/README.md`
  - `.ai-sync/WORKLOG.md`
- **Next Steps:**
  - Add the coordination files to source control when ready
- **Blockers:**
  - None

### Session 63 — 2026-07-28
- **Agent:** codex
- **Did:**
  - Verified the Claude Code and Codex CLI coordination setup
  - Removed remaining references to the excluded third agent
  - Validated both handoff targets and invalid-target rejection
- **Files Changed:**
  - `.ai-sync/WORKLOG.md`
  - `.ai-sync/DECISIONS.md`
- **Next Steps:**
  - Add the coordination files to source control when ready
- **Blockers:**
  - None

### Session 62 — 2026-07-28
- **Agent:** claude
- **Did:**
  - Set up 2-agent coordination system (CLAUDE.md, AGENTS.md, .ai-sync/)
  - Adapted all files for this project's stack (Next.js 16 + FastAPI, not Angular)
  - Configured coordination for Claude Code and Codex CLI only
- **Files Changed:**
  - `CLAUDE.md` (new)
  - `AGENTS.md` (new)
  - `.ai-sync/README.md` (new)
  - `.ai-sync/WORKLOG.md` (new)
  - `.ai-sync/DECISIONS.md` (new)
  - `.ai-sync/handoff.ps1` (new)
- **Next Steps:**
  - Pick up next item from master backlog (see DECISIONS.md for current state)
- **Blockers:**
  - Footer email address needed from user (B1 in backlog)

---

## Shared Context

- **Stack:** Next.js 16 (frontend/) + FastAPI (backend/) + Supabase auth/db
- **Domain:** resumeai.cv (Vercel deploy)
- **Backend deploy:** Render (render.yaml)
- **Tests:** 245 passing (backend pytest), frontend production build clean
- **proxy.ts IS the Next.js middleware** — never recreate middleware.ts
- **Commit rule:** no Co-Authored-By, no AI attribution, ever
- **Localhost rule:** make changes → localhost:3000 → user approves → then commit
- **Tool count:** 9 tools (FAQ names 9 distinct tools — never change without user sign-off)
