import type { PrBotStates } from "@/lib/schemas/pr";
import type { CheckSource } from "@/lib/services/github/check-classification";

type Props = {
  readonly bots: PrBotStates;
};

/**
 * Compact strip showing the review state contributed by each known source
 * (Claude, BugBot, Copilot, CodeQL, Dependabot, Vercel, GitGuardian, ordinary
 * CI). Sources without any signal are omitted. Suitable for PR-row chrome.
 */
const ORDER: ReadonlyArray<CheckSource> = [
  "ci",
  "claude",
  "bugbot",
  "copilot",
  "codeql",
  "dependabot",
  "vercel",
  "gitguardian",
  "other",
];

const LABEL: Record<CheckSource, string> = {
  ci: "CI",
  claude: "Claude",
  bugbot: "BugBot",
  copilot: "Copilot",
  codeql: "CodeQL",
  dependabot: "Dependabot",
  vercel: "Vercel",
  gitguardian: "GG",
  other: "Other",
};

function tone(state: string | undefined): string {
  switch (state) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failure":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "neutral":
      return "border-ink-200 bg-ink-100 text-ink-500";
    default:
      return "border-ink-200 bg-ink-100 text-ink-400";
  }
}

export function BotStatesStrip({ bots }: Props): JSX.Element | null {
  const present = ORDER.filter((s) => Object.prototype.hasOwnProperty.call(bots, s));
  if (present.length === 0) return null;
  return (
    <ul
      className="mt-1 flex flex-wrap gap-1 text-[10px]"
      aria-label="Bot review states"
    >
      {present.map((source) => {
        const state = bots[source];
        return (
          <li
            key={source}
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 ${tone(state)}`}
            aria-label={`${LABEL[source]}: ${state ?? "absent"}`}
          >
            {LABEL[source]}
          </li>
        );
      })}
    </ul>
  );
}
