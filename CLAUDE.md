@AGENTS.md

# AquaPulse · sistema de produção

- Especificação: protótipo https://claude.ai/artifact/LFC3oCvfAfdz288hmVFxNv (quadros Tela-* e RH2-*).
- Escopo, prazo e entregas: orçamento https://claude.ai/artifact/QpekMkXXrC5cSPkiZZRT2y
- Preparação do ambiente e backlog: `PREPARACAO-DO-AMBIENTE.md`.
- 3 setores: Injetora, Montagem, Teste & Embalagem (Teste e Embalagem são UM setor).
- Tablet horizontal 1280×800 é o aparelho do operador; toda tela funciona também em 1440, 800×1280 e 390.
- Stack: Next.js + Drizzle + Neon, Auth.js, Serwist + Dexie (offline), PDF no Railway, backup no S3.
- Cada mudança é ligada a um card do Jira (AQUA-xx) no nome da branch e no commit.
- Tema escuro do protótipo; nada de cor nova sem motivo.

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
- Comandos: `npm run dev`, `npm run build`, `npm run lint`.

## Ambiente Windows

- PowerShell 5.1 quebra aspas duplas ao passar argumentos para programas nativos:
  use arquivo para textos longos (`git commit -F arquivo`, `gh pr create --body-file arquivo`).
- npm 12 bloqueia scripts de instalação por padrão; quando um pacote precisar,
  libere só ele com `'--allow-scripts=pacote'` (entre aspas simples no PowerShell).
