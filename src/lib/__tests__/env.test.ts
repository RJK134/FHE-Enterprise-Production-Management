import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { env, isGithubConfigured, __resetEnvForTests } from "@/lib/env";

const ORIGINAL = { ...process.env };

beforeEach(() => {
  __resetEnvForTests();
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetEnvForTests();
});

describe("env()", () => {
  it("returns parsed env when GITHUB_TOKEN is present", () => {
    process.env.GITHUB_TOKEN = "ghp_dummy_for_tests_only";
    delete process.env.GITHUB_API_URL;
    delete process.env.PORTFOLIO_ALLOWLIST;
    const e = env();
    expect(e.GITHUB_TOKEN).toBe("ghp_dummy_for_tests_only");
    expect(isGithubConfigured()).toBe(true);
  });

  it("returns parsed env when GITHUB_TOKEN is absent (Phase 0)", () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_API_URL;
    delete process.env.PORTFOLIO_ALLOWLIST;
    const e = env();
    expect(e.GITHUB_TOKEN).toBeUndefined();
    expect(isGithubConfigured()).toBe(false);
  });

  it("rejects malformed GITHUB_API_URL", () => {
    process.env.GITHUB_TOKEN = "ghp_dummy";
    process.env.GITHUB_API_URL = "not a url";
    expect(() => env()).toThrowError(/Invalid environment/);
  });
});
