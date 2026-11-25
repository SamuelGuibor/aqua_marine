@AGENTS.md

# AquaPulse · sistema de produção

- Especificação: protótipo https://claude.ai/artifact/LFC3oCvfAfdz288hmVFxNv (quadros Tela-* e RH2-*).
- Escopo, prazo e entregas: orçamento https://claude.ai/artifact/QpekMkXXrC5cSPkiZZRT2y
- Preparação do ambiente e backlog: `PREPARACAO-DO-AMBIENTE.md`.
- 3 setores: Injetora, Montagem, Teste & Embalagem (Teste e Embalagem são UM setor).
- Tablet horizontal 1280×800 é o aparelho do operador; toda tela funciona também em 1440, 800×1280 e 390.
- Stack: Next.js + Drizzle + Neon, Auth.js, Serwist + Dexie (offline), PDF no Railway, backup no S3.
- Cada mudança é ligada a um card do Jira (SCRUM-xx) no nome da branch e no commit.
- Tema escuro do protótipo; nada de cor nova sem motivo.

## Fluxo de cards (harness)

Guia completo: `docs/harness/README.md`. Modelo de card: `docs/harness/modelo-de-card.md`.

- Todo trabalho é um card `SCRUM-xx` e passa por fases, **cada fase num chat novo**, iniciado por um comando com a chave do card:
  `/criar-card` → `/iniciar-card` → `/entender-card` → `/implementar-card` → `/revisar-card` → `/auditar-codigo` → `/publicar-pr` → `/encerrar-card`.
- **Um chat faz uma fase só.** Ao terminar, mostre o próximo comando para o operador colar num chat novo; não emende a fase seguinte.
- A pasta principal fica sempre na `main` e **não recebe código**. O código do card vive na worktree `.worktrees/SCRUM-xx/`
  (branch `SCRUM-xx-titulo`): numa fase de card, todo arquivo lido ou escrito e todo comando é dentro dela.
- A memória entre os chats é `.worktrees/SCRUM-xx/.card/` (fora do Git): `contexto.md`, `plano.md`, `implementacao.md`, `revisao.md`, `auditoria.md`.
  O que não estiver escrito ali o próximo chat não sabe.
- Toda fase começa com `node scripts/harness/card.mjs status SCRUM-xx` (worktree, branch, distância da `main`, fases, PR e próximo passo).
- Jira: `node scripts/harness/jira.mjs` (`card`, `buscar`, `mover`, `comentar`, `criar`). Texto longo sempre por `--arquivo`.
- Pedido solto, sem card ("arruma isso aqui"): proponha `/criar-card` antes de mexer no código.

## Next.js 16

- Next 16 + React 19, com `cacheComponents` e `partialPrefetching` ligados no `next.config.mjs`.
  Dados: `use cache` / `cacheLife` / `cacheTag` e `<Suspense>`, não `dynamic`/`revalidate` de segmento.
- Antes de escrever código do Next, leia o guia certo em `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Lint é `eslint .` (flat config em `eslint.config.mjs`); `next lint` não existe mais.

## Banco

- Neon, projeto `aquamarine` (aws-sa-east-1), **uma branch só** (`production`), usada também no desenvolvimento.
  Migrations e dados de teste caem no banco real: confirme antes de rodar migration destrutiva ou apagar dados.
- `DATABASE_URL` (pooling) no app; `DATABASE_URL_UNPOOLED` (direta) para migrations e `pg_dump`.

## Repositório

- `main` = produção (deploy automático na Vercel, região `gru1` em `vercel.json`). Tudo entra por PR.
- Segredos só no `.env.local` (fora do Git). Variável nova: acrescente o nome no `.env.example`.
- Comandos: `npm run dev`, `npm run build`, `npm run lint`, `npm run tipos`, `npm test`, `npm run test:ver`.
  Banco: `npm run db:gerar` (migration a partir de `lib/db/schema.ts`), `npm run db:migrar`, `npm run db:seed`.

## Jira

- Acesso pela REST API v3 (não pelo conector OAuth), com `JIRA_BASE_URL`, `JIRA_EMAIL` e `JIRA_API_TOKEN`
  do `.env.local` de cada pessoa. Autenticação Basic `email:token`.
- Nunca imprima, copie para o chat ou versione o token; leia do `.env.local` dentro do próprio comando.
- Projeto `SCRUM` ("aura-farm-industries", team-managed, modelo Scrum) em `guiborsamuel.atlassian.net`.
  O `PREPARACAO-DO-AMBIENTE.md` fala em `AQUA`/Kanban, mas a decisão de 24/11 foi usar este projeto.
  Backlog planejado: passo 10.6 do `PREPARACAO-DO-AMBIENTE.md`.
- Busca: use `POST /rest/api/3/search/jql` (o `/search` antigo foi removido). Descrição em ADF (JSON), não texto puro.

## Ambiente Windows

- PowerShell 5.1 quebra aspas duplas ao passar argumentos para programas nativos:
  use arquivo para textos longos (`git commit -F arquivo`, `gh pr create --body-file arquivo`).
- npm 12 bloqueia scripts de instalação por padrão; quando um pacote precisar,
  libere só ele com `'--allow-scripts=pacote'` (entre aspas simples no PowerShell).
