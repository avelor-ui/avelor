import { NextResponse, type NextRequest } from "next/server"

import { parsePreviewParams, previewHeaders } from "@/lib/preview-params"

// Layouts cannot read search params, so the preview root layout gets the
// document state (lang, dir, theme, motion) as request headers instead.
export function proxy(request: NextRequest) {
  const params = parsePreviewParams(request.nextUrl.searchParams)
  const headers = new Headers(request.headers)
  for (const key of Object.keys(params) as (keyof typeof params)[]) {
    headers.set(previewHeaders[key], params[key])
  }
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: "/preview/:path*",
}
