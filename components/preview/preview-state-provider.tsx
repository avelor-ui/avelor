"use client"

import { useTheme } from "next-themes"
import { usePathname, useSearchParams } from "next/navigation"
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react"

import {
  parsePreviewState,
  writePreviewState,
  type PreviewState,
  type PreviewWidth,
} from "@/lib/preview-state"

type PreviewStateContextValue = {
  state: PreviewState
  update: (patch: Partial<PreviewState>) => void
}

const PreviewStateContext = createContext<PreviewStateContextValue | null>(null)

const phoneQuery = "(max-width: 639px)"

function subscribeToViewport(onChange: () => void) {
  const media = window.matchMedia(phoneQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

// Phones default to the 360 frame; null on the server, where the viewport is
// unknown, so the frame waits for the client.
function useDefaultWidth(): PreviewWidth | null {
  return useSyncExternalStore(
    subscribeToViewport,
    () => (window.matchMedia(phoneQuery).matches ? "360" : "full"),
    () => null
  )
}

export function usePreviewState() {
  const value = use(PreviewStateContext)
  if (!value) {
    throw new Error("usePreviewState must be used inside PreviewStateProvider")
  }
  return value
}

export function PreviewStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const defaultWidth = useDefaultWidth()

  const parsed = useMemo(
    () => parsePreviewState(new URLSearchParams(searchParams)),
    [searchParams]
  )

  const replace = useCallback(
    (state: PreviewState, width: PreviewWidth) => {
      const query = writePreviewState(
        new URLSearchParams(searchParams),
        state,
        width
      )
      const search = query.toString()
      window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname)
    },
    [pathname, searchParams]
  )

  // The docs theme is the fallback: write it into the URL once so the frame
  // src always carries an explicit theme and the preview never guesses.
  useEffect(() => {
    if (parsed.theme !== null || !defaultWidth) return
    const theme = resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : null
    if (theme) replace({ ...parsed, theme }, defaultWidth)
  }, [parsed, resolvedTheme, defaultWidth, replace])

  const state = useMemo<PreviewState>(
    () => ({ ...parsed, width: parsed.width ?? defaultWidth }),
    [parsed, defaultWidth]
  )

  const update = useCallback(
    (patch: Partial<PreviewState>) => {
      if (!defaultWidth) return
      replace({ ...state, ...patch }, defaultWidth)
    },
    [state, defaultWidth, replace]
  )

  const value = useMemo(() => ({ state, update }), [state, update])

  return <PreviewStateContext value={value}>{children}</PreviewStateContext>
}
