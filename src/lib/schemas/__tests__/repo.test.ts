import { describe, it, expect } from "vitest";
import { Portfolio, PortfolioRepo, RepoSlug } from "@/lib/schemas/repo";

describe("RepoSlug", () => {
  it("accepts owner/name pairs", () => {
    expect(RepoSlug.safeParse("rjk134/sjms-2.5").success).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(RepoSlug.safeParse("only-name").success).toBe(false);
    expect(RepoSlug.safeParse("/name").success).toBe(false);
    expect(RepoSlug.safeParse("owner/").success).toBe(false);
    expect(RepoSlug.safeParse("owner/name/extra").success).toBe(false);
  });
});

describe("PortfolioRepo schema", () => {
  it("accepts a complete entry", () => {
    const ok = PortfolioRepo.safeParse({
      slug: "rjk134/example",
      displayName: "Example",
      stack: "Next.js",
      currentPhase: "Phase 1",
      readinessEstimate: 50,
      description: "Some description.",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects out-of-range readiness", () => {
    const bad = PortfolioRepo.safeParse({
      slug: "rjk134/example",
      displayName: "Example",
      stack: "Next.js",
      currentPhase: "Phase 1",
      readinessEstimate: 200,
      description: "Bad.",
    });
    expect(bad.success).toBe(false);
  });
});

describe("Portfolio schema", () => {
  it("rejects empty arrays", () => {
    expect(Portfolio.safeParse([]).success).toBe(false);
  });
});
