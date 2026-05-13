import { z } from "zod";
import { RepoSlug } from "./repo";

export const BlockerSeverity = z.enum(["P0", "P1", "P2"]);
export type BlockerSeverity = z.infer<typeof BlockerSeverity>;

export const BlockerStatus = z.enum(["open", "in-progress", "resolved", "deferred"]);
export type BlockerStatus = z.infer<typeof BlockerStatus>;

export const Blocker = z.object({
  id: z.string().regex(/^[A-Z][A-Z0-9-]{2,40}$/, "Blocker IDs must look like SJMS-A1, HERM-P12, etc."),
  slug: RepoSlug,
  title: z.string().min(1).max(120),
  severity: BlockerSeverity,
  status: BlockerStatus,
  owner: z.string().min(1),
  openedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  etaAt: z.string().datetime().nullable(),
  description: z.string().min(1),
  evidence: z.array(z.string().min(1)),
  remediationPr: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*#\d+$/).nullable(),
});
export type Blocker = z.infer<typeof Blocker>;

export const Blockers = z.array(Blocker);
export type Blockers = z.infer<typeof Blockers>;
