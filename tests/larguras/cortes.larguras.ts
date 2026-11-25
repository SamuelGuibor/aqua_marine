// Confere a própria ferramenta, os cortes do tailwind.config.ts e o h-toque,
// usando os elementos marcados com data-corte na vista de exemplo.
import { expect, test } from "@playwright/test";

import type { NomeDeJanela } from "../../lib/telas/janelas";
import { abrirTela, janelaDoTeste } from "./medidas";

const ALTURA_DO_H_TOQUE: Record<NomeDeJanela, number> = {
  pc: 40,
  "tablet-h": 44,
  "tablet-v": 44,
  "rh-tablet": 44,
  celular: 48,
  "ipad-h": 44,
};

// Largura logo abaixo e logo no corte, com o display esperado em cada uma.
const CORTES = [
  {
    classe: "tablet:hidden",
    marca: "tablet-hidden",
    medidas: [
      [767, "block"],
      [768, "none"],
    ],
  },
  {
    classe: "posto:flex",
    marca: "posto-flex",
    medidas: [
      [1279, "none"],
      [1280, "flex"],
    ],
  },
] as const;

test("a janela responde ao toque como declarada", async ({ page }, info) => {
  const janela = janelaDoTeste(info);
  await abrirTela(page, "exemplo", "padrao");
  const toque = await page.evaluate(
    () => matchMedia("(pointer: coarse)").matches,
  );
  expect(toque, "pointer: coarse").toBe(janela.toque);
});

test("h-toque tem a altura da janela", async ({ page }, info) => {
  const janela = janelaDoTeste(info);
  test.skip(janela.soAvisa, "janela que só avisa");
  await abrirTela(page, "exemplo", "padrao");
  const alvo = page.locator('[data-corte="h-toque"]');
  const esperada = ALTURA_DO_H_TOQUE[janela.nome];
  await expect(alvo).toHaveCSS("min-height", `${esperada}px`);
  expect((await alvo.boundingBox())?.height).toBe(esperada);
});

for (const { classe, marca, medidas } of CORTES) {
  test(`${classe} muda no corte`, async ({ page }, info) => {
    test.skip(
      info.project.name !== "pc",
      "uma janela basta: o teste troca a largura",
    );
    await abrirTela(page, "exemplo", "padrao");
    const alvo = page.locator(`[data-corte="${marca}"]`);
    for (const [largura, display] of medidas) {
      await page.setViewportSize({ width: largura, height: 900 });
      await expect(alvo, `${largura}px`).toHaveCSS("display", display);
    }
  });
}
