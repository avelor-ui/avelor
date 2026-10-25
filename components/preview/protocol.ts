export const PREVIEW_MESSAGE_SOURCE = "avelor-preview"

// `scroll` and `interaction` arrive with Compare mode (Phase 2).
export type PreviewMessage =
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "ready" }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "resize"; height: number }

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { source?: unknown }).source === PREVIEW_MESSAGE_SOURCE
  )
}
