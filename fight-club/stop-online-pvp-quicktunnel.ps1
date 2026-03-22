[CmdletBinding()]
param(
  [int[]]$Ports = @(3001, 5174),
  [switch]$KeepCloudflared
)

$ErrorActionPreference = "Stop"
$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeManifestPath = Join-Path $appRoot "public\online-duel-runtime.json"

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
    Write-Host "Nothing is listening on port $TargetPort." -ForegroundColor DarkGray
    return
  }

  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($null -eq $process) {
    return
  }

  Write-Host "Stopping process on port $TargetPort (PID $processId, $($process.ProcessName))..." -ForegroundColor Yellow
  Stop-Process -Id $processId -Force
}

foreach ($port in $Ports) {
  Stop-ProcessOnPort -TargetPort $port
}

if (-not $KeepCloudflared) {
  $cloudflaredProcesses = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
  if ($cloudflaredProcesses) {
    Write-Host "Stopping cloudflared processes..." -ForegroundColor Yellow
    $cloudflaredProcesses | Stop-Process -Force
  } else {
    Write-Host "No cloudflared processes found." -ForegroundColor DarkGray
  }
}

if (Test-Path $runtimeManifestPath) {
  $stoppedManifest = @{
    generatedAt = (Get-Date).ToString("o")
    mode = "stopped"
    frontendTunnelUrl = ""
    backendTunnelUrl = ""
    frontendLocalUrl = ""
    backendLocalUrl = ""
    backendRuntimeUrl = ""
    launcherSummaryPath = ""
  } | ConvertTo-Json

  Set-Content -Path $runtimeManifestPath -Value $stoppedManifest -Encoding UTF8
}

Write-Host "Online PvP quick tunnel stack has been stopped." -ForegroundColor Green
