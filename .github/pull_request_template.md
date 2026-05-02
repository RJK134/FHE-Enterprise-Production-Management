<!--
Canonical PR template for FHE-EPMC and every portfolio repo.
For specialised flows use:
  ?template=planning-pr.md       — for plan refresh PRs
  ?template=agent-remediation-pr.md — for agent-authored remediation PRs
-->

## Summary
<!-- 2–3 sentences. What this PR does. -->

## Linked Issue / Blocker
<!-- e.g. "Closes #123" or "Addresses blocker: EPMC-B1" -->

## Files Changed
<!-- One bullet per file with the why. -->
- `path/to/file.ts` — why this file was changed.

## Tests Run
- [ ] `npm run lint` — PASS
- [ ] `npm run typecheck` — PASS
- [ ] `npm test` — PASS
- [ ] `npm run build` — PASS
- [ ] Other (describe): __________

## Production Gate
- [ ] No new secrets, credentials, or real PII in this diff
- [ ] No new dependencies (or, owner-approved with link)
- [ ] No accidental scope creep
- [ ] CodeQL / Dependabot regressions reviewed
- [ ] Touches a human-gated domain? If yes, `requires-human-review` label is applied
- [ ] Rollback plan included below

## Rollback Plan
<!-- Exact steps to revert this change safely. -->

## Human Review Required For
- [ ] Logic correctness
- [ ] Security implications
- [ ] Performance impact
- [ ] Accessibility
- [ ] Documentation accuracy

## Evidence References
<!-- Scan reports, ledger entries, UAT records, prior PRs. -->
