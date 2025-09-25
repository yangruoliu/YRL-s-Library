@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM Change to script directory (repo root)
cd /d %~dp0

REM Prefer pwsh if available, else fallback to Windows PowerShell
where pwsh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync.ps1" %*
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync.ps1" %*
)
set code=%ERRORLEVEL%

if %code% NEQ 0 (
  echo Sync failed with exit code %code%.
  exit /b %code%
)

echo Sync finished successfully.
exit /b 0
