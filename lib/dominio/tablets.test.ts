import { describe, expect, test } from "vitest";

import {
  ROTA_SETOR,
  avaliarVinculo,
  codigoTemFormato,
  deveAtualizarAcesso,
  formarCodigo,
  normalizarCodigo,
  situacao,
  validarNome,
  type LinhaDeVinculo,
} from "./tablets";

describe("código do tablet", () => {
  test("leva o prefixo do setor e o número com dois dígitos ou mais", () => {
    expect(formarCodigo("mon", 1)).toBe("TAB-MONT-01");
    expect(formarCodigo("inj", 2)).toBe("TAB-INJE-02");
    expect(formarCodigo("tes", 100)).toBe("TAB-TEST-100");
  });

  test("é normalizado sem diferenciar maiúsculas e ignorando espaços", () => {
    expect(normalizarCodigo(" tab-mont-01 ")).toBe("TAB-MONT-01");
    expect(normalizarCodigo("TAB - Mont -\t01\n")).toBe("TAB-MONT-01");
  });

  test("tem o formato conferido", () => {
    expect(codigoTemFormato("TAB-MONT-01")).toBe(true);
    expect(codigoTemFormato("TAB-TEST-100")).toBe(true);
    for (const errado of [
      "",
      "TAB-MONT",
      "TAB-MONT-1",
      "TAB-MON-01",
      "tab-mont-01",
      "TAB-MONT-01X",
      "XTAB-MONT-01",
    ]) {
      expect(codigoTemFormato(errado), errado).toBe(false);
    }
  });
});

describe("nome do tablet", () => {
  test("é aparado", () => {
    expect(validarNome("  Tablet Montagem ")).toEqual({
      ok: true,
      nome: "Tablet Montagem",
    });
  });

  test("vazio ou só com espaços é recusado", () => {
    const recusa = { ok: false, erro: "nome_vazio" };
    expect(validarNome("")).toEqual(recusa);
    expect(validarNome("   \t ")).toEqual(recusa);
  });
});

test("cada setor tem a sua rota", () => {
  expect(ROTA_SETOR).toEqual({
    inj: "/fabrica/injetora",
    mon: "/fabrica/montagem",
    tes: "/fabrica/teste-embalagem",
  });
});

test("a situação vem de existir ou não vínculo ativo", () => {
  expect(situacao(true)).toBe("Vinculado");
  expect(situacao(false)).toBe("Aguardando vínculo");
});

describe("avaliarVinculo", () => {
  const ativo: LinhaDeVinculo = {
    tabletId: "tablet-1",
    setorId: "mon",
    modo: "setor",
    revogadoEm: null,
    arquivadoEm: null,
  };

  test("vínculo ativo devolve só o tablet, o setor e o modo", () => {
    expect(avaliarVinculo(ativo)).toEqual({
      tabletId: "tablet-1",
      setorId: "mon",
      modo: "setor",
    });
  });

  test("recusa token revogado", () => {
    expect(avaliarVinculo({ ...ativo, revogadoEm: new Date() })).toBeNull();
  });

  test("recusa token inexistente", () => {
    expect(avaliarVinculo(null)).toBeNull();
    expect(avaliarVinculo(undefined)).toBeNull();
  });

  test("recusa tablet arquivado", () => {
    expect(avaliarVinculo({ ...ativo, arquivadoEm: new Date() })).toBeNull();
  });
});

describe("deveAtualizarAcesso", () => {
  const agora = new Date("2026-11-25T12:00:00Z");
  const haSegundos = (s: number) => new Date(agora.getTime() - s * 1000);

  test("grava o primeiro acesso", () => {
    expect(deveAtualizarAcesso(null, agora)).toBe(true);
  });

  test("grava no máximo uma vez por minuto", () => {
    expect(deveAtualizarAcesso(haSegundos(59), agora)).toBe(false);
    expect(deveAtualizarAcesso(haSegundos(60), agora)).toBe(true);
  });
});
