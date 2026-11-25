#!/usr/bin/env node
// Ciclo de vida local de um card: worktree, branch e situação das fases.
// Uso: node scripts/harness/card.mjs ajuda
import { execFileSync, execSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  Falha, PASTA_CARD, PASTA_WORKTREES, PROJETO, STATUS, api, branchDoCard, buscarCard, chaveDoCard, git,
  lerArgs, moverCard, pastaPrincipal, principal, slug, urlDoCard, worktreeDoCard,
} from './lib.mjs';
import { compararComMescla, escolherPr, motivoParaNaoEncerrar, proximoPasso, trazerCommitDoPr } from './fluxo.mjs';

const AJUDA = `Card na máquina: worktree em ${PASTA_WORKTREES}/${PROJETO}-xx, branch ${PROJETO}-xx-titulo, relatórios em ${PASTA_CARD}/.

  status ${PROJETO}-12                 onde o card está: worktree, branch, distância da main, fases, PR e próximo passo
  lista                           todas as worktrees de card desta máquina
  iniciar ${PROJETO}-12                cria (ou reaproveita) branch + worktree a partir da origin/main,
                                  copia o .env.local, roda npm ci, atribui o card e move para "${STATUS.fazendo}"
  encerrar ${PROJETO}-12 [--confirmar] depois do PR mesclado: remove worktree e branch local, atualiza a main,
                                  move o card para "${STATUS.pronto}". Sem --confirmar só mostra o que faria.
                                  Recusa se houver commit do card que não entrou em PR mesclado.

Opções: --sem-jira (não lê nem altera o Jira) · --sem-instalar (pula o npm ci) · --sem-fetch
        encerrar --abandonar (descarta um card que NÃO foi mesclado; apaga o trabalho local)`;

const RELATORIOS = ['contexto.md', 'plano.md', 'implementacao.md', 'revisao.md', 'auditoria.md'];
const curto = (sha) => String(sha || '').slice(0, 8);
const porta = (chave) => 3000 + (Number(chave.split('-')[1]) % 1000);

function linhas(texto) {
  return String(texto ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** Lê o cabeçalho (`--- chave: valor ---`) de um relatório de fase. */
function cabecalho(arquivo) {
  if (!existsSync(arquivo)) return null;
  const m = readFileSync(arquivo, 'utf8').replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const campos = {};
  if (m) for (const l of m[1].split(/\r?\n/)) {
    const c = l.match(/^([\w-]+):\s*(.*)$/);
    if (c) campos[c[1]] = c[2].trim();
  }
  return campos;
}

/**
 * O relatório ainda vale para o HEAD? Vale se o commit registrado é ancestral do HEAD e, depois dele,
 * só entraram merges da main (sincronização), nenhum commit de trabalho.
 */
function valeParaHead(commit, pasta) {
  if (!commit) return false;
  if (git(['merge-base', '--is-ancestor', commit, 'HEAD'], { cwd: pasta, tolerante: true }) === null) return false;
  return git(['rev-list', '--count', '--no-merges', '--first-parent', `${commit}..HEAD`], { cwd: pasta }) === '0';
}

function prDaBranch(branch, raiz) {
  try {
    const saida = execFileSync('gh', ['pr', 'list', '--head', branch, '--state', 'all', '--limit', '20',
      '--json', 'number,state,url,isDraft,mergedAt,headRefOid'], { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, pr: escolherPr(JSON.parse(saida)) };
  } catch (e) {
    return { ok: false, erro: String(e.stderr || e.message).trim().split('\n')[0] };
  }
}

function branchesDoCard(chave, raiz) {
  const locais = linhas(git(['branch', '--list', `${chave}*`, '--format=%(refname:short)'], { cwd: raiz }))
    .filter((b) => branchDoCard(b, chave));
  const remotas = linhas(git(['branch', '-r', '--list', `origin/${chave}*`, '--format=%(refname:short)'], { cwd: raiz }))
    .map((b) => b.replace(/^origin\//, '')).filter((b) => branchDoCard(b, chave));
  return { locais, remotas };
}

// ------------------------------------------------------------------ status

async function coletar(chave, flags) {
  const raiz = pastaPrincipal();
  if (!flags['sem-fetch']) git(['fetch', 'origin', '--prune'], { cwd: raiz, tolerante: true });
  const s = { chave, raiz, porta: porta(chave) };

  if (!flags['sem-jira']) {
    try {
      const c = await buscarCard(chave);
      s.jira = {
        titulo: c.fields.summary, tipo: c.fields.issuetype?.name, status: c.fields.status?.name,
        categoria: c.fields.status?.statusCategory?.key, responsavel: c.fields.assignee?.displayName ?? null,
      };
    } catch (e) { s.jiraErro = e.message; }
  }

  const wt = worktreeDoCard(chave, raiz);
  if (!wt) {
    s.branches = branchesDoCard(chave, raiz);
    return s;
  }
  const cwd = wt.pasta;
  s.worktree = wt.pasta;
  s.branch = wt.branch;
  s.head = git(['rev-parse', 'HEAD'], { cwd });
  s.sujo = linhas(git(['status', '--porcelain'], { cwd }));
  const [atras, afrente] = git(['rev-list', '--left-right', '--count', 'origin/main...HEAD'], { cwd }).split(/\s+/).map(Number);
  s.atras = atras;
  s.afrente = afrente;
  const temRemota = git(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${wt.branch}`], { cwd, tolerante: true });
  s.publicada = Boolean(temRemota);
  if (temRemota) {
    const [faltaPuxar, faltaEnviar] = git(['rev-list', '--left-right', '--count', `origin/${wt.branch}...HEAD`], { cwd }).split(/\s+/).map(Number);
    s.faltaPuxar = faltaPuxar;
    s.faltaEnviar = faltaEnviar;
  }
  s.dependencias = existsSync(path.join(cwd, 'node_modules'));
  s.env = existsSync(path.join(cwd, '.env.local'));
  s.relatorios = {};
  for (const nome of RELATORIOS) {
    const campos = cabecalho(path.join(cwd, PASTA_CARD, nome));
    if (!campos) continue;
    s.relatorios[nome] = { ...campos, vale: campos.commit ? valeParaHead(campos.commit, cwd) : null };
  }
  s.gh = prDaBranch(wt.branch, raiz);
  const pr = s.gh.pr;
  if (pr?.state === 'MERGED') {
    if (!flags['sem-fetch']) trazerCommitDoPr(pr, cwd);
    s.aposMescla = compararComMescla({ commitMesclado: pr.headRefOid, branch: wt.branch, cwd });
  }
  return s;
}

function imprimir(s) {
  const out = [];
  out.push(`CARD ${s.chave}${s.jira ? ` · ${s.jira.titulo}` : ''}`);
  if (s.jira) out.push(`  Jira ........ ${s.jira.tipo} · ${s.jira.status} · responsável: ${s.jira.responsavel ?? 'ninguém'}`);
  if (s.jiraErro) out.push(`  Jira ........ NÃO CONSULTADO: ${s.jiraErro}`);
  out.push(`  Principal ... ${s.raiz}`);
  if (!s.worktree) {
    out.push('  Worktree .... não existe nesta máquina');
    const { locais, remotas } = s.branches;
    if (locais.length) out.push(`  Branch local  ${locais.join(', ')}`);
    if (remotas.length) out.push(`  No GitHub ... ${remotas.map((b) => `origin/${b}`).join(', ')} (outro operador já começou)`);
  } else {
    out.push(`  Worktree .... ${s.worktree}`);
    out.push(`  Branch ...... ${s.branch} @ ${curto(s.head)}`);
    out.push(`  vs main ..... ${s.afrente} commit(s) à frente, ${s.atras} atrás da origin/main`);
    out.push(`  GitHub ...... ${!s.publicada ? 'branch ainda não enviada' : `enviada (${s.faltaEnviar} para enviar, ${s.faltaPuxar} para puxar)`}`);
    out.push(`  Sem commit .. ${s.sujo.length ? `${s.sujo.length} arquivo(s):` : 'nada (árvore limpa)'}`);
    for (const l of s.sujo.slice(0, 15)) out.push(`                ${l}`);
    if (s.sujo.length > 15) out.push(`                ... e mais ${s.sujo.length - 15}`);
    out.push(`  Ambiente .... node_modules: ${s.dependencias ? 'ok' : 'FALTA (npm ci)'} · .env.local: ${s.env ? 'ok' : 'FALTA'} · porta do dev: ${s.porta}`);
    out.push('  Fases:');
    for (const nome of RELATORIOS) {
      const r = s.relatorios[nome];
      if (!r) { out.push(`    ${nome.padEnd(17)} -`); continue; }
      const partes = [];
      if (r.veredito) partes.push(r.veredito);
      const venceu = r.veredito && !r.vale;
      if (r.commit) partes.push(`commit ${curto(r.commit)}${venceu ? ' (DESATUALIZADO: há commit novo depois)' : ''}`);
      if (r.data) partes.push(r.data);
      out.push(`    ${nome.padEnd(17)} ${partes.join(' · ') || 'existe'}`);
    }
    if (s.gh.ok) out.push(`  PR .......... ${s.gh.pr ? `#${s.gh.pr.number} ${s.gh.pr.state}${s.gh.pr.isDraft ? ' (rascunho)' : ''} ${s.gh.pr.url}` : 'nenhum'}`);
    else out.push(`  PR .......... NÃO CONSULTADO (${s.gh.erro})`);
  }
  const [comando, motivo] = proximoPasso(s);
  out.push('', comando ? `PRÓXIMO PASSO: ${comando}   (${motivo})` : `PRÓXIMO PASSO: ${motivo}`);
  console.log(out.join('\n'));
}

async function status({ pos, flags }) {
  imprimir(await coletar(chaveDoCard(pos[0]), flags));
}

function lista() {
  const raiz = pastaPrincipal();
  const cards = git(['worktree', 'list', '--porcelain'], { cwd: raiz }).split(/\r?\n\r?\n/)
    .map((b) => ({ pasta: (b.match(/^worktree (.+)$/m) || [])[1], branch: (b.match(/^branch refs\/heads\/(.+)$/m) || [])[1] }))
    .filter((w) => w.branch && new RegExp(`^${PROJETO}-\\d+`).test(w.branch));
  if (!cards.length) { console.log('Nenhuma worktree de card nesta máquina.'); return; }
  for (const w of cards) console.log(`${w.branch.match(new RegExp(`^${PROJETO}-\\d+`))[0].padEnd(10)} ${w.branch}\n           ${path.normalize(w.pasta)}`);
}

// ----------------------------------------------------------------- iniciar

async function iniciar({ pos, flags }) {
  const chave = chaveDoCard(pos[0]);
  const raiz = pastaPrincipal();
  const passo = (t) => console.log(`> ${t}`);

  passo('Atualizando as referências do GitHub (git fetch)');
  git(['fetch', 'origin', '--prune'], { cwd: raiz });
  if (git(['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main'], { cwd: raiz, tolerante: true }) === null) {
    throw new Falha('Não achei origin/main. Confira o remoto com "git remote -v".');
  }

  let card = null;
  let eu = null;
  if (!flags['sem-jira']) {
    passo(`Lendo ${chave} no Jira`);
    card = await buscarCard(chave);
    eu = await api('GET', '/rest/api/3/myself');
    const f = card.fields;
    if (f.issuetype?.hierarchyLevel > 0 || /^epic$/i.test(f.issuetype?.name)) {
      throw new Falha(`${chave} é um épico ("${f.summary}"). Inicie um card filho (História ou Tarefa), não o épico.`);
    }
    if (f.status?.statusCategory?.key === 'done' && !flags.forcar) {
      throw new Falha(`${chave} já está em "${f.status.name}". Se for reabrir de propósito, mova o card no Jira ou use --forcar.`);
    }
    if (f.assignee && f.assignee.accountId !== eu.accountId && !flags.forcar) {
      throw new Falha(`${chave} está com ${f.assignee.displayName}. Combine com a pessoa antes; para assumir mesmo assim use --forcar.`);
    }
  }

  let wt = worktreeDoCard(chave, raiz);
  if (wt) {
    passo(`Worktree já existe: ${wt.pasta} (branch ${wt.branch})`);
  } else {
    const pasta = path.join(raiz, PASTA_WORKTREES, chave);
    if (existsSync(pasta)) throw new Falha(`A pasta ${pasta} existe mas não é uma worktree do Git. Apague-a ou rode "git worktree prune".`);
    const { locais, remotas } = branchesDoCard(chave, raiz);
    const candidatas = [...new Set([...locais, ...remotas])];
    if (candidatas.length > 1) throw new Falha(`Há mais de uma branch para ${chave}: ${candidatas.join(', ')}. Apague a que sobra antes de iniciar.`);
    let branch = candidatas[0];
    if (branch && locais.includes(branch)) {
      passo(`Reaproveitando a branch local ${branch}`);
      git(['worktree', 'add', pasta, branch], { cwd: raiz });
    } else if (branch) {
      passo(`Continuando a branch que já está no GitHub: origin/${branch}`);
      git(['worktree', 'add', '--track', '-b', branch, pasta, `origin/${branch}`], { cwd: raiz });
    } else {
      const titulo = card?.fields.summary ?? (typeof flags.titulo === 'string' ? flags.titulo : '');
      const sufixo = slug(titulo);
      branch = sufixo ? `${chave}-${sufixo}` : chave;
      passo(`Criando a branch ${branch} a partir da origin/main`);
      git(['worktree', 'add', '--no-track', '-b', branch, pasta, 'origin/main'], { cwd: raiz });
    }
    wt = { pasta, branch };
  }

  mkdirSync(path.join(wt.pasta, PASTA_CARD), { recursive: true });
  // .card/ nunca vai para o Git, mesmo numa branch antiga cujo .gitignore ainda não o ignora.
  const exclude = path.join(path.resolve(raiz, git(['rev-parse', '--git-common-dir'], { cwd: raiz })), 'info', 'exclude');
  const atual = existsSync(exclude) ? readFileSync(exclude, 'utf8') : '';
  if (!atual.split(/\r?\n/).includes(`${PASTA_CARD}/`)) {
    mkdirSync(path.dirname(exclude), { recursive: true });
    appendFileSync(exclude, (atual && !atual.endsWith('\n') ? '\n' : '') + `${PASTA_CARD}/\n`);
  }

  const envOrigem = path.join(raiz, '.env.local');
  const envDestino = path.join(wt.pasta, '.env.local');
  if (existsSync(envDestino)) passo('.env.local já está na worktree');
  else if (existsSync(envOrigem)) { copyFileSync(envOrigem, envDestino); passo('.env.local copiado da pasta principal'); }
  else console.log('! AVISO: a pasta principal não tem .env.local; o app não vai subir sem ele.');

  if (flags['sem-instalar']) passo('npm ci pulado (--sem-instalar)');
  else if (existsSync(path.join(wt.pasta, 'node_modules'))) passo('node_modules já existe (rode "npm ci" na worktree se o package-lock mudou)');
  else {
    passo('Instalando dependências na worktree (npm ci), leva um ou dois minutos');
    try { execSync('npm ci --no-audit --no-fund', { cwd: wt.pasta, stdio: ['ignore', 'inherit', 'inherit'] }); }
    catch { console.log('! AVISO: npm ci falhou. Rode à mão dentro da worktree e leia o erro (npm 12 bloqueia scripts de instalação: veja o CLAUDE.md).'); }
  }

  if (card) {
    if (!card.fields.assignee) {
      await api('PUT', `/rest/api/3/issue/${chave}/assignee`, { accountId: eu.accountId });
      passo(`Card atribuído a ${eu.displayName}`);
    }
    if (card.fields.status?.statusCategory?.key === 'new') {
      await moverCard(chave, STATUS.fazendo);
      passo(`Card movido para "${STATUS.fazendo}"`);
    }
  }

  console.log('');
  imprimir(await coletar(chave, { ...flags, 'sem-fetch': true }));
}

// ---------------------------------------------------------------- encerrar

async function encerrar({ pos, flags }) {
  const chave = chaveDoCard(pos[0]);
  const raiz = pastaPrincipal();
  git(['fetch', 'origin', '--prune'], { cwd: raiz, tolerante: true });
  const wt = worktreeDoCard(chave, raiz);
  const { locais } = branchesDoCard(chave, raiz);
  const branch = wt?.branch ?? locais[0];
  if (!wt && !branch) throw new Falha(`Não há worktree nem branch local de ${chave} nesta máquina. Nada para encerrar aqui.`);
  if (wt && path.resolve(process.cwd()).toLowerCase().startsWith(path.resolve(wt.pasta).toLowerCase())) {
    throw new Falha(`Rode este comando da pasta principal (${raiz}), não de dentro da worktree que vai ser removida.`);
  }

  const abandonar = Boolean(flags.abandonar);
  const gh = prDaBranch(branch, raiz);
  if (!abandonar) {
    if (!gh.ok) throw new Falha(`Não consegui consultar o PR (${gh.erro}). Rode "gh auth status".`);
    if (!gh.pr) throw new Falha(`${branch} não tem PR. Se o card foi desistido, use --abandonar (apaga o trabalho local).`);
    if (gh.pr.state !== 'MERGED') throw new Falha(`O PR #${gh.pr.number} está ${gh.pr.state}, não mesclado. Encerrar é só depois do merge (${gh.pr.url}).`);
    trazerCommitDoPr(gh.pr, raiz);
    const motivo = motivoParaNaoEncerrar({ chave, pr: gh.pr, branch, cwd: raiz });
    if (motivo) throw new Falha(motivo);
  }
  const sujo = wt ? linhas(git(['status', '--porcelain'], { cwd: wt.pasta })) : [];
  if (sujo.length && !abandonar) {
    throw new Falha(`A worktree tem ${sujo.length} arquivo(s) sem commit:\n${sujo.slice(0, 20).join('\n')}\nGuarde ou descarte antes de encerrar.`);
  }

  const plano = [];
  if (wt) plano.push(`remover a worktree ${wt.pasta} (com node_modules e ${PASTA_CARD}/)`);
  if (branch && locais.includes(branch)) plano.push(`apagar a branch local ${branch}`);
  plano.push('atualizar a main da pasta principal (git pull --ff-only), se ela estiver na main e limpa');
  if (!abandonar && !flags['sem-jira']) plano.push(`mover ${chave} para "${STATUS.pronto}" no Jira`);
  if (abandonar) plano.push('NÃO mexer no Jira (card abandonado: ajuste o status à mão)');

  if (!flags.confirmar) {
    console.log(`Encerrar ${chave}${abandonar ? ' (ABANDONANDO, sem merge)' : ` (PR #${gh.pr.number} mesclado)`} faria:\n- ${plano.join('\n- ')}`);
    if (abandonar && sujo.length) console.log(`\nATENÇÃO: ${sujo.length} arquivo(s) sem commit serão perdidos:\n${sujo.slice(0, 20).join('\n')}`);
    console.log('\nNada foi feito. Para executar, repita com --confirmar.');
    return;
  }

  if (wt) {
    try { git(['worktree', 'remove', '--force', wt.pasta], { cwd: raiz }); }
    catch (e) { throw new Falha(`Não consegui remover a worktree (algum programa está com arquivos abertos? feche o "npm run dev" e o editor dela):\n${e.message}`); }
    console.log(`> Worktree removida: ${wt.pasta}`);
  }
  git(['worktree', 'prune'], { cwd: raiz });
  if (branch && locais.includes(branch)) {
    git(['branch', '-D', branch], { cwd: raiz });
    console.log(`> Branch local apagada: ${branch}`);
  }
  const naMain = git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: raiz }) === 'main';
  const limpa = !linhas(git(['status', '--porcelain', '--untracked-files=no'], { cwd: raiz })).length;
  if (naMain && limpa) {
    const r = git(['pull', '--ff-only', 'origin', 'main'], { cwd: raiz, tolerante: true });
    console.log(r === null ? '! AVISO: não consegui atualizar a main (rode "git pull" na pasta principal).' : '> Pasta principal atualizada com a main');
  } else {
    console.log(`! AVISO: a pasta principal ${naMain ? 'tem mudanças sem commit' : 'não está na main'}; não rodei o git pull.`);
  }
  if (!abandonar && !flags['sem-jira']) {
    const r = await moverCard(chave, STATUS.pronto);
    console.log(`> ${chave} ${r === 'ja-estava' ? 'já estava em' : 'movido para'} "${STATUS.pronto}": ${urlDoCard(chave)}`);
  }
  console.log(`\n${chave} encerrado.`);
}

await principal(async () => {
  const [nome = 'ajuda', ...resto] = process.argv.slice(2);
  const comandos = { ajuda: () => console.log(AJUDA), status, lista, iniciar, encerrar };
  if (!comandos[nome]) throw new Falha(`Comando desconhecido: ${nome}. Rode "node scripts/harness/card.mjs ajuda".`);
  await comandos[nome](lerArgs(resto, ['sem-jira', 'sem-instalar', 'sem-fetch', 'confirmar', 'abandonar', 'forcar']));
});
