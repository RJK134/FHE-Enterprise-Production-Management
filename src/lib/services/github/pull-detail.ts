import "server-only";
import { RequestError } from "@octokit/request-error";
import { getGithubClient } from "./client";
import {
  CheckRunDetail,
  PullRequestDetail,
  ReviewSummary,
  type CheckRunStatus,
  type MergeReadiness,
} from "@/lib/schemas/pull-detail";
import { RepoSlug } from "@/lib/schemas/repo";
import { getBranchProtection } from "./branch-protection";

type Gh = NonNullable<ReturnType<typeof getGithubClient>>;

async function fetchCheckRuns(
  gh: Gh,
  owner: string,
  repo: string,
  ref: string,
): Promise<CheckRunDetail[]> {
  try {
    const { data } = await gh.checks.listForRef({ owner, repo, ref, per_page: 100 });
    return data.check_runs.map((r) =>
      CheckRunDetail.parse({
        id: r.id,
        name: r.name,
        status: (r.status as CheckRunStatus) ?? "queued",
        conclusion: r.conclusion ?? null,
        htmlUrl: r.html_url ?? null,
        startedAt: r.started_at ?? null,
        completedAt: r.completed_at ?? null,
      }),
    );
  } catch (error: unknown) {
    if (error instanceof RequestError && (error.status === 404 || error.status === 422)) {
      return [];
    }
    throw error;
  }
}

async function fetchReviewSummary(
  gh: Gh,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<ReviewSummary> {
  const { data } = await gh.pulls.listReviews({ owner, repo, pull_number: pullNumber, per_page: 100 });
  const latestByUser = new Map<string, string>();
  // Track reviewers who have an un-submitted (draft) review. These are counted
  // as pending only when they have no subsequent submitted review on record.
  const pendingUsers = new Set<string>();
  for (const r of data) {
    const user = r.user?.login;
    if (!user) continue;
    if (r.state === "PENDING") {
      pendingUsers.add(user);
      continue;
    }
    latestByUser.set(user, r.state ?? "COMMENTED");
  }
  let approvals = 0;
  let changesRequested = 0;
  for (const state of latestByUser.values()) {
    if (state === "APPROVED") approvals += 1;
    else if (state === "CHANGES_REQUESTED") changesRequested += 1;
  }
  // A reviewer is "pending" only if they have started a draft review but have
  // not yet submitted any review for this PR.
  let pending = 0;
  for (const u of pendingUsers) {
    if (!latestByUser.has(u)) pending += 1;
  }
  return ReviewSummary.parse({ approvals, changesRequested, pending });
}

/**
 * Returns a typed PR detail bundle including check runs, review summary, and
 * branch-protection compliance signals — or `null` when the GitHub client is
 * not configured or the PR cannot be found.
 */
export async function getPullRequestDetail(
  slug: string,
  pullNumber: number,
): Promise<PullRequestDetail | null> {
  RepoSlug.parse(slug);
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    throw new Error(`pullNumber must be a positive integer, got ${pullNumber}`);
  }
  const gh = getGithubClient();
  if (!gh) return null;

  const [owner, repo] = slug.split("/") as [string, string];

  let pr;
  try {
    const res = await gh.pulls.get({ owner, repo, pull_number: pullNumber });
    pr = res.data;
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 404) return null;
    throw error;
  }

  const headSha = pr.head?.sha ?? "";
  const [checkRuns, reviews, branchProtection] = await Promise.all([
    headSha ? fetchCheckRuns(gh, owner, repo, headSha) : Promise.resolve([]),
    fetchReviewSummary(gh, owner, repo, pullNumber),
    pr.base?.ref ? getBranchProtection(slug, pr.base.ref) : Promise.resolve(null),
  ]);

  const state =
    pr.state === "closed" ? (pr.merged_at ? ("merged" as const) : ("closed" as const)) : ("open" as const);

  return PullRequestDetail.parse({
    number: pr.number,
    title: pr.title ?? "(untitled)",
    authorLogin: pr.user?.login ?? "unknown",
    isDraft: Boolean(pr.draft),
    state,
    htmlUrl: pr.html_url,
    headRef: pr.head?.ref ?? "",
    headSha,
    baseRef: pr.base?.ref ?? "",
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergeable: pr.mergeable ?? null,
    reviews,
    checkRuns,
    branchProtectionEnabled: branchProtection ? branchProtection.enabled : null,
    branchProtectionRequiresReviews: branchProtection ? branchProtection.requiresPullRequest : null,
    branchProtectionRequiredApprovingReviewCount: branchProtection
      ? branchProtection.requiredApprovingReviewCount
      : null,
    branchProtectionRequiredChecks: branchProtection?.requiredStatusChecks ?? [],
  });
}

/**
 * Computes a merge-readiness signal from a PR detail bundle.
 *
 * "Ready" requires:
 *   - PR is open (not draft, not closed/merged).
 *   - All required status checks (per branch protection) are present and have
 *     conclusion `success`. When no required checks are configured, failing
 *     checks only block the merge on unprotected branches (or when the
 *     branch-protection signal is unavailable).
 *   - When branch protection requires PR reviews, the configured number of
 *     approving reviews must be present (derived from
 *     `branchProtectionRequiredApprovingReviewCount`, falling back to
 *     `options.minApprovals ?? 1`). Approval enforcement is skipped entirely
 *     when branch protection explicitly does not require PR reviews.
 *   - No reviewer has a standing CHANGES_REQUESTED.
 *   - Octokit reports `mergeable: true` (or unknown — we don't fail on null).
 */
export function evaluateMergeReadiness(
  pr: PullRequestDetail,
  options: { minApprovals?: number } = {},
): MergeReadiness {
  const reasons: string[] = [];

  if (pr.isDraft) reasons.push("PR is a draft");
  if (pr.state !== "open") reasons.push(`PR is ${pr.state}`);

  if (pr.reviews.changesRequested > 0) {
    reasons.push(`${pr.reviews.changesRequested} reviewer(s) requested changes`);
  }

  // Only enforce approval count when branch protection explicitly requires PR
  // reviews, or when the protection signal is unavailable (conservative default).
  // When protection is present but does not require reviews, skip this check.
  if (pr.branchProtectionRequiresReviews !== false) {
    const required =
      pr.branchProtectionRequiredApprovingReviewCount ?? options.minApprovals ?? 1;
    if (pr.reviews.approvals < required) {
      reasons.push(`${pr.reviews.approvals} of ${required} required approvals`);
    }
  }

  const requiredChecks = new Set(pr.branchProtectionRequiredChecks);
  if (requiredChecks.size > 0) {
    const successByName = new Map<string, boolean>();
    for (const c of pr.checkRuns) {
      if (c.status !== "completed") {
        successByName.set(c.name, false);
        continue;
      }
      // Only `success` satisfies a required check; `neutral` is not sufficient.
      successByName.set(c.name, c.conclusion === "success");
    }
    for (const name of requiredChecks) {
      if (!successByName.has(name)) reasons.push(`required check "${name}" missing`);
      else if (successByName.get(name) === false) reasons.push(`required check "${name}" not green`);
    }
  } else if (pr.branchProtectionEnabled !== true) {
    // Apply the "any failing check blocks" fallback only for branches that are
    // confirmed unprotected (enabled === false) or where the branch-protection
    // signal is unavailable (null). A protected branch with no required checks
    // configured should not be blocked by incidental check failures.
    const failing = pr.checkRuns.filter(
      (c) =>
        c.status === "completed" &&
        c.conclusion !== null &&
        !["success", "neutral", "skipped"].includes(c.conclusion),
    );
    if (failing.length > 0) reasons.push(`${failing.length} check(s) failing`);
  }

  if (pr.mergeable === false) reasons.push("GitHub reports the branch is not mergeable");

  return { ready: reasons.length === 0, reasons };
}
