import "server-only";
import { Octokit } from "@octokit/rest";
import { env, isGithubConfigured } from "@/lib/env";

let cached: Octokit | undefined;

/**
 * Returns a configured Octokit instance, or `null` if `GITHUB_TOKEN` is not
 * set. Callers must handle `null` and render a "not connected" state rather
 * than throwing — the dashboard intentionally degrades to a doc-driven view
 * when no credential is available.
 */
export function getGithubClient(): Octokit | null {
  if (cached) return cached;
  if (!isGithubConfigured()) return null;
  const e = env();
  cached = new Octokit({
    auth: e.GITHUB_TOKEN,
    baseUrl: e.GITHUB_API_URL ?? "https://api.github.com",
    userAgent: "fhe-epmc/0.1 (+https://github.com/RJK134/FHE-Enterprise-Production-Management)",
    request: {
      // Conservative timeout so a slow upstream never wedges a Server Component.
      timeout: 8000,
    },
  });
  return cached;
}

/**
 * @internal Test-only reset.
 */
export function __resetGithubClientForTests(): void {
  cached = undefined;
}
