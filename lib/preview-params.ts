export type PreviewLang = "en" | "ar"
export type PreviewDir = "ltr" | "rtl"
export type PreviewTheme = "light" | "dark"
export type PreviewMotion = "on" | "reduced"

export type PreviewParams = {
  lang: PreviewLang
  dir: PreviewDir
  theme: PreviewTheme
  motion: PreviewMotion
}

export const previewHeaders: Record<keyof PreviewParams, string> = {
  lang: "x-preview-lang",
  dir: "x-preview-dir",
  theme: "x-preview-theme",
  motion: "x-preview-motion",
}

function pick<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export function dirForLang(lang: PreviewLang): PreviewDir {
  return lang === "ar" ? "rtl" : "ltr"
}

function resolve(get: (key: keyof PreviewParams) => string | null): PreviewParams {
  const lang = pick(get("lang"), ["en", "ar"], "en")
  return {
    lang,
    dir: pick(get("dir"), ["ltr", "rtl"], dirForLang(lang)),
    theme: pick(get("theme"), ["light", "dark"], "light"),
    motion: pick(get("motion"), ["on", "reduced"], "on"),
  }
}

export function parsePreviewParams(query: URLSearchParams): PreviewParams {
  return resolve((key) => query.get(key))
}

// Direct opens of /preview/* that bypassed the proxy carry no headers and fall
// back to the same defaults as an empty query.
export function readPreviewHeaders(headers: {
  get(name: string): string | null
}): PreviewParams {
  return resolve((key) => headers.get(previewHeaders[key]))
}
