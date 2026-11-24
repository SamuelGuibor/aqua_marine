---
description: Fase 6 · envia a branch, abre (ou atualiza) o PR para a main e move o card para "Testes"
argument-hint: SCRUM-12
---

# Fase 6 de 6 · Publicar PR

Card: **$ARGUMENTS**

Objetivo: publicar o trabalho já revisado e auditado num PR para a `main`, com tudo que quem vai testar precisa saber.
Esta fase **não mexe em código** e **não faz merge**.

## Passos

1. Rode `node scripts/harness/card.mjs status $ARGUMENTS`. Só continue se:
   - `revisao.md` está `APROVADO` e `auditoria.md` está `LIBERADO`, ambos válidos para o HEAD (sem "DESATUALIZADO");
   - a árvore está limpa e a branch está `0 atrás da origin/main`.

   Se o "PRÓXIMO PASSO" do status não for `/publicar-pr`, **pare** e indique o comando que ele sugere. Não há atalho:
   commit novo depois da revisão ou da auditoria pede as duas de novo.
2. Leia `.card/contexto.md`, `.card/implementacao.md`, `.card/revisao.md` e `.card/auditoria.md` (seção "Para o PR").
3. Envie a branch, de dentro de `.worktrees/$ARGUMENTS/`: `git push -u origin <branch>`. **Nunca** `--force`.
4. Escreva o corpo do PR em `.card/pr.md`:

   ```markdown
   Card: [SCRUM-12](https://guiborsamuel.atlassian.net/browse/SCRUM-12)

   ## O que muda
   Duas ou três frases, na língua de quem usa o sistema.

   ## Critérios de aceite
   - [x] CA1 — texto do critério
   - [x] CA2 — ...

   ## Como testar
   Roteiro no preview da Vercel: onde entrar, o que clicar, o que deve aparecer.
   Larguras conferidas: 1440 · 1280×800 · 800×1280 · 390 (ou "sem tela").

   ## Banco e ambiente
   Migration: nenhuma / qual, e se já foi aplicada.
   Variáveis novas: nenhuma / nomes (cadastrar na Vercel em Production e Preview).

   ## Atenções da auditoria
   Itens de ATENÇÃO que ficaram, ou "nenhuma".
   ```

   Acrescente no fim a linha de atribuição que o seu ambiente pede para PRs, se houver.
5. Abra o PR (título = chave + título do card), usando arquivo para o corpo:

   ```
   gh pr create --base main --head <branch> --title "$ARGUMENTS <título do card>" --body-file .card/pr.md
   ```

   Se o status já mostrava um PR **aberto** para a branch (rodada de correção), não crie outro:
   o push já atualizou o PR; atualize só o corpo com `gh pr edit <número> --body-file .card/pr.md`.
6. Jira: `node scripts/harness/jira.mjs mover $ARGUMENTS "Testes"` e um comentário com o link do PR e o "Como testar"
   (`jira.mjs comentar $ARGUMENTS --arquivo <arquivo>`).
7. Espere as verificações do PR aparecerem (`gh pr checks <número>`) e informe o link do preview da Vercel.
   Se uma verificação falhar, leia o log e relate; a correção é em outro chat (`/implementar-card`).

## Não faça

- **Não faça merge, não ligue auto-merge, não aprove o PR.** Quem mescla é um operador, depois de testar o preview.
- Não altere código nem faça commit de produto nesta fase. `.card/` não vai para o Git.

## Fechamento

> **Fase 6 concluída · $ARGUMENTS** · PR #N aberto
> - PR: link · Preview: link (ou "ainda subindo")
> - Jira: movido para "Testes" e comentado
> - O que o operador precisa fazer à mão (variável na Vercel, migration), se houver
>
> **Agora é com vocês:** testar no preview e mesclar o PR no GitHub.
> - Pediram mudança no PR? Chat novo: `/implementar-card $ARGUMENTS` (depois revisar, auditar e publicar de novo; o PR é o mesmo).
> - **Depois do merge**, chat novo:
>
> ```
> /encerrar-card $ARGUMENTS
> ```
