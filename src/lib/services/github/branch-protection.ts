import "server-only";
import { RequestError } from "@octokit/request-error";
import { getGithubClient } from "./client";
import { BranchProtectionState } from "@/lib/schemas/branch-protection";
import { RepoSlug } from "@/lib/schemas/repo";

/**
 * Reads the branch-protection state for a repo's default-named branch.
 *
 * Returns:
 *   - The parsed `BranchProtectionState` when the branch is protected.
 *   - A "no protection" snapshot (`enabled: false`) when GitHub returns 404.
 *   - `null` when the GitHub client is not configured (no token).
 *
 * Re-throws any other Octokit error so a misconfigured token (403, rate-limit,
 * 5xx) is surfaced rather than silently masked as "not protected".
 */
export async function getBranchProtection(
  slug: string,
  branch: string = "main",
): Promise<BranchProtectionState | null> {
  RepoSlug.parse(slug);
  const gh = getGithubClient();
  if (!gh) return null;

  const [owner, repo] = slug.split("/") as [string, string];

  try {
    const { data } = await gh.repos.getBranchProtection({ owner, repo, branch });

    return BranchProtectionState.parse({
      enabled: true,
      requiresPullRequest: Boolean(data.required_pull_request_reviews),
      requiredApprovingReviewCount:
        data.required_pull_request_reviews?.required_approving_review_count ?? 0,
      requiresStatusChecks: Boolean(data.required_status_checks),
      requiredStatusChecks: data.required_status_checks?.contexts ?? [],
      requiresStrictUpToDate: Boolean(data.required_status_checks?.strict),
      requiresConversationResolution: Boolean(data.required_conversation_resolution?.enabled),
      enforceAdmins: Boolean(data.enforce_admins?.enabled),
      allowsForcePushes: Boolean(data.allow_force_pushes?.enabled),
      allowsDeletions: Boolean(data.allow_deletions?.enabled),
    });
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 404) {
      return BranchProtectionState.parse({
        enabled: false,
        requiresPullRequest: false,
        requiredApprovingReviewCount: 0,
        requiresStatusChecks: false,
        requiredStatusChecks: [],
        requiresStrictUpToDate: false,
        requiresConversationResolution: false,
        enforceAdmins: false,
        allowsForcePushes: true,
        allowsDeletions: true,
      });
    }
    throw error;
  }
}
