import { describe, it, expect } from "vitest";
import {
  classifyCheckRun,
  summariseChecksBySource,
} from "@/lib/services/github/check-classification";

describe("classifyCheckRun", () => {
  const cases: ReadonlyArray<[string, ReturnType<typeof classifyCheckRun>]> = [
    ["Claude auto-review", "claude"],
    ["claude code (on demand)", "claude"],
    ["Cursor BugBot", "bugbot"],
    ["Cursor Bugbot", "bugbot"],
    ["Copilot review", "copilot"],
    ["CodeQL", "codeql"],
    ["analyse (javascript-typescript)", "codeql"],
    ["Code scanning", "codeql"],
    ["Dependabot", "dependabot"],
    ["Vercel — Preview", "vercel"],
    ["GitGuardian Security Checks", "gitguardian"],
    ["lint", "ci"],
    ["typecheck", "ci"],
    ["test", "ci"],
    ["build", "ci"],
    ["foundation files", "ci"],
    ["yaml lint", "ci"],
    ["markdown lint", "ci"],
    ["lint / typecheck / test / build", "ci"],
    ["ci/lint", "ci"],
    ["", "other"],
    ["random-job-from-some-external-service", "other"],
  ];

  for (const [name, expected] of cases) {
    it(`classifies "${name}" as "${expected}"`, () => {
      expect(classifyCheckRun(name)).toBe(expected);
    });
  }
});

describe("summariseChecksBySource", () => {
  it("returns an empty map when no runs", () => {
    expect(summariseChecksBySource([])).toEqual({});
  });

  it("groups by source with worst-state-wins rule", () => {
    const runs = [
      { name: "Claude auto-review", status: "completed", conclusion: "success" },
      { name: "lint", status: "completed", conclusion: "success" },
      { name: "typecheck", status: "completed", conclusion: "failure" },
      { name: "build", status: "in_progress", conclusion: null },
      { name: "Cursor Bugbot", status: "completed", conclusion: "neutral" },
    ];
    const out = summariseChecksBySource(runs);
    expect(out.claude).toBe("success");
    expect(out.ci).toBe("failure"); // failure beats pending beats success
    expect(out.bugbot).toBe("neutral");
  });

  it("counts an in-progress run as pending", () => {
    const out = summariseChecksBySource([
      { name: "Claude auto-review", status: "queued", conclusion: null },
    ]);
    expect(out.claude).toBe("pending");
  });

  it("treats unknown conclusions as failure", () => {
    const out = summariseChecksBySource([
      { name: "lint", status: "completed", conclusion: "weird-new-conclusion" },
    ]);
    expect(out.ci).toBe("failure");
  });
});
