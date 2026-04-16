import { defineConfig } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_WEB_PORT ?? "3100");
const disableWebServer = process.env.PLAYWRIGHT_DISABLE_WEBSERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: disableWebServer
    ? undefined
    : {
        command: `npm run dev -- --port ${port}`,
        port,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          INSTANTREPORT_API_BASE_URL:
            process.env.INSTANTREPORT_API_BASE_URL ?? "http://127.0.0.1:4000/api"
        }
      }
});
