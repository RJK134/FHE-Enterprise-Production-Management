import "server-only";
import { RequestError } from "@octokit/request-error";
import { getGithubClient } from "./client";
import { AlertCounts, type RepoAlerts } from "@/lib/schemas/alerts";
import { RepoSlug } from "@/lib/schemas/repo";

const EMPTY_COUNTS: AlertCounts = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

function bucket(severity: string | null | undefined): keyof AlertCounts {
  switch ((severity ?? "").toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
    case "error":
      return "high";
    case "medium":
    case "moderate":
    case "warning":
      return "medium";
    case "low":
    case "note":
      return "low";
    default:
      return "low";
  }
}

function summariseSeverities(severities: ReadonlyArray<string | null | undefined>): AlertCounts {
  const counts: AlertCounts = { ...EMPTY_COUNTS, total: severities.length };
  for (const s of severities) {
    const b = bucket(s);
    counts[b] += 1;
  }
  return counts;
}

/**
 * Fetches Dependabot + CodeQL alert counts for a repo.
 *
 * Returns `null` for either feed when:
 *   - the GitHub client is not configured;
 *   - the token lacks the required scope (404/403 on the feed);
 *   - the feature is disabled at the repo level.
 *
 * Re-throws any other Octokit error.
 */
export async function getRepoAlerts(slug: string): Promise<RepoAlerts | null> {
  RepoSlug.parse(slug);
  const gh = getGithubClient();
  if (!gh) return null;

  const [owner, repo] = slug.split("/") as [string, string];

  const dependabot = await safeFetchDependabot(gh, owner, repo);
  const codeScanning = await safeFetchCodeScanning(gh, owner, repo);

  return { dependabot, codeScanning };
}

type Gh = NonNullable<ReturnType<typeof getGithubClient>>;

async function safeFetchDependabot(
  gh: Gh,
  owner: string,
  repo: string,
): Promise<AlertCounts | null> {
  try {
    const { data } = await gh.dependabot.listAlertsForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });
    return summariseSeverities(data.map((a) => a.security_advisory?.severity ?? "low"));
  } catch (error: unknown) {
    if (
      error instanceof RequestError &&
      (error.status === 404 || error.status === 403 || error.status === 401)
    ) {
      return null;
    }
    throw error;
  }
}

async function safeFetchCodeScanning(
  gh: Gh,
  owner: string,
  repo: string,
): Promise<AlertCounts | null> {
  try {
    const { data } = await gh.codeScanning.listAlertsForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });
    return summariseSeverities(data.map((a) => a.rule?.severity ?? "warning"));
  } catch (error: unknown) {
    if (
      error instanceof RequestError &&
      (error.status === 404 || error.status === 403 || error.status === 401)
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * @internal Test-only helper to apply the bucket/summarise logic without
 * needing an Octokit instance.
 */
export function __summariseSeveritiesForTests(
  severities: ReadonlyArray<string | null | undefined>,
): AlertCounts {
  return summariseSeverities(severities);
}
