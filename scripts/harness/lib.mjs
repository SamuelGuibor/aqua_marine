// Base do harness de cards: Git, .env.local, REST API do Jira e conversão Markdown <-> ADF.
// Sem dependências: só Node. O token do Jira é lido do .env.local e nunca é impresso.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PROJETO = 'SCRUM';
export const PASTA_WORKTREES = '.worktrees';
export const PASTA_CARD = '.card';
export const RE_CHAVE = new RegExp(`^${PROJETO}-\\d+$`);
/** Status do quadro do Jira usados pelo fluxo. Se o quadro mudar, mude só aqui. */
export const STATUS = { fazendo: 'Em andamento', emTeste: 'Testes', pronto: 'Concluído' };

export class Falha extends Error {}

// ---------------------------------------------------------------- argumentos

/** Separa posicionais e flags (`--nome valor`, `--nome=valor`, `--liga`). Flags repetidas viram lista. */
export function lerArgs(argv, booleanas = []) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { pos.push(a); continue; }
    let [nome, valor] = a.slice(2).split(/=(.*)/s, 2);
    if (valor === undefined) {
      if (booleanas.includes(nome) || i + 1 >= argv.length || argv[i + 1].startsWith('--')) valor = true;
      else valor = argv[++i];
    }
    if (nome in flags) flags[nome] = [].concat(flags[nome], valor);
    else flags[nome] = valor;
  }
  return { pos, flags };
}

export function chaveDoCard(texto) {
  const chave = String(texto ?? '').trim().toUpperCase();
  if (!RE_CHAVE.test(chave)) throw new Falha(`Chave de card inválida: "${texto ?? ''}". Use o formato ${PROJETO}-12.`);
  return chave;
}

export const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// ---------------------------------------------------------------------- git

export function git(args, { cwd, tolerante = false } = {}) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (tolerante) return null;
    throw new Falha(`git ${args.join(' ')} falhou:\n${String(e.stderr || e.message).trim()}`);
  }
}

/** Pasta principal do repositório (a primeira de `git worktree list`), de onde quer que o script rode. */
export function pastaPrincipal(cwd = process.cwd()) {
  const saida = git(['worktree', 'list', '--porcelain'], { cwd });
  const m = saida.match(/^worktree (.+)$/m);
  if (!m) throw new Falha('Não achei o repositório Git. Rode o comando de dentro do projeto.');
  return path.normalize(m[1]);
}

/** Lista as worktrees: [{ pasta, head, branch }]. */
export function worktrees(cwd = process.cwd()) {
  const blocos = git(['worktree', 'list', '--porcelain'], { cwd }).split(/\r?\n\r?\n/);
  return blocos.filter(Boolean).map((b) => ({
    pasta: path.normalize((b.match(/^worktree (.+)$/m) || [])[1] || ''),
    head: (b.match(/^HEAD (.+)$/m) || [])[1] || '',
    branch: ((b.match(/^branch refs\/heads\/(.+)$/m) || [])[1] || '').trim(),
  }));
}

/** A branch pertence ao card? Aceita `SCRUM-12` e `SCRUM-12-qualquer-coisa` (mas não `SCRUM-123`). */
export const branchDoCard = (branch, chave) => branch === chave || branch.startsWith(`${chave}-`);

export function worktreeDoCard(chave, cwd = process.cwd()) {
  return worktrees(cwd).find((w) => branchDoCard(w.branch, chave)) || null;
}

export function slug(titulo, max = 40) {
  const limpo = semAcento(titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (limpo.length <= max) return limpo;
  const corte = limpo.slice(0, max);
  const ultimo = corte.lastIndexOf('-');
  return (ultimo > 15 ? corte.slice(0, ultimo) : corte).replace(/-+$/, '');
}

// --------------------------------------------------------------- .env.local

export function lerEnv(arquivo) {
  const env = {};
  if (!existsSync(arquivo)) return env;
  for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    const aspas = v.match(/^(["'])(.*?)\1/);
    if (aspas) v = aspas[2];
    else v = v.replace(/\s+#.*$/, '').trim();
    env[m[1]] = v;
  }
  return env;
}

let credenciais;
function jiraEnv() {
  if (credenciais) return credenciais;
  const candidatos = [path.join(process.cwd(), '.env.local')];
  try { candidatos.push(path.join(pastaPrincipal(), '.env.local')); } catch { /* fora do Git */ }
  let env = {};
  for (const arq of candidatos) {
    for (const [k, v] of Object.entries(lerEnv(arq))) if (v && !env[k]) env[k] = v;
    if (env.JIRA_BASE_URL && env.JIRA_EMAIL && env.JIRA_API_TOKEN) break;
  }
  const faltam = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'].filter((k) => !env[k]);
  if (faltam.length) {
    throw new Falha(`Faltam no .env.local: ${faltam.join(', ')}. Veja o guia em docs/harness/README.md (preparar a máquina).`);
  }
  const base = env.JIRA_BASE_URL.replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.atlassian\.net$/.test(base)) {
    throw new Falha('JIRA_BASE_URL fora do formato esperado (https://nome.atlassian.net).');
  }
  credenciais = {
    base,
    auth: 'Basic ' + Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64'),
  };
  return credenciais;
}

export const urlDoCard = (chave) => `${jiraEnv().base}/browse/${chave}`;

// --------------------------------------------------------------------- jira

export async function api(metodo, caminho, corpo) {
  const { base, auth } = jiraEnv();
  let res;
  try {
    res = await fetch(base + caminho, {
      method: metodo,
      headers: { Authorization: auth, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch (e) {
    throw new Falha(`Sem resposta do Jira (${metodo} ${caminho}): ${e.cause?.code || e.message}`);
  }
  const texto = await res.text();
  let dados;
  try { dados = texto ? JSON.parse(texto) : null; } catch { dados = texto; }
  if (!res.ok) {
    const detalhe = dados?.errorMessages?.join(' ') || JSON.stringify(dados?.errors ?? dados ?? '').slice(0, 600);
    const dica = res.status === 401 ? ' (token ou e-mail errado no .env.local)' : res.status === 404 ? ' (card não existe ou sem acesso)' : '';
    const erro = new Falha(`Jira respondeu HTTP ${res.status}${dica} em ${metodo} ${caminho}: ${detalhe}`);
    erro.status = res.status;
    throw erro;
  }
  return dados;
}

const CAMPOS = 'summary,description,status,issuetype,parent,assignee,reporter,labels,priority,subtasks,issuelinks,comment,duedate,created,updated';

export const buscarCard = (chave) => api('GET', `/rest/api/3/issue/${chave}?fields=${CAMPOS}`);

export async function buscarJql(jql, campos = ['summary', 'status', 'issuetype', 'parent', 'assignee', 'labels']) {
  const itens = [];
  let nextPageToken;
  do {
    const r = await api('POST', '/rest/api/3/search/jql', { jql, fields: campos, maxResults: 100, nextPageToken });
    itens.push(...(r.issues ?? []));
    nextPageToken = r.nextPageToken;
  } while (nextPageToken);
  return itens;
}

/** Move o card para o status pedido. Devolve 'ja-estava', 'movido' ou lança Falha com as opções. */
export async function moverCard(chave, status) {
  const alvo = semAcento(status);
  const card = await api('GET', `/rest/api/3/issue/${chave}?fields=status`);
  if (semAcento(card.fields.status.name) === alvo) return 'ja-estava';
  const { transitions } = await api('GET', `/rest/api/3/issue/${chave}/transitions`);
  const t = transitions.find((x) => semAcento(x.to?.name) === alvo) || transitions.find((x) => semAcento(x.name) === alvo);
  if (!t) {
    const opcoes = transitions.map((x) => x.to?.name).join(' · ') || 'nenhuma';
    throw new Falha(`${chave} está em "${card.fields.status.name}" e não tem transição para "${status}". Disponíveis: ${opcoes}`);
  }
  await api('POST', `/rest/api/3/issue/${chave}/transitions`, { transition: { id: t.id } });
  return 'movido';
}

export const comentar = (chave, markdown) => api('POST', `/rest/api/3/issue/${chave}/comment`, { body: mdParaAdf(markdown) });

const APELIDOS_DE_TIPO = {
  epic: 'epic', epico: 'epic',
  historia: 'historia', story: 'historia',
  tarefa: 'tarefa', task: 'tarefa',
  subtask: 'subtask', subtarefa: 'subtask', 'sub-tarefa': 'subtask',
};

export async function tipoDeItem(nome) {
  const projeto = await api('GET', `/rest/api/3/project/${PROJETO}`);
  const pedido = APELIDOS_DE_TIPO[semAcento(nome)] || semAcento(nome);
  const tipo = projeto.issueTypes.find((t) => (APELIDOS_DE_TIPO[semAcento(t.name)] || semAcento(t.name)) === pedido);
  if (!tipo) throw new Falha(`Tipo "${nome}" não existe no projeto. Existem: ${projeto.issueTypes.map((t) => t.name).join(' · ')}`);
  return tipo;
}

/** Épico não entra em sprint: ele agrupa cards, não é trabalho do quadro. */
export function ehEpico(tipo) {
  return tipo?.hierarchyLevel === 1 || ['epic', 'epico'].includes(semAcento(tipo?.name ?? ''));
}

/** Sprint ativo do quadro do projeto, ou null. Ids buscados a cada chamada, nunca fixos no código. */
export async function sprintAtivo() {
  const { values: quadros = [] } = await api('GET', `/rest/agile/1.0/board?projectKeyOrId=${PROJETO}`);
  // Quadro de projeto team-managed vem como `simple`; quadro sem sprint (Kanban) responde erro e é pulado.
  for (const quadro of quadros) {
    const resposta = await api('GET', `/rest/agile/1.0/board/${quadro.id}/sprint?state=active`).catch(() => null);
    const sprints = resposta?.values ?? [];
    if (sprints.length) return { id: sprints[0].id, nome: sprints[0].name, quadro: quadro.name };
  }
  return null;
}

export async function colocarNoSprint(chave, sprintId) {
  await api('POST', `/rest/agile/1.0/sprint/${sprintId}/issue`, { issues: [chave] });
}

// ------------------------------------------------------------ ADF -> Markdown

function inlineMd(nos = []) {
  return nos.map((n) => {
    switch (n.type) {
      case 'text': {
        let t = n.text ?? '';
        const marcas = n.marks ?? [];
        const tem = (x) => marcas.some((m) => m.type === x);
        if (tem('code')) t = '`' + t + '`';
        if (tem('strong')) t = `**${t}**`;
        if (tem('em')) t = `_${t}_`;
        if (tem('strike')) t = `~~${t}~~`;
        const link = marcas.find((m) => m.type === 'link');
        if (link?.attrs?.href && link.attrs.href !== n.text) t = `[${t}](${link.attrs.href})`;
        return t;
      }
      case 'hardBreak': return '\n';
      case 'mention': return n.attrs?.text ?? '@alguém';
      case 'emoji': return n.attrs?.text ?? n.attrs?.shortName ?? '';
      case 'inlineCard': case 'blockCard': case 'embedCard': return n.attrs?.url ?? '';
      case 'status': return `[${n.attrs?.text ?? ''}]`;
      case 'date': return n.attrs?.timestamp ? new Date(Number(n.attrs.timestamp)).toISOString().slice(0, 10) : '';
      default: return n.content ? inlineMd(n.content) : '';
    }
  }).join('');
}

function blocoMd(n, nivel = 0) {
  const filhos = (sep = '\n\n') => (n.content ?? []).map((c) => blocoMd(c, nivel)).join(sep);
  switch (n.type) {
    case 'doc': return filhos();
    case 'paragraph': return inlineMd(n.content);
    case 'heading': return '#'.repeat(n.attrs?.level ?? 1) + ' ' + inlineMd(n.content);
    case 'bulletList': case 'orderedList': case 'taskList':
      return (n.content ?? []).map((item, i) => {
        const marcador = n.type === 'orderedList' ? `${(n.attrs?.order ?? 1) + i}. `
          : n.type === 'taskList' ? `- [${item.attrs?.state === 'DONE' ? 'x' : ' '}] ` : '- ';
        const corpo = item.type === 'taskItem' ? inlineMd(item.content)
          : (item.content ?? []).map((c) => blocoMd(c, nivel + 1)).join('\n');
        return '  '.repeat(nivel) + marcador + corpo.replace(/^\s+/, '');
      }).join('\n');
    case 'codeBlock': return '```' + (n.attrs?.language ?? '') + '\n' + (n.content ?? []).map((c) => c.text ?? '').join('') + '\n```';
    case 'blockquote': case 'panel': return filhos().split('\n').map((l) => '> ' + l).join('\n');
    case 'rule': return '---';
    case 'table': {
      const linhas = (n.content ?? []).map((linha) => '| ' + (linha.content ?? [])
        .map((cel) => (cel.content ?? []).map((c) => blocoMd(c, 0)).join(' ').replace(/\n/g, ' ').replace(/\|/g, '\\|')).join(' | ') + ' |');
      if (linhas.length) linhas.splice(1, 0, '| ' + (n.content[0].content ?? []).map(() => '---').join(' | ') + ' |');
      return linhas.join('\n');
    }
    case 'mediaSingle': case 'mediaGroup': case 'media': return '_[imagem ou anexo: abra o card no Jira para ver]_';
    default: return n.content ? filhos() : inlineMd([n]);
  }
}

export function adfParaMd(adf) {
  if (!adf) return '';
  if (typeof adf === 'string') return adf.trim();
  return blocoMd(adf).replace(/\n{3,}/g, '\n\n').trim();
}

// ------------------------------------------------------------ Markdown -> ADF

const RE_INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))|(https?:\/\/[^\s<>)\]]+)/g;

function inlineAdf(texto) {
  const nos = [];
  const empurra = (text, marks) => { if (text) nos.push(marks ? { type: 'text', text, marks } : { type: 'text', text }); };
  let ultimo = 0;
  for (const m of texto.matchAll(RE_INLINE)) {
    empurra(texto.slice(ultimo, m.index));
    const t = m[0];
    if (m[1]) empurra(t.slice(1, -1), [{ type: 'code' }]);
    else if (m[2]) empurra(t.slice(2, -2), [{ type: 'strong' }]);
    else if (m[3]) {
      const [, rotulo, href] = t.match(/^\[([^\]]+)\]\((.+)\)$/);
      empurra(rotulo, [{ type: 'link', attrs: { href } }]);
    } else {
      const href = t.replace(/[.,;:!?]+$/, '');
      empurra(href, [{ type: 'link', attrs: { href } }]);
      empurra(t.slice(href.length));
    }
    ultimo = m.index + t.length;
  }
  empurra(texto.slice(ultimo));
  return nos;
}

/** Junta linhas num parágrafo, com quebra de linha entre elas. */
function paragrafo(linhas) {
  const content = [];
  linhas.forEach((l, i) => {
    if (i) content.push({ type: 'hardBreak' });
    content.push(...inlineAdf(l.trim()));
  });
  return { type: 'paragraph', content };
}

const RE_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_TITULO = /^(#{1,6})\s+(.*)$/;
const RE_CERCA = /^\s*```(\S*)\s*$/;
const RE_REGUA = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const RE_CITACAO = /^\s*>\s?(.*)$/;
const RE_TABELA = /^\s*\|.*\|\s*$/;
const comecaBloco = (l) => RE_TITULO.test(l) || RE_CERCA.test(l) || RE_REGUA.test(l) || RE_CITACAO.test(l) || RE_TABELA.test(l) || RE_ITEM.test(l);

function lista(linhas, i, recuoBase) {
  const ordenada = /\d/.test(linhas[i].match(RE_ITEM)[2]);
  const itens = [];
  while (i < linhas.length) {
    const m = linhas[i].match(RE_ITEM);
    if (!m) {
      // linha recuada sem marcador: continua o item anterior
      if (linhas[i].trim() && /^\s+/.test(linhas[i]) && itens.length) {
        const p = itens.at(-1).content[0];
        p.content.push({ type: 'hardBreak' }, ...inlineAdf(linhas[i].trim()));
        i++;
        continue;
      }
      break;
    }
    const recuo = m[1].length;
    if (recuo < recuoBase) break;
    if (recuo > recuoBase) {
      const [sub, j] = lista(linhas, i, recuo);
      itens.at(-1).content.push(sub);
      i = j;
      continue;
    }
    if (/\d/.test(m[2]) !== ordenada) break;
    itens.push({ type: 'listItem', content: [{ type: 'paragraph', content: inlineAdf(m[3].trim()) }] });
    i++;
  }
  return [{ type: ordenada ? 'orderedList' : 'bulletList', content: itens }, i];
}

function tabela(linhas) {
  const celulas = (l) => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
  const dados = linhas.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map(celulas);
  return {
    type: 'table',
    attrs: { isNumberColumnEnabled: false, layout: 'default' },
    content: dados.map((linha, n) => ({
      type: 'tableRow',
      content: linha.map((c) => ({ type: n === 0 ? 'tableHeader' : 'tableCell', attrs: {}, content: [{ type: 'paragraph', content: inlineAdf(c) }] })),
    })),
  };
}

/** Converte o Markdown usado nos cards (títulos, listas, código, citação, tabela, links) em ADF. */
export function mdParaAdf(md) {
  const linhas = String(md ?? '').replace(/\r\n/g, '\n').split('\n');
  const content = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(RE_CERCA))) {
      const codigo = [];
      i++;
      while (i < linhas.length && !RE_CERCA.test(linhas[i])) codigo.push(linhas[i++]);
      i++;
      const bloco = { type: 'codeBlock' };
      if (m[1]) bloco.attrs = { language: m[1] };
      if (codigo.join('\n')) bloco.content = [{ type: 'text', text: codigo.join('\n') }];
      content.push(bloco);
    } else if ((m = l.match(RE_TITULO))) {
      content.push({ type: 'heading', attrs: { level: m[1].length }, content: inlineAdf(m[2].trim()) });
      i++;
    } else if (RE_REGUA.test(l)) {
      content.push({ type: 'rule' });
      i++;
    } else if (RE_CITACAO.test(l)) {
      const citadas = [];
      while (i < linhas.length && RE_CITACAO.test(linhas[i])) citadas.push(linhas[i++].match(RE_CITACAO)[1]);
      content.push({ type: 'blockquote', content: [paragrafo(citadas)] });
    } else if (RE_TABELA.test(l)) {
      const bloco = [];
      while (i < linhas.length && RE_TABELA.test(linhas[i])) bloco.push(linhas[i++]);
      content.push(tabela(bloco));
    } else if (RE_ITEM.test(l)) {
      const [no, j] = lista(linhas, i, l.match(RE_ITEM)[1].length);
      content.push(no);
      i = j;
    } else {
      const bloco = [];
      while (i < linhas.length && linhas[i].trim() && !(bloco.length && comecaBloco(linhas[i]))) bloco.push(linhas[i++]);
      content.push(paragrafo(bloco));
    }
  }
  return { type: 'doc', version: 1, content: content.length ? content : [{ type: 'paragraph', content: [] }] };
}

// -------------------------------------------------------------------- saída

/** Roda o comando e transforma erro em mensagem curta + código de saída 1. */
export async function principal(fn) {
  try {
    await fn();
  } catch (e) {
    if (e instanceof Falha) console.error(`ERRO: ${e.message}`);
    else console.error(e);
    process.exitCode = 1;
  }
}
