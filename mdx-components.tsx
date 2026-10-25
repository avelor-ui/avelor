import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { BlockPreview } from "@/components/preview/block-preview"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    BlockPreview,
    ...components,
  } satisfies MDXComponents
}
