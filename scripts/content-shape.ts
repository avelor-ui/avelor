// Compares the shape (keys and value types, recursively) of two content
// locales. Values may differ; the structure may not.

type Kind =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | "array"
  | "object"

function kindOf(value: unknown): Kind {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  const t = typeof value
  if (t === "object") return "object"
  if (t === "string" || t === "number" || t === "boolean" || t === "undefined")
    return t
  return "object"
}

export function shapeDiff(a: unknown, b: unknown, prefix = ""): string[] {
  const kindA = kindOf(a)
  const kindB = kindOf(b)
  const here = prefix || "<root>"
  if (kindA !== kindB) return [`${here}: ${kindA} vs ${kindB}`]

  if (kindA === "array") {
    const arrA = a as unknown[]
    const arrB = b as unknown[]
    if (arrA.length !== arrB.length) {
      return [`${here}: array length ${arrA.length} vs ${arrB.length}`]
    }
    return arrA.flatMap((item, i) => shapeDiff(item, arrB[i], `${here}[${i}]`))
  }

  if (kindA === "object") {
    const objA = a as Record<string, unknown>
    const objB = b as Record<string, unknown>
    const keys = new Set([...Object.keys(objA), ...Object.keys(objB)])
    return [...keys].sort().flatMap((key) => {
      const child = prefix ? `${prefix}.${key}` : key
      if (!(key in objA)) return [`${child}: missing in first`]
      if (!(key in objB)) return [`${child}: missing in second`]
      return shapeDiff(objA[key], objB[key], child)
    })
  }

  return []
}
