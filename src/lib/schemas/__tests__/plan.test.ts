import { describe, it, expect } from "vitest";
import {
  PhaseSnapshot,
  PlanSnapshot,
  PhaseItem,
  PhaseStatus,
} from "@/lib/schemas/plan";

const VALID_ITEM = {
  label: "do a thing",
  priority: "P0" as const,
  done: true,
  doneAt: new Date().toISOString(),
  evidence: "PR #1",
};

describe("PhaseStatus", () => {
  it("accepts the three canonical statuses", () => {
    for (const s of ["complete", "active", "pending"] as const) {
      expect(PhaseStatus.safeParse(s).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(PhaseStatus.safeParse("done").success).toBe(false);
  });
});

describe("PhaseItem", () => {
  it("accepts a valid done item", () => {
    expect(PhaseItem.safeParse(VALID_ITEM).success).toBe(true);
  });

  it("accepts a not-done item with null doneAt and null evidence", () => {
    const ok = { label: "x", priority: "P1" as const, done: false, doneAt: null, evidence: null };
    expect(PhaseItem.safeParse(ok).success).toBe(true);
  });

  it("rejects an unknown priority", () => {
    const bad = { ...VALID_ITEM, priority: "P9" };
    expect(PhaseItem.safeParse(bad).success).toBe(false);
  });
});

describe("PhaseSnapshot", () => {
  it("accepts a valid snapshot", () => {
    const ok = {
      id: 1 as const,
      name: "Live Control Tower MVP",
      status: "active" as const,
      items: [VALID_ITEM],
    };
    expect(PhaseSnapshot.safeParse(ok).success).toBe(true);
  });

  it("rejects an out-of-range phase id", () => {
    const bad = { id: 12, name: "x", status: "pending" as const, items: [] };
    expect(PhaseSnapshot.safeParse(bad).success).toBe(false);
  });
});

describe("PlanSnapshot", () => {
  it("requires exactly 8 phases", () => {
    const tooFew = {
      computedAt: new Date().toISOString(),
      phases: [{ id: 0 as const, name: "F", status: "complete" as const, items: [] }],
      portfolio: { repos: 4, averageReadiness: 50, openBlockers: { total: 0, P0: 0, P1: 0, P2: 0 } },
    };
    expect(PlanSnapshot.safeParse(tooFew).success).toBe(false);
  });
});
