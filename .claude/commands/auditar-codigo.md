---
description: Fase 5 · auditoria técnica da branch do card (main à frente/atrás, conflitos, build, banco, segredos, lacunas)
argument-hint: SCRUM-12
---

# Fase 5 de 6 · Auditar código

Card: **$ARGUMENTS**

A revisão (fase 4) já respondeu se o card foi atendido. A pergunta desta fase é outra:
**esta branch pode entrar na `main` sem quebrar nada, e não ficou nenhuma lacuna no meio do caminho?**
Você é o auditor: procura o que ninguém conferiu.

## Passos

1. Rode `node scripts/harness/card.mjs status $ARGUMENTS`.
   - Sem `revisao.md` aprovada e válida para o HEAD: pare e indique o comando que o status sugere.
   - Com arquivos sem commit: pare e indique `/implementar-card $ARGUMENTS`.
   - Tudo acontece em `.worktrees/$ARGUMENTS/`.
2. Percorra **todos** os blocos abaixo. Cada item recebe `OK`, `ATENÇÃO` (não impede, mas o operador precisa saber) ou `BLOQUEIA`.
   Item que não se aplica: escreva "não se aplica" e o motivo. Não pule em silêncio.
3. Escreva `.card/auditoria.md`.

## A · Git e sincronia com a main

- `git fetch origin` e `git rev-list --left-right --count origin/main...HEAD` (atrás / à frente).
- **Atrás da main:** simule o merge sem tocar em nada: `git merge-tree --write-tree origin/main HEAD`.
  - Sem conflito: faça o merge de verdade, `git merge origin/main -m "$ARGUMENTS Merge da main"`, e **rode todo o bloco B em cima do resultado**.
    É a única alteração que a auditoria pode fazer. Nunca use rebase nem `push --force`.
  - Com conflito: `BLOQUEIA`. Liste os arquivos em conflito. Não resolva aqui.
- Nome da branch começa com a chave do card; toda mensagem de `git log origin/main..HEAD --format=%s` começa com `$ARGUMENTS`.
- `git diff origin/main...HEAD --name-only`: algum arquivo que não tem relação com o card? Arquivo gerado, binário grande,
  `.env*`, `.card/`, `node_modules`, `.next` versionado por engano?
- Árvore limpa e nada sem rastrear que devia estar no commit (`git status --porcelain`).
- A pasta principal continua limpa e na `main` (`git -C <pasta principal> status --short`): nenhuma fase escreveu código lá por engano.

## B · Compila e roda

- Se o `package-lock.json` mudou: `npm ci` de novo na worktree.
- `npm run lint` · `npx tsc --noEmit` · `npm run build` · testes, se o `package.json` tiver script de teste.
- Erro ou aviso novo no build (compare com o que a `main` já tinha) é achado.
- Suba o app (`npm run dev -- --port <porta do status>`) e abra as rotas tocadas pelo card: erro no console do navegador ou no terminal é achado.

## C · Segredos e ambiente

- No diff: token, senha, URL com credencial, chave de API, e-mail pessoal, dado real de funcionário.
- Todo `process.env.X` novo está no `.env.example`? Anote que precisa ser cadastrado na Vercel (Production e Preview).
- Variável usada no cliente tem `NEXT_PUBLIC_` de propósito, e não expõe segredo.

## D · Banco (só existe o banco real)

- Mudou o schema? A migration correspondente está versionada e bate com o schema.
- Operação destrutiva (`DROP`, `TRUNCATE`, `DELETE` sem filtro, trocar tipo, `NOT NULL` sem padrão em tabela com dados): `BLOQUEIA`
  até o operador confirmar por escrito neste chat.
- A migration já foi aplicada? O código da `main` atual continua funcionando com o banco depois dela (o deploy não é instantâneo)?
- Consultas novas: filtro por setor/usuário onde precisa, sem consulta dentro de laço, com limite onde a lista cresce.

## E · Next 16 (confira no guia em `node_modules/next/dist/docs/` quando houver dúvida)

- Nada de `export const dynamic` / `revalidate` / `fetchCache` de segmento: o projeto usa `cacheComponents`.
- `use cache`, `cacheLife` e `cacheTag` usados onde há dado em cache, e a invalidação existe para quem altera esse dado.
- Dado dinâmico (cookies, headers, sessão, `params`, `searchParams`) dentro de `<Suspense>` e com `await`.
- `'use client'` só onde há interação; nada de segredo ou acesso a banco em componente de cliente.

## F · Lacunas e robustez

- **Quem mais usa o que mudou?** Para cada função, componente, tipo, rota ou coluna alterada ou removida, procure os outros usos
  no projeto (busca por nome) e confira que continuam funcionando.
- Toda rota, route handler e server action nova confere a sessão e a permissão (operador × RH × admin).
- Entrada validada no servidor; erro tratado e mostrado ao operador (sem tela branca, sem `catch` vazio).
- Tela de tablet: o que acontece sem Wi-Fi? Toque duplo no botão grava duas vezes?
- Sobras: `console.log`, `debugger`, `TODO`/`FIXME`, código comentado, `any`, `eslint-disable`, `@ts-ignore`, dado de teste fixo no código.

## G · Tela (se o card tem tela)

- 4 larguras: 1440, 1280×800, 800×1280 e 390. Sem rolagem horizontal; nada cortado; alvo de toque confortável.
- Só cores e tokens do tema escuro do protótipo.

## H · Dependências

- Pacote novo: motivo no plano, versão fixada, `package-lock.json` no commit, nenhum script de instalação liberado sem necessidade.

## Regras desta fase

- **Não altere código do produto.** A única escrita permitida é o merge limpo da `main` (bloco A). O resto vai para o relatório.
- `LIBERADO` só sem nenhum `BLOQUEIA`. Cada `BLOQUEIA` e cada `ATENÇÃO` precisa dizer onde é, por que é problema e o que resolveria.
- Não aprove por cansaço: se um bloco não pôde ser verificado (ex.: app não subiu), isso é `BLOQUEIA`, não `OK`.

### `.card/auditoria.md`

```markdown
---
card: SCRUM-12
fase: auditar
veredito: LIBERADO | BLOQUEADO
commit: <git rev-parse HEAD auditado, já com o merge da main se houve>
data: AAAA-MM-DD
---
# Auditoria · SCRUM-12

## Resumo
Main: N atrás → merge feito / não precisou · lint, tipos, build: ok · bloqueios: N · atenções: N

## Achados
- A1 — BLOQUEIA — bloco, arquivo:linha, o problema, o que resolve.
- A2 — ATENÇÃO — ...

## Blocos
A Git: OK · B Build: OK · C Segredos: OK · D Banco: não se aplica (sem mudança de schema) · E Next: OK · F Lacunas: ATENÇÃO (A2) · G Tela: OK · H Dependências: OK

## Para o PR
O que o operador precisa fazer fora do código: cadastrar variável na Vercel, rodar migration, avisar alguém.
```

## Fechamento

Se **LIBERADO**:

> **Fase 5 concluída · $ARGUMENTS** · LIBERADO
> - Main: em dia (merge feito / não precisou) · lint, tipos, build: ok
> - Atenções para o operador (se houver)
>
> **Próximo passo:** abra um **chat novo** e envie:
>
> ```
> /publicar-pr $ARGUMENTS
> ```

Se **BLOQUEADO**:

> **Fase 5 concluída · $ARGUMENTS** · BLOQUEADO (N bloqueios)
> - A1: resumo · A2: resumo
>
> **Próximo passo:** abra um **chat novo** e envie (ele lê `.card/auditoria.md` e corrige; depois revisão e auditoria rodam de novo):
>
> ```
> /implementar-card $ARGUMENTS
> ```
