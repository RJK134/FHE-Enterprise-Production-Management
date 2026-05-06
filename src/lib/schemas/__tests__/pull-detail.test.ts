import { describe, it, expect } from "vitest";
import {
  CheckRunDetail,
  PullRequestDetail,
  ReviewSummary,
  MergeReadiness,
} from "@/lib/schemas/pull-detail";

describe("CheckRunDetail", () => {
  it("accepts a completed run", () => {
    const ok = CheckRunDetail.safeParse({
      id: 1,
      name: "ci/lint",
      status: "completed",
      conclusion: "success",
      htmlUrl: "https://github.com/rjk134/repo/runs/1",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    expect(ok.success).toBe(true);
  });

  it("accepts an in-progress run with null conclusion", () => {
    const ok = CheckRunDetail.safeParse({
      id: 2,
      name: "ci/build",
      status: "in_progress",
      conclusion: null,
      htmlUrl: null,
      startedAt: null,
      completedAt: null,
    });
    expect(ok.success).toBe(true);
  });

  it("rejects unknown status", () => {
    const bad = CheckRunDetail.safeParse({
      id: 3,
      name: "x",
      status: "running",
      conclusion: null,
      htmlUrl: null,
      startedAt: null,
      completedAt: null,
    });
    expect(bad.success).toBe(false);
  });
});

describe("ReviewSummary", () => {
  it("rejects negative counts", () => {
    expect(ReviewSummary.safeParse({ approvals: -1, changesRequested: 0, pending: 0 }).success).toBe(
      false,
    );
  });
});

describe("PullRequestDetail", () => {
  it("accepts a complete fixture", () => {
    const ok = PullRequestDetail.safeParse({
      number: 7,
      title: "feat: x",
      authorLogin: "octocat",
      isDraft: false,
      state: "open",
      htmlUrl: "https://github.com/r/r/pull/7",
      headRef: "feat/x",
      headSha: "abc123",
      baseRef: "main",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mergeable: true,
      reviews: { approvals: 1, changesRequested: 0, pending: 0 },
      checkRuns: [],
      branchProtectionEnabled: true,
      branchProtectionRequiresReviews: true,
      branchProtectionRequiredApprovingReviewCount: 1,
      branchProtectionRequiredChecks: ["lint", "build"],
    });
    expect(ok.success).toBe(true);
  });

  it("accepts null branch-protection fields when signal is unavailable", () => {
    const ok = PullRequestDetail.safeParse({
      number: 8,
      title: "feat: y",
      authorLogin: "octocat",
      isDraft: false,
      state: "open",
      htmlUrl: "https://github.com/r/r/pull/8",
      headRef: "feat/y",
      headSha: "def456",
      baseRef: "main",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mergeable: null,
      reviews: { approvals: 0, changesRequested: 0, pending: 0 },
      checkRuns: [],
      branchProtectionEnabled: null,
      branchProtectionRequiresReviews: null,
      branchProtectionRequiredApprovingReviewCount: null,
      branchProtectionRequiredChecks: [],
    });
    expect(ok.success).toBe(true);
  });
});

describe("MergeReadiness", () => {
  it("accepts ready true with empty reasons", () => {
    expect(MergeReadiness.safeParse({ ready: true, reasons: [] }).success).toBe(true);
  });
});
