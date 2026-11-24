---
description: Fase 1 · prepara a branch e a worktree do card (não escreve código)
argument-hint: SCRUM-12
---

# Fase 1 de 6 · Iniciar card

Card: **$ARGUMENTS**

Objetivo: deixar a máquina pronta para este card, com a branch certa, uma worktree só dele, dependências instaladas e `.env.local`.
Nesta fase você **não estuda o card a fundo, não abre o protótipo e não escreve código**. Isso é das próximas fases, em outros chats.

## Passos

1. Se `$ARGUMENTS` não for uma chave no formato `SCRUM-<número>`, pare e peça a chave ao operador.
2. Na pasta principal do repositório, rode:

   ```
   node scripts/harness/card.mjs iniciar $ARGUMENTS
   ```

   O script faz `git fetch`, lê o card no Jira, cria a branch `SCRUM-xx-titulo-do-card` a partir da `origin/main`
   (ou reaproveita a branch que já existe, local ou no GitHub), cria a worktree em `.worktrees/SCRUM-xx/`,
   copia o `.env.local`, roda `npm ci`, atribui o card ao operador e move para "Em andamento".
3. Se o script recusar (card é épico, já está concluído, está com outra pessoa, há duas branches para o mesmo card),
   **mostre a mensagem ao operador e pare**. Não use `--forcar` sem ele pedir.
4. Confira no resumo que o script imprime: worktree criada, branch com a chave do card, `0 atrás da origin/main`,
   `node_modules: ok` e `.env.local: ok`. Se o `npm ci` falhou, resolva agora (o `CLAUDE.md` explica o bloqueio de scripts do npm 12).
5. Saúde da base, **dentro da worktree** (`.worktrees/$ARGUMENTS/`): rode `npm run lint` e `npx tsc --noEmit`.
   Se falhar aqui, o defeito já está na `main`, não no card: avise o operador antes de seguir.

## Não faça

- Não edite nenhum arquivo do produto. Não faça commit. Não dê push.
- Não trabalhe na pasta principal: ela fica sempre na `main`.

## Fechamento

Termine com este resumo (e nada de emendar a próxima fase neste chat):

> **Fase 1 concluída · $ARGUMENTS** · título do card
> - Worktree: `.worktrees/$ARGUMENTS/` · Branch: `SCRUM-xx-...`
> - Jira: status e responsável
> - Base: lint e tipos ok (ou o que falhou)
>
> **Próximo passo:** abra um **chat novo** e envie:
>
> ```
> /entender-card $ARGUMENTS
> ```
