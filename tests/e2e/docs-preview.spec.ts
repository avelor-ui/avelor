import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const pagePath = "/docs/blocks/sample-01"

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(results.violations).toEqual([])
}

function frame(page: Page) {
  return page.locator("iframe[title$='theme']")
}

async function frameParams(page: Page) {
  const src = await frame(page).getAttribute("src")
  return new URL(src ?? "", "http://x").searchParams
}

async function expectRevealed(page: Page) {
  await expect(
    page.frameLocator("iframe[title$='theme']").locator("[data-sample-01-reveal]")
  ).toHaveCSS("opacity", "1")
}

test("Code mode shows the Arabic section and Playground keeps the 360 frame", async ({
  page,
}) => {
  await page.goto(`${pagePath}?mode=code&lang=ar&theme=dark&width=360`)
  const codeTab = page.getByRole("tab", { name: "Code" })
  await expect(codeTab).toHaveAttribute("aria-selected", "true")
  await expect(page.locator("[data-code-locale]")).toHaveText(/showing: ar/)

  await page.getByRole("tab", { name: "content.ts" }).click()
  const contentPanel = page.getByRole("tabpanel", { name: "content.ts" })
  const highlighted = contentPanel.locator(".highlighted")
  await expect(highlighted.first()).toContainText("ar: {")
  await expect(highlighted.filter({ hasText: "نموذج داخلي" })).toHaveCount(1)
  await expect(highlighted.filter({ hasText: "Internal sample" })).toHaveCount(0)

  await page.getByRole("tab", { name: "Playground" }).click()
  await expect(page).toHaveURL(/lang=ar/)
  await expect(page).not.toHaveURL(/mode=/)
  await expect(frame(page)).toHaveAttribute("width", "360")
  await expect(page.getByRole("button", { name: "360" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
})

test("switching to Arabic updates the URL and the frame without a navigation", async ({
  page,
}) => {
  await page.goto(`${pagePath}?theme=light`)
  await page.evaluate(() => {
    ;(window as unknown as { __avelorMarker: number }).__avelorMarker = 1
  })
  await expect(frame(page)).toHaveAttribute("src", /lang=en&dir=ltr&theme=light/)

  await page.getByRole("button", { name: "العربية" }).click()
  await expect(page).toHaveURL(/lang=ar/)
  await expect(frame(page)).toHaveAttribute("src", /lang=ar&dir=rtl&theme=light/)
  await expect(page.getByRole("button", { name: "العربية" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  expect(
    await page.evaluate(
      () => (window as unknown as { __avelorMarker?: number }).__avelorMarker
    )
  ).toBe(1)
})

test("lang and theme agree between URL, frame src, preview html and Code label", async ({
  page,
}) => {
  await page.goto(`${pagePath}?lang=ar&theme=dark`)
  const params = await frameParams(page)
  expect(params.get("lang")).toBe("ar")
  expect(params.get("dir")).toBe("rtl")
  expect(params.get("theme")).toBe("dark")

  const previewHtml = page.frameLocator("iframe[title$='theme']").locator("html")
  await expect(previewHtml).toHaveAttribute("lang", "ar")
  await expect(previewHtml).toHaveAttribute("dir", "rtl")
  await expect(previewHtml).toHaveClass(/\bdark\b/)

  await page.getByRole("tab", { name: "Code" }).click()
  await expect(page).toHaveURL(/mode=code/)
  await expect(page.locator("[data-code-locale]")).toHaveText(/showing: ar/)
})

test("theme falls back to the docs theme and is written into the URL", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto(pagePath)
  await expect(page).toHaveURL(/theme=dark/)
  await expect(frame(page)).toHaveAttribute("src", /theme=dark/)
  await expect(
    page.frameLocator("iframe[title$='theme']").locator("html")
  ).toHaveClass(/\bdark\b/)
})

test("install command targets the registry route for this block", async ({
  page,
}) => {
  await page.goto(`${pagePath}?mode=code&theme=light`)
  await expect(page.getByText(/npx shadcn@latest add .*\/r\/sample-01\.json/)).toBeVisible()
})

test.describe("phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("defaults to the 360 frame and keeps the controls reachable", async ({
    page,
  }) => {
    await page.goto(`${pagePath}?theme=light`)
    await expect(frame(page)).toHaveAttribute("width", "360")
    await expect(page).not.toHaveURL(/width=/)
    await expect(page.getByRole("button", { name: "Reduced" })).toBeVisible()
    await page.getByRole("button", { name: "Reduced" }).click()
    await expect(frame(page)).toHaveAttribute("src", /motion=reduced/)
  })
})

for (const query of ["lang=en&theme=light", "lang=ar&theme=dark"]) {
  test(`docs page passes axe with ${query}`, async ({ page }) => {
    await page.goto(`${pagePath}?${query}`)
    await expectRevealed(page)
    await expectNoAxeViolations(page)
  })
}

for (const scheme of ["light", "dark"] as const) {
  test(`Code mode passes axe in ${scheme} docs theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto(`${pagePath}?mode=code`)
    await expect(page.getByRole("tab", { name: "content.ts" })).toBeVisible()
    await expectNoAxeViolations(page)
  })
}
