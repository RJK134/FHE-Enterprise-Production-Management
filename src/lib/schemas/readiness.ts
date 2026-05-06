import { z } from "zod";

export const ReadinessAxis = z.enum([
  "security",
  "governance",
  "dependencies",
  "documentation",
  "operational",
]);
export type ReadinessAxis = z.infer<typeof ReadinessAxis>;

export const ReadinessAxisScore = z.object({
  axis: ReadinessAxis,
  score: z.number().int().min(0).max(100),
  weight: z.number().int().min(0).max(100),
  signal: z.string().min(1),
});
export type ReadinessAxisScore = z.infer<typeof ReadinessAxisScore>;

export const ReadinessSnapshot = z.object({
  slug: z.string().min(1),
  total: z.number().int().min(0).max(100),
  axes: z.array(ReadinessAxisScore).min(1),
  computedAt: z.string().datetime(),
  source: z.enum(["live", "registry-estimate", "partial"]),
});
export type ReadinessSnapshot = z.infer<typeof ReadinessSnapshot>;
