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

if ! command -v git >/dev/null 2>&1; then
  echo "[vercel-ignore] git not available in build env. Proceeding with deploy."
  exit 1
fi

has_next_app=0

for f in next.config.js next.config.ts next.config.mjs next.config.cjs; do
  if [ -f "$f" ]; then
    has_next_app=1
    break
  fi
done

if [ "$has_next_app" -eq 0 ] && { [ -d app ] || [ -d pages ]; }; then
  has_next_app=1
fi

if [ "$has_next_app" -eq 0 ] && [ -f package.json ]; then
  if grep -Eq '"next"[[:space:]]*:' package.json || grep -Eq 'next build' package.json; then
    has_next_app=1
  fi
fi

if [ "$has_next_app" -eq 0 ]; then
  echo "[vercel-ignore] No Next.js app detected (no next.config.*, app/, pages/, or package.json Next.js markers) — Phase 0. Skipping deploy."
  exit 0
fi

# App exists. Check whether this commit changed anything outside docs / governance.
# If the diff is purely docs/scripts/.github/.cursor, skip the deploy.
# Prefer VERCEL_GIT_PREVIOUS_SHA for incremental git diffing, but fall back to
# HEAD~1 when the previous SHA is unavailable or not present in a shallow clone.
diff_base=""
if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && git rev-parse --verify "$VERCEL_GIT_PREVIOUS_SHA" >/dev/null 2>&1; then
  diff_base="$VERCEL_GIT_PREVIOUS_SHA"
elif git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  diff_base="HEAD~1"
fi

if [ -n "$diff_base" ]; then
  changed=$(git diff --name-only "$diff_base" HEAD || true)
  if [ -n "$changed" ]; then
    non_docs=$(echo "$changed" | grep -Ev '^(docs/|scripts/|\.github/|\.cursor/|README\.md|CLAUDE\.md|MEMORY\.md|SKILLS\.md|\.gitignore|LICENSE|\.nvmrc|\.vercelignore|vercel\.json)$' || true)
    if [ -z "$non_docs" ]; then
      echo "[vercel-ignore] Diff from $diff_base is docs/governance only. Skipping deploy."
      exit 0
    fi
  fi
fi

echo "[vercel-ignore] No usable git diff base found; proceeding with deploy."
exit 1
