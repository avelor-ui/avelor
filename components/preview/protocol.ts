export const PREVIEW_MESSAGE_SOURCE = "avelor-preview"

// `scroll` and `interaction` arrive with Compare mode (Phase 2).
export type PreviewMessage =
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "ready" }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "resize"; height: number }

const MAX_HEIGHT = 20000

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false
  const message = data as { source?: unknown; type?: unknown; height?: unknown }
  if (message.source !== PREVIEW_MESSAGE_SOURCE) return false
  if (message.type === "ready") return true
  if (message.type !== "resize") return false
  return (
    typeof message.height === "number" &&
    Number.isFinite(message.height) &&
    message.height >= 0 &&
    message.height <= MAX_HEIGHT
  )
}
