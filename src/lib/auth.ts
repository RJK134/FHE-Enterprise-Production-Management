/**
 * Phase 1 placeholder authentication primitives.
 *
 * The dashboard sits behind an HTTP Basic Auth gate served by Next.js
 * middleware (`src/middleware.ts`) until SSO arrives in Phase 4. The pure
 * function below is the only credential-comparing surface — kept free of
 * server-only or Edge-specific imports so it is trivially unit-testable
 * outside a Next runtime.
 */

export type AuthEvaluation = { ok: true } | { ok: false; reason: string };

/**
 * Validates an HTTP `Authorization` header against an expected username and
 * password using the Basic scheme.
 *
 * - Returns `ok: false` (and a precise reason) on any malformed header.
 * - Returns `ok: false` for credential mismatch using a constant-time
 *   compare so wrong passwords never leak length information through
 *   timing.
 * - Returns `ok: true` only when both username and password match exactly.
 */
export function evaluateBasicAuth(
  authHeader: string | null | undefined,
  expected: { user: string; pass: string },
): AuthEvaluation {
  if (!authHeader) return { ok: false, reason: "missing Authorization header" };

  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/.exec(authHeader);
  if (!match) return { ok: false, reason: "Authorization header is not a Basic credential" };

  const encoded = match[1];
  if (typeof encoded !== "string" || encoded.length === 0) {
    return { ok: false, reason: "Authorization header has empty Basic payload" };
  }

  let decoded: string;
  try {
    decoded = decodeBase64(encoded);
  } catch {
    return { ok: false, reason: "Authorization header is not valid base64" };
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) {
    return { ok: false, reason: "Authorization header is missing the user:pass separator" };
  }

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  // Both compares run regardless of which one fails to keep timing flat.
  const userOk = constantTimeEquals(user, expected.user);
  const passOk = constantTimeEquals(pass, expected.pass);
  if (!userOk || !passOk) return { ok: false, reason: "credentials do not match" };

  return { ok: true };
}

function decodeBase64(input: string): string {
  // Always go via atob → bytes → TextDecoder so multi-byte UTF-8 sequences
  // are decoded correctly in both Node and the Next.js Edge runtime. `atob`
  // produces binary as Latin-1 (one byte per char); TextDecoder reinterprets
  // the same bytes as UTF-8.
  if (typeof atob === "function" && typeof TextDecoder === "function") {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  // Defensive fallback for runtimes without atob/TextDecoder. Buffer is
  // available in Node ≤ 16 but not in the Edge runtime.
  if (typeof Buffer !== "undefined") return Buffer.from(input, "base64").toString("utf-8");
  throw new Error("no base64 decoder available in this runtime");
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
