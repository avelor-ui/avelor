import type { Metadata } from "next"

import "../globals.css"
import { RootProvider } from "fumadocs-ui/provider/next"

import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Avelor",
  description:
    "Premium landing-page blocks for shadcn/ui with first-class RTL and LTR support.",
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={cn("font-sans antialiased", fontVariables)}
    >
      <body>
        <ThemeProvider>
          <DirectionProvider direction="ltr">
            <RootProvider theme={{ enabled: false }}>{children}</RootProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
