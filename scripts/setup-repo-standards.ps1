# setup-repo-standards.ps1
# Idempotent FHE-EPMC repo standards deploy. Mirrors scripts/setup-repo-standards.sh.

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $Repo,
  [string] $Target = "",
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

if (-not $Repo.Contains("/")) {
  Write-Error "Repo must be in 'owner/name' form, got '$Repo'"
}

$name = $Repo.Split("/")[1]
if ([string]::IsNullOrWhiteSpace($Target)) {
  $Target = Join-Path -Path ".." -ChildPath $name
}

if (-not (Test-Path $Target)) {
  Write-Error "Target repo path not found: $Target. Clone first: git clone https://github.com/$Repo $Target"
}

$srcRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$files = @(
  "CLAUDE.md",
  ".cursor/agents/FHE-Agent.md",
  ".cursor/rules/fhe-conventions.mdc",
  ".cursor/environment.json",
  ".github/dependabot.yml",
  ".github/pull_request_template.md",
  ".github/PULL_REQUEST_TEMPLATE/planning-pr.md",
  ".github/PULL_REQUEST_TEMPLATE/agent-remediation-pr.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/epic.yml",
  ".github/ISSUE_TEMPLATE/feature.yml",
  ".github/ISSUE_TEMPLATE/bug-or-regression.yml",
  ".github/ISSUE_TEMPLATE/planning-output.yml",
  ".github/ISSUE_TEMPLATE/cursor-agent-task.yml",
  ".github/ISSUE_TEMPLATE/blocker-remediation.yml",
  ".github/workflows/claude.yml",
  ".github/workflows/claude-auto-review.yml",
  ".github/workflows/cursor-agent-manual.yml"
)

function Invoke-Run([scriptblock] $Action, [string] $Description) {
  if ($DryRun) {
    Write-Host "DRYRUN: $Description"
  } else {
    & $Action
  }
}

Write-Host "Setting up FHE standards on $Repo (local: $Target)"
foreach ($rel in $files) {
  $src = Join-Path $srcRoot $rel
  $dst = Join-Path $Target $rel
  if (-not (Test-Path $src)) {
    Write-Host "  skip (source missing): $rel"
    continue
  }
  $dstDir = Split-Path -Parent $dst
  Invoke-Run { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null } "mkdir $dstDir"
  Invoke-Run { Copy-Item -LiteralPath $src -Destination $dst -Force } "copy $rel"
  Write-Host "  copied $rel"
}

$memoryPath = Join-Path $Target "MEMORY.md"
if (-not (Test-Path $memoryPath)) {
  $memo = @"
# MEMORY.md — $Repo

> Session continuity file under FHE-EPMC governance.
> Read this at the start of every Claude Code session before writing any code.

## Active Context
- **Repo:** $Repo
- **Phase:** (set when intaken)
- **Owner:** Freddie Finn (RJK134)

## Notes
- Update this file at the end of every session per the FHE-EPMC Session End Protocol.
"@
  Invoke-Run { Set-Content -LiteralPath $memoryPath -Value $memo -NoNewline:$false } "seed MEMORY.md"
  Write-Host "  seeded MEMORY.md"
} else {
  Write-Host "  MEMORY.md already present — left untouched"
}

Write-Host ""
Write-Host "Done. In $Target:"
Write-Host "  1. Review the diff."
Write-Host "  2. Commit on a 'chore/fhe-standards' branch."
Write-Host "  3. Open a PR titled 'chore: apply FHE-EPMC repo standards'."
Write-Host "  4. Get human approval and merge."
Write-Host ""
Write-Host "Manual GitHub steps that cannot be scripted here:"
Write-Host "  - Branch protection on main: PR + 1 review + CI pass + up-to-date."
Write-Host "  - Add ANTHROPIC_API_KEY and CURSOR_API_KEY repo secrets."
Write-Host "  - Install Claude Code GitHub App and Cursor GitHub App on $Repo."
Write-Host "  - Enable Dependabot security + version updates."
Write-Host "  - Enable CodeQL scanning."
Write-Host "  - Create environments: development, staging, production (production protected)."
