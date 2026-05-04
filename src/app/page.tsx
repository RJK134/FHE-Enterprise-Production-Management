import { isGithubConfigured, env } from "@/lib/env";
import { listPortfolio } from "@/lib/services/portfolio/registry";
import { PortfolioCard } from "@/components/portfolio-card";
import { ConnectionBanner } from "@/components/connection-banner";

export const dynamic = "force-dynamic";

/**
 * Portfolio overview — Server Component.
 * Renders the static portfolio registry and signals connection state.
 * No client-side state, no fetch, no token exposure.
 */
export default function PortfolioPage(): JSX.Element {
  const connected = isGithubConfigured();
  const allowlist = env().PORTFOLIO_ALLOWLIST;
  const portfolio = listPortfolio(allowlist);

  return (
    <section aria-labelledby="portfolio-heading" className="space-y-6">
      <ConnectionBanner connected={connected} />
      <header className="flex items-end justify-between">
        <div>
          <h2 id="portfolio-heading" className="text-2xl font-semibold text-ink-900">
            Portfolio
          </h2>
          <p className="text-sm text-ink-500">
            {portfolio.length} managed product{portfolio.length === 1 ? "" : "s"}.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolio.map((repo) => (
          <PortfolioCard key={repo.slug} repo={repo} />
        ))}
      </div>
    </section>
  );
}
