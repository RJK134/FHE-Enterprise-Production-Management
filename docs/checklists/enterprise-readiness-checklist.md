# Enterprise Readiness Checklist

> Used to compute the readiness score for any FHE-managed repo (0–100).
> Each axis is scored out of its weight; total normalised to 100.

---

## Axis Weights

| Axis | Weight |
|------|:------:|
| Security | 18 |
| Identity & Multi-tenancy | 12 |
| Data integrity | 12 |
| CI/CD confidence | 12 |
| Observability | 8 |
| Dependencies | 8 |
| Documentation | 8 |
| UAT & Evidence | 8 |
| Accessibility | 6 |
| Performance | 4 |
| Cost & Operations | 4 |
| **Total** | **100** |

---

## Security (18)

- [ ] Branch protection on `main` requires PR + review + CI pass.
- [ ] Secrets stored only in GitHub/Vercel encrypted secret store.
- [ ] No plaintext secrets ever in committed files.
- [ ] CodeQL enabled and zero high/critical findings open.
- [ ] Dependency Review action active.
- [ ] Secret scanning + push protection enabled.
- [ ] HTTPS-only; HSTS in production.
- [ ] CSRF/XSS/SQLi review completed and signed.
- [ ] No `--no-verify` commits in last 30 days.

## Identity & Multi-tenancy (12)

- [ ] Auth model documented.
- [ ] MFA available and enforced for staff accounts.
- [ ] Sessions revocable.
- [ ] Tenant scoping audited (where applicable).
- [ ] No cross-tenant data leakage paths.

## Data Integrity (12)

- [ ] Multi-table writes use transactions.
- [ ] Schema migrations are reversible.
- [ ] Backups configured and tested.
- [ ] Webhook handlers idempotent.
- [ ] Outbox/DLQ for cross-system events (where applicable).

## CI/CD Confidence (12)

- [ ] Lint + typecheck + test + build run on every PR.
- [ ] CI green on `main` ≥ 95% over rolling 30 days.
- [ ] Environments configured: development, staging, production.
- [ ] Production environment requires manual approval.
- [ ] Auto-delete head branches enabled.

## Observability (8)

- [ ] Structured logging.
- [ ] Health endpoint.
- [ ] Error tracking integrated.
- [ ] Metrics exported and dashboarded.
- [ ] Alert routing documented.

## Dependencies (8)

- [ ] Dependabot enabled for npm + GitHub Actions.
- [ ] No dependencies pinned to `latest` tag.
- [ ] No critical advisories open.
- [ ] Lockfile committed.

## Documentation (8)

- [ ] README current.
- [ ] CLAUDE.md present and current.
- [ ] MEMORY.md present and updated within 14 days.
- [ ] DELIVERY_PLAN.md present and current.
- [ ] Architecture document present.

## UAT & Evidence (8)

- [ ] Last release has a UAT verdict on file.
- [ ] Evidence Lake manifest entries exist for the last release.
- [ ] Rollback plan present for the last release.

## Accessibility (6)

- [ ] axe-core or equivalent run on key flows.
- [ ] All interactive elements have accessible names.
- [ ] Keyboard navigation works on key flows.
- [ ] Colour contrast meets WCAG AA.

## Performance (4)

- [ ] Lighthouse scores recorded for key flows.
- [ ] Bundle size budget set and enforced.
- [ ] No regressions > 10% in last release.

## Cost & Operations (4)

- [ ] Agent spend within monthly cap.
- [ ] GitHub Actions minutes within budget.
- [ ] Runbook present for top 3 alert conditions.

---

## Scoring Rule

Each unchecked item subtracts the weight of its axis divided by the number of items in that axis. The result is then summed, floored at 0, and reported as the readiness score for the repo. Scores are recorded in the Evidence Lake on every scan run.
