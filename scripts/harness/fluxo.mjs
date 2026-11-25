// Decisões do fluxo de cards: qual PR da branch vale e qual é o próximo passo.
// Fica fora do card.mjs para poder ser testado: importar este módulo não executa nada.

/** O PR mais relevante da branch: aberto > mesclado > fechado; entre os mesclados, o mais recente. */
export function escolherPr(prs) {
  const ordem = { OPEN: 0, MERGED: 1, CLOSED: 2 };
  const mescladoEm = (pr) => Date.parse(pr.mergedAt ?? '') || 0;
  return [...prs].sort((a, b) => ordem[a.state] - ordem[b.state] || mescladoEm(b) - mescladoEm(a))[0] || null;
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
