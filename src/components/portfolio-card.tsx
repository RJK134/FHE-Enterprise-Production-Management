import Link from "next/link";
import type { PortfolioRepo } from "@/lib/schemas/repo";

type Props = {
  readonly repo: PortfolioRepo;
};

function readinessTone(score: number): string {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score > 0) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-ink-100 text-ink-500 border-ink-200";
}

/**
 * Compact card for a single managed product. Server Component — no
 * interactivity here. Drills down via Next link.
 */
export function PortfolioCard({ repo }: Props): JSX.Element {
  const slugPath = encodeURIComponent(repo.slug);
  const score = repo.readinessEstimate;
  const scoreLabel = score === 0 ? "Building" : `${score}/100`;
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
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${readinessTone(score)}`}
          aria-label={`Readiness: ${scoreLabel}`}
        >
          {scoreLabel}
        </span>
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
