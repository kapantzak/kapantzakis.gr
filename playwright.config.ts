import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const externalBaseURL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // Firefox stable lacks scroll-driven animations; it exercises the heading fallback only (decision 86).
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /heading-slide\.spec\.ts$/,
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 240_000,
      },
});
