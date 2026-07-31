# CLAUDE.md — Project Memory for Claude Code

## Identity
You are working on **resumeai.cv** — an AI-powered resume builder SaaS.
You work alongside **GitHub Copilot** on this repo.
Always check shared context before starting any task.

## Startup Checklist (EVERY session)
1. Read `.ai-sync/WORKLOG.md` — current task state and session history
2. Read `.ai-sync/DECISIONS.md` — design decisions by any agent
3. Run `git log --oneline -15` — look for `[copilot]` prefixes
4. Run `git diff --stat` — see uncommitted changes

## After Completing Work
1. Update `.ai-sync/WORKLOG.md` with what you completed, what's remaining, any blockers
2. Update `.ai-sync/DECISIONS.md` if you made architectural or design choices
3. Commit prefix: `[claude] <message>` — NO "Co-Authored-By" lines ever

## Commit Convention
- `[claude]`  — work done by Claude Code
- `[copilot]` — work done by GitHub Copilot
- `[manual]`  — manual human edits

## Tech Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS — in `frontend/`
- **Backend:** FastAPI (Python) — in `backend/`, deployed on Render
- **Auth + DB:** Supabase (project: pagdtcttkviglyoeuagy)
- **Domain:** resumeai.cv (Vercel)

## Hard Rules
- **localhost-first:** make changes → show localhost:3000 → wait for approval → THEN commit/push
- **No AI traces:** never add Co-Authored-By, AI tool names, or AI attribution anywhere
- **No hallucination:** never reference plugins, commands, or features that don't exist
- **Verify counts:** before changing any numeric claim, grep all instances across the file
- **Schema sync:** when changing max_length/min_length/Literal in a schema, grep backend/tests/ and update boundary tests in the same commit
- **proxy.ts IS the middleware** in Next.js 16 — never recreate `middleware.ts`
- **LINT BEFORE COMMIT (mandatory):** before EVERY `git commit`, run BOTH lint commands below and fix all errors. Never commit with lint failures — CI will reject it and it wastes the GitHub Actions budget. The `.githooks/pre-commit` hook enforces this automatically.

## Commands
- Frontend: `cd frontend && npm run dev` (dev), `npm run build` (verify), `npm run lint`
- Backend: `cd backend && pytest` (tests), `uvicorn main:app --reload` (dev)
- **Lint (MUST pass before commit):**
  - `cd backend && python -m ruff check app/ --config ruff.toml`
  - `cd frontend && npm run lint`
- Pre-commit hook: `.githooks/pre-commit` (auto-runs via `git config core.hooksPath .githooks`)

## Key Files
- `.ai-sync/WORKLOG.md`   — shared task log (READ + WRITE every session)
- `.ai-sync/DECISIONS.md` — shared decisions log
- `AGENTS.md`             — Codex instructions (READ ONLY)
- `frontend/src/app/proxy.ts` — Next.js middleware (NOT middleware.ts)
