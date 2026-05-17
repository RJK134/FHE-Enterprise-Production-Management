import { z } from "zod";

export const PhaseId = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);
export type PhaseId = z.infer<typeof PhaseId>;

export const PhaseStatus = z.enum(["complete", "active", "pending"]);
export type PhaseStatus = z.infer<typeof PhaseStatus>;

export const PhasePriority = z.enum(["P0", "P1", "P2"]);
export type PhasePriority = z.infer<typeof PhasePriority>;

export const PhaseItem = z.object({
  label: z.string().min(1),
  priority: PhasePriority,
  done: z.boolean(),
  doneAt: z.string().datetime().nullable(),
  evidence: z.string().min(1).nullable(),
});
export type PhaseItem = z.infer<typeof PhaseItem>;

export const PhaseSnapshot = z.object({
  id: PhaseId,
  name: z.string().min(1),
  status: PhaseStatus,
  items: z.array(PhaseItem),
});
export type PhaseSnapshot = z.infer<typeof PhaseSnapshot>;

export const PortfolioSnapshot = z.object({
  repos: z.number().int().nonnegative(),
  averageReadiness: z.number().min(0).max(100),
  openBlockers: z.object({
    total: z.number().int().nonnegative(),
    P0: z.number().int().nonnegative(),
    P1: z.number().int().nonnegative(),
    P2: z.number().int().nonnegative(),
  }),
});
export type PortfolioSnapshot = z.infer<typeof PortfolioSnapshot>;

export const PlanSnapshot = z.object({
  computedAt: z.string().datetime(),
  phases: z.array(PhaseSnapshot).length(8),
  portfolio: PortfolioSnapshot,
});
export type PlanSnapshot = z.infer<typeof PlanSnapshot>;
