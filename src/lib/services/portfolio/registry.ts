import "server-only";
import { Portfolio, type PortfolioRepo } from "@/lib/schemas/repo";

/**
 * Canonical FHE-EPMC portfolio.
 *
 * This is the single source of truth for which products the dashboard manages.
 * Phase 1 stores the registry as a typed config; Phase 3 will move it to the
 * database with the same schema (see docs/ARCHITECTURE.md §4 PortfolioRepo).
 */
const REGISTRY: ReadonlyArray<PortfolioRepo> = [
  {
    slug: "RJK134/SJMS-2.5",
    displayName: "SJMS 2.5",
    stack: "Next.js · TypeScript · Prisma · Postgres",
    currentPhase: "Tranche A hardening",
    readinessEstimate: 72,
    description:
      "Student Journey Management System v2.5. Tranche A focuses on branch protection, secrets-at-rest, transactional outbox/DLQ, dependency hardening, and JWT fallback removal.",
  },
  {
    slug: "RJK134/EquiSmile",
    displayName: "EquiSmile",
    stack: "Next.js · TypeScript · Prisma · Postgres · Stripe",
    currentPhase: "Phase 17 stabilise",
    readinessEstimate: 63,
    description:
      "UK dental practice platform. Phase 17 closes identity, multi-tenancy, CI/database confidence, compliance evidence, dependency security, scaling, and operational reliability gaps.",
  },
  {
    slug: "RJK134/herm-platform",
    displayName: "HERM Platform",
    stack: "Next.js · TypeScript · Prisma · Postgres · Stripe",
    currentPhase: "Phase 1 hardening PRs",
    readinessEstimate: 70,
    description:
      "HE governance platform. Phase 1 closes open hardening PRs, SSO/MFA, revocable sessions, Stripe webhook completeness, observability, DR, and GitHub security automation.",
  },
  {
    slug: "RJK134/FHE-Enterprise-Production-Management",
    displayName: "FHE-EPMC",
    stack: "Next.js 15.5.15 · TypeScript · Tailwind · Octokit · Vercel",
    currentPhase: "Phase 1 — Live Control Tower MVP",
    readinessEstimate: 0,
    description:
      "Master orchestration centre for all FHE product delivery. This dashboard is itself one of the managed products.",
  },
];

const VALIDATED = Portfolio.parse(REGISTRY);

/**
 * Returns the full portfolio in registry order, optionally filtered by the
 * PORTFOLIO_ALLOWLIST env var (comma-separated owner/name list).
 */
export function listPortfolio(allowlist?: string): ReadonlyArray<PortfolioRepo> {
  const filter = (allowlist ?? "").trim();
  if (filter.length === 0) return VALIDATED;
  const allowed = new Set(
    filter
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return VALIDATED.filter((r) => allowed.has(r.slug));
}

/**
 * Finds a single portfolio entry by `owner/name` slug.
 * Returns `undefined` if the slug is not in the registry.
 */
export function findPortfolioRepo(slug: string): PortfolioRepo | undefined {
  return VALIDATED.find((r) => r.slug === slug);
}
