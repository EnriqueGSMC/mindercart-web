# =============================================================================
# FILE: scripts/purchases-backup.ps1
# =============================================================================
$ErrorActionPreference = "Stop"

function Stamp { Get-Date -Format "yyyyMMdd-HHmmss" }

$root = (Resolve-Path ".").Path
$purchasesDir = Join-Path $root "src\app\purchases"

if (-not (Test-Path (Join-Path $purchasesDir "page.tsx"))) {
  throw "No encontré $purchasesDir\page.tsx. Ejecuta esto desde C:\dev\compras-web."
}

$backupRoot = Join-Path $root "_local_backups\purchases"
$tag = Stamp
$dest = Join-Path $backupRoot $tag

New-Item -ItemType Directory -Force $dest | Out-Null

# OJO: copiamos CONTENIDO, no la carpeta "purchases" completa
Copy-Item (Join-Path $purchasesDir "*") $dest -Recurse -Force

Write-Host "BACKUP OK"
Write-Host "  Source: $purchasesDir"
Write-Host "  Dest:   $dest"