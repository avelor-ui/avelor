// @vitest-environment node
import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

import {
  parsePreviewParams,
  previewHeaders,
  readPreviewHeaders,
} from "@/lib/preview-params"
import { proxy } from "@/proxy"

describe("parsePreviewParams", () => {
  it("defaults to English, LTR, light, motion on", () => {
    expect(parsePreviewParams(new URLSearchParams())).toEqual({
      lang: "en",
      dir: "ltr",
      theme: "light",
      motion: "on",
    })
  })

  it("derives rtl from Arabic and lets dir override it", () => {
    expect(parsePreviewParams(new URLSearchParams("lang=ar")).dir).toBe("rtl")
    expect(
      parsePreviewParams(new URLSearchParams("lang=en&dir=rtl"))
    ).toMatchObject({ lang: "en", dir: "rtl" })
    expect(
      parsePreviewParams(new URLSearchParams("lang=ar&dir=ltr"))
    ).toMatchObject({ lang: "ar", dir: "ltr" })
  })

  it("ignores unknown values", () => {
    expect(
      parsePreviewParams(
        new URLSearchParams("lang=fr&dir=up&theme=sepia&motion=fast")
      )
    ).toEqual({ lang: "en", dir: "ltr", theme: "light", motion: "on" })
  })

  it("accepts dark and reduced", () => {
    expect(
      parsePreviewParams(new URLSearchParams("theme=dark&motion=reduced"))
    ).toMatchObject({ theme: "dark", motion: "reduced" })
  })
})

describe("readPreviewHeaders", () => {
  it("falls back to the defaults when the proxy did not run", () => {
    expect(readPreviewHeaders(new Headers())).toEqual({
      lang: "en",
      dir: "ltr",
      theme: "light",
      motion: "on",
    })
  })

  it("round-trips through the proxy", () => {
    const response = proxy(
      new NextRequest(
        "http://localhost/preview/sample-01?lang=ar&theme=dark&motion=reduced"
      )
    )
    const forwarded = new Headers()
    for (const name of Object.values(previewHeaders)) {
      const value = response.headers.get(`x-middleware-request-${name}`)
      if (value !== null) forwarded.set(name, value)
    }
    expect(readPreviewHeaders(forwarded)).toEqual({
      lang: "ar",
      dir: "rtl",
      theme: "dark",
      motion: "reduced",
    })
  })
})
