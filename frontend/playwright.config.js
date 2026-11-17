import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the full stack: the Spring Boot API on :8080 and the
 * Vite dev server on :5173, which is one of the two origins CorsConfig allows.
 *
 * The backend runs on an in-memory H2 database and a throwaway JWT secret, so an
 * e2e run never touches Supabase or the local H2 file under backend/data.
 */
const E2E_ENV = {
  JWT_SECRET: "e2e-only-secret-not-for-real-use-0123456789",
  DB_URL: "jdbc:h2:mem:e2e;DB_CLOSE_DELAY=-1",
  DB_USERNAME: "sa",
  DB_PASSWORD: "",
};

export default defineConfig({
  testDir: "./e2e",
  // The demo's onboarding state lives in one backend's memory and is shared by
  // every student account, so the specs run one at a time against it.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "./mvnw -q spring-boot:run",
      cwd: "../backend",
      env: E2E_ENV,
      // /courses needs a JWT, so a running API answers 401. Playwright counts any
      // 2xx-403 status as ready, which makes that 401 the readiness signal.
      url: "http://127.0.0.1:8080/courses",
      reuseExistingServer: !process.env.CI,
      // A cold Maven start downloads dependencies and compiles before it listens.
      timeout: 300_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "npm run dev -- --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
