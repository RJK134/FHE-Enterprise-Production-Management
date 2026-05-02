#!/usr/bin/env bash
# setup-review-intelligence.sh
# Idempotently install canonical labels and milestones on a target repo using gh CLI.

set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 --repo <owner/name> [--dry-run]

Idempotently creates / updates the canonical FHE-EPMC labels and milestones.
Requires: gh CLI authenticated against an account with write access.
EOF
}

REPO=""
DRY=0
while [ "${1:-}" != "" ]; do
  case "$1" in
    --repo) REPO="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [ -z "$REPO" ]; then usage; exit 1; fi

run() {
  if [ "$DRY" -eq 1 ]; then
    echo "DRYRUN: $*"
  else
    eval "$@"
  fi
}

# Canonical labels: name|colour|description (no spaces around pipes)
LABELS=(
  "epic|7e57c2|Multi-issue body of work spanning a phase or milestone"
  "feature|0e8a16|Single scoped enhancement"
  "bug|d73a4a|Defect or regression"
  "blocker|b60205|Portfolio blocker tracked in DELIVERY_PLAN.md"
  "planning|1d76db|Plan refresh / planning artefact"
  "documentation|0075ca|Docs-only change"
  "dependencies|cfd3d7|Dependency update / Dependabot"
  "github-actions|24292e|GitHub Actions workflow"
  "claude|7c3aed|Claude Code authored or invoked"
  "cursor|6366f1|Cursor agent authored or invoked"
  "agent-task|c2410c|Issue intended for an agent to action"
  "agent-blocked|9f2424|Agent stopped — needs human triage"
  "needs-triage|e4e669|Awaiting initial triage"
  "needs-review|fbca04|Awaiting human review"
  "requires-human-review|b60205|Touches schema/auth/secrets/CI-CD/external/payments/PII or >5 files"
  "security|ff0000|Security finding or fix"
  "uat|0e8a16|UAT artefact or verdict"
  "release|2cbe4e|Release-related"
  "P0|b60205|Must complete this phase"
  "P1|d93f0b|Should complete this phase"
  "P2|fbca04|Nice to have this phase"
)

echo "Applying labels to $REPO"
for spec in "${LABELS[@]}"; do
  IFS='|' read -r name colour description <<< "$spec"
  if gh label list --repo "$REPO" --limit 200 --json name --jq '.[].name' 2>/dev/null | grep -Fxq "$name"; then
    run "gh label edit \"$name\" --repo \"$REPO\" --color \"$colour\" --description \"$description\" >/dev/null"
    echo "  updated $name"
  else
    run "gh label create \"$name\" --repo \"$REPO\" --color \"$colour\" --description \"$description\" >/dev/null"
    echo "  created $name"
  fi
done

# Canonical milestones (high level — phases are managed in DELIVERY_PLAN.md per-repo).
MILESTONES=(
  "Phase 0 — Foundation"
  "Phase 1 — Live Control Tower"
  "Phase 2 — Agent Bridge & Plan Engine"
  "Phase 3 — Evidence & Ledger"
  "Phase 4 — RBAC, SSO, UAT Portal"
  "Phase 5 — Release Governance & Cost Meter"
  "Phase 6 — Portfolio Hardening"
  "Phase 7 — Continuous Improvement"
)

echo
echo "Applying milestones to $REPO"
existing=$(gh api "repos/$REPO/milestones?state=all&per_page=100" --jq '.[].title' 2>/dev/null || true)
for m in "${MILESTONES[@]}"; do
  if echo "$existing" | grep -Fxq "$m"; then
    echo "  exists $m"
  else
    run "gh api -X POST \"repos/$REPO/milestones\" -f title=\"$m\" >/dev/null"
    echo "  created $m"
  fi
done

echo
echo "Review Intelligence baseline applied to $REPO"
