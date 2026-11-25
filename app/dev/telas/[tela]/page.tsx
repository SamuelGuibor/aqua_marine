import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  ehNomeDeTela,
  estadoDaTela,
  NOMES_DE_TELA,
} from "@/lib/telas/registro";

import { VISTAS } from "./vistas";

// Galeria: /dev/telas/<tela>?estado=<estado> monta a vista com os valores de exemplo, sem ler
// o banco. Quem a desliga em produção é o proxy.ts (variável GALERIA_TELAS).

export const metadata: Metadata = {
  title: "Galeria de telas · AquaPulse",
  robots: { index: false },
};

export function generateStaticParams() {
  return NOMES_DE_TELA.map((tela) => ({ tela }));
}

export default function PaginaDaTela({
  params,
  searchParams,
}: PageProps<"/dev/telas/[tela]">) {
  return (
    <Suspense fallback={null}>
      <TelaDaGaleria params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TelaDaGaleria({
  params,
  searchParams,
}: PageProps<"/dev/telas/[tela]">) {
  const { tela } = await params;
  if (!ehNomeDeTela(tela)) notFound();

  const estado = estadoDaTela(tela, (await searchParams).estado);

  // A conferência de largura espera por estes dois atributos antes de medir a tela.
  return (
    <div data-tela={tela} data-estado={estado}>
      {VISTAS[tela](estado)}
    </div>
  );
}
