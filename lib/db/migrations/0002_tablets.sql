CREATE TABLE "operacao_tablet" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tablet_id" uuid NOT NULL,
	"vinculo_id" uuid NOT NULL,
	"setor_id" text NOT NULL,
	"tipo" text,
	"seq" bigint,
	"ocorrido_em" timestamp with time zone,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"resultado" "resultado_operacao" NOT NULL,
	"motivo_rejeicao" text,
	"payload" jsonb NOT NULL,
	"resolvida_em" timestamp with time zone,
	"resolvida_por" uuid
);
--> statement-breakpoint
CREATE TABLE "tablet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"modo" "modo_tablet" DEFAULT 'setor' NOT NULL,
	"setor_id" text,
	"codigo" text NOT NULL,
	"codigo_seq" integer NOT NULL,
	"codigo_gerado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_por" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"arquivado_em" timestamp with time zone,
	CONSTRAINT "tablet_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "tablet_codigo_seq_unique" UNIQUE("codigo_seq"),
	CONSTRAINT "tablet_setor_id_check" CHECK ("tablet"."modo" <> 'setor' or "tablet"."setor_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "tablet_vinculo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tablet_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"vinculado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"vinculado_por" uuid,
	"user_agent" text,
	"app_versao" text,
	"ultimo_acesso_em" timestamp with time zone,
	"revogado_em" timestamp with time zone,
	"revogado_motivo" "motivo_revogacao",
	CONSTRAINT "tablet_vinculo_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "operacao_tablet" ADD CONSTRAINT "operacao_tablet_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operacao_tablet" ADD CONSTRAINT "operacao_tablet_vinculo_id_tablet_vinculo_id_fk" FOREIGN KEY ("vinculo_id") REFERENCES "public"."tablet_vinculo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operacao_tablet" ADD CONSTRAINT "operacao_tablet_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operacao_tablet" ADD CONSTRAINT "operacao_tablet_resolvida_por_usuario_id_fk" FOREIGN KEY ("resolvida_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tablet" ADD CONSTRAINT "tablet_setor_id_setor_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setor"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tablet" ADD CONSTRAINT "tablet_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tablet_vinculo" ADD CONSTRAINT "tablet_vinculo_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tablet_vinculo" ADD CONSTRAINT "tablet_vinculo_vinculado_por_usuario_id_fk" FOREIGN KEY ("vinculado_por") REFERENCES "public"."usuario"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "operacao_tablet_tablet_id_recebido_em_idx" ON "operacao_tablet" USING btree ("tablet_id","recebido_em" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "operacao_tablet_rejeitada_pendente_idx" ON "operacao_tablet" USING btree ("resultado") WHERE "operacao_tablet"."resultado" = 'rejeitada' and "operacao_tablet"."resolvida_em" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "tablet_nome_ativo_idx" ON "tablet" USING btree (lower("nome")) WHERE "tablet"."arquivado_em" is null;--> statement-breakpoint
CREATE INDEX "tablet_setor_id_idx" ON "tablet" USING btree ("setor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tablet_vinculo_ativo_idx" ON "tablet_vinculo" USING btree ("tablet_id") WHERE "tablet_vinculo"."revogado_em" is null;--> statement-breakpoint
ALTER TABLE "registro_acao" ADD CONSTRAINT "registro_acao_tablet_id_tablet_id_fk" FOREIGN KEY ("tablet_id") REFERENCES "public"."tablet"("id") ON DELETE restrict ON UPDATE no action;