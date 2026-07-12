---
name: resume-session-13
description: "Session 13 (2026-07-03 late) — PR #19 merged, PR #20 open, bullet rewriter fix, security headers, GitHub noreply email discovered"
metadata:
  node_type: memory
  type: project
  originSessionId: current
---

## Session 13 — 2026-07-03 (evening)

### PR #19 Merged
- Squash-merged maintainability audit PR: commit `14a8160`
- CI: Backend + Frontend both PASS
- Vercel preview was FAILING (email mismatch) but main deploy works fine
- Render auto-deployed from merge — verified healthy (root returns 200, analyze endpoint works)

### PR #20 Created
- Branch: `fix/bullet-rewriter-security-headers`
- URL: https://github.com/LNB-Aveva/unified-resume-builder/pull/20
- Commit: `793cf35` — 2 files, +70/-1 lines
- CI: Backend passed, Frontend + Vercel pending at session end

### Changes in PR #20

**Bullet Rewriter Bug Fix (rewriter.py):**
- Root cause: `_MAX_TOKENS = 700` too low for 5 bullets, causing truncation. Also Qwen2.5-7B with `:fastest` routing often only outputs 1 block.
- Fix 1: Increased `_MAX_TOKENS` from 700 to 1200
- Fix 2: Added `_SINGLE_MAX_TOKENS = 250` and `_build_single_message()` for individual rewrites
- Fix 3: Added `_rewrite_single()` async function
- Fix 4: In `rewrite_bullets()`, after batch parse, if `len(rewrites) < len(bullets)`, individually rewrites missing bullets via fallback

**Security Headers (main.py):**
- Added `SecurityHeadersMiddleware` (Starlette BaseHTTPMiddleware)
- Headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- HSTS added only in production (`max-age=31536000; includeSubDomains`)

### Security Audit Status (all items resolved)
- Rate limiting: all 8 endpoints (already done)
- Input size limits: all schemas have max_length (already done)
- /docs disabled in prod (already done)
- CORS tightened to specific origins (already done)
- Prompt injection: sanitizer in place (already done)
- CSP/security headers: NOW DONE (this session)
- Supabase key rotation: user manual action (pending)

### GitHub Email Discovery
- `bobby.bingo696@gmail.com` is set as **private** on GitHub — pushes with this email are blocked by GH007
- Noreply email: `274821620+LNB-Aveva@users.noreply.github.com`
- Future pushes MUST use the noreply email as commit author/committer
- To fix permanently: user can go to GitHub Settings > Emails > uncheck "Block command line pushes that expose my email"

### Verification
- Backend: 74 tests pass (0.22s), all files compile
- Frontend: TypeScript --noEmit clean
- ai_modules/ dead scaffolding already cleaned up (doesn't exist)

### Verification After PR #20 Merge
- Render: 200 OK, security headers confirmed (nosniff, DENY, HSTS, referrer-policy)
- Bullet rewriter E2E: 3 bullets submitted, all 3 rewritten with keywords — bug FIXED
- Frontend: Vercel 200 OK
- Supabase key rotation: pending user manual action

### PR #21 Created and Merged
- Branch: `fix/connection-error-messages`
- URL: https://github.com/LNB-Aveva/unified-resume-builder/pull/21
- Fixed: 3 components had hardcoded "Make sure FastAPI is running on port 8000" error message
- Extracted `connectionError()` helper to `types.ts` — all 6 components now use it
- Deduped inline error handling from BulletRewriter, SummaryGenerator, CoverLetterGenerator
- Net: +27/-44 lines across 7 files
- CI: All green (Backend, Frontend, Vercel preview)
- Merged: 2026-07-04 02:26 UTC

### User also set NEXT_PUBLIC_API_URL for Preview environments on Vercel
- Previous preview deployments only had Production env vars
- Now set for both Production and Preview

### Supabase service_role key rotated (user confirmed Done)

### PR #21 Preview Error Context
- User saw "Could not connect to backend" on Vercel preview URL `unified-resume-builder-fw9truy3f.vercel.app`
- Root cause: `NEXT_PUBLIC_API_URL` was only set for Production, not Preview on Vercel
- User added it for Preview via Vercel Dashboard (value: `https://unified-resume-builder-api.onrender.com`)
- Code fix: removed all hardcoded "port 8000" messages, shared `connectionError()` helper

### SEO Discovery
- Searched "Unified resume builder" on Google — site NOT in organic results
- BUT Google AI Overview DOES cite "ResumeAI — Free ATS Resume Builder & Keyword Analyzer" — indexed and recognized
- `site:unified-resume-builder.vercel.app` should confirm indexing
- Root causes: Vercel subdomain (low authority), 3-week-old site, zero backlinks, single-page app
- Next session: custom domain, backlinks strategy, blog/multi-page, keyword targeting

### No remaining code items. Project is fully deployed and hardened.

**Why:** Bug fix (visible UX issue) + security hardening (headers) pushed as PR #20.
**How to apply:** Use noreply email for all future commits to this repo.
