import "../globals.css"
import { fontVariables } from "@/lib/fonts"

export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className={`font-sans antialiased ${fontVariables}`}>
      <body>{children}</body>
    </html>
  )
}
