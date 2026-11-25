CREATE TYPE "public"."encerramento_pausa" AS ENUM('retomar', 'contagem', 'fechamento_dia', 'rh');--> statement-breakpoint
CREATE TYPE "public"."estado_op" AS ENUM('aberta', 'em_producao', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."fechamento_jornada" AS ENUM('manual', 'automatico', 'rh');--> statement-breakpoint
CREATE TYPE "public"."formato_exportacao" AS ENUM('pdf', 'xlsx', 'csv');--> statement-breakpoint
CREATE TYPE "public"."modo_tablet" AS ENUM('setor', 'tv');--> statement-breakpoint
CREATE TYPE "public"."motivo_fechamento_lote" AS ENUM('manual', 'troca_medida', 'fim_do_dia', 'virada_do_dia');--> statement-breakpoint
CREATE TYPE "public"."motivo_revogacao" AS ENUM('novo_codigo', 'desvinculado_admin', 'usar_outro_id', 'substituido');--> statement-breakpoint
CREATE TYPE "public"."natureza_registro" AS ENUM('toque', 'ajuste', 'desfazer', 'correcao', 'lancamento');--> statement-breakpoint
CREATE TYPE "public"."origem_pausa" AS ENUM('operador', 'aviso_respondido', 'aviso_sem_resposta', 'rh');--> statement-breakpoint
CREATE TYPE "public"."origem_registro" AS ENUM('tablet', 'esp32', 'rh');--> statement-breakpoint
CREATE TYPE "public"."papel_usuario" AS ENUM('rh', 'admin');--> statement-breakpoint
CREATE TYPE "public"."resultado_operacao" AS ENUM('aplicada', 'rejeitada');--> statement-breakpoint
CREATE TYPE "public"."resultado_pulso" AS ENUM('contou', 'mesa_pendente', 'duplicado', 'rapido_demais', 'botao_inativo');--> statement-breakpoint
CREATE TYPE "public"."tipo_exportacao" AS ENUM('mensal', 'operadoras', 'perdas', 'estoque', 'fechamentos', 'historico_setor');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimento" AS ENUM('entrada', 'reserva', 'liberacao', 'expedicao', 'ajuste', 'saldo_inicial');--> statement-breakpoint
CREATE TYPE "public"."tipo_op_evento" AS ENUM('criada', 'editada', 'reserva', 'liberacao', 'atendida', 'expedicao', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."tipo_registro" AS ENUM('inj_boa2', 'inj_boa1', 'inj_vazio', 'inj_perda_cab_meio', 'inj_perda_cab_total', 'inj_perda_can_meio', 'inj_perda_can_total', 'mon_placa', 'tes_pacote', 'tes_defeito_caninho', 'tes_defeito_cabecote');--> statement-breakpoint
CREATE TABLE "medida" (
	"id" smallint PRIMARY KEY NOT NULL,
	"comprimento_m" numeric(4, 2) NOT NULL,
	"area_m2" numeric(5, 2) NOT NULL,
	"ordem" smallint NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"estoque_minimo_pacotes" integer,
	CONSTRAINT "medida_comprimento_m_unique" UNIQUE("comprimento_m")
);
--> statement-breakpoint
CREATE TABLE "registro_acao" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ocorrido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ator" text NOT NULL,
	"usuario_id" uuid,
	"tablet_id" uuid,
	"acao" text NOT NULL,
	"entidade" text,
	"entidade_id" text,
	"antes" jsonb,
	"depois" jsonb,
	"ip" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "setor" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"nome_curto" text NOT NULL,
	"descricao" text NOT NULL,
	"slug" text NOT NULL,
	"cor" text NOT NULL,
	"ordem" smallint NOT NULL,
	"unidade" text NOT NULL,
	CONSTRAINT "setor_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "setor_config" (
	"setor_id" text PRIMARY KEY NOT NULL,
	"minutos_aviso_parada" smallint NOT NULL,
	"placas_por_pacote_padrao" smallint,
	"placas_por_pacote_min" smallint,
	"placas_por_pacote_max" smallint,
	"inicio_jornada" time,
	"fechamento_automatico" time,
	"atualizado_por" uuid,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "setor_config_minutos_aviso_parada_check" CHECK ("setor_config"."minutos_aviso_parada" between 5 and 60)
);
--> statement-breakpoint
CREATE TABLE "setor_estado" (
	"setor_id" text PRIMARY KEY NOT NULL,
	"versao" bigint DEFAULT 0 NOT NULL,
	"ultimo_registro_em" timestamp with time zone,
	"ultima_atividade_em" timestamp with time zone,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tentativa_acesso" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"alvo" text NOT NULL,
	"chave" text NOT NULL,
	"sucesso" boolean NOT NULL,
	"ocorrido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"papel" "papel_usuario" NOT NULL,
	"senha_hash" text NOT NULL,
	"senha_versao" integer DEFAULT 1 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"ultimo_acesso_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_por" uuid
);
--> statement-breakpoint
ALTER TABLE "registro_acao" ADD CONSTRAINT "registro_acao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor_config" ADD CONSTRAINT "setor_config_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor_config" ADD CONSTRAINT "setor_config_atualizado_por_usuario_id_fk" FOREIGN KEY ("atualizado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor_estado" ADD CONSTRAINT "setor_estado_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "registro_acao_ocorrido_em_idx" ON "registro_acao" USING btree ("ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "registro_acao_entidade_idx" ON "registro_acao" USING btree ("entidade","entidade_id");--> statement-breakpoint
CREATE INDEX "registro_acao_acao_ocorrido_em_idx" ON "registro_acao" USING btree ("acao","ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "tentativa_acesso_alvo_chave_ocorrido_em_idx" ON "tentativa_acesso" USING btree ("alvo","chave","ocorrido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "usuario_ativo_idx" ON "usuario" USING btree ("ativo");