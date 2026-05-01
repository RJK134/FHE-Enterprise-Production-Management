# setup-review-intelligence.ps1
# Idempotently install canonical FHE-EPMC labels and milestones on a target repo using gh CLI.

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $Repo,
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

if (-not $Repo.Contains("/")) {
  Write-Error "Repo must be 'owner/name', got '$Repo'"
}

function Invoke-Run([scriptblock] $Action, [string] $Description) {
  if ($DryRun) {
    Write-Host "DRYRUN: $Description"
  } else {
    & $Action
  }
}

$labels = @(
  @{ name = "epic"; color = "7e57c2"; description = "Multi-issue body of work spanning a phase or milestone" },
  @{ name = "feature"; color = "0e8a16"; description = "Single scoped enhancement" },
  @{ name = "bug"; color = "d73a4a"; description = "Defect or regression" },
  @{ name = "blocker"; color = "b60205"; description = "Portfolio blocker tracked in DELIVERY_PLAN.md" },
  @{ name = "planning"; color = "1d76db"; description = "Plan refresh / planning artefact" },
  @{ name = "documentation"; color = "0075ca"; description = "Docs-only change" },
  @{ name = "dependencies"; color = "cfd3d7"; description = "Dependency update / Dependabot" },
  @{ name = "github-actions"; color = "24292e"; description = "GitHub Actions workflow" },
  @{ name = "claude"; color = "7c3aed"; description = "Claude Code authored or invoked" },
  @{ name = "cursor"; color = "6366f1"; description = "Cursor agent authored or invoked" },
  @{ name = "agent-task"; color = "c2410c"; description = "Issue intended for an agent to action" },
  @{ name = "agent-blocked"; color = "9f2424"; description = "Agent stopped — needs human triage" },
  @{ name = "needs-triage"; color = "e4e669"; description = "Awaiting initial triage" },
  @{ name = "needs-review"; color = "fbca04"; description = "Awaiting human review" },
  @{ name = "requires-human-review"; color = "b60205"; description = "Touches schema/auth/secrets/CI-CD/external/payments/PII or >5 files" },
  @{ name = "security"; color = "ff0000"; description = "Security finding or fix" },
  @{ name = "uat"; color = "0e8a16"; description = "UAT artefact or verdict" },
  @{ name = "release"; color = "2cbe4e"; description = "Release-related" },
  @{ name = "P0"; color = "b60205"; description = "Must complete this phase" },
  @{ name = "P1"; color = "d93f0b"; description = "Should complete this phase" },
  @{ name = "P2"; color = "fbca04"; description = "Nice to have this phase" }
)

Write-Host "Applying labels to $Repo"
$existingLabels = (gh label list --repo $Repo --limit 200 --json name --jq '.[].name') 2>$null
foreach ($l in $labels) {
  if ($existingLabels -contains $l.name) {
    Invoke-Run { gh label edit $l.name --repo $Repo --color $l.color --description $l.description | Out-Null } "edit label $($l.name)"
    Write-Host "  updated $($l.name)"
  } else {
    Invoke-Run { gh label create $l.name --repo $Repo --color $l.color --description $l.description | Out-Null } "create label $($l.name)"
    Write-Host "  created $($l.name)"
  }
}

$milestones = @(
  "Phase 0 — Foundation",
  "Phase 1 — Live Control Tower",
  "Phase 2 — Agent Bridge & Plan Engine",
  "Phase 3 — Evidence & Ledger",
  "Phase 4 — RBAC, SSO, UAT Portal",
  "Phase 5 — Release Governance & Cost Meter",
  "Phase 6 — Portfolio Hardening",
  "Phase 7 — Continuous Improvement"
)

Write-Host ""
Write-Host "Applying milestones to $Repo"
$existingMilestones = (gh api "repos/$Repo/milestones?state=all&per_page=100" --jq '.[].title') 2>$null
foreach ($m in $milestones) {
  if ($existingMilestones -contains $m) {
    Write-Host "  exists $m"
  } else {
    Invoke-Run { gh api -X POST "repos/$Repo/milestones" -f title="$m" | Out-Null } "create milestone $m"
    Write-Host "  created $m"
  }
}

Write-Host ""
Write-Host "Review Intelligence baseline applied to $Repo"
