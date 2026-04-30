# MEMORY.md — FHE Enterprise Production Management Centre

> This file maintains continuity across Claude Code sessions.
> **Update this file at the end of every session** with what was done, what was decided, and what comes next.

---

## Current State

**Last Updated**: 2026-05-01
**Current Phase**: Phase 0 — Foundation Build
**Active Focus**: Establishing FHE-EPMC repo structure, core docs, agent configs, GitHub workflows
**Owner**: Freddie Finn (RJK134 / Future Horizons Education)

---

## Product Background

### Origin Story
The FHE-EPMC evolved from the **Perplexity Computer Production Delivery Command Centre**, which reached 62/100 enterprise readiness after extensive development (~13,000+ Perplexity credits). A formal UAT review on 29/04/2026 concluded the product is an "executable specification rather than a live orchestrator" — most value-creating capabilities (PR control tower, review-resolution bot, evidence/memory lake, Claude bridge, plan refresh engine, UAT portal) were flagged partial or missing.

**Decision**: Rebuild as a GitHub-native system with real API integrations rather than a hosted iframe application simulating state.

### What to Carry Forward from the Perplexity Build
- 14-step lifecycle model ✓
- Governance-first, human-gated pattern ✓
- Capacity handoff pack structure ✓
- Evidence/memory model design ✓
- Human gates enumeration ✓
- Claude prompt execution policy pattern ✓
- P0/P1/P2 blocker decomposition approach ✓
- Tranche A→D delivery structure for SJMS-2.5 ✓

---

## Portfolio Snapshot

| Product | Repo | Readiness | P0 Blockers |
|---------|------|-----------|-------------|
| SJMS 2.5 | RJK134/SJMS-2.5 | 72/100 | Branch protection gaps, plaintext webhook/session secrets, no transactional outbox/DLQ, static JWT fallback |
| EquiSmile | RJK134/EquiSmile | 63/100 | Multi-tenancy, identity/SSO gaps, CI/DB gaps, dependency hardening |
| HERM Platform | RJK134/herm-platform | 70/100 | SSO/MFA, revocable sessions, Stripe webhook completeness, observability |
| FHE-EPMC | RJK134/FHE-Enterprise-Production-Management | Building | Foundation files being established |

---

## Session Log

### 2026-05-01 — Foundation Session (Session 1)
**Objective**: Push all foundational files to establish FHE-EPMC repo as source of truth
**Actions**:
- Pushed README.md (comprehensive product overview, lifecycle, tool stack)
- Pushed CLAUDE.md (Claude Code conventions, production gate, session protocols, guard rails)
- Pushed MEMORY.md (this file — session continuity)
- Pushed SKILLS.md (agent capability registry, routing decision tree, universal setup checklist)
- Pushed docs/ (PRODUCT_SPECIFICATION.md, DELIVERY_PLAN.md, ARCHITECTURE.md, INTEGRATION_MAP.md, PROMPTS_LIBRARY.md, checklists)
- Pushed .github/ (workflows: claude.yml, claude-auto-review.yml, cursor-agent.yml, cursor-agent-manual.yml, ci.yml, dependabot.yml; issue templates; PR template)
- Pushed .cursor/ (FHE-Agent.md persona, fhe-conventions.mdc rules, environment.json)
- Pushed scripts/ (setup-repo-standards.sh, deploy-cursor-agent.sh, setup-review-intelligence.sh)

**PRs Opened**: None (direct push to main for foundation)

**Next Steps** (Priority Order):
1. Add `ANTHROPIC_API_KEY` secret to repo: Settings → Secrets → Actions
2. Add `CURSOR_API_KEY` secret to repo: Settings → Secrets → Actions
3. Run `/install-github-app` in Claude Code CLI inside this repo
4. Enable branch protection on `main` (require PR, 1 review, CI pass)
5. Create GitHub Environments: `development`, `staging`, `production`
6. Run `./scripts/deploy-cursor-agent.sh --repo RJK134/EquiSmile`
7. Run `./scripts/deploy-cursor-agent.sh --repo RJK134/herm-platform`
8. Open Claude Code session: use Prompt 1 from PROMPTS_LIBRARY.md (Tranche A SJMS-2.5 hardening)
9. Start Phase 1 dashboard build (see docs/DELIVERY_PLAN.md Phase 1)
10. Resolve FutureHorizonsEducation org access

---

## Known Blockers Requiring Manual Resolution

| Blocker | Impact | Resolution Path | Status |
|---------|--------|-----------------|--------|
| `ANTHROPIC_API_KEY` not set | Claude Code GitHub Action won't run | Add to repo secrets | ⏳ Open |
| `CURSOR_API_KEY` not set | Cursor agent won't dispatch | Add to repo secrets | ⏳ Open |
| Claude GitHub App not installed | @claude mentions won't work | Run `/install-github-app` in Claude Code CLI | ⏳ Open |
| Cursor GitHub App not on all repos | BugBot won't review PRs | Install via cursor.com/settings/integrations | ⏳ Open |
| Branch protection not enabled | Agents can push directly to main | Settings → Branches → Add rule for `main` | ⏳ Open |
| FutureHorizonsEducation org access | Cannot scan FHE org repos | Correct org permissions | ⏳ Open |
| Local Windows Claude history path | Cannot read `C:\Users\...` from hosted app | Export bundles and upload to evidence store | ⏳ Open |
| PR #149 SJMS-2.5 | BugBot conversation unresolved, needs 1 approving review | Resolve conversation + approve or bypass rule | ⏳ Open |

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|----------|
| 2026-04-30 | Abandon Perplexity Computer as primary tool | Product is scaffold only after 13k+ credits; no live connectors; UI defects; cannot read local Windows paths |
| 2026-04-30 | FHE-EPMC to be GitHub-native | Real PR control tower requires live GitHub API access, not simulated state |
| 2026-04-30 | Universal Cursor Agent pattern from SJMS-2.5 | Proven pattern, ~$0.30/task, integrates with existing GitHub workflow |
| 2026-04-30 | Human gate on all merges, releases, deploys | Non-negotiable for enterprise — GDPR, data integrity, security posture |
| 2026-05-01 | Single repo as source of truth for all FHE standards | CLAUDE.md, MEMORY.md, SKILLS.md, workflow templates sourced from this repo |

---

## Cost Controls

| Resource | Limit | Where to Set |
|----------|-------|-------------|
| Cursor Background Agents | $25/month cap | https://cursor.com/settings/billing |
| Claude Code API (ANTHROPIC_API_KEY) | Monitor usage | https://console.anthropic.com/usage |
| GitHub Actions minutes | Monitor in org settings | GitHub → Settings → Billing |

---

## Evidence References

| Document | Key Finding | Relevance |
|----------|-------------|----------|
| Production-Delivery-Command-Centre-UAT-Review290426.MD | 62/100 readiness, 16 capability gaps, 7 security concerns | Defines what FHE-EPMC must build |
| SJMS-2.5-Agent-Explanation.txt | Cursor agent pattern — 4 invocation methods, costs, guard rails | Universal agent blueprint |
| Enterprise-Build-System-Full-History.docx | Full history of build attempts, repo assessments, Claude Code prompts | Context for all prior decisions |
| cursor-agent-manual.yml | Working Cursor manual dispatch workflow | Direct source for workflow template |
