import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/__tests__/**/*.{test,spec}.ts", "src/**/__tests__/**/*.{test,spec}.tsx"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/__tests__/**", "**/*.d.ts", "src/app/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws by design when imported outside a Next Server
      // Component. In vitest we are testing those modules in isolation, so
      // alias it to an empty module so the import is a no-op at test time.
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
    },
  },
});
