import { describe, it, expect } from "vitest";
import { ReadinessSnapshot, ReadinessAxisScore } from "@/lib/schemas/readiness";

describe("ReadinessAxisScore", () => {
  it("accepts a valid axis score", () => {
    const ok = ReadinessAxisScore.safeParse({
      axis: "security",
      score: 80,
      weight: 18,
      signal: "CodeQL: 0 open",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects out-of-range score", () => {
    const bad = ReadinessAxisScore.safeParse({
      axis: "security",
      score: 200,
      weight: 18,
      signal: "x",
    });
    expect(bad.success).toBe(false);
  });

  it("rejects unknown axis", () => {
    const bad = ReadinessAxisScore.safeParse({
      axis: "made-up",
      score: 80,
      weight: 18,
      signal: "x",
    });
    expect(bad.success).toBe(false);
  });
});

describe("ReadinessSnapshot", () => {
  it("requires at least one axis", () => {
    const bad = ReadinessSnapshot.safeParse({
      slug: "rjk134/x",
      total: 80,
      axes: [],
      computedAt: new Date().toISOString(),
      source: "live",
    });
    expect(bad.success).toBe(false);
  });

  it("rejects unknown source", () => {
    const bad = ReadinessSnapshot.safeParse({
      slug: "rjk134/x",
      total: 80,
      axes: [{ axis: "security", score: 80, weight: 18, signal: "x" }],
      computedAt: new Date().toISOString(),
      source: "guessed",
    });
    expect(bad.success).toBe(false);
  });
});
