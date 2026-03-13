param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string]$Remote = "origin",

  [string]$Branch = "",

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $repoRoot

function Invoke-GitCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & git @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($Arguments -join ' ')"
  }
}

function Get-GitOutput {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $output = & git @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($Arguments -join ' ')"
  }

  return ($output | Out-String).Trim()
}

Invoke-GitCommand -Arguments @("rev-parse", "--is-inside-work-tree")

$remoteUrl = Get-GitOutput -Arguments @("remote", "get-url", $Remote)

if (-not $remoteUrl) {
  throw "Git remote '$Remote' is not configured."
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = Get-GitOutput -Arguments @("branch", "--show-current")
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
  throw "Could not determine the current branch. Pass -Branch explicitly."
}

$statusBefore = Get-GitOutput -Arguments @("status", "--short")

if ([string]::IsNullOrWhiteSpace($statusBefore)) {
  Write-Host "No local changes found. Nothing to publish."
  exit 0
}

if ($DryRun) {
  Write-Host "Dry run only. No changes were published."
  Write-Host "Remote: $Remote -> $remoteUrl"
  Write-Host "Branch: $Branch"
  Write-Host "Commit message: $Message"
  Write-Host ""
  Write-Host "Pending changes:"
  Write-Host $statusBefore
  Write-Host ""
  Write-Host "Planned commands:"
  Write-Host "git add -A"
  Write-Host "git commit -m `"$Message`""
  Write-Host "git push $Remote $Branch"
  exit 0
}

Write-Host "Staging all changes..."
Invoke-GitCommand -Arguments @("add", "-A")

$statusAfterAdd = Get-GitOutput -Arguments @("status", "--short")

if ([string]::IsNullOrWhiteSpace($statusAfterAdd)) {
  Write-Host "No staged changes found after git add -A. Nothing to publish."
  exit 0
}

Write-Host "Creating commit..."
Invoke-GitCommand -Arguments @("commit", "-m", $Message)

Write-Host "Pushing to $Remote/$Branch..."
Invoke-GitCommand -Arguments @("push", $Remote, $Branch)

Write-Host "Publish complete."
