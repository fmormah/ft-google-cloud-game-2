import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  workers: 1,
  maxFailures: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    baseURL: "http://127.0.0.1:4173/ft-google-cloud-game-2/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/serve-pages.mjs",
    url: "http://127.0.0.1:4173/ft-google-cloud-game-2/",
    reuseExistingServer: !process.env.CI,
  },
});
