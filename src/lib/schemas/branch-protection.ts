import { z } from "zod";

export const BranchProtectionState = z.object({
  enabled: z.boolean(),
  requiresPullRequest: z.boolean(),
  requiredApprovingReviewCount: z.number().int().nonnegative(),
  requiresStatusChecks: z.boolean(),
  requiredStatusChecks: z.array(z.string()),
  requiresStrictUpToDate: z.boolean(),
  requiresConversationResolution: z.boolean(),
  enforceAdmins: z.boolean(),
  allowsForcePushes: z.boolean(),
  allowsDeletions: z.boolean(),
});
export type BranchProtectionState = z.infer<typeof BranchProtectionState>;
