"use client"

import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from "fumadocs-ui/components/codeblock"

import type { PreviewLang } from "@/lib/preview-params"

import { usePreviewState } from "./preview-state-provider"

export type CodeFileView = {
  name: string
  // Files whose rendering depends on the selected locale carry one node per
  // locale; the rest carry a single node under `en`.
  nodes: Partial<Record<PreviewLang, React.ReactNode>> & { en: React.ReactNode }
  localeAware: boolean
}

export function CodeFiles({ files }: { files: CodeFileView[] }) {
  const { state } = usePreviewState()

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground" data-code-locale={state.lang}>
        showing: <code>{state.lang}</code>
      </p>
      <CodeBlockTabs defaultValue={files[0]?.name}>
        <CodeBlockTabsList>
          {files.map((file) => (
            <CodeBlockTabsTrigger key={file.name} value={file.name}>
              {file.name}
            </CodeBlockTabsTrigger>
          ))}
        </CodeBlockTabsList>
        {files.map((file) => (
          <CodeBlockTab key={file.name} value={file.name}>
            {file.localeAware ? file.nodes[state.lang] : file.nodes.en}
          </CodeBlockTab>
        ))}
      </CodeBlockTabs>
    </div>
  )
}
