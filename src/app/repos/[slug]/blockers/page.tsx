import { notFound } from "next/navigation";
import Link from "next/link";
import { findPortfolioRepo } from "@/lib/services/portfolio/registry";
import { listBlockers } from "@/lib/services/blockers/registry";
import { BlockerCard } from "@/components/blocker-card";
import type { Blocker } from "@/lib/schemas/blocker";

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

const STATUS_ORDER: Record<Blocker["status"], number> = {
  open: 0,
  "in-progress": 1,
  deferred: 2,
  resolved: 3,
};
const SEVERITY_ORDER: Record<Blocker["severity"], number> = { P0: 0, P1: 1, P2: 2 };

function sortBlockers(blockers: ReadonlyArray<Blocker>): ReadonlyArray<Blocker> {
  return [...blockers].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return a.openedAt < b.openedAt ? 1 : a.openedAt > b.openedAt ? -1 : 0;
  });
}

/**
 * Per-repo blocker tracker. Append-only registry sourced from
 * `src/lib/services/blockers/registry.ts`. Phase 3 will move it to the
 * Evidence Lake DB with the same schema.
 */
export default function RepoBlockersPage({ params }: PageProps): JSX.Element {
  const slug = decodeURIComponent(params.slug);
  const allowlist = getPortfolioAllowlist();
  if (!allowlist.has(slug)) notFound();

  const repo = findPortfolioRepo(slug);
  if (!repo) notFound();

  const all = sortBlockers(listBlockers(slug));
  const active = all.filter((b) => b.status === "open" || b.status === "in-progress");
  const resolved = all.filter((b) => b.status === "resolved");
  const deferred = all.filter((b) => b.status === "deferred");

  const slugPath = encodeURIComponent(slug);

  return (
    <section aria-labelledby="blockers-heading" className="space-y-6">
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
        <span className="text-ink-700">Blockers</span>
      </nav>

      <header>
        <h2 id="blockers-heading" className="text-2xl font-semibold text-ink-900">
          {repo.displayName} — Blockers
        </h2>
        <p className="text-sm text-ink-500">
          {active.length} active · {deferred.length} deferred · {resolved.length} resolved.
          Append-only — see `docs/process/approval-ledger.md`.
        </p>
      </header>

      <section aria-labelledby="active-heading" className="space-y-3">
        <h3 id="active-heading" className="text-base font-semibold text-ink-900">
          Active
        </h3>
        {active.length === 0 ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            No active blockers.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((b) => (
              <BlockerCard key={b.id} blocker={b} />
            ))}
          </div>
        )}
      </section>

      {deferred.length > 0 ? (
        <section aria-labelledby="deferred-heading" className="space-y-3">
          <h3 id="deferred-heading" className="text-base font-semibold text-ink-900">
            Deferred
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deferred.map((b) => (
              <BlockerCard key={b.id} blocker={b} />
            ))}
          </div>
        </section>
      ) : null}

      {resolved.length > 0 ? (
        <section aria-labelledby="resolved-heading" className="space-y-3">
          <h3 id="resolved-heading" className="text-base font-semibold text-ink-900">
            Resolved
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolved.map((b) => (
              <BlockerCard key={b.id} blocker={b} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
