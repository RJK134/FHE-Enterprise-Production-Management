# FHE-EPMC Architecture

> **Document owner:** Freddie Finn (RJK134)
> **Status:** Phase 0 Foundation — architecture-of-intent. Implementation begins Phase 1.
> **Last updated:** 2026-05-01

This document is the canonical architecture reference for FHE-EPMC. It is normative for Phase 1+ implementation. Where Phase 0 ships only documents and configuration, the architecture below describes the system that those documents and configuration are designed to support.

---

## 1. Architectural Principles

1. **GitHub is the source of truth.** Branches, PRs, checks, environments, releases, issues, and comments are authoritative. FHE-EPMC reads them; it does not duplicate them.
2. **Server-side only for credentials.** No GitHub or Anthropic token is ever exposed to the browser.
3. **Strict TypeScript, App Router, Server Components by default.** Client components only where interaction requires it.
4. **Typed service layer.** No raw `fetch` in components. All external IO goes through `lib/services/*` with Zod-validated boundaries.
5. **Append-only governance state.** The Approval Ledger and Audit Log never mutate prior entries.
6. **Least privilege.** Every token, every role, every environment is scoped to the minimum viable surface.
7. **Reversible by default.** Every shipped change has a documented rollback plan and is gated by branch protection + required checks.

---

## 2. High-Level System Diagram (text)

```
                ┌────────────────────────────────────────────┐
                │            FHE-EPMC Dashboard              │
                │      (Next.js 14 App Router, TS strict)    │
                │                                            │
                │ Server Components ── Tailwind UI ── RSC    │
                └──────────────┬───────────────┬─────────────┘
                               │               │
                       Server-only             │ Client (only where needed)
                               │               │
        ┌──────────────────────▼──────────────────────────┐
        │                Service Layer                    │
        │  github/  claude/  cursor/  evidence/  ledger/  │
        └──────┬─────────────┬───────────┬────────────────┘
               │             │           │
       ┌───────▼───────┐ ┌───▼─────┐ ┌──▼──────────────┐
       │ GitHub REST + │ │ Claude  │ │ Cursor Agents   │
       │ GraphQL APIs  │ │ Code    │ │ (GitHub App)    │
       │ (server token)│ │ GH App  │ │                 │
       └───────────────┘ └─────────┘ └─────────────────┘
               │
       ┌───────▼─────────┐    ┌────────────────────────┐
       │ Evidence Lake   │    │ Approval Ledger        │
       │ (object store)  │    │ (append-only DB table) │
       └─────────────────┘    └────────────────────────┘

                Cross-cutting: RBAC, Audit Log, Cost Meter,
                CodeQL, Dependabot, BugBot signals.
```

---

## 3. Components

### 3.1 Dashboard (Next.js 14)
- **Stack:** Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS.
- **Hosting:** Vercel (full app); GitHub Pages may host a static read-only public summary if useful.
- **Auth:** Phase 0 has no app; Phase 1 ships with placeholder auth; Phase 4 replaces with OIDC SSO.

### 3.2 Service Layer (`lib/services/*`)
- `github` — typed wrapper over Octokit + GraphQL with rate-limit-aware caching.
- `claude` — wraps Claude Code GitHub App webhooks/runs and the Anthropic API for any direct calls (cached, with prompt cache enabled where supported).
- `cursor` — bridges Cursor GitHub App run state and labels.
- `evidence` — reads/writes the Evidence Lake.
- `ledger` — appends to the Approval Ledger.
- `audit` — appends to the Audit Log.
- `cost` — aggregates spend signals across Anthropic, Cursor, and Actions minutes.

### 3.3 Persistence
- **Phase 0:** No database; all state lives in GitHub.
- **Phase 1+:** Postgres via Prisma for non-GitHub state (ledger, audit log, evidence index, cost meter snapshots).
- **Phase 3:** Object store (S3-compatible) for Evidence Lake artefacts; database holds the manifest/index only.

### 3.4 Background Workflows (GitHub Actions)
- `ci.yml` — lint + typecheck + test + build on every PR and on `main`.
- `claude.yml` — `@claude` trigger on issues and PRs.
- `claude-auto-review.yml` — automatic PR review on open/sync.
- `cursor-agent-manual.yml` — manual `workflow_dispatch` for Cursor agent.
- `repo-intelligence-scan.yml` — scheduled and on-demand repo intelligence scans.

### 3.5 Cursor Agent Runtime
- Lives in each portfolio repo as `FHE-Agent` persona, rules, environment.
- Triggers: `cursor` label, `@cursor`/`q:`/`explain:` comments, manual dispatch.
- Output: branch + PR + tracking comment.

---

## 4. Data Model (Phase 1+)

```
PortfolioRepo
  id, slug, displayName, repoOwner, repoName,
  stack, currentPhase, readinessScore, lastScanAt

Blocker
  id, repoId, summary, severity, ownerId,
  status, etaAt, openedAt, resolvedAt, evidenceRef

ScanRun
  id, repoId, runId, startedAt, finishedAt,
  reportArtefactRef, readinessDelta

LedgerEntry  (append-only)
  id, kind, repoId, prRef, actorId, action,
  justification, evidenceRefs[], createdAt, prevHash, hash

AuditEvent  (append-only)
  id, actorId, actorKind, action, targetKind,
  targetId, payloadJson, createdAt

UATRecord
  id, repoId, releaseCandidateRef, reviewerId,
  verdict, evidenceRefs[], notes, createdAt

CostSnapshot
  id, period, anthropicSpend, cursorSpend,
  actionsMinutes, perRepoBreakdownJson, createdAt
```

The Ledger uses a hash chain (`prevHash` → `hash` over canonical JSON) so any tampering is detectable.

---

## 5. RBAC

Eight roles per `PRODUCT_SPECIFICATION.md` §5. Permission matrix (Phase 4 implementation):

| Capability | Owner | Delivery Mgr | Eng Maintainer | Claude | Cursor | Sec & Compliance | UAT | External QA |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Read portfolio | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | scoped | scoped |
| Approve production deploy | ✓ | – | – | – | – | – | – | – |
| Merge PR | ✓ | – | with approval | – | – | – | – | – |
| Push to feature branch | ✓ | – | ✓ | claude/* only | cursor/* only | – | – | – |
| Approve PRs | ✓ | – | ✓ | – | – | block-only | – | – |
| Edit DELIVERY_PLAN.md | ✓ | ✓ | propose | propose | – | – | – | – |
| Rotate secrets | ✓ | – | – | – | – | – | – | – |
| Read Evidence Lake | ✓ | ✓ | ✓ | ✓ | – | ✓ | scoped | scoped |
| Write Ledger | ✓ | ✓ (limited) | – | – | – | ✓ (limited) | – | – |

---

## 6. Security Architecture

- **Token storage:** all tokens in GitHub Actions secrets or Vercel encrypted env. Never in code or `.env` committed files.
- **Token scope:** least privilege; per-repo PATs preferred; GitHub App installation tokens preferred over PATs once apps are configured.
- **Browser exposure:** zero. All GitHub API calls are server-side via API routes or Server Components.
- **PII boundary:** No real PII in this repo. PII handling lives in product repos with their own GDPR posture.
- **Logging:** Structured logs; PII never logged; secrets redacted via allow-listed serialiser.
- **Transport:** HTTPS-only; HSTS in production.
- **Storage at rest:** Encrypted database; encrypted object store.

---

## 7. Observability

- **Health checks:** `/api/health` for liveness and readiness.
- **Metrics:** Request latency, GitHub API rate-limit headroom, agent run durations, cost-per-run.
- **Logs:** Structured JSON logs with correlation IDs.
- **Alerts:** CodeQL high/critical → PagerDuty/email; Dependabot critical → email; readiness score regression > 5 points → email.

---

## 8. Deployment

- **Dev:** local Next.js + Postgres via docker-compose.
- **Staging:** Vercel preview deploys per PR. Configured by `vercel.json` at the repo root with `framework: nextjs`, region `lhr1`, `github.autoJobCancelation: true`. See `docs/process/vercel-integration.md`.
- **Production:** Vercel production environment, gated by the GitHub Environment `production` requiring Owner approval. Vercel reports deploys as a GitHub Check (`Vercel`) and writes GitHub Deployment records.
- **Phase 0 ignore step:** `scripts/vercel-ignore.sh` skips Vercel builds until `next.config.*` exists, and skips docs-only diffs once the app is in place — preventing empty/spurious deploys and conserving build minutes.
- **Database migrations:** Prisma migrate; never auto-applied to production; human approval required.

---

## 9. Reliability & DR

- **Backups:** Daily Postgres backup with 30-day retention; weekly Evidence Lake snapshot.
- **Restore objective:** RPO ≤ 24h, RTO ≤ 4h for the dashboard (the GitHub source of truth is independently durable).
- **Runbook:** `docs/process/` to host runbooks from Phase 5 onward.

---

## 10. Phase Boundaries for Architecture

| Concern | Phase introduced |
|---|---|
| GitHub-API-backed Control Tower | 1 |
| Claude Code Bridge | 2 |
| Plan Refresh Engine | 2 |
| Evidence Lake | 3 |
| Approval Ledger | 3 |
| Audit Log | 3 |
| RBAC + SSO | 4 |
| UAT Portal | 4 |
| Cost Meter | 5 |
| Release Governance | 5 |

Until each phase ships, FHE-EPMC must not pretend the capability exists. No simulated state.
