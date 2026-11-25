// Seed do banco: `npm run db:seed`. Os dados ficam em semear.ts.
// Pode rodar quantas vezes for: só insere o que falta, nunca altera nem apaga.
// Nunca imprima senha, hash ou URL do banco, nem em mensagem de erro.
import { loadEnvConfig } from "@next/env";
import { DrizzleQueryError } from "drizzle-orm";
import { transacao } from "./cliente";
import { semearBanco } from "./semear";

loadEnvConfig(process.cwd());

async function semear() {
  const contagens = await transacao((tx) =>
    semearBanco(tx, { senhaAdmin: process.env.ADMIN_SENHA_INICIAL }),
  );

  console.log("Seed concluído. Linhas no banco:");
  for (const [tabela, total] of Object.entries(contagens)) {
    console.log(`  ${tabela}: ${total}`);
  }
}

/** A mensagem do Drizzle traz os parâmetros da consulta: usa só a causa. */
function mensagemSegura(erro: unknown): string {
  if (erro instanceof DrizzleQueryError) {
    return `Falha no banco: ${erro.cause?.message || "causa não informada"}`;
  }
  if (erro instanceof Error) return erro.message;
  // O driver do Neon rejeita com um ErrorEvent sem mensagem quando não conecta.
  return "Não foi possível conectar ao banco. Confira a DATABASE_URL e a rede.";
}

semear().catch((erro: unknown) => {
  console.error(
    mensagemSegura(erro).replace(/postgres(ql)?:\/\/\S+/gi, "<url do banco>"),
  );
  process.exitCode = 1;
});
