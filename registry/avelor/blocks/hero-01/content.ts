/* PLACEHOLDER */

export type HeroOneContent = {
  eyebrow: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}

export const content = {
  en: {
    eyebrow: "New: automatic payment reminders",
    title: "Send invoices in minutes and get paid on time",
    description:
      "Create clear invoices, track every payment and remind clients automatically, all from one simple dashboard built for small teams.",
    primaryCta: { label: "Start free", href: "#get-started" },
    secondaryCta: { label: "Book a demo", href: "#demo" },
  },
  ar: {
    eyebrow: "جديد: تذكير تلقائي بالمدفوعات",
    title: "أصدِر فواتيرك في دقائق واستلم مستحقاتك في موعدها",
    description:
      "أنشئ فواتير واضحة، وتابع كل دفعة، وذكّر عملاءك تلقائيًا، من لوحة تحكم واحدة بسيطة صُمّمت للفرق الصغيرة.",
    primaryCta: { label: "ابدأ مجانًا", href: "#get-started" },
    secondaryCta: { label: "احجز عرضًا تجريبيًا", href: "#demo" },
  },
} satisfies Record<"en" | "ar", HeroOneContent>
