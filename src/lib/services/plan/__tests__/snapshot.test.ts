import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { __resetEnvForTests } from "@/lib/env";
import { __resetGithubClientForTests } from "@/lib/services/github/client";
import {
  buildPlanSnapshot,
  __PHASES_FOR_TESTS,
  activeBlockersForPortfolio,
} from "@/lib/services/plan/snapshot";

const ORIGINAL = { ...process.env };

beforeEach(() => {
  __resetEnvForTests();
  __resetGithubClientForTests();
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetEnvForTests();
  __resetGithubClientForTests();
});

describe("__PHASES_FOR_TESTS", () => {
  it("has all 8 phases", () => {
    expect(__PHASES_FOR_TESTS).toHaveLength(8);
    expect(__PHASES_FOR_TESTS.map((p) => p.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("marks Phase 0 complete", () => {
    expect(__PHASES_FOR_TESTS[0]?.status).toBe("complete");
  });

  it("marks Phase 1 active (all P0 done; some P1 still open or recently done)", () => {
    const p1 = __PHASES_FOR_TESTS[1];
    expect(p1).toBeDefined();
    expect(["complete", "active"]).toContain(p1!.status);
  });

  it("marks Phases 3–7 pending (no items done yet)", () => {
    for (const id of [3, 4, 5, 6, 7] as const) {
      expect(__PHASES_FOR_TESTS[id]?.status).toBe("pending");
    }
  });

  it("Phase 2 is active because the plan refresh engine snapshot item is marked done", () => {
    expect(__PHASES_FOR_TESTS[2]?.status).toBe("active");
  });
});

describe("buildPlanSnapshot — no GitHub token", () => {
  it("falls back to registry estimate for readiness; still emits a valid snapshot", async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_API_URL;
    delete process.env.PORTFOLIO_ALLOWLIST;
    const snap = await buildPlanSnapshot();
    expect(snap.phases).toHaveLength(8);
    expect(snap.portfolio.repos).toBeGreaterThan(0);
    expect(snap.portfolio.averageReadiness).toBeGreaterThanOrEqual(0);
    expect(snap.portfolio.averageReadiness).toBeLessThanOrEqual(100);
    expect(snap.portfolio.openBlockers.total).toBe(
      snap.portfolio.openBlockers.P0 +
        snap.portfolio.openBlockers.P1 +
        snap.portfolio.openBlockers.P2,
    );
    // computedAt is a valid ISO
    expect(() => new Date(snap.computedAt).toISOString()).not.toThrow();
  });
});

describe("activeBlockersForPortfolio", () => {
  it("returns counts per portfolio slug", () => {
    const out = activeBlockersForPortfolio();
    const slugs = Object.keys(out);
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs).toContain("RJK134/SJMS-2.5");
    for (const slug of slugs) {
      const c = out[slug]!;
      expect(c.total).toBe(c.P0 + c.P1 + c.P2);
    }
  });
});
