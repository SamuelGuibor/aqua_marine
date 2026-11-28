// Testes de unidade de `registrarAcao`, com uma transação falsa que só guarda o que receberia.
// As linhas com `@ts-expect-error` são testes de tipo: se o erro de tipo sumir, o `npm run tipos` falha.
import { describe, expect, it } from "vitest";
import type { Transacao } from "../db/cliente";
import { type Gravador, registrarAcao } from "./registrar-acao";

function transacaoFalsa() {
  const gravados: Record<string, unknown>[] = [];
  const tx = {
    insert: () => ({
      values: (v: Record<string, unknown>) => {
        gravados.push(v);
        return { returning: async () => [{ id: gravados.length }] };
      },
    }),
  } as unknown as Gravador;
  return { tx, gravados };
}

// Teste de tipo: o `tx` de `transacao()` (Neon) serve como Gravador.
export type TxDoNeonServe = Transacao extends Gravador ? true : never;
const _txDoNeonServe: TxDoNeonServe = true;
void _txDoNeonServe;

const USUARIO = "00000000-0000-7000-8000-000000000101";

describe("registrarAcao", () => {
  it("grava ator, ids, entidade e origem; limpa o sensível", async () => {
    const { tx, gravados } = transacaoFalsa();
    await registrarAcao(tx, {
      acao: "usuario.senha_trocada",
      ator: { tipo: "usuario", usuarioId: USUARIO },
      entidade: "usuario",
      entidadeId: USUARIO,
      antes: { senha_hash: "a" },
      depois: { nome: "Ana", senha_hash: "x", token: "y" },
      origem: { ip: "200.1.2.3", userAgent: "Tablet" },
    });
    expect(gravados).toEqual([
      {
        acao: "usuario.senha_trocada",
        ator: "usuario",
        usuarioId: USUARIO,
        tabletId: null,
        entidade: "usuario",
        entidadeId: USUARIO,
        antes: null,
        depois: { nome: "Ana" },
        ip: "200.1.2.3",
        userAgent: "Tablet",
      },
    ]);
  });

  it("botão e sistema não levam usuário nem tablet", async () => {
    const { tx, gravados } = transacaoFalsa();
    await registrarAcao(tx, { acao: "dia.lancado", ator: { tipo: "sistema" }, entidade: "dia" });
    expect(gravados[0]).toMatchObject({ ator: "sistema", usuarioId: null, tabletId: null, ip: null });
  });

  it("recusa nome de ação fora da lista (CA3)", async () => {
    const { tx, gravados } = transacaoFalsa();
    await expect(
      registrarAcao(tx, {
        // @ts-expect-error nome fora de ACOES não compila
        acao: "qualquer.coisa",
        ator: { tipo: "sistema" },
        entidade: "teste",
      }),
    ).rejects.toThrow("fora da lista");
    expect(gravados).toHaveLength(0);
  });

  it("recusa usuário sem usuarioId e tablet sem tabletId (CA5)", async () => {
    const { tx, gravados } = transacaoFalsa();
    await expect(
      registrarAcao(tx, {
        acao: "meta.alterada",
        // @ts-expect-error ator 'usuario' exige usuarioId
        ator: { tipo: "usuario" },
        entidade: "meta",
      }),
    ).rejects.toThrow("sem usuarioId");
    await expect(
      registrarAcao(tx, {
        acao: "lote.fechado",
        // @ts-expect-error ator 'tablet' exige tabletId
        ator: { tipo: "tablet" },
        entidade: "lote",
      }),
    ).rejects.toThrow("sem tabletId");
    await expect(
      registrarAcao(tx, {
        acao: "lote.fechado",
        // @ts-expect-error tipo de ator desconhecido
        ator: { tipo: "robo" },
        entidade: "lote",
      }),
    ).rejects.toThrow("ator desconhecido");
    expect(gravados).toHaveLength(0);
  });
});
