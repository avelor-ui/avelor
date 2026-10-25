import {
  registryCatalog,
  registryItems,
  type RegistryItemName,
} from "@/lib/registry/items.generated"

export type RegistryFile =
  | { kind: "catalog"; body: unknown }
  | { kind: "item"; name: RegistryItemName; body: unknown }

export function resolveRegistryFile(file: string): RegistryFile | null {
  if (file === "registry.json") return { kind: "catalog", body: registryCatalog }
  if (!file.endsWith(".json")) return null
  const name = file.slice(0, -".json".length)
  if (!Object.hasOwn(registryItems, name)) return null
  return {
    kind: "item",
    name: name as RegistryItemName,
    body: registryItems[name as RegistryItemName],
  }
}

// `no-store` keeps every CLI request on the function so the fetch count stays
// honest; the traffic is small enough that CDN hits are not worth the miss.
export function registryResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

// probe: smoke path filter (throwaway branch)
