// Postgres em memória (PGlite) com todas as migrations aplicadas, para os testes de integração.
// Não usa o Neon: roda no CI, que não tem banco, e nada cai no banco real. Só para testes.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

export const PASTA_MIGRATIONS = join(__dirname, "migrations");

/** Os `.sql` na ordem do `meta/_journal.json`. */
export function arquivosDeMigration(): string[] {
  const jornal = JSON.parse(
    readFileSync(join(PASTA_MIGRATIONS, "meta", "_journal.json"), "utf8"),
  ) as { entries: { tag: string }[] };
  return jornal.entries.map((e) => `${e.tag}.sql`);
}

export async function aplicarMigrations(pg: PGlite) {
  for (const arquivo of arquivosDeMigration()) {
    const texto = readFileSync(join(PASTA_MIGRATIONS, arquivo), "utf8");
    for (const comando of texto.split("--> statement-breakpoint")) {
      if (comando.trim()) await pg.exec(comando);
    }
  }
}

/** Um PGlite novo e o Drizzle dele. Aplique as migrations no `beforeAll`. */
export function novoBancoDeTeste() {
  const pg = new PGlite();
  return { pg, db: drizzle(pg, { schema }) };
}
