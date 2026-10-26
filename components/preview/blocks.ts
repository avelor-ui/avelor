import HeroOne from "@/registry/avelor/blocks/hero-01/hero-01"
import { content as heroOneContent } from "@/registry/avelor/blocks/hero-01/content"

export const previewBlocks = {
  "hero-01": { Component: HeroOne, content: heroOneContent },
} as const

export type PreviewBlockName = keyof typeof previewBlocks
