# codex-mode.ps1 — Launch Codex with a clear working mode
# Usage:
#   .\.ai-sync\codex-mode.ps1
#   .\.ai-sync\codex-mode.ps1 -Mode auto
#   .\.ai-sync\codex-mode.ps1 -Mode plan
#   .\.ai-sync\codex-mode.ps1 -Mode edit
#   .\.ai-sync\codex-mode.ps1 -Mode normal
#   .\.ai-sync\codex-mode.ps1 -Mode unattended

[CmdletBinding()]
param(
    [ValidateSet("auto", "plan", "edit", "normal", "unattended")]
    [string]$Mode,

    [switch]$DryRun,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$CodexArguments
)

$ErrorActionPreference = "Stop"

$modes = [ordered]@{
    "1" = @{
        Name = "auto"
        Label = "Auto (recommended)"
        Description = "Edit and run commands in the workspace; ask before network or outside access."
        Arguments = @("--sandbox", "workspace-write", "--ask-for-approval", "on-request")
    }
    "2" = @{
        Name = "plan"
        Label = "Plan"
        Description = "Start read-only, then use /plan or Shift+Tab for native Plan mode."
        Arguments = @("--sandbox", "read-only", "--ask-for-approval", "on-request")
    }
    "3" = @{
        Name = "edit"
        Label = "Edit with command approval"
        Description = "Allow workspace edits; ask before commands Codex does not consider trusted."
        Arguments = @("--sandbox", "workspace-write", "--ask-for-approval", "untrusted")
    }
    "4" = @{
        Name = "normal"
        Label = "Normal / read-only"
        Description = "Chat and inspect safely; ask before edits, commands, or network access."
        Arguments = @("--sandbox", "read-only", "--ask-for-approval", "on-request")
    }
    "5" = @{
        Name = "unattended"
        Label = "Unattended workspace"
        Description = "Edit, run commands, and use network in the sandbox without approval prompts."
        Arguments = @(
            "--sandbox", "workspace-write",
            "--ask-for-approval", "never",
            "--config", "sandbox_workspace_write.network_access=true"
        )
    }
}

if (-not $Mode) {
    Write-Host ""
    Write-Host "Choose a Codex mode" -ForegroundColor Cyan
    Write-Host ""

    foreach ($entry in $modes.GetEnumerator()) {
        $recommended = if ($entry.Key -eq "1") { " *" } else { "" }
        Write-Host "  $($entry.Key). $($entry.Value.Label)$recommended" -ForegroundColor White
        Write-Host "     $($entry.Value.Description)" -ForegroundColor DarkGray
    }

    Write-Host ""
    $selection = Read-Host "Mode [1]"
    if ([string]::IsNullOrWhiteSpace($selection)) {
        $selection = "1"
    }

    if (-not $modes.Contains($selection)) {
        throw "Unknown selection '$selection'. Choose 1 through 5."
    }

    $selectedMode = $modes[$selection]
} else {
    $selectedMode = $modes.Values | Where-Object { $_.Name -eq $Mode } | Select-Object -First 1
}

$launchArguments = @($selectedMode.Arguments)
if ($CodexArguments) {
    $launchArguments += $CodexArguments
}

Write-Host ""
Write-Host "Mode: $($selectedMode.Label)" -ForegroundColor Cyan
Write-Host $selectedMode.Description -ForegroundColor DarkGray

if ($selectedMode.Name -eq "plan") {
    Write-Host "After Codex opens, enter /plan or press Shift+Tab." -ForegroundColor Yellow
}

if ($selectedMode.Name -eq "unattended") {
    Write-Host "Blocked operations will fail instead of asking for permission." -ForegroundColor Yellow
}

$displayArguments = $launchArguments | ForEach-Object {
    if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
}
Write-Host ("codex " + ($displayArguments -join " ")) -ForegroundColor DarkGray
Write-Host ""

if ($DryRun) {
    return
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    & codex @launchArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Codex exited with code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
