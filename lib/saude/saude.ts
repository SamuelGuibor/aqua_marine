// Lógica da rota /api/health, separada do Next e do banco para ser testada sem os dois:
// a consulta chega de fora (`consultar`).

export type CorpoDaSaude = {
  ok: boolean;
  banco: boolean;
  versao: string;
  agora: string;
};

export type Saude = {
  status: 200 | 503;
  corpo: CorpoDaSaude;
};

type Ambiente = Record<string, string | undefined>;

/** Hash curto do commit do deploy (a Vercel define a variável); fora dela, `dev`. */
export function versaoDoApp(env: Ambiente = process.env): string {
  return env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
}

/** Devolve o resultado da promessa ou rejeita depois de `ms`, o que vier primeiro. */
export async function comLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(
      () => rejeitar(new Error("tempo limite esgotado")),
      ms,
    );
  });

  try {
    return await Promise.race([promessa, limite]);
  } finally {
    clearTimeout(temporizador);
  }
}

type Opcoes = {
  /** A consulta ao banco (`select 1`). Qualquer falha, até síncrona, vira 503. */
  consultar: () => Promise<unknown>;
  limiteMs?: number;
  agora?: () => Date;
  env?: Ambiente;
};

export async function verificarSaude({
  consultar,
  limiteMs = 3000,
  agora = () => new Date(),
  env,
}: Opcoes): Promise<Saude> {
  let banco: boolean;
  try {
    await comLimite(consultar(), limiteMs);
    banco = true;
  } catch {
    // O erro fica aqui de propósito: a mensagem do driver traz o endereço do banco.
    banco = false;
  }

  return {
    status: banco ? 200 : 503,
    corpo: {
      ok: banco,
      banco,
      versao: versaoDoApp(env),
      agora: agora().toISOString(),
    },
  };
}
