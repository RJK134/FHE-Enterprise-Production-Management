import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { __resetEnvForTests } from "@/lib/env";
import { __resetGithubClientForTests } from "@/lib/services/github/client";
import { computeReadiness } from "@/lib/services/readiness/score";
import type { PortfolioRepo } from "@/lib/schemas/repo";

const REPO: PortfolioRepo = {
  slug: "RJK134/example",
  displayName: "Example",
  stack: "Next.js",
  currentPhase: "Phase 1",
  readinessEstimate: 60,
  description: "Example repo for the test suite.",
};

const ORIGINAL = { ...process.env };

beforeEach(() => {
  __resetEnvForTests();
  __resetGithubClientForTests();
  vi.resetModules();
  vi.unstubAllEnvs();
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetEnvForTests();
  __resetGithubClientForTests();
  vi.restoreAllMocks();
});

describe("computeReadiness — registry estimate fallback", () => {
  it("returns the registry estimate across all axes when GITHUB_TOKEN is absent", async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_API_URL;
    delete process.env.PORTFOLIO_ALLOWLIST;
    const snap = await computeReadiness(REPO);
    expect(snap.source).toBe("registry-estimate");
    expect(snap.total).toBe(60);
    for (const axis of snap.axes) expect(axis.score).toBe(60);
  });

  it("emits a snapshot whose computedAt is a valid ISO string", async () => {
    delete process.env.GITHUB_TOKEN;
    const snap = await computeReadiness(REPO);
    expect(() => new Date(snap.computedAt).toISOString()).not.toThrow();
  });
});
