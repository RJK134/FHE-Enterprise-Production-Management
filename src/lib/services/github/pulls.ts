import "server-only";
import { getGithubClient } from "./client";
import { PullRequestSummary, type PrCheckSummary } from "@/lib/schemas/pr";
import { RepoSlug } from "@/lib/schemas/repo";

type PullsListItem = Awaited<ReturnType<Octokit["pulls"]["list"]>>["data"][number];

import type { Octokit } from "@octokit/rest";

type CheckRun = {
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: string | null;
};

function summariseChecks(runs: ReadonlyArray<CheckRun>): PrCheckSummary {
  let success = 0;
  let failure = 0;
  let pending = 0;
  let neutral = 0;
  for (const r of runs) {
    if (r.status !== "completed") {
      pending += 1;
      continue;
    }
    switch (r.conclusion) {
      case "success":
        success += 1;
        break;
      case "failure":
      case "timed_out":
      case "cancelled":
      case "action_required":
      case "stale":
        failure += 1;
        break;
      case "neutral":
      case "skipped":
      case null:
        neutral += 1;
        break;
      default:
        neutral += 1;
    }
  }
  return { total: runs.length, success, failure, pending, neutral };
}

/**
 * Lists open pull requests for the given `owner/name` slug along with a
 * compact check summary. Returns an empty array when the GitHub client is
 * not configured (no token), so callers can render a "not connected" state.
 *
 * @throws if the slug is malformed.
 */
export async function listOpenPullRequests(
  slug: string,
  options: { limit?: number } = {},
): Promise<ReadonlyArray<PullRequestSummary>> {
  RepoSlug.parse(slug);
  const gh = getGithubClient();
  if (!gh) return [];

  const [owner, repo] = slug.split("/") as [string, string];
  const limit = Math.min(options.limit ?? 25, 100);

  const { data: pulls } = await gh.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: limit,
    sort: "updated",
    direction: "desc",
  });

  const summaries: PullRequestSummary[] = [];
  for (const pr of pulls as ReadonlyArray<PullsListItem>) {
    const headSha = pr.head?.sha;
    let checkSummary: PrCheckSummary = { total: 0, success: 0, failure: 0, pending: 0, neutral: 0 };
    if (typeof headSha === "string" && headSha.length > 0) {
      try {
        const { data } = await gh.checks.listForRef({
          owner,
          repo,
          ref: headSha,
          per_page: 100,
        });
        checkSummary = summariseChecks(data.check_runs ?? []);
      } catch {
        // Treat upstream check failures as "no signal" rather than blowing up
        // the whole list — the dashboard remains useful even if checks 404.
        checkSummary = { total: 0, success: 0, failure: 0, pending: 0, neutral: 0 };
      }
    }

    const parsed = PullRequestSummary.safeParse({
      number: pr.number,
      title: pr.title ?? "(untitled)",
      authorLogin: pr.user?.login ?? "unknown",
      isDraft: Boolean(pr.draft),
      htmlUrl: pr.html_url,
      headRef: pr.head?.ref ?? "",
      baseRef: pr.base?.ref ?? "",
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      checks: checkSummary,
    });
    if (parsed.success) summaries.push(parsed.data);
  }
  return summaries;
}
