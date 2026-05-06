import { z } from "zod";

export const AlertSeverity = z.enum(["critical", "high", "medium", "low", "warning", "note", "error"]);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

export const AlertCounts = z.object({
  total: z.number().int().nonnegative(),
  critical: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
});
export type AlertCounts = z.infer<typeof AlertCounts>;

export const RepoAlerts = z.object({
  dependabot: AlertCounts.nullable(),
  codeScanning: AlertCounts.nullable(),
});
export type RepoAlerts = z.infer<typeof RepoAlerts>;
