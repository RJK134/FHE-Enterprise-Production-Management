# FHE Enterprise Production Management Centre — Product Specification

> **Document owner:** Freddie Finn (RJK134) — Future Horizons Education
> **Status:** Phase 0 Foundation Specification (canonical)
> **Last updated:** 2026-05-01
> **Supersedes:** Perplexity Computer Production Delivery Command Centre (v1 scaffold, 62/100)

---

## 1. Executive Summary

The **FHE Enterprise Production Management Centre (FHE-EPMC)** is the GitHub-native command and control centre for all Future Horizons Education product delivery. It integrates Claude Code, Cursor Background Agents, Cursor BugBot, GitHub Copilot, Dependabot, CodeQL, GitHub Actions, GitHub Environments, repo intelligence scanning, evidence management, stakeholder UAT, approval governance, release tracking, and dashboard reporting into a single human-gated control plane.

It explicitly **replaces the Perplexity Computer scaffold** with a real integration-first system. Where the Perplexity build was a UI specification dashboard demonstrating *what* an enterprise delivery centre could look like, FHE-EPMC is a *live* orchestrator: it polls real GitHub PRs and check runs, reads real repo intelligence, dispatches real Claude Code and Cursor agent jobs, captures real evidence, and routes real human approvals.

FHE-EPMC is the single tool from which the FHE owner can:
- See the live state of every active PR, check, blocker, and milestone across the portfolio.
- Dispatch agents to scoped branches with explicit guard rails.
- Capture every artefact required for enterprise governance, GDPR, UAT, and release sign-off.
- Approve or block merges with full traceability and a permanent governance ledger.

It is built to enterprise-grade quality from day one: no simulated state where a live integration is possible, no hidden agent action, no auto-merge to production, and no shortcut around the human gate.

---

## 2. Product Vision

A **single pane of glass** for planning, designing, building, reviewing, reiterating, testing, approving, demoing, publishing, and governing enterprise-quality builds across all active FHE repositories.

**One system. One ledger. One control surface. Many products.**

Every FHE product — current and future — is intaken into FHE-EPMC, scanned, scored, planned, built, reviewed, UAT'd, approved, released, and audited through the same fourteen-step lifecycle, the same evidence model, and the same approval ledger. The owner never has to context-switch between disjoint tools to know:
- *What is the live state of every PR I care about?*
- *Which blockers are open on which products?*
- *What evidence has been captured for the next release?*
- *Who approved what, when, and on what basis?*
- *What does the next Claude Code session need to continue?*

---

## 3. Problems Being Solved

| # | Problem | FHE-EPMC Resolution |
|---|---------|---------------------|
| 1 | The Perplexity Computer build became a UI/specification scaffold without live orchestration. | GitHub-native architecture: every panel reads live GitHub APIs; no simulated state. |
| 2 | Repo dashboards and Cursor agents exist separately and need integration. | Universal `FHE-Agent` pattern, central agent registry, single dashboard surface. |
| 3 | GitHub PR, CI, BugBot, Copilot, Dependabot, CodeQL, release, and UAT evidence is fragmented. | Unified Control Tower view + Evidence/Memory Lake pulling from all signals. |
| 4 | Claude Code sessions risk losing context unless governed through CLAUDE.md, MEMORY.md, prompt gates, and handoff packs. | Mandatory CLAUDE.md/MEMORY.md/SKILLS.md in every repo + Claude Code Bridge with handoff pack generator. |
| 5 | Delivery progress against roadmap, blockers, readiness, and quality needs a unified dashboard. | Portfolio Registry + Readiness Score Engine + Blocker Tracker + Phase Roadmap views. |
| 6 | Enterprise stakeholders require audit evidence, approval gates, release notes, rollback plans, UAT records, and environment separation. | Governance Ledger, UAT Portal, GitHub Environments integration, release governance pipeline. |
| 7 | No live human-gated production approval workflow across the portfolio. | Approval Ledger with cryptographic-evidence-style record of who approved what, when, why. |
| 8 | No central RBAC, audit log, or SSO — the previous build had none. | RBAC matrix, append-only audit log, IdP/SSO integration on the Phase 4 roadmap. |

---

## 4. Product Principles

These principles are non-negotiable and apply to every feature, agent action, PR, and release.

1. **GitHub-first** — the source of truth is GitHub: branches, PRs, checks, environments, releases, issues. No private off-platform state.
2. **Human-gated** — no automation may bypass human review for merge, deploy, schema, auth, secrets, or external integration changes.
3. **Evidence-led** — every significant change must reference an issue, blocker, or plan item with captured evidence.
4. **Repo-parity** — every governance pattern that lives in FHE-EPMC must be replicable to every portfolio repo via scripted setup.
5. **Smallest coherent production-grade change** — never bundle two features in one PR; never partially ship.
6. **Automation with explicit stop conditions** — every agent has a documented refusal list; agents stop and label `requires-human-review` rather than continue.
7. **No simulated state where live integration is possible** — if GitHub can answer it, do not mock it.
8. **Security and privacy by design** — least privilege, no PII in logs, encrypted at rest, signed at transit.
9. **Every PR must be reviewable, testable, reversible** — small diffs, full CI, documented rollback plan.
10. **No hidden agent action** — every agent run is traceable to an issue, comment, workflow run, or manual dispatch with a visible audit trail.

---

## 5. User Roles

FHE-EPMC defines eight first-class roles. Each role has explicit permissions, allowed actions, forbidden actions, dashboard needs, and success criteria.

### 5.1 Owner / Enterprise Product Director (Freddie Finn)
- **Permissions:** Full read/write across portfolio. Sole approver for production deploys, schema migrations, release cuts, secret rotation.
- **Allowed:** Approve PRs; approve production deploys; cut releases; intake new products; approve agent budget caps; override governance with written justification.
- **Forbidden:** Bypassing the production gate without written justification recorded in the governance ledger.
- **Dashboard needs:** Portfolio readiness scores, open blocker count by product, pending approvals, release pipeline view, governance ledger latest entries, monthly cost meter.
- **Success criteria:** All four products at ≥ 90/100 readiness; zero unaudited merges to main; zero plaintext secrets in any repo.

### 5.2 Production Delivery Manager
- **Permissions:** Read all; write plan documents and milestone closeouts; trigger non-destructive workflows.
- **Allowed:** Update DELIVERY_PLAN.md; close milestones; refresh evidence; assign issues to agents; comment on PRs.
- **Forbidden:** Approving production deploys; rotating secrets; modifying CI/CD; merging to main.
- **Dashboard needs:** Sprint board, milestone burn-down, blocker remediation tracker, evidence completeness dashboard.
- **Success criteria:** Every active milestone has a closeout pack; every active blocker has an owner and ETA.

### 5.3 Engineering Maintainer
- **Permissions:** Push to feature branches; open PRs; review PRs; request changes.
- **Allowed:** Implement features; review PRs; address review comments; raise blockers; propose architecture changes.
- **Forbidden:** Self-approving own PRs; merging without required checks; pushing directly to main.
- **Dashboard needs:** PR queue, CI status, BugBot/Copilot review queue, dependency vulnerability list.
- **Success criteria:** PR cycle time < 48h; zero unresolved Cursor BugBot critical comments at merge.

### 5.4 Claude Code Build Operator
- **Permissions:** Push to `claude/*` branches via Claude Code GitHub App.
- **Allowed:** Open PRs; commit fixes to open PR branches; generate documentation; review code; refresh plans.
- **Forbidden:** Merging PRs; modifying secrets; touching schema/auth without `requires-human-review` label; bypassing CLAUDE.md rules.
- **Dashboard needs:** Active session log, MEMORY.md drift warnings, prompt library, session handoff pack generator.
- **Success criteria:** Every Claude session ends with an updated MEMORY.md and a clean handoff statement.

### 5.5 Cursor Agent Operator
- **Permissions:** Push to `cursor/*` branches via Cursor GitHub App.
- **Allowed:** JSDoc, lint fixes, Zod schemas, single-file refactors, scoped tests, README updates.
- **Forbidden:** Schema migrations, auth/RBAC changes, payments/finance/marks retention, new external integrations, CI/CD changes, real PII.
- **Dashboard needs:** Active agent run list, cost meter, refusal log, branch tracker.
- **Success criteria:** Monthly Cursor spend ≤ £25; zero refusal-list breaches.

### 5.6 Security & Compliance Reviewer
- **Permissions:** Read all; comment on PRs; gate releases on security findings.
- **Allowed:** Block PRs with `security-review-required` label; require evidence updates; require rollback plans.
- **Forbidden:** Pushing code; merging PRs; rotating secrets unilaterally.
- **Dashboard needs:** CodeQL findings queue, Dependabot alert queue, GDPR/PII evidence tracker, secret scan report.
- **Success criteria:** Zero high/critical CodeQL findings open beyond SLA; zero secrets-in-code findings.

### 5.7 Client / Stakeholder UAT Reviewer
- **Permissions:** Read access via UAT Portal only; write UAT verdicts and attach evidence.
- **Allowed:** Review release candidates in staging; record UAT outcomes; attach screenshots/notes.
- **Forbidden:** Code access; production access; secrets access.
- **Dashboard needs:** UAT Portal scoped view, release candidate links, UAT script, evidence upload form.
- **Success criteria:** Every release candidate has a recorded UAT verdict before promotion.

### 5.8 External QA Partner
- **Permissions:** Read access to staging environments and UAT artefacts only.
- **Allowed:** Run external QA scripts, record findings, raise issues.
- **Forbidden:** Code, secrets, production data, internal governance ledger.
- **Dashboard needs:** Test plan delivery view, bug submission portal, environment access status.
- **Success criteria:** Findings raised within agreed SLA; zero scope creep beyond contracted scope.

---

## 6. Core Managed Products

| Product | Repo | Readiness | Phase | Top Blockers | Required Next-Phase Outcome |
|---------|------|-----------|-------|--------------|------------------------------|
| **SJMS-2.5** | [RJK134/SJMS-2.5](https://github.com/RJK134/SJMS-2.5) | 72/100 | Tranche A hardening | Branch protection gaps; plaintext webhook & session secrets; no transactional outbox/DLQ; latest-tag dependency drift; JWT fallback removal | Tranche A complete: branch protection enforced, secrets-at-rest, transactional outbox + DLQ live, dependencies pinned, JWT fallback removed, evidence captured, readiness ≥ 85/100. |
| **EquiSmile** | [RJK134/EquiSmile](https://github.com/RJK134/EquiSmile) | 63/100 | Phase 17 Stabilise | Identity & multi-tenancy gaps; CI/database confidence; compliance evidence; dependency security; scaling; operational reliability | Phase 17 stabilisation closed: identity hardened, tenantId-scoped queries audited, CI green, dependency baseline clean, compliance evidence captured, readiness ≥ 80/100. |
| **HERM Platform** | [RJK134/herm-platform](https://github.com/RJK134/herm-platform) | 70/100 | Phase 1 hardening PRs | Open hardening PRs; SSO/MFA; revocable sessions; Stripe webhook completeness; observability; DR; GitHub security automation | Phase 1 closed: SSO/MFA in production, revocable sessions, Stripe webhooks idempotent and complete, observability in place, DR plan tested, readiness ≥ 85/100. |
| **FHE-EPMC** | This repo | Building | Phase 0 Foundation | Repo not yet hardened; secrets not configured; CI not yet running; dashboard not yet built | Phase 0 closed: foundation files committed, CI green, branch protection enabled, agents wired, foundation PR merged with human approval. |

---

## 7. Universal 14-Step Delivery Lifecycle

Every product follows this identical lifecycle. Each step has a defined objective, inputs, automation, human gate, outputs, and evidence record.

### Step 1 — Intake
- **Objective:** Add a product to the FHE-EPMC portfolio registry.
- **Inputs:** Repo URL, owner, stack, current readiness estimate, current phase, top blockers.
- **Automation:** `scripts/setup-repo-standards.sh --repo <slug>` deploys CLAUDE.md, MEMORY.md, agent configs, workflow templates.
- **Human gate:** Owner confirms intake and signs governance ledger entry.
- **Outputs:** Portfolio Registry row, intake commit on FHE-EPMC, repo-side foundation PR.
- **Evidence:** Intake form, ledger entry hash, repo-side foundation PR URL.

### Step 2 — Evidence
- **Objective:** Capture all relevant prior evidence (Claude history, prior PRs, CI logs, audit trails) into the Evidence/Memory Lake.
- **Inputs:** Existing repo artefacts, exported Claude history bundles, prior UAT records.
- **Automation:** Evidence ingest workflow normalises artefacts into structured records.
- **Human gate:** None for ingest; review gate before Deep Scan.
- **Outputs:** Evidence Lake bundle keyed by repo + timestamp.
- **Evidence:** Bundle manifest with checksums.

### Step 3 — Deep Scan
- **Objective:** Run the universal repo intelligence scan against the target repo.
- **Inputs:** Repo, evidence bundle.
- **Automation:** `repo-intelligence-scan.yml` workflow runs CodeQL, dependency scan, secret scan, conventions audit, branch protection audit.
- **Human gate:** None for scan; review gate before Gap Analysis.
- **Outputs:** Scan report (JSON + markdown), readiness score draft.
- **Evidence:** Scan run URL, report artefact link.

### Step 4 — Gap Analysis
- **Objective:** Produce the structured blocker list and updated readiness score.
- **Inputs:** Deep Scan report, prior blocker history.
- **Automation:** Gap analysis engine merges scan output with manual context.
- **Human gate:** Production Delivery Manager confirms blocker list.
- **Outputs:** Updated `DELIVERY_PLAN.md` blocker section, readiness score.
- **Evidence:** Plan diff, ledger entry.

### Step 5 — Plan
- **Objective:** Create or refresh the phased delivery plan with P0/P1/P2 priorities.
- **Inputs:** Gap analysis output, prior plan, owner steering.
- **Automation:** Plan refresh engine drafts the diff for human review.
- **Human gate:** Owner approves plan changes.
- **Outputs:** New `DELIVERY_PLAN.md` revision committed via PR.
- **Evidence:** Plan PR, ledger entry.

### Step 6 — Prompt Gate
- **Objective:** Generate rigorous, scoped Claude Code prompts for each blocker.
- **Inputs:** Plan, blocker definition, repo conventions (CLAUDE.md).
- **Automation:** Prompt library template + variable substitution.
- **Human gate:** Owner approves prompt before agent dispatch on high-impact items.
- **Outputs:** Prompt artefact in `docs/PROMPTS_LIBRARY.md` or in issue body.
- **Evidence:** Prompt commit hash, issue link.

### Step 7 — Agent Task
- **Objective:** Dispatch a Claude or Cursor agent to a scoped branch.
- **Inputs:** Prompt, repo, branch naming convention, refusal list.
- **Automation:** GitHub Action — `claude.yml`, `cursor-agent-manual.yml`, or label/comment trigger.
- **Human gate:** Implicit — agent acts only on triggered tasks; refuses high-risk classes.
- **Outputs:** Branch (`claude/task-N` or `cursor/issue-N`), agent run URL.
- **Evidence:** Workflow run, branch ref, agent comment on issue.

### Step 8 — Build
- **Objective:** Agent writes code and commits to the scoped branch.
- **Inputs:** Prompt, repo conventions, refusal list.
- **Automation:** Agent runtime (Claude Code GitHub App / Cursor Agent runtime).
- **Human gate:** None during build; gate is at PR review.
- **Outputs:** Commits on the scoped branch.
- **Evidence:** Commit SHAs, agent log.

### Step 9 — PR Review
- **Objective:** CI + BugBot + Copilot + Dependabot + human review.
- **Inputs:** Open PR.
- **Automation:** `ci.yml` runs lint/typecheck/test/build; `claude-auto-review.yml` posts inline comments; BugBot and Copilot run on the PR.
- **Human gate:** At least one human approving review required by branch protection.
- **Outputs:** Review verdicts, inline comments, fix-ready signals.
- **Evidence:** PR check run links, review IDs.

### Step 10 — Resolve
- **Objective:** Address every review comment, push fix commits, re-run checks.
- **Inputs:** Review comments, BugBot findings.
- **Automation:** `@claude` comment triggers fix commits; manual fixes for human-only domains.
- **Human gate:** Reviewer marks comments resolved.
- **Outputs:** Updated PR with all checks green and zero unresolved threads.
- **Evidence:** Resolved review threads, fix commit SHAs.

### Step 11 — UAT
- **Objective:** Stakeholder testing in staging with evidence capture.
- **Inputs:** Release candidate deployed to staging.
- **Automation:** UAT Portal generates a scoped link, evidence upload form.
- **Human gate:** Stakeholder records explicit UAT verdict (PASS/FAIL/CONDITIONAL).
- **Outputs:** UAT record with verdict and evidence attachments.
- **Evidence:** UAT record ID, ledger entry.

### Step 12 — Refresh Plan
- **Objective:** Update the delivery plan based on evidence and UAT results.
- **Inputs:** UAT verdict, post-build evidence, blocker remediation status.
- **Automation:** Plan refresh engine drafts diff.
- **Human gate:** Owner approves plan updates.
- **Outputs:** New `DELIVERY_PLAN.md` revision PR.
- **Evidence:** Plan diff, ledger entry.

### Step 13 — Merge
- **Objective:** Merge the PR to main.
- **Inputs:** Approved PR with all checks green.
- **Automation:** GitHub auto-merge **only when** branch protection requires CI + ≥ 1 approving review.
- **Human gate:** Approving review required by branch protection. Claude Code MUST NOT approve its own PRs.
- **Outputs:** Merged commit on main.
- **Evidence:** Merge commit SHA, ledger entry.

### Step 14 — Release
- **Objective:** Tag release, deploy to environment, publish release notes, capture client-facing artefacts.
- **Inputs:** Merged main, release notes draft, rollback plan.
- **Automation:** Release workflow tags, deploys to environment with manual approval gate, generates release notes.
- **Human gate:** Owner approves production environment deploy via GitHub Environment protection rules.
- **Outputs:** Tag, GitHub Release, deployed environment, release notes.
- **Evidence:** Release URL, environment deploy log, ledger entry.

---

## 8. Core Capabilities

FHE-EPMC delivers the following capabilities. Each is a first-class, roadmapped feature.

1. **Portfolio Registry** — Single canonical list of managed products with repo, readiness, phase, blockers, owner, environment status. Powers every other view.
2. **Live GitHub PR/CI Control Tower** — Real-time view of every open PR across the portfolio with check status, BugBot/Copilot/Claude review state, branch protection compliance, age, and merge readiness.
3. **Repo Intelligence Scanner** — Automated deep scan: CodeQL, secret scan, dependency baseline, branch protection audit, conventions audit, workflow audit, README/CLAUDE.md compliance.
4. **Readiness Score Engine** — Weighted scoring across security, identity, data integrity, CI/CD, observability, governance, accessibility, performance, documentation. Produces a 0–100 score with breakdown.
5. **Blocker Tracker** — Append-only blocker log per repo with owner, ETA, evidence, remediation PR linkage, and resolution proof.
6. **Plan Refresh Engine** — Programmatic refresh of `DELIVERY_PLAN.md` based on scan results, UAT outcomes, and ledger events, with human-approval PR.
7. **Repo Deep-Review Engine** — On-demand multi-file architecture review by Claude Code with structured output mapped to the readiness model.
8. **Evidence and Memory Lake** — Structured store of every artefact: Claude transcripts, scan reports, UAT records, release notes, post-mortems. Searchable and immutable.
9. **Claude Code Bridge** — Session handoff pack generator: every session produces a continuation manifest the next session reads first.
10. **Stakeholder / UAT Portal** — Scoped, role-restricted portal for non-technical stakeholders to review release candidates and record verdicts.
11. **Governance and Approval Ledger** — Append-only ledger of every approval, override, deploy, release, and break-glass action with timestamp, actor, justification.
12. **RBAC** — Role-based access control aligned to the eight roles in §5, enforced server-side.
13. **Audit Log** — Append-only system audit trail of every action taken by users, agents, and automation.
14. **SSO / IdP** — Identity provider integration (Phase 4): Microsoft Entra ID and/or Google Workspace via OIDC.
15. **Cost Meter** — Live tracking of agent spend (Anthropic + Cursor + GitHub Actions minutes) per repo and per period.
16. **GitHub Environments and Release Governance** — Environment protection rules, manual approvals, release notes generation, deploy logs.
17. **Database / Integration / Migration Evidence Dashboard** — Per-repo view of schema versions, integration health, migration history, DR posture.
18. **UX / Performance / Accessibility Budget Dashboard** — Lighthouse, axe, and bundle-size budgets per repo with regression alerts.

---

## 9. Universal Cursor Agent Pattern (FHE-Agent)

The SJMS-2.5 Cursor Agent model is universalised as `FHE-Agent` and deployed to every portfolio repo via `scripts/setup-repo-standards.*`.

- **Visibility:** The agent is a GitHub Action, not a chatbot. It is invoked by structured triggers, never by ambient prompting.
- **Triggers:**
  - Issue template `Cursor Agent Task` plus `cursor` label → automatic dispatch.
  - Comment prefixes on issues or PRs: `@cursor`, `q:`, `explain:`.
  - Manual `workflow_dispatch` via `cursor-agent-manual.yml`.
- **Branch naming:** `cursor/issue-N` for label-triggered runs; `cursor/manual-N` for manual dispatch.
- **Output:** Branch + PR + tracking comment on the originating issue with a link to the Cursor agent run.
- **Refusal list (always):**
  - Schema migrations.
  - Auth, RBAC, session middleware.
  - Payments, finance, marks retention.
  - New external integrations.
  - CI/CD configuration changes.
  - Real PII or production credentials.
- **Read-only mode:** `q:` and `explain:` prefixes return an answer comment, no branch.
- **Cost ceiling:** £25/month per operator account; configured at https://cursor.com/settings/billing.

---

## 10. Review Intelligence v5 Conventions

FHE-EPMC inherits and standardises Review Intelligence v5:
- GitHub CLI setup scripts (PowerShell + bash) install labels, milestones, epics, child issues, issue forms, PR templates, and milestone closeout checklists idempotently.
- Setup is re-runnable: existing labels, milestones, and templates are updated in place rather than duplicated.
- Every milestone has a closeout pack template requiring: scope diff, evidence list, UAT outcome, release notes, rollback plan.
- Every PR uses the canonical PR template; specialised flows (`planning-pr.md`, `agent-remediation-pr.md`) extend the canonical template.

---

## 11. Non-Negotiable Safety Rules

These rules apply to every Claude Code and Cursor agent action in FHE-EPMC and every portfolio repo. They cannot be overridden by prompts, comments, or labels.

- Do **not** bypass branch protection.
- Do **not** disable required checks.
- Do **not** force-push to `main`.
- Do **not** approve your own PR as Claude Code or any agent identity.
- Do **not** merge without required checks and a human approving review.
- Do **not** use admin override.
- Do **not** rotate or expose secrets.
- Do **not** include real PII or production credentials in any artefact.
- Do **not** modify GitHub Actions workflow files in portfolio repos without human approval.
- Do **not** modify schema, auth, or RBAC code without `requires-human-review` label and human approval.

---

## 12. Out of Scope (Explicit)

- Hosting any iframe-based Perplexity-style scaffold view.
- Maintaining any non-GitHub source of truth for PRs or releases.
- Any agent action that bypasses the human merge gate.
- Storing real PII or production credentials in this repo.
- Direct Claude API/Anthropic console administration (handled by owner).
- Pages Router or class component patterns in any new code.

---

## 13. Definition of Done — Phase 0 Foundation

Phase 0 is closed when **all** of the following are true:

- [ ] All foundation files in this specification exist on `main` of FHE-EPMC.
- [ ] CI workflow runs and passes on every PR.
- [ ] Branch protection on `main` requires PR, ≥ 1 approving review, and CI pass.
- [ ] `ANTHROPIC_API_KEY` and `CURSOR_API_KEY` secrets configured.
- [ ] Claude Code GitHub App installed.
- [ ] Cursor GitHub App installed and BugBot enabled.
- [ ] `MEMORY.md` reflects Phase 0 completion and the next session's continuation point.
- [ ] Owner has approved and merged the foundation PR.

Once Phase 0 is closed, FHE-EPMC moves to Phase 1 — Live Control Tower MVP — per `docs/DELIVERY_PLAN.md`.
