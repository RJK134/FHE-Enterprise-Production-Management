# Evidence Model

> Canonical structure of the Evidence Lake.
> **Last updated:** 2026-05-01

The Evidence Lake is the immutable, append-only store of every artefact that justifies an FHE-EPMC decision. This document defines what is captured, where it is stored, how it is keyed, and who can read it.

---

## 1. Why an Evidence Lake?

Enterprise governance, GDPR, UAT sign-off, release readiness, and post-incident review all require *traceable* evidence. The Evidence Lake exists so that any decision in the ledger can be reconstructed from primary artefacts at any future date.

---

## 2. Artefact Classes

| Class | Examples | Source |
|-------|----------|--------|
| `scan_report` | Repo intelligence scan output, CodeQL summary | `repo-intelligence-scan.yml` |
| `ci_run` | CI workflow run artefacts | GitHub Actions |
| `pr_snapshot` | PR diff, review thread, check states at merge | GitHub API capture at merge |
| `claude_session` | Session prompts, summary, files touched | Claude Code Bridge |
| `cursor_run` | Cursor agent run URL, branch, PR | Cursor API |
| `uat_record` | Verdict, attachments, reviewer, timestamp | UAT Portal |
| `release_notes` | Generated release notes | Release workflow |
| `rollback_plan` | Plain-text rollback steps | PR body extraction |
| `dependency_baseline` | Lockfile snapshot at release | CI |
| `accessibility_report` | axe / Lighthouse scores | CI |
| `security_finding` | CodeQL finding triage record | CodeQL + manual triage |
| `incident_report` | Post-mortem | Manual |

---

## 3. Storage

- **Phase 0–2:** GitHub-native — artefacts live as GitHub Actions artefacts, PR/issue comments, and committed files in the relevant repo. The Evidence Lake "manifest" is implicit in GitHub.
- **Phase 3+:** Object store (S3-compatible) for binary artefacts; Postgres table `EvidenceManifest` for the index. All inserts immutable.

---

## 4. Manifest Record (Phase 3+)

```
EvidenceManifest {
  id              uuid         primary key
  repoId          uuid         indexed
  artefactClass   enum         indexed
  artefactKey     string       unique-per-repo
  storedAt        timestamptz  indexed
  source          string       (workflow run URL, PR ref, etc.)
  contentHash     string       (sha256 of canonical payload)
  bytes           int
  retentionPolicy enum         (default 7 years)
  createdAt       timestamptz  default now()
}
```

Every manifest record is **append-only**. Updates are forbidden; corrections are made by inserting a superseding record with `supersedes` pointer.

---

## 5. Naming Conventions

```
{repo-slug}/{phase}/{artefact-class}/{YYYYMMDD-HHMM}-{short-hash}.{ext}
```

Example:
```
sjms-2.5/phase-0/scan_report/20260501-1430-7f3a2c.md
```

---

## 6. Retention

- Default retention: **7 years** for governance evidence.
- UAT records: 7 years.
- Release notes & rollback plans: indefinite.
- Claude session transcripts: 2 years (refresh policy with owner).
- Dependency baselines: 7 years.
- PII: prohibited in this lake; PII evidence remains inside the originating product repo with its own GDPR posture.

---

## 7. Access Control

| Role | Read | Write |
|------|:---:|:---:|
| Owner | ✓ | via system |
| Production Delivery Manager | ✓ | via system |
| Engineering Maintainer | ✓ | via system |
| Security & Compliance | ✓ | via system |
| Claude Code | ✓ scoped | via system |
| Cursor agent | – | – |
| UAT reviewer | scoped (own UAT records only) | via UAT Portal |
| External QA | scoped (their findings only) | via portal |

All reads and writes are logged in the Audit Log (`AuditEvent`).

---

## 8. Querying

- By repo + phase + class + date range.
- By PR ref to reconstruct a merge moment.
- By release tag to assemble a full release evidence bundle.
- By blocker ID to trace remediation history.

---

## 9. What is NOT in the Evidence Lake

- Live PR/check state — read directly from GitHub.
- Real PII — stored only inside product repos with appropriate compliance.
- Secrets — never stored; if accidentally captured, they are rotated and the artefact purged with a corresponding incident record.

---

## 10. Phase 0 Practical Note

Until Phase 3 ships, "the Evidence Lake" means: GitHub Actions artefacts + committed `docs/process/*` records + linked PR/issue comments. Use the naming convention above when committing reports so the Phase 3 ingestion can index them losslessly.
