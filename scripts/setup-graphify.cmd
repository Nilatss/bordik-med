@echo off
REM Launcher for setup-graphify.ps1.
REM PAUSE at end ensures the window stays open even if PowerShell crashes.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-graphify.ps1"
set EXITCODE=%ERRORLEVEL%

if %EXITCODE% neq 0 (
  echo.
  echo PowerShell exited with code %EXITCODE%.
  echo If the window closed instantly, the .ps1 may have a parse error.
  echo Try: right-click setup-graphify.ps1 ^> Run with PowerShell
  echo.
)

pause
