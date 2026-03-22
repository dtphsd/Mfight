@echo off
set SCRIPT_DIR=%~dp0

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%stop-online-pvp-quicktunnel.ps1" %*
if errorlevel 1 (
  echo.
  echo Online PvP quick tunnel stop failed.
  pause
  exit /b 1
)
