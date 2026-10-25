import { readFileSync } from "node:fs"
import path from "node:path"

import { act, render, screen, within } from "@testing-library/react"
import { MotionConfig } from "motion/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SampleOne from "@/registry/avelor/blocks/sample-01/sample-01"
import { content } from "@/registry/avelor/blocks/sample-01/content"

const easternDigits = /[٠-٩]/
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

describe.each(directions)("sample-01 under dir=%s", (dir) => {
  it.each(locales)("renders the %s content", (locale) => {
    const t = content[locale]
    const { container } = render(
      <div dir={dir}>
        <SampleOne locale={locale} />
      </div>
    )

    const section = screen.getByRole("region", { name: t.title })
    expect(section.tagName).toBe("SECTION")
    expect(section.closest("[dir]")).toHaveAttribute("dir", dir)

    const heading = within(section).getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent(t.title)
    expect(within(section).getByText(t.eyebrow)).toBeInTheDocument()
    expect(within(section).getByText(t.description)).toBeInTheDocument()
    expect(within(section).getByText(t.stat.label)).toBeInTheDocument()

    const button = within(section).getByRole("button", { name: t.ctaLabel })
    const icon = button.querySelector("svg")
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("data-rtl", "flip")
    expect(icon).toHaveClass("rtl:-scale-x-100")

    const stat = container.querySelector("dd")
    expect(stat).toHaveTextContent("1,280")
    expect(stat?.textContent).not.toMatch(easternDigits)
  })
})

describe("sample-01 content", () => {
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
      path.resolve("registry/avelor/blocks/sample-01/content.ts"),
      "utf8"
    )
    expect(source.startsWith("/* PLACEHOLDER */")).toBe(true)
  })
})

describe("sample-01 reduced motion", () => {
  async function nextFrame() {
    await act(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    )
  }

  it("jumps to the final state with a zero-duration transition", async () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <SampleOne />
      </MotionConfig>
    )
    const reveal = container.querySelector<HTMLElement>("[data-reveal]")
    expect(reveal).not.toBeNull()

    // The animated path fades over `revealTransition.duration` (350 ms); the
    // reduced path uses `instant` and lands in the first animation frame. Two
    // frames (about 32 ms in jsdom) is well inside the animated fade.
    await nextFrame()
    await nextFrame()
    expect(reveal!.style.opacity).toBe("1")
    expect(reveal!.style.transform).toBe("none")
  })
})
