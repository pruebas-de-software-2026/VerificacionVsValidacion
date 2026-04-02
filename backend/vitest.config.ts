import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    pool: "forks",
    coverage: {
      provider: "v8",
      all: false,
      reporter: ["text", "json"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "**/generated/**",
        "src/index.ts",
        "src/logger.ts",
        "src/http-logger.ts",
        "src/services/auth-service.ts",
        "src/config/auth-config.ts",
        "src/controllers/auth-controller.ts",
        "src/routes/auth-routes.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 67,
        statements: 80,
      },
    },
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
