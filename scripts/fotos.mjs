// npm run fotos -- <tela>: uma foto por janela × estado, em fotos/<tela>/ (fora do Git).
// O que vier depois do nome vai para o Playwright (ex.: --project=tablet-h).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

import { tsImport } from "tsx/esm/api";

const { NOMES_DE_TELA, ehNomeDeTela } = await tsImport(
  "../lib/telas/registro.ts",
  import.meta.url,
);

const [tela, ...resto] = process.argv.slice(2);

if (!tela || !ehNomeDeTela(tela)) {
  console.error(
    tela ? `A tela "${tela}" não está registrada.` : "Diga de qual tela.",
  );
  console.error("Uso: npm run fotos -- <tela>");
  console.error(`Telas registradas: ${NOMES_DE_TELA.join(", ")}`);
  process.exit(1);
}

// Chama o CLI pelo Node: assim funciona igual no Windows, sem passar por um shell.
const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const { status } = spawnSync(
  process.execPath,
  [cli, "test", "--grep", "@foto", ...resto],
  { stdio: "inherit", env: { ...process.env, TELA: tela } },
);

if (status === 0) console.log(`\nFotos em fotos/${tela}/`);
process.exit(status ?? 1);
