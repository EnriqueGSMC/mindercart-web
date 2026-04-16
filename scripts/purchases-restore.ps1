# =============================================================================
# FILE: scripts/purchases-restore.ps1
# =============================================================================
param(
  [string]$Tag = "",
  [switch]$List
)

$ErrorActionPreference = "Stop"

function Stamp { Get-Date -Format "yyyyMMdd-HHmmss" }

$root = (Resolve-Path ".").Path
$purchasesDir = Join-Path $root "src\app\purchases"
$backupRoot = Join-Path $root "_local_backups\purchases"

if (-not (Test-Path $backupRoot)) {
  throw "No hay backups en $backupRoot. Primero corre: scripts\purchases-backup.ps1"
}

$available = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending

if ($List) {
  $available | Select-Object -First 50 Name, FullName, LastWriteTime | Format-Table -AutoSize
  exit 0
}

function Resolve-BackupPurchasesDir([string]$from) {
  # Layout nuevo (correcto): from\page.tsx
  if (Test-Path (Join-Path $from "page.tsx")) { return $from }

  # Layout viejo (tu caso): from\purchases\page.tsx
  $legacy = Join-Path $from "purchases"
  if (Test-Path (Join-Path $legacy "page.tsx")) { return $legacy }

  # Fallback: buscar cualquier purchases\page.tsx dentro
  $cand = Get-ChildItem $from -Recurse -Filter "page.tsx" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match "\\purchases\\page\.tsx$" } |
    Select-Object -First 1

  if ($cand) { return (Split-Path $cand.FullName -Parent) }

  throw "No encontré purchases/page.tsx dentro de: $from"
}

function PickBackupPath([string]$tag) {
  if ($tag) {
    $p = Join-Path $backupRoot $tag
    if (-not (Test-Path $p)) { throw "No existe backup con Tag=$tag en $backupRoot" }
    return $p
  }
  if ($available.Count -eq 0) { throw "No hay carpetas de backup dentro de $backupRoot" }
  return $available[0].FullName
}

$from = PickBackupPath $Tag
$fromPurchases = Resolve-BackupPurchasesDir $from

# Guardar estado actual en trash por si acaso
$trashRoot = Join-Path $root "_local_backups\purchases_trash"
$trash = Join-Path $trashRoot (Stamp)
New-Item -ItemType Directory -Force $trash | Out-Null

if (Test-Path $purchasesDir) {
  Copy-Item $purchasesDir $trash -Recurse -Force
}

# Restaurar
if (Test-Path $purchasesDir) {
  Remove-Item $purchasesDir -Recurse -Force
}

New-Item -ItemType Directory -Force $purchasesDir | Out-Null
Copy-Item (Join-Path $fromPurchases "*") $purchasesDir -Recurse -Force

# Limpiar .next
$nextDir = Join-Path $root ".next"
if (Test-Path $nextDir) { Remove-Item $nextDir -Recurse -Force }

Write-Host "RESTORE OK"
Write-Host "  Backup root:     $from"
Write-Host "  Restored folder: $fromPurchases"
Write-Host "  Saved old state: $trash"
Write-Host "  .next cleaned. Restart: npm run dev"