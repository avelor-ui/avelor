// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  parsePreviewState,
  previewFrameSrc,
  writePreviewState,
  type PreviewState,
} from "@/lib/preview-state"

describe("parsePreviewState", () => {
  it("leaves theme and width unresolved when absent", () => {
    expect(parsePreviewState(new URLSearchParams())).toEqual({
      mode: "playground",
      lang: "en",
      theme: null,
      width: null,
      motion: "on",
    })
  })

  it("reads every key and ignores unknown values", () => {
    expect(
      parsePreviewState(
        new URLSearchParams("mode=code&lang=ar&theme=dark&width=360&motion=reduced")
      )
    ).toEqual({
      mode: "code",
      lang: "ar",
      theme: "dark",
      width: "360",
      motion: "reduced",
    })
    expect(
      parsePreviewState(new URLSearchParams("mode=compare&width=999&theme=sepia"))
    ).toMatchObject({ mode: "playground", width: null, theme: null })
  })
})

describe("writePreviewState", () => {
  const state: PreviewState = {
    mode: "playground",
    lang: "en",
    theme: "light",
    width: "full",
    motion: "on",
  }

  it("writes theme and drops keys at their default", () => {
    expect(writePreviewState(new URLSearchParams(), state, "full").toString()).toBe(
      "theme=light"
    )
  })

  it("keeps a 360 width on desktop but drops it on a phone", () => {
    const narrow = { ...state, width: "360" as const }
    expect(writePreviewState(new URLSearchParams(), narrow, "full").get("width")).toBe(
      "360"
    )
    expect(writePreviewState(new URLSearchParams(), narrow, "360").has("width")).toBe(
      false
    )
  })

  it("preserves unrelated query keys and overwrites changed ones", () => {
    const query = new URLSearchParams("utm=x&lang=ar&mode=code")
    const result = writePreviewState(query, { ...state, lang: "ar" }, "full")
    expect(result.get("utm")).toBe("x")
    expect(result.get("lang")).toBe("ar")
    expect(result.has("mode")).toBe(false)
  })
})

describe("previewFrameSrc", () => {
  it("carries lang, derived dir, theme and motion", () => {
    expect(
      previewFrameSrc("sample-01", { lang: "ar", theme: "dark", motion: "reduced" })
    ).toBe("/preview/sample-01?lang=ar&dir=rtl&theme=dark&motion=reduced")
    expect(previewFrameSrc("sample-01", { lang: "en", theme: "light", motion: "on" })).toBe(
      "/preview/sample-01?lang=en&dir=ltr&theme=light&motion=on"
    )
  })
})
