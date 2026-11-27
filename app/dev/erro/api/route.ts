import { connection } from "next/server";

// Route Handler de teste do Sentry (SCRUM-30): sempre lança. Protegido pelo proxy.ts (/dev/*).
// connection() deixa a rota dinâmica: sem ela o build pré-renderiza o GET e quebra.
export async function GET(): Promise<Response> {
  await connection();
  throw new Error("Erro proposital de teste (SCRUM-30, servidor)");
}
