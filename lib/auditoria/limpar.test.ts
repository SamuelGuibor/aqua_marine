import { describe, expect, it } from "vitest";
import { diferenca, limparSensiveis } from "./limpar";

describe("limparSensiveis", () => {
  it("tira senha_hash e token e deixa o resto (CA4)", () => {
    expect(limparSensiveis({ nome: "Ana", senha_hash: "x", token: "y" })).toEqual({
      nome: "Ana",
    });
  });

  it("não diferencia maiúsculas nem o jeito de escrever a chave", () => {
    expect(
      limparSensiveis({
        Senha: "1",
        senhaHash: "2",
        tokenBotao: "3",
        token_tablet: "4",
        TOKEN: "5",
        codigo: "TAB-INJ-01",
      }),
    ).toEqual({ codigo: "TAB-INJ-01" });
  });

  it("limpa também dentro de objetos e listas", () => {
    expect(
      limparSensiveis({
        tablet: { nome: "Injetora", token: "y" },
        botoes: [{ id: 1, tokenBotao: "z" }],
      }),
    ).toEqual({ tablet: { nome: "Injetora" }, botoes: [{ id: 1 }] });
  });

  it("vazio, nulo ou só com campos sensíveis vira null", () => {
    expect(limparSensiveis({})).toBeNull();
    expect(limparSensiveis(null)).toBeNull();
    expect(limparSensiveis(undefined)).toBeNull();
    expect(limparSensiveis({ senha: "x" })).toBeNull();
  });

  it("mantém data e número como estão e não mexe no objeto recebido", () => {
    const quando = new Date("2026-11-25T12:00:00Z");
    const entrada = { quando, placas: 10, senha: "x" };
    expect(limparSensiveis(entrada)).toEqual({ quando, placas: 10 });
    expect(entrada).toHaveProperty("senha", "x");
  });
});

describe("diferenca", () => {
  it("fica só com as chaves que mudaram", () => {
    expect(
      diferenca(
        { nome: "Mesa 1", operadora: "Ana", medida: 3 },
        { nome: "Mesa 1", operadora: "Bia", medida: 3 },
      ),
    ).toEqual({ antes: { operadora: "Ana" }, depois: { operadora: "Bia" } });
  });

  it("campo novo ou que saiu aparece só de um lado", () => {
    expect(diferenca({ a: 1 }, { b: 2 })).toEqual({
      antes: { a: 1 },
      depois: { b: 2 },
    });
  });

  it("criação: antes nulo, depois com tudo", () => {
    expect(diferenca(null, { nome: "Mesa 7" })).toEqual({
      antes: null,
      depois: { nome: "Mesa 7" },
    });
  });

  it("nada mudou: os dois null", () => {
    expect(diferenca({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toEqual({
      antes: null,
      depois: null,
    });
  });
});
