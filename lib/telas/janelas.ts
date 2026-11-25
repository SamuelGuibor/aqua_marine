// As janelas da conferência de largura (docs/larguras.md).
// Lido pelo playwright.config.ts e pelos testes: sem React e sem o atalho @/.

export type NomeDeJanela =
  | "pc"
  | "tablet-h"
  | "tablet-v"
  | "rh-tablet"
  | "celular"
  | "ipad-h";

export type Janela = {
  nome: NomeDeJanela;
  largura: number;
  altura: number;
  /** Tela de toque: o navegador responde `pointer: coarse`. */
  toque: boolean;
  /** Navegador de celular: respeita o meta viewport. */
  movel: boolean;
  /** Altura mínima, em px, de tudo que se toca. null = não é conferida. */
  alvoMinimo: number | null;
  /** Só confere a rolagem horizontal e tira a foto; o achado vira aviso, não falha. */
  soAvisa: boolean;
};

export const JANELAS: readonly Janela[] = [
  {
    nome: "pc",
    largura: 1440,
    altura: 900,
    toque: false,
    movel: false,
    alvoMinimo: null,
    soAvisa: false,
  },
  // O aparelho do operador.
  {
    nome: "tablet-h",
    largura: 1280,
    altura: 800,
    toque: true,
    movel: false,
    alvoMinimo: 44,
    soAvisa: false,
  },
  {
    nome: "tablet-v",
    largura: 800,
    altura: 1280,
    toque: true,
    movel: false,
    alvoMinimo: 44,
    soAvisa: false,
  },
  {
    nome: "rh-tablet",
    largura: 820,
    altura: 1180,
    toque: true,
    movel: false,
    alvoMinimo: 44,
    soAvisa: false,
  },
  {
    nome: "celular",
    largura: 390,
    altura: 844,
    toque: true,
    movel: true,
    alvoMinimo: 48,
    soAvisa: false,
  },
  // iPad deitado: aceita o arranjo "em pé" com rolagem.
  {
    nome: "ipad-h",
    largura: 1180,
    altura: 820,
    toque: true,
    movel: false,
    alvoMinimo: null,
    soAvisa: true,
  },
];
