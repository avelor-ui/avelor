import {
  dirForLang,
  type PreviewLang,
  type PreviewMotion,
  type PreviewTheme,
} from "./preview-params"

export type PreviewMode = "playground" | "code"
export type PreviewWidth = "360" | "768" | "1280" | "full"

export const previewModes: readonly PreviewMode[] = ["playground", "code"]
export const previewWidths: readonly PreviewWidth[] = ["360", "768", "1280", "full"]

// `theme` and `width` are null until the client resolves them (docs theme,
// viewport); the frame is never rendered without an explicit theme.
export type PreviewState = {
  mode: PreviewMode
  lang: PreviewLang
  theme: PreviewTheme | null
  width: PreviewWidth | null
  motion: PreviewMotion
}

export const previewStateDefaults = {
  mode: "playground",
  lang: "en",
  motion: "on",
} as const satisfies Pick<PreviewState, "mode" | "lang" | "motion">

function pick<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | null {
  return allowed.includes(value as T) ? (value as T) : null
}

export function parsePreviewState(query: URLSearchParams): PreviewState {
  return {
    mode: pick(query.get("mode"), previewModes) ?? previewStateDefaults.mode,
    lang: pick(query.get("lang"), ["en", "ar"]) ?? previewStateDefaults.lang,
    theme: pick(query.get("theme"), ["light", "dark"]),
    width: pick(query.get("width"), previewWidths),
    motion: pick(query.get("motion"), ["on", "reduced"]) ?? previewStateDefaults.motion,
  }
}

// Keys at their default are dropped so shared links stay short; `theme` is
// always written because it is the only key with no static default.
export function writePreviewState(
  query: URLSearchParams,
  state: PreviewState,
  defaultWidth: PreviewWidth
): URLSearchParams {
  const next = new URLSearchParams(query)
  const entries: [keyof PreviewState, string | null, string | null][] = [
    ["mode", state.mode, previewStateDefaults.mode],
    ["lang", state.lang, previewStateDefaults.lang],
    ["theme", state.theme, null],
    ["width", state.width, defaultWidth],
    ["motion", state.motion, previewStateDefaults.motion],
  ]
  for (const [key, value, fallback] of entries) {
    if (value === null || value === fallback) next.delete(key)
    else next.set(key, value)
  }
  return next
}

export function previewFrameSrc(
  name: string,
  state: Pick<PreviewState, "lang" | "motion"> & { theme: PreviewTheme }
) {
  const query = new URLSearchParams({
    lang: state.lang,
    dir: dirForLang(state.lang),
    theme: state.theme,
    motion: state.motion,
  })
  return `/preview/${name}?${query}`
}
