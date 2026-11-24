---
description: Depois do merge · remove a worktree e a branch local, atualiza a main e move o card para "Concluído"
argument-hint: SCRUM-12
---

# Encerrar card

Card: **$ARGUMENTS**

Objetivo: limpar a máquina depois que o PR do card foi **mesclado** na `main`.

## Passos

1. Na **pasta principal** (não dentro da worktree), rode o ensaio, que não altera nada:

   ```
   node scripts/harness/card.mjs encerrar $ARGUMENTS
   ```

2. Se o script recusar (PR ainda aberto, arquivos sem commit na worktree), mostre a mensagem ao operador e pare.
3. Mostre ao operador a lista do que será feito e **espere o "pode"**. Só então:

   ```
   node scripts/harness/card.mjs encerrar $ARGUMENTS --confirmar
   ```

4. Confira o resultado: worktree removida, branch local apagada, pasta principal atualizada, card em "Concluído".
   Se a remoção falhar por arquivo em uso, peça ao operador para fechar o `npm run dev` e o editor daquela worktree e repita.

## Card desistido (sem merge)

`--abandonar` apaga a worktree e a branch **sem** PR mesclado: o trabalho local se perde e o Jira não é alterado.
Use só quando o operador pedir com essas palavras, e mostre antes a lista de arquivos sem commit que o ensaio imprime.

## Fechamento

> **$ARGUMENTS encerrado** · worktree e branch removidas, `main` atualizada, card em "Concluído".
>
> **Próximo card:** abra um **chat novo** e envie `/iniciar-card SCRUM-<número>`
> (para ver o que está na fila: `node scripts/harness/jira.mjs buscar "project = SCRUM AND statusCategory = 'To Do' ORDER BY rank"`).
