// Regras puras dos tablets: sem banco, sem `next/*`, sem API de navegador e sem
// relógio próprio (quem chama informa o "agora").

/** Ids fixos dos setores, criados pelo seed. */
export type SetorId = "inj" | "mon" | "tes";

export const PREFIXO_SETOR: Record<SetorId, string> = {
  inj: "INJE",
  mon: "MONT",
  tes: "TEST",
};

/** Tela de cada setor. Mapeada pelo id: o slug do setor `tes` é outro. */
export const ROTA_SETOR: Record<SetorId, string> = {
  inj: "/fabrica/injetora",
  mon: "/fabrica/montagem",
  tes: "/fabrica/teste-embalagem",
};

/** `TAB-MONT-01`: o número é global e tem pelo menos dois dígitos. */
export function formarCodigo(setorId: SetorId, seq: number): string {
  return `TAB-${PREFIXO_SETOR[setorId]}-${String(seq).padStart(2, "0")}`;
}

/** Aceita o código digitado em minúsculas e com espaços em qualquer lugar. */
export function normalizarCodigo(texto: string): string {
  return texto.replace(/\s+/g, "").toUpperCase();
}

/** Confere só o formato de um código já normalizado, não se ele existe. */
export function codigoTemFormato(codigo: string): boolean {
  return /^TAB-[A-Z]{4}-\d{2,}$/.test(codigo);
}

export type NomeValidado =
  | { ok: true; nome: string }
  | { ok: false; erro: "nome_vazio" };

/** O nome é gravado sem espaços nas pontas. */
export function validarNome(texto: string): NomeValidado {
  const nome = texto.trim();
  return nome ? { ok: true, nome } : { ok: false, erro: "nome_vazio" };
}

export type Situacao = "Vinculado" | "Aguardando vínculo";

export function situacao(temVinculoAtivo: boolean): Situacao {
  return temVinculoAtivo ? "Vinculado" : "Aguardando vínculo";
}

/** O que o aparelho vinculado é. */
export type TabletDoVinculo = {
  tabletId: string;
  /** Nulo só no modo `tv`. */
  setorId: string | null;
  modo: "setor" | "tv";
};

/** Vínculo achado pelo token, junto do cadastro do tablet. */
export type LinhaDeVinculo = TabletDoVinculo & {
  revogadoEm: Date | null;
  arquivadoEm: Date | null;
};

/** Nulo se o vínculo não existe, foi revogado ou é de tablet arquivado. */
export function avaliarVinculo(
  linha: LinhaDeVinculo | null | undefined,
): TabletDoVinculo | null {
  if (!linha || linha.revogadoEm || linha.arquivadoEm) return null;
  const { tabletId, setorId, modo } = linha;
  return { tabletId, setorId, modo };
}

const INTERVALO_DE_ACESSO_MS = 60_000;

/** O último acesso do vínculo é gravado no máximo uma vez por minuto. */
export function deveAtualizarAcesso(ultimo: Date | null, agora: Date): boolean {
  return (
    ultimo === null ||
    agora.getTime() - ultimo.getTime() >= INTERVALO_DE_ACESSO_MS
  );
}
