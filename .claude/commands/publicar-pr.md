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
3. **PR parcial ou final?** Um card pode ser entregue em partes, um PR por parte, na mesma branch
   (`docs/harness/README.md`, "Entrega em partes"). Decida antes de escrever o corpo:
   - releia os critérios no Jira (`node scripts/harness/jira.mjs card $ARGUMENTS`) e compare com o `revisao.md`
     (na entrega em partes, a coluna "Critério inteiro");
   - veja o que PRs anteriores já entregaram: `gh pr list --head <branch> --state merged --json number,url,body`;
   - **parcial**: somando este PR aos mesclados antes, algum critério do card continua incompleto.
     **Final** (conclui o card): todos completos;
   - na dúvida, pergunte ao operador antes de abrir o PR.
4. Envie a branch, de dentro de `.worktrees/$ARGUMENTS/`: `git push -u origin <branch>`. **Nunca** `--force`.
5. Escreva o corpo do PR em `.card/pr.md` (substitua o de um PR anterior):

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

   Num PR **parcial**:
   - logo abaixo da linha do card, antes de "O que muda", ponha este aviso:

     ```markdown
     > **Parte N de M: este PR não conclui o card.**
     > Falta: CA3, CA4 (o que falta e do que depende).
     > Mesclar com **"Create a merge commit"**. Depois do merge, **não** rodar `/encerrar-card`.
     ```

   - em "Critérios de aceite", marque `[x]` **só os critérios completos** (os de um PR anterior, citando o número);
     os outros ficam `[ ]`, dizendo o que este PR entrega deles e o que falta.

   Num PR **final** de um card entregue em partes, os critérios que vieram de um PR anterior citam o número dele.

   Acrescente no fim a linha de atribuição que o seu ambiente pede para PRs, se houver.
6. Abra o PR (título = chave + título do card), usando arquivo para o corpo:

   ```
   gh pr create --base main --head <branch> --title "$ARGUMENTS <título do card>" --body-file .card/pr.md
   ```

   Só se edita PR **aberto**. Se o status já mostrava um PR aberto para a branch (rodada de correção), não crie
   outro: o push já atualizou o PR; atualize só o corpo com `gh pr edit <número> --body-file .card/pr.md`.
   PR **mesclado** ou **fechado** não conta: crie um novo com `gh pr create` e nunca rode `gh pr edit` nele.
7. Jira: `node scripts/harness/jira.mjs mover $ARGUMENTS "Testes"` (parcial ou final) e um comentário com o link do PR
   e o "Como testar" (`jira.mjs comentar $ARGUMENTS --arquivo <arquivo>`). No parcial, o comentário começa dizendo que
   o PR é parcial, o que falta e que, depois do merge, o card volta para "Em andamento".
8. Espere as verificações do PR aparecerem (`gh pr checks <número>`) e informe o link do preview da Vercel.
   Se uma verificação falhar, leia o log e relate; a correção é em outro chat (`/implementar-card`).

## Não faça

- **Não faça merge, não ligue auto-merge, não aprove o PR.** Quem mescla é um operador, depois de testar o preview.
- Não altere código nem faça commit de produto nesta fase. `.card/` não vai para o Git.

## Fechamento

Use a versão do PR que você abriu (passo 3).

### PR final (conclui o card)

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

### PR parcial (não conclui o card)

> **Fase 6 concluída · $ARGUMENTS** · PR #N aberto, **parcial** (não conclui o card)
> - PR: link · Preview: link (ou "ainda subindo")
> - Jira: movido para "Testes" e comentado
> - Critérios completos: CA1… · **Falta:** CA3… (do que depende)
> - O que o operador precisa fazer à mão (variável na Vercel, migration), se houver
>
> **Agora é com vocês:** testar no preview e mesclar o PR no GitHub com **"Create a merge commit"**.
> **Não rode `/encerrar-card`**, mesmo que o `status` sugira logo depois do merge: o card não acabou.
> - Pediram mudança no PR? Chat novo: `/implementar-card $ARGUMENTS` (depois revisar, auditar e publicar de novo; o PR é o mesmo).
> - **Depois do merge**, na pasta principal, volte o card para "Em andamento":
>
> ```powershell
> node scripts/harness/jira.mjs mover $ARGUMENTS "Em andamento"
> ```
>
> - Quando der para fazer a parte seguinte (começa trazendo a `origin/main` para a branch; ela abre um PR novo), chat novo:
>
> ```
> /implementar-card $ARGUMENTS
> ```
