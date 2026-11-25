import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // Lê o atalho `@/` direto do tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    // Sem excluir .worktrees, o `npm test` da pasta principal rodaria os testes de todos os cards.
    exclude: [...configDefaults.exclude, ".next/**", ".worktrees/**"],
  },
});
