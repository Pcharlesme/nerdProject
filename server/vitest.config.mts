import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Without this, vitest's default glob also matches the compiled output under
    // dist/ once `npm run build` has run once — those are plain CJS and can't
    // import vitest, so every test would appear to run twice, one copy failing.
    exclude: ["**/node_modules/**", "**/dist/**"],
    globalSetup: ["./src/tests/support/globalSetup.ts"],
    setupFiles: ["./src/tests/support/setupEnv.ts"],
    // Spinning up embedded Postgres + applying migrations can take a while on a cold run.
    testTimeout: 20_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
