import "server-only";
import {
  PlanSnapshot,
  type PhaseItem,
  type PhaseSnapshot,
  type PhaseId,
  type PhaseStatus,
} from "@/lib/schemas/plan";
import { listPortfolio } from "@/lib/services/portfolio/registry";
import { countActiveBlockers, listBlockers } from "@/lib/services/blockers/registry";
import { computeReadiness } from "@/lib/services/readiness/score";

/**
 * Plan Refresh Engine — Phase 2 P0.
 *
 * Derives the canonical "what should `docs/DELIVERY_PLAN.md` say right now?"
 * state from the structured truth sources (blocker registry, portfolio
 * registry, readiness service) plus a hand-curated phase item map below.
 *
 * Discipline: this module is the source of truth for "which line items are
 * done"; the hand-edited `docs/DELIVERY_PLAN.md` is the published view. The
 * Plan page on the dashboard renders the snapshot, and the `diff.ts` module
 * produces a markdown report the owner can paste into a planning PR (or that
 * Phase 2 P1 can emit as an automatic PR).
 *
 * To mark a Phase line item done, set `done: true` and supply `doneAt` plus
 * `evidence` (typically a merged PR ref or commit SHA). Resolved items stay
 * here; the snapshot is append-only in the same spirit as the blocker
 * tracker.
 */

type PhaseDef = {
  readonly id: PhaseId;
  readonly name: string;
  readonly items: ReadonlyArray<PhaseItem>;
  /**
   * Optional override. When set, this status wins over the derived one.
   * Used for phases whose completion semantics depend on external signals
   * (e.g. owner-side actions) the engine cannot observe.
   */
  readonly statusOverride?: PhaseStatus;
};

const PHASES: ReadonlyArray<PhaseDef> = [
  {
    id: 0,
    name: "Foundation",
    statusOverride: "complete",
    items: [
      {
        label: "Identity files (README, CLAUDE, MEMORY, SKILLS)",
        priority: "P0",
        done: true,
        doneAt: "2026-05-01T00:00:00.000Z",
        evidence: "initial identity push",
      },
      {
        label: "docs/ canonical set (spec, plan, architecture, integration, prompts, process, checklists)",
        priority: "P0",
        done: true,
        doneAt: "2026-05-01T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#5",
      },
      {
        label: "Issue + PR templates, dependabot, workflows (ci/claude/cursor/scan)",
        priority: "P0",
        done: true,
        doneAt: "2026-05-01T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#5",
      },
      {
        label: ".cursor/ FHE-Agent + rules + environment",
        priority: "P0",
        done: true,
        doneAt: "2026-05-01T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#5",
      },
      {
        label: "scripts/ setup-repo-standards + review-intelligence + verify-foundation (bash + ps1)",
        priority: "P0",
        done: true,
        doneAt: "2026-05-01T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#5",
      },
      {
        label: "Branch protection on main",
        priority: "P1",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "EPMC-B2 resolved (Owner-confirmed)",
      },
      {
        label: "ANTHROPIC_API_KEY + CURSOR_API_KEY secrets configured",
        priority: "P1",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "EPMC-B1 resolved (Owner-confirmed)",
      },
      {
        label: "Claude Code GitHub App + Cursor GitHub App installed",
        priority: "P1",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "EPMC-B3 + EPMC-B4 resolved (Owner-confirmed)",
      },
      {
        label: "Dependabot active",
        priority: "P1",
        done: true,
        doneAt: "2026-05-02T00:00:00.000Z",
        evidence: "PRs #2, #3, #4, #10, #11, #12, #15, #16, #19 merged",
      },
      {
        label: "Vercel for GitHub installed + project wired",
        priority: "P1",
        done: true,
        doneAt: "2026-05-02T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#5",
      },
      {
        label: "CodeQL workflow scaffolded",
        priority: "P2",
        done: true,
        doneAt: "2026-05-06T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#8",
      },
      {
        label: "GitHub Environments (development / staging / production)",
        priority: "P2",
        done: false,
        doneAt: null,
        evidence: "EPMC-B5 — Owner action; status not visible from dashboard yet",
      },
      {
        label: "Auto-merge enabled on the repo",
        priority: "P2",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "PRs #2..#19 merged via auto-merge",
      },
    ],
  },
  {
    id: 1,
    name: "Live Control Tower MVP",
    items: [
      {
        label: "Next.js 14/15 App Router skeleton with strict TS and Tailwind",
        priority: "P0",
        done: true,
        doneAt: "2026-05-03T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#6",
      },
      {
        label: "Server-side GitHub client with secret-store-only token management",
        priority: "P0",
        done: true,
        doneAt: "2026-05-03T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#6",
      },
      {
        label: "Live PR list per repo with check status",
        priority: "P0",
        done: true,
        doneAt: "2026-05-03T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#6",
      },
      {
        label: "Portfolio Registry page from typed config",
        priority: "P0",
        done: true,
        doneAt: "2026-05-03T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#6",
      },
      {
        label: "Live readiness score from real signals (branch protection / CodeQL / Dependabot)",
        priority: "P0",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#7",
      },
      {
        label: "Per-repo blocker tracker (append-only)",
        priority: "P1",
        done: true,
        doneAt: "2026-05-10T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#20",
      },
      {
        label: "Per-PR drill-down with merge readiness signal",
        priority: "P1",
        done: true,
        doneAt: "2026-05-04T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#7",
      },
      {
        label: "Authentication wall (placeholder; SSO in Phase 4)",
        priority: "P1",
        done: true,
        doneAt: "2026-05-06T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#8",
      },
      {
        label: "BugBot/Copilot/Claude review-state attribution on PR rows",
        priority: "P1",
        done: true,
        doneAt: "2026-05-10T00:00:00.000Z",
        evidence: "RJK134/FHE-Enterprise-Production-Management#20",
      },
    ],
  },
  {
    id: 2,
    name: "Agent Bridge & Plan Engine",
    items: [
      {
        label: "Plan refresh engine: snapshot + diff + report",
        priority: "P0",
        done: true,
        doneAt: "2026-05-13T00:00:00.000Z",
        evidence: "this PR (Phase 2 P0 first cut)",
      },
      {
        label: "Plan refresh engine: emit an automatic DELIVERY_PLAN.md diff PR",
        priority: "P1",
        done: false,
        doneAt: null,
        evidence: null,
      },
      {
        label: "Claude Code Bridge: handoff pack generator, MEMORY.md drift detector",
        priority: "P0",
        done: false,
        doneAt: null,
        evidence: null,
      },
      {
        label: "Prompts library expanded with reusable scoped prompts per blocker class",
        priority: "P0",
        done: false,
        doneAt: null,
        evidence: null,
      },
      {
        label: "Repo Deep-Review Engine",
        priority: "P1",
        done: false,
        doneAt: null,
        evidence: null,
      },
      {
        label: "Per-session evidence capture from Claude transcripts",
        priority: "P1",
        done: false,
        doneAt: null,
        evidence: null,
      },
    ],
  },
  {
    id: 3,
    name: "Evidence Lake & Governance Ledger",
    items: [
      { label: "Evidence Lake schema and ingest endpoints", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Append-only Governance Ledger", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Audit Log MVP", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Search across Evidence Lake", priority: "P1", done: false, doneAt: null, evidence: null },
      { label: "Ledger export for external audit", priority: "P1", done: false, doneAt: null, evidence: null },
    ],
  },
  {
    id: 4,
    name: "RBAC, SSO, UAT Portal",
    items: [
      { label: "RBAC with the eight roles in PRODUCT_SPECIFICATION.md §5", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "OIDC SSO integration", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "UAT Portal — scoped link, evidence upload, verdict capture", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "MFA enforcement", priority: "P1", done: false, doneAt: null, evidence: null },
      { label: "Revocable session tokens", priority: "P1", done: false, doneAt: null, evidence: null },
    ],
  },
  {
    id: 5,
    name: "Release Governance & Cost Meter",
    items: [
      { label: "GitHub Environments protected per role", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Release notes pipeline tied to merged PR labels", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Cost Meter for Anthropic + Cursor + Actions minutes", priority: "P0", done: false, doneAt: null, evidence: null },
    ],
  },
  {
    id: 6,
    name: "Portfolio Hardening",
    items: [
      { label: "SJMS-2.5 readiness ≥ 85/100", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "EquiSmile readiness ≥ 80/100", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "HERM Platform readiness ≥ 85/100", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "FHE-EPMC readiness ≥ 90/100", priority: "P0", done: false, doneAt: null, evidence: null },
    ],
  },
  {
    id: 7,
    name: "Continuous Improvement",
    items: [
      { label: "Quarterly governance reviews", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Annual DR drills per repo", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Continuous CodeQL/Dependabot remediation", priority: "P0", done: false, doneAt: null, evidence: null },
      { label: "Quarterly readiness rescore with stakeholder review", priority: "P0", done: false, doneAt: null, evidence: null },
    ],
  },
];

function deriveStatus(def: PhaseDef): PhaseStatus {
  if (def.statusOverride !== undefined) return def.statusOverride;
  const required = def.items.filter((i) => i.priority === "P0");
  const doneP0 = required.filter((i) => i.done).length;
  if (required.length > 0 && doneP0 === required.length) {
    const anyOpen = def.items.some((i) => !i.done);
    return anyOpen ? "active" : "complete";
  }
  if (def.items.some((i) => i.done)) return "active";
  return "pending";
}

function snapshotPhase(def: PhaseDef): PhaseSnapshot {
  return {
    id: def.id,
    name: def.name,
    status: deriveStatus(def),
    items: def.items.map((i) => ({ ...i })),
  };
}

/**
 * Returns the full plan snapshot. Pure with respect to PHASES; the only
 * I/O is into `computeReadiness()` for the portfolio average, which itself
 * degrades gracefully when no GitHub token is configured.
 */
export async function buildPlanSnapshot(): Promise<PlanSnapshot> {
  const computedAt = new Date().toISOString();
  const repos = listPortfolio();

  const readinessTotals = await Promise.all(repos.map((r) => computeReadiness(r)));
  const sum = readinessTotals.reduce((acc, s) => acc + s.total, 0);
  const averageReadiness = repos.length > 0 ? Math.round(sum / repos.length) : 0;

  const allBlockers = listBlockers();
  const allActive = allBlockers.filter((b) => b.status === "open" || b.status === "in-progress");
  const openBlockers = {
    total: allActive.length,
    P0: allActive.filter((b) => b.severity === "P0").length,
    P1: allActive.filter((b) => b.severity === "P1").length,
    P2: allActive.filter((b) => b.severity === "P2").length,
  };

  return PlanSnapshot.parse({
    computedAt,
    phases: PHASES.map(snapshotPhase),
    portfolio: { repos: repos.length, averageReadiness, openBlockers },
  });
}

/**
 * @internal Exposed for tests so they can derive phase status without
 * touching the GitHub-dependent `buildPlanSnapshot`. Real-life callers
 * should use `buildPlanSnapshot()`.
 */
export const __PHASES_FOR_TESTS = PHASES.map(snapshotPhase);

// We also need to count blockers per slug for the rendered report.
export function activeBlockersForPortfolio(): Record<string, ReturnType<typeof countActiveBlockers>> {
  const out: Record<string, ReturnType<typeof countActiveBlockers>> = {};
  for (const r of listPortfolio()) out[r.slug] = countActiveBlockers(r.slug);
  return out;
}
