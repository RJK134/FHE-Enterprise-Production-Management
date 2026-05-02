# FHE-EPMC Prompts Library

> Reusable, scoped Claude Code and Cursor prompts.
> **Last updated:** 2026-05-01

Every prompt below is designed to satisfy the **Prompt Gate** step of the universal lifecycle (Step 6). Prompts are deliberately narrow, evidence-led, and ship-ready. None of them grant the agent permission to bypass any human gate.

Variables use `{{double-curly-braces}}`. Always replace every variable before dispatching.

---

## 1. Universal Prompt Header (always prepend)

```
You are operating inside the {{REPO_SLUG}} repository under the FHE-EPMC governance model.

Before you do anything:
1. Read CLAUDE.md and follow it precisely.
2. Read MEMORY.md and continue from the documented next step.
3. Read docs/DELIVERY_PLAN.md and confirm this task is in scope for the current phase.
4. Confirm in plain language: the single objective for this session, the files you will touch, and that you are NOT touching schema migrations, auth middleware, secrets, CI/CD pipelines, or >5 files at once.

Hard limits — refuse and add the `requires-human-review` label if the task crosses into:
- Schema migrations (Prisma)
- Auth / RBAC / session middleware
- Secret configuration or credential handling
- New external integrations
- CI/CD workflow file changes in portfolio repos
- Real PII or production credentials
- More than 5 files

You may NEVER:
- Bypass branch protection
- Force-push to main
- Merge a PR (your role is to open PRs only)
- Approve your own PR
- Use admin override
```

---

## 2. Scoped Implementation Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
{{ONE_SENTENCE_OBJECTIVE}}

LINKED ISSUE / BLOCKER
{{ISSUE_OR_BLOCKER_REF}}

ALLOWED FILE SCOPE
- {{FILE_GLOB_1}}
- {{FILE_GLOB_2}}

DEFINITION OF DONE
- [ ] Code change implemented per objective
- [ ] Adjacent tests added/updated under __tests__/
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all pass locally and in CI
- [ ] PR description follows CLAUDE.md template
- [ ] No new dependencies added without explicit owner approval
- [ ] No secrets, credentials, or PII introduced

OUTPUT
- Open a PR from `claude/{{TASK_SLUG}}` against main
- Use the canonical PR template
- Tag PR with the `claude` label
```

---

## 3. PR Review Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Review PR {{PR_NUMBER}} of {{REPO_SLUG}} for production-readiness.

REVIEW DIMENSIONS
- Correctness — does the change do what its description claims?
- Scope — only intended files changed?
- Tests — adequate coverage for the change?
- Security — any new secrets exposure, injection surface, auth implication?
- Performance — any obvious regressions?
- Accessibility — ARIA labels on interactive elements, keyboard nav preserved?
- Rollback — is the change reversible cleanly?

OUTPUT
- Inline review comments where issues exist
- A summary review verdict (APPROVE / REQUEST_CHANGES / COMMENT)
- A short list of unresolved questions
- Do NOT push fix commits unless explicitly authorised by `@claude fix it`
- NEVER approve your own previously authored PR
```

---

## 4. Plan Refresh Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Produce a draft refresh of `docs/DELIVERY_PLAN.md` for {{REPO_SLUG}} based on:
- Latest repo intelligence scan: {{SCAN_ARTEFACT_REF}}
- UAT records since last refresh: {{UAT_RECORD_REFS}}
- Ledger entries since last refresh: {{LEDGER_ENTRY_REFS}}

CONSTRAINTS
- Do not change the phase structure (P0/P1/P2)
- Preserve all existing exit criteria; only update statuses with evidence
- Add new blockers only with a referenced source
- Do not delete prior content; supersede it

OUTPUT
- Open a PR titled `plan: refresh — {{DATE}}`
- Use the `planning-pr.md` PR template
- Add the `planning` label
```

---

## 5. Repo Deep-Review Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Deep architecture review of {{REPO_SLUG}} against the FHE-EPMC readiness model.

OUTPUT (post as a single comment on the issue, with the same structured headings)
1. Security posture — token handling, secret hygiene, CodeQL findings, auth/RBAC.
2. Identity & multi-tenancy — tenant scoping, session model, MFA posture.
3. Data integrity — schema discipline, migrations, transactional writes, retention.
4. CI/CD confidence — branch protection, required checks, environments, deploy gating.
5. Observability — logging, metrics, alerting, runbooks.
6. Dependencies — Dependabot, vulnerable packages, version pinning.
7. Documentation — README, CLAUDE.md, MEMORY.md, runbooks.
8. UAT & evidence — UAT records, evidence completeness.
9. Top 5 ranked blockers with proposed remediation issue titles.
10. Proposed readiness score (0–100) with axis breakdown and one-line justification per axis.

Do NOT change any file. This prompt is read-only.
```

---

## 6. Cursor Agent Task Prompt (issue body)

```
TASK SUMMARY
{{ONE_SENTENCE_TASK}}

SCOPE
- File(s): {{FILE_LIST}}
- Acceptance criteria:
  - {{CRITERION_1}}
  - {{CRITERION_2}}

REFUSAL CHECK
This task does NOT involve any of:
- Schema migrations
- Auth/RBAC/session middleware
- Payments, finance, marks retention
- New external integrations
- CI/CD configuration changes
- Real PII / production credentials

If any of the above is detected, STOP, label `requires-human-review`, and post a refusal comment.

OUTPUT
- Branch: cursor/issue-{{ISSUE_NUMBER}}
- PR with self-review checklist filled in
- Tracking comment on this issue with the cursor.com agent run URL
```

---

## 7. Blocker Remediation Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Remediate blocker {{BLOCKER_ID}} in {{REPO_SLUG}}.

BLOCKER SUMMARY
{{BLOCKER_SUMMARY}}

CURRENT EVIDENCE
{{EVIDENCE_REFS}}

REMEDIATION CONSTRAINTS
- Smallest coherent production-grade change
- Tests must accompany the fix
- A rollback plan must be in the PR description
- Linked to issue {{ISSUE_REF}}

OUTPUT
- Branch: claude/blocker-{{BLOCKER_ID}}
- PR titled `fix({{REPO_SLUG}}): remediate {{BLOCKER_ID}} — {{SHORT_TITLE}}`
- Use the `agent-remediation-pr.md` PR template
```

---

## 8. Documentation Prompt

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Generate / refresh documentation file {{DOC_PATH}} for {{REPO_SLUG}}.

CONSTRAINTS
- No new dependencies
- Keep style consistent with the existing docs/ tree
- Cite evidence sources for any factual claim
- Do not introduce links to drafts or unmerged PRs

OUTPUT
- Branch: claude/docs-{{SLUG}}
- PR with the `documentation` label
```

---

## 9. Memory Drift Detector Prompt (Phase 2)

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
Detect drift between MEMORY.md and the actual repo state for {{REPO_SLUG}}.

CHECK
- Are the listed "next steps" still consistent with open issues and PRs?
- Are the "Known Manual Blockers" still open?
- Is the "Active Context" date older than 14 days?

OUTPUT
- A single comment listing every drift detected
- Do NOT modify MEMORY.md directly; raise an issue with the suggested update
```

---

## 10. Handoff Pack Generator Prompt (Phase 2)

```
{{UNIVERSAL_HEADER}}

OBJECTIVE
At session end, generate the next-session handoff pack for {{REPO_SLUG}}.

OUTPUT (one comment posted on the session-tracking issue)
- Date and session objective
- Files touched
- PRs opened with status
- Tests run with PASS/FAIL
- Blockers encountered
- The single most important thing the next Claude session should do first
- Updated entries proposed for MEMORY.md (do not commit; let the owner accept)
```
