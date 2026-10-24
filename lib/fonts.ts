import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google"

const fontLatin = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
})

const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
})

export const fontVariables = `${fontLatin.variable} ${fontArabic.variable}`
