import { siteUrl } from "@/lib/site"

export type RegistryFetchClient = "cli" | "browser" | "other"

export const registryFetchEvent = "registry_fetch"

const defaultGateway = "https://gateway.umami.is/api/send"
const timeoutMs = 1500

// Umami drops requests whose User-Agent looks like a bot or is missing, and
// the CLI sends a bare `shadcn`, so the event is sent with a browser-shaped
// agent (the one Umami's server-side guide uses). The real caller is kept in
// `data.client`.
const senderUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export function classifyClient(userAgent: string | null): RegistryFetchClient {
  if (!userAgent) return "other"
  if (/^(shadcn|node|undici)\b/i.test(userAgent)) return "cli"
  if (/^Mozilla\//.test(userAgent)) return "browser"
  return "other"
}

export type RegistryFetchEnv = {
  websiteId?: string
  gateway?: string
  fetch?: typeof fetch
}

export function registryFetchPayload(
  item: string,
  client: RegistryFetchClient,
  websiteId: string
) {
  return {
    type: "event",
    payload: {
      website: websiteId,
      hostname: new URL(siteUrl).hostname,
      url: `/r/${item}.json`,
      name: registryFetchEvent,
      data: { item, client },
    },
  }
}

// Never throws and never blocks delivery: the route handler schedules this
// after the response is sent, and a dead gateway only costs the timeout.
export async function recordRegistryFetch(
  item: string,
  request: { headers: { get(name: string): string | null } },
  env: RegistryFetchEnv = {}
): Promise<void> {
  const websiteId = env.websiteId ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!websiteId) return
  const gateway = env.gateway ?? process.env.UMAMI_GATEWAY_URL ?? defaultGateway
  const doFetch = env.fetch ?? fetch
  const client = classifyClient(request.headers.get("user-agent"))

  try {
    await doFetch(gateway, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": senderUserAgent,
      },
      body: JSON.stringify(registryFetchPayload(item, client, websiteId)),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    // Analytics must never surface as a registry error.
  }
}
