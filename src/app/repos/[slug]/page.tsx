import { notFound } from "next/navigation";
import Link from "next/link";
import { findPortfolioRepo } from "@/lib/services/portfolio/registry";
import { listOpenPullRequests } from "@/lib/services/github/pulls";
import { computeReadiness } from "@/lib/services/readiness/score";
import { isGithubConfigured } from "@/lib/env";
import { ConnectionBanner } from "@/components/connection-banner";
import { PrRow } from "@/components/pr-row";
import { ReadinessBadge } from "@/components/readiness-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  readonly params: { slug: string };
};

function getPortfolioAllowlist(): Set<string> {
  return new Set(
    (process.env.PORTFOLIO_ALLOWLIST ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

/**
 * Per-repo drill-down. Server Component. Renders the registry entry and a
 * live PR list when configured, otherwise a graceful "not connected" state.
 */
export default async function RepoDrillDownPage({ params }: PageProps): Promise<JSX.Element> {
  const slug = decodeURIComponent(params.slug);
  const allowlist = getPortfolioAllowlist();
  if (!allowlist.has(slug)) notFound();

  const repo = findPortfolioRepo(slug);
  if (!repo || !allowlist.has(repo.slug)) notFound();

  const connected = isGithubConfigured();
  const [pulls, readiness] = await Promise.all([
    connected ? listOpenPullRequests(repo.slug, { limit: 25 }) : Promise.resolve([]),
    computeReadiness(repo),
  ]);

  return (
    <section aria-labelledby="repo-heading" className="space-y-6">
      <ConnectionBanner connected={connected} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
        <Link href="/" className="hover:text-ink-900" aria-label="Back to portfolio">
          ← Portfolio
        </Link>
      </nav>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="repo-heading" className="text-2xl font-semibold text-ink-900">
            {repo.displayName}
          </h2>
          <p className="text-xs text-ink-400 font-mono">{repo.slug}</p>
          <p className="mt-2 text-sm text-ink-700 max-w-3xl">{repo.description}</p>
        </div>
        <ReadinessBadge snapshot={readiness} />
      </header>

      <section aria-labelledby="readiness-heading" className="rounded-xl border border-ink-200 bg-white p-5">
        <h3 id="readiness-heading" className="text-base font-semibold text-ink-900">
          Readiness signals
        </h3>
        <ul className="mt-3 space-y-1 text-sm text-ink-700">
          {readiness.axes.map((axis) => (
            <li key={axis.axis} className="flex justify-between gap-3">
              <span className="text-ink-500 capitalize">{axis.axis}</span>
              <span className="text-ink-900">
                {axis.score}/100 <span className="text-ink-400">· {axis.signal}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

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
                <PrRow key={pr.number} pr={pr} slug={repo.slug} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}
