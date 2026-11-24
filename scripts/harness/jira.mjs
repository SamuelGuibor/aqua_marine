#!/usr/bin/env node
// Jira pela REST API v3, para os comandos do harness. Uso: node scripts/harness/jira.mjs ajuda
import { readFileSync } from 'node:fs';
import {
  Falha, PROJETO, adfParaMd, api, buscarCard, buscarJql, chaveDoCard, comentar, lerArgs,
  mdParaAdf, moverCard, principal, tipoDeItem, urlDoCard,
} from './lib.mjs';

const AJUDA = `Jira do projeto ${PROJETO} (REST API v3). Credenciais: JIRA_* no .env.local.

  eu                                  quem é o dono do token
  card ${PROJETO}-12 [--json]              card completo em Markdown (descrição, épico, subtarefas, comentários)
  buscar "<JQL>"                      lista cards (ex.: "project = ${PROJETO} AND statusCategory != Done")
  epicos                              lista os épicos do projeto
  transicoes ${PROJETO}-12                 status para onde o card pode ir
  mover ${PROJETO}-12 "Em andamento"       muda o status
  atribuir ${PROJETO}-12                   atribui o card ao dono do token
  comentar ${PROJETO}-12 --arquivo x.md    comenta (Markdown). Ou --texto "uma linha"
  criar --tipo Tarefa --arquivo x.md [--pai ${PROJETO}-5] [--label injetora] [--dry-run]
                                      cria o card. A 1ª linha "# Título" do arquivo vira o título
                                      (ou passe --titulo). Tipos: Epic, História, Tarefa, Subtask
  editar ${PROJETO}-12 --arquivo x.md      troca título e descrição pelo arquivo (ou só --titulo "...")

Textos longos sempre por arquivo: o PowerShell 5.1 quebra aspas e acentos em argumentos.`;

const data = (iso) => (iso ? String(iso).slice(0, 10) : '');

/** Lê o arquivo Markdown do card: devolve { titulo, corpo }. */
function lerArquivoDeCard(arquivo) {
  const texto = readFileSync(arquivo, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = texto.match(/^\s*#\s+(.+)\n?/);
  return m ? { titulo: m[1].trim(), corpo: texto.slice(m[0].length).trim() } : { titulo: null, corpo: texto.trim() };
}

function cardEmMarkdown(c) {
  const f = c.fields;
  const linhas = [
    `# ${c.key} · ${f.summary}`,
    '',
    `- Tipo: ${f.issuetype?.name}`,
    `- Status: ${f.status?.name}`,
    `- Épico/pai: ${f.parent ? `${f.parent.key} · ${f.parent.fields?.summary ?? ''}` : 'nenhum'}`,
    `- Responsável: ${f.assignee?.displayName ?? 'ninguém'}`,
    `- Etiquetas: ${f.labels?.length ? f.labels.join(', ') : 'nenhuma'}`,
    `- Prioridade: ${f.priority?.name ?? '-'}`,
    `- Atualizado em: ${data(f.updated)}`,
    `- Link: ${urlDoCard(c.key)}`,
    '',
    '## Descrição',
    '',
    adfParaMd(f.description) || '_(card sem descrição)_',
  ];
  if (f.subtasks?.length) {
    linhas.push('', '## Subtarefas', '');
    for (const s of f.subtasks) linhas.push(`- ${s.key} [${s.fields?.status?.name}] ${s.fields?.summary}`);
  }
  if (f.issuelinks?.length) {
    linhas.push('', '## Vínculos', '');
    for (const l of f.issuelinks) {
      const outro = l.outwardIssue || l.inwardIssue;
      const verbo = l.outwardIssue ? l.type?.outward : l.type?.inward;
      if (outro) linhas.push(`- ${verbo} ${outro.key} [${outro.fields?.status?.name}] ${outro.fields?.summary}`);
    }
  }
  const comentarios = f.comment?.comments ?? [];
  if (comentarios.length) {
    linhas.push('', `## Comentários (${comentarios.length})`);
    for (const k of comentarios) linhas.push('', `### ${k.author?.displayName ?? '?'} · ${data(k.created)}`, '', adfParaMd(k.body));
  }
  return linhas.join('\n');
}

function listar(itens) {
  if (!itens.length) { console.log('Nenhum card.'); return; }
  for (const c of itens) {
    const f = c.fields;
    const pai = f.parent ? `  (em ${f.parent.key})` : '';
    console.log(`${c.key.padEnd(10)} ${String(f.issuetype?.name).padEnd(9)} [${f.status?.name}] ${f.summary}${pai}`);
  }
  console.log(`\n${itens.length} card(s).`);
}

const comandos = {
  ajuda() { console.log(AJUDA); },

  async eu() {
    const eu = await api('GET', '/rest/api/3/myself');
    console.log(`${eu.displayName} (accountId ${eu.accountId})`);
  },

  async card({ pos, flags }) {
    const c = await buscarCard(chaveDoCard(pos[0]));
    console.log(flags.json ? JSON.stringify(c, null, 2) : cardEmMarkdown(c));
  },

  async buscar({ pos }) {
    if (!pos[0]) throw new Falha('Passe a JQL entre aspas.');
    listar(await buscarJql(pos[0]));
  },

  async epicos() {
    listar(await buscarJql(`project = ${PROJETO} AND issuetype = Epic ORDER BY created ASC`));
  },

  async transicoes({ pos }) {
    const chave = chaveDoCard(pos[0]);
    const atual = await api('GET', `/rest/api/3/issue/${chave}?fields=status`);
    const { transitions } = await api('GET', `/rest/api/3/issue/${chave}/transitions`);
    console.log(`${chave} está em "${atual.fields.status.name}". Pode ir para: ${transitions.map((t) => t.to?.name).join(' · ') || 'nenhum'}`);
  },

  async mover({ pos }) {
    const chave = chaveDoCard(pos[0]);
    if (!pos[1]) throw new Falha('Diga o status de destino, ex.: mover SCRUM-12 "Em andamento".');
    const r = await moverCard(chave, pos.slice(1).join(' '));
    console.log(r === 'ja-estava' ? `${chave} já estava em "${pos.slice(1).join(' ')}".` : `${chave} movido para "${pos.slice(1).join(' ')}".`);
  },

  async atribuir({ pos }) {
    const chave = chaveDoCard(pos[0]);
    const eu = await api('GET', '/rest/api/3/myself');
    await api('PUT', `/rest/api/3/issue/${chave}/assignee`, { accountId: eu.accountId });
    console.log(`${chave} atribuído a ${eu.displayName}.`);
  },

  async comentar({ pos, flags }) {
    const chave = chaveDoCard(pos[0]);
    const texto = flags.arquivo ? readFileSync(flags.arquivo, 'utf8').replace(/^﻿/, '') : flags.texto;
    if (!texto || texto === true || !String(texto).trim()) throw new Falha('Passe --arquivo x.md ou --texto "...".');
    await comentar(chave, String(texto));
    console.log(`Comentário publicado em ${chave}: ${urlDoCard(chave)}`);
  },

  async criar({ flags }) {
    if (!flags.tipo || flags.tipo === true) throw new Falha('Passe --tipo (Epic, História, Tarefa ou Subtask).');
    const arq = flags.arquivo && flags.arquivo !== true ? lerArquivoDeCard(flags.arquivo) : { titulo: null, corpo: '' };
    const titulo = flags.titulo && flags.titulo !== true ? String(flags.titulo) : arq.titulo;
    if (!titulo) throw new Falha('Sem título: comece o arquivo com "# Título" ou passe --titulo.');
    const tipo = await tipoDeItem(flags.tipo);
    const fields = { project: { key: PROJETO }, issuetype: { id: tipo.id }, summary: titulo };
    if (arq.corpo) fields.description = mdParaAdf(arq.corpo);
    if (flags.pai && flags.pai !== true) fields.parent = { key: chaveDoCard(flags.pai) };
    if (tipo.subtask && !fields.parent) throw new Falha('Subtask precisa de --pai SCRUM-xx.');
    const labels = [].concat(flags.label ?? []).filter((l) => l !== true);
    if (labels.length) fields.labels = labels;
    if (flags['dry-run']) {
      console.log(`[dry-run] Nada foi criado. Seria enviado (tipo ${tipo.name}):`);
      console.log(JSON.stringify({ fields }, null, 2));
      return;
    }
    const novo = await api('POST', '/rest/api/3/issue', { fields });
    console.log(`Criado ${novo.key} (${tipo.name}): ${titulo}\n${urlDoCard(novo.key)}`);
  },

  async editar({ pos, flags }) {
    const chave = chaveDoCard(pos[0]);
    const fields = {};
    if (flags.arquivo && flags.arquivo !== true) {
      const arq = lerArquivoDeCard(flags.arquivo);
      if (arq.titulo) fields.summary = arq.titulo;
      fields.description = mdParaAdf(arq.corpo);
    }
    if (flags.titulo && flags.titulo !== true) fields.summary = String(flags.titulo);
    if (!Object.keys(fields).length) throw new Falha('Nada para editar: passe --arquivo x.md e/ou --titulo "...".');
    await api('PUT', `/rest/api/3/issue/${chave}`, { fields });
    console.log(`${chave} atualizado: ${urlDoCard(chave)}`);
  },
};

await principal(async () => {
  const [nome = 'ajuda', ...resto] = process.argv.slice(2);
  const comando = comandos[nome];
  if (!comando) throw new Falha(`Comando desconhecido: ${nome}. Rode "node scripts/harness/jira.mjs ajuda".`);
  await comando(lerArgs(resto, ['json', 'dry-run']));
});
