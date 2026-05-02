# UAT Checklist

> Used by stakeholder reviewers to record a UAT verdict for any release candidate.

---

## Identity

- **Repo:** {{REPO_SLUG}}
- **Release candidate:** {{TAG_OR_COMMIT}}
- **Environment:** staging
- **Reviewer:** {{NAME}}
- **Role:** {{ROLE}}
- **Date:** {{DATE}}

---

## Pre-test

- [ ] I have read the release notes.
- [ ] I have access to the staging environment.
- [ ] I have the test script for this release.
- [ ] I have the contact path for raising blockers.

---

## Functional Coverage

- [ ] Golden-path scenarios pass.
- [ ] Edge cases pass.
- [ ] Permission boundaries respected (I cannot see or do what I should not).
- [ ] Errors are user-friendly and recoverable.

## Data

- [ ] Test data only — no real PII present.
- [ ] Data persistence behaves as expected (refresh / new session).
- [ ] No cross-tenant leakage observed.

## Accessibility (sample)

- [ ] Keyboard navigation works on the screens I tested.
- [ ] Screen reader labels are sensible on the screens I tested.
- [ ] Colour contrast acceptable.

## Performance (sample)

- [ ] Page loads feel acceptable.
- [ ] No long-running operations without a progress indicator.

---

## Verdict

- [ ] **PASS** — release approved from my perspective.
- [ ] **CONDITIONAL** — release approved subject to the conditions below.
- [ ] **FAIL** — do not release.

### Conditions (if CONDITIONAL)

- {{CONDITION_1}}

### Reasons (if FAIL)

- {{REASON_1}}

---

## Evidence

- [ ] Screenshots attached.
- [ ] Notes attached.
- [ ] Issues raised: {{ISSUE_REFS}}

---

## Sign-off

Signed: {{NAME}} — {{DATE}}

A `LedgerEntry` of kind `uat_verdict` is appended on submission with this record's reference.
