import "../globals.css"
import { headers } from "next/headers"

import { DirectionProvider } from "@/components/ui/direction"
import { fontVariables } from "@/lib/fonts"
import { readPreviewHeaders } from "@/lib/preview-params"
import { cn } from "@/lib/utils"

// Motion's reduced-motion config covers JS animations; CSS animations and
// transitions need the same treatment so the frame shows the final state.
const reducedMotionStyle =
  "*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}"

export default async function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { lang, dir, theme, motion } = readPreviewHeaders(await headers())

  return (
    <html
      lang={lang}
      dir={dir}
      data-motion={motion}
      className={cn("font-sans antialiased", fontVariables, {
        dark: theme === "dark",
      })}
    >
      <head>{motion === "reduced" && <style>{reducedMotionStyle}</style>}</head>
      <body>
        <DirectionProvider direction={dir}>{children}</DirectionProvider>
      </body>
    </html>
  )
}
