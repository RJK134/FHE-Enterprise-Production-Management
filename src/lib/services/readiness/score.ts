import "server-only";
import { RequestError } from "@octokit/request-error";
import { isGithubConfigured } from "@/lib/env";
import { getBranchProtection } from "@/lib/services/github/branch-protection";
import { getRepoAlerts } from "@/lib/services/github/alerts";
import {
  ReadinessSnapshot,
  type ReadinessAxisScore,
  type ReadinessAxis,
} from "@/lib/schemas/readiness";
import type { PortfolioRepo } from "@/lib/schemas/repo";

/**
 * Phase 1 in this module derives three live GitHub-backed axes:
 * governance, security, and dependencies. The documentation and
 * operational axes currently fall back to the registry estimate until
 * dedicated signals arrive. CI pass rate and other later signals
 * (for example observability/UAT/perf) are planned for Phase 5+.
 * their signals arrive (Phase 3 / Phase 5 respectively).
 */
const AXIS_WEIGHT: Record<ReadinessAxis, number> = {
  security: 18,
  governance: 12,
  dependencies: 8,
  documentation: 8,
  operational: 4,
};

const TOTAL_WEIGHT = Object.values(AXIS_WEIGHT).reduce((acc, n) => acc + n, 0);

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Composes a 0-100 readiness snapshot for a portfolio repo.
 *
 * When `GITHUB_TOKEN` is absent, falls back to the registry estimate and tags
 * the snapshot `source: "registry-estimate"`. When some live signals fail to
 * load, the snapshot is `source: "partial"` with the unanswered axes filled
 * from the registry estimate, so the user can distinguish "live" from
 * "best-effort".
 */
export async function computeReadiness(repo: PortfolioRepo): Promise<ReadinessSnapshot> {
  const computedAt = new Date().toISOString();

  if (!isGithubConfigured()) {
    return ReadinessSnapshot.parse({
      slug: repo.slug,
      total: repo.readinessEstimate,
      axes: registryEstimateAxes(repo),
      computedAt,
      source: "registry-estimate",
    });
  }

  const [bp, alerts] = await Promise.all([
    safeBranchProtection(repo.slug),
    safeAlerts(repo.slug),
  ]);

  const axes: ReadinessAxisScore[] = [];
  let livePartial = false;

  // ── governance (branch protection) ───────────────────────────────────────
  if (bp.kind === "ok") {
    const data = bp.value;
    let score = 0;
    let signal: string;
    if (!data.enabled) {
      score = 0;
      signal = "no branch protection on default branch";
    } else {
      let s = 0;
      if (data.requiresPullRequest) s += 30;
      if (data.requiredApprovingReviewCount >= 1) s += 25;
      if (data.requiresStatusChecks) s += 20;
      if (data.requiresStrictUpToDate) s += 5;
      if (data.requiresConversationResolution) s += 5;
      if (!data.allowsForcePushes) s += 8;
      if (!data.allowsDeletions) s += 7;
      score = clamp(s, 0, 100);
      signal = `branch protection: ${data.requiredApprovingReviewCount} approval(s), ${data.requiredStatusChecks.length} required check(s)`;
    }
    axes.push({ axis: "governance", score, weight: AXIS_WEIGHT.governance, signal });
  } else {
    livePartial = true;
    axes.push({
      axis: "governance",
      score: registryFallback("governance", repo),
      weight: AXIS_WEIGHT.governance,
      signal: bp.kind === "error" ? `governance: ${bp.message}` : "governance: signal unavailable",
    });
  }

  // ── security (CodeQL alerts) ─────────────────────────────────────────────
  if (alerts.kind === "ok" && alerts.value.codeScanning !== null) {
    const c = alerts.value.codeScanning;
    let s = 100;
    s -= c.critical * 25;
    s -= c.high * 12;
    s -= c.medium * 4;
    s -= c.low * 1;
    const score = clamp(s, 0, 100);
    axes.push({
      axis: "security",
      score,
      weight: AXIS_WEIGHT.security,
      signal: `CodeQL: ${c.total} open (${c.critical} crit / ${c.high} high)`,
    });
  } else {
    livePartial = true;
    axes.push({
      axis: "security",
      score: registryFallback("security", repo),
      weight: AXIS_WEIGHT.security,
      signal: "security: CodeQL signal unavailable",
    });
  }

  // ── dependencies (Dependabot alerts) ─────────────────────────────────────
  if (alerts.kind === "ok" && alerts.value.dependabot !== null) {
    const c = alerts.value.dependabot;
    let s = 100;
    s -= c.critical * 25;
    s -= c.high * 10;
    s -= c.medium * 3;
    s -= c.low * 1;
    const score = clamp(s, 0, 100);
    axes.push({
      axis: "dependencies",
      score,
      weight: AXIS_WEIGHT.dependencies,
      signal: `Dependabot: ${c.total} open (${c.critical} crit / ${c.high} high)`,
    });
  } else {
    livePartial = true;
    axes.push({
      axis: "dependencies",
      score: registryFallback("dependencies", repo),
      weight: AXIS_WEIGHT.dependencies,
      signal: "dependencies: Dependabot signal unavailable",
    });
  }

  // ── documentation (presence of CLAUDE.md / MEMORY.md) ────────────────────
  // Phase 1 cannot read remote file contents cheaply for every repo at every
  // page render; we use the registry estimate and tag this as a registry-side
  // signal until Phase 3 ingests this from the Evidence Lake.
  axes.push({
    axis: "documentation",
    score: registryFallback("documentation", repo),
    weight: AXIS_WEIGHT.documentation,
    signal: "documentation: registry estimate (Phase 3 will ingest live)",
  });

  // ── operational (ENV / CI pass rate placeholders) ────────────────────────
  axes.push({
    axis: "operational",
    score: registryFallback("operational", repo),
    weight: AXIS_WEIGHT.operational,
    signal: "operational: registry estimate (Phase 5 will ingest CI pass rate)",
  });

  const total = clamp(weightedTotal(axes), 0, 100);
  return ReadinessSnapshot.parse({
    slug: repo.slug,
    total,
    axes,
    computedAt,
    source: livePartial ? "partial" : "live",
  });
}

function weightedTotal(axes: ReadinessAxisScore[]): number {
  let weighted = 0;
  let weights = 0;
  for (const a of axes) {
    weighted += a.score * a.weight;
    weights += a.weight;
  }
  if (weights === 0) return 0;
  return Math.round((weighted / weights) * (TOTAL_WEIGHT / TOTAL_WEIGHT));
}

function registryEstimateAxes(repo: PortfolioRepo): ReadinessAxisScore[] {
  return (Object.entries(AXIS_WEIGHT) as Array<[ReadinessAxis, number]>).map(([axis, weight]) => ({
    axis,
    score: repo.readinessEstimate,
    weight,
    signal: "registry estimate (no token)",
  }));
}

function registryFallback(_axis: ReadinessAxis, repo: PortfolioRepo): number {
  return repo.readinessEstimate;
}

type Result<T> = { kind: "ok"; value: T } | { kind: "error"; message: string };

async function safeBranchProtection(
  slug: string,
): Promise<Result<NonNullable<Awaited<ReturnType<typeof getBranchProtection>>>>> {
  try {
    const value = await getBranchProtection(slug);
    if (value === null) return { kind: "error", message: "no client" };
    return { kind: "ok", value };
  } catch (error) {
    // Re-throw Octokit API errors (e.g. 403 wrong scopes, 429 rate-limit, 5xx)
    // so operational misconfigurations surface rather than silently producing
    // a registry-estimate fallback.
    if (error instanceof RequestError) throw error;
    return {
      kind: "error",
      message: error instanceof Error ? error.message : "unknown error",
    };
  }
}

async function safeAlerts(
  slug: string,
): Promise<Result<NonNullable<Awaited<ReturnType<typeof getRepoAlerts>>>>> {
  try {
    const value = await getRepoAlerts(slug);
    if (value === null) return { kind: "error", message: "no client" };
    return { kind: "ok", value };
  } catch (error) {
    // Re-throw Octokit API errors (e.g. 429 rate-limit, 5xx) so operational
    // issues surface rather than silently producing registry-estimate fallbacks.
    if (error instanceof RequestError) throw error;
    return {
      kind: "error",
      message: error instanceof Error ? error.message : "unknown error",
    };
  }
}
