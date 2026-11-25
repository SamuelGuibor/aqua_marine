import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Saídas da conferência de larguras (docs/larguras.md).
    "fotos/**",
    "test-results/**",
    "playwright-report/**",
    // Worktrees dos cards (docs/harness): cada uma roda o próprio lint.
    ".worktrees/**",
  ]),
]);

export default eslintConfig;
