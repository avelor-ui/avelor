import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold">Avelor</span>
        <ThemeToggle />
      </div>
      <h1 className="max-w-[20ch] text-4xl font-bold text-balance md:text-5xl">
        Landing-page blocks for shadcn/ui, designed in English and Arabic.
      </h1>
      <p
        lang="ar"
        dir="rtl"
        className="max-w-prose text-lg leading-relaxed text-muted-foreground"
      >
        أقسام صفحات هبوط مصممة للعربية والإنجليزية من اليوم الأول.
      </p>
      <div>
        <Button
          render={<Link href="/docs" />}
          nativeButton={false}
          size="lg"
        >
          Read the docs
        </Button>
      </div>
    </main>
  )
}
