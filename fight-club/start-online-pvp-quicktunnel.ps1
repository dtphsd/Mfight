[CmdletBinding()]
param(
  [string]$BindHost = "127.0.0.1",
  [int]$BackendPort = 3001,
  [int]$FrontendPort = 5174,
  [int]$StartupTimeoutSeconds = 40,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeLogsRoot = Join-Path $appRoot "runtime-logs"
$npmCommand = Join-Path ${env:ProgramFiles} "nodejs\npm.cmd"
$powerShellExe = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"
$runStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$backendOutLog = Join-Path $runtimeLogsRoot "online-duel-server.$runStamp.out.log"
$backendErrLog = Join-Path $runtimeLogsRoot "online-duel-server.$runStamp.err.log"
$frontendOutLog = Join-Path $runtimeLogsRoot "fight-club-dev.$runStamp.out.log"
$frontendErrLog = Join-Path $runtimeLogsRoot "fight-club-dev.$runStamp.err.log"
$frontendTunnelOutLog = Join-Path $runtimeLogsRoot "online-duel-frontend-tunnel.$runStamp.out.log"
$frontendTunnelErrLog = Join-Path $runtimeLogsRoot "online-duel-frontend-tunnel.$runStamp.err.log"
$backendTunnelOutLog = Join-Path $runtimeLogsRoot "online-duel-backend-tunnel.$runStamp.out.log"
$backendTunnelErrLog = Join-Path $runtimeLogsRoot "online-duel-backend-tunnel.$runStamp.err.log"
$summaryPath = Join-Path $runtimeLogsRoot "online-duel-quicktunnel-summary.txt"
$runtimeManifestPath = Join-Path $appRoot "public\online-duel-runtime.json"

if (-not (Test-Path (Split-Path -Parent $runtimeManifestPath))) {
  New-Item -ItemType Directory -Path (Split-Path -Parent $runtimeManifestPath) | Out-Null
}

if (-not (Test-Path $runtimeLogsRoot)) {
  New-Item -ItemType Directory -Path $runtimeLogsRoot | Out-Null
}

if (-not (Test-Path $npmCommand)) {
  throw "npm.cmd not found at $npmCommand"
}

function Get-CloudflaredCommand {
  $command = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $fallbacks = @(
    (Join-Path ${env:ProgramFiles} "Cloudflare\Cloudflared\cloudflared.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Cloudflare\Cloudflared\cloudflared.exe")
  ) | Where-Object { $_ }

  foreach ($fallback in $fallbacks) {
    if (Test-Path $fallback) {
      return $fallback
    }
  }

  throw "cloudflared.exe not found. Install Cloudflare Tunnel first."
}

function Get-ListeningProcessId {
  param([int]$TargetPort)

  $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if ($null -eq $connection) {
    return $null
  }

  return $connection.OwningProcess
}

function Stop-ProcessOnPort {
  param([int]$TargetPort)

  $processId = Get-ListeningProcessId -TargetPort $TargetPort
  if ($null -eq $processId) {
    return
  }

  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($null -eq $process) {
    return
  }

  Write-Host "Stopping process on port $TargetPort (PID $processId)..." -ForegroundColor Yellow
  Stop-Process -Id $processId -Force

  $deadline = (Get-Date).AddSeconds(8)
  do {
    Start-Sleep -Milliseconds 250
  } while ((Get-ListeningProcessId -TargetPort $TargetPort) -and (Get-Date) -lt $deadline)

  if (Get-ListeningProcessId -TargetPort $TargetPort) {
    throw "Port $TargetPort is still occupied after stopping PID $processId"
  }
}

function Wait-ForPortToBeFree {
  param(
    [int]$TargetPort,
    [int]$TimeoutSeconds = 8
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  do {
    if (-not (Get-ListeningProcessId -TargetPort $TargetPort)) {
      return
    }

    Start-Sleep -Milliseconds 250
  } while ((Get-Date) -lt $deadline)

  throw "Port $TargetPort did not become free in time"
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds,
    [System.Diagnostics.Process]$Process
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  do {
    if ($Process -and $Process.HasExited) {
      throw "Process exited before $Url became reachable. Exit code: $($Process.ExitCode)"
    }

    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    }
    catch {
      Start-Sleep -Milliseconds 450
    }
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for $Url"
}

function Wait-ForBackendConfig {
  param(
    [string]$Url,
    [string]$ExpectedCorsOrigin,
    [int]$TimeoutSeconds,
    [System.Diagnostics.Process]$Process
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  do {
    if ($Process -and $Process.HasExited) {
      throw "Backend process exited before expected CORS config appeared. Exit code: $($Process.ExitCode)"
    }

    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -eq 200) {
        $payload = $response.Content | ConvertFrom-Json
        if ($payload.config.corsOrigin -eq $ExpectedCorsOrigin) {
          return
        }
      }
    }
    catch {
      Start-Sleep -Milliseconds 450
    }
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for backend /health to report corsOrigin=$ExpectedCorsOrigin"
}

function Wait-ForTunnelUrl {
  param(
    [string[]]$LogPaths,
    [int]$TimeoutSeconds,
    [System.Diagnostics.Process]$Process
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $regex = "https://[a-z0-9-]+\.trycloudflare\.com"

  do {
    if ($Process.HasExited) {
      throw "Tunnel process exited before a quick URL was emitted. Exit code: $($Process.ExitCode)"
    }

    foreach ($logPath in $LogPaths) {
      if (-not (Test-Path $logPath)) {
        continue
      }

      $content = Get-Content $logPath -Raw -ErrorAction SilentlyContinue
      if ($content -match $regex) {
        return $Matches[0]
      }
    }

    Start-Sleep -Milliseconds 400
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for quick tunnel URL in $($LogPaths -join ', ')"
}

function Start-BackgroundPowerShell {
  param(
    [string]$Command,
    [string]$StdOutLog,
    [string]$StdErrLog
  )

  return Start-Process `
    -FilePath $powerShellExe `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $Command) `
    -RedirectStandardOutput $StdOutLog `
    -RedirectStandardError $StdErrLog `
    -WindowStyle Hidden `
    -PassThru
}

function New-QuotedLiteral {
  param([string]$Value)

  return "'" + $Value.Replace("'", "''") + "'"
}

$cloudflaredCommand = Get-CloudflaredCommand
$frontendLocalUrl = "http://localhost:$FrontendPort"
$backendLocalUrl = "http://${BindHost}:$BackendPort"

Stop-ProcessOnPort -TargetPort $BackendPort
Stop-ProcessOnPort -TargetPort $FrontendPort

$initialBackendCommand = @(
  "Set-Location $(New-QuotedLiteral $appRoot)",
  "`$env:HOST=$(New-QuotedLiteral $BindHost)",
  "`$env:PORT=$(New-QuotedLiteral $BackendPort)",
  "`$env:ONLINE_DUEL_DEPLOY_PROFILE='proxy'",
  "`$env:ONLINE_DUEL_CORS_ORIGIN='http://localhost:$FrontendPort'",
  "`$env:ONLINE_DUEL_LOG_LEVEL='info'",
  "`$env:ONLINE_DUEL_TRUST_PROXY='true'",
  "& $(New-QuotedLiteral $npmCommand) run online:server:proxy"
) -join "; "

$initialFrontendCommand = @(
  "Set-Location $(New-QuotedLiteral $appRoot)",
  "`$env:VITE_ONLINE_DUEL_BASE_URL='http://${BindHost}:$BackendPort'",
  "& $(New-QuotedLiteral $npmCommand) run dev -- --host 0.0.0.0 --port $FrontendPort"
) -join "; "

Write-Host "Starting local backend bootstrap..." -ForegroundColor Cyan
$backendProcess = Start-BackgroundPowerShell -Command $initialBackendCommand -StdOutLog $backendOutLog -StdErrLog $backendErrLog
Wait-ForHttp -Url "$backendLocalUrl/health" -TimeoutSeconds $StartupTimeoutSeconds -Process $backendProcess

Write-Host "Starting local frontend bootstrap..." -ForegroundColor Cyan
$frontendProcess = Start-BackgroundPowerShell -Command $initialFrontendCommand -StdOutLog $frontendOutLog -StdErrLog $frontendErrLog
Wait-ForHttp -Url $frontendLocalUrl -TimeoutSeconds $StartupTimeoutSeconds -Process $frontendProcess

$frontendTunnelCommand = "& $(New-QuotedLiteral $cloudflaredCommand) tunnel --url $frontendLocalUrl"
$backendTunnelCommand = "& $(New-QuotedLiteral $cloudflaredCommand) tunnel --url http://localhost:$BackendPort"

Write-Host "Opening frontend quick tunnel..." -ForegroundColor Cyan
$frontendTunnelProcess = Start-BackgroundPowerShell -Command $frontendTunnelCommand -StdOutLog $frontendTunnelOutLog -StdErrLog $frontendTunnelErrLog
$frontendTunnelUrl = Wait-ForTunnelUrl -LogPaths @($frontendTunnelOutLog, $frontendTunnelErrLog) -TimeoutSeconds $StartupTimeoutSeconds -Process $frontendTunnelProcess

Write-Host "Opening backend quick tunnel..." -ForegroundColor Cyan
$backendTunnelProcess = Start-BackgroundPowerShell -Command $backendTunnelCommand -StdOutLog $backendTunnelOutLog -StdErrLog $backendTunnelErrLog
$backendTunnelUrl = Wait-ForTunnelUrl -LogPaths @($backendTunnelOutLog, $backendTunnelErrLog) -TimeoutSeconds $StartupTimeoutSeconds -Process $backendTunnelProcess

Write-Host "Restarting backend with public frontend origin..." -ForegroundColor Cyan
if (-not $backendProcess.HasExited) {
  Stop-Process -Id $backendProcess.Id -Force
}
Start-Sleep -Milliseconds 300
Stop-ProcessOnPort -TargetPort $BackendPort
Wait-ForPortToBeFree -TargetPort $BackendPort

$finalBackendCommand = @(
  "Set-Location $(New-QuotedLiteral $appRoot)",
  "`$env:HOST=$(New-QuotedLiteral $BindHost)",
  "`$env:PORT=$(New-QuotedLiteral $BackendPort)",
  "`$env:ONLINE_DUEL_DEPLOY_PROFILE='proxy'",
  "`$env:ONLINE_DUEL_CORS_ORIGIN=$(New-QuotedLiteral $frontendTunnelUrl)",
  "`$env:ONLINE_DUEL_LOG_LEVEL='info'",
  "`$env:ONLINE_DUEL_TRUST_PROXY='true'",
  "& $(New-QuotedLiteral $npmCommand) run online:server:proxy"
) -join "; "

$backendProcess = Start-BackgroundPowerShell -Command $finalBackendCommand -StdOutLog $backendOutLog -StdErrLog $backendErrLog
Wait-ForHttp -Url "$backendLocalUrl/health" -TimeoutSeconds $StartupTimeoutSeconds -Process $backendProcess
Wait-ForBackendConfig -Url "$backendLocalUrl/health" -ExpectedCorsOrigin $frontendTunnelUrl -TimeoutSeconds $StartupTimeoutSeconds -Process $backendProcess

Write-Host "Restarting frontend with public backend tunnel..." -ForegroundColor Cyan
if (-not $frontendProcess.HasExited) {
  Stop-Process -Id $frontendProcess.Id -Force
}
Start-Sleep -Milliseconds 300
Stop-ProcessOnPort -TargetPort $FrontendPort
Wait-ForPortToBeFree -TargetPort $FrontendPort

$finalFrontendCommand = @(
  "Set-Location $(New-QuotedLiteral $appRoot)",
  "`$env:VITE_ONLINE_DUEL_BASE_URL=$(New-QuotedLiteral $backendTunnelUrl)",
  "& $(New-QuotedLiteral $npmCommand) run dev -- --host 0.0.0.0 --port $FrontendPort"
) -join "; "

$frontendProcess = Start-BackgroundPowerShell -Command $finalFrontendCommand -StdOutLog $frontendOutLog -StdErrLog $frontendErrLog
Wait-ForHttp -Url $frontendLocalUrl -TimeoutSeconds $StartupTimeoutSeconds -Process $frontendProcess

$summary = @"
Fight Club Quick Tunnel stack is running.

Frontend public URL:
$frontendTunnelUrl

Backend public URL:
$backendTunnelUrl

Local frontend:
$frontendLocalUrl

Local backend:
$backendLocalUrl

Processes:
- Backend PID: $($backendProcess.Id)
- Frontend PID: $($frontendProcess.Id)
- Frontend tunnel PID: $($frontendTunnelProcess.Id)
- Backend tunnel PID: $($backendTunnelProcess.Id)

Logs:
- Backend out: $backendOutLog
- Backend err: $backendErrLog
- Frontend out: $frontendOutLog
- Frontend err: $frontendErrLog
- Frontend tunnel out: $frontendTunnelOutLog
- Frontend tunnel err: $frontendTunnelErrLog
- Backend tunnel out: $backendTunnelOutLog
- Backend tunnel err: $backendTunnelErrLog
"@

Set-Content -Path $summaryPath -Value $summary -Encoding UTF8

$runtimeManifest = @{
  generatedAt = (Get-Date).ToString("o")
  mode = "quicktunnel"
  frontendTunnelUrl = $frontendTunnelUrl
  backendTunnelUrl = $backendTunnelUrl
  frontendLocalUrl = $frontendLocalUrl
  backendLocalUrl = $backendLocalUrl
  backendRuntimeUrl = $backendTunnelUrl
  launcherSummaryPath = $summaryPath
} | ConvertTo-Json

Set-Content -Path $runtimeManifestPath -Value $runtimeManifest -Encoding UTF8

Write-Host ""
Write-Host "Quick tunnel stack is ready." -ForegroundColor Green
Write-Host "Frontend URL: $frontendTunnelUrl" -ForegroundColor Green
Write-Host "Backend URL:  $backendTunnelUrl" -ForegroundColor Green
Write-Host "Summary file: $summaryPath" -ForegroundColor DarkGray
Write-Host "Runtime manifest: $runtimeManifestPath" -ForegroundColor DarkGray

if (-not $NoBrowser) {
  Start-Process $frontendTunnelUrl | Out-Null
}
