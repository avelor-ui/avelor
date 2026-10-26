// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { registryCatalog, registryItems } from "@/lib/registry/items.generated"

const afterTasks: Array<() => unknown> = []
const after = vi.fn((task: () => unknown) => {
  afterTasks.push(task)
})
vi.mock("next/server", () => ({
  after: (task: () => unknown) => after(task),
}))

const recordRegistryFetch = vi.fn<() => Promise<void>>()
vi.mock("@/lib/analytics/registry-fetch", () => ({
  recordRegistryFetch: (...args: unknown[]) =>
    recordRegistryFetch(...(args as [])),
}))

const { GET } = await import("@/app/r/[file]/route")

function get(file: string, userAgent = "shadcn") {
  return GET(
    new Request(`http://localhost:3000/r/${file}`, {
      headers: { "user-agent": userAgent },
    }),
    { params: Promise.resolve({ file }) }
  )
}

beforeEach(() => {
  afterTasks.length = 0
  after.mockClear()
  recordRegistryFetch.mockReset()
  recordRegistryFetch.mockResolvedValue(undefined)
})

describe("GET /r/[file]", () => {
  // `after` is mocked here, so this proves only that the task is scheduled
  // through it; that it runs after the response was sent is plan 001 V9
  // (real run on `next start` and on Vercel).
  it("serves a known item as uncached JSON and schedules the analytics task through after()", async () => {
    const response = await get("sample-01.json")

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toMatch(/^application\/json/)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(await response.json()).toEqual(registryItems["sample-01"])

    expect(recordRegistryFetch).not.toHaveBeenCalled()
    expect(afterTasks).toHaveLength(1)
    await afterTasks[0]()
    expect(recordRegistryFetch).toHaveBeenCalledWith(
      "sample-01",
      expect.objectContaining({ headers: expect.anything() })
    )
  })

  it("serves the catalog without counting it", async () => {
    const response = await get("registry.json")

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(registryCatalog)
    expect(afterTasks).toHaveLength(0)
  })

  it("returns 404 for unknown items and non-json paths", async () => {
    expect((await get("nope.json")).status).toBe(404)
    expect((await get("sample-01")).status).toBe(404)
    expect((await get("sample-01.json.map")).status).toBe(404)
    expect(afterTasks).toHaveLength(0)
  })

  it("resolves the response even when analytics rejects", async () => {
    recordRegistryFetch.mockRejectedValue(new Error("gateway down"))

    const response = await get("sample-01.json")
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(registryItems["sample-01"])

    await expect(afterTasks[0]()).rejects.toThrow("gateway down")
  })

  it("still serves the item when after() itself throws", async () => {
    after.mockImplementationOnce(() => {
      throw new Error("`after` was called outside a request scope")
    })

    const response = await get("sample-01.json")
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(registryItems["sample-01"])
    expect(afterTasks).toHaveLength(0)
  })
})
