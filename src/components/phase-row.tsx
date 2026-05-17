import type { PhaseSnapshot } from "@/lib/schemas/plan";

type Props = {
  readonly phase: PhaseSnapshot;
};

const STATUS_STYLES: Record<PhaseSnapshot["status"], string> = {
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-ink-100 text-ink-500 border-ink-200",
};

const PRIORITY_TONE: Record<"P0" | "P1" | "P2", string> = {
  P0: "text-rose-700",
  P1: "text-amber-700",
  P2: "text-ink-500",
};

export function PhaseRow({ phase }: Props): JSX.Element {
  const total = phase.items.length;
  const done = phase.items.filter((i) => i.done).length;
  const doneP0 = phase.items.filter((i) => i.priority === "P0" && i.done).length;
  const totalP0 = phase.items.filter((i) => i.priority === "P0").length;

  return (
    <article
      className="rounded-xl border border-ink-200 bg-white p-5"
      aria-label={`Phase ${phase.id} — ${phase.name}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-ink-400 font-mono">Phase {phase.id}</p>
          <h3 className="text-base font-semibold text-ink-900">{phase.name}</h3>
        </div>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${STATUS_STYLES[phase.status]}`}
          aria-label={`Status: ${phase.status}`}
        >
          {phase.status}
        </span>
      </header>
      <p className="mt-3 text-xs text-ink-500">
        {done}/{total} items done · {doneP0}/{totalP0} P0
      </p>
      <ul className="mt-4 space-y-1 text-sm">
        {phase.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span
              className={`shrink-0 mt-0.5 inline-block w-4 h-4 rounded border text-center text-[10px] leading-[14px] ${
                item.done
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-ink-200 bg-white text-ink-300"
              }`}
              aria-hidden
            >
              {item.done ? "✓" : ""}
            </span>
            <span className={`flex-1 ${item.done ? "text-ink-700" : "text-ink-900"}`}>
              <span className={`font-mono text-xs mr-2 ${PRIORITY_TONE[item.priority]}`}>
                {item.priority}
              </span>
              {item.label}
              {item.evidence !== null ? (
                <span className="block text-xs text-ink-400">{item.evidence}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
