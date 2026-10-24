import SampleOne from "@/registry/avelor/blocks/sample-01/sample-01"
import { content as sampleOneContent } from "@/registry/avelor/blocks/sample-01/content"

export const previewBlocks = {
  "sample-01": { Component: SampleOne, content: sampleOneContent },
} as const

export type PreviewBlockName = keyof typeof previewBlocks
