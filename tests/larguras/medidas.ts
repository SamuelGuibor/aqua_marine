// O que os testes de largura fazem em comum: abrir uma tela da galeria, medir e cobrar.
import { expect, type Page, type TestInfo } from "@playwright/test";

import { JANELAS, type Janela } from "../../lib/telas/janelas";
import type { ExcecaoDeToque } from "../../lib/telas/registro";

export const TEXTO_MINIMO = 14;

export function janelaDoTeste(info: TestInfo): Janela {
  const janela = JANELAS.find((item) => item.nome === info.project.name);
  if (!janela) {
    throw new Error(`Projeto sem janela em janelas.ts: ${info.project.name}`);
  }
  return janela;
}

export async function abrirTela(page: Page, tela: string, estado: string) {
  const resposta = await page.goto(`/dev/telas/${tela}?estado=${estado}`);
  expect(resposta?.status(), "status da galeria").toBe(200);
  await page
    .locator(`[data-tela="${tela}"][data-estado="${estado}"]`)
    .waitFor();
  // A altura do texto só é a definitiva com a Barlow carregada.
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Falha o teste listando os achados; nas janelas "só avisa", apenas registra. */
export function cobrar(
  info: TestInfo,
  janela: Janela,
  tela: string,
  problema: string,
  achados: string[],
) {
  if (achados.length === 0) return;

  const mensagem =
    `${problema} na tela "${tela}", janela ${janela.nome} ` +
    `(${janela.largura}×${janela.altura}):\n  - ${achados.join("\n  - ")}\n`;

  if (janela.soAvisa) {
    console.warn(`AVISO · ${mensagem}`);
    info.annotations.push({ type: "aviso", description: mensagem });
    return;
  }

  expect(achados, mensagem).toEqual([]);
}

export type Medidas = {
  larguraDemais: string[];
  alturaDoDocumento: number;
  alvosPequenos: string[];
  textosPequenos: string[];
};

export function medir(
  page: Page,
  janela: Janela,
  excecoes: readonly ExcecaoDeToque[],
): Promise<Medidas> {
  const parametros = {
    largura: janela.largura,
    alvoMinimo: janela.alvoMinimo,
    textoMinimo: TEXTO_MINIMO,
    seletoresIsentos: excecoes.map((excecao) => excecao.seletor),
  };

  // Tudo daqui para dentro roda no navegador: não enxerga nada de fora além de `parametros`.
  return page.evaluate((p) => {
    // O indicador do Next e o que nunca aparece na tela.
    const IGNORADOS = "nextjs-portal, script, style, noscript, template";

    const arredondar = (px: number) => Math.round(px * 10) / 10;

    const descrever = (el: Element) => {
      const id = el.id ? `#${el.id}` : "";
      const classes = (el.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .map((classe) => `.${classe}`)
        .join("");
      const texto = (
        el.textContent ||
        el.getAttribute("aria-label") ||
        el.getAttribute("placeholder") ||
        ""
      )
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 40);
      return `<${el.tagName.toLowerCase()}${id}${classes}>${texto ? ` "${texto}"` : ""}`;
    };

    // A técnica do sr-only: caixa de 1px que esconde o conteúdo de quem enxerga.
    const soParaLeitorDeTela = (el: Element) => {
      for (let a: Element | null = el; a; a = a.parentElement) {
        const { width, height } = a.getBoundingClientRect();
        const estilo = getComputedStyle(a);
        if (
          width <= 1 &&
          height <= 1 &&
          estilo.position === "absolute" &&
          estilo.overflow === "hidden"
        ) {
          return true;
        }
      }
      return false;
    };

    const visivel = (el: Element) => {
      if (el.closest(IGNORADOS)) return false;
      if (getComputedStyle(el).visibility !== "visible") return false;
      // display: contents não tem caixa própria; vale a do pai.
      let comCaixa: Element | null = el;
      while (comCaixa && getComputedStyle(comCaixa).display === "contents") {
        comCaixa = comCaixa.parentElement;
      }
      return (
        !!comCaixa &&
        comCaixa.checkVisibility({ checkOpacity: true }) &&
        !soParaLeitorDeTela(el)
      );
    };

    // Quem passa da borda direita de `raiz` sem estar dentro de algo que corta ou rola.
    // Fica o mais de dentro, que costuma ser o culpado.
    const quemPassa = (raiz: Element, borda: number) => {
      const passa = (el: Element) =>
        el.getBoundingClientRect().right > borda + 0.5;
      const contido = (el: Element) => {
        for (let a = el.parentElement; a && a !== raiz; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== "visible") return true;
        }
        return false;
      };
      return Array.from(raiz.querySelectorAll("*"))
        .filter(
          (el) =>
            !el.closest(IGNORADOS) &&
            passa(el) &&
            !Array.from(el.children).some(passa) &&
            !contido(el),
        )
        .slice(0, 8)
        .map((el) => {
          const { width, right } = el.getBoundingClientRect();
          return `${descrever(el)} tem ${arredondar(width)}px de largura e vai até ${arredondar(right)}px`;
        });
    };

    const html = document.documentElement;

    // 1. Rolagem horizontal: da página e de cada miolo que rola.
    const larguraDemais: string[] = [];
    const larguraDoDocumento = Math.max(
      html.scrollWidth,
      document.body.scrollWidth,
    );
    // Compara com a largura configurada: no celular, conteúdo largo aumenta o innerWidth.
    if (larguraDoDocumento > p.largura) {
      larguraDemais.push(
        `a página tem ${larguraDoDocumento}px de conteúdo numa largura de ${p.largura}px`,
        ...quemPassa(document.body, p.largura),
      );
    }
    for (const miolo of document.querySelectorAll(".casca-rola-miolo")) {
      if (miolo.scrollWidth > miolo.clientWidth) {
        larguraDemais.push(
          `o miolo ${descrever(miolo)} tem ${miolo.scrollWidth}px de conteúdo em ${miolo.clientWidth}px`,
          ...quemPassa(miolo, miolo.getBoundingClientRect().right),
        );
      }
    }

    // 3. Alvo de toque.
    const alvosPequenos: string[] = [];
    if (p.alvoMinimo !== null) {
      for (const el of document.querySelectorAll(
        "button, a, input:not([type=hidden]), select",
      )) {
        const { width, height } = el.getBoundingClientRect();
        if ((width === 0 && height === 0) || !visivel(el)) continue;
        if (p.seletoresIsentos.some((seletor) => el.matches(seletor))) continue;
        if (height < p.alvoMinimo - 0.5) {
          alvosPequenos.push(
            `${descrever(el)} tem ${arredondar(height)}px de altura (mínimo ${p.alvoMinimo})`,
          );
        }
      }
    }

    // 4. Texto pequeno: cada trecho de texto na tela e o que está escrito nos campos.
    const textos = new Set<string>();
    const conferirTexto = (el: Element) => {
      let px = parseFloat(getComputedStyle(el).fontSize);
      // Em SVG com viewBox, o tamanho na tela é o da fonte vezes a escala do desenho.
      if (el instanceof SVGGraphicsElement) {
        const matriz = el.getScreenCTM();
        if (matriz) px *= Math.hypot(matriz.c, matriz.d);
      }
      if (px < p.textoMinimo - 0.05) {
        textos.add(`${descrever(el)} com ${arredondar(px)}px`);
      }
    };
    const andarilho = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let no = andarilho.nextNode(); no; no = andarilho.nextNode()) {
      const el = no.parentElement;
      if (!el || !no.textContent?.trim() || !visivel(el)) continue;
      const faixa = document.createRange();
      faixa.selectNodeContents(no);
      if (faixa.getClientRects().length > 0) conferirTexto(el);
    }
    for (const campo of document.querySelectorAll(
      "input:not([type=hidden], [type=checkbox], [type=radio], [type=range], [type=color]), select, textarea",
    )) {
      if (visivel(campo)) conferirTexto(campo);
    }

    return {
      larguraDemais,
      alturaDoDocumento: Math.max(
        html.scrollHeight,
        document.body.scrollHeight,
      ),
      alvosPequenos,
      textosPequenos: Array.from(textos),
    };
  }, parametros);
}
