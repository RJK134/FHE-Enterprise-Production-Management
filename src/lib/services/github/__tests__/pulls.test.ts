import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestError } from "@octokit/request-error";

// Mock the github client module before importing the service under test.
vi.mock("@/lib/services/github/client", () => ({
  getGithubClient: vi.fn(),
}));

import { listOpenPullRequests } from "@/lib/services/github/pulls";
import { getGithubClient } from "@/lib/services/github/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal pull-request-like object that satisfies the Zod schema
 * and the `PullsListItem` shape used inside `listOpenPullRequests`.
 */
function makePr(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    number: 1,
    title: "Test PR",
    draft: false,
    html_url: "https://github.com/owner/repo/pull/1",
    user: { login: "author" },
    head: { sha: "abc123", ref: "feature-branch" },
    base: { ref: "main" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    ...overrides,
  };
}

/**
 * Creates a `RequestError` compatible with `@octokit/request-error`.
 * The constructor signature is `(message, statusCode, options)`.
 */
function makeRequestError(status: number): RequestError {
  return new RequestError("test error", status, {
    request: {
      method: "GET",
      url: "https://api.github.com/test",
      headers: {},
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listOpenPullRequests — check-run error handling", () => {
  let mockPullsList: ReturnType<typeof vi.fn>;
  let mockChecksListForRef: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPullsList = vi.fn();
    mockChecksListForRef = vi.fn();
    (getGithubClient as ReturnType<typeof vi.fn>).mockReturnValue({
      pulls: { list: mockPullsList },
      checks: { listForRef: mockChecksListForRef },
    });
  });

  it("returns an empty array when there is no GitHub client (not configured)", async () => {
    (getGithubClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const result = await listOpenPullRequests("RJK134/test-repo");
    expect(result).toEqual([]);
  });

  it("throws when the slug is malformed", async () => {
    await expect(listOpenPullRequests("not-a-valid-slug")).rejects.toThrow();
  });

  it("returns PR summaries with check counts on success", async () => {
    mockPullsList.mockResolvedValue({
      data: [makePr()],
    });
    mockChecksListForRef.mockResolvedValue({
      data: {
        check_runs: [
          { status: "completed", conclusion: "success" },
          { status: "completed", conclusion: "failure" },
          { status: "in_progress", conclusion: null },
        ],
      },
    });

    const result = await listOpenPullRequests("RJK134/test-repo");
    expect(result).toHaveLength(1);
    expect(result[0]?.checks).toEqual({
      total: 3,
      success: 1,
      failure: 1,
      pending: 1,
      neutral: 0,
    });
  });

  it("silently degrades to empty checks on a 404 from the checks API", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(makeRequestError(404));

    const result = await listOpenPullRequests("RJK134/test-repo");
    expect(result).toHaveLength(1);
    expect(result[0]?.checks).toEqual({
      total: 0,
      success: 0,
      failure: 0,
      pending: 0,
      neutral: 0,
    });
  });

  it("silently degrades to empty checks on a 422 from the checks API", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(makeRequestError(422));

    const result = await listOpenPullRequests("RJK134/test-repo");
    expect(result).toHaveLength(1);
    expect(result[0]?.checks).toEqual({
      total: 0,
      success: 0,
      failure: 0,
      pending: 0,
      neutral: 0,
    });
  });

  it("re-throws a 403 (insufficient scope) so the caller can surface misconfiguration", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(makeRequestError(403));

    await expect(listOpenPullRequests("RJK134/test-repo")).rejects.toBeInstanceOf(RequestError);
  });

  it("re-throws a 429 (rate-limited) so the caller can surface the operational issue", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(makeRequestError(429));

    await expect(listOpenPullRequests("RJK134/test-repo")).rejects.toBeInstanceOf(RequestError);
  });

  it("re-throws a 500 server error from the checks API", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(makeRequestError(500));

    await expect(listOpenPullRequests("RJK134/test-repo")).rejects.toBeInstanceOf(RequestError);
  });

  it("re-throws a non-RequestError (e.g. network timeout) from the checks API", async () => {
    mockPullsList.mockResolvedValue({ data: [makePr()] });
    mockChecksListForRef.mockRejectedValue(new Error("ETIMEDOUT"));

    await expect(listOpenPullRequests("RJK134/test-repo")).rejects.toThrow("ETIMEDOUT");
  });

  it("skips PRs with no head SHA without calling the checks API", async () => {
    const prNoSha = makePr({ head: { sha: "", ref: "feature" } });
    mockPullsList.mockResolvedValue({ data: [prNoSha] });

    const result = await listOpenPullRequests("RJK134/test-repo");
    expect(mockChecksListForRef).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]?.checks.total).toBe(0);
  });
});

describe("listOpenPullRequests — limit clamping", () => {
  let mockPullsList: ReturnType<typeof vi.fn>;
  let mockChecksListForRef: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPullsList = vi.fn().mockResolvedValue({ data: [] });
    mockChecksListForRef = vi.fn();
    (getGithubClient as ReturnType<typeof vi.fn>).mockReturnValue({
      pulls: { list: mockPullsList },
      checks: { listForRef: mockChecksListForRef },
    });
  });

  it("clamps limit: 0 to per_page: 1 (GitHub minimum)", async () => {
    await listOpenPullRequests("RJK134/test-repo", { limit: 0 });
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 1 }),
    );
  });

  it("clamps negative limit to per_page: 1", async () => {
    await listOpenPullRequests("RJK134/test-repo", { limit: -10 });
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 1 }),
    );
  });

  it("clamps limit: 200 to per_page: 100 (GitHub maximum)", async () => {
    await listOpenPullRequests("RJK134/test-repo", { limit: 200 });
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 100 }),
    );
  });

  it("passes through an in-range limit unchanged", async () => {
    await listOpenPullRequests("RJK134/test-repo", { limit: 10 });
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 10 }),
    );
  });

  it("defaults to per_page: 25 when no limit is provided", async () => {
    await listOpenPullRequests("RJK134/test-repo");
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 25 }),
    );
  });
});
