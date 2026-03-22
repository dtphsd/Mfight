@echo off
set SCRIPT_DIR=%~dp0

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-online-pvp-quicktunnel.ps1" %*
if errorlevel 1 (
  echo.
  echo Online PvP quick tunnel launcher failed.
  pause
  exit /b 1
)
