CREATE TABLE "aviso_dispensado" (
	"id" uuid PRIMARY KEY NOT NULL,
	"setor_id" text NOT NULL,
	"tablet_id" uuid,
	"ultimo_registro_em" timestamp with time zone,
	"aviso_em" timestamp with time zone NOT NULL,
	"dispensado_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "botao_esp32" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"mesa_id" uuid,
	"porta" smallint,
	"token_versao" integer DEFAULT 1 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"ultimo_heartbeat_em" timestamp with time zone,
	"ultimo_pulso_em" timestamp with time zone,
	"firmware" text,
	"rssi" smallint,
	"criado_por" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "botao_esp32_token_versao_check" CHECK ("botao_esp32"."token_versao" >= 1)
);
--> statement-breakpoint
CREATE TABLE "calendario_mes" (
	"ano" smallint NOT NULL,
	"mes" smallint NOT NULL,
	"dias_uteis" smallint NOT NULL,
	"atualizado_por" uuid,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendario_mes_ano_mes_pk" PRIMARY KEY("ano","mes"),
	CONSTRAINT "calendario_mes_mes_check" CHECK ("calendario_mes"."mes" between 1 and 12),
	CONSTRAINT "calendario_mes_dias_uteis_check" CHECK ("calendario_mes"."dias_uteis" between 1 and 31)
);
--> statement-breakpoint
CREATE TABLE "correcao_registro" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"setor_id" text NOT NULL,
	"dia" date NOT NULL,
	"jornada_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"motivo" text NOT NULL,
	"antes" jsonb,
	"depois" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "correcao_registro_tipo_check" CHECK ("correcao_registro"."tipo" in ('correcao', 'lancamento')),
	CONSTRAINT "correcao_registro_motivo_check" CHECK (btrim("correcao_registro"."motivo") <> '')
);
--> statement-breakpoint
CREATE TABLE "estoque_movimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_movimento" NOT NULL,
	"medida_id" smallint NOT NULL,
	"pacotes" integer NOT NULL,
	"placas" integer NOT NULL,
	"reservado" integer DEFAULT 0 NOT NULL,
	"op_id" uuid,
	"registro_id" uuid,
	"usuario_id" uuid,
	"tablet_id" uuid,
	"motivo" text,
	"ocorrido_em" timestamp with time zone NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "estoque_movimento_motivo_check" CHECK ("estoque_movimento"."tipo" not in ('ajuste', 'saldo_inicial') or btrim(coalesce("estoque_movimento"."motivo", '')) <> ''),
	CONSTRAINT "estoque_movimento_entrada_check" CHECK ("estoque_movimento"."tipo" <> 'entrada' or ("estoque_movimento"."registro_id" is not null and "estoque_movimento"."reservado" = 0)),
	CONSTRAINT "estoque_movimento_op_id_check" CHECK ("estoque_movimento"."tipo" not in ('reserva', 'liberacao', 'expedicao') or "estoque_movimento"."op_id" is not null),
	CONSTRAINT "estoque_movimento_reserva_check" CHECK ("estoque_movimento"."tipo" not in ('reserva', 'liberacao') or "estoque_movimento"."pacotes" = 0)
);
--> statement-breakpoint
CREATE TABLE "exportacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"tablet_id" uuid,
	"tipo" "tipo_exportacao" NOT NULL,
	"formato" "formato_exportacao" NOT NULL,
	"periodo_de" date NOT NULL,
	"periodo_ate" date NOT NULL,
	"medida_id" smallint,
	"setores" text[] DEFAULT '{}'::text[] NOT NULL,
	"secoes" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'gerando' NOT NULL,
	"arquivo_chave" text,
	"erro" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exportacao_status_check" CHECK ("exportacao"."status" in ('gerando', 'pronto', 'erro')),
	CONSTRAINT "exportacao_periodo_check" CHECK ("exportacao"."periodo_de" <= "exportacao"."periodo_ate")
);
--> statement-breakpoint
CREATE TABLE "jornada" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setor_id" text NOT NULL,
	"dia" date NOT NULL,
	"aberta_em" timestamp with time zone,
	"fechada_em" timestamp with time zone,
	"fechamento" "fechamento_jornada",
	"fechada_por_tablet_id" uuid,
	"fechada_por_usuario_id" uuid,
	"fechada_com_zero" boolean DEFAULT false NOT NULL,
	"revisada_em" timestamp with time zone,
	"revisada_por" uuid,
	"origem" "origem_registro" DEFAULT 'tablet' NOT NULL,
	"sem_horario" boolean DEFAULT false NOT NULL,
	"operadoras_informadas" smallint,
	CONSTRAINT "jornada_setor_id_dia_unique" UNIQUE("setor_id","dia"),
	CONSTRAINT "jornada_fechamento_check" CHECK (("jornada"."fechada_em" is null) = ("jornada"."fechamento" is null)),
	CONSTRAINT "jornada_operadoras_informadas_check" CHECK ("jornada"."operadoras_informadas" is null or "jornada"."operadoras_informadas" > 0)
);
--> statement-breakpoint
CREATE TABLE "lote" (
	"id" uuid PRIMARY KEY NOT NULL,
	"setor_id" text NOT NULL,
	"jornada_id" uuid NOT NULL,
	"dia" date NOT NULL,
	"medida_id" smallint NOT NULL,
	"sequencia" smallint NOT NULL,
	"aberto_em" timestamp with time zone NOT NULL,
	"fechado_em" timestamp with time zone,
	"motivo_fechamento" "motivo_fechamento_lote",
	"aberto_por_tablet_id" uuid,
	"fechado_por_tablet_id" uuid,
	CONSTRAINT "lote_setor_id_check" CHECK ("lote"."setor_id" in ('inj', 'tes')),
	CONSTRAINT "lote_sequencia_check" CHECK ("lote"."sequencia" >= 1),
	CONSTRAINT "lote_fechamento_check" CHECK (("lote"."fechado_em" is null) = ("lote"."motivo_fechamento" is null)),
	CONSTRAINT "lote_fechado_em_check" CHECK ("lote"."fechado_em" is null or "lote"."fechado_em" >= "lote"."aberto_em")
);
--> statement-breakpoint
CREATE TABLE "mesa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" smallint NOT NULL,
	"operadora_id" uuid,
	"medida_id" smallint,
	"ativa" boolean DEFAULT true NOT NULL,
	"config_alterada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mesa_numero_unique" UNIQUE("numero"),
	CONSTRAINT "mesa_numero_check" CHECK ("mesa"."numero" >= 1)
);
--> statement-breakpoint
CREATE TABLE "meta_medida" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medida_id" smallint NOT NULL,
	"placas_dia" integer,
	"vigente_de" date NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_medida_medida_id_vigente_de_unique" UNIQUE("medida_id","vigente_de"),
	CONSTRAINT "meta_medida_placas_dia_check" CHECK ("meta_medida"."placas_dia" is null or "meta_medida"."placas_dia" > 0)
);
--> statement-breakpoint
CREATE TABLE "meta_setor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setor_id" text NOT NULL,
	"placas_dia" integer NOT NULL,
	"vigente_de" date NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_setor_setor_id_vigente_de_unique" UNIQUE("setor_id","vigente_de"),
	CONSTRAINT "meta_setor_placas_dia_check" CHECK ("meta_setor"."placas_dia" >= 10)
);
--> statement-breakpoint
CREATE TABLE "op_evento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"op_id" uuid NOT NULL,
	"tipo" "tipo_op_evento" NOT NULL,
	"pacotes" integer,
	"usuario_id" uuid,
	"detalhe" jsonb,
	"ocorrido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operadora" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"desativada_em" timestamp with time zone,
	CONSTRAINT "operadora_nome_check" CHECK (btrim("operadora"."nome") <> '')
);
--> statement-breakpoint
CREATE TABLE "ordem_producao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer GENERATED BY DEFAULT AS IDENTITY (sequence name "ordem_producao_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cliente" text,
	"medida_id" smallint NOT NULL,
	"pacotes_pedidos" integer NOT NULL,
	"data_entrega" date,
	"observacao" text,
	"estado" "estado_op" DEFAULT 'aberta' NOT NULL,
	"pacotes_reservados" integer DEFAULT 0 NOT NULL,
	"pacotes_expedidos" integer DEFAULT 0 NOT NULL,
	"criada_por" uuid NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"expedida_em" timestamp with time zone,
	"cancelada_em" timestamp with time zone,
	CONSTRAINT "ordem_producao_numero_unique" UNIQUE("numero"),
	CONSTRAINT "ordem_producao_pacotes_pedidos_check" CHECK ("ordem_producao"."pacotes_pedidos" > 0),
	CONSTRAINT "ordem_producao_contadores_check" CHECK ("ordem_producao"."pacotes_reservados" >= 0 and "ordem_producao"."pacotes_expedidos" >= 0),
	CONSTRAINT "ordem_producao_cancelada_check" CHECK (("ordem_producao"."estado" = 'cancelada') = ("ordem_producao"."cancelada_em" is not null))
);
--> statement-breakpoint
CREATE TABLE "pausa" (
	"id" uuid PRIMARY KEY NOT NULL,
	"setor_id" text NOT NULL,
	"dia" date NOT NULL,
	"jornada_id" uuid NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fim" timestamp with time zone,
	"origem" "origem_pausa" NOT NULL,
	"categoria_id" text,
	"motivo_id" uuid,
	"motivo_texto" text,
	"planejada" boolean DEFAULT false NOT NULL,
	"descricao" text,
	"aviso_em" timestamp with time zone,
	"respondida_em" timestamp with time zone,
	"encerrada_por" "encerramento_pausa",
	"tablet_id" uuid,
	"classificada_por" uuid,
	"classificada_em" timestamp with time zone,
	"descricao_rh" text,
	CONSTRAINT "pausa_fim_check" CHECK ("pausa"."fim" is null or "pausa"."fim" >= "pausa"."inicio"),
	CONSTRAINT "pausa_encerrada_por_check" CHECK (("pausa"."fim" is null) = ("pausa"."encerrada_por" is null)),
	CONSTRAINT "pausa_motivo_check" CHECK ("pausa"."motivo_id" is null or "pausa"."categoria_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "pausa_categoria" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"pergunta" text,
	"cor" text NOT NULL,
	"icone" text NOT NULL,
	"planejada" boolean DEFAULT false NOT NULL,
	"ordem" smallint NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pausa_motivo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoria_id" text NOT NULL,
	"setor_id" text,
	"nome" text NOT NULL,
	"ordem" smallint NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pausa_motivo_nome_check" CHECK (btrim("pausa_motivo"."nome") <> '')
);
--> statement-breakpoint
CREATE TABLE "pulso_esp32" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"botao_id" uuid NOT NULL,
	"boot_id" bigint NOT NULL,
	"seq" integer NOT NULL,
	"ocorrido_em" timestamp with time zone NOT NULL,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"mesa_id" uuid,
	"resultado" "resultado_pulso" NOT NULL,
	"registro_id" uuid,
	CONSTRAINT "pulso_esp32_botao_id_boot_id_seq_unique" UNIQUE("botao_id","boot_id","seq"),
	CONSTRAINT "pulso_esp32_registro_id_check" CHECK (("pulso_esp32"."resultado" = 'contou') = ("pulso_esp32"."registro_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "registro_producao" (
	"id" uuid PRIMARY KEY NOT NULL,
	"setor_id" text NOT NULL,
	"dia" date NOT NULL,
	"jornada_id" uuid NOT NULL,
	"lote_id" uuid,
	"tipo" "tipo_registro" NOT NULL,
	"natureza" "natureza_registro" NOT NULL,
	"quantidade" integer NOT NULL,
	"placas" integer NOT NULL,
	"ciclos" integer DEFAULT 0 NOT NULL,
	"medida_id" smallint NOT NULL,
	"mesa_id" uuid,
	"operadora_id" uuid,
	"origem" "origem_registro" NOT NULL,
	"tablet_id" uuid,
	"botao_id" uuid,
	"usuario_id" uuid,
	"estorna_id" uuid,
	"correcao_id" uuid,
	"ocorrido_em" timestamp with time zone NOT NULL,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"desvio_relogio_ms" integer,
	CONSTRAINT "registro_producao_quantidade_check" CHECK ("registro_producao"."quantidade" <> 0),
	CONSTRAINT "registro_producao_tipo_setor_check" CHECK (("registro_producao"."setor_id" = 'inj' and left("registro_producao"."tipo"::text, 4) = 'inj_')
        or ("registro_producao"."setor_id" = 'mon' and "registro_producao"."tipo" = 'mon_placa')
        or ("registro_producao"."setor_id" = 'tes' and left("registro_producao"."tipo"::text, 4) = 'tes_')),
	CONSTRAINT "registro_producao_lote_id_check" CHECK ("registro_producao"."lote_id" is not null or "registro_producao"."origem" <> 'tablet' or "registro_producao"."setor_id" = 'mon'),
	CONSTRAINT "registro_producao_montagem_check" CHECK ("registro_producao"."setor_id" = 'mon' or ("registro_producao"."mesa_id" is null and "registro_producao"."operadora_id" is null)),
	CONSTRAINT "registro_producao_origem_check" CHECK (("registro_producao"."origem" <> 'tablet' or "registro_producao"."tablet_id" is not null)
        and ("registro_producao"."origem" <> 'esp32' or "registro_producao"."botao_id" is not null)
        and ("registro_producao"."origem" <> 'rh' or "registro_producao"."usuario_id" is not null)),
	CONSTRAINT "registro_producao_desfazer_check" CHECK ("registro_producao"."natureza" <> 'desfazer' or "registro_producao"."estorna_id" is not null),
	CONSTRAINT "registro_producao_correcao_check" CHECK ("registro_producao"."natureza" not in ('correcao', 'lancamento') or "registro_producao"."correcao_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "relatorio_agendado" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"ativo" boolean DEFAULT false NOT NULL,
	"destinatarios" text[] DEFAULT '{}'::text[] NOT NULL,
	"secoes" text[] DEFAULT '{}'::text[] NOT NULL,
	"ultimo_envio_em" timestamp with time zone,
	"ultimo_resultado" text,
	"atualizado_por" uuid,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relatorio_agendado_id_check" CHECK ("relatorio_agendado"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "aviso_dispensado" ADD CONSTRAINT "aviso_dispensado_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aviso_dispensado" ADD CONSTRAINT "aviso_dispensado_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "botao_esp32" ADD CONSTRAINT "botao_esp32_mesa_id_mesa_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "botao_esp32" ADD CONSTRAINT "botao_esp32_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendario_mes" ADD CONSTRAINT "calendario_mes_atualizado_por_usuario_id_fk" FOREIGN KEY ("atualizado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correcao_registro" ADD CONSTRAINT "correcao_registro_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correcao_registro" ADD CONSTRAINT "correcao_registro_jornada_id_jornada_id_fk" FOREIGN KEY ("jornada_id") REFERENCES "public"."jornada"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correcao_registro" ADD CONSTRAINT "correcao_registro_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimento" ADD CONSTRAINT "estoque_movimento_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimento" ADD CONSTRAINT "estoque_movimento_op_id_ordem_producao_id_fk" FOREIGN KEY ("op_id") REFERENCES "public"."ordem_producao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimento" ADD CONSTRAINT "estoque_movimento_registro_id_registro_producao_id_fk" FOREIGN KEY ("registro_id") REFERENCES "public"."registro_producao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimento" ADD CONSTRAINT "estoque_movimento_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimento" ADD CONSTRAINT "estoque_movimento_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exportacao" ADD CONSTRAINT "exportacao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exportacao" ADD CONSTRAINT "exportacao_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exportacao" ADD CONSTRAINT "exportacao_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jornada" ADD CONSTRAINT "jornada_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jornada" ADD CONSTRAINT "jornada_fechada_por_tablet_id_tablet_id_fk" FOREIGN KEY ("fechada_por_tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jornada" ADD CONSTRAINT "jornada_fechada_por_usuario_id_usuario_id_fk" FOREIGN KEY ("fechada_por_usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jornada" ADD CONSTRAINT "jornada_revisada_por_usuario_id_fk" FOREIGN KEY ("revisada_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_jornada_id_jornada_id_fk" FOREIGN KEY ("jornada_id") REFERENCES "public"."jornada"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_aberto_por_tablet_id_tablet_id_fk" FOREIGN KEY ("aberto_por_tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_fechado_por_tablet_id_tablet_id_fk" FOREIGN KEY ("fechado_por_tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa" ADD CONSTRAINT "mesa_operadora_id_operadora_id_fk" FOREIGN KEY ("operadora_id") REFERENCES "public"."operadora"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa" ADD CONSTRAINT "mesa_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_medida" ADD CONSTRAINT "meta_medida_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_medida" ADD CONSTRAINT "meta_medida_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_setor" ADD CONSTRAINT "meta_setor_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_setor" ADD CONSTRAINT "meta_setor_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "op_evento" ADD CONSTRAINT "op_evento_op_id_ordem_producao_id_fk" FOREIGN KEY ("op_id") REFERENCES "public"."ordem_producao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "op_evento" ADD CONSTRAINT "op_evento_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_producao" ADD CONSTRAINT "ordem_producao_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_producao" ADD CONSTRAINT "ordem_producao_criada_por_usuario_id_fk" FOREIGN KEY ("criada_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_jornada_id_jornada_id_fk" FOREIGN KEY ("jornada_id") REFERENCES "public"."jornada"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_categoria_id_pausa_categoria_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."pausa_categoria"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_motivo_id_pausa_motivo_id_fk" FOREIGN KEY ("motivo_id") REFERENCES "public"."pausa_motivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_classificada_por_usuario_id_fk" FOREIGN KEY ("classificada_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa_motivo" ADD CONSTRAINT "pausa_motivo_categoria_id_pausa_categoria_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."pausa_categoria"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pausa_motivo" ADD CONSTRAINT "pausa_motivo_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulso_esp32" ADD CONSTRAINT "pulso_esp32_botao_id_botao_esp32_id_fk" FOREIGN KEY ("botao_id") REFERENCES "public"."botao_esp32"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulso_esp32" ADD CONSTRAINT "pulso_esp32_mesa_id_mesa_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulso_esp32" ADD CONSTRAINT "pulso_esp32_registro_id_registro_producao_id_fk" FOREIGN KEY ("registro_id") REFERENCES "public"."registro_producao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_jornada_id_jornada_id_fk" FOREIGN KEY ("jornada_id") REFERENCES "public"."jornada"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_lote_id_lote_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lote"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_medida_id_medida_id_fk" FOREIGN KEY ("medida_id") REFERENCES "public"."medida"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_mesa_id_mesa_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_operadora_id_operadora_id_fk" FOREIGN KEY ("operadora_id") REFERENCES "public"."operadora"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_botao_id_botao_esp32_id_fk" FOREIGN KEY ("botao_id") REFERENCES "public"."botao_esp32"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_estorna_id_registro_producao_id_fk" FOREIGN KEY ("estorna_id") REFERENCES "public"."registro_producao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_producao" ADD CONSTRAINT "registro_producao_correcao_id_correcao_registro_id_fk" FOREIGN KEY ("correcao_id") REFERENCES "public"."correcao_registro"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatorio_agendado" ADD CONSTRAINT "relatorio_agendado_atualizado_por_usuario_id_fk" FOREIGN KEY ("atualizado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aviso_dispensado_setor_id_dispensado_em_idx" ON "aviso_dispensado" USING btree ("setor_id","dispensado_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE UNIQUE INDEX "botao_esp32_mesa_id_idx" ON "botao_esp32" USING btree ("mesa_id") WHERE "botao_esp32"."mesa_id" is not null;--> statement-breakpoint
CREATE INDEX "correcao_registro_setor_id_dia_idx" ON "correcao_registro" USING btree ("setor_id","dia");--> statement-breakpoint
CREATE INDEX "estoque_movimento_medida_id_ocorrido_em_idx" ON "estoque_movimento" USING btree ("medida_id","ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE UNIQUE INDEX "estoque_movimento_registro_id_idx" ON "estoque_movimento" USING btree ("registro_id") WHERE "estoque_movimento"."registro_id" is not null;--> statement-breakpoint
CREATE INDEX "estoque_movimento_op_id_idx" ON "estoque_movimento" USING btree ("op_id");--> statement-breakpoint
CREATE INDEX "exportacao_criado_em_idx" ON "exportacao" USING btree ("criado_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE UNIQUE INDEX "lote_aberto_idx" ON "lote" USING btree ("setor_id") WHERE "lote"."fechado_em" is null;--> statement-breakpoint
CREATE INDEX "lote_setor_id_dia_idx" ON "lote" USING btree ("setor_id","dia");--> statement-breakpoint
CREATE INDEX "op_evento_op_id_ocorrido_em_idx" ON "op_evento" USING btree ("op_id","ocorrido_em");--> statement-breakpoint
CREATE UNIQUE INDEX "operadora_nome_ativa_idx" ON "operadora" USING btree (lower("nome")) WHERE "operadora"."ativa";--> statement-breakpoint
CREATE INDEX "ordem_producao_estado_data_entrega_idx" ON "ordem_producao" USING btree ("estado","data_entrega");--> statement-breakpoint
CREATE INDEX "ordem_producao_medida_id_idx" ON "ordem_producao" USING btree ("medida_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pausa_aberta_idx" ON "pausa" USING btree ("setor_id") WHERE "pausa"."fim" is null;--> statement-breakpoint
CREATE INDEX "pausa_setor_id_dia_idx" ON "pausa" USING btree ("setor_id","dia");--> statement-breakpoint
CREATE INDEX "pausa_setor_id_inicio_idx" ON "pausa" USING btree ("setor_id","inicio");--> statement-breakpoint
CREATE INDEX "pausa_categoria_id_dia_idx" ON "pausa" USING btree ("categoria_id","dia");--> statement-breakpoint
CREATE INDEX "pausa_motivo_categoria_id_setor_id_ordem_idx" ON "pausa_motivo" USING btree ("categoria_id","setor_id","ordem");--> statement-breakpoint
CREATE UNIQUE INDEX "pausa_motivo_nome_ativo_idx" ON "pausa_motivo" USING btree ("categoria_id",coalesce("setor_id", '*'),lower("nome")) WHERE "pausa_motivo"."ativo";--> statement-breakpoint
CREATE INDEX "pulso_esp32_mesa_id_ocorrido_em_idx" ON "pulso_esp32" USING btree ("mesa_id","ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "registro_producao_setor_id_dia_idx" ON "registro_producao" USING btree ("setor_id","dia");--> statement-breakpoint
CREATE INDEX "registro_producao_setor_id_ocorrido_em_idx" ON "registro_producao" USING btree ("setor_id","ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "registro_producao_lote_id_idx" ON "registro_producao" USING btree ("lote_id");--> statement-breakpoint
CREATE INDEX "registro_producao_mesa_id_dia_idx" ON "registro_producao" USING btree ("mesa_id","dia") WHERE "registro_producao"."setor_id" = 'mon';--> statement-breakpoint
CREATE INDEX "registro_producao_operadora_id_dia_idx" ON "registro_producao" USING btree ("operadora_id","dia") WHERE "registro_producao"."setor_id" = 'mon';--> statement-breakpoint
CREATE UNIQUE INDEX "registro_producao_desfazer_idx" ON "registro_producao" USING btree ("estorna_id") WHERE "registro_producao"."natureza" = 'desfazer';--> statement-breakpoint
CREATE INDEX "registro_producao_correcao_id_idx" ON "registro_producao" USING btree ("correcao_id") WHERE "registro_producao"."correcao_id" is not null;--> statement-breakpoint
CREATE INDEX "registro_producao_tablet_id_recebido_em_idx" ON "registro_producao" USING btree ("tablet_id","recebido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE VIEW "public"."v_montagem_dia" AS (
  select dia, operadora_id, mesa_id, medida_id,
         sum(placas) as placas,
         max(ocorrido_em) as ultimo_em
  from registro_producao
  where setor_id = 'mon'
  group by dia, operadora_id, mesa_id, medida_id
);--> statement-breakpoint
CREATE VIEW "public"."v_producao_dia" AS (
  select setor_id, dia, medida_id, tipo,
         sum(quantidade) as quantidade,
         sum(placas) as placas,
         sum(ciclos) as ciclos,
         min(ocorrido_em) as primeiro_em,
         max(ocorrido_em) as ultimo_em,
         bool_or(natureza in ('ajuste', 'desfazer', 'correcao')) as teve_correcao
  from registro_producao
  group by setor_id, dia, medida_id, tipo
);