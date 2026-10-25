import { Suspense } from "react"

import {
  registryItems,
  type RegistryItemName,
} from "@/lib/registry/items.generated"

import { BlockPreviewShell } from "./block-preview-shell"
import { CodeView } from "./code-view"
import { PreviewStateProvider } from "./preview-state-provider"

export function BlockPreview({ name }: { name: RegistryItemName }) {
  const { title } = registryItems[name]

  return (
    // useSearchParams needs a boundary on statically rendered pages.
    <Suspense
      fallback={<div aria-busy="true" className="min-h-96 rounded-lg border bg-card" />}
    >
      <PreviewStateProvider>
        <BlockPreviewShell name={name} title={title} code={<CodeView name={name} />} />
      </PreviewStateProvider>
    </Suspense>
  )
}
