# Launch Readiness Audit — 2026-08-04

## Verdict

**NO-GO.** The repository candidate is locally green, but the production safety gates are not. An `UNVERIFIED` item is treated as failed.

The current `$0/month additional` ceiling conflicts with the settled “harden fully, then launch” posture. Vercel describes Hobby as personal/non-commercial, Render says Free web services are not for production and sleep after 15 idle minutes, and Supabase Free does not include automatic backups. A commercial launch needs at least Vercel Pro ($20/month), Render Starter ($7/month), and Supabase Pro ($25/month): **$52/month before domain and LLM usage**.

Official references: [Vercel pricing](https://vercel.com/pricing), [Render free-tier limits](https://render.com/docs/free), [Render pricing](https://render.com/articles/render-vs-railway), [Supabase pricing](https://supabase.com/pricing), [Hugging Face inference pricing](https://huggingface.co/docs/inference-providers/en/pricing), and [Google's certified-CMP requirement](https://support.google.com/adsense/answer/13554020).

## Adversarial review

| Attacker/reviewer | Failure path | Current defense | Residual launch risk |
|---|---|---|---|
| Abusive user | Creates accounts or rotates IPs to spend LLM credits | JWT auth, per-route minute limits, global IP limit, new 20/user/day and 500/global/day process-local quotas | **High:** counters reset on restart and are not a billing ledger; account creation has no repository-verifiable CAPTCHA; Hugging Face `:fastest` routing has no fixed per-call cost |
| Resume thief | Queries another user's Supabase rows or enumerates share records | RLS SQL and two-user integration suite; share reads use a single-row RPC; share pages are now noindex | **Blocker:** production RLS suite is skipped without service-role test credentials, so isolation is still UNVERIFIED in the deployed project |
| Scraper | Crawls public pages/share links and calls public analysis | robots disallows `/score`; noindex metadata; IP limits; 1 MB body cap | robots is advisory; process-local limiting can be distributed across IPs and resets on deploy |
| Confused user | Believes a score predicts employer ATS behavior or that pasted text checks layout | Public copy now calls the score an explainable taxonomy comparison and labels layout checks as manual | Some old content may remain outside the scanned phrases; editorial review remains required |
| Regulator | Requests data map, export, deletion, retention proof | Privacy/terms, JSON export, transactional account-delete RPC, RLS schema | **Blocker:** production export/delete and cascade behavior are UNVERIFIED; expired share-row cleanup is not scheduled/proven |
| AdSense reviewer | Checks original content, navigation, privacy, consent, ads.txt, deceptive claims | Legal pages, content, ads.txt, consent defaults, misleading testimonials and claims removed | **Blocker:** the custom banner is not a Google-certified TCF CMP; no real ad-placement/density review can pass before units exist |

## Go/no-go checklist

| Gate | Result | Evidence |
|---|---|---|
| Backend lint and tests | PASS | `python -m ruff check app/ --config ruff.toml` → `All checks passed!`; `pytest -q` → `472 passed, 24 skipped` |
| Frontend lint/build | PASS | `npm run lint` exit 0; production `next build` compiled and generated 31 routes |
| Browser regression/accessibility suite | PASS | `npx playwright test` → `44 passed` |
| Production backend/frontend/DNS/TLS | UNVERIFIED for this release candidate | Local work does not prove the un-deployed commit |
| Production RLS cross-user isolation | UNVERIFIED / NO-GO | 20 credential-dependent tests are among the skipped tests |
| Production account export and deletion | UNVERIFIED / NO-GO | Code is corrected, but no deployed two-user/account-cascade drill ran |
| Recoverable database backup and restore drill | FAIL / NO-GO | Supabase Free lists automatic backups as not included; no successful restore evidence exists |
| Certified ad CMP and TCF v2.3 | FAIL / NO-GO | Repository contains a custom localStorage banner, not a certified CMP |
| LLM unit economics and hard provider spend cap | UNVERIFIED / NO-GO | `Qwen/Qwen2.5-7B-Instruct:fastest` can route to providers with different prices; no measured billing sample or provider-side cap is recorded |
| Render cold-start posture | FAIL for launch | `render.yaml` uses `plan: free`; Render documents roughly one-minute wake-ups and says Free is not for production |
| Commercial Vercel terms | FAIL for monetized launch | Vercel describes Hobby as non-commercial; current logs say Hobby |

## Cost model

Assumptions for capacity only: 20 page/API interactions, 3 AI generations, five 25 KB resume versions, and ten 1 KB job rows per monthly active user. Let `C` be the measured average Hugging Face cost per successful generation. The repo cannot establish `C` because `:fastest` routing is provider-dependent; retrieve it from the Hugging Face billing report before launch.

| Monthly users | Vercel | Render | Supabase | LLM | Expected total |
|---:|---:|---:|---:|---:|---:|
| 100 | $20 Pro | $7 Starter | $25 Pro | `300 × C` | `$52 + 300C + domain/12` |
| 1,000 | $20 Pro | $7 Starter | $25 Pro | `3,000 × C` | `$52 + 3,000C + domain/12` |
| 10,000 | $20 Pro at assumed traffic | $25 Standard recommended pending load proof | $25 Pro at assumed 1.35 GB data | `30,000 × C` | `$70 + 30,000C + domain/12` |

Cliffs, first to last:

1. **The `$0` budget and Hugging Face credit fail first.** Free Hugging Face accounts receive only $0.10/month of routed-provider credits, subject to change.
2. **Render Free user experience fails next.** Idle sleep adds up to roughly a minute and the free plan is explicitly not a production tier.
3. **The new global quota rejects demand:** 500 AI calls/day is at most 15,000/month, only half the assumed AI demand at 10,000 users, and restarts reset it.
4. **Supabase Free storage:** at the stated 135 KB/user assumption, 500 MB is reached near 3,700 users; actual resume JSON size/version count determines the real cliff.
5. **Vercel capacity is unlikely to be the first technical cliff** at these assumptions, but Hobby is the wrong commercial plan regardless of capacity.

## Failure drills — current user outcome

| Drill | User outcome now | Gate |
|---|---|---|
| Hugging Face down/rate-limited | Typed 429/502/503/504 message, retries, then circuit breaker; browser timeout at 65 seconds | PASS locally; production drill UNVERIFIED |
| Supabase down on protected navigation | Redirect to `/service-unavailable`; says no changes were made and offers retry | PASS by build/code review; live drill UNVERIFIED |
| Supabase down during Job Tracker write | Existing data remains on screen; failed cloud mutation is not applied and an alert is shown | PASS by code review/build; live drill UNVERIFIED |
| Render sleeping | Browser waits up to 65 seconds and then shows timeout; Render may need about one minute to wake | NO-GO: bounded but still launch-hostile |
| Malformed PDF upload | There is no PDF upload path; UI accepts pasted text | PASS only if all upload claims stay removed |
| 50-page resume | There is no file upload; pasted fields over 50,000 characters receive 422. PDF export is bounded by schema limits | User must shorten text; acceptable if copy is clear |
| Non-English job description | Taxonomy results can be sparse or misleading; public copy now states English-only scope | Product limitation, not a stack trace; language detection remains backlog |

## Five-minute rollback and detection

Trigger rollback if any of these occur after a release: health fails three times in two minutes; production 5xx exceeds 2% for five minutes; a new Sentry release has a critical uncaught error; sign-in plus one deterministic tool smoke test fails twice; or any cross-user/data-loss report appears. Database changes are never rolled back with these commands.

Frontend, from the linked `frontend` directory:

```powershell
Push-Location .\frontend
npx vercel logs --environment production --status-code 5xx --since 30m
npx vercel rollback
npx vercel rollback status
Pop-Location
Invoke-WebRequest -Uri 'https://resumeai.cv' -UseBasicParsing -TimeoutSec 30
```

Vercel Hobby can roll back only to the immediately previous production deployment. To undo the rollback, use `npx vercel promote <deployment-url>`.

Backend via Render API (set these three process-only environment values first):

```powershell
$renderHeaders = @{
  Authorization = "Bearer $env:RENDER_API_KEY"
  Accept = 'application/json'
  'Content-Type' = 'application/json'
}
$rollbackBody = @{ deployId = $env:RENDER_GOOD_DEPLOY_ID } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/rollback" `
  -Headers $renderHeaders `
  -Body $rollbackBody
Invoke-RestMethod -Uri 'https://unified-resume-builder-api.onrender.com/health' -TimeoutSec 90
```

Render rollback does not disable auto-deploy; do not push or merge the bad commit again. Official command references: [Vercel rollback](https://vercel.com/docs/cli/rollback) and [Render rollback API](https://api-docs.render.com/reference/rollback-deploy).

## Top three accepted risks if launch proceeds

1. Cross-user isolation and erasure could differ from the checked-in SQL because production RLS/RPC behavior is unproven.
2. The product can exhaust its tiny LLM credit or sleep during a first session, making its headline AI features unavailable.
3. Monetizing on Vercel Hobby and serving ads without a certified CMP creates platform/policy exposure before product-market evidence exists.

**Highest-leverage next action:** fund and configure the minimum production baseline (`$52/month + a hard-capped LLM budget`), then run the production RLS/deletion/export and restore drills. This single decision removes the commercial-hosting mismatch, Render sleep, and no-backup contradiction.
