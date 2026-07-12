---
name: project-resume-golive-07012026
description: "07.01.2026 go-live session — Fixed all 3 AI endpoints, HuggingFace provider migration, all 8 features now working live"
metadata: 
  node_type: memory
  type: project
  originSessionId: c30b8ace-ec30-4de6-877f-d65409b022f3
---

## ResumeAI Go-Live Session — 2026-07-01

### What was broken
Steps 4-6 (Summary, Cover Letter, Bullet Rewriter) showed "Failed to fetch" on the live site. Steps 1-3 and 7-8 worked fine.

### Root cause chain
1. **`api-inference.huggingface.co` DNS removed** — deprecated hostname, `ConnectError: [Errno -5]`
2. **`hf-inference` provider dropped chat completion** — as of July 2025, only handles CPU tasks
3. **Unhandled exceptions bypassed CORS middleware** — Starlette's `ServerErrorMiddleware` sits outside `CORSMiddleware`, plain text 500 without CORS headers, browser blocks as "Failed to fetch"

### Fixes deployed (5 commits to LNB-Aveva/unified-resume-builder main)
| Commit | Fix |
|--------|-----|
| a1a62ad | catch-all `except Exception` in 3 AI routes + frontend error UX + cover letter 900 char validation |
| b9776d8 | migrate DNS to router.huggingface.co |
| 18ae066 | attempt novita-ai provider (wrong URL format) |
| 50d2434 | fix: correct router URL format |
| 873b8cf | fix: use :fastest provider selection for auto-routing |

### Files changed (9 files, 117 insertions)
**Backend routes (catch-all exception handler):**
- `backend/app/api/routes/summary.py`
- `backend/app/api/routes/cover_letter.py`
- `backend/app/api/routes/rewrite.py`

**Backend AI services (model + URL migration):**
- `backend/app/services/ai/summarizer.py`
- `backend/app/services/ai/cover_letter.py`
- `backend/app/services/ai/rewriter.py`

**Frontend components (better error messages):**
- `frontend/src/app/components/SummaryGenerator.tsx`
- `frontend/src/app/components/CoverLetterGenerator.tsx`
- `frontend/src/app/components/BulletRewriter.tsx`

### Current live state
- Backend: `https://unified-resume-builder-api.onrender.com` — all endpoints 200 OK
- Frontend: `https://unified-resume-builder.vercel.app` — all 8 steps working
- AI model: `Qwen/Qwen2.5-7B-Instruct:fastest` via `router.huggingface.co/v1/chat/completions`
- Response times: summary ~1.6s, rewrite ~1.4s, cover letter ~3.7s

### Sync status
- GitHub (LNB-Aveva/unified-resume-builder): pushed, Render auto-deployed, live
- my-workspace: committed locally as `7dd85bc`, NOT pushed to remote yet
- `unified-resume-builder-deploy/` (1.3MB temp clone) still in my-workspace root — can be deleted
- SESSION_LOG.md updated with Session 7

### Still pending
1. Push my-workspace to its remote (if desired)
2. Delete `unified-resume-builder-deploy/` temp clone (1.3MB)
3. ~~Browser end-to-end test of Steps 4-6~~ DONE (Session 8 — all 3 PASS, zero console errors)
4. Optional: UptimeRobot ping to prevent Render cold starts (62s cold start confirmed)
5. Optional: Clean up `ai_modules/` dead scaffolding
6. Step 6 bullet count bug — only rewrites 1 of N bullets (low priority)

**Why:** Getting ResumeAI live for real user feedback. [[project-ai-resume-generator]]
**How to apply:** All AI endpoints working. Monitor for HuggingFace quota limits (free tier has monthly credits).
