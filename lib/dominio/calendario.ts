// Calendário de produção. Funções puras; o "hoje" vem sempre de quem chama.

export const FUSO = "America/Sao_Paulo";

/** Ano e mês (1 a 12) de um instante no fuso da fábrica. */
export function anoMesEm(instante: Date): { ano: number; mes: number } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(instante);
  const valor = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value);
  return { ano: valor("year"), mes: valor("month") };
}

/**
 * Dias de segunda a sexta do mês: o valor sugerido quando o mês ainda não tem
 * linha em `calendario_mes`. Feriado não é descontado (o RH acerta à mão).
 */
export function diasUteisDoMes(ano: number, mes: number): number {
  const total = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  let uteis = 0;
  for (let dia = 1; dia <= total; dia++) {
    const semana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
    if (semana !== 0 && semana !== 6) uteis++;
  }
  return uteis;
}
