import { describe, it, expect } from "vitest";
import { evaluateBasicAuth } from "@/lib/auth";

const EXPECTED = { user: "owner", pass: "correct horse battery staple" };

function basicHeader(user: string, pass: string): string {
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(`${user}:${pass}`, "utf-8").toString("base64")
      : btoa(`${user}:${pass}`);
  return `Basic ${encoded}`;
}

describe("evaluateBasicAuth", () => {
  it("accepts a correct credential", () => {
    const r = evaluateBasicAuth(basicHeader(EXPECTED.user, EXPECTED.pass), EXPECTED);
    expect(r.ok).toBe(true);
  });

  it("rejects a missing header", () => {
    const r = evaluateBasicAuth(null, EXPECTED);
    expect(r).toEqual({ ok: false, reason: "missing Authorization header" });
  });

  it("rejects an empty string header", () => {
    const r = evaluateBasicAuth("", EXPECTED);
    expect(r).toEqual({ ok: false, reason: "missing Authorization header" });
  });

  it("rejects a non-Basic scheme", () => {
    const r = evaluateBasicAuth("Bearer abc.def.ghi", EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not a Basic credential/);
  });

  it("rejects an empty Basic payload", () => {
    const r = evaluateBasicAuth("Basic ", EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not a Basic credential/);
  });

  it("rejects malformed base64", () => {
    const r = evaluateBasicAuth("Basic !!!", EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not a Basic credential/);
  });

  it("rejects payload missing the user:pass separator", () => {
    const noColon =
      typeof Buffer !== "undefined"
        ? Buffer.from("nouserseparator", "utf-8").toString("base64")
        : btoa("nouserseparator");
    const r = evaluateBasicAuth(`Basic ${noColon}`, EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/user:pass separator/);
  });

  it("rejects a wrong password", () => {
    const r = evaluateBasicAuth(basicHeader(EXPECTED.user, "wrong"), EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/credentials do not match/);
  });

  it("rejects a wrong username", () => {
    const r = evaluateBasicAuth(basicHeader("attacker", EXPECTED.pass), EXPECTED);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/credentials do not match/);
  });

  it("treats the comparison as constant-time on length mismatch", () => {
    // Smoke test: a far-shorter password should still return the same shape
    // and reason as a same-length-but-wrong password.
    const r1 = evaluateBasicAuth(basicHeader(EXPECTED.user, "x"), EXPECTED);
    const r2 = evaluateBasicAuth(basicHeader(EXPECTED.user, "y".repeat(EXPECTED.pass.length)), EXPECTED);
    expect(r1).toEqual(r2);
  });

  it("handles a password containing the colon character correctly", () => {
    const expected = { user: "owner", pass: "p:a:s:s" };
    const r = evaluateBasicAuth(basicHeader(expected.user, expected.pass), expected);
    expect(r.ok).toBe(true);
  });

  it("handles UTF-8 user/pass cleanly", () => {
    const expected = { user: "Frédérique", pass: "naïve‐résumé" };
    const r = evaluateBasicAuth(basicHeader(expected.user, expected.pass), expected);
    expect(r.ok).toBe(true);
  });
});
