@echo off
REM Manual launcher for sync-vault.ps1 (double-click to run).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-vault.ps1"
if %ERRORLEVEL% neq 0 (
  echo.
  echo Sync failed with code %ERRORLEVEL%.
  pause
)
