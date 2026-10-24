import { describe, expect, it } from "vitest"

import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/registry/avelor/lib/format"

const easternDigits = /[٠-٩]/
const day = Date.UTC(2026, 9, 25)

describe("formatNumber", () => {
  it("groups thousands in English", () => {
    expect(formatNumber(1280.5, "en")).toBe("1,280.5")
  })

  it("keeps Western digits in Arabic by default", () => {
    const out = formatNumber(1280.5, "ar")
    expect(out).not.toMatch(easternDigits)
    expect(out).toContain("1")
    expect(out).toContain("280")
  })

  it("passes Intl options through", () => {
    expect(formatNumber(0.256, "en", { style: "percent" })).toBe("26%")
  })
})

describe("formatCurrency", () => {
  it("formats USD in English", () => {
    expect(formatCurrency(49, "en", "USD")).toBe("$49.00")
  })

  it("formats SAR in Arabic with Western digits and the Arabic symbol", () => {
    const out = formatCurrency(49, "ar", "SAR")
    expect(out).not.toMatch(easternDigits)
    expect(out).toContain("49.00")
    expect(out).toContain("ر.س")
  })
})

describe("formatDate", () => {
  it("defaults to a medium date in English", () => {
    expect(
      formatDate(day, "en", { dateStyle: "medium", timeZone: "UTC" })
    ).toBe("Oct 25, 2026")
  })

  it("uses the Gregorian calendar and Western digits in Arabic", () => {
    const out = formatDate(day, "ar", { dateStyle: "medium", timeZone: "UTC" })
    expect(out).not.toMatch(easternDigits)
    expect(out).toContain("2026")
    expect(out).toContain("25")
  })
})
