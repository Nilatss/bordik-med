# ============================================================
# Bordik Med — Graphify one-click installer for Windows.
#
# Запуск: правой кнопкой по файлу → "Run with PowerShell".
# Или дабл-клик на setup-graphify.cmd (он вызовет этот .ps1).
#
# Что делает:
#   1. Проверяет Python (ставит через winget если нет).
#   2. Ставит graphifyy через pip.
#   3. Устанавливает git-hook (auto-rebuild при коммите).
#   4. Делает первый индекс репо → graphify-out/graph.json.
# ============================================================

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "=== Bordik Med · Graphify setup ===" -ForegroundColor Cyan
Write-Host ""

# --- Шаг 1: Python ---
Write-Host "[1/4] Проверяю Python..." -ForegroundColor Yellow
$pythonInstalled = $false
try {
    $pyVersion = & python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      Найден: $pyVersion" -ForegroundColor Green
        $pythonInstalled = $true
    }
} catch {}

if (-not $pythonInstalled) {
    Write-Host "      Python не найден. Ставлю через winget..." -ForegroundColor Yellow
    try {
        & winget install -e --id Python.Python.3.13 --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -ne 0) { throw "winget install вернул код $LASTEXITCODE" }
    } catch {
        Write-Host ""
        Write-Host "[ОШИБКА] winget не смог установить Python." -ForegroundColor Red
        Write-Host "Поставь вручную: https://www.python.org/downloads/" -ForegroundColor Red
        Read-Host "Нажми Enter для выхода"
        exit 1
    }
    Write-Host ""
    Write-Host "Python установлен. ВАЖНО: закрой это окно, открой PowerShell заново" -ForegroundColor Yellow
    Write-Host "и запусти setup-graphify.ps1 ещё раз — нужно чтобы PATH обновился." -ForegroundColor Yellow
    Read-Host "Нажми Enter для выхода"
    exit 0
}

# --- Шаг 2: pip install graphifyy ---
Write-Host ""
Write-Host "[2/4] Ставлю graphifyy через pip..." -ForegroundColor Yellow
try {
    & python -m pip install --upgrade pip
    if ($LASTEXITCODE -ne 0) { throw "pip upgrade вернул $LASTEXITCODE" }
    & python -m pip install graphifyy
    if ($LASTEXITCODE -ne 0) { throw "pip install graphifyy вернул $LASTEXITCODE" }
} catch {
    Write-Host "[ОШИБКА] pip install не сработал: $_" -ForegroundColor Red
    Read-Host "Нажми Enter для выхода"
    exit 1
}
Write-Host "      Graphify установлен." -ForegroundColor Green

# --- Проверка graphify в PATH ---
$graphifyCmd = Get-Command graphify -ErrorAction SilentlyContinue
if (-not $graphifyCmd) {
    Write-Host ""
    Write-Host "[ВНИМАНИЕ] graphify не в PATH. Добавляю Python\Scripts..." -ForegroundColor Yellow
    $pyScripts = & python -c "import sysconfig; print(sysconfig.get_path('scripts'))"
    if ($pyScripts -and (Test-Path $pyScripts)) {
        $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        if ($userPath -notlike "*$pyScripts*") {
            [Environment]::SetEnvironmentVariable('Path', "$userPath;$pyScripts", 'User')
            Write-Host "      Добавлено в User PATH: $pyScripts" -ForegroundColor Green
        }
        # Обновим PATH в текущей сессии чтобы не закрывать окно
        $env:Path += ";$pyScripts"
    }
    $graphifyCmd = Get-Command graphify -ErrorAction SilentlyContinue
    if (-not $graphifyCmd) {
        Write-Host "[ОШИБКА] graphify всё ещё не виден. Закрой PowerShell, открой заново и запусти .ps1 повторно." -ForegroundColor Red
        Read-Host "Нажми Enter для выхода"
        exit 1
    }
}

# --- Шаг 3: git-hook ---
Set-Location $RepoRoot
Write-Host ""
Write-Host "[3/4] Ставлю git-hook (auto-rebuild при коммите)..." -ForegroundColor Yellow
try {
    & graphify install
    Write-Host "      Готово." -ForegroundColor Green
} catch {
    Write-Host "[ВНИМАНИЕ] graphify install вернул ошибку, продолжаю без хука." -ForegroundColor Yellow
}

# --- Шаг 4: первая индексация ---
Write-Host ""
Write-Host "[4/4] Индексирую репозиторий..." -ForegroundColor Yellow
$obsidianDir = Join-Path $env:USERPROFILE 'vault\bordik-med\graphify'
if (-not (Test-Path $obsidianDir)) {
    New-Item -ItemType Directory -Path $obsidianDir -Force | Out-Null
}
try {
    & graphify . --obsidian --obsidian-dir $obsidianDir
    if ($LASTEXITCODE -ne 0) { throw "graphify вернул $LASTEXITCODE" }
} catch {
    Write-Host "[ОШИБКА] Индексация не удалась: $_" -ForegroundColor Red
    Read-Host "Нажми Enter для выхода"
    exit 1
}

Write-Host ""
Write-Host "=== Готово! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Создано:" -ForegroundColor White
Write-Host "  - graphify-out/graph.json              (структура кода для Claude)"
Write-Host "  - $obsidianDir   (для Obsidian)"
Write-Host ""
Write-Host "Дальше: открой Obsidian → Open folder as vault → выбери" -ForegroundColor White
Write-Host "  $env:USERPROFILE\vault\bordik-med"
Write-Host "Ctrl+G → graph view покажет связи между файлами проекта."
Write-Host ""
Write-Host "При git commit graph.json пересобирается автоматически." -ForegroundColor White
Write-Host ""
Read-Host "Нажми Enter для выхода"
