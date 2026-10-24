// Everything under registry/ is copied into the user's project by the shadcn
// CLI, so it may only import what every consumer project has (CLAUDE.md rules
// 5 and 6). `@/lib/utils` is shadcn's own `cn` helper and is the one exception
// to "lib/ is site-only".

const EXACT = new Set([
  "react",
  "react-dom",
  "next/link",
  "next/image",
  "lucide-react",
  "motion/react",
  "@/lib/utils",
])

// The CLI only rewrites `@/registry/<segment>/lib/*` to the consumer's lib
// alias; `@/registry/lib/*` has no segment and lands on `@/components/*`
// (shadcn 4.22.1, verified in plan 001 step 6).
const PREFIXES = ["@/components/ui/", "@/registry/avelor/lib/", "./"]

/** @param {string} source */
export function isAllowed(source) {
  return EXACT.has(source) || PREFIXES.some((p) => source.startsWith(p))
}

/** @type {import("eslint").Rule.RuleModule} */
export const registryImports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "restrict imports inside registry/ to the runtime allowlist and same-folder files",
    },
    schema: [],
    messages: {
      forbidden:
        "'{{source}}' cannot be imported inside registry/. Allowed: react, react-dom, next/link, next/image, lucide-react, motion/react, @/components/ui/*, @/lib/utils, @/registry/avelor/lib/* and ./ files in the same folder (CLAUDE.md rules 5 and 6).",
    },
  },
  create(context) {
    /** @param {import("estree").Node & { source?: import("estree").Expression | null }} node */
    function check(node) {
      const source = node.source
      if (
        !source ||
        source.type !== "Literal" ||
        typeof source.value !== "string"
      )
        return
      if (!isAllowed(source.value)) {
        context.report({
          node: source,
          messageId: "forbidden",
          data: { source: source.value },
        })
      }
    }
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    }
  },
}
