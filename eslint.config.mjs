import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import {
  needsRtlCounterpart,
  noDeprecatedStartEnd,
  noPhysicalDirection,
} from "./eslint-rules/no-physical-direction.js";
import { registryImports } from "./eslint-rules/registry-imports.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["registry/**/*.{ts,tsx}"],
    plugins: {
      avelor: {
        rules: {
          "no-physical-direction": noPhysicalDirection,
          "no-deprecated-start-end": noDeprecatedStartEnd,
          "needs-rtl-counterpart": needsRtlCounterpart,
          "registry-imports": registryImports,
        },
      },
    },
    rules: {
      "avelor/no-physical-direction": "error",
      "avelor/no-deprecated-start-end": "warn",
      "avelor/needs-rtl-counterpart": "warn",
      "avelor/registry-imports": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
