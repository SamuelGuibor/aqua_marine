// Regras puras da produção do dia: sem banco, sem `next/*`, sem API de navegador.
// Recebe as linhas já lidas (formato de `v_producao_dia`) e só soma.

import type { SetorId } from "./tablets";

/** Igual ao enum `tipo_registro` do banco (o teste confere). */
export type TipoRegistro =
  | "inj_boa2"
  | "inj_boa1"
  | "inj_vazio"
  | "inj_perda_cab_meio"
  | "inj_perda_cab_total"
  | "inj_perda_can_meio"
  | "inj_perda_can_total"
  | "mon_placa"
  | "tes_pacote"
  | "tes_defeito_caninho"
  | "tes_defeito_cabecote";

export const TIPOS_REGISTRO: readonly TipoRegistro[] = [
  "inj_boa2",
  "inj_boa1",
  "inj_vazio",
  "inj_perda_cab_meio",
  "inj_perda_cab_total",
  "inj_perda_can_meio",
  "inj_perda_can_total",
  "mon_placa",
  "tes_pacote",
  "tes_defeito_caninho",
  "tes_defeito_cabecote",
];

/** Unidade que conta para a meta de cada setor. */
export const UNIDADE: Record<SetorId, string> = {
  inj: "boas",
  mon: "montadas",
  tes: "embaladas",
};

/** Tipos cujas placas somam na unidade (e na área) do setor. */
export const TIPOS_QUE_CONTAM: Record<SetorId, readonly TipoRegistro[]> = {
  inj: ["inj_boa2", "inj_boa1"],
  mon: ["mon_placa"],
  tes: ["tes_pacote"],
};

/** Uma linha somada por tipo e medida, como sai de `v_producao_dia`. */
export type LinhaProducao = {
  tipo: TipoRegistro;
  medidaId: number;
  placas: number;
};

export const SEM_PRODUCAO = "sem_producao" as const;

/**
 * Valor do setor no dia. Sem nenhuma linha = "sem produção" (nunca o número
 * de outro dia). Linhas de tipos que não contam são ignoradas.
 */
export function valorDoSetor(
  setor: SetorId,
  linhas: readonly LinhaProducao[],
): number | typeof SEM_PRODUCAO {
  if (linhas.length === 0) return SEM_PRODUCAO;
  const contam = TIPOS_QUE_CONTAM[setor];
  return linhas
    .filter((l) => contam.includes(l.tipo))
    .reduce((soma, l) => soma + l.placas, 0);
}

/** Área (m²) do dia: só placa que conta soma. Medida sem área conhecida soma 0. */
export function areaDoSetor(
  setor: SetorId,
  linhas: readonly LinhaProducao[],
  areaPorMedida: Readonly<Record<number, number>>,
): number {
  const contam = TIPOS_QUE_CONTAM[setor];
  return linhas
    .filter((l) => contam.includes(l.tipo))
    .reduce((soma, l) => soma + l.placas * (areaPorMedida[l.medidaId] ?? 0), 0);
}
