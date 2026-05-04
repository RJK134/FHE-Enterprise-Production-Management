// Test-only no-op stand-in for the `server-only` Next.js marker module.
// At runtime in Next, importing `server-only` from a Client Component throws.
// In vitest we are testing service modules in isolation; this no-op satisfies
// the import without enforcing the Server Component constraint.
export {};
