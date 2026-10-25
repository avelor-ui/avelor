// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

import {
  classifyClient,
  recordRegistryFetch,
  registryFetchPayload,
} from "@/lib/analytics/registry-fetch"

const request = (userAgent: string | null) => ({
  headers: { get: (name: string) => (name === "user-agent" ? userAgent : null) },
})

describe("classifyClient", () => {
  it("treats the shadcn CLI and Node fetch agents as cli", () => {
    expect(classifyClient("shadcn")).toBe("cli")
    expect(classifyClient("node")).toBe("cli")
    expect(classifyClient("undici")).toBe("cli")
  })

  it("treats Mozilla agents as browser and the rest as other", () => {
    expect(classifyClient("Mozilla/5.0 (X11; Linux x86_64)")).toBe("browser")
    expect(classifyClient("curl/8.7.1")).toBe("other")
    expect(classifyClient(null)).toBe("other")
  })
})

describe("recordRegistryFetch", () => {
  it("is a no-op without a website id", async () => {
    const fetch = vi.fn()
    await recordRegistryFetch("sample-01", request("shadcn"), { fetch })
    expect(fetch).not.toHaveBeenCalled()
  })

  it("posts one Umami event with the item and the client", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    await recordRegistryFetch("sample-01", request("shadcn"), {
      fetch,
      websiteId: "site-id",
      gateway: "https://gateway.example/api/send",
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://gateway.example/api/send")
    expect(init.method).toBe("POST")
    expect(new Headers(init.headers).get("user-agent")).toMatch(/^Mozilla\//)
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(init.body as string)).toEqual(
      registryFetchPayload("sample-01", "cli", "site-id")
    )
  })

  it("shapes the payload for Umami's send endpoint", () => {
    expect(registryFetchPayload("sample-01", "browser", "site-id")).toEqual({
      type: "event",
      payload: {
        website: "site-id",
        hostname: "localhost",
        url: "/r/sample-01.json",
        name: "registry_fetch",
        data: { item: "sample-01", client: "browser" },
      },
    })
  })

  describe.each([
    ["a 4xx response", vi.fn().mockResolvedValue(new Response(null, { status: 403 }))],
    ["a 500 response", vi.fn().mockResolvedValue(new Response(null, { status: 500 }))],
    ["a network error", vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))],
  ])("after %s", (_label, fetch) => {
    it("resolves without throwing and does not retry", async () => {
      await expect(
        recordRegistryFetch("sample-01", request("shadcn"), {
          fetch,
          websiteId: "site-id",
        })
      ).resolves.toBeUndefined()
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  it("gives up after the timeout", async () => {
    vi.useFakeTimers()
    try {
      const hanging = vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(init.signal?.reason)
            )
          })
      )
      const pending = recordRegistryFetch("sample-01", request("shadcn"), {
        fetch: hanging as unknown as typeof fetch,
        websiteId: "site-id",
      })
      await vi.advanceTimersByTimeAsync(1500)
      await expect(pending).resolves.toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })
})
