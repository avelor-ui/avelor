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
