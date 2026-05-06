# ============================================================
# Bordik Med - Graphify one-click installer for Windows.
# ASCII-only (Windows PowerShell 5.1 reads .ps1 as ANSI by default,
# Unicode chars in source crash the parser silently and the window
# closes instantly. Keep this file ASCII-pure.)
# ============================================================

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot

# Force UTF-8 output so non-ASCII characters from external commands
# (winget, pip, graphify) display correctly in the console.
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function Pause-And-Exit($code) {
    Write-Host ""
    Write-Host "Press Enter to close..." -ForegroundColor DarkGray
    [void](Read-Host)
    exit $code
}

try {
    Write-Host ""
    Write-Host "=== Bordik Med - Graphify setup ===" -ForegroundColor Cyan
    Write-Host ""

    # --- Step 1: Python ---
    Write-Host "[1/4] Checking Python..." -ForegroundColor Yellow
    $pythonInstalled = $false
    $pyVersion = $null
    try {
        $pyVersion = & python --version 2>&1
        if ($LASTEXITCODE -eq 0) { $pythonInstalled = $true }
    } catch {}

    if (-not $pythonInstalled) {
        Write-Host "      Python not found. Installing via winget..." -ForegroundColor Yellow
        try {
            & winget install -e --id Python.Python.3.13 --accept-source-agreements --accept-package-agreements
            if ($LASTEXITCODE -ne 0) { throw "winget exit code $LASTEXITCODE" }
        } catch {
            Write-Host ""
            Write-Host "[ERROR] winget failed to install Python." -ForegroundColor Red
            Write-Host "Install manually: https://www.python.org/downloads/" -ForegroundColor Red
            Pause-And-Exit 1
        }
        Write-Host ""
        Write-Host "Python installed. IMPORTANT: close this window," -ForegroundColor Yellow
        Write-Host "open PowerShell again, and re-run setup-graphify.cmd." -ForegroundColor Yellow
        Write-Host "PATH only refreshes in new shell sessions." -ForegroundColor Yellow
        Pause-And-Exit 0
    } else {
        Write-Host "      Found: $pyVersion" -ForegroundColor Green
    }

    # --- Step 2: pip install graphifyy ---
    Write-Host ""
    Write-Host "[2/4] Installing graphifyy via pip..." -ForegroundColor Yellow
    & python -m pip install --upgrade pip --quiet
    if ($LASTEXITCODE -ne 0) { throw "pip upgrade failed (exit $LASTEXITCODE)" }
    & python -m pip install graphifyy
    if ($LASTEXITCODE -ne 0) { throw "pip install graphifyy failed (exit $LASTEXITCODE)" }
    Write-Host "      Graphify installed." -ForegroundColor Green

    # --- Check graphify in PATH ---
    $graphifyCmd = Get-Command graphify -ErrorAction SilentlyContinue
    if (-not $graphifyCmd) {
        Write-Host ""
        Write-Host "[WARN] graphify not on PATH. Adding Python\Scripts..." -ForegroundColor Yellow
        $pyScripts = & python -c "import sysconfig; print(sysconfig.get_path('scripts'))"
        if ($pyScripts -and (Test-Path $pyScripts)) {
            $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
            if ($userPath -notlike "*$pyScripts*") {
                [Environment]::SetEnvironmentVariable('Path', "$userPath;$pyScripts", 'User')
                Write-Host "      Added to User PATH: $pyScripts" -ForegroundColor Green
            }
            $env:Path += ";$pyScripts"
        }
        $graphifyCmd = Get-Command graphify -ErrorAction SilentlyContinue
        if (-not $graphifyCmd) {
            Write-Host "[ERROR] graphify still not visible. Close PowerShell, reopen, retry." -ForegroundColor Red
            Pause-And-Exit 1
        }
    }

    # --- Step 3: git-hook ---
    Set-Location $RepoRoot
    Write-Host ""
    Write-Host "[3/4] Installing git-hook (auto-rebuild on commit)..." -ForegroundColor Yellow
    try {
        & graphify install
        Write-Host "      Done." -ForegroundColor Green
    } catch {
        Write-Host "[WARN] graphify install returned an error, continuing without hook." -ForegroundColor Yellow
    }

    # --- Step 4: first index ---
    Write-Host ""
    Write-Host "[4/4] Indexing repository..." -ForegroundColor Yellow
    $obsidianDir = Join-Path $env:USERPROFILE 'vault\bordik-med\graphify'
    if (-not (Test-Path $obsidianDir)) {
        New-Item -ItemType Directory -Path $obsidianDir -Force | Out-Null
    }
    & graphify . --obsidian --obsidian-dir $obsidianDir
    if ($LASTEXITCODE -ne 0) { throw "graphify index failed (exit $LASTEXITCODE)" }

    Write-Host ""
    Write-Host "=== Done! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created:" -ForegroundColor White
    Write-Host "  - graphify-out/graph.json              (code structure for Claude)"
    Write-Host "  - $obsidianDir   (for Obsidian)"
    Write-Host ""
    Write-Host "Next: open Obsidian -> Open folder as vault -> select" -ForegroundColor White
    Write-Host "  $env:USERPROFILE\vault\bordik-med"
    Write-Host "Press Ctrl+G in Obsidian to view the graph."
    Write-Host ""
    Write-Host "On every git commit, graph.json rebuilds automatically." -ForegroundColor White
    Pause-And-Exit 0
}
catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ScriptStackTrace) {
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    }
    Pause-And-Exit 1
}
