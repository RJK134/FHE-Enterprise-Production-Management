import "server-only";
import { Blockers, type Blocker } from "@/lib/schemas/blocker";

/**
 * Phase 1 blocker tracker.
 *
 * Append-only typed registry. Phase 3 will move this to the database alongside
 * the Evidence Lake; the schema in `src/lib/schemas/blocker.ts` is what the
 * ingestion will read, so the shape is stable.
 *
 * Discipline:
 * - Never delete a blocker. Resolved blockers stay here with
 *   `status: "resolved"` and `resolvedAt` set. Git history is the audit trail.
 * - One row per blocker ID. IDs are stable across status transitions.
 * - Evidence references are bare strings (URL, ledger key, scan-run id) so
 *   the format can evolve without re-validating the registry.
 */
const REGISTRY: ReadonlyArray<Blocker> = [
  {
    id: "EPMC-B1",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Repo secrets (ANTHROPIC_API_KEY, CURSOR_API_KEY) not configured",
    severity: "P0",
    status: "resolved",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: "2026-05-04T00:00:00.000Z",
    etaAt: null,
    description: "GitHub Actions secrets required by claude.yml and cursor-agent-manual.yml.",
    evidence: ["MEMORY.md#2026-05-04 — Owner-confirmed"],
    remediationPr: null,
  },
  {
    id: "EPMC-B2",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Branch protection on main not enabled",
    severity: "P0",
    status: "resolved",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: "2026-05-04T00:00:00.000Z",
    etaAt: null,
    description: "Default branch must require PR review and CI pass before merge.",
    evidence: ["MEMORY.md#2026-05-04 — Owner-confirmed", "PRs #5, #6, #7, #8 all merged via the PR-gated flow"],
    remediationPr: null,
  },
  {
    id: "EPMC-B3",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Claude Code GitHub App not installed",
    severity: "P0",
    status: "resolved",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: "2026-05-04T00:00:00.000Z",
    etaAt: null,
    description: "GitHub App required so claude.yml workflow can act on PRs.",
    evidence: ["MEMORY.md#2026-05-04 — Owner-confirmed"],
    remediationPr: null,
  },
  {
    id: "EPMC-B4",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Cursor GitHub App / BugBot not installed",
    severity: "P1",
    status: "resolved",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: "2026-05-04T00:00:00.000Z",
    etaAt: null,
    description: "Required for Cursor BugBot review comments on PRs.",
    evidence: ["MEMORY.md#2026-05-04 — Owner-confirmed"],
    remediationPr: null,
  },
  {
    id: "EPMC-B5",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "GitHub Environments (development, staging, production) not created",
    severity: "P1",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Production deploys cannot be gated by a manual approval rule until the environment exists.",
    evidence: ["docs/checklists/release-checklist.md"],
    remediationPr: null,
  },
  {
    id: "EPMC-B6",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "FutureHorizonsEducation org access constraint",
    severity: "P2",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-05-01T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Org admin action required to give FHE-EPMC visibility into FHE org repos beyond the current four.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "EPMC-B7",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Portfolio onboarding (SJMS-2.5 / EquiSmile / herm-platform) not yet run",
    severity: "P1",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-05-03T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "scripts/setup-repo-standards.sh must be run against each portfolio repo from a session whose GitHub MCP scope includes those repos.",
    evidence: ["docs/INTEGRATION_MAP.md §6"],
    remediationPr: null,
  },
  {
    id: "EPMC-B8",
    slug: "RJK134/FHE-Enterprise-Production-Management",
    title: "Documentation and operational readiness axes still registry-estimate",
    severity: "P2",
    status: "deferred",
    owner: "Engineering",
    openedAt: "2026-05-04T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Live signal arrives with Phase 3 (Evidence Lake) and Phase 5 (CI pass-rate ingestion). Until then the axes fall back to the registry estimate; the readiness badge marks the snapshot as 'partial'.",
    evidence: ["docs/checklists/enterprise-readiness-checklist.md", "src/lib/services/readiness/score.ts"],
    remediationPr: null,
  },
  {
    id: "SJMS-A1",
    slug: "RJK134/SJMS-2.5",
    title: "Branch protection gaps on main",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Tranche A hardening — main branch lacks required CI checks and review enforcement consistent with FHE-EPMC governance baseline.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "SJMS-A2",
    slug: "RJK134/SJMS-2.5",
    title: "Plaintext webhook + session secrets",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Secrets stored in plaintext within deployment env files / committed sources; must move to encrypted secret store.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "SJMS-A3",
    slug: "RJK134/SJMS-2.5",
    title: "No transactional outbox / DLQ for cross-system events",
    severity: "P1",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Cross-system writes (e.g. HESA submission, payments) require an outbox + dead-letter queue for at-least-once delivery.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "EQ-17-1",
    slug: "RJK134/EquiSmile",
    title: "Identity / multi-tenancy hardening",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Phase 17 stabilise — audit every query for tenantId scoping; remove cross-tenant leakage paths.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "EQ-17-2",
    slug: "RJK134/EquiSmile",
    title: "Stripe webhook idempotency",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Payment webhook handlers must dedupe by event id to prevent double charges on retry.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "HERM-P1",
    slug: "RJK134/herm-platform",
    title: "SSO / MFA enforcement",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Phase 1 close-out — SSO + MFA must be the only path for staff accounts.",
    evidence: [],
    remediationPr: null,
  },
  {
    id: "HERM-P2",
    slug: "RJK134/herm-platform",
    title: "Revocable session tokens",
    severity: "P0",
    status: "open",
    owner: "RJK134",
    openedAt: "2026-04-15T00:00:00.000Z",
    resolvedAt: null,
    etaAt: null,
    description: "Long-lived tokens must be revocable at session level so a compromised credential can be cut without rotating shared secrets.",
    evidence: [],
    remediationPr: null,
  },
];

const VALIDATED = Blockers.parse(REGISTRY);

/**
 * Returns every blocker, optionally filtered by repo slug, in registry order.
 */
export function listBlockers(slug?: string): ReadonlyArray<Blocker> {
  if (slug === undefined || slug.length === 0) return VALIDATED;
  return VALIDATED.filter((b) => b.slug === slug);
}

/**
 * Returns the count of open + in-progress blockers for a slug, broken down by
 * severity. Useful for the per-repo card / drill-down chrome.
 */
export function countActiveBlockers(slug: string): {
  total: number;
  P0: number;
  P1: number;
  P2: number;
} {
  const active = VALIDATED.filter(
    (b) => b.slug === slug && (b.status === "open" || b.status === "in-progress"),
  );
  return {
    total: active.length,
    P0: active.filter((b) => b.severity === "P0").length,
    P1: active.filter((b) => b.severity === "P1").length,
    P2: active.filter((b) => b.severity === "P2").length,
  };
}

/**
 * Finds a single blocker by id.
 */
export function findBlocker(id: string): Blocker | undefined {
  return VALIDATED.find((b) => b.id === id);
}
