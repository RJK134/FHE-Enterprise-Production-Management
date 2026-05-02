# Vercel for GitHub — Integration Runbook

> Canonical setup and operating guide for the Vercel for GitHub integration.
> Applies to FHE-EPMC and any future FHE-managed Next.js product hosted on Vercel.
> **Last updated:** 2026-05-01

This runbook covers everything an operator needs to wire up, operate, and audit Vercel deployments under FHE governance. It assumes the repo already has the Phase 0 foundation in place (`vercel.json`, `.vercelignore`, `.nvmrc`, `scripts/vercel-ignore.sh`).

Reference: https://vercel.com/docs/git/vercel-for-github

---

## 1. Posture

Vercel is the production hosting target for FHE-EPMC and the recommended hosting for any FHE Next.js product. The integration is governed under the same human-gated rules as the rest of FHE-EPMC:

- **Preview deploys are advisory.** They are *not* added to required status checks until the app is stable enough that a failed preview deploy must block a merge.
- **Production deploys are gated.** Promotion to the production custom domain requires the GitHub Environment `production` manual approval, not just a push to `main`.
- **No bypass.** Vercel cannot merge PRs, cannot edit branch protection, and cannot rotate secrets.
- **No real PII** in any deployed environment for this repo (FHE-EPMC). Other product repos manage their own GDPR posture.

---

## 2. One-Time Wiring (Owner Action)

These steps are manual and out of band; they cannot be automated by Claude Code or Cursor.

1. **Install the Vercel for GitHub app** on `RJK134/FHE-Enterprise-Production-Management`.
   - Repository permissions required (read+write where applicable): Administration, Checks, Contents, Deployments, Pull Requests, Issues, Metadata, Web Hooks, Commit Statuses.
   - Org permissions: Members (read).
2. **Create the Vercel project** from the dashboard:
   - Framework Preset: **Next.js** (matches `vercel.json` `"framework": "nextjs"`).
   - Root directory: repo root.
   - Build & Output Settings: leave at defaults; `vercel.json` overrides them.
3. **Production Branch:** `main`. Enforced via `vercel.json` `"git.deploymentEnabled": { "main": true }`.
4. **Region:** `lhr1` (London). Set to match data-residency expectations for UK products.
5. **Environments (Vercel):** create three to mirror GitHub Environments — `Development`, `Preview`, `Production`.
6. **Environment variables:** add per environment as the dashboard lands (Phase 1+). Never paste tokens here without checking they belong to the right environment.
7. **Deployment Protection:** in Project Settings → Deployment Protection, enable **Vercel Authentication** for `Preview` to keep WIP deploys behind SSO. Production stays public (or behind the product's own auth).
8. **Git Fork Protection:** in Project Settings → Security, leave enabled. Forked-PR deploys require a maintainer approval to run, preventing leakage of env vars and OIDC tokens.
9. **Comments:** Project Settings → Git → leave PR comment toggle on for visibility. Disable `deployment_status` events if log noise becomes a problem (Vercel adds a comment anyway).
10. **Custom domain:** wire after Phase 1. Until then, `*.vercel.app` is sufficient.

---

## 3. What `vercel.json` Does (and Why)

| Field | Value | Why |
|---|---|---|
| `framework` | `nextjs` | Pin the framework so Vercel doesn't auto-detect the wrong one if the repo briefly contains scaffolding from another tool. |
| `installCommand` | `npm ci \|\| npm install` | `npm ci` for clean installs in CI; fall back to `npm install` if no lockfile (Phase 0). |
| `buildCommand` | `npm run build` | Canonical; matches CLAUDE.md and CI. |
| `outputDirectory` | `.next` | Default for Next.js; explicit so it doesn't drift. |
| `ignoreCommand` | `bash scripts/vercel-ignore.sh` | Phase-0-aware skip: no Next.js app yet → exit 0 (skip). When the app lands, the same script proceeds, and skips again on docs-only diffs. Saves Vercel build minutes and avoids spurious failures. |
| `git.deploymentEnabled.main` | `true` | Production branch deploys allowed; other branches deploy as **previews** by default (Vercel default). |
| `github.autoJobCancelation` | `true` | Newer pushes on the same branch cancel in-flight builds — always deploy the latest commit. |
| `github.silent` | `false` | Keep PR comments on; valuable signal during review. |
| `regions` | `["lhr1"]` | London region for data residency. |
| `cleanUrls` | `true` | `/about` not `/about.html`. |
| `trailingSlash` | `false` | Prefer no trailing slash; Next.js default. |

---

## 4. The Ignore Step

`scripts/vercel-ignore.sh` is the single source of truth for "should this commit deploy?".

- **Phase 0 (no `next.config.*`):** exits 0 → Vercel skips. Foundation PRs do not produce broken empty deploys.
- **Phase 1+ (app present), full app diff:** exits 1 → Vercel deploys.
- **Phase 1+ (app present), docs-only diff:** exits 0 → Vercel skips. Conserves build minutes.

Vercel reports `vercel.deployment.ignored` for skipped builds via `repository_dispatch`, so the signal is observable from GitHub Actions if needed.

---

## 5. System Environment Variables Available to the App

Vercel automatically exposes these to every build/runtime (full list in `docs/INTEGRATION_MAP.md`):

- `VERCEL`, `VERCEL_ENV`, `VERCEL_TARGET_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`
- `VERCEL_GIT_PROVIDER`, `VERCEL_GIT_REPO_SLUG`, `VERCEL_GIT_REPO_OWNER`, `VERCEL_GIT_REPO_ID`
- `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE`
- `VERCEL_GIT_COMMIT_AUTHOR_LOGIN`, `VERCEL_GIT_COMMIT_AUTHOR_NAME`
- `VERCEL_GIT_PREVIOUS_SHA`, `VERCEL_GIT_PULL_REQUEST_ID`
- `VERCEL_DEPLOYMENT_ID`, `VERCEL_PROJECT_ID`, `VERCEL_REGION`
- `VERCEL_OIDC_TOKEN` (when OIDC is enabled), `VERCEL_AUTOMATION_BYPASS_SECRET` (when configured), `VERCEL_SKEW_PROTECTION_ENABLED`

**Do not** expose any of these to the browser unless explicitly intended (e.g. `NEXT_PUBLIC_*` envs you set yourself).

---

## 6. Branch Protection Interaction

- Vercel deploys appear as a GitHub Check named **Vercel** (one per environment).
- Phase 0: do **not** add the Vercel check to required status checks. Foundation PRs skip via `vercel-ignore.sh` and the check stays neutral/ignored.
- Phase 1+: once the Next.js app is stable for two consecutive merges, owner may add `Vercel — Preview (FHE-EPMC)` to required checks per `docs/checklists/branch-protection-checklist.md`. Document the change in the Approval Ledger.
- Auto-merge interaction: Vercel must succeed before auto-merge fires only if the check is required. Otherwise auto-merge proceeds as soon as the explicit required checks pass.

---

## 7. Production Promotion (Release)

1. PR merged to `main` triggers a Vercel **Production** deploy.
2. Vercel posts a deployment status; the GitHub `production` Environment receives a deployment record.
3. The GitHub Environment `production` is configured with **Required reviewers** = Owner. Vercel cannot promote without that approval.
4. On approval, Vercel makes the new deploy live on the production custom domain.
5. Approval is recorded as a `production_deploy_approved` entry in the Governance Ledger; deploy completion as `production_deploy_completed`.
6. Rollback: in the Vercel dashboard, find the previous successful production deploy and **Promote to Production**. Record a `break_glass_override` ledger entry if the rollback bypasses the normal release flow.

---

## 8. Forks and External Contributors

- Forked PRs require **Authorize Deployment** clicks from a maintainer (Vercel Git Fork Protection, on by default).
- Until authorised, environment variables and OIDC tokens are *not* exposed to the deployment.
- Treat fork authorisation as a security action: only authorise after a code review of the PR.

---

## 9. Repository Dispatch Events for CI

Vercel sends `repository_dispatch` events on deploy state changes. Future GitHub Actions workflows (Phase 1+) can listen on:

- `vercel.deployment.success`
- `vercel.deployment.error`
- `vercel.deployment.ignored`
- `vercel.deployment.skipped`
- `vercel.deployment.promoted`

Useful for: end-to-end test orchestration, post-deploy smoke tests, governance ledger writes, Slack/email notifications.

> Note: `repository_dispatch` workflows must live on the default branch to fire. We do not ship one in Phase 0; it lands with Phase 5 (Release Governance).

---

## 10. Cost & Quota Hygiene

- Default plan: monitor build-minute consumption on the Vercel dashboard.
- The `ignoreCommand` is intentionally generous in skipping (Phase 0 + docs-only changes) to keep build-minute spend at zero until the app exists.
- Add `cleanUrls` and `trailingSlash` settings to `vercel.json` only if changed from the documented defaults; do not bloat the file.

---

## 11. Operational Runbook

| Symptom | Action |
|---|---|
| PR shows no Vercel comment | Check the project is connected; check `vercel-ignore.sh` did not skip the build (look for `vercel.deployment.ignored`). |
| Preview deploy fails on a foundation PR | Expected pre-Phase-1 only if `next.config.*` was added. Confirm `vercel-ignore.sh` returned 0 in the build log. |
| Forked PR deploy stalled | Maintainer must click **Authorize Deployment** in the PR. |
| Production deploy stuck | Check GitHub Environment approval queue — Owner must approve. |
| Wrong region | Update `vercel.json` `regions`. Does not retrigger past deploys. |
| Need to silence comments | Project Settings → Git → toggle off comment switches. Do not edit `github.silent` in `vercel.json` (deprecated). |
| Need to disable a branch's deploys | Add the branch to `git.deploymentEnabled` with `false`. Commit + merge. |

---

## 12. Audit & Evidence

Every Vercel deploy is captured implicitly via:
- The PR's deployment record (GitHub Deployments API).
- The `repository_dispatch` events (Phase 5 ingestion).
- The Vercel dashboard's deployment history.
- A ledger entry on production promotions.

For a release, the Evidence Lake bundle should include the deploy URL, the commit SHA, the deploy ID (`VERCEL_DEPLOYMENT_ID`), and the approver identity.

---

## 13. Out of Scope for Phase 0

Phase 0 ships only:
- `vercel.json`
- `.vercelignore`
- `.nvmrc`
- `scripts/vercel-ignore.sh`
- This runbook

Phase 1 introduces the actual Next.js app, real preview deploys, the `Vercel — Preview` required check (when stable), and the production environment wiring.
