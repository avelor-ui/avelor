import type { HighlightOptions } from "fumadocs-core/highlight"
import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc"

import type { PreviewLang } from "@/lib/preview-params"
import {
  getCodeFiles,
  localeLineRange,
  type CodeFile,
  type LineRange,
} from "@/lib/registry/code-files"
import type { RegistryItemName } from "@/lib/registry/items.generated"
import { installCommand } from "@/lib/site"

import { CodeFiles, type CodeFileView } from "./code-files"

type Transformer = NonNullable<HighlightOptions["transformers"]>[number]

// Fumadocs' default github-light theme puts its green at 4.24:1 on the code
// block surface (axe, plan 001 step 10); the high-contrast pair stays AA.
const themes = {
  light: "github-light-high-contrast",
  dark: "github-dark-high-contrast",
} as const

// Fumadocs styles `.highlighted` lines the same way as its MDX `{1-3}` meta.
function highlightLines(range: LineRange): Transformer {
  return {
    name: "avelor:highlight-lines",
    line(node, line) {
      if (line >= range.start && line <= range.end) {
        this.addClassToHast(node, "highlighted")
      }
    },
  }
}

function fileNode(file: CodeFile, range?: LineRange) {
  return (
    <ServerCodeBlock
      lang={file.lang}
      code={file.content}
      codeblock={{ title: file.name }}
      themes={themes}
      transformers={range ? [highlightLines(range)] : undefined}
    />
  )
}

function toView(file: CodeFile): CodeFileView {
  const ranges = Object.fromEntries(
    (["en", "ar"] as PreviewLang[]).map((locale) => [
      locale,
      localeLineRange(file.content, locale),
    ])
  ) as Record<PreviewLang, LineRange | null>

  if (ranges.en && ranges.ar) {
    return {
      name: file.name,
      localeAware: true,
      nodes: { en: fileNode(file, ranges.en), ar: fileNode(file, ranges.ar) },
    }
  }
  return { name: file.name, localeAware: false, nodes: { en: fileNode(file) } }
}

export function CodeView({ name }: { name: RegistryItemName }) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby={`${name}-install`} className="flex flex-col gap-2">
        <h3 id={`${name}-install`} className="text-sm font-medium">
          Install
        </h3>
        <ServerCodeBlock lang="bash" code={installCommand(name)} themes={themes} />
      </section>
      <CodeFiles files={getCodeFiles(name).map(toView)} />
    </div>
  )
}
