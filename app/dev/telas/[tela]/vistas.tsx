import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { classeBotaoErro, TelaErro } from "@/components/erros/TelaErro";
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
  // Mesmo texto de app/error.tsx e app/not-found.tsx.
  erro: (estado) =>
    estado === "nao-encontrado" ? (
      <TelaErro
        titulo="Página não encontrada"
        texto="O endereço não existe ou foi mudado."
        acao={<Link href="/" className={classeBotaoErro}>Voltar ao início</Link>}
      />
    ) : (
      <TelaErro
        titulo="Algo deu errado"
        texto="Não foi possível mostrar esta tela. Tente de novo; se continuar, chame o responsável."
        acao={<button type="button" className={classeBotaoErro}>Tentar de novo</button>}
      />
    ),
};
