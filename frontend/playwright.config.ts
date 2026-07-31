import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    // Desktop project runs the full suite (including the mobile spec, which is
    // also valid at desktop width as a regression guard).
    { name: "chromium", use: { browserName: "chromium" } },
    // Mobile project runs only the purpose-built, mobile-safe spec. The other
    // specs encode desktop-only assumptions (e.g. nav CTAs hidden below `sm`).
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
