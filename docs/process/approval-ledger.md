# Approval & Governance Ledger

> Canonical specification of the FHE-EPMC append-only governance ledger.
> **Last updated:** 2026-05-01

The Approval Ledger is the immutable record of every approval, override, deploy, release, and break-glass action across the FHE portfolio. It is the substrate on which enterprise governance, audit, and post-incident reconstruction depend.

---

## 1. Properties

- **Append-only.** No update, no delete.
- **Hash-chained.** Each entry stores the hash of the prior entry; tampering is detectable.
- **Signed by actor.** Each entry records the authenticated actor identity.
- **Justification required for overrides.** Break-glass entries without justification text are invalid.
- **Linked to evidence.** Each entry references one or more Evidence Lake artefacts where applicable.

---

## 2. Entry Schema

```
LedgerEntry {
  id            uuid         primary key
  kind          enum         (see §3)
  repoId        uuid         indexed
  prRef         string       optional (e.g. "RJK134/SJMS-2.5#149")
  releaseRef    string       optional (e.g. "v1.4.0")
  environment   enum         optional ("development" | "staging" | "production")
  actorId       uuid         indexed
  actorRole     enum         (one of the eight roles)
  action        string       short verb-phrase, e.g. "approved_production_deploy"
  justification text         required for overrides; optional otherwise
  evidenceRefs  string[]     manifest keys
  prevHash      string       sha256 of canonical JSON of previous entry
  hash          string       sha256 of canonical JSON of this entry (excluding hash itself)
  createdAt     timestamptz  default now()
}
```

The hash is computed over the canonicalised JSON of the entry (sorted keys, no whitespace) excluding the `hash` field itself. The genesis entry has `prevHash = "0".repeat(64)`.

---

## 3. Entry Kinds

| Kind | Description |
|------|-------------|
| `intake` | A repo is added to the FHE-EPMC portfolio |
| `plan_refresh_approved` | A `DELIVERY_PLAN.md` refresh PR is merged |
| `pr_approved` | A PR receives an approving review |
| `pr_merged` | A PR is merged |
| `production_deploy_approved` | A production environment deploy is approved |
| `production_deploy_completed` | A production deploy has completed |
| `release_cut` | A new release tag is published |
| `secret_rotated` | A secret is rotated |
| `branch_protection_changed` | Branch protection rule modified |
| `agent_refusal_logged` | An agent refused a task per its refusal list |
| `break_glass_override` | An owner-authorised override of normal governance |
| `uat_verdict` | A UAT verdict is recorded |
| `milestone_closed` | A milestone closeout pack is completed |
| `incident_declared` | An incident is opened |
| `incident_resolved` | An incident is resolved with post-mortem reference |

---

## 4. Who Can Write Which Kinds?

| Kind | Allowed Actor Roles |
|------|---------------------|
| `intake` | Owner |
| `plan_refresh_approved` | Owner |
| `pr_approved` | any reviewer (auto-written by system) |
| `pr_merged` | system on merge |
| `production_deploy_approved` | Owner |
| `production_deploy_completed` | system |
| `release_cut` | Owner |
| `secret_rotated` | Owner |
| `branch_protection_changed` | Owner |
| `agent_refusal_logged` | system (by agent) |
| `break_glass_override` | Owner only, justification required |
| `uat_verdict` | UAT reviewer (via portal) |
| `milestone_closed` | Owner |
| `incident_declared` | Owner or Engineering Maintainer |
| `incident_resolved` | Owner |

---

## 5. Verification

A verifier walks the chain from genesis:
1. For each entry, recompute `hash` from canonical JSON.
2. Confirm the recomputed `hash` equals stored `hash`.
3. Confirm the next entry's `prevHash` equals this entry's `hash`.
4. On any mismatch, flag the chain as tampered and notify the Owner.

A scheduled verification job runs daily and writes an `audit_verification` event.

---

## 6. Break-Glass Discipline

Break-glass entries (`break_glass_override`) are reserved for genuine emergencies:
- Production outage requiring direct merge.
- Critical security fix that cannot wait for normal review.
- A frozen reviewer pool (out-of-hours).

Each break-glass entry must include:
- The specific governance step bypassed.
- The reason it could not wait.
- The rollback path.
- A linked incident issue.

A break-glass entry is reviewed at the next governance review; repeated break-glass without process improvement is itself a finding.

---

## 7. Phase 0 Practical Note

Until Phase 3 ships the database-backed ledger, ledger entries are recorded as commits to `docs/process/ledger/YYYY/MM/` as Markdown files following the entry schema (one file per entry). This produces a Git-native, hash-equivalent (commit SHA) chain that the Phase 3 implementation will ingest losslessly.

---

## 8. What the Ledger Is Not

- Not a chat log.
- Not a place for opinions or pre-decision discussion.
- Not a substitute for the Audit Log (which records every action by every user/agent, not just governance decisions).
- Not a place for PII.

---

## 9. Reading the Ledger

The Owner has direct read access. Other roles see a scoped subset:
- Production Delivery Manager: all entries except `break_glass_override` justifications redacted.
- Engineering Maintainer: PR-related entries for repos they have write access to.
- Security & Compliance: all `secret_rotated`, `branch_protection_changed`, `incident_*`, and security-related break-glass entries.
- UAT reviewer: their own `uat_verdict` entries only.
- External QA: none.
