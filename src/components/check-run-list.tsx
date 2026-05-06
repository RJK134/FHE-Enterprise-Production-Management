import type { CheckRunDetail } from "@/lib/schemas/pull-detail";

type Props = {
  readonly checkRuns: ReadonlyArray<CheckRunDetail>;
};

function badge(run: CheckRunDetail): { tone: string; label: string } {
  if (run.status !== "completed") {
    return { tone: "bg-amber-50 text-amber-800 border-amber-200", label: run.status };
  }
  switch (run.conclusion) {
    case "success":
    case "neutral":
    case "skipped":
      return { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", label: run.conclusion };
    case null:
      return { tone: "bg-ink-100 text-ink-500 border-ink-200", label: "no conclusion" };
    default:
      return { tone: "bg-rose-50 text-rose-700 border-rose-200", label: run.conclusion };
  }
}

export function CheckRunList({ checkRuns }: Props): JSX.Element {
  if (checkRuns.length === 0) {
    return (
      <p className="py-4 text-sm text-ink-500">
        No check runs reported for this PR&rsquo;s head SHA.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-ink-100" aria-label="Check runs">
      {checkRuns.map((run) => {
        const b = badge(run);
        return (
          <li key={run.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              {run.htmlUrl ? (
                <a
                  className="block truncate text-sm font-medium text-ink-900 hover:underline"
                  href={run.htmlUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  aria-label={`Check run: ${run.name}`}
                >
                  {run.name}
                </a>
              ) : (
                <span className="block truncate text-sm font-medium text-ink-900">{run.name}</span>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${b.tone}`}
              aria-label={`Status: ${b.label}`}
            >
              {b.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
