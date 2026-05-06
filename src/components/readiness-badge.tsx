import type { ReadinessSnapshot } from "@/lib/schemas/readiness";

type Props = {
  readonly snapshot: ReadinessSnapshot;
};

function tone(score: number): string {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score > 0) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-ink-100 text-ink-500 border-ink-200";
}

const SOURCE_LABEL: Record<ReadinessSnapshot["source"], string> = {
  live: "Live",
  partial: "Partial",
  "registry-estimate": "Estimate",
};

export function ReadinessBadge({ snapshot }: Props): JSX.Element {
  const score = snapshot.total;
  const display = score === 0 ? "Building" : `${score}/100`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${tone(score)}`}
      aria-label={`Readiness: ${display} (${SOURCE_LABEL[snapshot.source]})`}
      title={`Source: ${SOURCE_LABEL[snapshot.source]}`}
    >
      <span>{display}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {SOURCE_LABEL[snapshot.source]}
      </span>
    </span>
  );
}
