# PR Review Checklist

> Use this checklist for every human review of a PR.
> Branch protection requires at least one approving review; this checklist defines what "approving" means.

---

## Scope

- [ ] PR diff matches the title and description.
- [ ] No bundled, unrelated changes.
- [ ] Touches ≤ 5 files unless explicitly justified and labelled `requires-human-review`.
- [ ] No new dependencies without owner approval.

## Correctness

- [ ] Logic implements the stated objective.
- [ ] Edge cases handled (empty input, nulls, error paths).
- [ ] No off-by-one, race condition, or unhandled promise rejection.
- [ ] Naming is clear and consistent with repo conventions.

## Tests

- [ ] New tests cover the change.
- [ ] Existing tests still pass.
- [ ] No tests skipped, removed, or weakened without justification.
- [ ] CI is green.

## Security

- [ ] No secrets, credentials, or tokens introduced in code or config.
- [ ] No SQL/command/LDAP injection surface.
- [ ] No XSS surface in any new UI.
- [ ] Auth/RBAC not modified, or if modified, `requires-human-review` applied and Security & Compliance pinged.
- [ ] No PII in logs, error messages, or analytics.

## Performance

- [ ] No N+1 queries introduced.
- [ ] No synchronous IO in render paths.
- [ ] No unbounded loops or unbounded memory accumulation.

## Accessibility

- [ ] All interactive elements have `aria-label` or accessible name.
- [ ] Keyboard navigation works (tab order, focus management).
- [ ] Colour contrast not regressed.

## Documentation

- [ ] Public APIs / exported functions have JSDoc.
- [ ] User-facing behaviour change reflected in README or relevant doc.
- [ ] CLAUDE.md and MEMORY.md not silently invalidated.

## Rollback

- [ ] Rollback plan present in PR body.
- [ ] Database changes (if any) are reversible.
- [ ] Feature flag in place for risky behaviour change.

## Conversations

- [ ] All BugBot conversations resolved with a fix or explicit reason.
- [ ] All Copilot suggestions reviewed (accept, reject, or comment).
- [ ] All human reviewer conversations resolved.

## Final

- [ ] I am not the author of this PR.
- [ ] I have actually read the diff (not just skimmed).
- [ ] I am willing to take ownership of regressions caused by this change for 7 days.
