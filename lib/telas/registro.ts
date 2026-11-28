// Registro das telas da galeria /dev/telas e da conferência de largura (docs/larguras.md).
// Cada card de tela acrescenta a sua aqui e a vista em app/dev/telas/[tela]/vistas.tsx.
// Lido também pelos testes: sem React e sem o atalho @/.
import type { NomeDeJanela } from "./janelas";

export type ExcecaoDeToque = {
  /** Seletor CSS do que pode ficar menor que o alvo mínimo. */
  seletor: string;
  motivo: string;
};

export type Tela = {
  /** O primeiro é o padrão. */
  estados: readonly [string, ...string[]];
  /** Janelas em que a página não pode rolar na vertical. */
  naoRola: readonly NomeDeJanela[];
  /** Para um estado que difere dos outros: substitui `naoRola`. */
  naoRolaPorEstado?: Readonly<Record<string, readonly NomeDeJanela[]>>;
  excecoesDeToque: readonly ExcecaoDeToque[];
};

export const TELAS = {
  // Vista de exemplo: não é uma tela do sistema, prova a ferramenta e as duas cascas.
  exemplo: {
    estados: ["padrao", "vazio", "miolo-rola"],
    naoRola: ["pc", "tablet-h", "tablet-v", "rh-tablet"],
    excecoesDeToque: [],
  },
  // Páginas de erro (app/error.tsx, app/global-error.tsx) e de não encontrado (app/not-found.tsx).
  erro: {
    estados: ["erro", "nao-encontrado"],
    naoRola: ["pc", "tablet-h", "tablet-v", "rh-tablet"],
    excecoesDeToque: [],
  },
} as const satisfies Record<string, Tela>;

export type NomeDeTela = keyof typeof TELAS;

export type EstadoDe<T extends NomeDeTela> =
  (typeof TELAS)[T]["estados"][number];

export const NOMES_DE_TELA = Object.keys(TELAS) as NomeDeTela[];

export function ehNomeDeTela(nome: string): nome is NomeDeTela {
  return Object.hasOwn(TELAS, nome);
}

/** O estado pedido, se a tela o tiver; senão, o padrão. */
export function estadoDaTela(
  nome: NomeDeTela,
  pedido: string | string[] | undefined,
): string {
  const { estados }: Tela = TELAS[nome];
  return estados.find((estado) => estado === pedido) ?? estados[0];
}
