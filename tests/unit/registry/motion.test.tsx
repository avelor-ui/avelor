import { renderHook } from "@testing-library/react"
import { MotionConfig, type Transition } from "motion/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  directionalX,
  duration,
  easing,
  instant,
  reveal,
  revealTransition,
  stagger,
  staggerItem,
  viewportOnce,
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

// Limits are the "Motion presets" table in docs/03-DESIGN-SYSTEM.md.
describe("presets against the 03 table", () => {
  const between = (value: number, min: number, max: number) => {
    expect(value).toBeGreaterThanOrEqual(min)
    expect(value).toBeLessThanOrEqual(max)
  }

  it("durations", () => {
    between(duration.micro, 0.15, 0.2)
    between(duration.press, 0.2, 0.3)
    between(duration.reveal, 0.3, 0.4)
    between(duration.staggerChild, 0.06, 0.08)
    expect(duration.staggerListChild).toBe(0.03)
    between(8 * duration.staggerChild, 0.4, 0.6)
    expect(revealTransition.duration).toBe(duration.reveal)
    expect(instant.duration).toBe(0)
  })

  it("easing", () => {
    expect(easing.out).toBe("easeOut")
    expect(easing.inOut).toBe("easeInOut")
    expect(revealTransition.ease).toBe(easing.out)
    expect((staggerItem.visible as { transition: Transition }).transition).toBe(
      revealTransition
    )
  })

  it("reveal: y 12–16, opacity 0 → 1, once with a -10% margin", () => {
    const hidden = reveal.hidden as { opacity: number; y: number }
    const visible = reveal.visible as { opacity: number; y: number }
    expect(hidden.opacity).toBe(0)
    between(hidden.y, 12, 16)
    expect(visible).toEqual({ opacity: 1, y: 0 })
    expect(viewportOnce).toEqual({ once: true, margin: "-10%" })
  })

  it("stagger: y 16–24 per item, the shared per-child delay", () => {
    const hidden = staggerItem.hidden as { opacity: number; y: number }
    const visible = staggerItem.visible as { opacity: number; y: number }
    expect(hidden.opacity).toBe(0)
    between(hidden.y, 16, 24)
    expect(visible.opacity).toBe(1)
    expect(visible.y).toBe(0)
    expect(
      (stagger.visible as { transition: { staggerChildren: number } }).transition
        .staggerChildren
    ).toBe(duration.staggerChild)
  })

  it("no preset translates more than 24px", () => {
    for (const variants of [reveal, stagger, staggerItem]) {
      for (const state of Object.values(variants)) {
        const { x = 0, y = 0 } = state as { x?: number; y?: number }
        expect(Math.abs(x)).toBeLessThanOrEqual(24)
        expect(Math.abs(y)).toBeLessThanOrEqual(24)
      }
    }
  })
})
