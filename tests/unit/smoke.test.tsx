import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { cn } from "@/lib/utils"

describe("test toolchain", () => {
  it("merges class names through the path alias", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })

  it("renders React into jsdom with jest-dom matchers", () => {
    render(
      <section dir="rtl">
        <h2>عنوان</h2>
      </section>
    )
    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading.closest("section")).toHaveAttribute("dir", "rtl")
  })
})
