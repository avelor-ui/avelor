import { ArrowRight } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatNumber, type Locale } from "@/registry/avelor/lib/format"

import { content } from "./content"
import { SampleOneReveal } from "./sample-01-motion"

export default function SampleOne({
  locale = "en",
  className,
}: {
  locale?: Locale
  className?: string
}) {
  const t = content[locale]
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-16 md:py-24 lg:py-32", className)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SampleOneReveal className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
          <div className="max-w-prose">
            <p className="text-sm font-medium text-muted-foreground">
              {t.eyebrow}
            </p>
            <h2
              id={headingId}
              className="mt-4 max-w-[20ch] text-3xl leading-tight font-semibold text-balance md:text-4xl"
            >
              {t.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t.description}
            </p>
            <div className="mt-8">
              <Button size="lg" className="h-11 px-6">
                {t.ctaLabel}
                <ArrowRight
                  aria-hidden="true"
                  data-rtl="flip"
                  className="rtl:-scale-x-100"
                />
              </Button>
            </div>
          </div>
          <dl className="flex shrink-0 flex-col-reverse gap-2 border-s-2 border-primary ps-6">
            <dt className="text-sm text-muted-foreground">{t.stat.label}</dt>
            <dd className="text-4xl leading-none font-semibold md:text-5xl">
              {formatNumber(t.stat.value, locale)}
            </dd>
          </dl>
        </SampleOneReveal>
      </div>
    </section>
  )
}
