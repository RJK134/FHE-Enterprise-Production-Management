# MEMORY.md — FHE Enterprise Production Management Centre

> This file maintains continuity across all Claude Code sessions. Read it at the start of every session. Update it at the end of every session.

---

## Active Context

**Last Updated**: 2026-05-01
**Current Phase**: Phase 0 — Foundation Build
**Active Sprint**: Establishing FHE-EPMC repo structure, core docs, agent configs, GitHub workflows
**Owner**: Freddie Finn (RJK134)
**Primary Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## System Context — What FHE-EPMC Is

FHE-EPMC is the master orchestration layer for all Future Horizons Education product development. It was created to replace and supersede a Perplexity Computer-hosted Production Delivery Command Centre that reached ~62/100 enterprise readiness but could not be developed further due to:

- No live GitHub API connectors (all state was simulated)
- Cannot read Windows local paths (Claude history inaccessible from hosted app)
- UI state-management defects (dropdown/detail-pane sync failure)
- No RBAC, no audit log, no SSO
- PR control tower missing entirely
- Plan refresh engine missing
- ~13,000+ Perplexity credits spent on scaffold/spec rather than live system

The decision was made on 2026-04-30 to rebuild as a GitHub-native tool with real integrations.

---

## Portfolio Product Snapshot

| Product | Repo | Readiness Score | Current Phase | Top P0 Blocker |
|---------|------|-----------------|---------------|----------------|
| SJMS 2.5 | RJK134/SJMS-2.5 | 72/100 | Tranche A | Plaintext webhook/session secrets |
| EquiSmile | RJK134/EquiSmile | 63/100 | Phase 17 Stabilise | Identity/multi-tenancy gaps |
| HERM Platform | RJK134/herm-platform | 70/100 | Phase 1 Hardening | SSO/MFA, revocable sessions |
| FHE-EPMC | RJK134/FHE-Enterprise-Production-Management | Building | Phase 0 Foundation | All foundational files being established |

---

## SJMS-Agent Pattern (Universal — Deploy to All Repos)

The SJMS-2.5 Cursor Agent is the proven implementation pattern:
- Lives in `.github/workflows/cursor-agent.yml` and `cursor-agent-manual.yml`
- Triggered by: `cursor` label on issues, `@cursor`/`q:`/`explain:` comments, manual workflow dispatch
- Writes to branch `cursor/issue-N`, opens PR, posts tracking comment with cursor.com link
- Persona defined in `.cursor/agents/SJMS-Agent.md` (to be universalised as `FHE-Agent.md`)
- Guard rails: refuses schema migrations, auth changes, PII handling, CI/CD config changes
- Cost: ~$0.30 per task; set $25/month cap at https://cursor.com/settings/billing
- Output: PR + issue comment with tracking link + cursor.com agent page for live monitoring

---

## Session Log

### 2026-05-01 — Batch Foundation Push (Perplexity AI assisted)
- **Objective**: Establish FHE-EPMC repo foundational files via Perplexity MCP tool
- **Batch 1 Pushed**: README.md (comprehensive), CLAUDE.md, MEMORY.md (this file), SKILLS.md
- **Batch 2 Pending**: docs/ folder (PRODUCT_SPECIFICATION.md, DELIVERY_PLAN.md, ARCHITECTURE.md, INTEGRATION_MAP.md, PROMPTS_LIBRARY.md, checklists/)
- **Batch 3 Pending**: .github/ (workflows, issue templates, PR templates, dependabot.yml), .cursor/ (agents, rules), scripts/
- **PRs Opened**: None — direct push to main for foundation files
- **Next Steps**: Complete Batch 2 and 3 pushes, then proceed to Phase 0 manual setup items

---

## Known Blockers — Requiring Manual Human Action

| # | Blocker | Impact | Resolution Path | Status |
|---|---------|--------|-----------------|--------|
| 1 | `ANTHROPIC_API_KEY` secret not set | Claude Code GitHub Action won't trigger | Settings → Secrets → Actions → New secret | ⬜ Open |
| 2 | `CURSOR_API_KEY` secret not set | Cursor agent workflow won't dispatch | Settings → Secrets → Actions → New secret | ⬜ Open |
| 3 | Claude GitHub App not installed | `@claude` comments and auto-review won't fire | Run `/install-github-app` in Claude Code CLI session | ⬜ Open |
| 4 | Cursor GitHub App not installed | BugBot won't review PRs | cursor.com/settings/integrations | ⬜ Open |
| 5 | Branch protection not enabled on main | Agents can push directly to main | Settings → Branches → Add rule for main | ⬜ Open |
| 6 | GitHub Environments not created | No dev/staging/production isolation | Settings → Environments → New environment (×3) | ⬜ Open |
| 7 | FutureHorizonsEducation org access | Cannot scan FHE org repos in portfolio | Correct org permissions, add as portfolio account | ⬜ Open |
| 8 | Windows Claude history path inaccessible | Evidence lake cannot ingest local history | Export Claude history bundles manually and upload | ⬜ Open |
| 9 | SJMS-2.5 PR #149 — review required | PR blocked from merging | Resolve BugBot conversation + get 1 approving review | ⬜ Open |

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|----------|
| 2026-04-30 | Abandon Perplexity Computer as FHE-EPMC build platform | Scaffold-only after 13k+ credits; no live connectors; UI defects; cannot read local Windows paths |
| 2026-04-30 | FHE-EPMC to be GitHub-native, not an iframe app | Real PR control tower requires live GitHub API, not simulated state |
| 2026-04-30 | Universal Cursor Agent pattern from SJMS-2.5 | Proven pattern; $0.30/task cost; integrates with existing GitHub workflow; human-gated |
| 2026-04-30 | Human gate on all merges, releases, schema changes | Non-negotiable for enterprise: GDPR, data integrity, security posture |
| 2026-05-01 | Dashboard built as Next.js app calling real GitHub API | Eliminates simulated/static state that was the core flaw of v1 |

---

## Strengths to Carry Forward from Perplexity v1

These design elements from the Perplexity build were strong and must be preserved:
- 14-step delivery lifecycle model
- Governance-first, human-gated-merge operating model
- Capacity handoff pack structure (repo/branch/PR/SHA + objective/acceptance criteria + continuation rules)
- Evidence/memory model design (per-repo evidence records with provenance)
- Claude prompt execution policy pattern (scoped branch → inspect → smallest change → gates → PR → no merge)
- Enterprise readiness scoring decomposed into specific primary blockers
- Tranche A→D / Phase-structured roadmaps per product

---

## Claude Code Prompt — Phase 0 First Session

When opening the first Claude Code interactive session in this repo, use this prompt:

```
You are working in the FHE Enterprise Production Management Centre repo.
Read CLAUDE.md and MEMORY.md in full before proceeding.

Objective: Wire the Claude Code GitHub Action and set up CI pipeline.

1. Create .github/workflows/claude.yml for on-demand @claude mentions on issues/PRs.
2. Create .github/workflows/claude-auto-review.yml for automatic PR review on open/synchronize events.
3. Create .github/workflows/ci.yml with: npm run lint, npm run typecheck, npm test, npm run build.
4. Scope auto-review to src/** and prisma/** paths only.
5. Add if: github.actor != 'dependabot[bot]' guard to auto-review workflow.
6. Open a PR — do NOT merge.
7. Production gate: all CI checks must pass, no secrets in any file, PR description includes rollback plan.
8. Update MEMORY.md with this session's changes.

Stop conditions: Any auth change, schema change, or change touching >5 files — add requires-human-review label and stop immediately.
```
