// Regras puras das medidas de placa: sem banco, sem `next/*`, sem API de navegador.

/** Medidas de placa, em metros. */
export const MEDIDAS = [2, 3, 4, 5] as const;

/** Área de uma placa: a largura é 0,5 m (2 m = 1 m²; 3 m = 1,5 m²). */
export function areaDaMedida(metros: number): number {
  return metros * 0.5;
}

const numero = (n: number) => String(n).replace(".", ",");

/** `3 m · 1,5 m²` (sem ",0": `2 m · 1 m²`). */
export function rotuloMedida(metros: number): string {
  return `${numero(metros)} m · ${numero(areaDaMedida(metros))} m²`;
}
