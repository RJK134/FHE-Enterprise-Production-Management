import Link from "next/link";
import type { PortfolioRepo } from "@/lib/schemas/repo";
import type { ReadinessSnapshot } from "@/lib/schemas/readiness";
import { ReadinessBadge } from "@/components/readiness-badge";
import { BlockerSummaryBadge } from "@/components/blocker-summary-badge";

type Props = {
  readonly repo: PortfolioRepo;
  readonly readiness?: ReadinessSnapshot;
  readonly blockerCounts?: {
    readonly total: number;
    readonly P0: number;
    readonly P1: number;
    readonly P2: number;
  };
};

/**
 * Compact card for a single managed product. Server Component — no
 * interactivity here. Drills down via Next link. When `readiness` is
 * provided it renders the live snapshot badge; otherwise falls back to the
 * registry estimate.
 */
export function PortfolioCard({ repo, readiness, blockerCounts }: Props): JSX.Element {
  const slugPath = encodeURIComponent(repo.slug);
  return (
    <article
      className="rounded-xl border border-ink-200 bg-white p-5 hover:border-ink-300 transition-colors"
      aria-label={`Portfolio entry: ${repo.displayName}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink-900">{repo.displayName}</h3>
          <p className="text-xs text-ink-400 font-mono">{repo.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {readiness ? (
            <ReadinessBadge snapshot={readiness} />
          ) : (
            <ReadinessBadge
              snapshot={{
                slug: repo.slug,
                total: repo.readinessEstimate,
                axes: [
                  {
                    axis: "governance",
                    score: repo.readinessEstimate,
                    weight: 100,
                    signal: "registry estimate",
                  },
                ],
                computedAt: new Date(0).toISOString(),
                source: "registry-estimate",
              }}
            />
          )}
          {blockerCounts !== undefined ? <BlockerSummaryBadge counts={blockerCounts} /> : null}
        </div>
      </header>
      <p className="mt-3 text-sm text-ink-700">{repo.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-ink-400 uppercase tracking-wide">Phase</dt>
          <dd className="text-ink-900">{repo.currentPhase}</dd>
        </div>
        <div>
          <dt className="text-ink-400 uppercase tracking-wide">Stack</dt>
          <dd className="text-ink-900">{repo.stack}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <Link
          href={{ pathname: "/repos/[slug]", query: { slug: repo.slug } }}
          as={`/repos/${slugPath}`}
          className="text-sm font-medium text-ink-900 hover:underline"
          aria-label={`Open drill-down for ${repo.displayName}`}
        >
          Open drill-down →
        </Link>
      </div>
    </article>
  );
}
