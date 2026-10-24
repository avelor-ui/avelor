import { useReducedMotionConfig } from "motion/react"
import type { Easing, Transition, Variants } from "motion/react"
import { useSyncExternalStore } from "react"

export const duration = {
  micro: 0.15,
  press: 0.25,
  reveal: 0.35,
  staggerChild: 0.07,
  staggerListChild: 0.03,
} as const

export const easing = {
  out: "easeOut",
  inOut: "easeInOut",
} as const satisfies Record<string, Easing>

export const revealTransition: Transition = {
  duration: duration.reveal,
  ease: easing.out,
}

export const instant: Transition = { duration: 0 }

export const viewportOnce = { once: true, margin: "-10%" } as const

export const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: duration.staggerChild } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
}

export type Direction = "ltr" | "rtl"

export function directionalX(x: number, dir: Direction): number {
  return dir === "rtl" ? -x : x
}

function readDocumentDirection(): Direction {
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr"
}

// Direction never changes while a document is alive (a language switch is a
// new document), so there is nothing to subscribe to.
const subscribe = () => () => {}

export function useDocumentDirection(): Direction {
  return useSyncExternalStore(subscribe, readDocumentDirection, () => "ltr")
}

export function useDirectionalX(x: number): number {
  return directionalX(x, useDocumentDirection())
}

export function useReducedMotionSafe(): boolean {
  return useReducedMotionConfig() ?? false
}
