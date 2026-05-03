import { describe, it, expect } from "vitest";
import { listPortfolio, findPortfolioRepo } from "@/lib/services/portfolio/registry";

describe("portfolio registry", () => {
  it("returns a non-empty list with valid slugs", () => {
    const all = listPortfolio();
    expect(all.length).toBeGreaterThan(0);
    for (const repo of all) {
      expect(repo.slug).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
      expect(repo.displayName.length).toBeGreaterThan(0);
      expect(repo.readinessEstimate).toBeGreaterThanOrEqual(0);
      expect(repo.readinessEstimate).toBeLessThanOrEqual(100);
    }
  });

  it("filters by allowlist when provided", () => {
    const all = listPortfolio();
    const slug = all[0]?.slug;
    expect(slug).toBeDefined();
    if (!slug) return;
    const filtered = listPortfolio(slug);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe(slug);
  });

  it("returns the full list when allowlist is empty / whitespace", () => {
    const all = listPortfolio();
    expect(listPortfolio("")).toHaveLength(all.length);
    expect(listPortfolio("   ")).toHaveLength(all.length);
  });

  it("findPortfolioRepo returns the expected entry or undefined", () => {
    const all = listPortfolio();
    const slug = all[0]?.slug;
    if (!slug) throw new Error("registry empty");
    expect(findPortfolioRepo(slug)?.slug).toBe(slug);
    expect(findPortfolioRepo("does-not/exist")).toBeUndefined();
  });

  it("includes SJMS-2.5, EquiSmile, herm-platform and FHE-EPMC", () => {
    const slugs = listPortfolio().map((r) => r.slug);
    expect(slugs).toContain("RJK134/SJMS-2.5");
    expect(slugs).toContain("RJK134/EquiSmile");
    expect(slugs).toContain("RJK134/herm-platform");
    expect(slugs).toContain("RJK134/FHE-Enterprise-Production-Management");
  });
});
