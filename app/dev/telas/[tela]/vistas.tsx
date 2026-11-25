import type { ComponentType, ReactNode } from "react";

import { VistaExemplo } from "@/components/vistas/VistaExemplo";
import { exemplo } from "@/lib/exemplos/exemplo";
import type { NomeDeTela } from "@/lib/telas/registro";

type Montar = (estado: string) => ReactNode;

/** Liga a vista de uma tela aos valores de exemplo de cada estado. */
function comExemplos<P extends object>(
  Vista: ComponentType<P>,
  exemplos: Record<string, P>,
): Montar {
  return function montar(estado) {
    return <Vista {...exemplos[estado]} />;
  };
}

// Uma entrada por tela de lib/telas/registro.ts; se faltar, a checagem de tipos acusa.
export const VISTAS: Record<NomeDeTela, Montar> = {
  exemplo: comExemplos(VistaExemplo, exemplo),
};
