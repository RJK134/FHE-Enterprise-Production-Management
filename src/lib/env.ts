import { z } from "zod";

/**
 * Server-only environment schema for FHE-EPMC.
 *
 * Validation runs lazily on first access so the app still boots in CI / build
 * environments where secrets are intentionally absent. Importing this module
 * from a client component is a build-time error because of the "server-only"
 * import below.
 */
import "server-only";

const portfolioSlugPattern = /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?$/;

const PortfolioAllowlistSchema = z
  .string()
  .trim()
  .min(1, "must not be empty")
  .refine((value) => {
    const entries = value.split(",").map((entry) => entry.trim());
    return (
      entries.length > 0 &&
      entries.every((entry) => entry.length > 0 && portfolioSlugPattern.test(entry))
    );
  }, "must be a comma-separated list of non-empty GitHub slugs")
  .optional();

const EnvSchema = z.object({
  GITHUB_TOKEN: z.string().min(1).optional(),
  GITHUB_API_URL: z.string().url().optional(),
  PORTFOLIO_ALLOWLIST: PortfolioAllowlistSchema,
  // Phase 1 placeholder auth — replaced by SSO in Phase 4.
  // Middleware reads these from process.env directly so the gate runs in the
  // Edge runtime without pulling in the Zod validator. The fields are also
  // present here for documentation, type safety in service modules, and to
  // surface invalid values fast at boot.
  DASHBOARD_BASIC_AUTH_USER: z.string().min(1).optional(),
  DASHBOARD_BASIC_AUTH_PASS: z.string().min(1).optional(),
  DASHBOARD_AUTH_DISABLED: z.enum(["0", "1"]).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

/**
 * Returns the validated server-side environment.
 *
 * Never expose the result of this function to the client. All callers must be
 * inside `src/lib/services/**`, route handlers, or Server Components.
 */
export function env(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_API_URL: process.env.GITHUB_API_URL,
    PORTFOLIO_ALLOWLIST: process.env.PORTFOLIO_ALLOWLIST,
    DASHBOARD_BASIC_AUTH_USER: process.env.DASHBOARD_BASIC_AUTH_USER,
    DASHBOARD_BASIC_AUTH_PASS: process.env.DASHBOARD_BASIC_AUTH_PASS,
    DASHBOARD_AUTH_DISABLED: process.env.DASHBOARD_AUTH_DISABLED,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

/**
 * Returns true when the GitHub service layer has a usable credential.
 * Safe to call from Server Components to render a "not connected" state
 * without throwing.
 */
export function isGithubConfigured(): boolean {
  return Boolean(env().GITHUB_TOKEN);
}

/**
 * @internal Test-only reset. Do not call from app code.
 */
export function __resetEnvForTests(): void {
  cached = undefined;
}
