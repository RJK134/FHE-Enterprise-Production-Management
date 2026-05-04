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
