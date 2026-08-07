<#
.SYNOPSIS
    Manual backup of Supabase Postgres database.
    Supabase Free tier has no automatic backups — run this before deployments.

.DESCRIPTION
    Exports the public schema to a timestamped SQL file in ./backups/.
    Requires pg_dump (ships with PostgreSQL or can be installed standalone).

.PARAMETER ConnectionString
    Supabase direct connection string. Find it in:
    Supabase Dashboard → Settings → Database → Connection string → URI

.EXAMPLE
    .\scripts\backup-supabase.ps1 -ConnectionString "postgresql://postgres.xxx:password@host:5432/postgres"
#>
param(
    [Parameter(Mandatory)]
    [string]$ConnectionString
)

$ErrorActionPreference = "Stop"

$backupDir = Join-Path $PSScriptRoot ".." "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$outFile = Join-Path $backupDir "supabase_backup_$timestamp.sql"

Write-Host "Backing up Supabase to $outFile ..."

pg_dump $ConnectionString `
    --schema=public `
    --no-owner `
    --no-privileges `
    --format=plain `
    --file="$outFile"

if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed with exit code $LASTEXITCODE"
    exit 1
}

$size = (Get-Item $outFile).Length
Write-Host "Backup complete: $outFile ($([math]::Round($size / 1024, 1)) KB)"
