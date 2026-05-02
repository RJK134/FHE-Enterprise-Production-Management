#!/usr/bin/env bash
# setup-repo-standards.sh
# Idempotently apply FHE-EPMC repo standards to a target repo.
# Copies CLAUDE.md, MEMORY.md, .cursor/, .github/ workflow + template baselines.
# Does NOT push; opens a foundation PR via gh once changes are committed locally.

set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 --repo <owner/name> [--target <local-path>] [--dry-run]

Options:
  --repo       Target repo, e.g. RJK134/SJMS-2.5 (required)
  --target     Local path to the cloned target repo (default: ../<name>)
  --dry-run    Print actions without writing files
  -h, --help   Show this help

Examples:
  $0 --repo RJK134/SJMS-2.5
  $0 --repo RJK134/EquiSmile --target ../EquiSmile
EOF
}

REPO=""
TARGET=""
DRY=0

while [ "${1:-}" != "" ]; do
  case "$1" in
    --repo) REPO="$2"; shift 2 ;;
    --target) TARGET="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [ -z "$REPO" ]; then
  usage
  exit 1
fi

NAME="${REPO##*/}"
TARGET="${TARGET:-../$NAME}"

if [ ! -d "$TARGET" ]; then
  echo "Target repo path not found: $TARGET"
  echo "Clone first: git clone https://github.com/$REPO $TARGET"
  exit 1
fi

SRC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Files to copy verbatim (governance-shared baseline).
COPY_FILES=(
  "CLAUDE.md"
  ".cursor/agents/FHE-Agent.md"
  ".cursor/rules/fhe-conventions.mdc"
  ".cursor/environment.json"
  ".github/dependabot.yml"
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
  ".github/workflows/claude.yml"
  ".github/workflows/claude-auto-review.yml"
  ".github/workflows/cursor-agent-manual.yml"
)

run() {
  if [ "$DRY" -eq 1 ]; then
    echo "DRYRUN: $*"
  else
    eval "$@"
  fi
}

echo "Setting up FHE standards on $REPO (local: $TARGET)"
for rel in "${COPY_FILES[@]}"; do
  src="$SRC_ROOT/$rel"
  dst="$TARGET/$rel"
  if [ ! -f "$src" ]; then
    echo "  skip (source missing): $rel"
    continue
  fi
  run "mkdir -p \"$(dirname "$dst")\""
  run "cp \"$src\" \"$dst\""
  echo "  copied $rel"
done

# Seed MEMORY.md only if absent — never overwrite the target's session log.
if [ ! -f "$TARGET/MEMORY.md" ]; then
  run "cat > \"$TARGET/MEMORY.md\" <<'MEMO'
# MEMORY.md — $REPO

> Session continuity file under FHE-EPMC governance.
> Read this at the start of every Claude Code session before writing any code.

## Active Context
- **Repo:** $REPO
- **Phase:** (set when intaken)
- **Owner:** Freddie Finn (RJK134)

## Notes
- Update this file at the end of every session per the FHE-EPMC Session End Protocol.
MEMO"
  echo "  seeded MEMORY.md"
else
  echo "  MEMORY.md already present — left untouched"
fi

echo
echo "Done. In $TARGET:"
echo "  1. Review the diff."
echo "  2. Commit on a 'chore/fhe-standards' branch."
echo "  3. Open a PR titled 'chore: apply FHE-EPMC repo standards'."
echo "  4. Get human approval and merge."
echo
echo "Manual GitHub steps that cannot be scripted here:"
echo "  - Branch protection on main: PR + 1 review + CI pass + up-to-date."
echo "  - Add ANTHROPIC_API_KEY and CURSOR_API_KEY repo secrets."
echo "  - Install Claude Code GitHub App and Cursor GitHub App on $REPO."
echo "  - Enable Dependabot security + version updates."
echo "  - Enable CodeQL scanning."
echo "  - Create environments: development, staging, production (production protected)."
