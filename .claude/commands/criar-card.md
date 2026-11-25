---
description: Antes da fase 1 · transforma uma demanda em card(s) do Jira no modelo que as fases sabem ler
argument-hint: descrição da demanda (ou "backlog épico 4")
---

# Criar card

Demanda: **$ARGUMENTS**

Objetivo: escrever no Jira um card que outro chat consiga **entender, implementar e revisar sem falar com quem pediu**.
O que faz um card bom é o critério de aceite: é por ele que a fase 4 decide se o trabalho está pronto.

## Passos

1. Entenda a demanda. Se `$ARGUMENTS` estiver vazio ou vago, pergunte ao operador o que precisa, para quem (setor) e como
   ele vai saber que ficou pronto. Se a demanda citar o backlog ("backlog épico 4"), a fonte é o passo 10.6 do `PREPARACAO-DO-AMBIENTE.md`.
2. Veja o que já existe, para não duplicar e para escolher o épico:

   ```
   node scripts/harness/jira.mjs epicos
   node scripts/harness/jira.mjs buscar "project = SCRUM AND statusCategory != Done ORDER BY created DESC"
   ```

3. Defina o **tamanho**: um card = um PR que dá para revisar de uma vez (em geral uma tela ou um comportamento).
   Demanda maior que isso vira vários cards no mesmo épico, cada um entregável sozinho. Diga a ordem quando um depender do outro.
4. Defina o **tipo**: `História` (tela ou comportamento que o usuário vê) · `Tarefa` (configuração, infraestrutura, técnico) ·
   `Epic` (só quando o operador pedir um épico novo). Não existe tipo Bug: defeito é `Tarefa` com a etiqueta `bug`.
5. Escreva cada card num arquivo Markdown **fora do repositório** (pasta temporária), seguindo `docs/harness/modelo-de-card.md`.
   A primeira linha `# Título` vira o título do card. Se o card tem tela, abra o protótipo (link no `CLAUDE.md`) e cite o quadro certo.
6. Mostre ao operador o rascunho (título, tipo, épico, etiquetas e critérios de aceite de cada card) e **espere o "pode criar"**.
   O Jira é real e os cards saem no nome do dono do token.
7. Crie. Etiqueta de setor: `injetora`, `montagem`, `teste-embalagem`, `rh` ou `infra`.

   ```
   node scripts/harness/jira.mjs criar --tipo História --arquivo <arquivo.md> --pai SCRUM-<épico> --label injetora
   ```

   (`--dry-run` mostra o que seria enviado sem criar. Para corrigir um card já criado: `jira.mjs editar SCRUM-xx --arquivo <arquivo.md>`.)

   O card novo entra sozinho no **sprint ativo** do quadro, para aparecer em "A fazer"; a saída diz em qual sprint entrou.
   Épico não vai para sprint. Sem sprint ativo, o card fica no backlog e a saída avisa. Se o operador não quiser o card no
   quadro, acrescente `--sem-sprint`.

## Não faça

- Não crie branch, worktree nem código. Este comando só escreve no Jira.
- Não invente critério de aceite que o operador não confirmou; pergunte.
- Não coloque prazo, valor ou assunto de contrato no card: aqui é só o trabalho técnico.

## Fechamento

> **Cards criados**
> - SCRUM-xx · título · tipo · épico · link
> - ...
> (Ordem sugerida, se houver dependência.)
>
> **Próximo passo:** para começar um deles, abra um **chat novo** e envie:
>
> ```
> /iniciar-card SCRUM-xx
> ```
