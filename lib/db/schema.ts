// Schema completo do AquaPulse (mapa em docs/banco.md). Nada se apaga: toda chave estrangeira é ON DELETE RESTRICT.
// Todo pgEnum precisa de `export`, senão o drizzle-kit não o inclui na migration.
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  pgView,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// Todos foram criados na migration 0001.
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
    tabletId: uuid("tablet_id").references((): AnyPgColumn => tablet.id, {
      onDelete: "restrict",
    }),
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

// ---------------------------------------------------------------------------
// Tablets
// ---------------------------------------------------------------------------

/** Cadastro de um tablet da fábrica. Não se exclui: arquiva. */
export const tablet = pgTable(
  "tablet",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Aparece nos históricos como origem dos registros. */
    nome: text("nome").notNull(),
    modo: modoTablet("modo").notNull().default("setor"),
    /** Obrigatório no modo `setor`. */
    setorId: text("setor_id").references(() => setor.id, {
      onDelete: "restrict",
    }),
    /** O que se digita no aparelho para vincular (`TAB-MONT-01`). */
    codigo: text("codigo").notNull().unique(),
    /** Número do código: sequência global, nunca reaproveitada. */
    codigoSeq: integer("codigo_seq").notNull().unique(),
    codigoGeradoEm: instante("codigo_gerado_em").notNull().defaultNow(),
    criadoPor: uuid("criado_por")
      .notNull()
      .references(() => usuario.id, { onDelete: "restrict" }),
    criadoEm: instante("criado_em").notNull().defaultNow(),
    arquivadoEm: instante("arquivado_em"),
  },
  (t) => [
    uniqueIndex("tablet_nome_ativo_idx")
      .on(sql`lower(${t.nome})`)
      .where(sql`${t.arquivadoEm} is null`),
    index("tablet_setor_id_idx").on(t.setorId),
    check(
      "tablet_setor_id_check",
      sql`${t.modo} <> 'setor' or ${t.setorId} is not null`,
    ),
  ],
);

/** Histórico dos aparelhos vinculados a cada cadastro. */
export const tabletVinculo = pgTable(
  "tablet_vinculo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tabletId: uuid("tablet_id")
      .notNull()
      .references(() => tablet.id, { onDelete: "restrict" }),
    /** SHA-256 do token; o token em claro só existe no aparelho. */
    tokenHash: text("token_hash").notNull().unique(),
    vinculadoEm: instante("vinculado_em").notNull().defaultNow(),
    vinculadoPor: uuid("vinculado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    userAgent: text("user_agent"),
    appVersao: text("app_versao"),
    ultimoAcessoEm: instante("ultimo_acesso_em"),
    /** Nulo = vínculo ativo. */
    revogadoEm: instante("revogado_em"),
    revogadoMotivo: motivoRevogacao("revogado_motivo"),
  },
  (t) => [
    // Um aparelho ativo por cadastro.
    uniqueIndex("tablet_vinculo_ativo_idx")
      .on(t.tabletId)
      .where(sql`${t.revogadoEm} is null`),
  ],
);

/** Evento (só INSERT): cada item recebido da fila de um tablet. */
export const operacaoTablet = pgTable(
  "operacao_tablet",
  {
    /** Id do item, gerado no aparelho. */
    id: uuid("id").primaryKey(),
    tabletId: uuid("tablet_id")
      .notNull()
      .references(() => tablet.id, { onDelete: "restrict" }),
    vinculoId: uuid("vinculo_id")
      .notNull()
      .references(() => tabletVinculo.id, { onDelete: "restrict" }),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    // `tipo`, `seq` e `ocorrido_em` vêm do aparelho e aceitam nulo: um item
    // malformado também fica guardado.
    tipo: text("tipo"),
    seq: bigint("seq", { mode: "number" }),
    ocorridoEm: instante("ocorrido_em"),
    recebidoEm: instante("recebido_em").notNull().defaultNow(),
    resultado: resultadoOperacao("resultado").notNull(),
    motivoRejeicao: text("motivo_rejeicao"),
    /** O item como chegou. */
    payload: jsonb("payload").notNull(),
    resolvidaEm: instante("resolvida_em"),
    resolvidaPor: uuid("resolvida_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [
    index("operacao_tablet_tablet_id_recebido_em_idx").on(
      t.tabletId,
      t.recebidoEm.desc().nullsFirst(),
    ),
    index("operacao_tablet_rejeitada_pendente_idx")
      .on(t.resultado)
      .where(sql`${t.resultado} = 'rejeitada' and ${t.resolvidaEm} is null`),
  ],
);

// ---------------------------------------------------------------------------
// Produção: dia, lote, mesas e o livro-razão (SCRUM-37)
// ---------------------------------------------------------------------------

/** Estado: o dia de um setor. Nasce no primeiro registro ou num lançamento do RH. */
export const jornada = pgTable(
  "jornada",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    /** Dia civil em America/Sao_Paulo, calculado no servidor. */
    dia: date("dia").notNull(),
    /** Hora do primeiro registro; nulo em lançamento sem horário. */
    abertaEm: instante("aberta_em"),
    /** Nulo = dia em andamento (ou reaberto). */
    fechadaEm: instante("fechada_em"),
    fechamento: fechamentoJornada("fechamento"),
    fechadaPorTabletId: uuid("fechada_por_tablet_id").references(
      () => tablet.id,
      { onDelete: "restrict" },
    ),
    fechadaPorUsuarioId: uuid("fechada_por_usuario_id").references(
      () => usuario.id,
      { onDelete: "restrict" },
    ),
    /** Fechou com total zero: alerta "revisar fechamento". */
    fechadaComZero: boolean("fechada_com_zero").notNull().default(false),
    revisadaEm: instante("revisada_em"),
    revisadaPor: uuid("revisada_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    origem: origemRegistro("origem").notNull().default("tablet"),
    /** Lançamento do RH sem início/fim: esconder ritmo e placas/hora. */
    semHorario: boolean("sem_horario").notNull().default(false),
    /** "3 operadoras" quando o RH lança a Montagem sem divisão por pessoa. */
    operadorasInformadas: smallint("operadoras_informadas"),
  },
  (t) => [
    unique("jornada_setor_id_dia_unique").on(t.setorId, t.dia),
    check(
      "jornada_fechamento_check",
      sql`(${t.fechadaEm} is null) = (${t.fechamento} is null)`,
    ),
    check(
      "jornada_operadoras_informadas_check",
      sql`${t.operadorasInformadas} is null or ${t.operadorasInformadas} > 0`,
    ),
  ],
);

/** Estado: o lote da Injetora e o "pacote atual" do Teste & Embalagem. */
export const lote = pgTable(
  "lote",
  {
    /** Gerado no tablet (UUID v7): é a chave de idempotência. */
    id: uuid("id").primaryKey(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    jornadaId: uuid("jornada_id")
      .notNull()
      .references(() => jornada.id, { onDelete: "restrict" }),
    /** Lote não cruza dia. */
    dia: date("dia").notNull(),
    /** Travada: trocar de medida fecha o lote. */
    medidaId: smallint("medida_id")
      .notNull()
      .references(() => medida.id, { onDelete: "restrict" }),
    /** Ordem no dia ("Lotes hoje"). */
    sequencia: smallint("sequencia").notNull(),
    abertoEm: instante("aberto_em").notNull(),
    fechadoEm: instante("fechado_em"),
    motivoFechamento: motivoFechamentoLote("motivo_fechamento"),
    abertoPorTabletId: uuid("aberto_por_tablet_id").references(
      () => tablet.id,
      { onDelete: "restrict" },
    ),
    fechadoPorTabletId: uuid("fechado_por_tablet_id").references(
      () => tablet.id,
      { onDelete: "restrict" },
    ),
  },
  (t) => [
    // Sempre existe no máximo um lote aberto por setor.
    uniqueIndex("lote_aberto_idx")
      .on(t.setorId)
      .where(sql`${t.fechadoEm} is null`),
    index("lote_setor_id_dia_idx").on(t.setorId, t.dia),
    check("lote_setor_id_check", sql`${t.setorId} in ('inj', 'tes')`),
    check("lote_sequencia_check", sql`${t.sequencia} >= 1`),
    check(
      "lote_fechamento_check",
      sql`(${t.fechadoEm} is null) = (${t.motivoFechamento} is null)`,
    ),
    check(
      "lote_fechado_em_check",
      sql`${t.fechadoEm} is null or ${t.fechadoEm} >= ${t.abertoEm}`,
    ),
  ],
);

/** Cadastro: operadora da Montagem. Remover = desativar e soltar das mesas. */
export const operadora = pgTable(
  "operadora",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    ativa: boolean("ativa").notNull().default(true),
    criadaEm: instante("criada_em").notNull().defaultNow(),
    desativadaEm: instante("desativada_em"),
  },
  (t) => [
    uniqueIndex("operadora_nome_ativa_idx")
      .on(sql`lower(${t.nome})`)
      .where(sql`${t.ativa}`),
    check("operadora_nome_check", sql`btrim(${t.nome}) <> ''`),
  ],
);

/** Cadastro: mesa da Montagem, com a operadora e a medida atuais. */
export const mesa = pgTable(
  "mesa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    numero: smallint("numero").notNull().unique(),
    operadoraId: uuid("operadora_id").references(() => operadora.id, {
      onDelete: "restrict",
    }),
    medidaId: smallint("medida_id").references(() => medida.id, {
      onDelete: "restrict",
    }),
    ativa: boolean("ativa").notNull().default(true),
    configAlteradaEm: instante("config_alterada_em").notNull().defaultNow(),
  },
  (t) => [check("mesa_numero_check", sql`${t.numero} >= 1`)],
);

/** Evento: cabeçalho de uma correção ou de um lançamento feito pelo RH. */
export const correcaoRegistro = pgTable(
  "correcao_registro",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** `correcao` ou `lancamento`. */
    tipo: text("tipo").notNull(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    dia: date("dia").notNull(),
    jornadaId: uuid("jornada_id")
      .notNull()
      .references(() => jornada.id, { onDelete: "restrict" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuario.id, { onDelete: "restrict" }),
    motivo: text("motivo").notNull(),
    /** Totais e horários do dia antes e depois. */
    antes: jsonb("antes"),
    depois: jsonb("depois"),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    index("correcao_registro_setor_id_dia_idx").on(t.setorId, t.dia),
    check(
      "correcao_registro_tipo_check",
      sql`${t.tipo} in ('correcao', 'lancamento')`,
    ),
    check("correcao_registro_motivo_check", sql`btrim(${t.motivo}) <> ''`),
  ],
);

/**
 * Evento (só INSERT): o livro-razão da produção. "−1", "Desfazer", correção e
 * lançamento são linhas novas; nada é alterado nem apagado.
 */
export const registroProducao = pgTable(
  "registro_producao",
  {
    /** Gerado no tablet (toque) ou no servidor (botão e RH): chave de idempotência. */
    id: uuid("id").primaryKey(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    /** Dia civil em America/Sao_Paulo, calculado no servidor. */
    dia: date("dia").notNull(),
    jornadaId: uuid("jornada_id")
      .notNull()
      .references(() => jornada.id, { onDelete: "restrict" }),
    loteId: uuid("lote_id").references(() => lote.id, {
      onDelete: "restrict",
    }),
    tipo: tipoRegistro("tipo").notNull(),
    natureza: naturezaRegistro("natureza").notNull(),
    /** +1 / −1 no tablet; ±N em correção ou lançamento. */
    quantidade: integer("quantidade").notNull(),
    /** Placas que contam para a unidade do setor (pacote = quantidade × placas do pacote). */
    placas: integer("placas").notNull(),
    /** Ciclos da Injetora, copiados no toque: mudar a regra não muda o passado. */
    ciclos: integer("ciclos").notNull().default(0),
    /** Medida vigente no toque. */
    medidaId: smallint("medida_id")
      .notNull()
      .references(() => medida.id, { onDelete: "restrict" }),
    /** Só Montagem: cópia da mesa e da operadora do momento. */
    mesaId: uuid("mesa_id").references(() => mesa.id, {
      onDelete: "restrict",
    }),
    operadoraId: uuid("operadora_id").references(() => operadora.id, {
      onDelete: "restrict",
    }),
    origem: origemRegistro("origem").notNull(),
    tabletId: uuid("tablet_id").references(() => tablet.id, {
      onDelete: "restrict",
    }),
    botaoId: uuid("botao_id").references(() => botaoEsp32.id, {
      onDelete: "restrict",
    }),
    usuarioId: uuid("usuario_id").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    /** "Desfazer" aponta o toque desfeito; "−1 pacote" aponta o pacote estornado. */
    estornaId: uuid("estorna_id").references(
      (): AnyPgColumn => registroProducao.id,
      { onDelete: "restrict" },
    ),
    correcaoId: uuid("correcao_id").references(() => correcaoRegistro.id, {
      onDelete: "restrict",
    }),
    /** Hora do toque no aparelho (já corrigida pelo desvio do relógio). */
    ocorridoEm: instante("ocorrido_em").notNull(),
    recebidoEm: instante("recebido_em").notNull().defaultNow(),
    desvioRelogioMs: integer("desvio_relogio_ms"),
  },
  (t) => [
    index("registro_producao_setor_id_dia_idx").on(t.setorId, t.dia),
    index("registro_producao_setor_id_ocorrido_em_idx").on(
      t.setorId,
      t.ocorridoEm.desc().nullsFirst(),
    ),
    index("registro_producao_lote_id_idx").on(t.loteId),
    index("registro_producao_mesa_id_dia_idx")
      .on(t.mesaId, t.dia)
      .where(sql`${t.setorId} = 'mon'`),
    index("registro_producao_operadora_id_dia_idx")
      .on(t.operadoraId, t.dia)
      .where(sql`${t.setorId} = 'mon'`),
    // Um toque só pode ser desfeito uma vez.
    uniqueIndex("registro_producao_desfazer_idx")
      .on(t.estornaId)
      .where(sql`${t.natureza} = 'desfazer'`),
    index("registro_producao_correcao_id_idx")
      .on(t.correcaoId)
      .where(sql`${t.correcaoId} is not null`),
    index("registro_producao_tablet_id_recebido_em_idx").on(
      t.tabletId,
      t.recebidoEm.desc().nullsFirst(),
    ),
    check("registro_producao_quantidade_check", sql`${t.quantidade} <> 0`),
    // O tipo é do setor: inj_* na Injetora, mon_placa na Montagem, tes_* no Teste.
    check(
      "registro_producao_tipo_setor_check",
      sql`(${t.setorId} = 'inj' and left(${t.tipo}::text, 4) = 'inj_')
        or (${t.setorId} = 'mon' and ${t.tipo} = 'mon_placa')
        or (${t.setorId} = 'tes' and left(${t.tipo}::text, 4) = 'tes_')`,
    ),
    check(
      "registro_producao_lote_id_check",
      sql`${t.loteId} is not null or ${t.origem} <> 'tablet' or ${t.setorId} = 'mon'`,
    ),
    check(
      "registro_producao_montagem_check",
      sql`${t.setorId} = 'mon' or (${t.mesaId} is null and ${t.operadoraId} is null)`,
    ),
    check(
      "registro_producao_origem_check",
      sql`(${t.origem} <> 'tablet' or ${t.tabletId} is not null)
        and (${t.origem} <> 'esp32' or ${t.botaoId} is not null)
        and (${t.origem} <> 'rh' or ${t.usuarioId} is not null)`,
    ),
    check(
      "registro_producao_desfazer_check",
      sql`${t.natureza} <> 'desfazer' or ${t.estornaId} is not null`,
    ),
    check(
      "registro_producao_correcao_check",
      sql`${t.natureza} not in ('correcao', 'lancamento') or ${t.correcaoId} is not null`,
    ),
  ],
);

/** Soma por setor, dia, medida e tipo: a fonte única de toda tela com número. */
export const vProducaoDia = pgView("v_producao_dia", {
  setorId: text("setor_id").notNull(),
  dia: date("dia").notNull(),
  medidaId: smallint("medida_id").notNull(),
  tipo: tipoRegistro("tipo").notNull(),
  quantidade: bigint("quantidade", { mode: "number" }).notNull(),
  placas: bigint("placas", { mode: "number" }).notNull(),
  ciclos: bigint("ciclos", { mode: "number" }).notNull(),
  primeiroEm: instante("primeiro_em").notNull(),
  ultimoEm: instante("ultimo_em").notNull(),
  teveCorrecao: boolean("teve_correcao").notNull(),
}).as(sql`
  select setor_id, dia, medida_id, tipo,
         sum(quantidade) as quantidade,
         sum(placas) as placas,
         sum(ciclos) as ciclos,
         min(ocorrido_em) as primeiro_em,
         max(ocorrido_em) as ultimo_em,
         bool_or(natureza in ('ajuste', 'desfazer', 'correcao')) as teve_correcao
  from registro_producao
  group by setor_id, dia, medida_id, tipo
`);

/** Soma da Montagem por dia, operadora, mesa e medida. */
export const vMontagemDia = pgView("v_montagem_dia", {
  dia: date("dia").notNull(),
  operadoraId: uuid("operadora_id"),
  mesaId: uuid("mesa_id"),
  medidaId: smallint("medida_id").notNull(),
  placas: bigint("placas", { mode: "number" }).notNull(),
  ultimoEm: instante("ultimo_em").notNull(),
}).as(sql`
  select dia, operadora_id, mesa_id, medida_id,
         sum(placas) as placas,
         max(ocorrido_em) as ultimo_em
  from registro_producao
  where setor_id = 'mon'
  group by dia, operadora_id, mesa_id, medida_id
`);

// ---------------------------------------------------------------------------
// Pausas (SCRUM-47)
// ---------------------------------------------------------------------------

/** Cadastro fixo (seed, 7 linhas): o 1º passo do "Por que parou?". */
export const pausaCategoria = pgTable("pausa_categoria", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  /** Pergunta do 2º passo; nula em `outro`. */
  pergunta: text("pergunta"),
  cor: text("cor").notNull(),
  icone: text("icone").notNull(),
  /** Só Refeição é planejada: fica fora do tempo parado. */
  planejada: boolean("planejada").notNull().default(false),
  ordem: smallint("ordem").notNull(),
  ativa: boolean("ativa").notNull().default(true),
});

/** Cadastro: motivo do 2º passo. Desativar não apaga o histórico. */
export const pausaMotivo = pgTable(
  "pausa_motivo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoriaId: text("categoria_id")
      .notNull()
      .references(() => pausaCategoria.id, { onDelete: "restrict" }),
    /** Nulo = vale para os três setores. */
    setorId: text("setor_id").references(() => setor.id, {
      onDelete: "restrict",
    }),
    nome: text("nome").notNull(),
    ordem: smallint("ordem").notNull(),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    index("pausa_motivo_categoria_id_setor_id_ordem_idx").on(
      t.categoriaId,
      t.setorId,
      t.ordem,
    ),
    // O mesmo nome não se repete entre os motivos ativos da categoria e do setor.
    uniqueIndex("pausa_motivo_nome_ativo_idx")
      .on(t.categoriaId, sql`coalesce(${t.setorId}, '*')`, sql`lower(${t.nome})`)
      .where(sql`${t.ativo}`),
    check("pausa_motivo_nome_check", sql`btrim(${t.nome}) <> ''`),
  ],
);

/** Estado: pausa do setor inteiro. Categoria e motivo nulos = "Sem motivo". */
export const pausa = pgTable(
  "pausa",
  {
    /** Gerado no tablet (ou no servidor, quando ele fecha uma lacuna). */
    id: uuid("id").primaryKey(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    dia: date("dia").notNull(),
    jornadaId: uuid("jornada_id")
      .notNull()
      .references(() => jornada.id, { onDelete: "restrict" }),
    /** Manual: hora do toque; aviso: hora da última atividade (retroativa). */
    inicio: instante("inicio").notNull(),
    /** Nulo = em andamento. */
    fim: instante("fim"),
    origem: origemPausa("origem").notNull(),
    categoriaId: text("categoria_id").references(() => pausaCategoria.id, {
      onDelete: "restrict",
    }),
    motivoId: uuid("motivo_id").references(() => pausaMotivo.id, {
      onDelete: "restrict",
    }),
    /** Cópia do nome do motivo: renomear ou desativar não muda o histórico. */
    motivoTexto: text("motivo_texto"),
    /** Cópia de `pausa_categoria.planejada` no momento. */
    planejada: boolean("planejada").notNull().default(false),
    /** Texto do operador. */
    descricao: text("descricao"),
    /** Quando o aviso apareceu (início + minutos do aviso). */
    avisoEm: instante("aviso_em"),
    respondidaEm: instante("respondida_em"),
    encerradaPor: encerramentoPausa("encerrada_por"),
    tabletId: uuid("tablet_id").references(() => tablet.id, {
      onDelete: "restrict",
    }),
    classificadaPor: uuid("classificada_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    classificadaEm: instante("classificada_em"),
    /** Soma-se à descrição do operador, não substitui. */
    descricaoRh: text("descricao_rh"),
  },
  (t) => [
    // Uma pausa aberta por setor.
    uniqueIndex("pausa_aberta_idx")
      .on(t.setorId)
      .where(sql`${t.fim} is null`),
    index("pausa_setor_id_dia_idx").on(t.setorId, t.dia),
    index("pausa_setor_id_inicio_idx").on(t.setorId, t.inicio),
    index("pausa_categoria_id_dia_idx").on(t.categoriaId, t.dia),
    check(
      "pausa_fim_check",
      sql`${t.fim} is null or ${t.fim} >= ${t.inicio}`,
    ),
    check(
      "pausa_encerrada_por_check",
      sql`(${t.fim} is null) = (${t.encerradaPor} is null)`,
    ),
    check(
      "pausa_motivo_check",
      sql`${t.motivoId} is null or ${t.categoriaId} is not null`,
    ),
  ],
);

/** Evento: cada "Não parou" do aviso de parada. */
export const avisoDispensado = pgTable(
  "aviso_dispensado",
  {
    /** Gerado no tablet. */
    id: uuid("id").primaryKey(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    tabletId: uuid("tablet_id").references(() => tablet.id, {
      onDelete: "restrict",
    }),
    ultimoRegistroEm: instante("ultimo_registro_em"),
    avisoEm: instante("aviso_em").notNull(),
    dispensadoEm: instante("dispensado_em").notNull(),
  },
  (t) => [
    index("aviso_dispensado_setor_id_dispensado_em_idx").on(
      t.setorId,
      t.dispensadoEm.desc().nullsFirst(),
    ),
  ],
);

// ---------------------------------------------------------------------------
// Metas (SCRUM-51)
// ---------------------------------------------------------------------------

/**
 * Configuração com vigência: a meta de um dia é a linha com maior
 * `vigente_de` ≤ dia. Linha antiga nunca é alterada.
 */
export const metaSetor = pgTable(
  "meta_setor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    setorId: text("setor_id")
      .notNull()
      .references(() => setor.id, { onDelete: "restrict" }),
    placasDia: integer("placas_dia").notNull(),
    vigenteDe: date("vigente_de").notNull(),
    criadoPor: uuid("criado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    unique("meta_setor_setor_id_vigente_de_unique").on(t.setorId, t.vigenteDe),
    check("meta_setor_placas_dia_check", sql`${t.placasDia} >= 10`),
  ],
);

/** "Meta por tamanho · opcional": guardada, fora das contas. */
export const metaMedida = pgTable(
  "meta_medida",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    medidaId: smallint("medida_id")
      .notNull()
      .references(() => medida.id, { onDelete: "restrict" }),
    /** Nulo = sem meta. */
    placasDia: integer("placas_dia"),
    vigenteDe: date("vigente_de").notNull(),
    criadoPor: uuid("criado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    unique("meta_medida_medida_id_vigente_de_unique").on(
      t.medidaId,
      t.vigenteDe,
    ),
    check(
      "meta_medida_placas_dia_check",
      sql`${t.placasDia} is null or ${t.placasDia} > 0`,
    ),
  ],
);

/** Dias úteis de cada mês. Mês sem linha: o servidor cria com seg. a sex. */
export const calendarioMes = pgTable(
  "calendario_mes",
  {
    ano: smallint("ano").notNull(),
    mes: smallint("mes").notNull(),
    diasUteis: smallint("dias_uteis").notNull(),
    atualizadoPor: uuid("atualizado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    atualizadoEm: instante("atualizado_em").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.ano, t.mes] }),
    check("calendario_mes_mes_check", sql`${t.mes} between 1 and 12`),
    check(
      "calendario_mes_dias_uteis_check",
      sql`${t.diasUteis} between 1 and 31`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Estoque e Ordens de Produção (SCRUM-58)
// ---------------------------------------------------------------------------

/** Cadastro com ciclo de vida. Uma OP = uma medida. Nunca se exclui: cancela. */
export const ordemProducao = pgTable(
  "ordem_producao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Exibido como `OP-00015`. Valor inicial ajustável com `alter ... restart`. */
    numero: integer("numero")
      .notNull()
      .unique()
      .generatedByDefaultAsIdentity({ startWith: 1 }),
    /** Texto livre; nulo = "Sem cliente". */
    cliente: text("cliente"),
    medidaId: smallint("medida_id")
      .notNull()
      .references(() => medida.id, { onDelete: "restrict" }),
    pacotesPedidos: integer("pacotes_pedidos").notNull(),
    dataEntrega: date("data_entrega"),
    observacao: text("observacao"),
    estado: estadoOp("estado").notNull().default("aberta"),
    /** Contadores mantidos na transação do movimento (atendidos = reservados + expedidos). */
    pacotesReservados: integer("pacotes_reservados").notNull().default(0),
    pacotesExpedidos: integer("pacotes_expedidos").notNull().default(0),
    criadaPor: uuid("criada_por")
      .notNull()
      .references(() => usuario.id, { onDelete: "restrict" }),
    criadaEm: instante("criada_em").notNull().defaultNow(),
    expedidaEm: instante("expedida_em"),
    canceladaEm: instante("cancelada_em"),
  },
  (t) => [
    index("ordem_producao_estado_data_entrega_idx").on(
      t.estado,
      t.dataEntrega,
    ),
    index("ordem_producao_medida_id_idx").on(t.medidaId),
    check(
      "ordem_producao_pacotes_pedidos_check",
      sql`${t.pacotesPedidos} > 0`,
    ),
    check(
      "ordem_producao_contadores_check",
      sql`${t.pacotesReservados} >= 0 and ${t.pacotesExpedidos} >= 0`,
    ),
    check(
      "ordem_producao_cancelada_check",
      sql`(${t.estado} = 'cancelada') = (${t.canceladaEm} is not null)`,
    ),
  ],
);

/** Evento: linha do tempo da OP. */
export const opEvento = pgTable(
  "op_evento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    opId: uuid("op_id")
      .notNull()
      .references(() => ordemProducao.id, { onDelete: "restrict" }),
    tipo: tipoOpEvento("tipo").notNull(),
    pacotes: integer("pacotes"),
    /** Nulo = reserva automática. */
    usuarioId: uuid("usuario_id").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    detalhe: jsonb("detalhe"),
    ocorridoEm: instante("ocorrido_em").notNull().defaultNow(),
  },
  (t) => [index("op_evento_op_id_ocorrido_em_idx").on(t.opId, t.ocorridoEm)],
);

/**
 * Evento: razão do estoque, em pacotes. Físico = Σ pacotes; reservado =
 * Σ reservado; disponível = físico − reservado.
 */
export const estoqueMovimento = pgTable(
  "estoque_movimento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: tipoMovimento("tipo").notNull(),
    medidaId: smallint("medida_id")
      .notNull()
      .references(() => medida.id, { onDelete: "restrict" }),
    /** Efeito no estoque físico (+ entrada, − expedição, ± ajuste, 0 em reserva). */
    pacotes: integer("pacotes").notNull(),
    /** Placas correspondentes (soma real, não pacotes × 10). */
    placas: integer("placas").notNull(),
    /** Efeito no reservado (+ reserva, − liberação, − expedição). */
    reservado: integer("reservado").notNull().default(0),
    opId: uuid("op_id").references(() => ordemProducao.id, {
      onDelete: "restrict",
    }),
    /** Entrada gerada por um pacote do Teste (ou pela correção dele). */
    registroId: uuid("registro_id").references(() => registroProducao.id, {
      onDelete: "restrict",
    }),
    usuarioId: uuid("usuario_id").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    tabletId: uuid("tablet_id").references(() => tablet.id, {
      onDelete: "restrict",
    }),
    motivo: text("motivo"),
    ocorridoEm: instante("ocorrido_em").notNull(),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    index("estoque_movimento_medida_id_ocorrido_em_idx").on(
      t.medidaId,
      t.ocorridoEm.desc().nullsFirst(),
    ),
    // Idempotência da entrada: um pacote gera uma entrada só.
    uniqueIndex("estoque_movimento_registro_id_idx")
      .on(t.registroId)
      .where(sql`${t.registroId} is not null`),
    index("estoque_movimento_op_id_idx").on(t.opId),
    check(
      "estoque_movimento_motivo_check",
      sql`${t.tipo} not in ('ajuste', 'saldo_inicial') or btrim(coalesce(${t.motivo}, '')) <> ''`,
    ),
    check(
      "estoque_movimento_entrada_check",
      sql`${t.tipo} <> 'entrada' or (${t.registroId} is not null and ${t.reservado} = 0)`,
    ),
    check(
      "estoque_movimento_op_id_check",
      sql`${t.tipo} not in ('reserva', 'liberacao', 'expedicao') or ${t.opId} is not null`,
    ),
    check(
      "estoque_movimento_reserva_check",
      sql`${t.tipo} not in ('reserva', 'liberacao') or ${t.pacotes} = 0`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Exportação (SCRUM-81, SCRUM-83, SCRUM-84)
// ---------------------------------------------------------------------------

/** Evento: cada arquivo pedido (painel Exportar, CSV dos históricos, envio mensal). */
export const exportacao = pgTable(
  "exportacao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Nulo no envio mensal e no CSV pedido pelo tablet. */
    usuarioId: uuid("usuario_id").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    /** CSV do histórico pedido no tablet do setor. */
    tabletId: uuid("tablet_id").references(() => tablet.id, {
      onDelete: "restrict",
    }),
    tipo: tipoExportacao("tipo").notNull(),
    formato: formatoExportacao("formato").notNull(),
    periodoDe: date("periodo_de").notNull(),
    periodoAte: date("periodo_ate").notNull(),
    /** Nulo = todas as medidas. */
    medidaId: smallint("medida_id").references(() => medida.id, {
      onDelete: "restrict",
    }),
    setores: text("setores").array().notNull().default(sql`'{}'::text[]`),
    secoes: text("secoes").array().notNull().default(sql`'{}'::text[]`),
    /** `gerando`, `pronto` ou `erro`. */
    status: text("status").notNull().default("gerando"),
    /** Chave no S3 (só PDF; CSV e Excel não são guardados). */
    arquivoChave: text("arquivo_chave"),
    erro: text("erro"),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    index("exportacao_criado_em_idx").on(t.criadoEm.desc().nullsFirst()),
    check(
      "exportacao_status_check",
      sql`${t.status} in ('gerando', 'pronto', 'erro')`,
    ),
    check(
      "exportacao_periodo_check",
      sql`${t.periodoDe} <= ${t.periodoAte}`,
    ),
  ],
);

/** Configuração (uma linha só, id = 1): envio mensal por e-mail. */
export const relatorioAgendado = pgTable(
  "relatorio_agendado",
  {
    id: smallint("id").primaryKey().default(1),
    ativo: boolean("ativo").notNull().default(false),
    destinatarios: text("destinatarios")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    secoes: text("secoes").array().notNull().default(sql`'{}'::text[]`),
    ultimoEnvioEm: instante("ultimo_envio_em"),
    ultimoResultado: text("ultimo_resultado"),
    atualizadoPor: uuid("atualizado_por").references(() => usuario.id, {
      onDelete: "restrict",
    }),
    atualizadoEm: instante("atualizado_em").notNull().defaultNow(),
  },
  (t) => [check("relatorio_agendado_id_check", sql`${t.id} = 1`)],
);

// ---------------------------------------------------------------------------
// Botões ESP32 (SCRUM-88, SCRUM-89)
// ---------------------------------------------------------------------------

/**
 * Cadastro: botão de uma mesa. O token não é guardado: é
 * `<id>.<token_versao>.<HMAC>` assinado com ESP32_PULSO_SEGREDO.
 */
export const botaoEsp32 = pgTable(
  "botao_esp32",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    mesaId: uuid("mesa_id").references(() => mesa.id, {
      onDelete: "restrict",
    }),
    /** Número digitado no cadastro, só informativo ("porta 1"). */
    porta: smallint("porta"),
    /** Sobe ao gerar token novo: o anterior para de valer. */
    tokenVersao: integer("token_versao").notNull().default(1),
    ativo: boolean("ativo").notNull().default(true),
    ultimoHeartbeatEm: instante("ultimo_heartbeat_em"),
    ultimoPulsoEm: instante("ultimo_pulso_em"),
    firmware: text("firmware"),
    rssi: smallint("rssi"),
    criadoPor: uuid("criado_por")
      .notNull()
      .references(() => usuario.id, { onDelete: "restrict" }),
    criadoEm: instante("criado_em").notNull().defaultNow(),
  },
  (t) => [
    // Um botão por mesa.
    uniqueIndex("botao_esp32_mesa_id_idx")
      .on(t.mesaId)
      .where(sql`${t.mesaId} is not null`),
    check("botao_esp32_token_versao_check", sql`${t.tokenVersao} >= 1`),
  ],
);

/** Evento: todo aperto que chega, conte ou não. */
export const pulsoEsp32 = pgTable(
  "pulso_esp32",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    botaoId: uuid("botao_id")
      .notNull()
      .references(() => botaoEsp32.id, { onDelete: "restrict" }),
    /** Número sorteado a cada ligação do ESP32. */
    bootId: bigint("boot_id", { mode: "number" }).notNull(),
    /** Contador do firmware desde a ligação. */
    seq: integer("seq").notNull(),
    /** Recebido − atraso informado pelo botão. */
    ocorridoEm: instante("ocorrido_em").notNull(),
    recebidoEm: instante("recebido_em").notNull().defaultNow(),
    /** Mesa resolvida no momento. */
    mesaId: uuid("mesa_id").references(() => mesa.id, {
      onDelete: "restrict",
    }),
    resultado: resultadoPulso("resultado").notNull(),
    /** O registro de produção, quando contou. */
    registroId: uuid("registro_id").references(() => registroProducao.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [
    // Idempotência do buffer do firmware.
    unique("pulso_esp32_botao_id_boot_id_seq_unique").on(
      t.botaoId,
      t.bootId,
      t.seq,
    ),
    index("pulso_esp32_mesa_id_ocorrido_em_idx").on(
      t.mesaId,
      t.ocorridoEm.desc().nullsFirst(),
    ),
    check(
      "pulso_esp32_registro_id_check",
      sql`(${t.resultado} = 'contou') = (${t.registroId} is not null)`,
    ),
  ],
);
