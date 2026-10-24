// Tailwind utilities inside registry/ must be direction-agnostic (CLAUDE.md
// rule 3). Physical classes are errors, the deprecated start-/end- insets and
// unmirrored x-axis utilities are warnings. The three rules share one scanner:
// every string literal, template quasi and JSX attribute string is split on
// whitespace and each token reduced to its utility root.

const PHYSICAL = [
  [/^ml-/, "ms-"],
  [/^mr-/, "me-"],
  [/^pl-/, "ps-"],
  [/^pr-/, "pe-"],
  [/^left-/, "inset-s-"],
  [/^right-/, "inset-e-"],
  [/^text-left$/, "text-start"],
  [/^text-right$/, "text-end"],
  [/^rounded-l(-|$)/, "rounded-s-"],
  [/^rounded-r(-|$)/, "rounded-e-"],
  [/^rounded-tl(-|$)/, "rounded-ss-"],
  [/^rounded-tr(-|$)/, "rounded-se-"],
  [/^rounded-bl(-|$)/, "rounded-es-"],
  [/^rounded-br(-|$)/, "rounded-ee-"],
  [/^border-l(-|$)/, "border-s-"],
  [/^border-r(-|$)/, "border-e-"],
  [/^float-left$/, "float-start"],
  [/^float-right$/, "float-end"],
  [/^scroll-ml-/, "scroll-ms-"],
  [/^scroll-mr-/, "scroll-me-"],
  [/^scroll-pl-/, "scroll-ps-"],
  [/^scroll-pr-/, "scroll-pe-"],
]

const DEPRECATED = /^(start|end)-/

const X_AXIS =
  /^(translate-x-|space-x-|divide-x-|bg-linear-to-[lr](-|$)|bg-gradient-to-[lr](-|$))/

/**
 * Splits a class token into its variant list and utility root. Colons inside
 * brackets or parentheses belong to arbitrary values, not variants.
 * @param {string} raw
 */
function parseToken(raw) {
  let token = raw.replace(/^!/, "").replace(/!$/, "")
  let depth = 0
  let lastColon = -1
  for (let i = 0; i < token.length; i++) {
    const ch = token[i]
    if (ch === "[" || ch === "(") depth++
    else if (ch === "]" || ch === ")") depth--
    else if (ch === ":" && depth === 0) lastColon = i
  }
  const variants = lastColon === -1 ? [] : token.slice(0, lastColon).split(":")
  let root = token.slice(lastColon + 1)
  if (root.startsWith("-")) root = root.slice(1)
  return { raw, variants, root }
}

/** @param {string} text */
function tokens(text) {
  return text.split(/\s+/).filter(Boolean).map(parseToken)
}

/**
 * @param {(text: string, node: import("estree").Node) => void} check
 * @returns {import("eslint").Rule.RuleListener}
 */
function stringVisitor(check) {
  return {
    Literal(node) {
      if (typeof node.value === "string") check(node.value, node)
    },
    TemplateElement(node) {
      check(node.value.cooked ?? node.value.raw, node)
    },
  }
}

/** @type {import("eslint").Rule.RuleModule} */
export const noPhysicalDirection = {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow physical direction utilities (ml-, pl-, left-, text-left, rounded-l-, border-l, ...) inside registry/",
    },
    schema: [],
    messages: {
      physical:
        "'{{token}}' is a physical direction utility; use '{{replacement}}' so the block mirrors in RTL (CLAUDE.md rule 3).",
    },
  },
  create(context) {
    return stringVisitor((text, node) => {
      for (const token of tokens(text)) {
        const hit = PHYSICAL.find(([pattern]) => pattern.test(token.root))
        if (hit) {
          context.report({
            node,
            messageId: "physical",
            data: { token: token.raw, replacement: hit[1] },
          })
        }
      }
    })
  },
}

/** @type {import("eslint").Rule.RuleModule} */
export const noDeprecatedStartEnd = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "flag the deprecated start-/end- inset utilities (Tailwind 4.3) in favour of inset-s-/inset-e-",
    },
    schema: [],
    messages: {
      deprecated:
        "'{{token}}' is deprecated in Tailwind 4.3; use inset-s-/inset-e- instead.",
    },
  },
  create(context) {
    return stringVisitor((text, node) => {
      for (const token of tokens(text)) {
        if (DEPRECATED.test(token.root)) {
          context.report({
            node,
            messageId: "deprecated",
            data: { token: token.raw },
          })
        }
      }
    })
  },
}

/** @type {import("eslint").Rule.RuleModule} */
export const needsRtlCounterpart = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "require an rtl: counterpart in the same class string for x-axis utilities that do not mirror on their own",
    },
    schema: [],
    messages: {
      counterpart:
        "'{{token}}' does not mirror in RTL; add an 'rtl:' counterpart in the same class string.",
    },
  },
  create(context) {
    return stringVisitor((text, node) => {
      const list = tokens(text)
      const mirrored = list.some(
        (token) => token.variants.includes("rtl") && X_AXIS.test(token.root)
      )
      if (mirrored) return
      for (const token of list) {
        if (X_AXIS.test(token.root)) {
          context.report({
            node,
            messageId: "counterpart",
            data: { token: token.raw },
          })
        }
      }
    })
  },
}
