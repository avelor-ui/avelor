import { after } from "next/server"

import { recordRegistryFetch } from "@/lib/analytics/registry-fetch"
import { registryResponse, resolveRegistryFile } from "@/lib/registry/serve"

export const dynamic = "force-dynamic"

type Context = { params: Promise<{ file: string }> }

export async function GET(request: Request, { params }: Context) {
  const { file } = await params
  const resolved = resolveRegistryFile(file)
  if (!resolved) {
    return new Response("Not found", { status: 404 })
  }
  if (resolved.kind === "item") {
    const { name } = resolved
    after(() => recordRegistryFetch(name, request))
  }
  return registryResponse(resolved.body)
}
