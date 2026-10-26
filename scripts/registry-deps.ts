// Cross-checks a registry item's declared dependencies against what its files
// import (CLAUDE.md rule 6). The host packages are never declared: the consumer
// is a Next project and declaring them would make the CLI try to install them.
// Tailwind is used through class names only, so it is neither declared nor
// imported. The shadcn primitives arrive through registryDependencies.

export const DEPENDENCY_ALLOWLIST = ["lucide-react", "motion"] as const

export const HOST_PACKAGES = ["react", "react-dom", "next"] as const

const IMPORT_RE =
  /\b(?:import|export)\b[^'";]*?\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/g

export function scanImports(source: string): string[] {
  const specs: string[] = []
  for (const match of source.matchAll(IMPORT_RE)) {
    specs.push(match[1] ?? match[2])
  }
  return specs
}

export function packageOf(spec: string): string {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

export type DependencyItem = {
  dependencies?: string[]
  registryDependencies?: string[]
  files: Array<{ path: string; source: string }>
}

export function dependencyProblems(item: DependencyItem): string[] {
  const problems: string[] = []
  const declared = new Set(item.dependencies ?? [])
  const primitives = new Set(item.registryDependencies ?? [])
  const allowlist = new Set<string>(DEPENDENCY_ALLOWLIST)
  const host = new Set<string>(HOST_PACKAGES)
  const used = new Set<string>()

  for (const dep of declared) {
    if (!allowlist.has(dep)) {
      problems.push(
        `dependencies lists "${dep}", which is outside the allowlist (${DEPENDENCY_ALLOWLIST.join(", ")})`
      )
    }
  }

  for (const file of item.files) {
    for (const spec of scanImports(file.source)) {
      if (spec.startsWith(".")) continue
      if (spec.startsWith("@/components/ui/")) {
        const primitive = spec.slice("@/components/ui/".length)
        if (!primitives.has(primitive)) {
          problems.push(
            `${file.path} imports "${spec}" but registryDependencies has no "${primitive}"`
          )
        }
        continue
      }
      if (spec.startsWith("@/")) continue
      const pkg = packageOf(spec)
      if (host.has(pkg)) continue
      used.add(pkg)
      if (!declared.has(pkg)) {
        problems.push(
          `${file.path} imports "${spec}" but dependencies has no "${pkg}"`
        )
      }
    }
  }

  for (const dep of declared) {
    if (allowlist.has(dep) && !used.has(dep)) {
      problems.push(`dependencies lists "${dep}" but no file imports it`)
    }
  }

  return problems
}
