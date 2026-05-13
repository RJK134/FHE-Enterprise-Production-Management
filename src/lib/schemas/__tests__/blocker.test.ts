import { describe, it, expect } from "vitest";
import { Blocker } from "@/lib/schemas/blocker";

const VALID = {
  id: "SJMS-A1",
  slug: "RJK134/SJMS-2.5",
  title: "Branch protection gaps",
  severity: "P0" as const,
  status: "open" as const,
  owner: "RJK134",
  openedAt: "2026-04-15T00:00:00.000Z",
  resolvedAt: null,
  etaAt: null,
  description: "Default branch lacks required CI checks.",
  evidence: ["scan-12345"],
  remediationPr: null,
};

describe("Blocker schema", () => {
  it("accepts a valid blocker", () => {
    expect(Blocker.safeParse(VALID).success).toBe(true);
  });

  it("rejects an invalid id format", () => {
    const bad = { ...VALID, id: "bad-id" };
    expect(Blocker.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown severity", () => {
    const bad = { ...VALID, severity: "P9" };
    expect(Blocker.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown status", () => {
    const bad = { ...VALID, status: "unknown" };
    expect(Blocker.safeParse(bad).success).toBe(false);
  });

  it("accepts a resolved blocker with resolvedAt set", () => {
    const ok = { ...VALID, status: "resolved" as const, resolvedAt: "2026-05-01T00:00:00.000Z" };
    expect(Blocker.safeParse(ok).success).toBe(true);
  });

  it("rejects a non-canonical remediationPr string", () => {
    const bad = { ...VALID, remediationPr: "just-a-string" };
    expect(Blocker.safeParse(bad).success).toBe(false);
  });

  it("accepts a canonical owner/name#N remediationPr string", () => {
    const ok = { ...VALID, remediationPr: "RJK134/SJMS-2.5#149" };
    expect(Blocker.safeParse(ok).success).toBe(true);
  });
});
