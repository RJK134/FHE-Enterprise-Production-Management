# FHE-EPMC Delivery Plan

> **Document owner:** Freddie Finn (RJK134)
> **Status:** Phase 1 active
> **Last updated:** 2026-05-06
> **Companion document:** `docs/PRODUCT_SPECIFICATION.md`

This is the canonical phased delivery roadmap for the FHE Enterprise Production Management Centre. Plan refreshes are produced via PR per Step 12 of the universal lifecycle and approved by the owner.

---

## Phasing Summary

| Phase | Name | Outcome | Status |
|-------|------|---------|--------|
| 0 | Foundation | Repo hardened, governance docs canonical, agents wired, CI green | **Complete** |
| 1 | Live Control Tower MVP | Real GitHub PR/CI polling, dashboard skeleton, portfolio registry live | **Active** |
| 2 | Agent Bridge & Plan Engine | Claude Code Bridge, plan refresh engine, prompt library | Pending |
| 3 | Evidence Lake & Governance Ledger | Evidence ingest, immutable ledger, audit log MVP | Pending |
| 4 | RBAC, SSO, UAT Portal | Identity, role-based access, stakeholder UAT portal | Pending |
| 5 | Release Governance & Cost Meter | Environments, release notes pipeline, agent cost tracking | Pending |
| 6 | Portfolio Hardening | Drive every product to ≥ 85/100 readiness | Pending |
| 7 | Continuous Improvement | DR drills, governance reviews, scaling | Pending |

---

## Phase 0 — Foundation (Complete)

**Objective:** Stand up the FHE-EPMC repo so it can host every subsequent phase safely.

### P0 — Must complete this phase
- [x] `README.md`, `CLAUDE.md`, `MEMORY.md`, `SKILLS.md` committed.
- [x] `docs/PRODUCT_SPECIFICATION.md` canonical version committed.
- [x] `docs/DELIVERY_PLAN.md` (this file) committed.
- [x] `docs/ARCHITECTURE.md`, `docs/INTEGRATION_MAP.md`, `docs/PROMPTS_LIBRARY.md` committed.
- [x] `docs/process/` and `docs/checklists/` populated.
- [x] `.github/ISSUE_TEMPLATE/` populated with structured forms (epic, feature, bug, planning, cursor-agent-task, blocker-remediation).
- [x] `.github/PULL_REQUEST_TEMPLATE/` and root `pull_request_template.md` committed.
- [x] `.github/workflows/` (`ci.yml`, `claude.yml`, `claude-auto-review.yml`, `cursor-agent-manual.yml`, `repo-intelligence-scan.yml`) committed.
- [x] `.cursor/` agent persona, rules, environment committed.
- [x] `scripts/` (PowerShell + bash) for repo standards, review intelligence, foundation verification.
- [x] CI green on the foundation PR.
- [x] Foundation PR opened, reviewed by Copilot, hardened, and merged with human approval (PR #5).

### P1 — Should complete this phase
- [x] Branch protection rule on `main` enabled requiring PR, ≥ 1 review, CI pass. (Owner-confirmed.)
- [x] `ANTHROPIC_API_KEY` and `CURSOR_API_KEY` secrets configured. (Owner-confirmed.)
- [x] Claude Code GitHub App and Cursor GitHub App installed. (Owner-confirmed.)
- [x] Dependabot config committed and active — three Dependabot PRs already merged (#2, #3, #4).
- [x] Vercel for GitHub installed and project wired. Runbook in `docs/process/vercel-integration.md`.

### P2 — Nice to complete this phase
- [x] CodeQL workflow scaffolded — landed in this plan-refresh PR.
- [ ] GitHub Environments (`development`, `staging`, `production`) created. — Owner action; status not visible from this dashboard yet.
- [x] Auto-merge enabled on the repo, gated on required checks + approval.

### Exit criteria
- [x] Foundation PR merged via human approval with all required checks green.
- [x] `MEMORY.md` updated to point Phase 1 at the Control Tower MVP.

---

## Phase 1 — Live Control Tower MVP (Active)

**Objective:** Replace any simulated state with real GitHub-API-backed views.

### P0
- [x] Next.js 14/15 App Router skeleton with strict TS and Tailwind. (PR #6, on Next 15.5.15.)
- [x] Server-side GitHub client with token management via secret store only. (PR #6.)
- [x] Live PR list per repo with check status. (PR #6.) — BugBot/Copilot/Claude review-state attribution still deferred to a small follow-up.
- [x] Portfolio Registry page reading from a typed config (no DB yet). (PR #6.)
- [x] Live readiness score derived from real signals (branch protection, CodeQL alerts, Dependabot alerts). (PR #7.) CI pass rate defers to Phase 5 by design.

### P1
- [ ] Per-repo blocker tracker with append-only history. — Next session.
- [x] Per-PR drill-down with merge readiness signal. (PR #7.)
- [x] Authentication wall (placeholder auth — Phase 4 replaces with SSO). — landed in this plan-refresh PR (HTTP Basic Auth via env).
- [ ] BugBot/Copilot/Claude review-state attribution on PR rows. — Next session.

### Exit criteria
- Owner can see live PRs and check states across all four products without leaving FHE-EPMC.
- No simulated state remains in the dashboard for any signal GitHub can provide.

---

## Phase 2 — Agent Bridge & Plan Engine (Pending)

**Objective:** Make Claude Code sessions and plan refreshes first-class flows.

### P0
- [ ] Claude Code Bridge: handoff pack generator, MEMORY.md drift detector.
- [ ] Plan refresh engine: read scan + UAT + ledger; emit `DELIVERY_PLAN.md` diff PR.
- [ ] Prompts library expanded with reusable scoped prompts per blocker class.

### P1
- [ ] Repo Deep-Review Engine: orchestrate Claude multi-file architecture review with structured output.
- [ ] Per-session evidence capture from Claude transcripts.

### Exit criteria
- Every Claude session ends with a generated handoff pack stored in the Evidence Lake.
- Plan refreshes are PR-driven, not manual edits.

---

## Phase 3 — Evidence Lake & Governance Ledger (Pending)

**Objective:** Make every artefact and every approval immutable, traceable, and queryable.

### P0
- [ ] Evidence Lake schema and ingest endpoints.
- [ ] Append-only Governance Ledger writing approval/override/deploy entries.
- [ ] Audit Log MVP for every user/agent action.

### P1
- [ ] Search across Evidence Lake by repo, phase, blocker, date.
- [ ] Ledger export for external audit.

### Exit criteria
- Every release to date can be reconstructed from Evidence Lake + Ledger alone.

---

## Phase 4 — RBAC, SSO, UAT Portal (Pending)

**Objective:** Production-grade identity and stakeholder access.

### P0
- [ ] RBAC with the eight roles defined in PRODUCT_SPECIFICATION.md §5.
- [ ] OIDC SSO integration (Microsoft Entra ID and/or Google Workspace).
- [ ] UAT Portal — scoped link, evidence upload, verdict capture.

### P1
- [ ] MFA enforcement.
- [ ] Revocable session tokens.

### Exit criteria
- No password-based access remains; UAT happens entirely through the portal.

---

## Phase 5 — Release Governance & Cost Meter (Pending)

**Objective:** Make releases and agent spend visible and gated.

### P0
- [ ] GitHub Environments protected per role.
- [ ] Release notes pipeline tied to merged PR labels.
- [ ] Cost Meter for Anthropic + Cursor + Actions minutes per repo per period.

### Exit criteria
- Every release has a notes artefact and an approval entry on the ledger.
- Monthly cost per agent stack is reported on the dashboard.

---

## Phase 6 — Portfolio Hardening (Pending)

**Objective:** Drive every managed product to ≥ 85/100 readiness.

| Product | Current | Target |
|---------|---------|--------|
| SJMS-2.5 | 72/100 | ≥ 85/100 |
| EquiSmile | 63/100 | ≥ 80/100 |
| HERM Platform | 70/100 | ≥ 85/100 |
| FHE-EPMC | Building | ≥ 90/100 |

### Exit criteria
- All four products at or above target.
- Zero open P0 blockers across portfolio.

---

## Phase 7 — Continuous Improvement (Pending)

- Quarterly governance reviews.
- Annual DR drills per repo.
- Continuous CodeQL/Dependabot remediation.
- Quarterly readiness rescore with stakeholder review.

---

## Active Blockers (Cross-Cutting)

| ID | Blocker | Owner | Phase | ETA | Status | Evidence |
|----|---------|-------|-------|-----|--------|----------|
| EPMC-B1 | Repo secrets (`ANTHROPIC_API_KEY`, `CURSOR_API_KEY`) not configured | Owner | 0 | — | ✅ Resolved | Owner-confirmed in session log 2026-05-04 |
| EPMC-B2 | Branch protection on `main` not enabled | Owner | 0 | — | ✅ Resolved | Owner-confirmed; PR #5/#6/#7 merged via PR-gated flow |
| EPMC-B3 | Claude Code GitHub App not installed | Owner | 0 | — | ✅ Resolved | Owner-confirmed |
| EPMC-B4 | Cursor GitHub App / BugBot not installed | Owner | 0 | — | ✅ Resolved | Owner-confirmed |
| EPMC-B5 | GitHub Environments (`development`, `staging`, `production`) not created | Owner | 0–1 | Phase 1 exit | ⚠️ Open | n/a |
| EPMC-B6 | FutureHorizonsEducation org access constraint | Owner | 1 | Phase 1 exit | ⚠️ Open | Org admin action |
| EPMC-B7 | Portfolio onboarding not run for SJMS-2.5 / EquiSmile / herm-platform | Owner | 1 | Phase 1 exit | ⚠️ Open | Cannot be done from FHE-EPMC session — MCP scope restricted to this repo only. Run `scripts/setup-repo-standards.sh --repo …` per repo from owner machine. |
| EPMC-B8 | `documentation` and `operational` readiness axes are still registry-estimate | Engineering | 3, 5 | When Evidence Lake + CI pass-rate signals land | ⚠️ Deferred | Documented in `docs/checklists/enterprise-readiness-checklist.md` |

---

## Plan Refresh Cadence

- **Daily:** Active session log in `MEMORY.md` only.
- **Weekly:** Owner reviews open PRs, blocker list, and evidence completeness.
- **Per phase exit:** Plan refresh PR with full diff.
- **Per UAT cycle:** Evidence-driven plan refresh PR.

Plan refresh PRs use the `planning-pr.md` template under `.github/PULL_REQUEST_TEMPLATE/`.
