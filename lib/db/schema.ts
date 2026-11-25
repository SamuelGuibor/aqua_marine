// Schema base do AquaPulse. Nada se apaga: toda chave estrangeira é ON DELETE RESTRICT.
// Todo pgEnum precisa de `export`, senão o drizzle-kit não o inclui na migration.
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// Só `papel_usuario` é usado por coluna nesta migration; os demais já nascem
// aqui para as tabelas dos próximos cards.
// ---------------------------------------------------------------------------

export const papelUsuario = pgEnum("papel_usuario", ["rh", "admin"]);

export const modoTablet = pgEnum("modo_tablet", ["setor", "tv"]);

export const motivoRevogacao = pgEnum("motivo_revogacao", [
  "novo_codigo",
  "desvinculado_admin",
  "usar_outro_id",
  "substituido",
]);

export const tipoRegistro = pgEnum("tipo_registro", [
  "inj_boa2",
  "inj_boa1",
  "inj_vazio",
  "inj_perda_cab_meio",
  "inj_perda_cab_total",
  "inj_perda_can_meio",
  "inj_perda_can_total",
  "mon_placa",
  "tes_pacote",
  "tes_defeito_caninho",
  "tes_defeito_cabecote",
]);

export const naturezaRegistro = pgEnum("natureza_registro", [
  "toque",
  "ajuste",
  "desfazer",
  "correcao",
  "lancamento",
]);

export const origemRegistro = pgEnum("origem_registro", [
  "tablet",
  "esp32",
  "rh",
]);

export const fechamentoJornada = pgEnum("fechamento_jornada", [
  "manual",
  "automatico",
  "rh",
]);

export const motivoFechamentoLote = pgEnum("motivo_fechamento_lote", [
  "manual",
  "troca_medida",
  "fim_do_dia",
  "virada_do_dia",
]);

export const origemPausa = pgEnum("origem_pausa", [
  "operador",
  "aviso_respondido",
  "aviso_sem_resposta",
  "rh",
]);

export const encerramentoPausa = pgEnum("encerramento_pausa", [
  "retomar",
  "contagem",
  "fechamento_dia",
  "rh",
]);

export const estadoOp = pgEnum("estado_op", [
  "aberta",
  "em_producao",
  "concluida",
  "cancelada",
]);

export const tipoOpEvento = pgEnum("tipo_op_evento", [
  "criada",
  "editada",
  "reserva",
  "liberacao",
  "atendida",
  "expedicao",
  "cancelada",
]);

export const tipoMovimento = pgEnum("tipo_movimento", [
  "entrada",
  "reserva",
  "liberacao",
  "expedicao",
  "ajuste",
  "saldo_inicial",
]);

export const resultadoOperacao = pgEnum("resultado_operacao", [
  "aplicada",
  "rejeitada",
]);

export const resultadoPulso = pgEnum("resultado_pulso", [
  "contou",
  "mesa_pendente",
  "duplicado",
  "rapido_demais",
  "botao_inativo",
]);

export const tipoExportacao = pgEnum("tipo_exportacao", [
  "mensal",
  "operadoras",
  "perdas",
  "estoque",
  "fechamentos",
  "historico_setor",
]);

export const formatoExportacao = pgEnum("formato_exportacao", [
  "pdf",
  "xlsx",
  "csv",
]);

const instante = (nome: string) => timestamp(nome, { withTimezone: true });

// ---------------------------------------------------------------------------
// Setores e catálogos
// ---------------------------------------------------------------------------

/** Cadastro fixo, criado pelo seed. */
export const setor = pgTable("setor", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  nomeCurto: text("nome_curto").notNull(),
  descricao: text("descricao").notNull(),
  slug: text("slug").notNull().unique(),
  cor: text("cor").notNull(),
  ordem: smallint("ordem").notNull(),
  /** O que conta para a meta do setor. */
  unidade: text("unidade").notNull(),
});

/** Configuração vigente, uma linha por setor. Alteração é auditada. */
export const setorConfig = pgTable(
  "setor_config",
  {
    setorId: text("setor_id")
      .primaryKey()
      .references(() => setor.id, { onDelete: "restrict" }),
    minutosAvisoParada: smallint("minutos_aviso_parada").notNull(),
    placasPorPacotePadrao: smallint("placas_por_pacote_padrao"),
    placasPorPacoteMin: smallint("placas_por_pacote_min"),
    placasPorPacoteMax: smallint("placas_por_pacote_max"),
    inicioJornada: time("inicio_jornada"),
    /** Nulo = sem fechamento automático. */
    fechamentoAutomatico: time("fechamento_automatico"),
    atualizadoPor: uuid("atualizado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    atualizadoEm: instante("atualizado_em").notNull().defaultNow(),
  },
  (t) => [
    check(
      "setor_config_minutos_aviso_parada_check",
      sql`${t.minutosAvisoParada} between 5 and 60`,
    ),
  ],
);

/** Atalho de leitura do estado atual, atualizado na transação de cada escrita. */
export const setorEstado = pgTable("setor_estado", {
  setorId: text("setor_id")
    .primaryKey()
    .references(() => setor.id, { onDelete: "restrict" }),
  versao: bigint("versao", { mode: "number" }).notNull().default(0),
  ultimoRegistroEm: instante("ultimo_registro_em"),
  ultimaAtividadeEm: instante("ultima_atividade_em"),
  atualizadoEm: instante("atualizado_em").notNull().defaultNow(),
});

export const medida = pgTable("medida", {
  id: smallint("id").primaryKey(),
  comprimentoM: numeric("comprimento_m", {
    precision: 4,
    scale: 2,
    mode: "number",
  })
    .notNull()
    .unique(),
  areaM2: numeric("area_m2", {
    precision: 5,
    scale: 2,
    mode: "number",
  }).notNull(),
  ordem: smallint("ordem").notNull(),
  ativa: boolean("ativa").notNull().default(true),
  estoqueMinimoPacotes: integer("estoque_minimo_pacotes"),
});

// ---------------------------------------------------------------------------
// Acesso e auditoria
// ---------------------------------------------------------------------------

/** Quem entra com senha (RH e Administração). Operador não é usuário. */
export const usuario = pgTable(
  "usuario",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    papel: papelUsuario("papel").notNull(),
    /** argon2id; nunca a senha. */
    senhaHash: text("senha_hash").notNull(),
    /** Sobe ao trocar a senha e derruba as sessões antigas. */
    senhaVersao: integer("senha_versao").notNull().default(1),
    ativo: boolean("ativo").notNull().default(true),
    ultimoAcessoEm: instante("ultimo_acesso_em"),
    criadoEm: instante("criado_em").notNull().defaultNow(),
    criadoPor: uuid("criado_por").references((): AnyPgColumn => usuario.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [index("usuario_ativo_idx").on(t.ativo)],
);

/** Evento: limite de tentativas de login e de vínculo de tablet. */
export const tentativaAcesso = pgTable(
  "tentativa_acesso",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    alvo: text("alvo").notNull(),
    chave: text("chave").notNull(),
    sucesso: boolean("sucesso").notNull(),
    ocorridoEm: instante("ocorrido_em").notNull().defaultNow(),
  },
  (t) => [
    index("tentativa_acesso_alvo_chave_ocorrido_em_idx").on(
      t.alvo,
      t.chave,
      t.ocorridoEm.desc().nullsFirst(),
    ),
  ],
);

/** Evento: auditoria de toda escrita que não seja um toque de produção. */
export const registroAcao = pgTable(
  "registro_acao",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    ocorridoEm: instante("ocorrido_em").notNull().defaultNow(),
    ator: text("ator").notNull(),
    usuarioId: uuid("usuario_id").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    // Sem chave estrangeira por enquanto: a tabela `tablet` e a FK entram na
    // migration 0002 (SCRUM-36).
    tabletId: uuid("tablet_id"),
    acao: text("acao").notNull(),
    entidade: text("entidade"),
    entidadeId: text("entidade_id"),
    antes: jsonb("antes"),
    depois: jsonb("depois"),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [
    index("registro_acao_ocorrido_em_idx").on(t.ocorridoEm.desc().nullsFirst()),
    index("registro_acao_entidade_idx").on(t.entidade, t.entidadeId),
    index("registro_acao_acao_ocorrido_em_idx").on(
      t.acao,
      t.ocorridoEm.desc().nullsFirst(),
    ),
  ],
);
