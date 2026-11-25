import { describe, expect, it } from "vitest";
import { anoMesEm, diasUteisDoMes } from "./calendario";

describe("diasUteisDoMes", () => {
  it("conta 21 dias de segunda a sexta em novembro de 2026", () => {
    expect(diasUteisDoMes(2026, 11)).toBe(21);
  });

  it("conta fevereiro de ano bissexto", () => {
    expect(diasUteisDoMes(2028, 2)).toBe(21);
  });
});

describe("anoMesEm", () => {
  it("usa o fuso de São Paulo, não o UTC", () => {
    // 01/12 às 01:00 UTC ainda é 30/11 às 22:00 em São Paulo.
    expect(anoMesEm(new Date("2026-12-01T01:00:00Z"))).toEqual({
      ano: 2026,
      mes: 11,
    });
  });
});
