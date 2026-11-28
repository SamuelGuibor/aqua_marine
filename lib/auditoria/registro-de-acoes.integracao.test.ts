// `registrarAcao` e `registroDeAcoes` contra o banco de verdade das migrations, num PGlite em memória.
// Nada cai no Neon.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { aplicarMigrations, novoBancoDeTeste } from "../db/pglite-teste";
import { type Escrita, semearBanco } from "../db/semear";
import { ACOES_POR_PAGINA, registroDeAcoes } from "./registro-de-acoes";
import { type Ator, registrarAcao } from "./registrar-acao";

const { pg, db } = novoBancoDeTeste();

const um = async <T>(consulta: string) => (await pg.query<T>(consulta)).rows[0];
const total = async () =>
  (await um<{ n: number }>("select count(*)::int as n from registro_acao")).n;

let admin: string;
let tablet: string;
let mesaA: string;
let mesaB: string;

beforeAll(async () => {
  await aplicarMigrations(pg);
  await semearBanco(db as unknown as Escrita, {
    senhaAdmin: "senha-de-teste-local",
    agora: new Date("2026-11-25T12:00:00Z"),
  });
  ({ id: admin } = await um<{ id: string }>("select id from usuario where papel = 'admin'"));
  ({ id: tablet } = await um<{ id: string }>(`
    insert into tablet (nome, setor_id, codigo, codigo_seq, criado_por)
    values ('TESTE Montagem', 'mon', 'TAB-MON-01', 1, '${admin}') returning id`));
  const mesas = (await pg.query<{ id: string }>("select id::text as id from mesa order by id limit 2")).rows;
  [mesaA, mesaB] = mesas.map((m) => m.id);
}, 60_000);

afterAll(() => pg.close());

describe("registrarAcao no banco", () => {
  it("transação que termina bem grava exatamente 1 linha, com tudo preenchido (CA1)", async () => {
    const antes = await total();
    const id = await db.transaction((tx) =>
      registrarAcao(tx, {
        acao: "meta.alterada",
        ator: { tipo: "usuario", usuarioId: admin },
        entidade: "meta",
        entidadeId: "inj",
        antes: { placas_dia: 120 },
        depois: { placas_dia: 140, senha_hash: "nunca" },
        origem: { ip: "200.1.2.3", userAgent: "Teste" },
      }),
    );
    expect(await total()).toBe(antes + 1);
    const linha = await um<Record<string, unknown>>(`select * from registro_acao where id = ${id}`);
    expect(linha).toMatchObject({
      acao: "meta.alterada",
      ator: "usuario",
      usuario_id: admin,
      tablet_id: null,
      entidade: "meta",
      entidade_id: "inj",
      antes: { placas_dia: 120 },
      depois: { placas_dia: 140 },
      ip: "200.1.2.3",
      user_agent: "Teste",
    });
    expect(linha.ocorrido_em).toBeInstanceOf(Date);
  });

  it("transação que falha depois da chamada não deixa linha (CA2)", async () => {
    const antes = await total();
    await expect(
      db.transaction(async (tx) => {
        await registrarAcao(tx, {
          acao: "mesa.operadora_alterada",
          ator: { tipo: "usuario", usuarioId: admin },
          entidade: "mesa",
          entidadeId: mesaA,
          antes: { operadora: "Ana" },
          depois: { operadora: "Bia" },
        });
        throw new Error("erro proposital depois do registro");
      }),
    ).rejects.toThrow("erro proposital");
    expect(await total()).toBe(antes);
  });

  it("grava o tablet com tablet_id e recusa tablet ou usuário sem id (CA5)", async () => {
    const id = await db.transaction((tx) =>
      registrarAcao(tx, {
        acao: "lote.fechado",
        ator: { tipo: "tablet", tabletId: tablet },
        entidade: "lote",
        entidadeId: "lote-1",
      }),
    );
    expect(await um(`select ator, tablet_id, usuario_id from registro_acao where id = ${id}`)).toEqual({
      ator: "tablet",
      tablet_id: tablet,
      usuario_id: null,
    });

    const antes = await total();
    for (const ator of [{ tipo: "tablet" }, { tipo: "usuario", usuarioId: "" }]) {
      await expect(
        db.transaction((tx) =>
          registrarAcao(tx, { acao: "lote.fechado", ator: ator as unknown as Ator, entidade: "lote" }),
        ),
      ).rejects.toThrow(/sem (tabletId|usuarioId)/);
    }
    expect(await total()).toBe(antes);
  });
});

describe("registroDeAcoes", () => {
  beforeAll(async () => {
    // 51 ações na mesa A (uma página e mais uma) e 2 na mesa B, intercaladas, cada uma na sua transação.
    for (let i = 1; i <= ACOES_POR_PAGINA + 1; i++) {
      await db.transaction((tx) =>
        registrarAcao(tx, {
          acao: "mesa.medida_alterada",
          ator: { tipo: "usuario", usuarioId: admin },
          entidade: "mesa",
          entidadeId: mesaA,
          antes: { medida: 2 },
          depois: { medida: 3, ordem: i },
        }),
      );
      if (i % 25 === 0) {
        await db.transaction((tx) =>
          registrarAcao(tx, {
            acao: "mesa.operadora_alterada",
            ator: { tipo: "sistema" },
            entidade: "mesa",
            entidadeId: mesaB,
          }),
        );
      }
    }
  }, 60_000);

  it("devolve só as ações da mesa, da mais nova para a mais antiga, em páginas (CA6)", async () => {
    const primeira = await registroDeAcoes({ entidade: "mesa", entidadeId: mesaA }, db);
    expect(primeira.pagina).toBe(1);
    expect(primeira.temMais).toBe(true);
    expect(primeira.itens).toHaveLength(ACOES_POR_PAGINA);
    expect(primeira.itens.every((l) => l.entidadeId === mesaA)).toBe(true);
    expect(primeira.itens[0].depois).toEqual({ medida: 3, ordem: ACOES_POR_PAGINA + 1 });

    for (let i = 1; i < primeira.itens.length; i++) {
      const [novo, velho] = [primeira.itens[i - 1], primeira.itens[i]];
      expect(novo.ocorridoEm.getTime()).toBeGreaterThanOrEqual(velho.ocorridoEm.getTime());
      expect(novo.id).toBeGreaterThan(velho.id);
    }

    const segunda = await registroDeAcoes({ entidade: "mesa", entidadeId: mesaA, pagina: 2 }, db);
    expect(segunda).toMatchObject({ pagina: 2, temMais: false });
    expect(segunda.itens.map((l) => l.depois)).toEqual([{ medida: 3, ordem: 1 }]);

    const b = await registroDeAcoes({ entidade: "mesa", entidadeId: mesaB }, db);
    expect(b.itens).toHaveLength(2);
    expect(b.itens.every((l) => l.entidadeId === mesaB && l.ator === "sistema")).toBe(true);
  });

  it("filtra por ação e por período", async () => {
    const lote = await registroDeAcoes({ acao: "lote.fechado" }, db);
    expect(lote.itens.map((l) => l.ator)).toEqual(["tablet"]);

    const futuro = new Date(Date.now() + 60 * 60 * 1000);
    expect((await registroDeAcoes({ de: futuro }, db)).itens).toHaveLength(0);
    const tudo = await registroDeAcoes({ ate: futuro, pagina: 2 }, db);
    expect(tudo.itens.length).toBeGreaterThan(0);
  });
});
