# FHE Enterprise Production Management Centre (FHE-EPMC)

> **The single pane of glass for planning, building, reviewing, iterating, testing, and releasing all Future Horizons Education products — powered by Claude Code, GitHub PRO, Cursor Pro+, GitHub Copilot, and the universal FHE-Agent pattern.**

[![Enterprise Readiness](https://img.shields.io/badge/Enterprise%20Readiness-Building-orange)](#)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Integrated-blueviolet)](#)
[![Cursor Agent](https://img.shields.io/badge/Cursor%20Agent-Universal-blue)](#)
[![GitHub PRO](https://img.shields.io/badge/GitHub-PRO-black)](#)

---

## What Is This?

The **FHE Enterprise Production Management Centre (FHE-EPMC)** is the master orchestration and control layer for all Future Horizons Education product development. It supersedes and integrates:

- The **Perplexity Computer Production Delivery Command Centre** (v1 — scaffold/spec state, 62/100 enterprise readiness)
- The **SJMS-2.5 Cursor Agent** (universal agent pattern deployed to all repos)
- The **SJMS Repo Intelligence Dashboard** (universal repo health monitoring)
- The **GitHub CLI template and issue/PR automation scripts**
- The **Review Intelligence v5 setup** (milestones, labels, epics, checklists)

This is not a hosted iframe app — it is a **GitHub-native, code-driven, human-gated enterprise delivery management system** with a companion React dashboard calling real GitHub APIs.

---

## Core Products Under Management

| Product | Repo | Readiness | Stage |
|---------|------|-----------|-------|
| SJMS 2.5 | [RJK134/SJMS-2.5](https://github.com/RJK134/SJMS-2.5) | 72/100 | Tranche A hardening |
| EquiSmile | [RJK134/EquiSmile](https://github.com/RJK134/EquiSmile) | 63/100 | Phase 17 stabilise |
| HERM Platform | [RJK134/herm-platform](https://github.com/RJK134/herm-platform) | 70/100 | Phase 1 hardening PRs |
| FHE-EPMC | [RJK134/FHE-Enterprise-Production-Management](https://github.com/RJK134/FHE-Enterprise-Production-Management) | Building | Phase 0 Foundation |

---

## Repository Structure

```
FHE-Enterprise-Production-Management/
├── README.md                          # This file
├── CLAUDE.md                          # Claude Code build conventions
├── MEMORY.md                          # Build memory & context continuity
├── SKILLS.md                          # Agent skills & capability registry
├── docs/
│   ├── PRODUCT_SPECIFICATION.md       # Full product spec
│   ├── DELIVERY_PLAN.md               # Phased delivery roadmap
│   ├── ARCHITECTURE.md                # System architecture
│   ├── INTEGRATION_MAP.md             # Tool integration mapping
│   ├── PROMPTS_LIBRARY.md             # Reusable Claude Code prompts
│   └── checklists/                    # Delivery & PR checklists
├── .github/
│   ├── ISSUE_TEMPLATE/                # Structured issue forms
│   ├── PULL_REQUEST_TEMPLATE/         # PR templates
│   └── workflows/                     # GitHub Actions CI/CD
├── .cursor/
│   ├── agents/                        # Cursor agent personas
│   └── rules/                         # Always-on coding conventions
├── dashboard/                         # FHE-EPMC React dashboard app
│   └── src/
└── scripts/                           # Setup & automation scripts
    ├── setup-repo-standards.sh
    ├── deploy-cursor-agent.sh
    └── setup-review-intelligence.sh
```

---

## The 14-Step Universal Delivery Lifecycle

Every product follows this identical lifecycle regardless of which repo is active:

1. **Intake** — Add repo to FHE-EPMC portfolio registry
2. **Evidence** — Upload Claude history, PRs, CI results, audit logs
3. **Deep Scan** — Run repo intelligence scan (universal agent pattern)
4. **Gap Analysis** — Generate enterprise readiness score & blocker list
5. **Plan** — Create phased delivery plan with P0/P1/P2 priorities
6. **Prompt Gate** — Generate rigorous Claude Code prompts per blocker
7. **Agent Task** — Dispatch Cursor/Claude agent to scoped branch
8. **Build** — Agent writes, commits to `cursor/issue-N` or `claude/task-N` branch
9. **PR Review** — CI + BugBot + Copilot + Dependabot + human review
10. **Resolve** — Address all review comments, push fix commits, re-run checks
11. **UAT** — Stakeholder testing with evidence capture
12. **Refresh Plan** — Update delivery plan based on evidence and UAT results
13. **Merge** — Human-approved only — never automated
14. **Release** — Tag, environment deploy, release notes, client-facing artefacts

---

## Human Gates (Never Automated)

The following require explicit human approval — no agent, bot, or automation may bypass:

- ✋ PR merge to `main`
- ✋ Production deployment
- ✋ Schema migrations
- ✋ Auth/RBAC/session middleware changes
- ✋ Secret rotation or credential changes
- ✋ External integration setup
- ✋ Paid agent actions above threshold
- ✋ Break-glass overrides (require written justification)

---

## Tool Stack

| Tool | Role | Human Gate? |
|------|------|-------------|
| Claude Code (Claude Max) | Primary build agent, PR review, fix commits | PR review + merge |
| Cursor Pro+ Background Agents | Scoped implementation tasks | PR review + merge |
| Cursor BugBot | Automated PR bug detection | Resolve/dismiss |
| GitHub Copilot | IDE suggestions, PR review | Dismiss suggestions |
| Dependabot | Dependency security updates | PR review + merge |
| GitHub Actions / CI | Lint, typecheck, test, build gates | Merge blocked on failure |
| GitHub Environments | dev / staging / production isolation | Production deploy approval |
| FHE-EPMC Dashboard | Orchestration visibility layer | All merge/deploy gates |

---

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/RJK134/FHE-Enterprise-Production-Management.git
cd FHE-Enterprise-Production-Management

# 2. Read CLAUDE.md before any Claude Code session
cat CLAUDE.md

# 3. Install dependencies and run the dashboard locally
npm install
cp .env.example .env.local   # then fill in GITHUB_TOKEN etc.
npm run dev                  # http://localhost:3000

# 4. Run the canonical CI gate locally
npm run lint && npm run typecheck && npm test && npm run build

# 5. Apply FHE governance baseline to a portfolio repo
./scripts/setup-repo-standards.sh --repo RJK134/YOUR-REPO

# 6. Set up Review Intelligence (labels, milestones, epics)
./scripts/setup-review-intelligence.sh --repo RJK134/YOUR-REPO
```

---

## Dashboard (Phase 1 Live Control Tower MVP)

The Next.js 14/15 App Router dashboard ships in `src/`:

- `/` — portfolio overview with **live readiness signals** (CodeQL, Dependabot, branch protection) when `GITHUB_TOKEN` is configured; falls back to the registry estimate otherwise.
- `/repos/[slug]` — per-repo drill-down: readiness axis breakdown + open PR list with check status.
- `/repos/[slug]/pulls/[number]` — per-PR drill-down: merge-readiness verdict, full check-run list, review summary, branch-protection requirements.

All GitHub calls are **server-side only**; no token is exposed to the browser. The `server-only` import marker is on every service module. Per-repo drill-downs and PR drill-downs are gated by the `PORTFOLIO_ALLOWLIST` env var.

### Environment variables

| Variable | Purpose | Required? |
|---|---|---|
| `GITHUB_TOKEN` | Server-side PAT or App-installation token. Scopes: `Pull requests: read`, `Checks: read`, `Contents: read`, `Administration: read` (for branch protection), `Dependabot alerts: read`, `Code scanning alerts: read`, `Metadata: read`. | Strongly recommended (without it, all signals fall back to registry estimate). |
| `GITHUB_API_URL` | Override for GitHub Enterprise Server. | Optional. |
| `PORTFOLIO_ALLOWLIST` | Comma-separated `owner/name` list permitted to drill down into. | Required to enable drill-downs. |
| `DASHBOARD_BASIC_AUTH_USER` / `DASHBOARD_BASIC_AUTH_PASS` | HTTP Basic Auth gate (Phase 1 placeholder; SSO replaces in Phase 4). | Required in production. |
| `DASHBOARD_AUTH_DISABLED` | Set to `1` only for local dev to bypass the auth wall. | Optional. |

See `.env.example` for the canonical template.

### Deploying

Deployment is on **Vercel for GitHub** per `docs/process/vercel-integration.md`. Phase-0-aware `scripts/vercel-ignore.sh` skips builds when there is no Next.js app present, when the diff is docs-only, or in early branch states; otherwise builds proceed normally. Branch protection on `main` and the GitHub Environment `production` manual approval gate every release.

---

## Mandatory First Steps (Manual — Cannot Be Automated)

1. Add `ANTHROPIC_API_KEY` secret → Settings → Secrets → Actions
2. Add `CURSOR_API_KEY` secret → Settings → Secrets → Actions  
3. Run `/install-github-app` inside a Claude Code session in this repo
4. Enable branch protection on `main` → Settings → Branches
5. Create GitHub Environments: `development`, `staging`, `production`
6. Set Cursor billing cap: https://cursor.com/settings/billing → $25/month

---

## Licence

Private — Future Horizons Education. All rights reserved.
