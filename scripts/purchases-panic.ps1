# =============================================================================
# FILE: scripts/purchases-panic.ps1
# Default: restaura el SEGUNDO backup más reciente (evita restaurar el que acabas de crear)
# Params:
#   -UseLatest  -> restaura el más reciente
# =============================================================================
param(
  [switch]$UseLatest
)

$ErrorActionPreference = "Stop"

function Stamp { Get-Date -Format "yyyyMMdd-HHmmss" }

function Resolve-BackupPurchasesDir([string]$from) {
  if (Test-Path (Join-Path $from "page.tsx")) { return $from } # layout nuevo
  $legacy = Join-Path $from "purchases"
  if (Test-Path (Join-Path $legacy "page.tsx")) { return $legacy } # layout viejo

  $cand = Get-ChildItem $from -Recurse -Filter "page.tsx" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match "\\purchases\\page\.tsx$" } |
    Select-Object -First 1

  if ($cand) { return (Split-Path $cand.FullName -Parent) }
  throw "No encontre purchases/page.tsx dentro de: $from"
}

$root = (Resolve-Path ".").Path
Set-Location $root

$purchasesDir = Join-Path $root "src\app\purchases"
$backupRoot   = Join-Path $root "_local_backups\purchases"
$trashRoot    = Join-Path $root "_local_backups\purchases_trash"

if (-not (Test-Path (Join-Path $purchasesDir "page.tsx"))) {
  throw "No encontre $purchasesDir\page.tsx. Ejecuta esto desde C:\dev\compras-web."
}
if (-not (Test-Path $backupRoot)) {
  throw "No hay backups en $backupRoot. Crea uno primero: npm run purchases:backup"
}

$available = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending
if ($available.Count -eq 0) {
  throw "No hay carpetas dentro de $backupRoot. Crea uno primero: npm run purchases:backup"
}

# Default: 2do más reciente (index 1). Si solo hay 1 backup, usa ese.
$index = 0
if (-not $UseLatest) {
  $index = if ($available.Count -ge 2) { 1 } else { 0 }
}
$selectedBackupRoot = $available[$index].FullName
$fromPurchases = Resolve-BackupPurchasesDir $selectedBackupRoot

# 1) Guardar estado actual en trash
$trash = Join-Path $trashRoot (Stamp)
New-Item -ItemType Directory -Force $trash | Out-Null
Copy-Item $purchasesDir $trash -Recurse -Force

# 2) Restaurar backup seleccionado
Remove-Item $purchasesDir -Recurse -Force
New-Item -ItemType Directory -Force $purchasesDir | Out-Null
Copy-Item (Join-Path $fromPurchases "*") $purchasesDir -Recurse -Force

# 3) Limpiar .next
$nextDir = Join-Path $root ".next"
if (Test-Path $nextDir) { Remove-Item $nextDir -Recurse -Force }

Write-Host "PANIC OK"
Write-Host "  Restored from: $selectedBackupRoot"
Write-Host "  Saved current to: $trash"
Write-Host "  .next cleaned"
Write-Host ""
Write-Host "Starting dev server..."

npm run dev