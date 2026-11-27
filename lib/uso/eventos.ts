import type { SetorId } from "@/lib/dominio/tablets";
import { posthog, posthogLigado } from "./posthog";

// Eventos de uso. Lista fechada: nome fora dela é erro de tipo no build.
// Os dados não levam nome de pessoa nem texto livre.
export type NomeEvento =
  | "registro_placa"
  | "pausa_registrada"
  | "lote_fechado"
  | "pdf_exportado";

export type DadosEvento = {
  setor?: SetorId;
  medida?: number;
  tipo?: string;
};

// Síncrona e silenciosa: nunca segura o toque nem lança erro (offline, sem chave, bloqueador).
export function registrarEvento(nome: NomeEvento, dados?: DadosEvento): void {
  if (!posthogLigado()) return;
  try {
    posthog.capture(nome, dados);
  } catch {
    // silencioso
  }
}

// Identificação sem dado pessoal: o tablet (nome do cadastro) ou o papel de quem entrou.
// Chamada pelo login (SCRUM-34).
export type QuemUsa = { tablet: string } | { papel: "rh" | "admin" };

export function identificarUso(quem: QuemUsa): void {
  if (!posthogLigado()) return;
  try {
    if ("tablet" in quem) posthog.identify(`tablet:${quem.tablet}`, { tipo: "tablet" });
    else posthog.identify(`papel:${quem.papel}`, { tipo: "papel" });
  } catch {
    // silencioso
  }
}
