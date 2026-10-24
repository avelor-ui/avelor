import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(results.violations).toEqual([])
}

test("home renders in English LTR and passes axe", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})

test("theme toggle switches the dark class on html", async ({ page }) => {
  await page.goto("/")
  await page.emulateMedia({ colorScheme: "light" })
  const html = page.locator("html")
  await expect(html).not.toHaveClass(/\bdark\b/)
  await page.getByRole("button", { name: "Toggle theme" }).click()
  await expect(html).toHaveClass(/\bdark\b/)
  await page.getByRole("button", { name: "Toggle theme" }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
})

test("docs index renders with the sidebar and passes axe", async ({ page }) => {
  await page.goto("/docs")
  await expect(page.locator("#nd-sidebar")).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})
