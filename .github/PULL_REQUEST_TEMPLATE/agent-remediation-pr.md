<!--
Use this template for PRs authored by an agent (Claude Code or Cursor) remediating a blocker.
Open with: ?template=agent-remediation-pr.md
-->

## Agent identity
- [ ] Claude Code (`claude/*` branch)
- [ ] Cursor agent (`cursor/*` branch)

## Summary
<!-- 2–3 sentences. What the agent did. -->

## Linked Blocker / Issue
<!-- e.g. "Closes #123" — the originating Blocker Remediation issue. -->

## Refusal Self-Check (agent must confirm)
The agent confirms this PR does NOT touch any of the following without `requires-human-review`:
- [ ] Schema migrations
- [ ] Auth / RBAC / session middleware
- [ ] Secret configuration or credential handling
- [ ] New external integrations
- [ ] CI/CD workflow files in portfolio repos
- [ ] Real PII or production credentials
- [ ] More than 5 files

## Files Changed
- `path/to/file.ts` — why.

## Tests Run
- [ ] `npm run lint` — PASS
- [ ] `npm run typecheck` — PASS
- [ ] `npm test` — PASS
- [ ] `npm run build` — PASS

## Evidence References
<!-- Originating scan run, blocker entry in DELIVERY_PLAN.md, prior related PRs. -->

## Rollback Plan
<!-- Exact steps to revert. -->

## Human Review Required For
- [ ] Logic correctness
- [ ] Security implications
- [ ] Performance impact
- [ ] Accessibility

## Agent will NOT
- Approve this PR.
- Merge this PR.
- Push fix commits without an authorising `@claude` / `@cursor` instruction.
