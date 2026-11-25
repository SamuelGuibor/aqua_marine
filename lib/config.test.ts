import { expect, test } from "vitest";

import nextConfig from "@/next.config.mjs";

// Teste de exemplo: prova que o executor roda, que o atalho `@/` resolve
// e que ninguém desligou o cacheComponents sem querer.
test("o next.config mantém o cacheComponents ligado", () => {
  expect(nextConfig.cacheComponents).toBe(true);
});
