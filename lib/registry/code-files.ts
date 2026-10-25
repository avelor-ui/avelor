import type { PreviewLang } from "@/lib/preview-params"

import { registryItems, type RegistryItemName } from "./items.generated"

export type CodeFile = {
  path: string
  name: string
  lang: "ts" | "tsx"
  content: string
}

export function getCodeFiles(item: RegistryItemName): CodeFile[] {
  return registryItems[item].files.map((file) => ({
    path: file.path,
    name: file.path.slice(file.path.lastIndexOf("/") + 1),
    lang: file.path.endsWith(".tsx") ? "tsx" : "ts",
    content: file.content,
  }))
}

export type LineRange = { start: number; end: number }

// `content.ts` follows the 07 layout: `  en: {` … `  },` at two-space indent.
// Returns 1-based inclusive lines, or null when the locale block is absent.
export function localeLineRange(
  content: string,
  locale: PreviewLang
): LineRange | null {
  const lines = content.split("\n")
  const start = lines.findIndex((line) => line.startsWith(`  ${locale}: {`))
  if (start === -1) return null
  const end = lines.findIndex(
    (line, index) => index > start && /^ {2}},?$/.test(line)
  )
  if (end === -1) return null
  return { start: start + 1, end: end + 1 }
}
