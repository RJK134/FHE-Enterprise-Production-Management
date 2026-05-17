import { buildPlanSnapshot } from "@/lib/services/plan/snapshot";
import { renderPlanReport } from "@/lib/services/plan/diff";
import { PhaseRow } from "@/components/phase-row";

export const dynamic = "force-dynamic";

/**
 * Plan view — Phase 2 P0.
 *
 * Renders the canonical plan snapshot derived from the structured truth
 * sources (blocker registry, portfolio registry, readiness service plus
 * the curated phase item map). The Markdown report at the bottom is
 * paste-ready for a planning PR (`.github/PULL_REQUEST_TEMPLATE/planning-pr.md`).
 *
 * Phase 2 P1 will add an "Open planning PR" action that commits the report
 * to a new branch and opens the PR automatically; for now this is a
 * read-only view so the human stays in the loop.
 */
export default async function PlanPage(): Promise<JSX.Element> {
  const snapshot = await buildPlanSnapshot();
  const report = renderPlanReport(snapshot);
  const counts = {
    complete: snapshot.phases.filter((p) => p.status === "complete").length,
    active: snapshot.phases.filter((p) => p.status === "active").length,
    pending: snapshot.phases.filter((p) => p.status === "pending").length,
  };

  return (
    <section aria-labelledby="plan-heading" className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink-400">Plan Refresh Engine</p>
        <h2 id="plan-heading" className="text-2xl font-semibold text-ink-900">
          Delivery Plan — canonical snapshot
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Derived from the blocker registry, the portfolio registry, the readiness service, and
          the curated phase item map in <code className="font-mono">src/lib/services/plan/snapshot.ts</code>.
          Computed at <time dateTime={snapshot.computedAt}>{snapshot.computedAt}</time>.
        </p>
      </header>

      <section
        aria-labelledby="overview-heading"
        className="rounded-xl border border-ink-200 bg-white p-5"
      >
        <h3 id="overview-heading" className="text-base font-semibold text-ink-900">
          Overview
        </h3>
        <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-ink-400 uppercase tracking-wide text-xs">Phases complete</dt>
            <dd className="text-ink-900 text-lg font-semibold">{counts.complete}</dd>
          </div>
          <div>
            <dt className="text-ink-400 uppercase tracking-wide text-xs">Phases active</dt>
            <dd className="text-ink-900 text-lg font-semibold">{counts.active}</dd>
          </div>
          <div>
            <dt className="text-ink-400 uppercase tracking-wide text-xs">Phases pending</dt>
            <dd className="text-ink-900 text-lg font-semibold">{counts.pending}</dd>
          </div>
          <div>
            <dt className="text-ink-400 uppercase tracking-wide text-xs">Active blockers</dt>
            <dd className="text-ink-900 text-lg font-semibold">
              {snapshot.portfolio.openBlockers.total}{" "}
              <span className="text-rose-700 text-sm">
                · {snapshot.portfolio.openBlockers.P0} P0
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="phases-heading" className="space-y-3">
        <h3 id="phases-heading" className="text-base font-semibold text-ink-900">
          Phases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snapshot.phases.map((p) => (
            <PhaseRow key={p.id} phase={p} />
          ))}
        </div>
      </section>

      <section aria-labelledby="report-heading" className="space-y-3">
        <h3 id="report-heading" className="text-base font-semibold text-ink-900">
          Markdown report
        </h3>
        <p className="text-sm text-ink-500">
          Paste-ready for a planning PR using{" "}
          <code className="font-mono">.github/PULL_REQUEST_TEMPLATE/planning-pr.md</code>. Phase 2
          P1 will commit + open this automatically.
        </p>
        <pre
          aria-label="Plan refresh markdown report"
          className="rounded-xl border border-ink-200 bg-white p-5 text-xs text-ink-900 overflow-x-auto whitespace-pre-wrap"
        >
          {report}
        </pre>
      </section>
    </section>
  );
}
