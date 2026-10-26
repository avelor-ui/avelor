import HeroOne from "@/registry/avelor/blocks/hero-01/hero-01"
import { content as heroOneContent } from "@/registry/avelor/blocks/hero-01/content"
import SampleOne from "@/registry/avelor/blocks/sample-01/sample-01"
import { content as sampleOneContent } from "@/registry/avelor/blocks/sample-01/content"

export const previewBlocks = {
  "sample-01": { Component: SampleOne, content: sampleOneContent },
  "hero-01": { Component: HeroOne, content: heroOneContent },
} as const

export type PreviewBlockName = keyof typeof previewBlocks
