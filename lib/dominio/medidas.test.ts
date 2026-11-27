import { describe, expect, it } from "vitest";
import { MEDIDAS, areaDaMedida, rotuloMedida } from "./medidas";

describe("medidas", () => {
  it("área por medida", () => {
    expect(MEDIDAS.map(areaDaMedida)).toEqual([1, 1.5, 2, 2.5]);
  });

  it("rótulo", () => {
    expect(rotuloMedida(3)).toBe("3 m · 1,5 m²");
    expect(rotuloMedida(2)).toBe("2 m · 1 m²");
    expect(rotuloMedida(5)).toBe("5 m · 2,5 m²");
  });
});
