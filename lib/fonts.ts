import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google"

// The generated fallback face is local(Arial) with no unicode-range, so it
// would render Arabic before the stack reaches IBM Plex Sans Arabic.
const fontLatin = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
  adjustFontFallback: false,
})

const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
})

export const fontVariables = `${fontLatin.variable} ${fontArabic.variable}`
