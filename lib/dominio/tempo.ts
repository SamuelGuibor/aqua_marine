// Regras puras de tempo: sem banco, sem `next/*`, sem API de navegador e sem
// relógio próprio (quem chama informa o instante e o "hoje").

import { FUSO } from "./calendario";

/** Dia de produção (`AAAA-MM-DD`) de um instante, no fuso da fábrica. */
export function diaDe(instante: Date | string): string {
  const data = typeof instante === "string" ? new Date(instante) : instante;
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/** Dias de segunda a sexta do mês antes de `hoje` (`AAAA-MM-DD`). Hoje não conta. */
export function diasUteisDecorridos(ano: number, mes: number, hoje: string): number {
  const [a, m, d] = hoje.split("-").map(Number);
  if (a < ano || (a === ano && m < mes)) return 0;
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const ate = a === ano && m === mes ? d - 1 : ultimo;
  let uteis = 0;
  for (let dia = 1; dia <= ate; dia++) {
    const semana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
    if (semana !== 0 && semana !== 6) uteis++;
  }
  return uteis;
}

/**
 * Dias úteis restantes, **incluindo hoje**. Recebe os dias úteis do mês porque
 * o RH pode acertá-los à mão (feriado). Nunca negativo.
 */
export function diasUteisRestantes(diasUteis: number, decorridos: number): number {
  return Math.max(0, diasUteis - decorridos);
}

/** `43 min`, `1h26`, `10h34`. */
export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/** `8h 14min` (tempo ativo do turno). Abaixo de 1 h: `43min`. */
export function formatarDuracaoLonga(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h === 0 ? `${m}min` : `${h}h ${m}min`;
}
