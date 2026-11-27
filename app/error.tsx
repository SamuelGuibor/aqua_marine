"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { classeBotaoErro, TelaErro } from "@/components/erros/TelaErro";

export default function Erro({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <TelaErro
      titulo="Algo deu errado"
      texto="Não foi possível mostrar esta tela. Tente de novo; se continuar, chame o responsável."
      acao={
        <button type="button" className={classeBotaoErro} onClick={() => retry()}>
          Tentar de novo
        </button>
      }
    />
  );
}
