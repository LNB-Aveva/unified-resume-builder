# Work Log — Shared Context for Claude Code & OpenAI Codex

> ALL agents: READ this file at session start. UPDATE before ending your session.
> Keep entries concise — this is a handoff doc, not a journal.

---

## Current Task

- **Feature:** (describe the current feature/task)
- **Branch:** main
- **Status:** Idle — awaiting next task

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
- **Repo tip:** bab69c8 (as of Session 62)
- **Tests:** 201 passing (backend pytest), frontend builds clean
- **proxy.ts IS the Next.js middleware** — never recreate middleware.ts
- **Commit rule:** no Co-Authored-By, no AI attribution, ever
- **Localhost rule:** make changes → localhost:3000 → user approves → then commit
- **Tool count:** 9 tools (FAQ names 9 distinct tools — never change without user sign-off)
