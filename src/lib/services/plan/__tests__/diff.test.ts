import { describe, it, expect } from "vitest";
import { renderPlanReport, diffPlan } from "@/lib/services/plan/diff";
import type { PlanSnapshot } from "@/lib/schemas/plan";

function makeSnapshot(overrides: Partial<PlanSnapshot> = {}): PlanSnapshot {
  return {
    computedAt: "2026-05-10T00:00:00.000Z",
    phases: Array.from({ length: 8 }, (_, i) => ({
      id: i as PlanSnapshot["phases"][number]["id"],
      name: `Phase ${i}`,
      status: i === 0 ? ("complete" as const) : i === 1 ? ("active" as const) : ("pending" as const),
      items: [
        {
          label: `Item ${i}`,
          priority: "P0" as const,
          done: i === 0,
          doneAt: i === 0 ? "2026-05-01T00:00:00.000Z" : null,
          evidence: i === 0 ? "PR #1" : null,
        },
      ],
    })),
    portfolio: { repos: 4, averageReadiness: 60, openBlockers: { total: 5, P0: 1, P1: 2, P2: 2 } },
    ...overrides,
  };
}

describe("renderPlanReport", () => {
  it("renders portfolio + phases + items in a deterministic order", () => {
    const snap = makeSnapshot();
    const out = renderPlanReport(snap);
    expect(out).toContain("# Plan refresh");
    expect(out).toContain("## Portfolio at a glance");
    expect(out).toContain("Managed products: **4**");
    expect(out).toContain("Average readiness: **60/100**");
    expect(out).toContain("Active blockers: **5** total (1 P0 · 2 P1 · 2 P2)");
    expect(out).toContain("## Phase 0 — Phase 0 (✓ Complete)");
    expect(out).toContain("## Phase 1 — Phase 1 (● Active)");
    expect(out).toContain("## Phase 7 — Phase 7 (○ Pending)");
    // Done items render with a tick; not-done with a space.
    expect(out).toContain("- [x] (P0) Item 0 — _PR #1_");
    expect(out).toContain("- [ ] (P0) Item 1");
  });

  it("produces identical output for two equal snapshots (deterministic)", () => {
    expect(renderPlanReport(makeSnapshot())).toBe(renderPlanReport(makeSnapshot()));
  });
});

describe("diffPlan", () => {
  it("returns empty diffs for two identical snapshots", () => {
    const d = diffPlan(makeSnapshot(), makeSnapshot());
    expect(d.phaseStatusChanges).toEqual([]);
    expect(d.itemDoneFlips).toEqual([]);
    expect(d.portfolioReadinessDelta).toBe(0);
    expect(d.blockerDelta).toBe(0);
  });

  it("detects a phase status flip pending → active", () => {
    const prev = makeSnapshot();
    const next = makeSnapshot();
    next.phases[2] = { ...next.phases[2]!, status: "active" };
    const d = diffPlan(prev, next);
    expect(d.phaseStatusChanges).toEqual([{ phaseId: 2, from: "pending", to: "active" }]);
  });

  it("detects an item done flip false → true", () => {
    const prev = makeSnapshot();
    const next = makeSnapshot();
    next.phases[2] = {
      ...next.phases[2]!,
      items: [{ ...next.phases[2]!.items[0]!, done: true }],
    };
    const d = diffPlan(prev, next);
    expect(d.itemDoneFlips).toEqual([
      { phaseId: 2, label: "Item 2", from: false, to: true },
    ]);
  });

  it("computes readiness + blocker deltas", () => {
    const prev = makeSnapshot();
    const next = makeSnapshot({
      portfolio: { repos: 4, averageReadiness: 80, openBlockers: { total: 2, P0: 0, P1: 1, P2: 1 } },
    });
    const d = diffPlan(prev, next);
    expect(d.portfolioReadinessDelta).toBe(20);
    expect(d.blockerDelta).toBe(-3);
  });
});
