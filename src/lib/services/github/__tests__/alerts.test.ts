import { describe, it, expect } from "vitest";
import { __summariseSeveritiesForTests } from "@/lib/services/github/alerts";

describe("alerts.summariseSeverities", () => {
  it("buckets canonical severities into the right counts", () => {
    const counts = __summariseSeveritiesForTests([
      "critical",
      "high",
      "medium",
      "low",
      "moderate",
      "warning",
      "error",
      "note",
      null,
      undefined,
      "unknown",
    ]);
    expect(counts.total).toBe(11);
    expect(counts.critical).toBe(1);
    expect(counts.high).toBe(2); // high + error
    expect(counts.medium).toBe(3); // medium + moderate + warning
    expect(counts.low).toBe(5); // low + note + null + undefined + unknown -> low default
  });

  it("returns zeros for an empty list", () => {
    const counts = __summariseSeveritiesForTests([]);
    expect(counts).toEqual({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  });
});
