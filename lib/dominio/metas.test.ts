import { describe, expect, it } from "vitest";
import {
  aFrente,
  bateMeta,
  esperado,
  faltam,
  fazPorDia,
  metaDoDiaGrafico,
  metaDoMes,
  pctBarra,
  pctMeta,
  precisaPorDia,
  projecao,
  ritmo,
} from "./metas";

describe("meta do dia", () => {
  it("387 de 270: 143%, barra 100, acima 117", () => {
    expect(pctMeta(387, 270)).toBe(143);
    expect(pctBarra(387, 270)).toBe(100);
    expect(faltam(387, 270)).toEqual({ acima: 117 });
  });

  it("outros exemplos", () => {
    expect(pctMeta(76, 270)).toBe(28);
    expect(pctMeta(161, 270)).toBe(60);
    expect(pctMeta(120, 270)).toBe(44);
    expect(faltam(240, 270)).toEqual({ faltam: 30 });
    expect(faltam(270, 270)).toEqual({ acima: 0 });
  });

  it("ritmo: 240 em 8h14 = 29/h", () => {
    expect(ritmo(240, 494)).toBe(29);
  });

  it("bate a meta às 16:38 (agora 15:36, faltam 30, ritmo 29)", () => {
    const agora = new Date("2026-11-10T18:36:00Z"); // 15:36 em São Paulo
    expect(bateMeta(agora, 30, 29)).toBe("16:38");
    expect(bateMeta(agora, 0, 29)).toBe("batida");
    expect(bateMeta(agora, 30, null)).toBe("—");
  });

  it("meta do gráfico = 540", () => {
    expect(metaDoDiaGrafico(270, 270)).toBe(540);
  });
});

describe("meta do mês (10/11: 21 úteis, 15 restantes, 5 dias com produção)", () => {
  const metaMes = metaDoMes(270, 21);

  it("Injetora: 5.670 · 301 · 278 · 6.016", () => {
    expect(metaMes).toBe(5670);
    const faz = fazPorDia(1504, 5);
    expect(Math.round(faz!)).toBe(301);
    expect(precisaPorDia(metaMes, 1504, 15)).toBe(278);
    expect(projecao(1504, faz, 15)).toBe(6016);
    expect(aFrente(6016, metaMes)).toEqual({ aFrente: 346 });
  });

  it("Montagem: 339 · 265 · 6.784; Teste: 288 · 282 · 5.760", () => {
    const fm = fazPorDia(1696, 5);
    expect(Math.round(fm!)).toBe(339);
    expect(precisaPorDia(metaMes, 1696, 15)).toBe(265);
    expect(projecao(1696, fm, 15)).toBe(6784);
    const ft = fazPorDia(1440, 5);
    expect(ft).toBe(288);
    expect(precisaPorDia(metaMes, 1440, 15)).toBe(282);
    expect(projecao(1440, ft, 15)).toBe(5760);
    expect(aFrente(5000, metaMes)).toEqual({ atras: 670 });
  });

  it("esperado até ontem = 6 ÷ 21 = 28,6%", () => {
    expect(esperado(6, 21)).toBe(28.6);
  });
});

describe("bordas: nada de NaN nem Infinity", () => {
  it("meta zero", () => {
    expect(pctMeta(10, 0)).toBeNull();
    expect(pctBarra(10, 0)).toBeNull();
  });

  it("tempo ativo zero: ritmo vazio", () => {
    expect(ritmo(240, 0)).toBeNull();
  });

  it("dias restantes zero", () => {
    expect(precisaPorDia(5670, 1504, 0)).toBeNull();
    expect(projecao(1504, 300.8, 0)).toBe(1504);
  });

  it("sem dias", () => {
    expect(fazPorDia(0, 0)).toBeNull();
    expect(projecao(0, null, 15)).toBe(0);
    expect(esperado(0, 0)).toBeNull();
  });

  it("já bateu o mês: precisa 0", () => {
    expect(precisaPorDia(5670, 6000, 3)).toBe(0);
  });

  it("resultados numéricos são finitos", () => {
    const valores = [pctMeta(0, 270), ritmo(0, 10), precisaPorDia(0, 0, 1), projecao(0, 0, 0)];
    for (const v of valores) expect(Number.isFinite(v)).toBe(true);
  });
});
