import { z } from "zod";

/**
 * Pure classifier for GitHub check-run names. Maps an opaque `name` string
 * (e.g. "Claude auto-review", "Cursor Bugbot", "CodeQL", "ci/lint") to a
 * known source category so the UI can attribute bot review state at a
 * glance.
 *
 * Lives outside `server-only` so it can be unit-tested cheaply.
 */

export const CheckSource = z.enum([
  "claude",
  "bugbot",
  "copilot",
  "codeql",
  "dependabot",
  "vercel",
  "gitguardian",
  "ci",
  "other",
]);
export type CheckSource = z.infer<typeof CheckSource>;

const PATTERNS: ReadonlyArray<{ source: CheckSource; pattern: RegExp }> = [
  { source: "claude", pattern: /claude/i },
  { source: "bugbot", pattern: /bugbot|cursor/i },
  { source: "copilot", pattern: /copilot/i },
  { source: "codeql", pattern: /codeql|code\s*scanning|analyse\s*\(/i },
  { source: "dependabot", pattern: /dependabot/i },
  { source: "vercel", pattern: /vercel/i },
  { source: "gitguardian", pattern: /gitguardian/i },
];

/**
 * Returns the category for a given check-run name. Defaults to `"ci"` for
 * names that look like canonical CI jobs (lint/typecheck/test/build/foundation
 * files etc.) and `"other"` for everything else. Defensive against
 * null/undefined so a malformed upstream payload cannot crash the caller.
 */
export function classifyCheckRun(name: string | null | undefined): CheckSource {
  if (typeof name !== "string") return "other";
  const trimmed = name.trim();
  if (trimmed.length === 0) return "other";
  for (const { source, pattern } of PATTERNS) {
    if (pattern.test(trimmed)) return source;
  }
  // Heuristic CI bucket: anything containing a slash (`ci/lint`) or matching
  // the canonical four CI step names is treated as ordinary CI.
  if (
    /^(lint|typecheck|test|build|ci|foundation|yaml|markdown)\b/i.test(trimmed) ||
    /\b(lint|typecheck|test|build)\b/i.test(trimmed) ||
    /\//.test(trimmed)
  ) {
    return "ci";
  }
  return "other";
}

export const CheckState = z.enum(["success", "failure", "pending", "neutral"]);
export type CheckState = z.infer<typeof CheckState>;

export const ReviewStateBySource = z.partialRecord(CheckSource, CheckState).default({});
export type ReviewStateBySource = z.infer<typeof ReviewStateBySource>;

type RunLike = {
  readonly name?: string | null;
  readonly status: "queued" | "in_progress" | "completed" | string;
  readonly conclusion: string | null;
};

/**
 * Aggregates an array of check-runs into a state map keyed by source.
 * For a given source the rule is "worst signal wins":
 *   failure  >  pending  >  neutral  >  success.
 * Sources that have no runs are omitted entirely so the UI can render them
 * as "absent".
 */
export function summariseChecksBySource(
  runs: ReadonlyArray<RunLike>,
): Partial<Record<CheckSource, CheckState>> {
  const RANK: Record<CheckState, number> = { failure: 3, pending: 2, neutral: 1, success: 0 };
  const out: Partial<Record<CheckSource, CheckState>> = {};
  for (const r of runs) {
    const src = classifyCheckRun(r.name);
    const state: CheckState = stateOf(r);
    const prev = out[src];
    if (prev === undefined || RANK[state] > RANK[prev]) {
      out[src] = state;
    }
  }
  return out;
}

function stateOf(run: RunLike): CheckState {
  if (run.status !== "completed") return "pending";
  switch (run.conclusion) {
    case "success":
      return "success";
    case "neutral":
    case "skipped":
      return "neutral";
    case null:
      return "neutral";
    default:
      return "failure";
  }
}
