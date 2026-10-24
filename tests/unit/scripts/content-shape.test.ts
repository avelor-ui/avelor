import { describe, expect, it } from "vitest"

import { shapeDiff } from "../../../scripts/content-shape.ts"

describe("shapeDiff", () => {
  it("accepts identical shapes with different values", () => {
    const en = { title: "Hello", stat: { value: 1, label: "x" }, tags: ["a"] }
    const ar = { title: "مرحبا", stat: { value: 2, label: "ص" }, tags: ["ب"] }
    expect(shapeDiff(en, ar)).toEqual([])
  })

  it("reports keys missing on either side", () => {
    expect(shapeDiff({ a: 1, b: 2 }, { a: 1 })).toEqual(["b: missing in second"])
    expect(shapeDiff({ a: 1 }, { a: 1, c: 3 })).toEqual(["c: missing in first"])
  })

  it("reports type mismatches with a nested path", () => {
    expect(shapeDiff({ stat: { value: 1 } }, { stat: { value: "1" } })).toEqual([
      "stat.value: number vs string",
    ])
    expect(shapeDiff({ a: null }, { a: {} })).toEqual(["a: null vs object"])
  })

  it("compares arrays by length and element shape", () => {
    expect(shapeDiff({ items: [1, 2] }, { items: [1] })).toEqual([
      "items: array length 2 vs 1",
    ])
    expect(
      shapeDiff({ items: [{ t: "a" }] }, { items: [{ t: "b", extra: true }] })
    ).toEqual(["items[0].extra: missing in first"])
  })

  it("collects every difference, sorted by key", () => {
    expect(shapeDiff({ z: 1, a: "x" }, { z: "1", a: 2 })).toEqual([
      "a: string vs number",
      "z: number vs string",
    ])
  })
})
