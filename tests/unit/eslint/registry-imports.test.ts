import { RuleTester } from "eslint"
import tseslint from "typescript-eslint"
import { describe, it } from "vitest"

import { registryImports } from "../../../eslint-rules/registry-imports.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

const forbidden = (source: string) => ({
  messageId: "forbidden",
  data: { source },
})

tester.run("registry-imports", registryImports, {
  valid: [
    `import * as React from "react"`,
    `import type { ReactNode } from "react"`,
    `import { createPortal } from "react-dom"`,
    `import Link from "next/link"`,
    `import Image from "next/image"`,
    `import { ArrowRight } from "lucide-react"`,
    `import { m, LazyMotion, domAnimation } from "motion/react"`,
    `import { Button } from "@/components/ui/button"`,
    `import { cn } from "@/lib/utils"`,
    `import { reveal } from "@/registry/lib/motion"`,
    `import { content } from "./content"`,
    `export { content } from "./content"`,
    `export * from "./content"`,
    `const Motion = () => import("./sample-01-motion")`,
  ],
  invalid: [
    {
      code: `import { source } from "@/lib/source"`,
      errors: [forbidden("@/lib/source")],
    },
    {
      code: `import { ThemeToggle } from "@/components/theme-toggle"`,
      errors: [forbidden("@/components/theme-toggle")],
    },
    {
      code: `import { useTheme } from "next-themes"`,
      errors: [forbidden("next-themes")],
    },
    {
      code: `import { useRouter } from "next/navigation"`,
      errors: [forbidden("next/navigation")],
    },
    { code: `import { cn } from "cn"`, errors: [forbidden("cn")] },
    {
      code: `import { Button } from "../ui/button"`,
      errors: [forbidden("../ui/button")],
    },
    {
      code: `import { Button } from "@/registry/blocks/hero-01/hero-01"`,
      errors: [forbidden("@/registry/blocks/hero-01/hero-01")],
    },
    {
      code: `import { cva } from "class-variance-authority"`,
      errors: [forbidden("class-variance-authority")],
    },
    {
      code: `export { DocsLayout } from "fumadocs-ui/layouts/docs"`,
      errors: [forbidden("fumadocs-ui/layouts/docs")],
    },
    {
      code: `const x = () => import("@/lib/fonts")`,
      errors: [forbidden("@/lib/fonts")],
    },
  ],
})
