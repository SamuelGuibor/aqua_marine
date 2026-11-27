// Regras puras de Teste & Embalagem: sem banco, sem `next/*`, sem API de navegador.

/** Aprovação abaixo deste % aparece em âmbar. */
export const LIMITE_APROVACAO = 90;
/** Placas num pacote padrão. */
export const PADRAO_PLACAS_POR_PACOTE = 10;
export const MIN_PLACAS_POR_PACOTE = 1;
export const MAX_PLACAS_POR_PACOTE = 30;

const pct1 = (parte: number, total: number) => Math.round((parte / total) * 1000) / 10;

/** Testadas = embaladas + defeitos. */
export function testadas(embaladas: number, defeitos: number): number {
  return embaladas + defeitos;
}

/** % de aprovação (embaladas ÷ testadas), 1 casa. Nada testado = `null`. */
export function aprovacao(embaladas: number, defeitos: number): number | null {
  const t = testadas(embaladas, defeitos);
  return t <= 0 ? null : pct1(embaladas, t);
}

/** % de perda no teste (defeitos ÷ testadas), 1 casa. Nada testado = `null`. */
export function perdaTeste(embaladas: number, defeitos: number): number | null {
  const t = testadas(embaladas, defeitos);
  return t <= 0 ? null : pct1(defeitos, t);
}

/** Média de placas por pacote, 1 casa. Sem pacote = `null`. */
export function placasPorPacote(embaladas: number, pacotes: number): number | null {
  if (pacotes <= 0) return null;
  return Math.round((embaladas / pacotes) * 10) / 10;
}

export type GrupoPacote = { placasPorPacote: number; pacotes: number };

/**
 * Pacotes agrupados por tamanho, do mais frequente para o menos
 * (empate: o maior pacote primeiro), e o texto `com 10: 136 · com 8: 10`.
 */
export function distribuicaoPorTamanho(pacotes: readonly GrupoPacote[]): {
  grupos: GrupoPacote[];
  texto: string;
} {
  const somas = new Map<number, number>();
  for (const p of pacotes) {
    somas.set(p.placasPorPacote, (somas.get(p.placasPorPacote) ?? 0) + p.pacotes);
  }
  const grupos = [...somas]
    .filter(([, q]) => q > 0)
    .map(([placasPorPacote, q]) => ({ placasPorPacote, pacotes: q }))
    .sort((a, b) => b.pacotes - a.pacotes || b.placasPorPacote - a.placasPorPacote);
  return {
    grupos,
    texto: grupos.map((g) => `com ${g.placasPorPacote}: ${g.pacotes}`).join(" · "),
  };
}

/** Placas por pacote válidas: inteiro de 1 a 30. */
export function validarPlacasPorPacote(n: number): boolean {
  return (
    Number.isInteger(n) && n >= MIN_PLACAS_POR_PACOTE && n <= MAX_PLACAS_POR_PACOTE
  );
}

/** Pacote fora do padrão de 10 placas. */
export function foraDoPadrao(n: number): boolean {
  return n !== PADRAO_PLACAS_POR_PACOTE;
}
