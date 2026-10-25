"use client"

import { useEffect, useRef, useState } from "react"

import { previewFrameSrc } from "@/lib/preview-state"

import { usePreviewState } from "./preview-state-provider"
import { isPreviewMessage } from "./protocol"

const minHeight = 320

export function PreviewFrame({ name, title }: { name: string; title: string }) {
  const { state } = usePreviewState()
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(minHeight)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.source !== ref.current?.contentWindow) return
      if (!isPreviewMessage(event.data)) return
      if (event.data.type === "resize") {
        setHeight(Math.max(minHeight, event.data.height))
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  if (state.theme === null || state.width === null) {
    return (
      <div
        aria-busy="true"
        className="rounded-lg border bg-card"
        style={{ height: minHeight }}
      />
    )
  }

  const { lang, theme, motion, width } = state
  const direction = lang === "ar" ? "Arabic, right-to-left" : "English, left-to-right"

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <iframe
        ref={ref}
        src={previewFrameSrc(name, { lang, theme, motion })}
        title={`${title} preview, ${direction}, ${theme} theme`}
        loading="lazy"
        width={width === "full" ? "100%" : width}
        height={height}
        className="mx-auto block max-w-none border-0"
      />
    </div>
  )
}
