// Regras puras da Injetora: sem banco, sem `next/*`, sem API de navegador.
// Entrada = contagens por tipo de toque; tempo ativo chega pronto, em minutos.

export type TipoInjetora =
  | "inj_boa2"
  | "inj_boa1"
  | "inj_vazio"
  | "inj_perda_cab_meio"
  | "inj_perda_cab_total"
  | "inj_perda_can_meio"
  | "inj_perda_can_total";

export type ContagemInjetora = Partial<Record<TipoInjetora, number>>;

/** Ciclos por toque: boa de 2 = 2; "+ Placa (1 ciclo)" = 1; vazio = 1; cada perda = 1. */
export const CICLOS: Record<TipoInjetora, number> = {
  inj_boa2: 2,
  inj_boa1: 1,
  inj_vazio: 1,
  inj_perda_cab_meio: 1,
  inj_perda_cab_total: 1,
  inj_perda_can_meio: 1,
  inj_perda_can_total: 1,
};

const TIPOS_PERDA = [
  "inj_perda_cab_meio",
  "inj_perda_cab_total",
  "inj_perda_can_meio",
  "inj_perda_can_total",
] as const;

const n = (c: ContagemInjetora, t: TipoInjetora) => c[t] ?? 0;

/** Placas boas: as de 2 e de 1 ciclo contam igual. */
export function boas(c: ContagemInjetora): number {
  return n(c, "inj_boa2") + n(c, "inj_boa1");
}

/** Total de perdas (os 4 tipos). */
export function perdas(c: ContagemInjetora): number {
  return TIPOS_PERDA.reduce((s, t) => s + n(c, t), 0);
}

/** Eficiência = boas ÷ (boas + perdas), em %, 1 casa. Vazios ficam fora. Divisor zero = `null`. */
export function eficiencia(c: ContagemInjetora): number | null {
  const b = boas(c);
  const total = b + perdas(c);
  if (total === 0) return null;
  return Math.round((b / total) * 1000) / 10;
}

/** Todos os ciclos da máquina. */
export function ciclos(c: ContagemInjetora): number {
  return (Object.keys(CICLOS) as TipoInjetora[]).reduce(
    (s, t) => s + n(c, t) * CICLOS[t],
    0,
  );
}

/** Ciclos perdidos: só perdas, **sem** as cabeças vazias. */
export function ciclosPerdidos(c: ContagemInjetora): number {
  return TIPOS_PERDA.reduce((s, t) => s + n(c, t) * CICLOS[t], 0);
}

/** Ciclos vazios, separados dos perdidos. */
export function ciclosVazios(c: ContagemInjetora): number {
  return n(c, "inj_vazio") * CICLOS.inj_vazio;
}

const porHora = (q: number, min: number) =>
  min <= 0 ? null : Math.round(q / (min / 60));
const segundosPor = (min: number, q: number) =>
  min <= 0 || q <= 0 ? null : Math.round((min * 60) / q);

/** Placas boas por hora. Sem tempo = `null`. */
export function placasPorHora(c: ContagemInjetora, minutosAtivos: number): number | null {
  return porHora(boas(c), minutosAtivos);
}

/** Ciclos por hora. Sem tempo = `null`. */
export function ciclosPorHora(c: ContagemInjetora, minutosAtivos: number): number | null {
  return porHora(ciclos(c), minutosAtivos);
}

/** Segundos por placa boa. Sem tempo ou sem placa = `null`. */
export function tempoPorPlaca(c: ContagemInjetora, minutosAtivos: number): number | null {
  return segundosPor(minutosAtivos, boas(c));
}

/** Segundos por ciclo. Sem tempo ou sem ciclo = `null`. */
export function tempoPorCiclo(c: ContagemInjetora, minutosAtivos: number): number | null {
  return segundosPor(minutosAtivos, ciclos(c));
}
