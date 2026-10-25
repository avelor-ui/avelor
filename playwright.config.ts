import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)
const port = process.env.PORT ?? "3000"
const baseURL = `http://localhost:${port}`

// Baselines are rendered on Linux only (the Screenshots workflow); any other
// platform would produce different anti-aliasing and font metrics.
export const screenshotsIgnored =
  process.platform !== "linux" && !process.env.AVELOR_SCREENSHOTS

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  snapshotPathTemplate: "screenshots/blocks/{arg}{ext}",
  ignoreSnapshots: screenshotsIgnored,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
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
