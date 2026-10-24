/* PLACEHOLDER */

export type SampleOneContent = {
  eyebrow: string
  title: string
  description: string
  ctaLabel: string
  stat: { value: number; label: string }
}

export const content = {
  en: {
    eyebrow: "Internal sample",
    title: "Designed in both directions from the first line",
    description:
      "Every Avelor block is written with logical properties, tested in English and Arabic, and installed with one command. This section exists only to prove that pipeline end to end.",
    ctaLabel: "Read the docs",
    stat: { value: 1280, label: "Sample metric" },
  },
  ar: {
    eyebrow: "نموذج داخلي",
    title: "مصمَّم للاتجاهين من أول سطر",
    description:
      "كل قسم في Avelor مكتوب بخصائص CSS المنطقية، ومُختبَر بالعربية والإنجليزية، ويُثبَّت بأمر واحد. هذا القسم موجود فقط لإثبات أن المسار كله يعمل من أوله إلى آخره.",
    ctaLabel: "اقرأ التوثيق",
    stat: { value: 1280, label: "رقم تجريبي" },
  },
} satisfies Record<"en" | "ar", SampleOneContent>
