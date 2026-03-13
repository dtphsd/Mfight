[CmdletBinding()]
param(
  [switch]$Install,
  [string]$BindAddress = "127.0.0.1",
  [int]$Port = 5173,
  [int]$StartupTimeoutSeconds = 25
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Join-Path $projectRoot "fight-club"
$nodeModulesPath = Join-Path $appRoot "node_modules"
$npmCommand = Join-Path ${env:ProgramFiles} "nodejs\npm.cmd"
$outLog = Join-Path $projectRoot "fight-club-dev.out.log"
$errLog = Join-Path $projectRoot "fight-club-dev.err.log"
$devUrl = "http://${BindAddress}:$Port/"

if (-not (Test-Path $appRoot)) {
  throw "fight-club directory not found: $appRoot"
}

if (-not (Test-Path $npmCommand)) {
  throw "npm.cmd not found at $npmCommand"
}

function Get-ListeningProcessId {
  param(
    [int]$TargetPort
  )

  $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if ($null -eq $connection) {
    return $null
  }

  return $connection.OwningProcess
}

function Stop-ProcessOnPort {
  param(
    [int]$TargetPort
  )

  $processId = Get-ListeningProcessId -TargetPort $TargetPort

  if ($null -eq $processId) {
    return
  }

  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

  if ($null -eq $process) {
    return
  }

  Write-Host "Stopping existing process on port $TargetPort (PID $processId)..." -ForegroundColor Yellow
  Stop-Process -Id $processId -Force

  $deadline = (Get-Date).AddSeconds(5)
  do {
    Start-Sleep -Milliseconds 200
  } while ((Get-ListeningProcessId -TargetPort $TargetPort) -and (Get-Date) -lt $deadline)

  if (Get-ListeningProcessId -TargetPort $TargetPort) {
    throw "Port $TargetPort is still occupied after stopping PID $processId"
  }
}

function Wait-ForDevServer {
  param(
    [string]$Url,
    [int]$TimeoutSeconds,
    [System.Diagnostics.Process]$Process
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  do {
    if ($Process.HasExited) {
      throw "Dev server process exited early with code $($Process.ExitCode)"
    }

    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    }
    catch {
      Start-Sleep -Milliseconds 400
    }
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for dev server at $Url"
}

try {
  Push-Location $appRoot

  if ($Install -or -not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & $npmCommand install

    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed with exit code $LASTEXITCODE"
    }
  }

  Stop-ProcessOnPort -TargetPort $Port

  if (Test-Path $outLog) {
    Remove-Item $outLog -Force
  }

  if (Test-Path $errLog) {
    Remove-Item $errLog -Force
  }

  Write-Host "Starting Fight Club dev server on $devUrl ..." -ForegroundColor Cyan
  $process = Start-Process `
    -FilePath $npmCommand `
    -ArgumentList @("run", "dev", "--", "--host", $BindAddress, "--port", "$Port") `
    -WorkingDirectory $appRoot `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -WindowStyle Hidden `
    -PassThru

  Wait-ForDevServer -Url $devUrl -TimeoutSeconds $StartupTimeoutSeconds -Process $process

  Write-Host "Fight Club dev server is ready." -ForegroundColor Green
  Write-Host "URL: $devUrl" -ForegroundColor Green
  Write-Host "PID: $($process.Id)" -ForegroundColor DarkGray
  Write-Host "Logs: $outLog" -ForegroundColor DarkGray

  if ((Test-Path $errLog) -and (Get-Item $errLog).Length -gt 0) {
    Write-Host "Warning: stderr log is not empty: $errLog" -ForegroundColor Yellow
  }
}
finally {
  Pop-Location
}
