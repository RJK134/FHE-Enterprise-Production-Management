# Release Checklist

> Use this checklist for every release cut on any FHE-managed repo.

---

## Pre-cut

- [ ] All milestone PRs merged.
- [ ] CI green on `main` for the release SHA.
- [ ] No open `requires-human-review` labels on merged PRs in the release.
- [ ] CodeQL: no high/critical findings open.
- [ ] Dependabot: no critical advisories open.
- [ ] Repo intelligence scan run within last 7 days; readiness score recorded.
- [ ] Migration plan reviewed (if any DB schema change is included).

## Notes & Artefacts

- [ ] Release notes drafted (user-facing changes, breaking changes, migration steps).
- [ ] Rollback plan in release notes.
- [ ] Accessibility report attached (if UI changes).
- [ ] Performance benchmarks attached (if perf-sensitive changes).
- [ ] Dependency baseline snapshot captured.

## Environments

- [ ] Vercel **Preview** deploy succeeded on the release commit (Vercel check green).
- [ ] Deployed to `staging` and smoke-tested.
- [ ] UAT verdict recorded (PASS / CONDITIONAL with conditions met).
- [ ] GitHub Environment `production` approval requested (Owner) — Vercel cannot promote without it.
- [ ] Forked-PR releases (rare): each fork commit was explicitly authorised before the deploy ran.

## Approval

- [ ] Owner approves production deploy via GitHub Environment protection rule.
- [ ] Ledger entry written: `production_deploy_approved`.

## Cut

- [ ] Tag created (`vX.Y.Z`) following SemVer.
- [ ] GitHub Release published with notes.
- [ ] Production deploy executed.
- [ ] Post-deploy smoke tests run and recorded.
- [ ] Ledger entry written: `release_cut` and `production_deploy_completed`.

## Post-release

- [ ] Monitoring window declared (24h heightened watch).
- [ ] On-call awareness confirmed.
- [ ] Stakeholders notified (release notes link).
- [ ] Issues opened for any deferred items moved out of scope.

## Rollback Trigger Conditions

If any of the following occur within the monitoring window, execute the rollback plan:
- New high/critical CodeQL finding traceable to this release.
- Production error rate > 2× baseline for > 15 minutes.
- Data integrity issue suspected.
- Security disclosure related to this release.
- Stakeholder demands rollback for compliance reasons.
