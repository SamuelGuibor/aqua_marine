import { describe, expect, it } from "vitest";
import { origemDosCabecalhos } from "./origem";

describe("origemDosCabecalhos", () => {
  it("pega o primeiro endereço do x-forwarded-for e o user-agent", () => {
    const h = new Headers({
      "x-forwarded-for": "200.1.2.3, 10.0.0.1",
      "x-real-ip": "10.0.0.9",
      "user-agent": "Mozilla/5.0 (Linux; Android 14) Tablet",
    });
    expect(origemDosCabecalhos(h)).toEqual({
      ip: "200.1.2.3",
      userAgent: "Mozilla/5.0 (Linux; Android 14) Tablet",
    });
  });

  it("sem x-forwarded-for usa o x-real-ip", () => {
    expect(origemDosCabecalhos(new Headers({ "x-real-ip": "200.9.9.9" }))).toEqual({
      ip: "200.9.9.9",
      userAgent: null,
    });
  });

  it("sem cabeçalho nenhum devolve nulos", () => {
    expect(origemDosCabecalhos(new Headers())).toEqual({ ip: null, userAgent: null });
  });
});
