# PR Review Workflow

> The canonical PR review workflow for FHE-EPMC and every portfolio repo.
> **Last updated:** 2026-05-01

This document defines exactly how a PR moves from "opened" to "merged" under FHE-EPMC governance. It is normative; deviations require an explicit ledger entry.

---

## 1. Roles in a Review

| Role | Action |
|------|--------|
| Author (human or agent) | Opens PR, fills template, drives resolution |
| Reviewer (human) | Reviews, approves or requests changes — required by branch protection |
| Claude Code | Auto-reviews on open/sync; can post fix commits when invoked via `@claude` |
| Cursor BugBot | Posts inline bug findings |
| Copilot | Posts review suggestions |
| Dependabot | n/a (its own PRs follow this same workflow) |

---

## 2. Pre-Open Checklist (Author)

Before opening a PR, the author must confirm:

- [ ] Linked to an issue, blocker, or plan item.
- [ ] Smallest coherent production-grade change — no bundling.
- [ ] Tests added or updated for the change.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` passes locally.
- [ ] No new dependencies without justification.
- [ ] No secrets, credentials, or real PII.
- [ ] Rollback plan written.
- [ ] PR template filled.

---

## 3. Open → Review

1. PR is opened against `main` from a `claude/*`, `cursor/*`, or feature branch.
2. CI workflow (`ci.yml`) runs lint + typecheck + test + build.
3. `claude-auto-review.yml` posts inline review comments.
4. BugBot posts inline findings.
5. Copilot posts review suggestions where enabled.
6. A human reviewer is requested.

---

## 4. Review States

| Verdict | Meaning |
|---------|---------|
| `APPROVE` | Reviewer is satisfied; CI must still pass to merge. |
| `REQUEST_CHANGES` | Author must address every comment before merge. |
| `COMMENT` | Non-blocking remarks; merge not gated on response. |

Branch protection requires at least one `APPROVE` and zero outstanding `REQUEST_CHANGES`.

---

## 5. Resolving Review Comments

For each comment:
1. Author addresses the substance (fix, explanation, or "out of scope" with linked follow-up issue).
2. Author marks the conversation resolved only after the substance is addressed.
3. Reviewer re-resolves if author's resolution is inadequate.
4. BugBot conversations are explicitly resolved by the human, not by the agent.

**Claude-driven fix commits:** invoked by an authorised reviewer commenting `@claude address comments`. Claude pushes a single fix commit per session and replies with a summary. Claude does not mark conversations resolved.

---

## 6. CI Failure Handling

- CI failures block merge unconditionally.
- Author investigates the root cause; never bypasses with `--no-verify`, admin override, or skipping required checks.
- If the failure is in a flaky test, the test is fixed or quarantined under a tracked issue, not silenced.

---

## 7. Approving Review

- At least one `APPROVE` from a human reviewer is required.
- Authors may not approve their own PRs.
- Agents (Claude, Cursor) may not approve PRs at all.
- Security & Compliance reviewer's `REQUEST_CHANGES` blocks merge until resolved.

---

## 8. Merge

- Merge strategy: **squash-and-merge** by default for clean history.
- Merge commit message: PR title + body summary.
- Auto-merge may be enabled, but only when:
  - Branch protection requires CI + ≥ 1 review.
  - All required conversations are resolved.
- The owner retains the right to require manual merge for high-risk PRs.

---

## 9. Post-Merge

- Head branch auto-deletes (repo setting).
- Linked issue auto-closes via `Closes #N` keyword in PR body.
- Ledger entry written for the merge with: PR ref, approver, merge SHA.
- If the PR triggers a release, the release workflow proceeds to GitHub Environments approval gate.

---

## 10. Escalation

| Trigger | Escalation |
|---------|------------|
| PR open > 7 days without review | Owner is pinged on the PR |
| Reviewer requests changes twice without resolution | Engineering Maintainer pairs with Author |
| Security & Compliance flags critical | Block merge; ledger entry; remediation issue with P0 |
| Agent attempts to bypass refusal list | STOP, label `requires-human-review`, owner notified |

---

## 11. Anti-patterns (do not do these)

- Merging your own PR.
- Approving your own PR.
- Resolving BugBot conversations without a fix commit.
- Bypassing required checks via admin override.
- Force-pushing to `main`.
- Merging without an approving review.
- Silently deleting failing tests instead of fixing them.
- Adding `--no-verify` to commits.
- Bundling two unrelated changes in one PR.
