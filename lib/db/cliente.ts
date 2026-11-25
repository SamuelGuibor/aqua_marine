// Acesso ao Neon. As conexões nascem só na primeira chamada: importar este módulo
// sem DATABASE_URL (no build, por exemplo) não falha.
// Sem `import "server-only"`: o seed importa este arquivo fora do Next.
import { Pool, neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function urlDoBanco(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Preencha o .env.local (veja o .env.example).",
    );
  }
  return url;
}

function criarDbLeitura() {
  return drizzleHttp(neon(urlDoBanco()), { schema });
}

let leitura: ReturnType<typeof criarDbLeitura> | undefined;

/**
 * Consultas pelo driver HTTP. Use só para ler: escrita passa por `transacao`.
 */
export function dbLeitura() {
  leitura ??= criarDbLeitura();
  return leitura;
}

function criarDbEscrita(pool: Pool) {
  return drizzlePool(pool, { schema });
}

/** O `tx` recebido dentro de `transacao`. */
export type Transacao = Parameters<
  Parameters<ReturnType<typeof criarDbEscrita>["transaction"]>[0]
>[0];

/**
 * Escrita em transação interativa. O Pool não sobrevive à requisição em
 * ambiente serverless, por isso é aberto e fechado dentro da própria chamada.
 */
export async function transacao<T>(
  fn: (tx: Transacao) => Promise<T>,
): Promise<T> {
  const pool = new Pool({ connectionString: urlDoBanco() });
  try {
    return await criarDbEscrita(pool).transaction(fn);
  } finally {
    await pool.end();
  }
}
