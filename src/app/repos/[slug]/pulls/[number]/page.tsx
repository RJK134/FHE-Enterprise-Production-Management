import { notFound } from "next/navigation";
import Link from "next/link";
import { findPortfolioRepo } from "@/lib/services/portfolio/registry";
import { isGithubConfigured } from "@/lib/env";
import {
  getPullRequestDetail,
  evaluateMergeReadiness,
} from "@/lib/services/github/pull-detail";
import { ConnectionBanner } from "@/components/connection-banner";
import { CheckRunList } from "@/components/check-run-list";
import { MergeReadiness } from "@/components/merge-readiness";

export const dynamic = "force-dynamic";

type PageProps = {
  readonly params: { slug: string; number: string };
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
 * Per-PR drill-down with merge readiness signal. Server Component.
 * Requires the slug to be in PORTFOLIO_ALLOWLIST (mirrors the per-repo
 * drill-down posture).
 */
export default async function PullRequestPage({ params }: PageProps): Promise<JSX.Element> {
  const slug = decodeURIComponent(params.slug);
  const allowlist = getPortfolioAllowlist();
  if (!allowlist.has(slug)) notFound();

  const repo = findPortfolioRepo(slug);
  if (!repo) notFound();

  const pullNumber = Number(params.number);
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) notFound();

  const connected = isGithubConfigured();
  const detail = connected ? await getPullRequestDetail(slug, pullNumber) : null;

  if (connected && detail === null) notFound();

  const slugPath = encodeURIComponent(slug);

  return (
    <section aria-labelledby="pr-heading" className="space-y-6">
      <ConnectionBanner connected={connected} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
        <Link href="/" className="hover:text-ink-900">
          Portfolio
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link
          href={{ pathname: "/repos/[slug]", query: { slug } }}
          as={`/repos/${slugPath}`}
          className="hover:text-ink-900"
        >
          {repo.displayName}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">#{pullNumber}</span>
      </nav>

      {detail ? (
        <>
          <header>
            <h2 id="pr-heading" className="text-2xl font-semibold text-ink-900">
              #{detail.number} · {detail.title}
            </h2>
            <p className="mt-1 text-xs text-ink-400 font-mono">
              {detail.headRef} → {detail.baseRef} · @{detail.authorLogin}
              {detail.isDraft ? " · draft" : ""} · state: {detail.state}
            </p>
            <p className="mt-2 text-sm">
              <a
                className="text-ink-700 hover:underline"
                href={detail.htmlUrl}
                rel="noreferrer noopener"
                target="_blank"
                aria-label="Open PR on GitHub"
              >
                Open on GitHub →
              </a>
            </p>
          </header>

          <MergeReadiness readiness={evaluateMergeReadiness(detail)} />

          <section
            aria-labelledby="reviews-heading"
            className="rounded-xl border border-ink-200 bg-white p-5"
          >
            <h3 id="reviews-heading" className="text-base font-semibold text-ink-900">
              Reviews
            </h3>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <dt className="text-ink-400 uppercase tracking-wide">Approvals</dt>
                <dd className="text-ink-900 text-base font-semibold">{detail.reviews.approvals}</dd>
              </div>
              <div>
                <dt className="text-ink-400 uppercase tracking-wide">Changes requested</dt>
                <dd className="text-ink-900 text-base font-semibold">
                  {detail.reviews.changesRequested}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400 uppercase tracking-wide">Pending</dt>
                <dd className="text-ink-900 text-base font-semibold">{detail.reviews.pending}</dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="checks-heading"
            className="rounded-xl border border-ink-200 bg-white"
          >
            <div className="px-5 py-4 border-b border-ink-100 flex items-baseline justify-between">
              <h3 id="checks-heading" className="text-base font-semibold text-ink-900">
                Check runs
              </h3>
              <p className="text-xs text-ink-400">{detail.checkRuns.length} reported</p>
            </div>
            <div className="px-5">
              <CheckRunList checkRuns={detail.checkRuns} />
            </div>
          </section>

          {detail.branchProtectionRequiredChecks.length > 0 ? (
            <section
              aria-labelledby="bp-heading"
              className="rounded-xl border border-ink-200 bg-white p-5"
            >
              <h3 id="bp-heading" className="text-base font-semibold text-ink-900">
                Branch protection on {detail.baseRef}
              </h3>
              <p className="mt-2 text-sm text-ink-700">
                Required reviews: {detail.branchProtectionRequiresReviews ? "yes" : "no"}.
              </p>
              <p className="mt-1 text-sm text-ink-700">
                Required status checks:{" "}
                <code className="font-mono">
                  {detail.branchProtectionRequiredChecks.join(", ")}
                </code>
                .
              </p>
            </section>
          ) : null}
        </>
      ) : (
        <p className="py-6 text-sm text-ink-500">
          Connect a server-side <code className="font-mono">GITHUB_TOKEN</code> to see live PR
          detail.
        </p>
      )}
    </section>
  );
}
