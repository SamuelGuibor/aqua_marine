import { describe, expect, it } from "vitest";
import {
  boas,
  ciclos,
  ciclosPerdidos,
  ciclosPorHora,
  ciclosVazios,
  eficiencia,
  perdas,
  placasPorHora,
  tempoPorCiclo,
  tempoPorPlaca,
  type ContagemInjetora,
} from "./injetora";

// Lote do protótipo: 240 boas de 2 ciclos, 1 vazio, 3 perdas.
const LOTE: ContagemInjetora = {
  inj_boa2: 240,
  inj_vazio: 1,
  inj_perda_cab_meio: 1,
  inj_perda_cab_total: 1,
  inj_perda_can_total: 1,
};

describe("injetora", () => {
  it("eficiência 98,8% = 240 ÷ (240 + 3)", () => {
    expect(boas(LOTE)).toBe(240);
    expect(perdas(LOTE)).toBe(3);
    expect(eficiencia(LOTE)).toBe(98.8);
  });

  it("484 ciclos: 240×2 + 1 vazio + 3 perdas", () => {
    expect(ciclos(LOTE)).toBe(484);
  });

  it("boa de 1 ciclo conta como placa boa", () => {
    expect(boas({ inj_boa2: 5, inj_boa1: 2 })).toBe(7);
    expect(ciclos({ inj_boa2: 5, inj_boa1: 2 })).toBe(12);
  });

  it("vazios não mudam a eficiência e saem separados dos perdidos", () => {
    const comVazios = { ...LOTE, inj_vazio: 50 };
    expect(eficiencia(comVazios)).toBe(eficiencia(LOTE));
    expect(ciclosPerdidos(comVazios)).toBe(3);
    expect(ciclosVazios(comVazios)).toBe(50);
  });

  it("por hora e tempo por item (494 min)", () => {
    expect(placasPorHora(LOTE, 494)).toBe(29);
    expect(ciclosPorHora(LOTE, 494)).toBe(59);
    expect(tempoPorPlaca(LOTE, 494)).toBe(124);
    expect(tempoPorCiclo(LOTE, 494)).toBe(61);
  });

  it("bordas: sem boas nem perdas, sem tempo", () => {
    expect(eficiencia({ inj_vazio: 4 })).toBeNull();
    expect(eficiencia({})).toBeNull();
    expect(placasPorHora(LOTE, 0)).toBeNull();
    expect(ciclosPorHora(LOTE, 0)).toBeNull();
    expect(tempoPorPlaca({}, 494)).toBeNull();
    expect(tempoPorCiclo(LOTE, 0)).toBeNull();
  });
});
