import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useId } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { content } from "./content"
import { HeroOneReveal } from "./hero-01-motion"

export default function HeroOne({
  locale = "en",
  className,
}: {
  locale?: "en" | "ar"
  className?: string
}) {
  const t = content[locale]
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-16 md:py-24 lg:py-32", className)}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <HeroOneReveal step={0}>
            <p className="inline-flex rounded-full border px-3 py-1 text-sm leading-normal font-medium text-muted-foreground">
              {t.eyebrow}
            </p>
          </HeroOneReveal>
          <HeroOneReveal step={1}>
            <h1
              id={headingId}
              className="mt-6 max-w-[20ch] text-4xl leading-snug font-bold text-balance md:text-5xl lg:text-6xl"
            >
              {t.title}
            </h1>
          </HeroOneReveal>
          <HeroOneReveal step={2}>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t.description}
            </p>
          </HeroOneReveal>
          <HeroOneReveal
            step={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
          >
            <Link
              href={t.primaryCta.href}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-11 px-6"
              )}
            >
              {t.primaryCta.label}
              <ArrowRight
                aria-hidden="true"
                data-rtl="flip"
                className="rtl:-scale-x-100"
              />
            </Link>
            <Link
              href={t.secondaryCta.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10"
              )}
            >
              {t.secondaryCta.label}
            </Link>
          </HeroOneReveal>
        </div>
        <HeroOneReveal step={1}>
          {/* Placeholder frame: replace it with your product image. */}
          <div
            aria-hidden="true"
            data-rtl="flip"
            className="rounded-3xl border bg-muted/50 p-3"
          >
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted" />
                <div className="h-2.5 w-24 rounded-full bg-muted" />
                <div className="ms-auto h-8 w-20 rounded-lg bg-primary/15" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="h-16 rounded-xl bg-muted" />
                <div className="h-16 rounded-xl bg-muted" />
                <div className="h-16 rounded-xl bg-muted" />
              </div>
              <div className="mt-6 h-32 rounded-xl bg-muted" />
              <div className="mt-4 h-2 w-3/4 rounded-full bg-muted" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-muted" />
            </div>
          </div>
        </HeroOneReveal>
      </div>
      {/* The server renders the hidden state; without JavaScript nothing would ever reveal it. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  )
}
