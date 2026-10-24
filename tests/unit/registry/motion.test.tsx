import { renderHook } from "@testing-library/react"
import { MotionConfig } from "motion/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  directionalX,
  duration,
  reveal,
  revealTransition,
  staggerItem,
  useDirectionalX,
  useDocumentDirection,
  useReducedMotionSafe,
} from "@/registry/avelor/lib/motion"

afterEach(() => {
  document.documentElement.removeAttribute("dir")
})

describe("directionalX", () => {
  it("keeps the physical value in LTR and mirrors it in RTL", () => {
    expect(directionalX(-24, "ltr")).toBe(-24)
    expect(directionalX(-24, "rtl")).toBe(24)
    expect(directionalX(24, "rtl")).toBe(-24)
  })
})

describe("useDocumentDirection / useDirectionalX", () => {
  it("reads rtl from <html dir>", () => {
    document.documentElement.dir = "rtl"
    expect(renderHook(() => useDocumentDirection()).result.current).toBe("rtl")
    expect(renderHook(() => useDirectionalX(-24)).result.current).toBe(24)
  })

  it("treats a missing dir as ltr", () => {
    expect(renderHook(() => useDocumentDirection()).result.current).toBe("ltr")
    expect(renderHook(() => useDirectionalX(-24)).result.current).toBe(-24)
  })
})

describe("useReducedMotionSafe", () => {
  it("is false when nothing asks for reduced motion", () => {
    expect(renderHook(() => useReducedMotionSafe()).result.current).toBe(false)
  })

  it("follows MotionConfig reducedMotion=always", () => {
    const { result } = renderHook(() => useReducedMotionSafe(), {
      wrapper: ({ children }) => (
        <MotionConfig reducedMotion="always">{children}</MotionConfig>
      ),
    })
    expect(result.current).toBe(true)
  })
})

describe("presets", () => {
  it("stay inside the design-system limits", () => {
    expect(revealTransition.duration).toBeGreaterThanOrEqual(0.3)
    expect(revealTransition.duration).toBeLessThanOrEqual(0.4)
    expect(duration.staggerChild).toBeGreaterThanOrEqual(0.06)
    expect(duration.staggerChild).toBeLessThanOrEqual(0.08)
    for (const variants of [reveal, staggerItem]) {
      const hidden = variants.hidden as { y: number }
      expect(Math.abs(hidden.y)).toBeLessThanOrEqual(24)
    }
  })
})
