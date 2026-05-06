import { isGithubConfigured, env } from "@/lib/env";
import { listPortfolio } from "@/lib/services/portfolio/registry";
import { computeReadiness } from "@/lib/services/readiness/score";
import type { ReadinessSnapshot } from "@/lib/schemas/readiness";
import { PortfolioCard } from "@/components/portfolio-card";
import { ConnectionBanner } from "@/components/connection-banner";

export const dynamic = "force-dynamic";

/**
 * Portfolio overview — Server Component.
 * Renders the static portfolio registry plus a live readiness snapshot per
 * card when `GITHUB_TOKEN` is configured. Falls back to the registry
 * estimate when not connected.
 */
export default async function PortfolioPage(): Promise<JSX.Element> {
  const connected = isGithubConfigured();
  const allowlist = env().PORTFOLIO_ALLOWLIST;
  const portfolio = listPortfolio(allowlist);

  const readinessByRepo = new Map<string, ReadinessSnapshot>();
  if (connected) {
    const snapshots = await Promise.all(portfolio.map((repo) => computeReadiness(repo)));
    for (const s of snapshots) readinessByRepo.set(s.slug, s);
  }

  return (
    <section aria-labelledby="portfolio-heading" className="space-y-6">
      <ConnectionBanner connected={connected} />
      <header className="flex items-end justify-between">
        <div>
          <h2 id="portfolio-heading" className="text-2xl font-semibold text-ink-900">
            Portfolio
          </h2>
          <p className="text-sm text-ink-500">
            {portfolio.length} managed product{portfolio.length === 1 ? "" : "s"}
            {connected ? " · live readiness signals" : " · static estimates only"}.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolio.map((repo) => {
          const r = readinessByRepo.get(repo.slug);
          return (
            <PortfolioCard
              key={repo.slug}
              repo={repo}
              {...(r !== undefined ? { readiness: r } : {})}
            />
          );
        })}
      </div>
    </section>
  );
}
