// Decisões do fluxo de cards: qual PR da branch vale, o que sobrou depois do merge e qual é o próximo passo.
// Fica fora do card.mjs para poder ser testado: importar este módulo não executa nada.
import { git } from './lib.mjs';

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

/** [comando, motivo] a partir da situação coletada pelo `status`. Sem comando, o motivo diz o que esperar. */
export function proximoPasso(s) {
  const k = s.chave;
  const r = s.relatorios ?? {};
  const pr = s.gh?.pr;
  if (pr?.state === 'MERGED') return [`/encerrar-card ${k}`, 'o PR já foi mesclado'];
  if (!s.worktree) return [`/iniciar-card ${k}`, 'o card ainda não tem worktree nesta máquina'];
  if (!r['contexto.md'] || !r['plano.md']) return [`/entender-card ${k}`, 'falta o contexto e o plano'];
  if (!r['implementacao.md']) return [`/implementar-card ${k}`, 'o plano ainda não foi implementado'];
  if (s.sujo.length) return [`/implementar-card ${k}`, 'há mudanças sem commit na worktree'];
  const rev = r['revisao.md'];
  if (!rev || !rev.vale) return [`/revisar-card ${k}`, rev ? 'entrou commit depois da última revisão' : 'ainda não foi revisado'];
  if (rev.veredito !== 'APROVADO') return [`/implementar-card ${k}`, 'a revisão pediu ajustes'];
  const aud = r['auditoria.md'];
  if (!aud || !aud.vale) return [`/auditar-codigo ${k}`, aud ? 'entrou commit depois da última auditoria' : 'ainda não foi auditado'];
  if (aud.veredito !== 'LIBERADO') return [`/implementar-card ${k}`, 'a auditoria bloqueou'];
  if (s.atras > 0) return [`/auditar-codigo ${k}`, `a main andou ${s.atras} commit(s) depois da auditoria`];
  if (!pr || pr.state === 'CLOSED') return [`/publicar-pr ${k}`, 'revisado e auditado, falta o PR'];
  if (s.faltaEnviar > 0) return [`/publicar-pr ${k}`, 'há commits locais que ainda não foram para o PR'];
  return [null, `PR #${pr.number} aberto: aguardando teste e merge. Depois do merge: /encerrar-card ${k}`];
}
