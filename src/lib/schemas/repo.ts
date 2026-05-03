import { z } from "zod";

export const RepoSlug = z
  .string()
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/,
    "expected owner/name (GitHub login + repo name)",
  );

export const PortfolioRepo = z.object({
  slug: RepoSlug,
  displayName: z.string().min(1),
  stack: z.string().min(1),
  currentPhase: z.string().min(1),
  readinessEstimate: z.number().int().min(0).max(100),
  description: z.string().min(1),
});

export type PortfolioRepo = z.infer<typeof PortfolioRepo>;

export const Portfolio = z.array(PortfolioRepo).min(1);
export type Portfolio = z.infer<typeof Portfolio>;
