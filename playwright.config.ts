import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)
const port = process.env.PORT ?? "3000"
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI builds in an earlier step; locally the dev server is enough.
    command: `${isCI ? "pnpm start" : "pnpm dev"} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
