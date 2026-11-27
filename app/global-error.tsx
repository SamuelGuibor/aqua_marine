"use client";

// Substitui o layout raiz quando ele mesmo falha: precisa de <html>, <body>, estilos e fontes próprios.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { classeBotaoErro, TelaErro } from "@/components/erros/TelaErro";
import { classeFontes } from "@/lib/tema/fontes";
import "./globals.css";

export default function ErroGlobal({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR" className={classeFontes}>
      <body>
        <title>Algo deu errado · AquaPulse</title>
        <TelaErro
          titulo="Algo deu errado"
          texto="O sistema encontrou um problema. Tente de novo; se continuar, chame o responsável."
          acao={
            <button type="button" className={classeBotaoErro} onClick={() => retry()}>
              Tentar de novo
            </button>
          }
        />
      </body>
    </html>
  );
}
