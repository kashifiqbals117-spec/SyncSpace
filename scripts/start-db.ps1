# scripts/start-db.ps1
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$pgData = Join-Path $PSScriptRoot "..\postgres_data"

if (-not (Test-Path (Join-Path $pgBin "postgres.exe"))) {
    Write-Error "PostgreSQL 18 is not installed at $pgBin"
    exit 1
}

if (-not (Test-Path $pgData)) {
    Write-Host "Initializing PostgreSQL cluster at $pgData..."
    & (Join-Path $pgBin "initdb.exe") -D $pgData -U postgres -A trust --locale=C
    Add-Content -Path (Join-Path $pgData "postgresql.conf") -Value "`nport = 5433`nlisten_addresses = '127.0.0.1'`n"
}

Write-Host "Starting PostgreSQL cluster on port 5433..."
& (Join-Path $pgBin "pg_ctl.exe") -D $pgData -l (Join-Path $pgData "server.log") start
Write-Host "PostgreSQL cluster started successfully."
