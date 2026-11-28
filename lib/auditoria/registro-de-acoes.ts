// Leitura do registro de ações, do mais novo para o mais antigo, em páginas.
// Para a aba Admin › Registro de ações (SCRUM-43) e o relatório "Fechamentos e correções" (SCRUM-81).
// Não confere papel: quem chama (a tela ou o relatório) é que decide quem pode ver. Só de servidor.
import { type SQL, and, desc, eq, gte, lte } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { dbLeitura } from "../db/cliente";
import type * as schema from "../db/schema";
import { registroAcao } from "../db/schema";
import type { Acao } from "./acoes";

export const ACOES_POR_PAGINA = 50;

export type FiltroRegistro = {
  /** Desde este instante (inclusive). */
  de?: Date;
  /** Até este instante (inclusive). */
  ate?: Date;
  acao?: Acao;
  entidade?: string;
  entidadeId?: string;
  /** Começa em 1. */
  pagina?: number;
};

export type LinhaRegistro = typeof registroAcao.$inferSelect;

export type PaginaRegistro = {
  itens: LinhaRegistro[];
  pagina: number;
  temMais: boolean;
};

/** O que a leitura usa do banco: o `dbLeitura()` do Neon ou o PGlite dos testes. */
export type Leitor = Pick<PgDatabase<PgQueryResultHKT, typeof schema>, "select">;

export async function registroDeAcoes(
  { de, ate, acao, entidade, entidadeId, pagina = 1 }: FiltroRegistro = {},
  db: Leitor = dbLeitura(),
): Promise<PaginaRegistro> {
  const atual = Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
  const condicoes: SQL[] = [];
  if (de) condicoes.push(gte(registroAcao.ocorridoEm, de));
  if (ate) condicoes.push(lte(registroAcao.ocorridoEm, ate));
  if (acao) condicoes.push(eq(registroAcao.acao, acao));
  if (entidade) condicoes.push(eq(registroAcao.entidade, entidade));
  if (entidadeId) condicoes.push(eq(registroAcao.entidadeId, entidadeId));

  // Busca uma a mais para saber se existe a página seguinte.
  const linhas = await db
    .select()
    .from(registroAcao)
    .where(and(...condicoes))
    .orderBy(desc(registroAcao.ocorridoEm), desc(registroAcao.id))
    .limit(ACOES_POR_PAGINA + 1)
    .offset((atual - 1) * ACOES_POR_PAGINA);

  return {
    itens: linhas.slice(0, ACOES_POR_PAGINA),
    pagina: atual,
    temMais: linhas.length > ACOES_POR_PAGINA,
  };
}
