# handoff.ps1 — Quick handoff between Claude Code and GitHub Copilot
# Usage:
#   .\.ai-sync\handoff.ps1 -To claude
#   .\.ai-sync\handoff.ps1 -To claude -SwitchAccount
#   .\.ai-sync\handoff.ps1 -To copilot

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("claude", "copilot")]
    [string]$To,

    [switch]$SwitchAccount
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

if ($SwitchAccount -and $To -ne "claude") {
    throw "-SwitchAccount can only be used with -To claude."
}

$others = @{
    "claude"  = "Copilot"
    "copilot" = "Claude Code"
}

$colors = @{
    "claude"  = "Cyan"
    "copilot" = "Magenta"
}

$agentName = switch ($To) {
    "claude"  { "CLAUDE CODE" }
    "copilot" { "GITHUB COPILOT" }
}

Write-Host ""
Write-Host "=== HANDOFF TO $agentName ===" -ForegroundColor $colors[$To]
Write-Host ""

if ($SwitchAccount) {
    Write-Host "Step 1 — Switch Claude account:" -ForegroundColor Yellow
    Write-Host "  claude logout" -ForegroundColor White
    Write-Host "  claude login" -ForegroundColor White
    Write-Host "  claude status   (verify the active account)" -ForegroundColor White
    Write-Host ""
    Write-Host "Step 2 — Paste this pickup prompt:" -ForegroundColor Yellow
} else {
    Write-Host "Paste this into your $agentName terminal:" -ForegroundColor Yellow
}

Write-Host ""
Write-Host @"
Read .ai-sync/WORKLOG.md and .ai-sync/DECISIONS.md, then run ``git log --oneline -15`` and ``git diff --stat``. Understand what $($others[$To]) did recently. Then continue working on the current task listed in WORKLOG.md. Update WORKLOG.md when you're done.
"@ -ForegroundColor White
Write-Host ""
Write-Host "--- Handoff initiated at $timestamp ---" -ForegroundColor DarkGray
Write-Host ""
