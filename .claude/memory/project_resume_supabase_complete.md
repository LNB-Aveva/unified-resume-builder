---
name: project-resume-supabase-complete
description: "07.01.2026 Supabase setup complete — all 6 steps done, deployed, VERIFY URL is pagdtcttkviglvoeuagy.supabase.co not Vercel URL"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9c1a1d13-a842-4e5d-b72a-84d99c0d508a
---

## Supabase Setup — COMPLETED 2026-07-01

All 6 steps done:
1. Project "resumeai" created (LNB-Aveva's Org, Americas region, West US Oregon)
2. Anonymous sign-ins enabled (Authentication > Providers)
3. SQL schema executed (jobs table + RLS + index, "Success. No rows returned")
4. API keys obtained (Project ID: pagdtcttkviglvoeuagy)
5. Env vars set on Vercel (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
6. Redeployed on Vercel (Ready, 57s, Production)

**VERIFIED:** NEXT_PUBLIC_SUPABASE_URL updated to `https://pagdtcttkviglyoeuagy.supabase.co` and redeployed (confirmed via Vercel screenshot). Env var set for Production and Preview.

**TESTED & WORKING:** Browser automation confirmed "3 jobs tracked - Synced to cloud". localStorage migration worked (2 old jobs + 1 new = 3 rows in Supabase). Anonymous auth active, GET /rest/v1/jobs returns 200.

**SECURITY:** Service role key was exposed in chat. Rotate at Supabase Dashboard > Settings > API Keys.

**Why:** Supabase provides cloud persistence for Job Tracker feature, replacing localStorage-only approach.

**How to apply:** Browser-test the Job Tracker at unified-resume-builder.vercel.app — if jobs sync across devices/browsers, Supabase is working. If they only persist locally, the URL is likely wrong.

See [[project-resume-session8-07012026]] [[project-ai-resume-generator]]
