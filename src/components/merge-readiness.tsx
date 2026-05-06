import type { MergeReadiness as MergeReadinessT } from "@/lib/schemas/pull-detail";

type Props = {
  readonly readiness: MergeReadinessT;
};

export function MergeReadiness({ readiness }: Props): JSX.Element {
  if (readiness.ready) {
    return (
      <div
        className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        role="status"
      >
        <strong className="font-semibold">Mergeable.</strong> All required signals are green.
      </div>
    );
  }
  return (
    <div
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
      aria-label="Merge blocked"
    >
      <strong className="font-semibold">Not mergeable yet.</strong>
      <ul className="mt-2 list-disc pl-5 space-y-0.5">
        {readiness.reasons.map((reason, idx) => (
          <li key={idx}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
