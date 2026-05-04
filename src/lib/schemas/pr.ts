import { z } from "zod";

export const PrCheckConclusion = z.enum([
  "success",
  "failure",
  "neutral",
  "cancelled",
  "timed_out",
  "action_required",
  "skipped",
  "stale",
  "pending",
]);
export type PrCheckConclusion = z.infer<typeof PrCheckConclusion>;

export const PrCheckSummary = z.object({
  total: z.number().int().min(0),
  success: z.number().int().min(0),
  failure: z.number().int().min(0),
  pending: z.number().int().min(0),
  neutral: z.number().int().min(0),
});
export type PrCheckSummary = z.infer<typeof PrCheckSummary>;

export const PullRequestSummary = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  authorLogin: z.string().min(1),
  isDraft: z.boolean(),
  htmlUrl: z.string().url(),
  headRef: z.string().min(1),
  baseRef: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  checks: PrCheckSummary,
});
export type PullRequestSummary = z.infer<typeof PullRequestSummary>;
