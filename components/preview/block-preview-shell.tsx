"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { previewModes, type PreviewMode } from "@/lib/preview-state"

import { PreviewControls } from "./controls"
import { PreviewFrame } from "./preview-frame"
import { usePreviewState } from "./preview-state-provider"

export function BlockPreviewShell({
  name,
  title,
  code,
}: {
  name: string
  title: string
  code: React.ReactNode
}) {
  const { state, update } = usePreviewState()

  return (
    <Tabs
      value={state.mode}
      onValueChange={(value) => {
        if (previewModes.includes(value as PreviewMode)) {
          update({ mode: value as PreviewMode })
        }
      }}
      className="not-prose gap-4"
    >
      <TabsList aria-label="Preview mode">
        <TabsTrigger value="playground">Playground</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="playground" keepMounted className="flex flex-col gap-4">
        <PreviewControls />
        <PreviewFrame name={name} title={title} />
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
