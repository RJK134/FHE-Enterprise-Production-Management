# FHE Enterprise Production Management Centre (FHE-EPMC)

> **The single pane of glass for planning, building, reviewing, iterating, testing, and releasing all Future Horizons Education products — powered by Claude Code, GitHub PRO, Cursor Pro+, GitHub Copilot, and the SJMS-Agent pattern.**

[![Enterprise Readiness](https://img.shields.io/badge/Enterprise%20Readiness-Building-orange)](#)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Integrated-blueviolet)](#)
[![Cursor Agent](https://img.shields.io/badge/Cursor%20Agent-Universal-blue)](#)
[![GitHub PRO](https://img.shields.io/badge/GitHub-PRO-black)](#)

---

## What Is This?

The **FHE Enterprise Production Management Centre (FHE-EPMC)** is the master orchestration layer for all Future Horizons Education product development. It supersedes and integrates:

- The **Perplexity Computer Production Delivery Command Centre** (v1 — scaffold/spec state, ~62/100 enterprise readiness)
- The **SJMS-2.5 Cursor Agent** (universal agent pattern rolled out to all repos)
- The **SJMS Repo Intelligence Dashboard** (universal repo health monitoring)
- The **GitHub CLI template and issue/PR automation scripts**
- The **Review Intelligence v5 setup** (milestones, labels, epics, checklists)

This is not a replacement UI tool built in Perplexity Computer. It is a **GitHub-native, code-driven, human-gated enterprise delivery management system** with a companion dashboard application that calls real GitHub APIs.

---

## Core Products Under Management

| Product | Repo | Current Readiness | Stage |
|---------|------|-------------------|-------|
| SJMS 2.5 | [RJK134/SJMS-2.5](https://github.com/RJK134/SJMS-2.5) | 72/100 | Tranche A hardening |
| EquiSmile | [RJK134/EquiSmile](https://github.com/RJK134/EquiSmile) | 63/100 | Phase 17 stabilise |
| HERM Platform | [RJK134/herm-platform](https://github.com/RJK134/herm-platform) | 70/100 | Phase 1 hardening PRs |
| FHE-EPMC | [RJK134/FHE-Enterprise-Production-Management](https://github.com/RJK134/FHE-Enterprise-Production-Management) | Building | Foundation |

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
├── dashboard/                         # FHE-EPMC dashboard application
│   └── src/
└── scripts/                           # Setup & automation scripts
    ├── setup-repo-standards.sh
    ├── deploy-cursor-agent.sh
    └── setup-review-intelligence.sh
```

---

## The 14-Step Universal Delivery Lifecycle

Every product in the FHE portfolio follows this identical lifecycle:

| Step | Name | Description |
|------|------|-------------|
| 1 | **Intake** | Add repo to FHE-EPMC portfolio registry |
| 2 | **Evidence** | Upload Claude history, PRs, CI results, audit logs |
| 3 | **Deep Scan** | Run repo intelligence scan |
| 4 | **Gap Analysis** | Generate enterprise readiness score & blocker list |
| 5 | **Plan** | Create phased delivery plan with P0/P1/P2 priorities |
| 6 | **Prompt Gate** | Generate rigorous Claude Code prompts per blocker |
| 7 | **Agent Task** | Dispatch Cursor/Claude agent to scoped branch |
| 8 | **Build** | Agent builds, commits to `cursor/issue-N` or `claude/task-N` branch |
| 9 | **PR Review** | CI + BugBot + Copilot + Dependabot + human review |
| 10 | **Resolve** | Address all review comments, re-run checks |
| 11 | **UAT** | Stakeholder testing via UAT portal |
| 12 | **Refresh Plan** | Update delivery plan based on evidence |
| 13 | **Merge** | Human-approved merge to main (NEVER automated) |
| 14 | **Release** | Tag, release notes, environment deployment |

---

## Human Gates — Never Automated

The following require explicit human approval. No agent, bot, or automation may bypass these:

- ✋ PR merge to `main`
- ✋ Production deployment
- ✋ Schema migrations
- ✋ Auth/RBAC changes
- ✋ Secret rotation
- ✋ Paid agent actions above threshold
- ✋ External communications
- ✋ Break-glass overrides

---

## Tool Stack

| Tool | Role | Human Gate Required? |
|------|------|---------------------|
| Claude Code (Claude Max) | Primary build agent, PR review, fix commits | PR review + merge |
| Cursor Pro+ Background Agents | Scoped implementation tasks | PR review + merge |
| Cursor BugBot | Automated PR bug review | Resolve/dismiss |
| GitHub Copilot | IDE suggestions, PR review | Dismiss suggestions |
| Dependabot | Dependency security & version updates | PR review + merge |
| GitHub Actions / CI | Lint, typecheck, test, build gates | Merge blocked on failure |
| GitHub Environments | dev / staging / production isolation | Production deploy approval |
| FHE-EPMC Dashboard | Orchestration visibility & control | All merge/deploy gates |

---

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/RJK134/FHE-Enterprise-Production-Management.git
cd FHE-Enterprise-Production-Management

# 2. Read CLAUDE.md before running any Claude Code sessions
cat CLAUDE.md

# 3. Read the current delivery plan
cat docs/DELIVERY_PLAN.md

# 4. Deploy FHE standards to a new repo
./scripts/setup-repo-standards.sh --repo RJK134/YOUR-REPO

# 5. Deploy the universal Cursor agent to a repo
./scripts/deploy-cursor-agent.sh --repo RJK134/YOUR-REPO
```

---

## Manual Setup Required (One-Time)

The following require manual action before full automation is enabled:

1. Add `ANTHROPIC_API_KEY` secret: Settings → Secrets and variables → Actions
2. Add `CURSOR_API_KEY` secret: Settings → Secrets and variables → Actions
3. Run `/install-github-app` inside a Claude Code CLI session to wire the Claude GitHub App
4. Install Cursor GitHub App at cursor.com/settings/integrations
5. Enable branch protection on `main`: require PR + 1 review + CI pass
6. Create GitHub Environments: `development`, `staging`, `production`
7. Resolve FutureHorizonsEducation org access for full portfolio coverage

---

## Key Documentation

- [Product Specification](docs/PRODUCT_SPECIFICATION.md)
- [Delivery Plan](docs/DELIVERY_PLAN.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Integration Map](docs/INTEGRATION_MAP.md)
- [Claude Code Prompts Library](docs/PROMPTS_LIBRARY.md)
- [CLAUDE.md — Build Conventions](CLAUDE.md)
- [MEMORY.md — Session Continuity](MEMORY.md)
- [SKILLS.md — Agent Registry](SKILLS.md)

---

## Licence

Private — Future Horizons Education. All rights reserved.
