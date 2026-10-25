import { expect, test } from "@playwright/test"

test.describe("server HTML without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("Arabic dark preview sets lang, dir and the dark class on html", async ({
    page,
  }) => {
    await page.goto("/preview/sample-01?lang=ar&theme=dark")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("lang", "ar")
    await expect(html).toHaveAttribute("dir", "rtl")
    await expect(html).toHaveClass(/\bdark\b/)
    await expect(html).toHaveAttribute("data-motion", "on")
  })

  test("dir overrides the direction derived from lang", async ({ page }) => {
    await page.goto("/preview/sample-01?lang=en&dir=rtl")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("lang", "en")
    await expect(html).toHaveAttribute("dir", "rtl")
    await expect(html).not.toHaveClass(/\bdark\b/)
  })

  test("content is fully visible through the noscript fallback", async ({
    page,
  }) => {
    await page.goto("/preview/sample-01")
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible()
    await expect(page.locator("[data-reveal]")).toHaveCSS(
      "opacity",
      "1"
    )
  })
})

test("the Arabic heading is rendered with IBM Plex Sans Arabic", async ({
  page,
}) => {
  await page.goto("/preview/sample-01?lang=ar")
  await page.evaluate(() => document.fonts.ready)
  const client = await page.context().newCDPSession(page)
  await client.send("DOM.enable")
  await client.send("CSS.enable")
  const { root } = await client.send("DOM.getDocument")
  const { nodeId } = await client.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "h2",
  })
  const { fonts } = await client.send("CSS.getPlatformFontsForNode", { nodeId })
  const main = fonts.reduce((a, b) => (b.glyphCount > a.glyphCount ? b : a))
  // Static faces report the weight in the family name ("… SemiBold").
  expect(main.familyName).toMatch(/^IBM Plex Sans Arabic\b/)
})

test("reduced motion disables animation and shows the final state", async ({
  page,
}) => {
  await page.goto("/preview/sample-01?motion=reduced")
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
  const headStyles = await page.evaluate(() =>
    [...document.head.querySelectorAll("style")].map((s) => s.textContent ?? "")
  )
  expect(headStyles.some((css) => css.includes("animation-duration"))).toBe(true)
  const reveal = page.locator("[data-reveal]")
  await expect(reveal).toHaveCSS("opacity", "1")
  await expect(reveal).toHaveCSS("transform", "none")
})

test("unknown block names return 404", async ({ page }) => {
  const response = await page.goto("/preview/does-not-exist")
  expect(response?.status()).toBe(404)
})
