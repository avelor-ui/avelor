// @vitest-environment node
import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { getCodeFiles, localeLineRange } from "@/lib/registry/code-files"
import { content } from "@/registry/avelor/blocks/hero-01/content"

const builtItem = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "../../../registry-out/hero-01.json"),
    "utf8"
  )
) as { files: { path: string; content: string }[] }

describe("getCodeFiles", () => {
  const files = getCodeFiles("hero-01")

  it("lists exactly the files of the built registry item, in order", () => {
    expect(files.map((f) => f.path)).toEqual(builtItem.files.map((f) => f.path))
    expect(files.map((f) => f.content)).toEqual(builtItem.files.map((f) => f.content))
  })

  it("derives the tab name and language from the path", () => {
    expect(files.map((f) => [f.name, f.lang])).toEqual([
      ["hero-01.tsx", "tsx"],
      ["hero-01-motion.tsx", "tsx"],
      ["content.ts", "ts"],
      ["motion.ts", "ts"],
    ])
  })
})

describe("localeLineRange", () => {
  const source = getCodeFiles("hero-01").find((f) => f.name === "content.ts")!
  const lines = source.content.split("\n")

  it("finds the en and ar blocks of content.ts", () => {
    for (const locale of ["en", "ar"] as const) {
      const range = localeLineRange(source.content, locale)
      expect(range).not.toBeNull()
      expect(lines[range!.start - 1]).toBe(`  ${locale}: {`)
      expect(lines[range!.end - 1]).toMatch(/^ {2}},?$/)
      const block = lines.slice(range!.start - 1, range!.end).join("\n")
      expect(block).toContain(content[locale].title)
    }
  })

  it("keeps the two ranges disjoint", () => {
    const en = localeLineRange(source.content, "en")!
    const ar = localeLineRange(source.content, "ar")!
    expect(en.end).toBeLessThan(ar.start)
  })

  it("returns null for files without a locale block", () => {
    expect(localeLineRange("export const x = 1\n", "en")).toBeNull()
    expect(localeLineRange("  en: {\n  never closed", "en")).toBeNull()
  })
})
