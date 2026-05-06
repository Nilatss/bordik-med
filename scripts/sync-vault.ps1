# ============================================================
# Bordik Med - Sync project docs to Obsidian vault.
#
# Copies session logs, audit reports, planning docs, and the
# graphify GRAPH_REPORT into ~/vault/bordik-med/ so everything
# is browsable as one connected vault in Obsidian.
#
# Triggered by:
#   - Manual: scripts\sync-vault.cmd  (double-click)
#   - Git post-commit hook (extends graphify hook)
#   - Task Scheduler (every 15 min for incremental changes)
#
# Idempotent: only copies files that changed (mtime-aware).
# ASCII-only to avoid PowerShell 5.1 ANSI parsing issues.
# ============================================================

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VaultRoot = Join-Path $env:USERPROFILE 'vault\bordik-med'

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not (Test-Path $VaultRoot)) {
    Write-Host "[sync-vault] Vault not found: $VaultRoot" -ForegroundColor Yellow
    Write-Host "[sync-vault] Run scripts\setup-graphify.cmd first." -ForegroundColor Yellow
    exit 1
}

$copied = 0
$skipped = 0

function Sync-File {
    param([string]$src, [string]$dst)
    if (-not (Test-Path $src)) { return }
    $dstDir = Split-Path -Parent $dst
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
    if (Test-Path $dst) {
        $srcMtime = (Get-Item $src).LastWriteTime
        $dstMtime = (Get-Item $dst).LastWriteTime
        if ($dstMtime -ge $srcMtime) {
            $script:skipped++
            return
        }
    }
    Copy-Item -Path $src -Destination $dst -Force
    $script:copied++
}

function Sync-Folder {
    param([string]$srcDir, [string]$dstDir, [string]$pattern = '*')
    if (-not (Test-Path $srcDir)) { return }
    Get-ChildItem -Path $srcDir -Filter $pattern -File | ForEach-Object {
        Sync-File -src $_.FullName -dst (Join-Path $dstDir $_.Name)
    }
}

# 1. Session logs (from docs/sessions/)
Sync-Folder -srcDir (Join-Path $RepoRoot 'docs\sessions') `
            -dstDir (Join-Path $VaultRoot 'sessions') `
            -pattern '*.md'

# 2. Audit reports (from root + docs/)
Sync-File -src (Join-Path $RepoRoot 'AUDIT_REPORT_2026-05-06.md') `
          -dst (Join-Path $VaultRoot 'audit\AUDIT_REPORT_2026-05-06.md')
Get-ChildItem -Path (Join-Path $RepoRoot 'docs') -Filter 'AUDIT_*.md' -File -ErrorAction SilentlyContinue | ForEach-Object {
    Sync-File -src $_.FullName -dst (Join-Path $VaultRoot "audit\$($_.Name)")
}

# 3. Planning docs (roadmap, backlog, tasks snapshot, content roadmap)
$planningFiles = @(
    'docs\BACKLOG.md',
    'docs\CONTENT_ROADMAP.md',
    'docs\PERF_DIAGNOSTIC.md',
    'docs\STRESS_TEST_TODO.md',
    'docs\TODO_PASS_2.md'
)
foreach ($f in $planningFiles) {
    $src = Join-Path $RepoRoot $f
    if (Test-Path $src) {
        $name = Split-Path -Leaf $f
        Sync-File -src $src -dst (Join-Path $VaultRoot "planning\$name")
    }
}
Get-ChildItem -Path (Join-Path $RepoRoot 'docs') -Filter 'TASKS_SNAPSHOT_*.md' -File -ErrorAction SilentlyContinue | ForEach-Object {
    Sync-File -src $_.FullName -dst (Join-Path $VaultRoot "planning\$($_.Name)")
}

# 4. Specs
Sync-Folder -srcDir (Join-Path $RepoRoot 'docs\specs') `
            -dstDir (Join-Path $VaultRoot 'specs') `
            -pattern '*.md'

# 5. UI guidelines + design docs
$designFiles = @('docs\UI_GUIDELINES.md', 'docs\UI_KIT.md', 'docs\BACKEND.md', 'docs\SECURITY_SETUP.md', 'docs\RUNNER_TEMPLATE.md')
foreach ($f in $designFiles) {
    $src = Join-Path $RepoRoot $f
    if (Test-Path $src) {
        $name = Split-Path -Leaf $f
        Sync-File -src $src -dst (Join-Path $VaultRoot "design\$name")
    }
}

# 6. Root-level meta
Sync-File -src (Join-Path $RepoRoot 'CLAUDE.md') `
          -dst (Join-Path $VaultRoot 'CLAUDE.md')
Sync-File -src (Join-Path $RepoRoot 'README.md') `
          -dst (Join-Path $VaultRoot 'README.md')

# 7. Graphify report
Sync-File -src (Join-Path $RepoRoot 'graphify-out\GRAPH_REPORT.md') `
          -dst (Join-Path $VaultRoot 'GRAPH_REPORT.md')

Write-Host "[sync-vault] $copied file(s) updated, $skipped unchanged" -ForegroundColor Green
