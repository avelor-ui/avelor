import { describe, expect, it } from "vitest"

import {
  dependencyProblems,
  packageOf,
  scanImports,
} from "../../../scripts/registry-deps.ts"

describe("scanImports", () => {
  it("collects static, type, re-export, side-effect and dynamic imports", () => {
    const source = `
      import { useId } from "react"
      import type { Easing } from "motion/react"
      import * as Icons from "lucide-react"
      import "tailwindcss"
      export { content } from "./content"
      export * from "./shared"
      const Motion = () => import("./hero-01-motion")
      const notAnImport = "from 'nowhere'"
    `
    expect(scanImports(source)).toEqual([
      "react",
      "motion/react",
      "lucide-react",
      "tailwindcss",
      "./content",
      "./shared",
      "./hero-01-motion",
    ])
  })
})

describe("packageOf", () => {
  it("maps subpaths and scoped packages to their package", () => {
    expect(packageOf("motion/react")).toBe("motion")
    expect(packageOf("next/link")).toBe("next")
    expect(packageOf("lucide-react")).toBe("lucide-react")
    expect(packageOf("@base-ui/react/button")).toBe("@base-ui/react")
  })
})

const file = (path: string, source: string) => ({ path, source })

describe("dependencyProblems", () => {
  it("accepts host packages without a declaration", () => {
    expect(
      dependencyProblems({
        files: [
          file("a.tsx", `import { useId } from "react"\nimport Link from "next/link"`),
        ],
      })
    ).toEqual([])
  })

  it("accepts motion/react when motion is declared and a primitive when listed", () => {
    expect(
      dependencyProblems({
        dependencies: ["motion", "lucide-react"],
        registryDependencies: ["button"],
        files: [
          file("a.tsx", `import { Button } from "@/components/ui/button"\nimport { Check } from "lucide-react"\nimport { cn } from "@/lib/utils"`),
          file("motion.ts", `import { m } from "motion/react"\nimport { reveal } from "@/registry/avelor/lib/motion"`),
        ],
      })
    ).toEqual([])
  })

  it("rejects declared dependencies outside the allowlist", () => {
    expect(
      dependencyProblems({
        dependencies: ["tailwindcss"],
        files: [],
      })
    ).toEqual([
      'dependencies lists "tailwindcss", which is outside the allowlist (lucide-react, motion)',
    ])
    expect(
      dependencyProblems({ dependencies: ["clsx"], files: [] })
    ).toEqual([
      'dependencies lists "clsx", which is outside the allowlist (lucide-react, motion)',
    ])
  })

  it("rejects an undeclared package import, tailwindcss included", () => {
    expect(
      dependencyProblems({
        dependencies: ["motion"],
        files: [
          file("a.tsx", `import "tailwindcss"\nimport { m } from "motion/react"`),
        ],
      })
    ).toEqual(['a.tsx imports "tailwindcss" but dependencies has no "tailwindcss"'])
    expect(
      dependencyProblems({
        files: [file("a.tsx", `import { Check } from "lucide-react"`)],
      })
    ).toEqual(['a.tsx imports "lucide-react" but dependencies has no "lucide-react"'])
  })

  it("rejects a primitive import missing from registryDependencies", () => {
    expect(
      dependencyProblems({
        registryDependencies: [],
        files: [file("a.tsx", `import { Button } from "@/components/ui/button"`)],
      })
    ).toEqual([
      'a.tsx imports "@/components/ui/button" but registryDependencies has no "button"',
    ])
  })

  it("rejects a declared dependency that no file imports", () => {
    expect(
      dependencyProblems({
        dependencies: ["motion", "lucide-react"],
        files: [file("a.tsx", `import { m } from "motion/react"`)],
      })
    ).toEqual(['dependencies lists "lucide-react" but no file imports it'])
  })
})
