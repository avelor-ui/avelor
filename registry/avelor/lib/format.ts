export type Locale = "en" | "ar"

// Western digits for Arabic by default; engines disagree on the default
// numbering system for a bare "ar" tag.
const tags: Record<Locale, string> = {
  en: "en-US",
  ar: "ar-u-nu-latn",
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(tags[locale], options).format(value)
}

export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(tags[locale], {
    style: "currency",
    currency,
    ...options,
  }).format(value)
}

export function formatDate(
  date: Date | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  return new Intl.DateTimeFormat(tags[locale], options).format(date)
}
