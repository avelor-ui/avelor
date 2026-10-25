import { readFileSync } from "node:fs"

import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { screenshotsIgnored } from "../../playwright.config"

type RegistryItem = { name: string; type: string }
const registry = JSON.parse(readFileSync("registry.json", "utf8")) as {
  items: RegistryItem[]
}
const blocks = registry.items
  .filter((item) => item.type === "registry:block")
  .map((item) => item.name)

const langs = ["en", "ar"] as const
const themes = ["light", "dark"] as const
const widths = [360, 768, 1280] as const

const dirForLang = (lang: (typeof langs)[number]) => (lang === "ar" ? "rtl" : "ltr")

if (screenshotsIgnored) {
  console.log(
    `screenshot assertions ignored on ${process.platform}; set AVELOR_SCREENSHOTS=1 to run them`
  )
}

async function openPreview(page: Page, name: string, query: Record<string, string>) {
  await page.goto(`/preview/${name}?${new URLSearchParams(query)}`)
  await page.evaluate(() => document.fonts.ready)
}

async function waitForReveals(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-reveal]")].every(
          (el) => getComputedStyle(el).opacity === "1"
        )
      )
    )
    .toBe(true)
}

// whileInView reveals below the fold only fire once they are scrolled into view.
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight
    const bottom = () => document.documentElement.scrollHeight - step
    for (let y = 0; y <= bottom(); y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    }
    window.scrollTo(0, bottom())
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    window.scrollTo(0, 0)
  })
  await waitForReveals(page)
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Blocks never use a positive tabindex, so DOM order is the only correct Tab
// order. Each visible focusable inside <main> is numbered in that order and
// Tab must land on 0, 1, 2… then leave the block.
async function walkWithTab(page: Page) {
  const count = await page.evaluate((selector) => {
    const list = [...document.querySelectorAll<HTMLElement>(`main :is(${selector})`)].filter(
      (el) => el.checkVisibility()
    )
    list.forEach((el, i) => el.setAttribute("data-kb-stop", String(i)))
    ;(document.activeElement as HTMLElement | null)?.blur()
    return list.length
  }, FOCUSABLE)

  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab")
    const landedOn = await page.evaluate(
      () => document.activeElement?.getAttribute("data-kb-stop") ?? document.activeElement?.tagName
    )
    expect(landedOn, `Tab ${i + 1} skipped focusable ${i}`).toBe(String(i))
    const focusRing = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element)
      return (
        (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) ||
        style.boxShadow !== "none"
      )
    })
    expect(focusRing, `stop ${i} has no visible focus indicator`).toBe(true)
  }

  await page.keyboard.press("Tab")
  const trapped = await page.evaluate(() => document.activeElement?.closest("main") !== null)
  expect(trapped, "focus stays inside the block after its last stop").toBe(false)
  return count
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(results.violations).toEqual([])
}

for (const name of blocks) {
  test.describe(name, () => {
    for (const lang of langs) {
      for (const theme of themes) {
        for (const width of widths) {
          test(`screenshot ${lang} ${theme} ${width}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 })
            await openPreview(page, name, { lang, dir: dirForLang(lang), theme })
            await revealAll(page)
            await expect(page).toHaveScreenshot([name, `${lang}-${theme}-${width}.png`], {
              fullPage: true,
              animations: "disabled",
            })
          })
        }
      }
    }

    // Reduced motion must land on the exact pixels the animated run ends on,
    // with nothing scrolled into view: every reveal shows at once.
    for (const lang of langs) {
      test(`reduced motion equals the final state ${lang}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 })
        await openPreview(page, name, {
          lang,
          dir: dirForLang(lang),
          theme: "light",
          motion: "reduced",
        })
        await waitForReveals(page)
        await expect(page).toHaveScreenshot([name, `${lang}-light-1280.png`], {
          fullPage: true,
          animations: "disabled",
        })
      })
    }

    for (const dir of ["ltr", "rtl"] as const) {
      test(`keyboard walk ${dir}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 })
        await openPreview(page, name, { lang: dir === "rtl" ? "ar" : "en", dir, theme: "light" })
        await revealAll(page)
        const stops = await walkWithTab(page)

        const button = page.locator("main button:not([disabled])").first()
        const link = page.locator("main a[href]").first()
        const hasButton = (await button.count()) > 0
        const hasLink = (await link.count()) > 0

        if (hasButton) {
          await button.evaluate((el) =>
            el.addEventListener("click", () => el.setAttribute("data-kb-clicked", "true"), {
              once: true,
            })
          )
          await button.focus()
          await page.keyboard.press("Space")
          await expect(button).toHaveAttribute("data-kb-clicked", "true")
        }
        // Last, because Enter may leave the page.
        if (hasLink) {
          await link.focus()
          await Promise.all([page.waitForEvent("framenavigated"), page.keyboard.press("Enter")])
        }
        if (!hasButton && !hasLink) {
          expect(stops).toBe(0)
        }
      })
    }

    for (const [lang, theme] of [
      ["en", "light"],
      ["ar", "dark"],
    ] as const) {
      test(`passes axe ${lang} ${theme}`, async ({ page }) => {
        await openPreview(page, name, { lang, dir: dirForLang(lang), theme })
        // axe blends opacity into the contrast check, so wait for the entrance to finish.
        await revealAll(page)
        await expectNoAxeViolations(page)
      })
    }
  })
}
