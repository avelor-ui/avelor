import { readFileSync } from "node:fs"
import path from "node:path"

import { act, render, screen, within } from "@testing-library/react"
import { MotionConfig } from "motion/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import HeroOne from "@/registry/avelor/blocks/hero-01/hero-01"
import { content } from "@/registry/avelor/blocks/hero-01/content"

const directions = ["ltr", "rtl"] as const
const locales = ["en", "ar"] as const

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  expect(consoleError).not.toHaveBeenCalled()
  consoleError.mockRestore()
})

describe.each(directions)("hero-01 under dir=%s", (dir) => {
  it.each(locales)("renders the %s content", (locale) => {
    const t = content[locale]
    const { container } = render(
      <div dir={dir}>
        <HeroOne locale={locale} />
      </div>
    )

    const section = screen.getByRole("region", { name: t.title })
    expect(section.tagName).toBe("SECTION")
    expect(section.closest("[dir]")).toHaveAttribute("dir", dir)

    const headings = within(section).getAllByRole("heading")
    expect(headings).toHaveLength(1)
    expect(headings[0]).toBe(within(section).getByRole("heading", { level: 1 }))
    expect(headings[0]).toHaveTextContent(t.title)
    expect(within(section).getByText(t.eyebrow)).toBeInTheDocument()
    expect(within(section).getByText(t.description)).toBeInTheDocument()

    const links = within(section).getAllByRole("link")
    expect(links).toHaveLength(2)
    const [primary, secondary] = links
    expect(primary).toHaveAccessibleName(t.primaryCta.label)
    expect(primary).toHaveAttribute("href", t.primaryCta.href)
    expect(secondary).toHaveAccessibleName(t.secondaryCta.label)
    expect(secondary).toHaveAttribute("href", t.secondaryCta.href)

    const icon = primary.querySelector("svg")
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("data-rtl", "flip")
    expect(icon).toHaveClass("rtl:-scale-x-100")
    expect(secondary.querySelector("svg")).toBeNull()

    const frames = container.querySelectorAll('div[aria-hidden="true"][data-rtl="flip"]')
    expect(frames).toHaveLength(1)
    expect(frames[0].querySelector("a, button, img")).toBeNull()
  })
})

describe("hero-01 content", () => {
  it("has the same shape in en and ar", () => {
    const shape = (value: unknown): unknown =>
      value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => [k, shape(v)])
          )
        : typeof value
    expect(shape(content.ar)).toEqual(shape(content.en))
  })

  it("is marked PLACEHOLDER", () => {
    const source = readFileSync(
      path.resolve("registry/avelor/blocks/hero-01/content.ts"),
      "utf8"
    )
    expect(source.startsWith("/* PLACEHOLDER */")).toBe(true)
  })
})

describe("hero-01 reduced motion", () => {
  async function nextFrame() {
    await act(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    )
  }

  it("shows every reveal in its final state at once", async () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <HeroOne />
      </MotionConfig>
    )
    const reveals = [...container.querySelectorAll<HTMLElement>("[data-reveal]")]
    expect(reveals).toHaveLength(5)

    // The animated path delays the last text reveal by 210 ms before a 350 ms
    // fade; the reduced path uses `instant` and lands in the first frame.
    await nextFrame()
    await nextFrame()
    for (const reveal of reveals) {
      expect(reveal.style.opacity).toBe("1")
      expect(reveal.style.transform).toBe("none")
    }
  })
})
