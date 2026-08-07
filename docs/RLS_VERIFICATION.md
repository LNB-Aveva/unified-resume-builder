# Production RLS Verification Runbook

Use this runbook to prove that the deployed Supabase policies prevent one user from accessing another user's resume data. This is a production mutation test: it creates temporary Auth users and rows, invokes account deletion once, and then removes the test users.

## Scope and pass condition

The source of truth is `backend/tests/integration/test_rls_isolation.py`. It currently contains 20 tests:

| Test group | Count | What it proves |
|---|---:|---|
| Profiles | 6 | Each user can create their own profile; another user cannot read, update, delete, or impersonate that profile. |
| Jobs | 4 | Another user cannot read, update, delete, or create a job under the owner's ID. |
| Resumes | 4 | Another user cannot read, update, delete, or create a resume under the owner's ID. |
| Resume versions | 3 | Another user cannot read/delete a version or attach a version to someone else's resume. |
| Shared scores | 2 | Anonymous inserts are rejected and an authenticated user cannot create a score owned by someone else. |
| Account-deletion cascade | 1 | `delete_own_user()` removes the Auth user and all owned profile, job, resume, version, and shared-score rows. |

The gate passes only when all 20 tests pass against the production project in one run. A skipped test, unexpected row, or accepted cross-user mutation is a failed gate.

## Safety requirements

- Run during a quiet maintenance window and take the manual Supabase backup first.
- Use only the production project `pagdtcttkviglyoeuagy`; do not mix keys from different projects.
- Use a dedicated terminal. All secrets below are process-scoped and must be removed afterward.
- The service-role key bypasses RLS. Never store it in the repository, a frontend variable, a command transcript, or a PR log.
- The tests create users prefixed `rls-test-a-`, `rls-test-b-`, and `rls-cascade-`. Confirm they are gone after the run.
- Do not run the production suite automatically for pull requests. Use a manually dispatched, protected GitHub environment.

## Obtain the three values

Open the Supabase dashboard for project `pagdtcttkviglyoeuagy`, then open Project Settings and the API/API Keys pages.

1. `SUPABASE_URL`: `https://pagdtcttkviglyoeuagy.supabase.co`
2. `SUPABASE_ANON_KEY`: the project's public anonymous key used by the frontend.
3. `SUPABASE_SERVICE_ROLE_KEY`: the server-only service-role key accepted by the Auth Admin API.

Do not use the database password, JWT signing secret, or a key from a staging project.

## Run locally from PowerShell

From the repository root:

```powershell
$env:SUPABASE_URL = 'https://pagdtcttkviglyoeuagy.supabase.co'
$env:SUPABASE_ANON_KEY = Read-Host 'Production Supabase anon key'
$serviceRole = Read-Host 'Production Supabase service-role key' -AsSecureString
$env:SUPABASE_SERVICE_ROLE_KEY = [Net.NetworkCredential]::new('', $serviceRole).Password

$required = 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'
$missing = $required | Where-Object {
    [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_))
}
if ($missing) {
    throw "Missing required process variables: $($missing -join ', ')"
}
if ($env:SUPABASE_URL -ne 'https://pagdtcttkviglyoeuagy.supabase.co') {
    throw 'SUPABASE_URL is not the expected production project. Stop and reconcile the credentials.'
}

Push-Location .\backend
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logPath = Join-Path $env:TEMP "rls-production-$stamp.log"
python -m pytest tests/integration/test_rls_isolation.py -v 2>&1 |
    Tee-Object -FilePath $logPath
$testExit = $LASTEXITCODE
Pop-Location

Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
Remove-Item Env:SUPABASE_ANON_KEY -ErrorAction SilentlyContinue
Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
$serviceRole = $null

if ($testExit -ne 0) {
    throw "Production RLS verification failed with exit code $testExit. Do not deploy or launch."
}
Write-Host "Evidence saved to $logPath"
```

Expected final summary:

```text
============================== 20 passed in ... ==============================
```

The duration is variable because all requests use the production Auth and REST APIs. The saved log is evidence; inspect it before sharing and then store it with the private release record, not in Git.

## Post-run cleanup check

In Supabase Dashboard → Authentication → Users, search for:

- `rls-test-a-`
- `rls-test-b-`
- `rls-cascade-`

Delete any leftover test user only after recording the failed test and its response. Deleting the Auth user should cascade its owned rows; if it does not, treat that as a deletion-compliance failure.

## Failure handling

| Symptom | Interpretation | Required response |
|---|---|---|
| User B receives User A's row | Cross-user read exposure | Critical: stop launch/deploys, preserve evidence, inspect the table's deployed RLS policies. |
| User B changes or deletes User A's row | Cross-user write/data-loss exposure | Critical: stop launch/deploys and disable the affected feature until the production policy is corrected and retested. |
| Impersonating insert returns success | Ownership policy missing or incorrect | Block launch; compare deployed policies with `supabase/migrations/`. |
| Cascade test leaves any row | Account deletion is incomplete | Block launch; inspect foreign keys and `delete_own_user()` before retrying. |
| Admin user creation returns 401/403 | Wrong/mismatched service-role key | Remove process variables, retrieve all three values from the same project, and retry once. |
| Relation/RPC returns 404 | Production migration drift | Stop; apply the reviewed migration through the normal migration procedure before retesting. |
| Tests are skipped | One or more variables were unavailable to pytest | No proof was produced. Fix variable scope and rerun. |

Never weaken an assertion to make production pass. Correct the deployed policy or migration, then rerun the unchanged suite.

## Protected GitHub Actions setup

The current CI workflow does not map production Supabase secrets into the RLS suite, so these tests skip. If production verification is added to Actions, create a `production-rls` GitHub Environment with a required reviewer and invoke it only with `workflow_dispatch`.

Repository → Settings → Environments → New environment → `production-rls`:

1. Add the launch owner as required reviewer.
2. Restrict deployment branches to `main`.
3. Add these environment secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

PowerShell with GitHub CLI prompts for each value without putting it on the command line:

```powershell
gh auth status
gh secret set --env production-rls SUPABASE_URL
gh secret set --env production-rls SUPABASE_ANON_KEY
gh secret set --env production-rls SUPABASE_SERVICE_ROLE_KEY
gh secret list --env production-rls
```

A future manual workflow job must declare `environment: production-rls`, map each secret into `env`, and run only:

```yaml
environment: production-rls
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with:
      python-version: "3.13"
  - run: python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
  - run: python -m pytest backend/tests/integration/test_rls_isolation.py -v
```

Do not add the service-role key to the ordinary PR test job. GitHub environment approval and a manual dispatch are part of the safety boundary.

## References

- Test implementation: `backend/tests/integration/test_rls_isolation.py`
- Deployed policy source: `supabase/migrations/`
- Environment matrix: `docs/ENV_VARS.md`
- GitHub Actions secrets: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
