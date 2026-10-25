import { RuleTester } from "eslint"
import tseslint from "typescript-eslint"
import { describe, it } from "vitest"

import {
  needsRtlCounterpart,
  noDeprecatedStartEnd,
  noPhysicalDirection,
} from "../../../eslint-rules/no-physical-direction.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

const physical = (token: string, replacement: string) => ({
  messageId: "physical",
  data: { token, replacement },
})

tester.run("no-physical-direction", noPhysicalDirection, {
  valid: [
    `const a = "ms-4 me-2 ps-6 pe-1"`,
    `const a = "inset-s-0 inset-e-4 text-start text-end"`,
    `const a = "rounded-s-lg rounded-e rounded-ss-md rounded-ee-xl"`,
    `const a = "border-s border-e-2 border-lime-500 rounded-lg"`,
    `const a = "float-start float-end scroll-ms-4 scroll-pe-2"`,
    `const a = "md:ps-6 hover:me-2 rtl:-translate-x-2 translate-x-2"`,
    `const a = "ps-[3px] inset-e-[calc(100%-1rem)] [&>svg]:ms-2"`,
    `const a = cn("flex items-center gap-2", className)`,
    `const a = \`\${base} ps-\${n}\``,
    `const a = "placeholder-muted print:hidden"`,
    `const a = "عنوان رئيسي للقسم — نص عربي حقيقي"`,
    `import { ArrowRight } from "lucide-react"`,
    `<div className="p-4 ms-auto" data-rtl="flip" />`,
    `<div className={cn("ps-4", open && "pe-2")} />`,
  ],
  invalid: [
    { code: `const a = "ml-4"`, errors: [physical("ml-4", "ms-")] },
    { code: `const a = "mr-auto"`, errors: [physical("mr-auto", "me-")] },
    { code: `const a = "pl-4"`, errors: [physical("pl-4", "ps-")] },
    { code: `const a = "pr-[3px]"`, errors: [physical("pr-[3px]", "pe-")] },
    {
      code: `const a = "left-1/2"`,
      errors: [physical("left-1/2", "inset-s-")],
    },
    { code: `const a = "right-0"`, errors: [physical("right-0", "inset-e-")] },
    {
      code: `const a = "text-left"`,
      errors: [physical("text-left", "text-start")],
    },
    {
      code: `const a = "text-right"`,
      errors: [physical("text-right", "text-end")],
    },
    {
      code: `const a = "rounded-l"`,
      errors: [physical("rounded-l", "rounded-s-")],
    },
    {
      code: `const a = "rounded-r-lg"`,
      errors: [physical("rounded-r-lg", "rounded-e-")],
    },
    {
      code: `const a = "rounded-tl-md"`,
      errors: [physical("rounded-tl-md", "rounded-ss-")],
    },
    {
      code: `const a = "rounded-br"`,
      errors: [physical("rounded-br", "rounded-ee-")],
    },
    {
      code: `const a = "border-l"`,
      errors: [physical("border-l", "border-s-")],
    },
    {
      code: `const a = "border-r-2"`,
      errors: [physical("border-r-2", "border-e-")],
    },
    {
      code: `const a = "float-left"`,
      errors: [physical("float-left", "float-start")],
    },
    {
      code: `const a = "scroll-pl-4"`,
      errors: [physical("scroll-pl-4", "scroll-ps-")],
    },
    { code: `const a = "-ml-4"`, errors: [physical("-ml-4", "ms-")] },
    { code: `const a = "md:pl-6"`, errors: [physical("md:pl-6", "ps-")] },
    { code: `const a = "hover:mr-2"`, errors: [physical("hover:mr-2", "me-")] },
    {
      code: `const a = "!ml-2 pr-1!"`,
      errors: [physical("!ml-2", "ms-"), physical("pr-1!", "pe-")],
    },
    {
      code: `const a = "data-[state=open]:pl-4"`,
      errors: [physical("data-[state=open]:pl-4", "ps-")],
    },
    {
      code: `const a = "[&>svg]:ml-2"`,
      errors: [physical("[&>svg]:ml-2", "ms-")],
    },
    {
      code: `const a = cn("flex", "pl-4", className)`,
      errors: [physical("pl-4", "ps-")],
    },
    { code: `const a = \`\${base} ml-4\``, errors: [physical("ml-4", "ms-")] },
    { code: `const a = \`pl-\${n}\``, errors: [physical("pl-", "ps-")] },
    {
      code: `<div className="flex pr-4" />`,
      errors: [physical("pr-4", "pe-")],
    },
    {
      code: `<div className={cn("ps-4", open && "left-0")} />`,
      errors: [physical("left-0", "inset-s-")],
    },
  ],
})

tester.run("no-deprecated-start-end", noDeprecatedStartEnd, {
  valid: [
    `const a = "inset-s-0 inset-e-4"`,
    `const a = "justify-items-start self-start place-content-end items-end"`,
    `const a = "text-start text-end"`,
  ],
  invalid: [
    {
      code: `const a = "start-0"`,
      errors: [{ messageId: "deprecated", data: { token: "start-0" } }],
    },
    {
      code: `const a = "-end-4"`,
      errors: [{ messageId: "deprecated", data: { token: "-end-4" } }],
    },
    {
      code: `const a = "md:start-1/2"`,
      errors: [{ messageId: "deprecated", data: { token: "md:start-1/2" } }],
    },
  ],
})

tester.run("needs-rtl-counterpart", needsRtlCounterpart, {
  valid: [
    `const a = "translate-x-2 rtl:-translate-x-2"`,
    `const a = "-translate-x-1/2 rtl:translate-x-1/2"`,
    `const a = "space-x-4 rtl:space-x-reverse"`,
    `const a = "divide-x rtl:divide-x-reverse"`,
    `const a = "bg-linear-to-r rtl:bg-linear-to-l from-primary"`,
    `const a = "translate-y-2 space-y-4 divide-y bg-linear-to-t"`,
    `const a = "group-hover:translate-x-1 rtl:group-hover:-translate-x-1"`,
    `const a = "translate-x-2 rtl:translate-x-2"`,
    `const a = "divide-x-2 rtl:divide-x-reverse"`,
    `const a = "bg-gradient-to-r rtl:bg-gradient-to-l"`,
    `const a = "translate-x-2 rtl:-translate-x-2 space-x-4 rtl:space-x-reverse"`,
  ],
  invalid: [
    {
      code: `const a = "translate-x-2 rtl:rotate-180"`,
      errors: [{ messageId: "counterpart", data: { token: "translate-x-2" } }],
    },
    {
      code: `const a = "translate-x-2 rtl:space-x-reverse"`,
      errors: [{ messageId: "counterpart", data: { token: "translate-x-2" } }],
    },
    {
      code: `const a = "translate-x-2 rtl:-translate-x-2 space-x-4"`,
      errors: [{ messageId: "counterpart", data: { token: "space-x-4" } }],
    },
    {
      code: `const a = "bg-linear-to-r rtl:bg-gradient-to-l"`,
      errors: [{ messageId: "counterpart", data: { token: "bg-linear-to-r" } }],
    },
    {
      code: `const a = "translate-x-2"`,
      errors: [{ messageId: "counterpart", data: { token: "translate-x-2" } }],
    },
    {
      code: `const a = "-translate-x-1/2"`,
      errors: [
        { messageId: "counterpart", data: { token: "-translate-x-1/2" } },
      ],
    },
    {
      code: `const a = "space-x-4"`,
      errors: [{ messageId: "counterpart", data: { token: "space-x-4" } }],
    },
    {
      code: `const a = "divide-x-2"`,
      errors: [{ messageId: "counterpart", data: { token: "divide-x-2" } }],
    },
    {
      code: `const a = "bg-linear-to-r from-primary"`,
      errors: [{ messageId: "counterpart", data: { token: "bg-linear-to-r" } }],
    },
    {
      code: `const a = "bg-gradient-to-l"`,
      errors: [
        { messageId: "counterpart", data: { token: "bg-gradient-to-l" } },
      ],
    },
    {
      code: `const a = "hover:translate-x-1"`,
      errors: [
        { messageId: "counterpart", data: { token: "hover:translate-x-1" } },
      ],
    },
  ],
})
