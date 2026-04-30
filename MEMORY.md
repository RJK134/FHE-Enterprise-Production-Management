# MEMORY.md — FHE Enterprise Production Management Centre

> Session continuity file. Updated at the end of every Claude Code session.
> Read this at the start of every session before writing any code.

---

## Active Context

**Last Updated**: 2026-05-01  
**Current Phase**: Phase 0 — Foundation Build  
**Sprint Focus**: Establishing FHE-EPMC repo structure, core docs, agent configs, GitHub workflows  
**Owner**: Freddie Finn (RJK134 / Future Horizons Education)  
**Primary Contact Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## Product Origin & Context

FHE-EPMC evolved from the **Perplexity Computer Production Delivery Command Centre**, which after extensive development (~13,000+ credits spent) reached an honest 62/100 enterprise readiness score. A formal UAT review on 29/04/2026 by a 15-year enterprise IT delivery professional found:

- **Strengths to preserve**: 14-step lifecycle model, governance-first pattern, capacity handoff pack structure, evidence/memory model design, human gates enumeration, Claude prompt execution policy
- **Critical gaps**: No live PR control tower, dropdown↔pane state sync bug, no RBAC, no audit log, no SSO, FutureHorizonsEducation org access blocked, no run drill-down
- **Decision**: Rebuild as GitHub-native tool with real GitHub API integrations, not a hosted iframe app

---

## Portfolio Snapshot

| Product | Repo | Readiness | Current Blocker | Active Tranche/Phase |
|---------|------|-----------|----------------|---------------------|
| SJMS 2.5 | RJK134/SJMS-2.5 | 72/100 | Branch protection gaps, plaintext webhook/session secrets, no transactional outbox/DLQ | Tranche A (P0) |
| EquiSmile | RJK134/EquiSmile | 63/100 | Multi-tenancy, identity gaps, CI/DB, dependency gaps | Phase 17 Stabilise |
| HERM Platform | RJK134/herm-platform | 70/100 | SSO/MFA, revocable sessions, Stripe webhook completeness, observability | Phase 1 Close open hardening PRs |
| FHE-EPMC | RJK134/FHE-Enterprise-Production-Management | Foundation | Secrets not yet configured, no CI, no dashboard app yet | Phase 0 |

---

## SJMS-Agent Pattern (Universal — Proven)

The SJMS-2.5 Cursor Agent pattern is the proven foundation for all repos:
- **Lives in**: `.github/workflows/cursor-agent.yml` + `cursor-agent-manual.yml`
- **Invoked via**: `cursor` label on issue, `@cursor` / `q:` / `explain:` comment, manual `workflow_dispatch`
- **Output**: Branch `cursor/issue-N`, PR, tracking comment on issue
- **Persona**: `.cursor/agents/SJMS-Agent.md` → to become `FHE-Agent.md` (universal)
- **Guard rails**: Refuses schema migrations, auth changes, PII, CI/CD config, external integrations
- **Cost**: ~$0.30/task; set $25/month cap at https://cursor.com/settings/billing
- **Read-only mode**: `@cursor explain` / `q:` → posts answer as comment, no branch created

---

## Session Log

### 2026-05-01 — Phase 0 Foundation
- **Objective**: Establish FHE-EPMC repo foundational file structure
- **Files Pushed**: README.md, CLAUDE.md, MEMORY.md, SKILLS.md, full docs/ suite, .github/ workflows and templates, .cursor/ agent config, scripts/
- **PRs**: Direct push to main for foundation (no prior branch protection)
- **Next Steps**:
  1. Add `ANTHROPIC_API_KEY` and `CURSOR_API_KEY` secrets to repo
  2. Run `/install-github-app` in Claude Code CLI session inside this repo
  3. Enable branch protection on `main`
  4. Set up GitHub Environments: development, staging, production
  5. Run `scripts/deploy-cursor-agent.sh --repo RJK134/EquiSmile`
  6. Run `scripts/deploy-cursor-agent.sh --repo RJK134/herm-platform`
  7. Start Phase 1: dashboard application skeleton
  8. Resolve FutureHorizonsEducation org access for full portfolio coverage

---

## Known Manual Blockers

| Blocker | Impact | Resolution | Status |
|---------|--------|------------|--------|
| `ANTHROPIC_API_KEY` secret not set | Claude Code GitHub Action won't run | Settings → Secrets → Actions → New secret | ⚠️ Open |
| `CURSOR_API_KEY` secret not set | Cursor agent won't dispatch | Settings → Secrets → Actions → New secret | ⚠️ Open |
| Claude GitHub App not installed | `@claude` comments and auto-review won't trigger | Run `/install-github-app` in Claude Code CLI | ⚠️ Open |
| Cursor GitHub App not installed | BugBot won't run on PRs | cursor.com/settings/integrations → Install on repos | ⚠️ Open |
| Branch protection not enabled on main | Agents can push directly to main | Settings → Branches → Add rule | ⚠️ Open |
| GitHub Environments not created | No dev/staging/production isolation | Settings → Environments → New environment | ⚠️ Open |
| FutureHorizonsEducation org access | Cannot scan FHE org repos in dashboard | Correct org permissions | ⚠️ Open |
| Local Windows Claude history path | Cannot read C:\Users\...\claude from hosted app | Use exported history bundles, upload to evidence store | ⚠️ Open |
| PR #149 in SJMS-2.5 | Blocked: OWNER/REPO fix pushed, needs conversation resolved + 1 approving review | Resolve BugBot thread → get approval → merge | ⚠️ Open |

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|----------|
| 2026-05-01 | FHE-EPMC is GitHub-native, not Perplexity Computer iframe app | Real PR control tower requires live GitHub API, not simulated state |
| 2026-05-01 | Universal Cursor Agent pattern from SJMS-2.5 | Proven, $0.30/task, integrates with existing GitHub workflow |
| 2026-05-01 | Human gate on all merges, releases, deploys, schema changes | Non-negotiable for enterprise — GDPR, data integrity, security posture |
| 2026-05-01 | Dashboard built in Next.js 14 App Router + Tailwind | Consistent with portfolio repo stack, server-side API calls for security |
| 2026-05-01 | MEMORY.md read at start of every Claude session | Prevents context loss between sessions, maintains build continuity |
