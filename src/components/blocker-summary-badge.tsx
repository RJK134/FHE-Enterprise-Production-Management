type Props = {
  readonly counts: {
    readonly total: number;
    readonly P0: number;
    readonly P1: number;
    readonly P2: number;
  };
};

/**
 * Compact badge showing the number of active blockers for a repo, with
 * severity breakdown. Used on the portfolio card and the per-repo header.
 */
export function BlockerSummaryBadge({ counts }: Props): JSX.Element {
  if (counts.total === 0) {
    return (
      <span
        className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
        aria-label="0 active blockers"
      >
        0 blockers
      </span>
    );
  }
  const tone =
    counts.P0 > 0
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : counts.P1 > 0
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-ink-100 text-ink-700 border-ink-200";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${tone}`}
      aria-label={`${counts.total} active blocker(s): ${counts.P0} P0, ${counts.P1} P1, ${counts.P2} P2`}
      title={`${counts.P0} P0 · ${counts.P1} P1 · ${counts.P2} P2`}
    >
      {counts.total} blockers
      {counts.P0 > 0 ? <span className="ml-1 font-semibold">· {counts.P0} P0</span> : null}
    </span>
  );
}
