# Milestone Closeout Template

> Use this template when closing any milestone on any FHE-managed repo.
> Save the completed pack into the Evidence Lake with the milestone slug as key.

---

## Milestone

- **Repo:** {{REPO_SLUG}}
- **Milestone:** {{MILESTONE_TITLE}}
- **Phase:** {{PHASE}}
- **Opened:** {{OPENED_DATE}}
- **Closed:** {{CLOSED_DATE}}
- **Owner:** {{OWNER}}

---

## 1. Scope Diff

Summary of what changed scope-wise from the original milestone definition (additions, removals, deferrals). One bullet per change with linked issue or PR.

- {{SCOPE_CHANGE_1}}

---

## 2. Issue & PR Inventory

| ID | Title | State | PR | Notes |
|----|-------|-------|----|-------|
| #{{ISSUE_N}} | {{TITLE}} | closed/open/deferred | #{{PR_N}} | |

---

## 3. Tests Run

| Suite | Result | Notes |
|-------|--------|-------|
| lint | PASS/FAIL | |
| typecheck | PASS/FAIL | |
| unit | PASS/FAIL | |
| build | PASS/FAIL | |
| e2e (if applicable) | PASS/FAIL | |
| performance (if applicable) | PASS/FAIL | |
| accessibility (if applicable) | PASS/FAIL | |

---

## 4. Evidence Captured

| Item | Path / Link |
|------|-------------|
| CI run artefacts | {{CI_RUN_URL}} |
| CodeQL findings (delta) | {{CODEQL_URL}} |
| Dependabot alerts (delta) | {{DEPENDABOT_URL}} |
| Repo intelligence scan | {{SCAN_ARTEFACT_URL}} |
| Release notes draft | {{RELEASE_NOTES_PATH}} |
| Rollback plan | {{ROLLBACK_PLAN_PATH}} |

---

## 5. UAT Outcome

- **Reviewer:** {{REVIEWER_NAME}}
- **Verdict:** PASS / FAIL / CONDITIONAL
- **Conditions (if any):** {{CONDITIONS}}
- **UAT record reference:** {{UAT_RECORD_ID}}

---

## 6. Readiness Score Delta

| Axis | Before | After | Delta | Justification |
|------|--------|-------|-------|---------------|
| Security | | | | |
| Identity & Multi-tenancy | | | | |
| Data integrity | | | | |
| CI/CD confidence | | | | |
| Observability | | | | |
| Dependencies | | | | |
| Documentation | | | | |
| UAT & Evidence | | | | |
| **Total** | | | | |

---

## 7. Open Carry-Over Items

- {{ITEM_1}} → moved to milestone {{NEXT_MILESTONE}}

---

## 8. Lessons Learned

- {{LESSON_1}}

---

## 9. Approvals

- [ ] Engineering Maintainer: {{NAME}} — {{DATE}}
- [ ] Production Delivery Manager: {{NAME}} — {{DATE}}
- [ ] Security & Compliance: {{NAME}} — {{DATE}}
- [ ] Owner: {{NAME}} — {{DATE}}

---

## 10. Ledger Entry

A `LedgerEntry` of kind `milestone_closed` is appended on completion of this pack with:
- `repoId`, `milestoneTitle`, `actorId` (Owner), `evidenceRefs` (this document path), `createdAt`.
