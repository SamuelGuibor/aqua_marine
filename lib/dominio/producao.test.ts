import { describe, expect, it } from "vitest";
import { tipoRegistro } from "@/lib/db/schema";
import {
  SEM_PRODUCAO,
  TIPOS_REGISTRO,
  UNIDADE,
  areaDoSetor,
  valorDoSetor,
  type LinhaProducao,
} from "./producao";

const AREA = { 1: 1, 2: 1.5, 3: 2, 4: 2.5 };

describe("producao", () => {
  it("TipoRegistro é igual ao enum do banco", () => {
    expect([...TIPOS_REGISTRO]).toEqual(tipoRegistro.enumValues);
  });

  it("unidade por setor", () => {
    expect(UNIDADE).toEqual({ inj: "boas", mon: "montadas", tes: "embaladas" });
  });

  it("Injetora soma boas de 2 e de 1 ciclo; vazio e perda não contam", () => {
    const linhas: LinhaProducao[] = [
      { tipo: "inj_boa2", medidaId: 2, placas: 230 },
      { tipo: "inj_boa1", medidaId: 2, placas: 10 },
      { tipo: "inj_vazio", medidaId: 2, placas: 0 },
      { tipo: "inj_perda_cab_meio", medidaId: 2, placas: 3 },
    ];
    expect(valorDoSetor("inj", linhas)).toBe(240);
    expect(areaDoSetor("inj", linhas, AREA)).toBe(360);
  });

  it("Teste soma embaladas, não defeitos", () => {
    const linhas: LinhaProducao[] = [
      { tipo: "tes_pacote", medidaId: 1, placas: 120 },
      { tipo: "tes_defeito_caninho", medidaId: 1, placas: 7 },
    ];
    expect(valorDoSetor("tes", linhas)).toBe(120);
    expect(areaDoSetor("tes", linhas, AREA)).toBe(120);
  });

  it("setor sem linha no dia = sem produção", () => {
    expect(valorDoSetor("mon", [])).toBe(SEM_PRODUCAO);
    expect(areaDoSetor("mon", [], AREA)).toBe(0);
  });

  it("dia só com perdas é zero, não sem produção", () => {
    expect(
      valorDoSetor("inj", [{ tipo: "inj_perda_can_total", medidaId: 1, placas: 2 }]),
    ).toBe(0);
  });
});
