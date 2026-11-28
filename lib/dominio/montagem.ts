// Regras puras da Montagem: sem banco, sem `next/*`, sem API de navegador.

import { ritmo } from "./metas";

export type Mesa = { operadoraId: string | null; medidaId: number | null };

/** Mesa ativa: tem operadora e medida. */
export function mesaAtiva(mesa: Mesa): boolean {
  return mesa.operadoraId !== null && mesa.medidaId !== null;
}

/** Linha de `v_montagem_dia`. */
export type LinhaMontagem = {
  operadoraId: string | null;
  medidaId: number | null;
  placas: number;
};

export type TotalOperadora = {
  operadoraId: string;
  total: number;
  /** % do total do dia, inteiro. */
  pctDoDia: number | null;
  /** Placas por hora no tempo ativo. */
  ritmo: number | null;
};

/**
 * Total, % do dia e ritmo de cada operadora, do maior para o menor.
 * Linha sem operadora ou sem medida fica fora.
 */
export function porOperadora(
  linhas: readonly LinhaMontagem[],
  minutosAtivos: number,
): TotalOperadora[] {
  const totais = new Map<string, number>();
  for (const l of linhas) {
    if (l.operadoraId === null || l.medidaId === null) continue;
    totais.set(l.operadoraId, (totais.get(l.operadoraId) ?? 0) + l.placas);
  }
  const dia = [...totais.values()].reduce((s, v) => s + v, 0);
  return [...totais]
    .map(([operadoraId, total]) => ({
      operadoraId,
      total,
      pctDoDia: dia > 0 ? Math.round((total / dia) * 100) : null,
      ritmo: ritmo(total, minutosAtivos),
    }))
    .sort((a, b) => b.total - a.total);
}

/** Total da Montagem = soma das operadoras. */
export function totalMontagem(linhas: readonly LinhaMontagem[]): number {
  return porOperadora(linhas, 0).reduce((s, o) => s + o.total, 0);
}

/** Operadoras com produção hoje e nenhuma mesa atual. */
export function operadorasSemMesa(
  comProducaoHoje: readonly string[],
  mesasAtuais: readonly Mesa[],
): string[] {
  const naMesa = new Set(mesasAtuais.map((m) => m.operadoraId));
  return [...new Set(comProducaoHoje)].filter((id) => !naMesa.has(id));
}
