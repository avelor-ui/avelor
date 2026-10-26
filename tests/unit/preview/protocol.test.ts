import { describe, expect, it } from "vitest"

import {
  PREVIEW_MESSAGE_SOURCE,
  isPreviewMessage,
} from "@/components/preview/protocol"

const source = PREVIEW_MESSAGE_SOURCE

describe("isPreviewMessage", () => {
  it("accepts ready and a finite resize height within bounds", () => {
    expect(isPreviewMessage({ source, type: "ready" })).toBe(true)
    expect(isPreviewMessage({ source, type: "resize", height: 0 })).toBe(true)
    expect(isPreviewMessage({ source, type: "resize", height: 1234.5 })).toBe(true)
    expect(isPreviewMessage({ source, type: "resize", height: 20000 })).toBe(true)
  })

  it("rejects a missing or foreign source", () => {
    expect(isPreviewMessage({ type: "ready" })).toBe(false)
    expect(isPreviewMessage({ source: "other", type: "ready" })).toBe(false)
    expect(isPreviewMessage(null)).toBe(false)
    expect(isPreviewMessage("ready")).toBe(false)
  })

  it("rejects unknown types", () => {
    expect(isPreviewMessage({ source, type: "scroll", top: 0 })).toBe(false)
    expect(isPreviewMessage({ source })).toBe(false)
  })

  it("rejects a resize whose height is not a finite number in range", () => {
    expect(isPreviewMessage({ source, type: "resize" })).toBe(false)
    expect(isPreviewMessage({ source, type: "resize", height: "600" })).toBe(false)
    expect(isPreviewMessage({ source, type: "resize", height: NaN })).toBe(false)
    expect(isPreviewMessage({ source, type: "resize", height: Infinity })).toBe(false)
    expect(isPreviewMessage({ source, type: "resize", height: -1 })).toBe(false)
    expect(isPreviewMessage({ source, type: "resize", height: 20001 })).toBe(false)
  })
})
