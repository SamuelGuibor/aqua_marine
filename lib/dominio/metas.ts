// Regras puras das metas: sem banco, sem `next/*`, sem API de navegador e sem
// relógio próprio (quem chama informa o "agora"). Vazio ("—" na tela) = `null`.

import { FUSO } from "./calendario";

/** % da meta, sem trava (387/270 = 143). Meta zero = `null`. */
export function pctMeta(valor: number, meta: number): number | null {
  if (meta <= 0) return null;
  return Math.round((valor / meta) * 100);
}

/** % da barra: igual ao da meta, travado em 100. */
export function pctBarra(valor: number, meta: number): number | null {
  const pct = pctMeta(valor, meta);
  return pct === null ? null : Math.min(100, pct);
}

/** Quanto falta para a meta, ou quanto passou dela ("Acima +117"; na meta, `acima: 0`). */
export function faltam(valor: number, meta: number): { faltam: number } | { acima: number } {
  return valor >= meta ? { acima: valor - meta } : { faltam: meta - valor };
}

/** Placas por hora (240 em 494 min = 29). Sem tempo ativo = `null`. */
export function ritmo(valor: number, minutosAtivos: number): number | null {
  if (minutosAtivos <= 0) return null;
  return Math.round(valor / (minutosAtivos / 60));
}

/**
 * Hora (`HH:MM`, fuso da fábrica) em que bate a meta no ritmo atual;
 * `batida` se já bateu; `—` sem ritmo.
 */
export function bateMeta(agora: Date, falta: number, ritmoPorHora: number | null): string {
  if (falta <= 0) return "batida";
  if (ritmoPorHora === null || ritmoPorHora <= 0) return "—";
  const quando = new Date(agora.getTime() + (falta / ritmoPorHora) * 3_600_000);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(quando);
}

/** Meta do mês = meta do dia × dias úteis (270 × 21 = 5.670). */
export function metaDoMes(metaDia: number, diasUteis: number): number {
  return metaDia * diasUteis;
}

/** % esperado até ontem = dias úteis decorridos ÷ dias úteis do mês, 1 casa. */
export function esperado(decorridos: number, diasUteis: number): number | null {
  if (diasUteis <= 0) return null;
  return Math.round((decorridos / diasUteis) * 1000) / 10;
}

/** Faz por dia = feito ÷ dias com produção, **sem arredondar** (a tela arredonda: 301). */
export function fazPorDia(feito: number, diasComProducao: number): number | null {
  if (diasComProducao <= 0) return null;
  return feito / diasComProducao;
}

/** Precisa por dia = ceil(falta do mês ÷ dias restantes). Sem dias = `null`; já bateu = 0. */
export function precisaPorDia(metaMes: number, feito: number, restantes: number): number | null {
  if (restantes <= 0) return null;
  return Math.max(0, Math.ceil((metaMes - feito) / restantes));
}

/** Projeção do mês = feito + faz por dia (cru) × dias restantes. */
export function projecao(feito: number, fazDia: number | null, restantes: number): number {
  if (fazDia === null) return feito;
  return Math.round(feito + fazDia * restantes);
}

/** Projeção contra a meta do mês. */
export function aFrente(
  projetado: number,
  metaMes: number,
): { aFrente: number } | { atras: number } {
  return projetado >= metaMes
    ? { aFrente: projetado - metaMes }
    : { atras: metaMes - projetado };
}

/** Meta do dia do gráfico = Montagem + Teste (270 + 270 = 540). */
export function metaDoDiaGrafico(metaMontagem: number, metaTeste: number): number {
  return metaMontagem + metaTeste;
}
