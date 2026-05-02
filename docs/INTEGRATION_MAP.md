# FHE-EPMC Integration Map

> Tools, surfaces, signals, and the human gates between them.
> **Last updated:** 2026-05-01

This document enumerates every external tool FHE-EPMC integrates with, what signals it consumes, what actions it takes, and which human gates apply. It is the canonical reference for "where does X come from" questions.

---

## 1. Integration Inventory

| Tool | Type | Direction | Purpose | Human Gate |
|------|------|-----------|---------|------------|
| GitHub REST + GraphQL | API | Read/Write | PRs, checks, branches, releases, environments, comments | Branch protection + reviews |
| GitHub Actions | CI/CD | Read | CI status, workflow runs, artefacts | None for read |
| GitHub Apps — Claude Code | Agent | Read/Write | `@claude` triggers, auto-review, fix commits | PR review + merge |
| GitHub Apps — Cursor | Agent | Read/Write | Cursor agent dispatch, BugBot review | PR review + merge |
| GitHub Apps — Copilot | Suggestion | Read | PR review suggestions, IDE completion | Developer accept |
| Dependabot | Bot | Read/Write | Vulnerability + version PRs | PR review + merge |
| CodeQL | Scanner | Read | Static analysis findings | Triage by Security & Compliance |
| Anthropic API | LLM | Outbound | Direct Claude API calls (deep review, plan refresh) | Cost cap + RBAC |
| Cursor API | Agent | Outbound | Cursor agent dispatch | Cost cap + RBAC |
| GitHub Environments | Deploy | Read/Write | Environment protection rules, approvals | Manual approval (Owner) |
| Vercel | Hosting | Outbound | App hosting, preview deploys | Manual production promotion |
| Postgres | Persistence | Read/Write | Ledger, audit log, evidence index | Schema migrations gated |
| Object Store (Phase 3) | Storage | Read/Write | Evidence Lake artefacts | n/a (read controlled by RBAC) |
| OIDC IdP (Phase 4) | Identity | Inbound | SSO authentication | n/a |

---

## 2. Signal Sources Per Capability

### Live Control Tower
- GitHub REST + GraphQL (PRs, checks, branch protection state).
- Claude Code GitHub App (review state).
- Cursor BugBot (inline comment counts).
- Dependabot (alerts and PRs).
- CodeQL (findings count).
- GitHub Actions (workflow run status).

### Readiness Score Engine
- Branch protection state → `governance` axis.
- CodeQL findings → `security` axis.
- Dependabot alerts → `dependency` axis.
- CI pass rate (rolling 30 days) → `cicd` axis.
- Open blocker count → `delivery` axis.
- README/CLAUDE.md/MEMORY.md presence → `documentation` axis.
- Open Stripe webhook idempotency / SSO / DR posture (per-repo manual flags) → `operational` axis.

### Plan Refresh Engine
- Current `DELIVERY_PLAN.md` (parsed).
- Latest scan run report.
- UAT records since last refresh.
- Ledger entries since last refresh.

### Cost Meter
- Anthropic API usage logs (per workspace).
- Cursor API usage logs (per operator).
- GitHub Actions minutes (org-level billing API).

---

## 3. Triggers and Branches

| Trigger | Surface | Branch Convention | Output |
|---------|---------|-------------------|--------|
| `cursor` label on issue | Cursor agent | `cursor/issue-N` | Branch + PR + tracking comment |
| `@cursor` comment | Cursor agent (read-only when `q:`/`explain:`) | `cursor/issue-N` or none | PR or comment |
| Manual dispatch (`cursor-agent-manual.yml`) | Cursor agent | `cursor/manual-N` | Branch + PR |
| `@claude` comment | Claude Code | `claude/task-N` or PR fix commit | Branch/commit |
| PR open/sync | Claude auto-review | n/a | Inline comments |
| Schedule (cron) | Repo intelligence scan | n/a | Scan artefact + ledger entry |
| Manual dispatch (`repo-intelligence-scan.yml`) | Repo intelligence scan | n/a | Scan artefact |

---

## 4. Refusal Boundaries (per Tool)

| Tool | Will refuse / requires human review |
|------|--------------------------------------|
| Claude Code | Schema migrations; auth/RBAC/session middleware; secrets; >5-file changes; CI/CD workflow changes in portfolio repos; production deploys |
| Cursor agent | Schema migrations; auth/RBAC; payments/finance/marks retention; new external integrations; CI/CD changes; real PII or production credentials |
| Dependabot | n/a (passive); merges still require human approval |
| CodeQL | n/a (read-only) |
| Copilot | n/a (suggestion only) |

---

## 5. Secrets Inventory

| Secret | Surface | Owner | Rotation | Notes |
|--------|---------|-------|----------|-------|
| `ANTHROPIC_API_KEY` | GitHub Actions secret | Owner | Quarterly | Used by `claude.yml`, `claude-auto-review.yml` |
| `CURSOR_API_KEY` | GitHub Actions secret | Owner | Quarterly | Used by `cursor-agent-manual.yml` |
| GitHub App private keys | GitHub App settings | Owner | Yearly or on incident | Claude Code GitHub App, Cursor GitHub App |
| Postgres connection (Phase 1+) | Vercel encrypted env | Owner | Quarterly | Never committed |
| Object store credentials (Phase 3+) | Vercel encrypted env | Owner | Quarterly | Never committed |
| OIDC client secret (Phase 4+) | Vercel encrypted env | Owner | Yearly | Never committed |

No secret is ever included in any committed file. The only secrets-shaped strings allowed in this repo are placeholder names (e.g. `ANTHROPIC_API_KEY` referenced by name in workflows).

---

## 6. Per-Repo Wiring (Portfolio)

For each portfolio repo, the following must be wired identically via `scripts/setup-repo-standards.*`:

- `.github/workflows/claude.yml`
- `.github/workflows/claude-auto-review.yml`
- `.github/workflows/cursor-agent-manual.yml`
- `.github/workflows/ci.yml`
- `.github/dependabot.yml`
- `.github/ISSUE_TEMPLATE/*` (canonical set)
- `.github/PULL_REQUEST_TEMPLATE/*` and root `pull_request_template.md`
- `.cursor/agents/FHE-Agent.md`
- `.cursor/rules/fhe-conventions.mdc`
- `.cursor/environment.json`
- `CLAUDE.md`, `MEMORY.md`

GitHub-side settings to be applied per repo (manual or via API where permissions allow):
- Branch protection on `main` (PR required, ≥ 1 approving review, CI must pass, up-to-date branch).
- Dependabot security + version updates enabled.
- CodeQL scanning enabled.
- GitHub Environments: `development`, `staging`, `production` with `production` protected.
- Auto-delete head branches enabled.
- Auto-merge enabled (gated on required checks + approval).

---

## 7. Out-of-Band Manual Steps

These cannot be automated and must be performed by the owner:

1. Create `ANTHROPIC_API_KEY`, `CURSOR_API_KEY` repo secrets.
2. Install Claude Code GitHub App on this repo and on every portfolio repo.
3. Install Cursor GitHub App on this repo and on every portfolio repo.
4. Enable BugBot in Cursor Settings → BugBot.
5. Set Cursor billing cap at https://cursor.com/settings/billing.
6. Configure GitHub Environments protection rules.
7. Approve initial branch protection rule.
