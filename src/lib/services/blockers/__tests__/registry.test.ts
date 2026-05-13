import { describe, it, expect } from "vitest";
import { listBlockers, countActiveBlockers, findBlocker } from "@/lib/services/blockers/registry";

describe("blocker registry", () => {
  it("contains at least one blocker per managed product", () => {
    expect(listBlockers("RJK134/SJMS-2.5").length).toBeGreaterThan(0);
    expect(listBlockers("RJK134/EquiSmile").length).toBeGreaterThan(0);
    expect(listBlockers("RJK134/herm-platform").length).toBeGreaterThan(0);
    expect(listBlockers("RJK134/FHE-Enterprise-Production-Management").length).toBeGreaterThan(0);
  });

  it("returns the full list when slug is undefined or empty", () => {
    const all = listBlockers();
    expect(listBlockers("").length).toBe(all.length);
    expect(all.length).toBeGreaterThanOrEqual(15);
  });

  it("counts active blockers by severity", () => {
    const c = countActiveBlockers("RJK134/SJMS-2.5");
    expect(c.total).toBe(c.P0 + c.P1 + c.P2);
    expect(c.P0).toBeGreaterThanOrEqual(1); // SJMS-A1, SJMS-A2 are P0 open
  });

  it("treats resolved/deferred blockers as inactive", () => {
    const c = countActiveBlockers("RJK134/FHE-Enterprise-Production-Management");
    // EPMC-B1..B4 are resolved, EPMC-B8 is deferred; B5/B6/B7 are open.
    // We don't pin to an exact number to keep the test robust to additions,
    // but resolved/deferred should NOT contribute.
    expect(c.total).toBeGreaterThanOrEqual(2);
    expect(c.total).toBeLessThan(listBlockers("RJK134/FHE-Enterprise-Production-Management").length);
  });

  it("findBlocker returns the expected entry or undefined", () => {
    expect(findBlocker("EPMC-B1")?.id).toBe("EPMC-B1");
    expect(findBlocker("nope")).toBeUndefined();
  });
});
