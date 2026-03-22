$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$promptPath = Join-Path $root "project-analysis-prompt.md"

if (-not (Test-Path $promptPath)) {
  Write-Host "Prompt file not found: $promptPath" -ForegroundColor Red
  exit 1
}

$prompt = Get-Content -Path $promptPath -Raw -Encoding UTF8

try {
  Set-Clipboard -Value $prompt
  $clipboardStatus = "Prompt copied to clipboard."
} catch {
  $clipboardStatus = "Clipboard copy skipped."
}

Write-Host ""
Write-Host "=== Запустить аналитику ! ===" -ForegroundColor Cyan
Write-Host $clipboardStatus -ForegroundColor DarkGray
Write-Host "Prompt source: $promptPath" -ForegroundColor DarkGray
Write-Host ""
Write-Output $prompt
Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
