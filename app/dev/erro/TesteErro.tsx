"use client";

import { useState } from "react";
import { classeBotaoErro } from "@/components/erros/TelaErro";
import { registrarEvento } from "@/lib/uso/eventos";

export function TesteErro() {
  const [quebrar, setQuebrar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  if (quebrar) throw new Error("Erro proposital de teste (SCRUM-30, navegador)");

  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={classeBotaoErro} onClick={() => setQuebrar(true)}>
        Lançar erro no navegador
      </button>
      <button
        type="button"
        className={classeBotaoErro}
        onClick={() => {
          registrarEvento("registro_placa", { setor: "inj", medida: 3 });
          setEnviado(true);
        }}
      >
        {enviado ? "Evento registro_placa enviado" : "Enviar registro_placa"}
      </button>
    </div>
  );
}
