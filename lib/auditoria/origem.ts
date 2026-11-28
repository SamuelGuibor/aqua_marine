// IP e navegador da requisição, para o `origem` de `registrarAcao`. Só de servidor.
// Fica separado de `registrar-acao.ts` para que o seed, o cron e os testes não dependam do Next.
import { headers } from "next/headers";
import type { Origem } from "./registrar-acao";

/** `x-forwarded-for` (primeiro endereço, o do cliente), senão `x-real-ip`; e o `user-agent`. */
export function origemDosCabecalhos(cabecalhos: Headers): Origem {
  const encaminhado = cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: encaminhado || cabecalhos.get("x-real-ip")?.trim() || null,
    userAgent: cabecalhos.get("user-agent") || null,
  };
}

/** Use em Server Action ou Route Handler, antes de abrir a transação. */
export async function origemDaRequisicao(): Promise<Origem> {
  return origemDosCabecalhos(await headers());
}
