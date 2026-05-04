import type { PullRequestSummary } from "@/lib/schemas/pr";

type Props = {
  readonly pr: PullRequestSummary;
};

function checkBadge(checks: PullRequestSummary["checks"]): JSX.Element {
  if (checks.total === 0) {
    return (
      <span className="inline-flex items-center rounded-md border border-ink-200 bg-ink-100 px-2 py-0.5 text-xs text-ink-500">
        no checks
      </span>
    );
  }
  if (checks.failure > 0) {
    return (
      <span
        className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
        aria-label={`${checks.failure} of ${checks.total} checks failing`}
      >
        {checks.failure}/{checks.total} failing
      </span>
    );
  }
  if (checks.pending > 0) {
    return (
      <span
        className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800"
        aria-label={`${checks.pending} of ${checks.total} checks pending`}
      >
        {checks.pending}/{checks.total} pending
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
      aria-label={`${checks.total} of ${checks.total} checks green`}
    >
      {checks.total}/{checks.total} green
    </span>
  );
}

export function PrRow({ pr }: Props): JSX.Element {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <a
          className="block truncate text-sm font-medium text-ink-900 hover:underline"
          href={pr.htmlUrl}
          aria-label={`PR #${pr.number}: ${pr.title}`}
          rel="noreferrer noopener"
          target="_blank"
        >
          #{pr.number} · {pr.title}
        </a>
        <p className="text-xs text-ink-400 font-mono truncate">
          {pr.headRef} → {pr.baseRef} · @{pr.authorLogin}
          {pr.isDraft ? " · draft" : ""}
        </p>
      </div>
      <div className="shrink-0">{checkBadge(pr.checks)}</div>
    </li>
  );
}
