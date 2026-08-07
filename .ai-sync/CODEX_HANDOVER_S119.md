# Codex Handover — Session 119 Tasks

## Context

Claude Code re-triaged the Codex Prompt 3 adversarial audit (PR #31) against current main. 5 of 13 findings were already fixed. Claude took code fixes (R7-R9). These three tasks are assigned to Codex — they are documentation/verification tasks that don't touch the same files.

## Task R11 — Production RLS Verification Runbook

**Goal:** Write `docs/RLS_VERIFICATION.md` — a step-by-step runbook for verifying RLS isolation in production Supabase.

**Details:**
- 20 RLS tests exist in `backend/tests/integration/test_rls_isolation.py` but skip in CI (need `SUPABASE_SERVICE_ROLE_KEY`)
- The runbook should document: (1) how to run the tests locally with production credentials, (2) what each test proves, (3) expected output, (4) what to do if a test fails
- Include the command to run just the RLS tests: `SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... python -m pytest tests/integration/test_rls_isolation.py -v`
- Also document how to add the service role key to GitHub Actions to enable CI runs (see `docs/LAUNCH_PROGRAM.md` R4 section for details)

**Files to read:** `backend/tests/integration/test_rls_isolation.py`, `docs/LAUNCH_PROGRAM.md` (R4 section)
**Files to create:** `docs/RLS_VERIFICATION.md`

## Task R12 — Rollback CLI Setup Guide

**Goal:** Write `docs/ROLLBACK.md` — exact setup steps and verification commands for frontend and backend rollback.

**Details:**
- Frontend: `npx vercel link --cwd frontend` (one-time), `npx vercel rollback --cwd frontend` (emergency)
- Backend: Render API with `RENDER_API_KEY` and `RENDER_SERVICE_ID` env vars
- Document how to find Render deploy IDs: `Invoke-RestMethod -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/deploys?limit=5" -Headers @{Authorization="Bearer $env:RENDER_API_KEY"}`
- Include rollback trigger criteria (from `docs/LAUNCH_PROGRAM.md` Phase 12)
- PowerShell syntax only (Windows environment)

**Files to read:** `docs/LAUNCH_PROGRAM.md` (Phase 12 section), `docs/DEPLOY.md`
**Files to create:** `docs/ROLLBACK.md`

## Task R13 — SMTP Verification Checklist

**Goal:** Write `docs/SMTP_VERIFICATION.md` — checklist for verifying Supabase auth email delivery.

**Details:**
- Supabase default SMTP is limited to 2 emails/hour and team-only recipients
- The project uses Zoho Mail (support@resumeai.cv) — see memory file `reference_support_email.md`
- Checklist should cover: (1) verify custom SMTP in Supabase dashboard, (2) test sign-up email delivery, (3) test password reset email delivery, (4) test email change verification, (5) check email templates in Supabase dashboard
- Include Supabase dashboard path: Settings → Authentication → SMTP Settings
- Zoho SMTP settings: smtp.zoho.com, port 465 (SSL) or 587 (TLS)

**Files to read:** Supabase dashboard (external), `frontend/src/app/actions/auth.ts`
**Files to create:** `docs/SMTP_VERIFICATION.md`

## Branch

Work on branch `feature/codex-prompt3-docs`. Do not touch any files Claude modified (listed in WORKLOG Session 119).
