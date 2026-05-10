import { NextResponse, type NextRequest } from "next/server";
import { evaluateBasicAuth } from "@/lib/auth";

/**
 * Phase 1 placeholder authentication wall.
 *
 * The dashboard sits behind HTTP Basic Auth using two server-side env vars
 * (`DASHBOARD_BASIC_AUTH_USER`, `DASHBOARD_BASIC_AUTH_PASS`). This is the
 * Phase 1 P1 placeholder per `docs/DELIVERY_PLAN.md`; SSO replaces it in
 * Phase 4.
 *
 * Posture:
 * - Fail-closed: if either credential env var is unset and
 *   `DASHBOARD_AUTH_DISABLED !== "1"`, every request returns 503. This
 *   prevents an accidentally-public deploy.
 * - Local development: set `DASHBOARD_AUTH_DISABLED=1` in `.env.local`
 *   to bypass the gate entirely.
 * - The gate runs in the Edge runtime (Next.js middleware default) so
 *   the cost is sub-millisecond per request.
 *
 * The matcher excludes Next internals and the favicon so the auth challenge
 * does not interfere with the build's own asset pipeline.
 */

const REALM = 'Basic realm="FHE-EPMC", charset="UTF-8"';

export function middleware(req: NextRequest): NextResponse {
  if (process.env.DASHBOARD_AUTH_DISABLED === "1") {
    return NextResponse.next();
  }

  const user = process.env.DASHBOARD_BASIC_AUTH_USER ?? "";
  const pass = process.env.DASHBOARD_BASIC_AUTH_PASS ?? "";

  if (user.length === 0 || pass.length === 0) {
    return new NextResponse(
      "Auth not configured. Set DASHBOARD_BASIC_AUTH_USER and DASHBOARD_BASIC_AUTH_PASS in the deployed environment, or set DASHBOARD_AUTH_DISABLED=1 for local development only.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  const result = evaluateBasicAuth(req.headers.get("authorization"), { user, pass });
  if (!result.ok) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": REALM,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
