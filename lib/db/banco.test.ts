// Aplica todas as migrations num Postgres em memória (PGlite) e confere as
// restrições pedidas pelos cards. Não usa o Neon: roda no CI, que não tem banco.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as schema from "./schema";
import { type Escrita, semearBanco } from "./semear";

const PASTA = join(__dirname, "migrations");
const pg = new PGlite();
const db = drizzle(pg, { schema });

function arquivosDeMigration(): string[] {
  const jornal = JSON.parse(
    readFileSync(join(PASTA, "meta", "_journal.json"), "utf8"),
  ) as { entries: { tag: string }[] };
  return jornal.entries.map((e) => `${e.tag}.sql`);
}

async function aplicarMigrations() {
  for (const arquivo of arquivosDeMigration()) {
    const texto = readFileSync(join(PASTA, arquivo), "utf8");
    for (const comando of texto.split("--> statement-breakpoint")) {
      if (comando.trim()) await pg.exec(comando);
    }
  }
}

const semear = () =>
  semearBanco(db as unknown as Escrita, {
    senhaAdmin: "senha-de-teste-local",
    agora: new Date("2026-11-25T12:00:00Z"),
  });

/** Roda o SQL dentro de um savepoint e espera que o banco recuse. */
async function recusa(comando: string, restricao: string) {
  await pg.exec("begin");
  try {
    await expect(pg.exec(comando)).rejects.toThrow(restricao);
  } finally {
    await pg.exec("rollback");
  }
}

const um = async <T>(consulta: string) =>
  (await pg.query<T>(consulta)).rows[0];

let tabletInj: string;
let tabletTes: string;
let jornadaInj: string;

beforeAll(async () => {
  await aplicarMigrations();
  await semear();
  const { id: admin } = await um<{ id: string }>(
    "select id from usuario where papel = 'admin'",
  );
  ({ id: tabletInj } = await um<{ id: string }>(`
    insert into tablet (nome, setor_id, codigo, codigo_seq, criado_por)
    values ('TESTE Injetora', 'inj', 'TAB-INJ-01', 1, '${admin}') returning id`));
  ({ id: tabletTes } = await um<{ id: string }>(`
    insert into tablet (nome, setor_id, codigo, codigo_seq, criado_por)
    values ('TESTE Teste', 'tes', 'TAB-TES-02', 2, '${admin}') returning id`));
  ({ id: jornadaInj } = await um<{ id: string }>(`
    insert into jornada (setor_id, dia, aberta_em)
    values ('inj', '2026-11-25', '2026-11-25T10:00:00Z') returning id`));
  await pg.exec(`
    insert into lote (id, setor_id, jornada_id, dia, medida_id, sequencia, aberto_em, aberto_por_tablet_id)
    values ('00000000-0000-7000-8000-000000000001', 'inj', '${jornadaInj}', '2026-11-25', 2, 1,
            '2026-11-25T10:00:00Z', '${tabletInj}')`);
}, 60_000);

afterAll(() => pg.close());

describe("migrations", () => {
  it("só acrescentam: nenhum DROP, TRUNCATE ou ALTER ... DROP", () => {
    for (const arquivo of arquivosDeMigration()) {
      const texto = readFileSync(join(PASTA, arquivo), "utf8");
      expect(texto, arquivo).not.toMatch(/\b(drop|truncate)\b/i);
    }
  });

  it("criam as 30 tabelas e as 2 views", async () => {
    const { tabelas } = await um<{ tabelas: number }>(
      "select count(*)::int as tabelas from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'",
    );
    const { views } = await um<{ views: number }>(
      "select count(*)::int as views from information_schema.views where table_schema = 'public'",
    );
    expect(tabelas).toBe(30);
    expect(views).toBe(2);
  });
});

describe("seed", () => {
  it("roda duas vezes sem mudar as contagens", async () => {
    const primeira = await semear();
    const segunda = await semear();
    expect(segunda).toEqual(primeira);
    expect(primeira).toMatchObject({
      setor: 3,
      setor_config: 3,
      setor_estado: 3,
      medida: 4,
      "usuario (admin)": 1,
      mesa: 6,
      pausa_categoria: 7,
      pausa_motivo: 38,
      meta_setor: 3,
      calendario_mes: 1,
      relatorio_agendado: 1,
    });
  });

  it("só Refeição é planejada e novembro/2026 tem 21 dias úteis", async () => {
    const { planejadas } = await um<{ planejadas: string }>(
      "select string_agg(id, ',') as planejadas from pausa_categoria where planejada",
    );
    const { dias_uteis } = await um<{ dias_uteis: number }>(
      "select dias_uteis from calendario_mes where ano = 2026 and mes = 11",
    );
    expect(planejadas).toBe("refeicao");
    expect(dias_uteis).toBe(21);
  });

  it("não traz de volta um motivo que o RH desativou", async () => {
    await pg.exec("update pausa_motivo set ativo = false where nome = 'Café'");
    await semear();
    const { total } = await um<{ total: number }>(
      "select count(*)::int as total from pausa_motivo where nome = 'Café'",
    );
    expect(total).toBe(1);
    await pg.exec("update pausa_motivo set ativo = true where nome = 'Café'");
  });
});

describe("restrições de produção (SCRUM-37)", () => {
  const registro = (id: string, extra: Partial<Record<string, string>> = {}) => {
    const c = {
      tipo: "'inj_boa2'",
      natureza: "'toque'",
      quantidade: "1",
      placas: "1",
      ciclos: "2",
      lote: "'00000000-0000-7000-8000-000000000001'",
      origem: "'tablet'",
      tablet: `'${tabletInj}'`,
      estorna: "null",
      ...extra,
    };
    return `insert into registro_producao
      (id, setor_id, dia, jornada_id, lote_id, tipo, natureza, quantidade, placas, ciclos,
       medida_id, origem, tablet_id, estorna_id, ocorrido_em)
      values ('${id}', 'inj', '2026-11-25', '${jornadaInj}', ${c.lote}, ${c.tipo}, ${c.natureza},
              ${c.quantidade}, ${c.placas}, ${c.ciclos}, 2, ${c.origem}, ${c.tablet}, ${c.estorna},
              '2026-11-25T10:05:00Z')`;
  };

  it("recusa duas jornadas no mesmo setor e dia", () =>
    recusa(
      "insert into jornada (setor_id, dia) values ('inj', '2026-11-25')",
      "jornada_setor_id_dia_unique",
    ));

  it("recusa um segundo lote aberto no setor", () =>
    recusa(
      `insert into lote (id, setor_id, jornada_id, dia, medida_id, sequencia, aberto_em)
       values (gen_random_uuid(), 'inj', '${jornadaInj}', '2026-11-25', 3, 2, now())`,
      "lote_aberto_idx",
    ));

  it("recusa lote fora da Injetora e do Teste", async () => {
    const { id } = await um<{ id: string }>(
      "insert into jornada (setor_id, dia) values ('mon', '2026-11-25') returning id",
    );
    await recusa(
      `insert into lote (id, setor_id, jornada_id, dia, medida_id, sequencia, aberto_em)
       values (gen_random_uuid(), 'mon', '${id}', '2026-11-25', 2, 1, now())`,
      "lote_setor_id_check",
    );
  });

  it("recusa quantidade zero, tipo de outro setor e toque de tablet sem lote", async () => {
    await recusa(
      registro("00000000-0000-7000-8000-0000000000a1", { quantidade: "0" }),
      "registro_producao_quantidade_check",
    );
    await recusa(
      registro("00000000-0000-7000-8000-0000000000a2", { tipo: "'mon_placa'" }),
      "registro_producao_tipo_setor_check",
    );
    await recusa(
      registro("00000000-0000-7000-8000-0000000000a3", { lote: "null" }),
      "registro_producao_lote_id_check",
    );
  });

  it("soma +1 +1 −1 na view e recusa o segundo desfazer do mesmo toque", async () => {
    const a = "00000000-0000-7000-8000-0000000000b1";
    const b = "00000000-0000-7000-8000-0000000000b2";
    const c = "00000000-0000-7000-8000-0000000000b3";
    await pg.exec(registro(a));
    await pg.exec(registro(b));
    await pg.exec(
      registro(c, { natureza: "'ajuste'", quantidade: "-1", placas: "-1", ciclos: "-2" }),
    );
    // Mesmo id de novo com on conflict: continua uma linha só.
    await pg.exec(`${registro(a)} on conflict (id) do nothing`);

    const linha = await um<{ quantidade: number; placas: number; ciclos: number; teve_correcao: boolean }>(
      "select quantidade::int, placas::int, ciclos::int, teve_correcao from v_producao_dia where setor_id = 'inj' and tipo = 'inj_boa2'",
    );
    expect(linha).toEqual({ quantidade: 1, placas: 1, ciclos: 2, teve_correcao: true });

    const desfazer = (id: string) =>
      registro(id, {
        natureza: "'desfazer'",
        quantidade: "-1",
        placas: "-1",
        ciclos: "-2",
        estorna: `'${a}'`,
      });
    await pg.exec(desfazer("00000000-0000-7000-8000-0000000000b4"));
    await recusa(desfazer("00000000-0000-7000-8000-0000000000b5"), "registro_producao_desfazer_idx");
  });
});

describe("restrições de pausas, metas e estoque", () => {
  it("recusa uma segunda pausa aberta no setor (SCRUM-47)", async () => {
    const pausa = (id: string) => `insert into pausa (id, setor_id, dia, jornada_id, inicio, origem)
      values ('${id}', 'inj', '2026-11-25', '${jornadaInj}', '2026-11-25T11:00:00Z', 'operador')`;
    await pg.exec("begin");
    try {
      await pg.exec(pausa("00000000-0000-7000-8000-0000000000c1"));
      await expect(pg.exec(pausa("00000000-0000-7000-8000-0000000000c2"))).rejects.toThrow(
        "pausa_aberta_idx",
      );
    } finally {
      await pg.exec("rollback");
    }
  });

  it("recusa meta menor que 10 e dias úteis fora de 1 a 31 (SCRUM-51)", async () => {
    await recusa(
      "insert into meta_setor (setor_id, placas_dia, vigente_de) values ('inj', 9, '2026-11-10')",
      "meta_setor_placas_dia_check",
    );
    await recusa(
      "insert into calendario_mes (ano, mes, dias_uteis) values (2026, 12, 32)",
      "calendario_mes_dias_uteis_check",
    );
  });

  it("recusa ajuste de estoque sem motivo e entrada sem pacote (SCRUM-58)", async () => {
    await recusa(
      "insert into estoque_movimento (tipo, medida_id, pacotes, placas, ocorrido_em) values ('ajuste', 2, 5, 50, now())",
      "estoque_movimento_motivo_check",
    );
    await recusa(
      "insert into estoque_movimento (tipo, medida_id, pacotes, placas, ocorrido_em) values ('entrada', 2, 1, 10, now())",
      "estoque_movimento_entrada_check",
    );
  });

  it("numera as OP em sequência começando em 1", async () => {
    const { id: admin } = await um<{ id: string }>("select id from usuario limit 1");
    await pg.exec("begin");
    try {
      const { numero } = await um<{ numero: number }>(
        `insert into ordem_producao (medida_id, pacotes_pedidos, criada_por)
         values (2, 10, '${admin}') returning numero`,
      );
      expect(numero).toBe(1);
    } finally {
      await pg.exec("rollback");
    }
  });

  it("recusa pulso repetido do mesmo botão, ligação e sequência (SCRUM-88)", async () => {
    const { id: admin } = await um<{ id: string }>("select id from usuario limit 1");
    await pg.exec("begin");
    try {
      const { id: botao } = await um<{ id: string }>(
        `insert into botao_esp32 (nome, criado_por) values ('TESTE botão', '${admin}') returning id`,
      );
      const pulso = `insert into pulso_esp32 (botao_id, boot_id, seq, ocorrido_em, resultado)
        values ('${botao}', 3000000000, 1, now(), 'mesa_pendente')`;
      await pg.exec(pulso);
      await expect(pg.exec(pulso)).rejects.toThrow("pulso_esp32_botao_id_boot_id_seq_unique");
    } finally {
      await pg.exec("rollback");
    }
  });

  it("aceita uma entrada de estoque por pacote, e só uma (SCRUM-58)", async () => {
    await pg.exec("begin");
    try {
      const { id: jornada } = await um<{ id: string }>(
        "insert into jornada (setor_id, dia) values ('tes', '2026-11-25') returning id",
      );
      const lote = "00000000-0000-7000-8000-0000000000d1";
      const pacote = "00000000-0000-7000-8000-0000000000d2";
      await pg.exec(`
        insert into lote (id, setor_id, jornada_id, dia, medida_id, sequencia, aberto_em)
        values ('${lote}', 'tes', '${jornada}', '2026-11-25', 3, 1, now());
        insert into registro_producao
          (id, setor_id, dia, jornada_id, lote_id, tipo, natureza, quantidade, placas,
           medida_id, origem, tablet_id, ocorrido_em)
        values ('${pacote}', 'tes', '2026-11-25', '${jornada}', '${lote}', 'tes_pacote', 'toque',
                1, 8, 3, 'tablet', '${tabletTes}', now())`);
      const entrada = `insert into estoque_movimento (tipo, medida_id, pacotes, placas, registro_id, tablet_id, ocorrido_em)
        values ('entrada', 3, 1, 8, '${pacote}', '${tabletTes}', now())`;
      await pg.exec(entrada);
      await expect(pg.exec(entrada)).rejects.toThrow("estoque_movimento_registro_id_idx");
    } finally {
      await pg.exec("rollback");
    }
  });
});
