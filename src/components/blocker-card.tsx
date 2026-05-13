import type { Blocker } from "@/lib/schemas/blocker";

type Props = {
  readonly blocker: Blocker;
};

function severityTone(s: Blocker["severity"]): string {
  switch (s) {
    case "P0":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "P1":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "P2":
      return "bg-ink-100 text-ink-500 border-ink-200";
  }
}

function statusTone(s: Blocker["status"]): string {
  switch (s) {
    case "open":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "in-progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "deferred":
      return "bg-ink-100 text-ink-500 border-ink-200";
  }
}

function fmt(date: string | null): string | null {
  if (date === null) return null;
  return date.slice(0, 10);
}

export function BlockerCard({ blocker }: Props): JSX.Element {
  return (
    <article
      className="rounded-xl border border-ink-200 bg-white p-5"
      aria-label={`Blocker ${blocker.id}: ${blocker.title}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-ink-400 font-mono">{blocker.id}</p>
          <h3 className="text-base font-semibold text-ink-900">{blocker.title}</h3>
        </div>
        <div className="flex gap-2 shrink-0">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${severityTone(blocker.severity)}`}
            aria-label={`Severity: ${blocker.severity}`}
          >
            {blocker.severity}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${statusTone(blocker.status)}`}
            aria-label={`Status: ${blocker.status}`}
          >
            {blocker.status}
          </span>
        </div>
      </header>
      <p className="mt-3 text-sm text-ink-700">{blocker.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-ink-400 uppercase tracking-wide">Owner</dt>
          <dd className="text-ink-900">{blocker.owner}</dd>
        </div>
        <div>
          <dt className="text-ink-400 uppercase tracking-wide">Opened</dt>
          <dd className="text-ink-900">{fmt(blocker.openedAt) ?? "—"}</dd>
        </div>
        {blocker.etaAt !== null ? (
          <div>
            <dt className="text-ink-400 uppercase tracking-wide">ETA</dt>
            <dd className="text-ink-900">{fmt(blocker.etaAt)}</dd>
          </div>
        ) : null}
        {blocker.resolvedAt !== null ? (
          <div>
            <dt className="text-ink-400 uppercase tracking-wide">Resolved</dt>
            <dd className="text-ink-900">{fmt(blocker.resolvedAt)}</dd>
          </div>
        ) : null}
        {blocker.remediationPr !== null ? (
          <div className="col-span-2">
            <dt className="text-ink-400 uppercase tracking-wide">Remediation PR</dt>
            <dd className="text-ink-900 font-mono">{blocker.remediationPr}</dd>
          </div>
        ) : null}
      </dl>
      {blocker.evidence.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-ink-400 uppercase tracking-wide">Evidence</p>
          <ul className="mt-1 text-xs text-ink-700 list-disc pl-5 space-y-0.5">
            {blocker.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
