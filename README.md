# FHE Enterprise Production Management Centre (FHE-EPMC)

> **The single pane of glass for planning, building, reviewing, iterating, testing, and releasing all Future Horizons Education products — powered by Claude Code, GitHub PRO, Cursor Pro+, GitHub Copilot, and the universal FHE-Agent pattern.**

[![Enterprise Readiness](https://img.shields.io/badge/Enterprise%20Readiness-Building-orange)](#)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Integrated-blueviolet)](#)
[![Cursor Agent](https://img.shields.io/badge/Cursor%20Agent-Universal-blue)](#)
[![GitHub PRO](https://img.shields.io/badge/GitHub-PRO-black)](#)

---

## What Is This?

The **FHE Enterprise Production Management Centre (FHE-EPMC)** is the master control and orchestration layer for all Future Horizons Education product development. It supersedes and integrates:

- The **Perplexity Computer Production Delivery Command Centre** (v1 — scaffold/spec state, 62/100 enterprise readiness)
- The **SJMS-2.5 Cursor Agent** (universal agent pattern rolled out to all repos)
- The **SJMS Repo Intelligence Dashboard** (universal repo health monitoring)
- The **GitHub CLI template and issue/PR automation scripts**
- The **Review Intelligence v5 setup** (milestones, labels, epics, checklists)

It is a **GitHub-native, code-driven, human-gated enterprise delivery management system** with a companion React dashboard that calls real GitHub APIs rather than simulating state.

---

## Core Products Under Management

| Product | Repo | Current Readiness | Stage |
|---------|------|-------------------|-------|
| SJMS 2.5 | [RJK134/SJMS-2.5](https://github.com/RJK134/SJMS-2.5) | 72/100 | Tranche A hardening |
| EquiSmile | [RJK134/EquiSmile](https://github.com/RJK134/EquiSmile) | 63/100 | Phase 17 stabilise |
| HERM Platform | [RJK134/herm-platform](https://github.com/RJK134/herm-platform) | 70/100 | Phase 1 hardening PRs |
| FHE-EPMC | [RJK134/FHE-Enterprise-Production-Management](https://github.com/RJK134/FHE-Enterprise-Production-Management) | Building | Phase 0 — Foundation |

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
├── dashboard/                         # FHE-EPMC React dashboard application
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
| 1 | **Intake** | Add repo to portfolio registry with owner, stack, compliance tier |
| 2 | **Evidence** | Upload Claude history bundles, audit reports, spec documents |
| 3 | **Deep Scan** | Automated + manual repo review against enterprise readiness criteria |
| 4 | **Gap Analysis** | Enterprise readiness score (0–100) with P0/P1/P2 blocker decomposition |
| 5 | **Plan** | Phased delivery roadmap with tranches and priorities |
| 6 | **Prompt Gate** | Generate rigorous Claude Code prompt per blocker (10k+ chars target) |
| 7 | **Agent Task** | Dispatch Cursor or Claude agent to scoped branch |
| 8 | **Build** | Agent writes, commits, pushes to `cursor/issue-N` or `claude/task-N` |
| 9 | **PR Review** | CI + BugBot + Copilot + Dependabot + human reviewer |
| 10 | **Resolve** | Address all review comments, push fix commits, re-run checks |
| 11 | **UAT** | Stakeholder testing with evidence capture |
| 12 | **Refresh Plan** | Update delivery plan based on PR evidence and UAT results |
| 13 | **Merge** | Human-approved only — never automated |
| 14 | **Release** | Tag, environment deploy, release notes, client-facing artefacts |

---

## Human Gates — Never Automated

The following require explicit human approval. No agent, bot, workflow, or script may bypass these:

- ✋ PR merge to `main`
- ✋ Production environment deployment
- ✋ Schema migrations (`prisma/schema.prisma` changes)
- ✋ Auth / RBAC / session middleware changes
- ✋ Secret rotation or credential changes
- ✋ External integration setup (OAuth, Stripe, Azure AD)
- ✋ Paid agent actions above monthly threshold
- ✋ Break-glass overrides (require written justification)

---

## Tool Stack

| Tool | Role | Human Gate? |
|------|------|-------------|
| Claude Code (Claude Max) | Primary build agent, PR review, fix commits | PR review + merge |
| Cursor Pro+ Background Agents | Scoped implementation tasks | PR review + merge |
| Cursor BugBot | Automated PR bug detection | Resolve/dismiss |
| GitHub Copilot | IDE suggestions, PR review assist | Dismiss suggestions |
| Dependabot | Dependency security + version updates | PR review + merge |
| GitHub Actions / CI | Lint, typecheck, test, build gates | Merge blocked on failure |
| GitHub Environments | dev / staging / production isolation | Production deploy approval |
| FHE-EPMC Dashboard | Orchestration visibility & control | All merge/deploy gates |

---

## Getting Started

```bash
# 1. Clone this repo
git clone https://github.com/RJK134/FHE-Enterprise-Production-Management.git
cd FHE-Enterprise-Production-Management

# 2. Read CLAUDE.md before starting any Claude Code session
cat CLAUDE.md

# 3. Deploy FHE standards to a portfolio repo
./scripts/setup-repo-standards.sh --repo RJK134/YOUR-REPO

# 4. Deploy the universal Cursor agent to a repo
./scripts/deploy-cursor-agent.sh --repo RJK134/YOUR-REPO
```

---

## Manual Setup Required (Cannot Be Automated)

Before the system is fully operational, complete these manually:

- [ ] Add `ANTHROPIC_API_KEY` secret: repo Settings → Secrets → Actions
- [ ] Add `CURSOR_API_KEY` secret: repo Settings → Secrets → Actions
- [ ] Run `/install-github-app` in Claude Code CLI to wire Claude GitHub App
- [ ] Enable branch protection on `main` (require PR, 1 review, CI pass)
- [ ] Create GitHub Environments: `development`, `staging`, `production`
- [ ] Correct FutureHorizonsEducation org permissions for full portfolio scanning
- [ ] Set Cursor billing cap: https://cursor.com/settings/billing → $25/month

---

## Licence

Private — Future Horizons Education. All rights reserved.
