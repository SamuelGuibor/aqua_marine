import { describe, expect, test } from "vitest";

import { escolherPr, proximoPasso } from "./fluxo.mjs";

const K = "SCRUM-12";

type Pr = { number: number; state: string; mergedAt?: string | null };

const aberto: Pr = { number: 9, state: "OPEN" };
const fechado: Pr = { number: 8, state: "CLOSED" };

/** Relatórios de um card revisado e liberado, valendo para o HEAD. */
const relatorios = {
  "contexto.md": {},
  "plano.md": {},
  "implementacao.md": {},
  "revisao.md": { veredito: "APROVADO", vale: true },
  "auditoria.md": { veredito: "LIBERADO", vale: true },
};

/** Situação como o `status` coleta: por padrão, tudo pronto e nenhum PR. */
function situacao(mudancas: Record<string, unknown> = {}, pr: Pr | null = null) {
  return {
    chave: K,
    worktree: "pasta",
    sujo: [] as string[],
    atras: 0,
    relatorios,
    gh: { ok: true, pr },
    ...mudancas,
  };
}

describe("escolherPr", () => {
  test("lista vazia não tem PR", () => {
    expect(escolherPr([])).toBeNull();
  });

  test("aberto ganha de mesclado, que ganha de fechado", () => {
    const mesclado = { number: 7, state: "MERGED", mergedAt: "2026-11-25T10:00:00Z" };
    expect(escolherPr([fechado, mesclado, aberto])).toBe(aberto);
    expect(escolherPr([fechado, mesclado])).toBe(mesclado);
    expect(escolherPr([fechado])).toBe(fechado);
  });

  test("entre vários mesclados vale o de merge mais recente", () => {
    const antigo = { number: 7, state: "MERGED", mergedAt: "2026-11-20T10:00:00Z" };
    const recente = { number: 8, state: "MERGED", mergedAt: "2026-11-25T10:00:00Z" };
    expect(escolherPr([antigo, recente])).toBe(recente);
    expect(escolherPr([recente, antigo])).toBe(recente);
  });
});

describe("proximoPasso", () => {
  const comando = (s: ReturnType<typeof situacao>) => proximoPasso(s)[0];
  const sem = (...nomes: string[]) =>
    Object.fromEntries(Object.entries(relatorios).filter(([nome]) => !nomes.includes(nome)));

  test("sem worktree: iniciar", () => {
    expect(comando(situacao({ worktree: undefined, relatorios: undefined, gh: undefined }))).toBe(`/iniciar-card ${K}`);
  });

  test("falta contexto ou plano: entender", () => {
    expect(comando(situacao({ relatorios: {} }))).toBe(`/entender-card ${K}`);
    expect(comando(situacao({ relatorios: sem("plano.md") }))).toBe(`/entender-card ${K}`);
  });

  test("falta implementação ou há arquivo sem commit: implementar", () => {
    expect(comando(situacao({ relatorios: sem("implementacao.md") }))).toBe(`/implementar-card ${K}`);
    expect(comando(situacao({ sujo: [" M a.txt"] }))).toBe(`/implementar-card ${K}`);
  });

  test("revisão ausente ou vencida: revisar; com ajustes: implementar", () => {
    expect(comando(situacao({ relatorios: sem("revisao.md") }))).toBe(`/revisar-card ${K}`);
    const vencida = { ...relatorios, "revisao.md": { veredito: "APROVADO", vale: false } };
    expect(comando(situacao({ relatorios: vencida }))).toBe(`/revisar-card ${K}`);
    const ajustes = { ...relatorios, "revisao.md": { veredito: "AJUSTES", vale: true } };
    expect(comando(situacao({ relatorios: ajustes }))).toBe(`/implementar-card ${K}`);
  });

  test("auditoria ausente ou vencida: auditar; bloqueada: implementar", () => {
    expect(comando(situacao({ relatorios: sem("auditoria.md") }))).toBe(`/auditar-codigo ${K}`);
    const vencida = { ...relatorios, "auditoria.md": { veredito: "LIBERADO", vale: false } };
    expect(comando(situacao({ relatorios: vencida }))).toBe(`/auditar-codigo ${K}`);
    const bloqueada = { ...relatorios, "auditoria.md": { veredito: "BLOQUEADO", vale: true } };
    expect(comando(situacao({ relatorios: bloqueada }))).toBe(`/implementar-card ${K}`);
  });

  test("main andou depois da auditoria: auditar", () => {
    expect(comando(situacao({ atras: 2 }))).toBe(`/auditar-codigo ${K}`);
  });

  test("sem PR, com PR fechado ou com commit por enviar: publicar", () => {
    expect(comando(situacao())).toBe(`/publicar-pr ${K}`);
    expect(comando(situacao({}, fechado))).toBe(`/publicar-pr ${K}`);
    expect(comando(situacao({ faltaEnviar: 1 }, aberto))).toBe(`/publicar-pr ${K}`);
  });

  test("PR aberto e tudo enviado: aguardar", () => {
    const [cmd, motivo] = proximoPasso(situacao({ faltaEnviar: 0 }, aberto));
    expect(cmd).toBeNull();
    expect(motivo).toContain("PR #9 aberto");
  });
});
