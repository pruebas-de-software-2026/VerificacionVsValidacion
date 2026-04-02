import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      all: false,
      reporter: ["text", "json"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/node_modules/**",
        "src/lib/types/**",
        "src/lib/fetch-catalog.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 58,
        statements: 80,
      },
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
