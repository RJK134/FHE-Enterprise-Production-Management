import { describe, it, expect } from "vitest";
import type { PullRequestDetail } from "@/lib/schemas/pull-detail";
import { evaluateMergeReadiness } from "@/lib/services/github/pull-detail";

const BASE: PullRequestDetail = {
  number: 1,
  title: "feat: thing",
  authorLogin: "octocat",
  isDraft: false,
  state: "open",
  htmlUrl: "https://github.com/r/r/pull/1",
  headRef: "feat/thing",
  headSha: "abc",
  baseRef: "main",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mergeable: true,
  reviews: { approvals: 1, changesRequested: 0, pending: 0 },
  checkRuns: [],
  branchProtectionRequiresReviews: true,
  branchProtectionRequiredChecks: [],
};

describe("evaluateMergeReadiness", () => {
  it("returns ready when nothing blocks", () => {
    const r = evaluateMergeReadiness(BASE);
    expect(r.ready).toBe(true);
    expect(r.reasons).toEqual([]);
  });

  it("blocks when PR is a draft", () => {
    const r = evaluateMergeReadiness({ ...BASE, isDraft: true });
    expect(r.ready).toBe(false);
    expect(r.reasons).toContain("PR is a draft");
  });

  it("blocks on changes requested", () => {
    const r = evaluateMergeReadiness({
      ...BASE,
      reviews: { approvals: 1, changesRequested: 1, pending: 0 },
    });
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.includes("requested changes"))).toBe(true);
  });

  it("blocks when below the configured min approvals", () => {
    const r = evaluateMergeReadiness(
      { ...BASE, reviews: { approvals: 1, changesRequested: 0, pending: 0 } },
      { minApprovals: 2 },
    );
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.includes("of 2 required approvals"))).toBe(true);
  });

  it("blocks when a required check is missing", () => {
    const r = evaluateMergeReadiness({
      ...BASE,
      branchProtectionRequiredChecks: ["lint", "build"],
      checkRuns: [
        {
          id: 1,
          name: "lint",
          status: "completed",
          conclusion: "success",
          htmlUrl: null,
          startedAt: null,
          completedAt: null,
        },
      ],
    });
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.includes('"build" missing'))).toBe(true);
  });

  it("blocks when a required check is not green", () => {
    const r = evaluateMergeReadiness({
      ...BASE,
      branchProtectionRequiredChecks: ["lint"],
      checkRuns: [
        {
          id: 1,
          name: "lint",
          status: "completed",
          conclusion: "failure",
          htmlUrl: null,
          startedAt: null,
          completedAt: null,
        },
      ],
    });
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.includes('"lint" not green'))).toBe(true);
  });

  it("blocks on non-protected repos when any check fails", () => {
    const r = evaluateMergeReadiness({
      ...BASE,
      checkRuns: [
        {
          id: 1,
          name: "x",
          status: "completed",
          conclusion: "failure",
          htmlUrl: null,
          startedAt: null,
          completedAt: null,
        },
      ],
    });
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.includes("check(s) failing"))).toBe(true);
  });

  it("blocks when GitHub reports mergeable=false", () => {
    const r = evaluateMergeReadiness({ ...BASE, mergeable: false });
    expect(r.ready).toBe(false);
    expect(r.reasons.some((x) => x.toLowerCase().includes("not mergeable"))).toBe(true);
  });

  it("does not block when mergeable is null (unknown)", () => {
    const r = evaluateMergeReadiness({ ...BASE, mergeable: null });
    expect(r.ready).toBe(true);
  });
});
