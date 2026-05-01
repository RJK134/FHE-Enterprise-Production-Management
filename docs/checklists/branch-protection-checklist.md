# Branch Protection Checklist

> Apply this configuration to `main` on every FHE-managed repo.

Branch protection cannot be configured by Claude Code automatically — it is a manual action by the Owner via Settings → Branches. This document is the canonical setting.

---

## Protected Branch

- **Branch:** `main`

## Required Settings

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1** (minimum; 2 for security-sensitive repos)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (where `CODEOWNERS` exists)
  - [ ] Allow specified actors to bypass required pull requests — **leave unchecked**
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required checks (minimum):
    - `lint`
    - `typecheck`
    - `test`
    - `build`
- [x] **Require conversation resolution before merging**
- [x] **Require signed commits** (recommended, optional in Phase 0)
- [x] **Require linear history** (recommended)
- [x] **Require deployments to succeed before merging** (when environments are wired)
- [x] **Lock branch** — **leave unchecked** (we still need to merge into it)
- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches** — leave the maintainer/admin team only
- [x] **Allow force pushes — Disabled**
- [x] **Allow deletions — Disabled**

## Auto-merge

- [x] **Allow auto-merge** is enabled at the repo level.
  - Auto-merge is permitted only when branch protection requires CI + ≥ 1 approving review.
  - Auto-merge does not bypass any required check or required approval.

## Forbidden

- [ ] Admin override: not used outside genuine break-glass with a `break_glass_override` ledger entry.
- [ ] Disabling required checks "temporarily": not permitted.
- [ ] Force-pushing to `main`: not permitted.
- [ ] Approving your own PR: not permitted.

---

## Verification

After applying the protection rule, verify with:

```bash
gh api repos/{owner}/{repo}/branches/main/protection --jq '{
  required_pull_request_reviews,
  required_status_checks: .required_status_checks.contexts,
  enforce_admins,
  allow_force_pushes,
  allow_deletions,
  required_conversation_resolution
}'
```

Expected: `enforce_admins.enabled = true` (or owner-justified false), force-pushes off, deletions off, conversation resolution required, status checks include the four canonical contexts.
