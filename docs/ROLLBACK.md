# Frontend and Backend Rollback Runbook

This runbook rolls back Vercel and Render independently. It does not roll back Supabase schema or data. Record the current and target deployment IDs before executing any rollback.

## Verification status

- **Repository procedure — complete:** Vercel CLI rollback/promotion and the Render rollback API were rechecked against current official provider documentation on 2026-08-14. The commands and independent smoke checks below are ready for an operator.
- **Vercel owner rehearsal — complete:** On 2026-08-03, the owner rolled production back to the previous deployment, verified the site and `ads.txt`, promoted the latest deployment again, and reverified both surfaces.
- **Render owner rehearsal — pending:** No retained evidence proves that the owner has executed a Render rollback, restored the latest deployment, run the authenticated smoke check, or recorded elapsed recovery time.
- **Database recovery — outside application rollback and pending:** Supabase Free has no included automatic project backups or point-in-time recovery. Manual logical backups exist, but no retained non-production restore rehearsal proves recoverability.

## Trigger criteria

Rollback a new application release when it is the probable cause of one of these conditions:

- UptimeRobot reports the frontend or backend down after the deployment.
- Sentry records more than 10 new errors in one hour from the new release.
- Render enters an OOM/crash loop after the new backend deploy.
- Sign-in or a deterministic production smoke check fails twice.
- A user reports data loss or cross-user access attributable to the release.

Do not roll back blindly for a Vercel, Render, Supabase, or Hugging Face platform outage. Confirm a known-good application deployment exists first. For suspected data exposure or loss, start the incident-response plan as well; an application rollback does not restore database rows.

## One-time Vercel CLI setup

The repository intentionally ignores `frontend/.vercel/`. Each operator workstation must link it once.

```powershell
Set-Location 'C:\My-Work-Space\AI-Resume-Generator'
node --version
npm --version
npx vercel --version
npx vercel login
npx vercel link --cwd frontend
```

During `vercel link`, select the Vercel account that owns `resumeai.cv` and the existing `unified-resume-builder` project. Do not create a second project.

Verify the link without exposing a token:

```powershell
Test-Path .\frontend\.vercel\project.json
npx vercel list --cwd frontend
```

The first command must return `True`; the deployment list must be for the production project serving `resumeai.cv`.

## Frontend rollback — Vercel

### Select and record the target

```powershell
Set-Location 'C:\My-Work-Space\AI-Resume-Generator'
npx vercel list --cwd frontend
$vercelGoodDeployment = 'https://REPLACE-WITH-KNOWN-GOOD-DEPLOYMENT.vercel.app'
```

On Vercel Hobby, rollback is limited to the immediately previous production deployment. Do not assume an older deployment URL can be selected until the CLI accepts it.

### Execute

```powershell
npx vercel rollback $vercelGoodDeployment --cwd frontend
npx vercel rollback status --cwd frontend
```

If the incident procedure calls for the immediately previous production deployment and its URL is already confirmed, `npx vercel rollback --cwd frontend` can be used without an argument.

### Verify within five minutes

```powershell
$home = Invoke-WebRequest -Uri 'https://resumeai.cv' -UseBasicParsing -TimeoutSec 30
$privacy = Invoke-WebRequest -Uri 'https://resumeai.cv/privacy' -UseBasicParsing -TimeoutSec 30
$ads = Invoke-WebRequest -Uri 'https://resumeai.cv/ads.txt' -UseBasicParsing -TimeoutSec 30

$home.StatusCode
$privacy.StatusCode
$ads.StatusCode
```

All three must return `200`. Then verify sign-in and one deterministic tool flow in a private browser window and check Vercel/Sentry for new errors.

To undo a rollback after the bad release is fixed:

```powershell
$vercelFixedDeployment = 'https://REPLACE-WITH-VERIFIED-FIXED-DEPLOYMENT.vercel.app'
npx vercel promote $vercelFixedDeployment --cwd frontend
```

## One-time Render API setup

Create an API key in the Render account dashboard. Keep it process-scoped:

```powershell
$renderSecureKey = Read-Host 'Render API key' -AsSecureString
$env:RENDER_API_KEY = [Net.NetworkCredential]::new('', $renderSecureKey).Password
$env:RENDER_SERVICE_ID = 'srv-REPLACE-WITH-BACKEND-SERVICE-ID'

if ([string]::IsNullOrWhiteSpace($env:RENDER_API_KEY)) {
    throw 'RENDER_API_KEY is missing.'
}
if ($env:RENDER_SERVICE_ID -notmatch '^srv-') {
    throw 'RENDER_SERVICE_ID must be the backend service ID from Render.'
}
```

The service ID is visible in the Render service URL/dashboard. It can also be found with the List Services API; select the service named for the ResumeAI backend, not a database or static site.

## Find Render deploy IDs

```powershell
$renderHeaders = @{
    Authorization = "Bearer $env:RENDER_API_KEY"
    Accept = 'application/json'
}

$deployRows = Invoke-RestMethod `
    -Method Get `
    -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/deploys?limit=5" `
    -Headers $renderHeaders

$deployRows | ForEach-Object {
    $deploy = if ($_.deploy) { $_.deploy } else { $_ }
    [pscustomobject]@{
        Id = $deploy.id
        Status = $deploy.status
        Commit = $deploy.commit.id
        CreatedAt = $deploy.createdAt
        FinishedAt = $deploy.finishedAt
    }
} | Format-Table -AutoSize
```

Choose a previously successful deploy that predates the incident. Copy its exact `dep-...` ID:

```powershell
$env:RENDER_GOOD_DEPLOY_ID = 'dep-REPLACE-WITH-KNOWN-GOOD-ID'
if ($env:RENDER_GOOD_DEPLOY_ID -notmatch '^dep-') {
    throw 'RENDER_GOOD_DEPLOY_ID is not a Render deploy ID.'
}
```

## Backend rollback — Render

```powershell
$rollbackBody = @{
    deployId = $env:RENDER_GOOD_DEPLOY_ID
} | ConvertTo-Json

$rollback = Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/rollback" `
    -Headers ($renderHeaders + @{ 'Content-Type' = 'application/json' }) `
    -Body $rollbackBody

$rollback
```

Render returns HTTP `201` when the rollback is accepted. The rollback endpoint does not disable auto-deploy; prevent the bad commit from being merged or deployed again.

### Verify within five minutes

```powershell
$healthUri = 'https://unified-resume-builder-api.onrender.com/health'
$health = $null

1..6 | ForEach-Object {
    if ($null -eq $health) {
        try {
            $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 30
        } catch {
            Start-Sleep -Seconds 10
        }
    }
}

if ($null -eq $health -or $health.status -ne 'ok') {
    throw 'Backend health did not recover after rollback.'
}

$health
Invoke-WebRequest -Uri 'https://resumeai.cv' -UseBasicParsing -TimeoutSec 30 |
    Select-Object StatusCode
```

Then check Render logs for crash loops, confirm Sentry stopped receiving the release-specific error, and run one deterministic authenticated tool request.

## End the emergency session

```powershell
Remove-Item Env:RENDER_GOOD_DEPLOY_ID -ErrorAction SilentlyContinue
Remove-Item Env:RENDER_SERVICE_ID -ErrorAction SilentlyContinue
Remove-Item Env:RENDER_API_KEY -ErrorAction SilentlyContinue
$renderSecureKey = $null
```

Record the incident start, rollback time, bad deployment ID, restored deployment ID, verification results, and follow-up owner in the incident log.

## Database recovery boundary

Application rollback never restores Supabase rows or reverses schema changes. Before production DDL, run `scripts/backup-supabase.ps1`, verify the non-empty dump and its manifest, and record the reverse SQL. The production Free plan does not include automatic project backups or point-in-time recovery.

A backup file is not restore proof. Restore the selected manual backup only into a safe non-production Supabase/Postgres target, validate schema and representative row counts without exposing production resume content, record the result, and destroy the temporary restored copy under the manual-backup retention procedure. Until that succeeds—or a managed backup tier is adopted and tested—the database recovery portion remains owner-pending.

## References

- Vercel link: https://vercel.com/docs/cli/link
- Vercel rollback: https://vercel.com/docs/cli/rollback
- Render List Deploys API: https://api-docs.render.com/reference/list-deploys
- Render Rollback API: https://api-docs.render.com/reference/rollback-deploy
- Supabase database backups: https://supabase.com/docs/guides/platform/backups
- Project incident response: `docs/INCIDENT-RESPONSE.md`

