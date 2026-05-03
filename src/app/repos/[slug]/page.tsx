import { notFound } from "next/navigation";
import Link from "next/link";
import { findPortfolioRepo } from "@/lib/services/portfolio/registry";
import { listOpenPullRequests } from "@/lib/services/github/pulls";
import { isGithubConfigured } from "@/lib/env";
import { ConnectionBanner } from "@/components/connection-banner";
import { PrRow } from "@/components/pr-row";

export const dynamic = "force-dynamic";

type PageProps = {
  readonly params: { slug: string };
};

/**
 * Per-repo drill-down. Server Component. Renders the registry entry and a
 * live PR list when configured, otherwise a graceful "not connected" state.
 */
export default async function RepoDrillDownPage({ params }: PageProps): Promise<JSX.Element> {
  const slug = decodeURIComponent(params.slug);
  const repo = findPortfolioRepo(slug);
  if (!repo) notFound();

  const connected = isGithubConfigured();
  const pulls = connected ? await listOpenPullRequests(repo.slug, { limit: 25 }) : [];

  return (
    <section aria-labelledby="repo-heading" className="space-y-6">
      <ConnectionBanner connected={connected} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
        <Link href="/" className="hover:text-ink-900" aria-label="Back to portfolio">
          ← Portfolio
        </Link>
      </nav>
      <header>
        <h2 id="repo-heading" className="text-2xl font-semibold text-ink-900">
          {repo.displayName}
        </h2>
        <p className="text-xs text-ink-400 font-mono">{repo.slug}</p>
        <p className="mt-2 text-sm text-ink-700 max-w-3xl">{repo.description}</p>
      </header>

      <section aria-labelledby="prs-heading" className="rounded-xl border border-ink-200 bg-white">
        <div className="px-5 py-4 border-b border-ink-100 flex items-baseline justify-between">
          <h3 id="prs-heading" className="text-base font-semibold text-ink-900">
            Open pull requests
          </h3>
          <p className="text-xs text-ink-400">{pulls.length} open</p>
        </div>
        <div className="px-5">
          {connected && pulls.length === 0 ? (
            <p className="py-6 text-sm text-ink-500">
              No open PRs. Either the repo is at rest, or the configured token cannot see it.
            </p>
          ) : !connected ? (
            <p className="py-6 text-sm text-ink-500">
              Connect a server-side <code className="font-mono">GITHUB_TOKEN</code> to see live PRs.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {pulls.map((pr) => (
                <PrRow key={pr.number} pr={pr} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}
