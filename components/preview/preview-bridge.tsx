"use client"

import { MotionConfig } from "motion/react"
import { useEffect } from "react"

import type { PreviewMotion } from "@/lib/preview-params"

import { PREVIEW_MESSAGE_SOURCE, type PreviewMessage } from "./protocol"

function post(message: PreviewMessage) {
  if (window.parent !== window) {
    window.parent.postMessage(message, window.location.origin)
  }
}

export function PreviewBridge({
  motion,
  children,
}: {
  motion: PreviewMotion
  children: React.ReactNode
}) {
  useEffect(() => {
    const source = PREVIEW_MESSAGE_SOURCE
    post({ source, type: "ready" })
    const observer = new ResizeObserver(() => {
      post({ source, type: "resize", height: document.body.scrollHeight })
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  return (
    <MotionConfig reducedMotion={motion === "reduced" ? "always" : "user"}>
      {children}
    </MotionConfig>
  )
}
