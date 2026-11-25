// Conferência de larguras (docs/larguras.md): um projeto por janela de lib/telas/janelas.ts.
// Roda contra o build de produção, com a galeria ligada, sem banco.
import { defineConfig } from "@playwright/test";

// Caminho relativo: mesmo padrão do tailwind.config.ts.
import { JANELAS } from "./lib/telas/janelas";

const porta = Number(process.env.LARGURAS_PORTA || 4100);
const endereco = `http://localhost:${porta}`;

export default defineConfig({
  testDir: "tests/larguras",
  // Não é *.spec.ts nem *.test.ts: assim o Vitest não pega estes arquivos.
  testMatch: "**/*.larguras.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: endereco,
    browserName: "chromium",
    locale: "pt-BR",
    reducedMotion: "reduce",
  },
  projects: JANELAS.map((janela) => ({
    name: janela.nome,
    use: {
      viewport: { width: janela.largura, height: janela.altura },
      hasTouch: janela.toque,
      isMobile: janela.movel,
    },
  })),
  // `next dev` desenha um indicador na tela e é lento na primeira visita: sempre o build.
  webServer: {
    command: `npm run build && npm run start -- -p ${porta}`,
    url: endereco,
    env: { GALERIA_TELAS: "ligada" },
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
