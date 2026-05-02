# verify-foundation.ps1 — assert every FHE-EPMC Phase 0 foundation file exists.
# Idempotent. Exits 0 on full pass; non-zero on any missing file.
# Mirrors scripts/verify-foundation.sh.

$ErrorActionPreference = "Stop"

$Required = @(
  "README.md",
  "CLAUDE.md",
  "MEMORY.md",
  "SKILLS.md",
  "package.json",

  "docs/PRODUCT_SPECIFICATION.md",
  "docs/DELIVERY_PLAN.md",
  "docs/ARCHITECTURE.md",
  "docs/INTEGRATION_MAP.md",
  "docs/PROMPTS_LIBRARY.md",

  "docs/process/review-workflow.md",
  "docs/process/milestone-closeout-template.md",
  "docs/process/evidence-model.md",
  "docs/process/approval-ledger.md",

  "docs/checklists/pr-review-checklist.md",
  "docs/checklists/release-checklist.md",
  "docs/checklists/enterprise-readiness-checklist.md",
  "docs/checklists/uat-checklist.md",
  "docs/checklists/branch-protection-checklist.md",

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

  ".github/workflows/ci.yml",
  ".github/workflows/claude.yml",
  ".github/workflows/claude-auto-review.yml",
  ".github/workflows/cursor-agent-manual.yml",
  ".github/workflows/repo-intelligence-scan.yml",
  ".github/dependabot.yml",

  ".cursor/agents/FHE-Agent.md",
  ".cursor/rules/fhe-conventions.mdc",
  ".cursor/environment.json",

  "scripts/phase-0-noop.js",
  "scripts/setup-repo-standards.sh",
  "scripts/setup-repo-standards.ps1",
  "scripts/setup-review-intelligence.sh",
  "scripts/setup-review-intelligence.ps1",
  "scripts/verify-foundation.sh",
  "scripts/verify-foundation.ps1"
)

$missing = 0
foreach ($f in $Required) {
  if (Test-Path $f) {
    Write-Host "  [x] $f"
  } else {
    Write-Host "  [ ] $f   <-- MISSING"
    $missing++
  }
}

Write-Host ""
Write-Host "Scanning for accidental literal secrets..."

$patterns = @(
  'sk-[a-zA-Z0-9-]{20,}',
  'AKIA[0-9A-Z]{16}',
  'ghp_[A-Za-z0-9]{20,}',
  'github_pat_[A-Za-z0-9_]{20,}',
  'xox[baprs]-[A-Za-z0-9-]{10,}'
)

$leaks = 0
$tracked = git ls-files
foreach ($file in $tracked) {
  if (Test-Path $file -PathType Leaf) {
    $content = Get-Content -Raw -LiteralPath $file -ErrorAction SilentlyContinue
    if ($null -ne $content) {
      foreach ($p in $patterns) {
        if ($content -match $p) {
          Write-Host "  ERROR: secret-shaped string in $file"
          $leaks++
        }
      }
    }
  }
}

if ($leaks -eq 0) {
  Write-Host "  No literal secret-shaped strings found."
} else {
  $missing += $leaks
}

Write-Host ""
if ($missing -ne 0) {
  Write-Host "Foundation verification FAILED ($missing issue(s))."
  exit 1
}

Write-Host "Foundation verification PASSED."
