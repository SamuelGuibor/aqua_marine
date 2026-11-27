import { describe, expect, it } from "vitest";
import {
  diaDe,
  diasUteisDecorridos,
  diasUteisRestantes,
  formatarDuracao,
  formatarDuracaoLonga,
} from "./tempo";
import { diasUteisDoMes } from "./calendario";

describe("diaDe", () => {
  it("roda com a máquina em UTC", () => {
    expect(new Date("2026-11-25T02:30:00Z").getHours()).toBe(2);
  });

  it("usa o dia de São Paulo: 02:30 UTC de 25/11 ainda é 24/11", () => {
    expect(diaDe("2026-11-25T02:30:00Z")).toBe("2026-11-24");
    expect(diaDe(new Date("2026-11-25T03:00:00Z"))).toBe("2026-11-25");
  });
});

describe("dias úteis", () => {
  it("10/11/2026: 6 decorridos e 15 restantes (inclui hoje) de 21", () => {
    const uteis = diasUteisDoMes(2026, 11);
    const decorridos = diasUteisDecorridos(2026, 11, "2026-11-10");
    expect(uteis).toBe(21);
    expect(decorridos).toBe(6);
    expect(diasUteisRestantes(uteis, decorridos)).toBe(15);
  });

  it("primeiro dia não tem decorridos; mês passado conta inteiro", () => {
    expect(diasUteisDecorridos(2026, 11, "2026-11-01")).toBe(0);
    expect(diasUteisDecorridos(2026, 11, "2026-12-03")).toBe(21);
    expect(diasUteisDecorridos(2026, 12, "2026-11-20")).toBe(0);
  });

  it("restantes nunca fica negativo", () => {
    expect(diasUteisRestantes(18, 21)).toBe(0);
  });
});

describe("formatos de duração", () => {
  it("curto", () => {
    expect(formatarDuracao(43)).toBe("43 min");
    expect(formatarDuracao(86)).toBe("1h26");
    expect(formatarDuracao(634)).toBe("10h34");
    expect(formatarDuracao(60)).toBe("1h00");
  });

  it("longo", () => {
    expect(formatarDuracaoLonga(494)).toBe("8h 14min");
    expect(formatarDuracaoLonga(43)).toBe("43min");
  });
});
