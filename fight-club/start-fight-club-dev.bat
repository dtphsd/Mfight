@echo off
set SCRIPT_DIR=%~dp0
set DEV_URL=http://127.0.0.1:5173/

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-fight-club-dev.ps1" %*
if errorlevel 1 (
  echo.
  echo Fight Club dev server failed to start.
  pause
  exit /b 1
)

start "" "%DEV_URL%"
