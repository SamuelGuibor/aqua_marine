import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, test } from "vitest";

import {
  compararComMescla,
  escolherPr,
  motivoParaNaoEncerrar,
  proximoPasso,
  relatorioVale,
  situacaoAposMescla,
  trazerCommitDoPr,
} from "./fluxo.mjs";

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

  test("PR aberto e tudo enviado: aguardar, avisando que PR parcial não encerra o card", () => {
    const [cmd, motivo] = proximoPasso(situacao({ faltaEnviar: 0 }, aberto));
    expect(cmd).toBeNull();
    expect(motivo).toContain("PR #9 aberto");
    expect(motivo).toContain(`Depois do merge: /encerrar-card ${K}`);
    expect(motivo).toContain("Se o PR for parcial, não encerre");
    expect(motivo).toContain('"Em andamento"');
    expect(motivo).toContain(`/implementar-card ${K}`);
  });
});

describe("proximoPasso com o último PR mesclado", () => {
  const mesclado: Pr = { number: 7, state: "MERGED", mergedAt: "2026-11-25T10:00:00Z" };
  const coberto = { local: "coberto", github: "coberto" };
  const comTrabalho = { local: "trabalho-novo", github: "coberto" };
  const depois = (mudancas: Record<string, unknown>) => proximoPasso(situacao(mudancas, mesclado));

  test("sem trabalho além do mesclado: encerrar", () => {
    expect(depois({ aposMescla: coberto })[0]).toBe(`/encerrar-card ${K}`);
    // como o SCRUM-36 logo depois da primeira parte: relatórios valendo e a main um commit à frente
    expect(depois({ aposMescla: coberto, atras: 1 })[0]).toBe(`/encerrar-card ${K}`);
  });

  test("com commit novo: segue o fluxo normal", () => {
    expect(depois({ aposMescla: comTrabalho, sujo: [" M a.txt"] })[0]).toBe(`/implementar-card ${K}`);
    const revisaoVencida = { ...relatorios, "revisao.md": { veredito: "APROVADO", vale: false } };
    expect(depois({ aposMescla: comTrabalho, relatorios: revisaoVencida })[0]).toBe(`/revisar-card ${K}`);
    const auditoriaVencida = { ...relatorios, "auditoria.md": { veredito: "LIBERADO", vale: false } };
    expect(depois({ aposMescla: comTrabalho, relatorios: auditoriaVencida })[0]).toBe(`/auditar-codigo ${K}`);
  });

  test.each([
    ["branch apagada no merge", { publicada: false }],
    ["commits por enviar", { publicada: true, faltaEnviar: 2 }],
    ["commits já no GitHub", { publicada: true, faltaEnviar: 0 }],
  ])("revisado e liberado, %s: publicar um PR novo", (_caso, mudancas) => {
    const aposMescla = { local: "trabalho-novo", github: "trabalho-novo" };
    const [cmd, motivo] = depois({ aposMescla, ...mudancas });
    expect(cmd).toBe(`/publicar-pr ${K}`);
    expect(motivo).toContain("#7 já foi mesclado");
    expect(motivo).toContain("PR novo");
  });

  test("com o PR novo aberto volta a aguardar, citando o novo", () => {
    const [cmd, motivo] = proximoPasso(situacao({ faltaEnviar: 0 }, escolherPr([mesclado, aberto])));
    expect(cmd).toBeNull();
    expect(motivo).toContain("PR #9 aberto");
    expect(motivo).not.toContain("#7");
  });

  test.each([
    ["sem comparação", undefined],
    ["local indefinido", { local: "indefinido", github: "coberto" }],
    ["GitHub indefinido", { local: "coberto", github: "indefinido" }],
  ])("%s: não manda encerrar nem publicar", (_caso, aposMescla) => {
    const [cmd, motivo] = depois({ aposMescla });
    expect(cmd).toBeNull();
    expect(motivo).toContain("não deu para comparar");
    expect(motivo).toContain("#7");
  });

  test("commit novo só no GitHub: puxar antes, sem encerrar", () => {
    const [cmd, motivo] = depois({ aposMescla: { local: "coberto", github: "trabalho-novo" } });
    expect(cmd).toBeNull();
    expect(motivo).toContain("git pull --ff-only");
  });
});

const pastas: string[] = [];
afterAll(() => {
  for (const pasta of pastas) rmSync(pasta, { recursive: true, force: true });
});

/**
 * Repositório temporário na situação logo depois de um PR parcial: a `main` com um commit, a branch
 * `card` com um commit a mais (`mesclado`, o headRefOid do PR) e a `origin/main` ainda no começo.
 */
function repositorio() {
  const pasta = mkdtempSync(path.join(tmpdir(), "harness-"));
  pastas.push(pasta);
  const g = (...args: string[]) =>
    execFileSync("git", args, { cwd: pasta, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const escrever = (arquivo: string, texto: string) => writeFileSync(path.join(pasta, arquivo), `${texto}\n`);
  const commit = (arquivo: string, texto: string) => {
    escrever(arquivo, texto);
    g("add", arquivo);
    g("commit", "-m", `${arquivo}: ${texto}`);
    return g("rev-parse", "HEAD");
  };
  const publicarMain = () => g("update-ref", "refs/remotes/origin/main", "refs/heads/main");
  /** Faz na `main` (e na `origin/main`) o que a função mandar e volta para a branch do card. */
  const naMain = (fazer: () => void) => {
    g("checkout", "-q", "main");
    fazer();
    publicarMain();
    g("checkout", "-q", "card");
  };
  const mesclarPorSquash = () => naMain(() => {
    g("merge", "--squash", "card");
    g("commit", "-m", "squash do card");
  });

  g("init", "-q", "-b", "main");
  g("config", "user.name", "Teste");
  g("config", "user.email", "teste@example.com");
  g("config", "commit.gpgsign", "false");
  g("config", "core.autocrlf", "false");
  commit("base.txt", "base");
  publicarMain();
  g("checkout", "-q", "-b", "card");
  const mesclado = commit("parte-a.txt", "parte A");

  const situacaoDe = (ref = "refs/heads/card", commitMesclado: string | undefined = mesclado) =>
    situacaoAposMescla({ commitMesclado, ref, cwd: pasta });

  return { pasta, g, escrever, commit, naMain, mesclarPorSquash, mesclado, situacaoDe };
}

// Criar processos no Windows é lento, e cada caso chama o Git várias vezes.
const COM_GIT = { timeout: 30_000 };

describe("situacaoAposMescla: a branch só tem o que foi mesclado", COM_GIT, () => {
  test("o HEAD é o commit mesclado", () => {
    expect(repositorio().situacaoDe()).toBe("coberto");
  });

  test("a branch está atrás do commit mesclado", () => {
    const r = repositorio();
    r.g("reset", "-q", "--hard", "HEAD~1");
    expect(r.situacaoDe()).toBe("coberto");
  });

  test("recebeu a main por avanço rápido", () => {
    const r = repositorio();
    r.naMain(() => r.g("merge", "-q", "--no-ff", "-m", "merge do PR", "card"));
    r.g("merge", "-q", "--ff-only", "main");
    expect(r.situacaoDe()).toBe("coberto");
  });

  test("recebeu a main por um merge limpo", () => {
    const r = repositorio();
    r.naMain(() => r.commit("outro.txt", "outro card"));
    r.g("merge", "-q", "--no-ff", "-m", "merge da main", "main");
    expect(r.situacaoDe()).toBe("coberto");
  });

  test("PR mesclado por squash e a main recebida depois", () => {
    const r = repositorio();
    r.mesclarPorSquash();
    r.g("merge", "-q", "--no-ff", "-m", "merge da main", "main");
    expect(r.situacaoDe()).toBe("coberto");
  });

  test("squash com conflito resolvido com a versão da main", () => {
    const r = repositorio();
    r.mesclarPorSquash();
    r.naMain(() => r.commit("parte-a.txt", "parte A alterada na main"));
    expect(() => r.g("merge", "--no-ff", "main")).toThrow();
    r.g("checkout", "--theirs", "parte-a.txt");
    r.g("add", "parte-a.txt");
    r.g("commit", "-m", "merge da main");
    expect(r.situacaoDe()).toBe("coberto");
  });
});

describe("situacaoAposMescla: sobrou trabalho do card", COM_GIT, () => {
  test("commit novo depois do merge", () => {
    const r = repositorio();
    r.commit("parte-b.txt", "parte B");
    expect(r.situacaoDe()).toBe("trabalho-novo");
  });

  test("commit novo depois de receber a main", () => {
    const r = repositorio();
    r.naMain(() => r.commit("outro.txt", "outro card"));
    r.g("merge", "-q", "--no-ff", "-m", "merge da main", "main");
    r.commit("parte-b.txt", "parte B");
    expect(r.situacaoDe()).toBe("trabalho-novo");
  });

  test("merge da main com mudança feita à mão", () => {
    const r = repositorio();
    r.naMain(() => r.commit("outro.txt", "outro card"));
    r.g("merge", "-q", "--no-ff", "--no-commit", "main");
    r.escrever("parte-a.txt", "mexido durante o merge");
    r.g("add", "parte-a.txt");
    r.g("commit", "-m", "merge da main");
    expect(r.situacaoDe()).toBe("trabalho-novo");
  });

  test("merge de uma branch que não é a main", () => {
    const r = repositorio();
    r.g("checkout", "-q", "-b", "outra", "main");
    r.commit("outra.txt", "outra branch");
    r.g("checkout", "-q", "card");
    r.g("merge", "-q", "--no-ff", "-m", "merge de outra", "outra");
    expect(r.situacaoDe()).toBe("trabalho-novo");
  });
});

describe("situacaoAposMescla: não dá para comparar", COM_GIT, () => {
  test("sem o commit mesclado nesta máquina", () => {
    const r = repositorio();
    expect(r.situacaoDe("refs/heads/card", "0".repeat(40))).toBe("indefinido");
    expect(situacaoAposMescla({ commitMesclado: undefined, ref: "refs/heads/card", cwd: r.pasta })).toBe("indefinido");
  });

  test("sem origin/main", () => {
    const r = repositorio();
    r.g("update-ref", "-d", "refs/remotes/origin/main");
    expect(r.situacaoDe()).toBe("indefinido");
  });

  test("ref que não existe", () => {
    expect(repositorio().situacaoDe("refs/heads/sumiu")).toBe("indefinido");
  });
});

describe("compararComMescla", COM_GIT, () => {
  type Repo = ReturnType<typeof repositorio>;
  const comparar = (r: Repo) => compararComMescla({ commitMesclado: r.mesclado, branch: "card", cwd: r.pasta });
  const noGitHub = (r: Repo, sha: string) => r.g("update-ref", "refs/remotes/origin/card", sha);

  test("branch apagada no GitHub conta como coberta", () => {
    expect(comparar(repositorio())).toEqual({ local: "coberto", github: "coberto" });
  });

  test("commit que só está na branch local", () => {
    const r = repositorio();
    noGitHub(r, r.mesclado);
    r.commit("parte-b.txt", "parte B");
    expect(comparar(r)).toEqual({ local: "trabalho-novo", github: "coberto" });
  });

  test("commit que só está no GitHub", () => {
    const r = repositorio();
    noGitHub(r, r.commit("parte-b.txt", "parte B"));
    r.g("reset", "-q", "--hard", r.mesclado);
    expect(comparar(r)).toEqual({ local: "coberto", github: "trabalho-novo" });
  });
});

describe("trazerCommitDoPr", COM_GIT, () => {
  test("busca no GitHub o commit do PR que a máquina não tem", () => {
    const github = repositorio();
    const maquina = repositorio();
    maquina.g("remote", "add", "origin", github.pasta);
    // um commit que só existe no outro repositório, na referência do PR como no GitHub
    const soNoGitHub = github.commit("parte-b.txt", "parte B enviada por outra pessoa");
    github.g("update-ref", "refs/pull/7/head", soNoGitHub);
    const situacao = () => maquina.situacaoDe("refs/heads/card", soNoGitHub);
    expect(situacao()).toBe("indefinido");
    trazerCommitDoPr({ number: 7, headRefOid: soNoGitHub }, maquina.pasta);
    // com o commit na máquina, já dá para comparar
    expect(situacao()).not.toBe("indefinido");
  });
});

describe("motivoParaNaoEncerrar", COM_GIT, () => {
  type Repo = ReturnType<typeof repositorio>;
  const motivo = (r: Repo, headRefOid = r.mesclado) =>
    motivoParaNaoEncerrar({ chave: K, pr: { number: 7, headRefOid }, branch: "card", cwd: r.pasta });

  test("libera quando nada ficou fora do PR mesclado", () => {
    const r = repositorio();
    r.naMain(() => r.commit("outro.txt", "outro card"));
    r.g("merge", "-q", "--no-ff", "-m", "merge da main", "main");
    expect(motivo(r)).toBeNull();
  });

  test("recusa commit que só está na branch local", () => {
    const r = repositorio();
    r.commit("parte-b.txt", "parte B");
    expect(motivo(r)).toContain("tem commit na branch local que não entrou em PR mesclado");
    expect(motivo(r)).toContain(`status ${K}`);
  });

  test("recusa commit que só está no GitHub", () => {
    const r = repositorio();
    r.g("update-ref", "refs/remotes/origin/card", r.commit("parte-b.txt", "parte B"));
    r.g("reset", "-q", "--hard", r.mesclado);
    expect(motivo(r)).toContain("tem commit no GitHub que não entrou em PR mesclado");
  });

  test("recusa quando não dá para comparar", () => {
    expect(motivo(repositorio(), "0".repeat(40))).toContain("Não deu para comparar");
  });
});

describe("relatorioVale: o que vem depois da revisão e da auditoria (SCRUM-98)", COM_GIT, () => {
  /** Repositório com o relatório escrito no HEAD do card (o commit "parte A"). */
  function comRelatorio() {
    const r = repositorio();
    const vale = () => relatorioVale({ commit: r.mesclado, cwd: r.pasta });
    const mesclarMain = () => r.g("merge", "--no-edit", "main");
    return { ...r, vale, mesclarMain };
  }

  test("nada depois: vale", () => {
    expect(comRelatorio().vale()).toBe(true);
  });

  test("CA1: só um merge limpo da main: vale", () => {
    const r = comRelatorio();
    r.naMain(() => r.commit("main.txt", "main andou"));
    r.mesclarMain();
    expect(r.vale()).toBe(true);
  });

  test("commit de trabalho: não vale", () => {
    const r = comRelatorio();
    r.commit("parte-b.txt", "parte B");
    expect(r.vale()).toBe(false);
  });

  test("CA2: merge da main com conflito resolvido à mão: não vale", () => {
    const r = comRelatorio();
    r.naMain(() => r.commit("parte-a.txt", "main mexeu no mesmo arquivo"));
    expect(() => r.mesclarMain()).toThrow();
    r.escrever("parte-a.txt", "resolvido à mão");
    r.g("add", "parte-a.txt");
    r.g("commit", "--no-edit");
    expect(r.vale()).toBe(false);
  });

  test("CA3: merge sem conflito, mas com mudança além do automático: não vale", () => {
    const r = comRelatorio();
    r.naMain(() => r.commit("main.txt", "main andou"));
    r.g("merge", "--no-commit", "--no-ff", "main");
    r.escrever("extra.txt", "editado antes do commit do merge");
    r.g("add", "extra.txt");
    r.g("commit", "--no-edit");
    expect(r.vale()).toBe(false);
  });

  test("CA5: merge com conflito continua invalidando depois de um merge limpo", () => {
    const r = comRelatorio();
    r.naMain(() => r.commit("parte-a.txt", "main mexeu no mesmo arquivo"));
    expect(() => r.mesclarMain()).toThrow();
    r.escrever("parte-a.txt", "resolvido à mão");
    r.g("add", "parte-a.txt");
    r.g("commit", "--no-edit");
    r.naMain(() => r.commit("main2.txt", "main andou de novo"));
    r.mesclarMain();
    expect(r.vale()).toBe(false);
  });

  test("CA6: merge limpo de outra branch que não a main: não vale", () => {
    const r = comRelatorio();
    r.g("checkout", "-q", "-b", "outra", "main");
    r.commit("outra.txt", "outra branch");
    r.g("checkout", "-q", "card");
    r.g("merge", "--no-edit", "outra");
    expect(r.vale()).toBe(false);
  });

  test("sem origin/main não dá para comparar: não vale", () => {
    const r = comRelatorio();
    r.g("update-ref", "-d", "refs/remotes/origin/main");
    expect(r.vale()).toBe(false);
  });

  test("relatório de um commit que não está na branch: não vale", () => {
    const r = comRelatorio();
    r.g("checkout", "-q", "-b", "solta", "main");
    r.commit("solta.txt", "solta");
    r.g("checkout", "-q", "card");
    expect(relatorioVale({ commit: r.g("rev-parse", "solta"), cwd: r.pasta })).toBe(false);
  });
});

describe("proximoPasso com revisão e auditoria invalidadas (SCRUM-98)", () => {
  test("CA2 e CA4: manda revisar de novo e não sugere publicar", () => {
    const vencidas = {
      ...relatorios,
      "revisao.md": { veredito: "APROVADO", vale: false },
      "auditoria.md": { veredito: "LIBERADO", vale: false },
    };
    const [comando] = proximoPasso(situacao({ relatorios: vencidas }));
    expect(comando).toBe(`/revisar-card ${K}`);
  });
});
