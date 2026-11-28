// A função única que grava "quem fez o quê" em `registro_acao`.
// Sem `next/*` e sem abrir conexão: roda na Server Action, no cron, no seed e no teste,
// sempre com o `tx` da transação que faz a escrita (se uma falha, a outra não fica).
// A tabela é só de inclusão: não existe, nem deve existir, função que altere ou apague.
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "../db/schema";
import { registroAcao } from "../db/schema";
import { ACOES, type Acao } from "./acoes";
import { type Campos, limparSensiveis } from "./limpar";

/** Quem fez: pessoa logada, tablet do setor, botão físico ou o próprio sistema (cron, seed). */
export type Ator =
  | { tipo: "usuario"; usuarioId: string }
  | { tipo: "tablet"; tabletId: string }
  | { tipo: "botao" }
  | { tipo: "sistema" };

/** IP e navegador, quando a ação veio de uma requisição (ver `origemDaRequisicao`). */
export type Origem = { ip?: string | null; userAgent?: string | null };

export type EntradaAcao = {
  acao: Acao;
  ator: Ator;
  /** Tabela ou conceito afetado (`mesa`, `tablet`, `jornada`...). */
  entidade: string;
  entidadeId?: string | null;
  /** Só os campos que mudaram (ver `diferenca`). Na criação, nulo. */
  antes?: Campos | null;
  depois?: Campos | null;
  origem?: Origem;
};

/**
 * O que `registrarAcao` usa da transação. Aceita o `tx` do Neon (`transacao`)
 * e o banco do PGlite dos testes.
 */
export type Gravador = Pick<PgDatabase<PgQueryResultHKT, typeof schema>, "insert">;

function idsDoAtor(ator: Ator): { usuarioId: string | null; tabletId: string | null } {
  const tipo = (ator as { tipo?: unknown } | null)?.tipo;
  switch (tipo) {
    case "usuario": {
      const { usuarioId } = ator as { usuarioId?: unknown };
      if (typeof usuarioId !== "string" || !usuarioId) {
        throw new Error("registrarAcao: ator 'usuario' sem usuarioId.");
      }
      return { usuarioId, tabletId: null };
    }
    case "tablet": {
      const { tabletId } = ator as { tabletId?: unknown };
      if (typeof tabletId !== "string" || !tabletId) {
        throw new Error("registrarAcao: ator 'tablet' sem tabletId.");
      }
      return { usuarioId: null, tabletId };
    }
    case "botao":
    case "sistema":
      return { usuarioId: null, tabletId: null };
    default:
      throw new Error(`registrarAcao: ator desconhecido (${String(tipo)}).`);
  }
}

/**
 * Grava uma linha em `registro_acao` dentro da transação recebida.
 * Campos sensíveis (senha, token) saem de `antes`/`depois` mesmo que venham.
 * Devolve o `id` da linha.
 */
export async function registrarAcao(
  tx: Gravador,
  { acao, ator, entidade, entidadeId, antes, depois, origem }: EntradaAcao,
): Promise<number> {
  if (!(ACOES as readonly string[]).includes(acao)) {
    throw new Error(`registrarAcao: ação fora da lista de lib/auditoria/acoes.ts (${String(acao)}).`);
  }
  const { usuarioId, tabletId } = idsDoAtor(ator);
  const [linha] = await tx
    .insert(registroAcao)
    .values({
      acao,
      ator: ator.tipo,
      usuarioId,
      tabletId,
      entidade,
      entidadeId: entidadeId ?? null,
      antes: limparSensiveis(antes),
      depois: limparSensiveis(depois),
      ip: origem?.ip ?? null,
      userAgent: origem?.userAgent ?? null,
    })
    .returning({ id: registroAcao.id });
  return linha.id;
}
