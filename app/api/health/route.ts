// Saúde do app e do banco, para o monitor de fora do ar (UptimeRobot, SCRUM-94).
// Pública de propósito: sem sessão e sem token de tablet.
import { sql } from "drizzle-orm";
import { connection } from "next/server";

import { dbLeitura } from "@/lib/db/cliente";
import { verificarSaude } from "@/lib/saude/saude";

export async function GET() {
  // Com cacheComponents, um GET que falha antes de tocar na rede (DATABASE_URL ausente
  // no build, por exemplo) seria pré-renderizado e congelado. Daqui para baixo só roda
  // com uma requisição de verdade.
  await connection();

  const { status, corpo } = await verificarSaude({
    // dbLeitura() fica dentro da função: sem DATABASE_URL ela lança, e isso vira 503.
    consultar: () => dbLeitura().execute(sql`select 1`),
  });

  return Response.json(corpo, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
