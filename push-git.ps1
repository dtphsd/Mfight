param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string]$Remote = "origin",

  [string]$Branch = "",

  [switch]$DryRun
)

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "publish-github.ps1"

if (-not (Test-Path -Path $scriptPath)) {
  throw "Missing helper script: $scriptPath"
}

& $scriptPath -Message $Message -Remote $Remote -Branch $Branch -DryRun:$DryRun

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
