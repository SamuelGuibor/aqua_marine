// Toda tela registrada × estado × janela (o projeto do Playwright é a janela).
// O que é cobrado em cada uma está em docs/larguras.md.
import { test } from "@playwright/test";

import { NOMES_DE_TELA, TELAS, type Tela } from "../../lib/telas/registro";
import {
  abrirTela,
  cobrar,
  janelaDoTeste,
  medir,
  TEXTO_MINIMO,
} from "./medidas";

// `npm run fotos -- <tela>` define TELA (e já confere se o nome existe).
const nomes = NOMES_DE_TELA.filter(
  (nome) => !process.env.TELA || nome === process.env.TELA,
);

for (const nome of nomes) {
  const tela: Tela = TELAS[nome];

  for (const estado of tela.estados) {
    const titulo = `${nome} · ${estado}`;
    const naoRola = tela.naoRolaPorEstado?.[estado] ?? tela.naoRola;

    test(`${titulo} · sem rolagem horizontal`, async ({ page }, info) => {
      const janela = janelaDoTeste(info);
      await abrirTela(page, nome, estado);
      const { larguraDemais } = await medir(
        page,
        janela,
        tela.excecoesDeToque,
      );
      cobrar(info, janela, titulo, "Rolagem horizontal", larguraDemais);
    });

    test(`${titulo} · sem rolagem vertical`, async ({ page }, info) => {
      const janela = janelaDoTeste(info);
      test.skip(
        janela.soAvisa || !naoRola.includes(janela.nome),
        "a matriz deixa a tela rolar nesta janela",
      );
      await abrirTela(page, nome, estado);
      const { alturaDoDocumento } = await medir(
        page,
        janela,
        tela.excecoesDeToque,
      );
      cobrar(
        info,
        janela,
        titulo,
        "Rolagem vertical",
        alturaDoDocumento > janela.altura
          ? [
              `a página tem ${alturaDoDocumento}px de altura numa janela de ${janela.altura}px`,
            ]
          : [],
      );
    });

    test(`${titulo} · alvo de toque`, async ({ page }, info) => {
      const janela = janelaDoTeste(info);
      test.skip(
        janela.alvoMinimo === null,
        "o alvo de toque não é conferido nesta janela",
      );
      await abrirTela(page, nome, estado);
      const { alvosPequenos } = await medir(
        page,
        janela,
        tela.excecoesDeToque,
      );
      cobrar(info, janela, titulo, "Alvo de toque pequeno", alvosPequenos);
    });

    test(`${titulo} · texto de pelo menos ${TEXTO_MINIMO} px`, async ({
      page,
    }, info) => {
      const janela = janelaDoTeste(info);
      test.skip(janela.soAvisa, "o texto não é conferido nesta janela");
      await abrirTela(page, nome, estado);
      const { textosPequenos } = await medir(
        page,
        janela,
        tela.excecoesDeToque,
      );
      cobrar(
        info,
        janela,
        titulo,
        `Texto abaixo de ${TEXTO_MINIMO} px`,
        textosPequenos,
      );
    });

    test(`${titulo} · foto`, { tag: "@foto" }, async ({ page }, info) => {
      const janela = janelaDoTeste(info);
      await abrirTela(page, nome, estado);
      // Imagem preguiçosa abaixo da dobra sairia em branco na foto da página inteira.
      await page.evaluate(() =>
        Promise.all(
          Array.from(document.images, (imagem) => {
            imagem.loading = "eager";
            return imagem.decode().catch(() => {});
          }),
        ),
      );
      const sufixo = estado === tela.estados[0] ? "" : `--${estado}`;
      await page.screenshot({
        path: `fotos/${nome}/${nome}--${janela.nome}${sufixo}.png`,
        fullPage: true,
      });
    });
  }
}
