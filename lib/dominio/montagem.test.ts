import { describe, expect, it } from "vitest";
import { mesaAtiva, operadorasSemMesa, porOperadora, totalMontagem } from "./montagem";

const LINHAS = [
  { operadoraId: "ana", medidaId: 2, placas: 31 },
  { operadoraId: "bia", medidaId: 2, placas: 21 },
  { operadoraId: "cris", medidaId: 3, placas: 44 },
  { operadoraId: "dani", medidaId: 1, placas: 31 },
  { operadoraId: null, medidaId: 1, placas: 9 },
];

describe("montagem", () => {
  it("mesa ativa tem operadora e medida", () => {
    expect(mesaAtiva({ operadoraId: "ana", medidaId: 2 })).toBe(true);
    expect(mesaAtiva({ operadoraId: "ana", medidaId: null })).toBe(false);
    expect(mesaAtiva({ operadoraId: null, medidaId: 2 })).toBe(false);
  });

  it("total 31 + 21 + 44 + 31 = 127", () => {
    expect(totalMontagem(LINHAS)).toBe(127);
  });

  it("por operadora, do maior para o menor, com % e ritmo", () => {
    const r = porOperadora(LINHAS, 120);
    expect(r.map((o) => o.operadoraId)).toEqual(["cris", "ana", "dani", "bia"]);
    expect(r[0]).toEqual({ operadoraId: "cris", total: 44, pctDoDia: 35, ritmo: 22 });
  });

  it("bordas: sem linhas e sem tempo", () => {
    expect(porOperadora([], 120)).toEqual([]);
    expect(porOperadora(LINHAS, 0)[0].ritmo).toBeNull();
  });

  it("operadora sem mesa", () => {
    expect(
      operadorasSemMesa(["ana", "eva", "eva"], [{ operadoraId: "ana", medidaId: 2 }]),
    ).toEqual(["eva"]);
  });
});
