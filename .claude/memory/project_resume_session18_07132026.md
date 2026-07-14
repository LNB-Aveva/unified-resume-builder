---
name: resume-session18-07132026
description: "2026-07-13 Session 18: domain chosen resumeai.cv, code changes committed ed9ad5b, DNS/Vercel config steps 2-7 pending"
metadata:
  node_type: memory
  type: project
  originSessionId: session18-2026-07-13
---

## Session 18 — 2026-07-13

### Domain Decision
- Chose: resumeai.cv ($8.03/yr flat on Porkbun — cheapest with exact brand match)
- Rejected: resumeai.tools ($9.78 yr1 BUT $29.35 renewal = 3x hike trap)
- Rejected: airesumematch.com ($11.08/yr flat but no brand match)
- Rejected: tryresumeai.com (Inquire = taken)
- Cross-checked Cloudflare + Namecheap — Porkbun had best price for .cv
- .cv PRIVACY NOTE: no WHOIS privacy opt-in BUT registry auto-redacts for individuals

### Domain Purchase
- resumeai.cv purchased on Porkbun at $8.03 USD total
- NO COM/NET bundle (correctly skipped upsell)
- Registered as: individual (important for .cv privacy auto-redaction)

### Code Changes Committed (ed9ad5b)
Two files fixed from domain audit:

1. frontend/src/app/opengraph-image.tsx line 167
   BEFORE: unified-resume-builder.vercel.app · 100% free · No account required
   AFTER:  resumeai.cv · 100% free · No account required
   WHY: OG images baked this text — would appear on every social share

2. frontend/next.config.ts line 18
   BEFORE: "connect-src 'self' https://*.supabase.co https://unified-resume-builder-api.onrender.com"
   AFTER:  uses _backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://unified-resume-builder-api.onrender.com"
   WHY: CSP hygiene — backend URL now driven by env var
   NOTE: This does NOT break domain migration (backend Render URL unchanged)

Build: npm run build PASSES — all 12 routes clean after both changes.

### Domain Audit Findings (all files checked)
Files that auto-update via NEXT_PUBLIC_SITE_URL (no changes needed):
- frontend/src/app/layout.tsx
- frontend/src/app/sitemap.ts
- frontend/src/app/robots.ts
- frontend/src/app/page.tsx
- frontend/src/app/ats-checker/page.tsx
- frontend/src/app/keyword-analyzer/page.tsx
- frontend/src/app/blog/[slug]/page.tsx

Backend already done (commit a19cc05):
- backend/app/main.py — CORS supports comma-separated FRONTEND_URL

### Current Repo State
Branch: main, latest commit: ed9ad5b
Clean working tree, fully pushed.

### Pending — Steps 2-7 of Domain Configuration

STEP 2 — Vercel domain (DO THIS FIRST before DNS):
  1. vercel.com/dashboard → unified-resume-builder → Settings → Domains → Add Domain
  2. Add: resumeai.cv → click Add
  3. Add: www.resumeai.cv (Vercel auto-redirects www → apex)
  4. Vercel shows A record value (should be 76.76.21.21) — copy it

STEP 3 — DNS on Porkbun:
  1. porkbun.com → Domain Management → resumeai.cv → DNS
  2. A record: Name @, Value 76.76.21.21, TTL 600
  3. CNAME: Name www, Value cname.vercel-dns.com, TTL 600
  4. Wait 5-30 min for Vercel green checkmark

STEP 4 — Vercel env vars:
  - NEXT_PUBLIC_SITE_URL = https://resumeai.cv (Production)
  - Trigger Redeploy after saving

STEP 5 — Render env vars:
  - FRONTEND_URL = https://unified-resume-builder.vercel.app,https://resumeai.cv
  - Click "Save, rebuild, and deploy"

STEP 6 — Verify (run in Claude Code chat after Vercel redeploys):
  ! curl -sI https://resumeai.cv | head -5
  ! curl -s https://resumeai.cv/sitemap.xml | head -10
  ! curl -s https://resumeai.cv/robots.txt
  Expected: 200 OK, sitemap has resumeai.cv, robots.txt points to https://resumeai.cv/sitemap.xml

STEP 7 — Google Search Console:
  - Add resumeai.cv as new property (Domain type)
  - Submit sitemap: https://resumeai.cv/sitemap.xml
  - Keep existing Vercel property (both index, Google consolidates via canonical)

### All Commits This Session
- a19cc05: CORS multi-origin support (session 17)
- 15e0d31: session17 memory update
- ed9ad5b: OG image + CSP domain fixes (session 18)

**Why:** Custom domain resumeai.cv chosen for brand alignment + cheapest flat renewal.
**How to apply:** Complete Steps 2-7 above in order. Do NOT do DNS before Vercel setup or SSL may be delayed.
