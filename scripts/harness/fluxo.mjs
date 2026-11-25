// Decisões do fluxo de cards: qual PR da branch vale, o que sobrou depois do merge e qual é o próximo passo.
// Fica fora do card.mjs para poder ser testado: importar este módulo não executa nada.
import { STATUS, git } from './lib.mjs';

/** O PR mais relevante da branch: aberto > mesclado > fechado; entre os mesclados, o mais recente. */
export function escolherPr(prs) {
  const ordem = { OPEN: 0, MERGED: 1, CLOSED: 2 };
  const mescladoEm = (pr) => Date.parse(pr.mergedAt ?? '') || 0;
  return [...prs].sort((a, b) => ordem[a.state] - ordem[b.state] || mescladoEm(b) - mescladoEm(a))[0] || null;
}

/**
 * O merge só trouxe a main, sem mudança própria? Vale se a árvore dele é a de um pai que já está na
 * origin/main (conflito resolvido com a versão da main) ou a que o Git produz sozinho juntando os dois pais.
 */
function mergeSoSincronizou(sha, pais, ler) {
  const arvore = ler(['rev-parse', `${sha}^{tree}`]);
  if (arvore === null) return false;
  const igualAUmPaiDaMain = pais.some((pai) => ler(['merge-base', '--is-ancestor', pai, 'refs/remotes/origin/main']) !== null
    && ler(['rev-parse', `${pai}^{tree}`]) === arvore);
  if (igualAUmPaiDaMain) return true;
  // merge-tree sai com código diferente de 0 quando há conflito (e em Git anterior ao 2.38).
  return ler(['merge-tree', '--write-tree', ...pais])?.split('\n')[0] === arvore;
}

/**
 * O merge é um merge limpo da main? Um dos pais está na origin/main e a árvore é exatamente a que o Git
 * produz sozinho juntando os dois pais, sem conflito (merge-tree sai com código 1 quando há conflito).
 */
function mergeLimpoDaMain(sha, pais, ler) {
  const daMain = pais.some((pai) => ler(['merge-base', '--is-ancestor', pai, 'refs/remotes/origin/main']) !== null);
  if (!daMain) return false;
  const arvore = ler(['rev-parse', `${sha}^{tree}`]);
  return arvore !== null && ler(['merge-tree', '--write-tree', ...pais])?.split('\n')[0] === arvore;
}

/**
 * A revisão ou a auditoria escrita no `commit` ainda vale para `ref`? Vale se o commit é ancestral de `ref` e,
 * depois dele, só entraram merges limpos da main. Invalida: commit de trabalho, merge com conflito resolvido à
 * mão, merge com mudança além da automática e merge de outra branch que não a main (SCRUM-98).
 * Se a comparação não puder ser feita (sem origin/main, Git anterior ao 2.38), o relatório não vale.
 */
export function relatorioVale({ commit, cwd, ref = 'HEAD' }) {
  const ler = (args) => git(args, { cwd, tolerante: true });
  if (!commit || ler(['merge-base', '--is-ancestor', commit, ref]) === null) return false;
  const saida = ler(['rev-list', '--parents', ref, `^${commit}`, '^refs/remotes/origin/main']);
  if (saida === null) return false;
  return saida.split('\n').filter(Boolean).every((linha) => {
    const [sha, ...pais] = linha.trim().split(' ');
    return pais.length === 2 && mergeLimpoDaMain(sha, pais, ler);
  });
}

/**
 * O que `ref` tem além do que o PR mesclado levou (`commitMesclado` é o headRefOid dele):
 * 'coberto' (nada, ou só a main recebida), 'trabalho-novo' ou 'indefinido' (não deu para comparar).
 */
export function situacaoAposMescla({ commitMesclado, ref, cwd }) {
  const ler = (args) => git(args, { cwd, tolerante: true });
  if (!commitMesclado || ler(['cat-file', '-e', `${commitMesclado}^{commit}`]) === null) return 'indefinido';
  // Sem --no-merges nem --first-parent: commit vindo de outra branch também é trabalho do card.
  const saida = ler(['rev-list', '--parents', ref, `^${commitMesclado}`, '^refs/remotes/origin/main']);
  if (saida === null) return 'indefinido';
  const coberto = saida.split('\n').filter(Boolean).every((linha) => {
    const [sha, ...pais] = linha.trim().split(' ');
    return pais.length === 2 && mergeSoSincronizou(sha, pais, ler);
  });
  return coberto ? 'coberto' : 'trabalho-novo';
}

/** Traz do GitHub o commit que o PR levou, se esta máquina não o tem (ex.: a branch já foi apagada lá). */
export function trazerCommitDoPr(pr, cwd) {
  if (!pr.headRefOid || git(['cat-file', '-e', `${pr.headRefOid}^{commit}`], { cwd, tolerante: true }) !== null) return;
  git(['fetch', 'origin', `refs/pull/${pr.number}/head`], { cwd, tolerante: true });
}

/**
 * Compara com o commit do PR mesclado a branch local e a do GitHub (outra pessoa pode ter enviado a parte
 * seguinte). Branch que não existe mais no GitHub não tem nada a mais: conta como 'coberto'.
 */
export function compararComMescla({ commitMesclado, branch, cwd }) {
  const comparar = (ref) => situacaoAposMescla({ commitMesclado, ref, cwd });
  const remota = `refs/remotes/origin/${branch}`;
  const temRemota = git(['rev-parse', '--verify', '--quiet', remota], { cwd, tolerante: true }) !== null;
  return { local: comparar(`refs/heads/${branch}`), github: temRemota ? comparar(remota) : 'coberto' };
}

/**
 * Por que o `encerrar` não pode apagar a branch depois do PR mesclado: a mensagem de recusa, ou null
 * quando não há nela (aqui ou no GitHub) trabalho fora do que o PR levou. Na dúvida, recusa.
 */
export function motivoParaNaoEncerrar({ chave, pr, branch, cwd }) {
  const { local, github } = compararComMescla({ commitMesclado: pr.headRefOid, branch, cwd });
  const nada = 'Nada foi apagado nem mudou no Jira.';
  const onde = [local === 'trabalho-novo' && 'na branch local', github === 'trabalho-novo' && 'no GitHub'].filter(Boolean);
  if (onde.length) {
    return `${branch} tem commit ${onde.join(' e ')} que não entrou em PR mesclado (o último foi o #${pr.number}). ${nada}\n`
      + `O card segue no fluxo: rode "node scripts/harness/card.mjs status ${chave}".`;
  }
  if (local === 'indefinido' || github === 'indefinido') {
    return `Não deu para comparar ${branch} com o commit do PR #${pr.number} mesclado. ${nada} Rode "git fetch" e tente de novo.`;
  }
  return null;
}

/** [comando, motivo] a partir da situação coletada pelo `status`. Sem comando, o motivo diz o que esperar. */
export function proximoPasso(s) {
  const k = s.chave;
  const r = s.relatorios ?? {};
  const pr = s.gh?.pr;
  if (pr?.state === 'MERGED') {
    // Card entregue em partes: só se encerra quando não sobrou trabalho além do que o PR levou.
    const { local = 'indefinido', github = 'indefinido' } = s.aposMescla ?? {};
    if (local === 'indefinido' || github === 'indefinido') {
      return [null, `não deu para comparar a branch com o commit do PR #${pr.number}, já mesclado. Rode "git fetch" e o status de novo`];
    }
    if (local === 'coberto') {
      if (github === 'coberto') return [`/encerrar-card ${k}`, 'o PR já foi mesclado'];
      return [null, `o GitHub tem commit posterior ao PR #${pr.number} mesclado que não está nesta worktree. Rode "git pull --ff-only" nela e o status de novo`];
    }
  }
  if (!s.worktree) return [`/iniciar-card ${k}`, 'o card ainda não tem worktree nesta máquina'];
  if (!r['contexto.md'] || !r['plano.md']) return [`/entender-card ${k}`, 'falta o contexto e o plano'];
  if (!r['implementacao.md']) return [`/implementar-card ${k}`, 'o plano ainda não foi implementado'];
  if (s.sujo.length) return [`/implementar-card ${k}`, 'há mudanças sem commit na worktree'];
  const rev = r['revisao.md'];
  if (!rev || !rev.vale) return [`/revisar-card ${k}`, rev ? 'entrou commit (ou merge com conflito) depois da última revisão' : 'ainda não foi revisado'];
  if (rev.veredito !== 'APROVADO') return [`/implementar-card ${k}`, 'a revisão pediu ajustes'];
  const aud = r['auditoria.md'];
  if (!aud || !aud.vale) return [`/auditar-codigo ${k}`, aud ? 'entrou commit (ou merge com conflito) depois da última auditoria' : 'ainda não foi auditado'];
  if (aud.veredito !== 'LIBERADO') return [`/implementar-card ${k}`, 'a auditoria bloqueou'];
  if (s.atras > 0) return [`/auditar-codigo ${k}`, `a main andou ${s.atras} commit(s) depois da auditoria`];
  if (pr?.state === 'MERGED') {
    return [`/publicar-pr ${k}`, `revisado e auditado; o PR #${pr.number} já foi mesclado, falta um PR novo`];
  }
  if (!pr || pr.state === 'CLOSED') return [`/publicar-pr ${k}`, 'revisado e auditado, falta o PR'];
  if (s.faltaEnviar > 0) return [`/publicar-pr ${k}`, 'há commits locais que ainda não foram para o PR'];
  return [null, `PR #${pr.number} aberto: aguardando teste e merge. Depois do merge: /encerrar-card ${k}. `
    + `Se o PR for parcial, não encerre: volte o card para "${STATUS.fazendo}" e siga com /implementar-card ${k}`];
}
