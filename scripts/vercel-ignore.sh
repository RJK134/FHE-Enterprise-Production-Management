#!/usr/bin/env bash
# vercel-ignore.sh — Vercel "Ignored Build Step" command.
#
# Vercel semantics:
#   exit 0 → ignore this build (skip deploy)
#   exit 1 → proceed with build (deploy)
#
# Phase 0 of FHE-EPMC ships docs and governance only; there is no Next.js app
# yet (lands in Phase 1, see docs/DELIVERY_PLAN.md). Until next.config.* exists
# we tell Vercel to skip the deploy gracefully so neither preview nor production
# deploys produce empty / failed builds against the foundation PR.
#
# When Phase 1 lands the Next.js app and commits next.config.{js,ts,mjs}, this
# script automatically flips to "proceed" without any vercel.json edit needed.
#
# Docs-only changes (under docs/, scripts/, .github/, .cursor/) on branches that
# already have the app should still skip deploys to save Vercel build minutes.

set -euo pipefail

has_next_config=0
for f in next.config.js next.config.ts next.config.mjs next.config.cjs; do
  if [ -f "$f" ]; then
    has_next_config=1
    break
  fi
done

if [ "$has_next_config" -eq 0 ]; then
  echo "[vercel-ignore] No next.config.* — Phase 0. Skipping deploy."
  exit 0
fi

# App exists. Check whether this commit changed anything outside docs / governance.
# If the diff is purely docs/scripts/.github/.cursor, skip the deploy.
# VERCEL_GIT_PREVIOUS_SHA is provided by Vercel for incremental git diffing.
if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && git rev-parse --verify "$VERCEL_GIT_PREVIOUS_SHA" >/dev/null 2>&1; then
  changed=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" HEAD || true)
  if [ -n "$changed" ]; then
    non_docs=$(echo "$changed" | grep -Ev '^(docs/|scripts/|\.github/|\.cursor/|README\.md|CLAUDE\.md|MEMORY\.md|SKILLS\.md|\.gitignore|LICENSE)' || true)
    if [ -z "$non_docs" ]; then
      echo "[vercel-ignore] Diff is docs/governance only. Skipping deploy."
      exit 0
    fi
  fi
fi

echo "[vercel-ignore] App present and diff includes app code. Proceeding with deploy."
exit 1
