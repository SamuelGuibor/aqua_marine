import { describe, expect, it } from "vitest";
import {
  aprovacao,
  distribuicaoPorTamanho,
  foraDoPadrao,
  perdaTeste,
  placasPorPacote,
  testadas,
  validarPlacasPorPacote,
} from "./teste";

describe("teste & embalagem", () => {
  it("120 embaladas + 7 caninho + 12 cabeçote: 139 · 86,3% · 13,7%", () => {
    expect(testadas(120, 7 + 12)).toBe(139);
    expect(aprovacao(120, 19)).toBe(86.3);
    expect(perdaTeste(120, 19)).toBe(13.7);
  });

  it("placas por pacote: 10,0 e vazio sem pacote", () => {
    expect(placasPorPacote(120, 12)).toBe(10);
    expect(placasPorPacote(1440, 146)).toBe(9.9);
    expect(placasPorPacote(0, 0)).toBeNull();
  });

  it("distribuição por tamanho", () => {
    const d = distribuicaoPorTamanho([
      { placasPorPacote: 8, pacotes: 4 },
      { placasPorPacote: 10, pacotes: 136 },
      { placasPorPacote: 8, pacotes: 6 },
    ]);
    expect(d.texto).toBe("com 10: 136 · com 8: 10");
    expect(distribuicaoPorTamanho([]).texto).toBe("");
  });

  it("validação e fora do padrão", () => {
    expect(validarPlacasPorPacote(1)).toBe(true);
    expect(validarPlacasPorPacote(30)).toBe(true);
    expect(validarPlacasPorPacote(0)).toBe(false);
    expect(validarPlacasPorPacote(31)).toBe(false);
    expect(validarPlacasPorPacote(2.5)).toBe(false);
    expect(foraDoPadrao(10)).toBe(false);
    expect(foraDoPadrao(8)).toBe(true);
  });

  it("bordas: nada testado", () => {
    expect(aprovacao(0, 0)).toBeNull();
    expect(perdaTeste(0, 0)).toBeNull();
  });
});
