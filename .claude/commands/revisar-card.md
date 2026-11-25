---
description: Fase 4 · confere, critério por critério, se o que foi feito é o que o card pede (não corrige nada)
argument-hint: SCRUM-12
---

# Fase 4 de 6 · Revisar card

Card: **$ARGUMENTS**

Você é o revisor: **não escreveu este código** e não deve confiar no relato de quem escreveu.
A pergunta desta fase é uma só: **o que está na branch é o que o card pede, nem menos, nem mais?**
(Se o código pode entrar na `main` sem quebrar nada é a pergunta da fase 5, não desta.)

## Passos

1. Rode `node scripts/harness/card.mjs status $ARGUMENTS`.
   - Sem `implementacao.md`: pare e indique `/implementar-card $ARGUMENTS`.
   - Com arquivos sem commit: pare. Revisão é sobre o que está commitado; indique `/implementar-card $ARGUMENTS` para fechar o trabalho.
   - Tudo que você lê fica em `.worktrees/$ARGUMENTS/`.
2. **Releia o card no Jira** (`node scripts/harness/jira.mjs card $ARGUMENTS`), não só o `contexto.md`: o card é a fonte da verdade
   e pode ter mudado. Se os critérios do Jira e os do `contexto.md` divergirem, registre e use os do Jira.
3. Veja o que mudou: `git diff origin/main...HEAD --stat` e depois o diff completo. Abra os arquivos alterados inteiros
   quando o diff sozinho não der para julgar.
4. **Para cada critério de aceite**, decida `ATENDE`, `PARCIAL` ou `NÃO ATENDE` (numa entrega em partes, veja as regras
   abaixo), com evidência: arquivo e linha, ou o comportamento que você viu rodando.
   Leia `.card/implementacao.md` só depois de formar a sua opinião, para comparar. "O relatório diz que atende" não é evidência.
5. Se o card tem tela: suba o app da worktree (`npm run dev -- --port <porta do status>`) e compare com o quadro do protótipo
   nas 4 larguras: 1440, 1280×800, 800×1280 e 390. Textos, ordem, estados (vazio, erro, carregando) e o que rola ou não rola.
6. **Excesso de escopo:** tudo no diff que nenhum critério pede. Liste arquivo por arquivo. Refatoração, renomeação ou
   funcionalidade extra sem pedido é pendência, a menos que seja necessária para um critério (diga qual).
7. **Falta:** algo que o card pede e não aparece no diff, inclusive o que estava em "Fora do escopo" por engano.
8. Escreva `.card/revisao.md`.

## Regras desta fase

- **Não corrija código, não faça commit, não dê push.** O revisor só escreve `.card/revisao.md`.
  Quem corrige é um novo chat de implementação, com a sua lista na mão.
- `APROVADO` só quando **todos** os critérios estão em `ATENDE` (salvo na entrega em partes, abaixo) e não há excesso de
  escopo sem justificativa. Na dúvida entre aprovar e pedir ajuste, peça ajuste e explique.
- **Entrega em partes** (um PR por parte; `docs/harness/README.md`): só vale com a divisão registrada **no Jira e no
  `.card/contexto.md`**, dizendo quais critérios, ou pedaços deles, entram em cada parte. Divisão que só aparece em
  `implementacao.md` não vale. Com a divisão registrada:
  - julgue a **parte da vez**: pode dar `APROVADO` só para ela, quando tudo o que é dela está em `ATENDE`;
  - registre a situação de **cada critério inteiro**, contando o que PRs mesclados antes já entregaram;
  - o que é de parte futura não é pendência (nem "Falta" no passo 7);
  - na coluna "Situação", quando nada do critério é da vez, use `PARTE FUTURA` (ainda falta) ou `PARTE ANTERIOR`
    (já entregue por um PR mesclado).

  Sem divisão registrada, vale a regra de cima: todos os critérios.
- Cada pendência tem de ser executável por quem não leu esta conversa: o que está errado, onde, e o que se espera.

### `.card/revisao.md`

```markdown
---
card: SCRUM-12
fase: revisar
veredito: APROVADO | AJUSTES
commit: <git rev-parse HEAD que foi revisado>
data: AAAA-MM-DD
---
# Revisão · SCRUM-12

## Critérios de aceite
| Critério | Situação | Evidência |
| --- | --- | --- |
| CA1 — texto | ATENDE | `app/...:42`, visto em 1280×800 |
| CA2 — texto | PARCIAL | falta o estado vazio |

(Só na entrega em partes: diga qual é a parte da vez e onde a divisão está registrada, e use esta tabela no lugar da de cima.)

Parte N de M · divisão: comentário de DD/MM no Jira e `contexto.md`.

| Critério | Situação (parte da vez) | Critério inteiro | Evidência |
| --- | --- | --- | --- |
| CA1 — texto | ATENDE | COMPLETO | `app/...:42` |
| CA2 — texto | ATENDE | FALTA: a tela (parte 2) | `lib/...:10` |
| CA3 — texto | PARTE FUTURA | FALTA: tudo (parte 2) | |

## Tela × protótipo
Diferenças por largura. Ou "não se aplica".

## Fora do pedido
O que está no diff e nenhum critério pede.

## Divergências entre o Jira e o contexto.md
Ou "nenhuma".

## Pendências
- R1 — onde, o que está errado, o que se espera.
- R2 — ...
(Vazio quando APROVADO.)
```

## Fechamento

Se **APROVADO**:

> **Fase 4 concluída · $ARGUMENTS** · APROVADO
> - Critérios: N de N atendidos · Fora do pedido: nada
> - (Entrega em partes) Aprovada a parte N de M · critérios inteiros completos: CA1… · falta: CA2…
>
> **Próximo passo:** abra um **chat novo** e envie:
>
> ```
> /auditar-codigo $ARGUMENTS
> ```

Se **AJUSTES**:

> **Fase 4 concluída · $ARGUMENTS** · AJUSTES (N pendências)
> - R1: resumo · R2: resumo
>
> **Próximo passo:** abra um **chat novo** e envie (ele lê `.card/revisao.md` e corrige; depois a revisão roda de novo):
>
> ```
> /implementar-card $ARGUMENTS
> ```
