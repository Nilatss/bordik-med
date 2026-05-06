@echo off
REM ============================================================
REM Bordik Med — Graphify one-click installer for Windows.
REM
REM Что делает:
REM   1. Проверяет Python — если нет, ставит через winget.
REM   2. Ставит graphifyy через pip.
REM   3. Устанавливает git-hook (auto-rebuild при коммите).
REM   4. Делает первый индекс репо → graphify-out/graph.json.
REM
REM Запуск: двойной клик OR правая кнопка → "Run as administrator"
REM (admin нужен только если Python не стоит — winget потребует).
REM ============================================================

setlocal enabledelayedexpansion
echo.
echo === Bordik Med · Graphify setup ===
echo.

REM --- Шаг 1: проверка Python ---
where python >nul 2>&1
if errorlevel 1 (
    echo [1/4] Python не найден. Ставлю через winget...
    winget install -e --id Python.Python.3.13 --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo.
        echo [ОШИБКА] winget не смог установить Python.
        echo Поставь вручную: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    echo.
    echo Python установлен. Закрой это окно, открой заново и запусти .bat ещё раз.
    echo (нужно чтобы PATH обновился)
    pause
    exit /b 0
) else (
    for /f "tokens=*" %%v in ('python --version') do echo [1/4] Python найден: %%v
)

REM --- Шаг 2: pip install graphifyy ---
echo.
echo [2/4] Ставлю graphifyy через pip...
python -m pip install --upgrade pip
python -m pip install graphifyy
if errorlevel 1 (
    echo [ОШИБКА] pip install не сработал. См. вывод выше.
    pause
    exit /b 1
)
echo Graphify установлен.

REM --- Шаг 3: проверка graphify в PATH ---
where graphify >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ВНИМАНИЕ] graphify не в PATH. Добавляю Python\Scripts в User PATH...
    for /f "tokens=*" %%p in ('python -c "import sysconfig; print(sysconfig.get_path('scripts'))"') do (
        setx PATH "%%PATH%%;%%p" >nul
        echo Добавлено: %%p
    )
    echo Закрой это окно и запусти .bat ещё раз — PATH обновится.
    pause
    exit /b 0
)

REM --- Шаг 4: установить git-hook + проиндексировать ---
cd /d "%~dp0\.."
echo.
echo [3/4] Ставлю git-hook (auto-rebuild при коммите)...
graphify install
if errorlevel 1 (
    echo [ВНИМАНИЕ] graphify install вернул ошибку. Продолжаю.
)

echo.
echo [4/4] Индексирую репозиторий...
graphify . --obsidian --obsidian-dir "%USERPROFILE%\vault\bordik-med\graphify"
if errorlevel 1 (
    echo [ОШИБКА] Индексация не удалась. Проверь что ты в корне репо.
    pause
    exit /b 1
)

echo.
echo === Готово! ===
echo.
echo Создано:
echo   - graphify-out/graph.json              (структура кода для Claude)
echo   - %%USERPROFILE%%\vault\bordik-med\graphify\  (для Obsidian)
echo.
echo Дальше: открой Obsidian → Open folder as vault → выбери папку
echo выше. Ctrl+G → graph view покажет связи.
echo.
echo При git commit graph.json пересобирается автоматически.
echo.
pause
