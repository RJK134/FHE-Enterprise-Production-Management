import { z } from "zod";

export const CheckRunStatus = z.enum(["queued", "in_progress", "completed"]);
export type CheckRunStatus = z.infer<typeof CheckRunStatus>;

export const CheckRunDetail = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  status: CheckRunStatus,
  conclusion: z.string().nullable(),
  htmlUrl: z.string().url().nullable(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
});
export type CheckRunDetail = z.infer<typeof CheckRunDetail>;

export const ReviewState = z.enum([
  "APPROVED",
  "CHANGES_REQUESTED",
  "COMMENTED",
  "DISMISSED",
  "PENDING",
]);
export type ReviewState = z.infer<typeof ReviewState>;

export const ReviewSummary = z.object({
  approvals: z.number().int().nonnegative(),
  changesRequested: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});
export type ReviewSummary = z.infer<typeof ReviewSummary>;

export const PullRequestDetail = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  authorLogin: z.string().min(1),
  isDraft: z.boolean(),
  state: z.enum(["open", "closed", "merged"]),
  htmlUrl: z.string().url(),
  headRef: z.string().min(1),
  headSha: z.string().min(1),
  baseRef: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  mergeable: z.boolean().nullable(),
  reviews: ReviewSummary,
  checkRuns: z.array(CheckRunDetail),
  branchProtectionEnabled: z.boolean().nullable(),
  branchProtectionRequiresReviews: z.boolean().nullable(),
  branchProtectionRequiredApprovingReviewCount: z.number().int().nonnegative().nullable(),
  branchProtectionRequiredChecks: z.array(z.string()),
});
export type PullRequestDetail = z.infer<typeof PullRequestDetail>;

export const MergeReadiness = z.object({
  ready: z.boolean(),
  reasons: z.array(z.string()),
});
export type MergeReadiness = z.infer<typeof MergeReadiness>;
