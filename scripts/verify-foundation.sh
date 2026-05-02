#!/usr/bin/env bash
# verify-foundation.sh — assert every FHE-EPMC Phase 0 foundation file exists.
# Idempotent. Exits 0 on full pass; non-zero on any missing file.

set -euo pipefail

REQUIRED=(
  "README.md"
  "CLAUDE.md"
  "MEMORY.md"
  "SKILLS.md"
  "package.json"

  "docs/PRODUCT_SPECIFICATION.md"
  "docs/DELIVERY_PLAN.md"
  "docs/ARCHITECTURE.md"
  "docs/INTEGRATION_MAP.md"
  "docs/PROMPTS_LIBRARY.md"

  "docs/process/review-workflow.md"
  "docs/process/milestone-closeout-template.md"
  "docs/process/evidence-model.md"
  "docs/process/approval-ledger.md"

  "docs/checklists/pr-review-checklist.md"
  "docs/checklists/release-checklist.md"
  "docs/checklists/enterprise-readiness-checklist.md"
  "docs/checklists/uat-checklist.md"
  "docs/checklists/branch-protection-checklist.md"

  ".github/pull_request_template.md"
  ".github/PULL_REQUEST_TEMPLATE/planning-pr.md"
  ".github/PULL_REQUEST_TEMPLATE/agent-remediation-pr.md"

  ".github/ISSUE_TEMPLATE/config.yml"
  ".github/ISSUE_TEMPLATE/epic.yml"
  ".github/ISSUE_TEMPLATE/feature.yml"
  ".github/ISSUE_TEMPLATE/bug-or-regression.yml"
  ".github/ISSUE_TEMPLATE/planning-output.yml"
  ".github/ISSUE_TEMPLATE/cursor-agent-task.yml"
  ".github/ISSUE_TEMPLATE/blocker-remediation.yml"

  ".github/workflows/ci.yml"
  ".github/workflows/claude.yml"
  ".github/workflows/claude-auto-review.yml"
  ".github/workflows/cursor-agent-manual.yml"
  ".github/workflows/repo-intelligence-scan.yml"
  ".github/dependabot.yml"

  ".cursor/agents/FHE-Agent.md"
  ".cursor/rules/fhe-conventions.mdc"
  ".cursor/environment.json"

  "scripts/phase-0-noop.js"
  "scripts/setup-repo-standards.sh"
  "scripts/setup-repo-standards.ps1"
  "scripts/setup-review-intelligence.sh"
  "scripts/setup-review-intelligence.ps1"
  "scripts/verify-foundation.sh"
  "scripts/verify-foundation.ps1"
  "scripts/vercel-ignore.sh"

  "vercel.json"
  ".vercelignore"
  ".nvmrc"
  "docs/process/vercel-integration.md"
)

missing=0
for f in "${REQUIRED[@]}"; do
  if [ -f "$f" ]; then
    printf '  [x] %s\n' "$f"
  else
    printf '  [ ] %s   <-- MISSING\n' "$f"
    missing=$((missing + 1))
  fi
done

# Forbidden patterns: secrets-shaped strings outside known-safe references.
# We allow placeholder *names* (e.g. ${{ secrets.ANTHROPIC_API_KEY }}) but
# fail on apparent literal credentials.
echo
echo "Scanning for accidental literal secrets..."
if git ls-files -z 2>/dev/null | xargs -0 grep -nE \
    -e 'sk-[a-zA-Z0-9-]{20,}' \
    -e 'AKIA[0-9A-Z]{16}' \
    -e 'ghp_[A-Za-z0-9]{20,}' \
    -e 'github_pat_[A-Za-z0-9_]{20,}' \
    -e 'xox[baprs]-[A-Za-z0-9-]{10,}' \
    2>/dev/null; then
  echo "  ERROR: literal secret-shaped strings detected above. Rotate and remove before pushing."
  missing=$((missing + 1))
else
  echo "  No literal secret-shaped strings found."
fi

if [ "$missing" -ne 0 ]; then
  echo
  echo "Foundation verification FAILED ($missing issue(s))."
  exit 1
fi

echo
echo "Foundation verification PASSED."
