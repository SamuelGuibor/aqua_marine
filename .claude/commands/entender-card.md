---
description: Fase 2 · lê o card, o protótipo e o código e escreve o contexto e o plano na worktree
argument-hint: SCRUM-12
---

# Fase 2 de 6 · Entender card

Card: **$ARGUMENTS**

Objetivo: trazer para dentro da worktree tudo que o próximo chat precisa para implementar **sem perguntar de novo**:
o que o card pede, os critérios de aceite, a tela do protótipo, como o código está hoje e um plano em passos.
O chat de implementação não vai lembrar desta conversa. O que não estiver escrito em `.card/` se perde.

## Passos

1. Rode `node scripts/harness/card.mjs status $ARGUMENTS`. Se não houver worktree, pare e indique `/iniciar-card $ARGUMENTS`.
   Daqui em diante, todo arquivo que você lê ou escreve fica em `.worktrees/$ARGUMENTS/`.
2. Leia o card inteiro: `node scripts/harness/jira.mjs card $ARGUMENTS` (descrição, subtarefas, vínculos e comentários).
   Se ele tiver épico/pai, leia o pai também (`jira.mjs card SCRUM-yy`) para pegar o contexto maior.
3. **Qualidade do card.** Ele diz o que fazer e como saber que ficou pronto? Se faltar objetivo ou critério de aceite,
   ou se houver ambiguidade que muda a implementação, **pergunte ao operador agora** (perguntas objetivas, de uma vez).
   Não invente requisito. O que o operador responder entra em "Decisões" do contexto e, se mudar o card,
   vira comentário no Jira (`jira.mjs comentar $ARGUMENTS --arquivo ...`) para o Jira continuar sendo a fonte da verdade.
4. **Protótipo.** Se o card cita um quadro (`Tela-*` ou `RH2-*`), abra o protótipo (link no `CLAUDE.md`) e estude esse quadro:
   estrutura, textos, estados (vazio, carregando, erro, pausado), comportamento nas 4 larguras. Anote o que importa.
   Se não conseguir abrir, diga isso e peça um print ao operador. Não deduza a tela.
5. **Código.** Leia na worktree o que o card toca: componentes, rotas, schema, serviços. Anote o que dá para reaproveitar
   e o que vai precisar mudar, com o caminho dos arquivos.
6. **Next 16.** Para cada API do Next que o card vai usar, leia o guia em `node_modules/next/dist/docs/` (regra do `AGENTS.md`)
   e anote no plano quais guias valem para este card.
7. Escreva os dois arquivos abaixo em `.worktrees/$ARGUMENTS/.card/`.

### `.card/contexto.md`

```markdown
---
card: SCRUM-12
fase: entender
commit: <saída de git rev-parse HEAD na worktree>
data: AAAA-MM-DD
---
# SCRUM-12 · título do card

## O que o card pede
Um parágrafo, com as palavras do card.

## Critérios de aceite
- CA1 — ...
- CA2 — ...
(Copie do card. Se o card não numerou, numere. Marque com "(confirmado pelo operador)" o que não está escrito no card.)

## Tela no protótipo
Quadro, o que ele mostra, estados e diferenças entre as larguras. Ou "não se aplica".

## Fora do escopo
O que parece relacionado mas NÃO é deste card.

## Como o código está hoje
Arquivos relevantes (caminho) e o que cada um faz.

## Decisões
Perguntas feitas ao operador e as respostas.

## Riscos e atenção
Banco (o banco é o real), offline no tablet, 4 larguras, regras do Next 16, dependência de outro card.

## Dúvidas em aberto
Vazio, se possível. Dúvida que bloqueia não pode ficar aqui: resolva com o operador antes de fechar a fase.
```

### `.card/plano.md`

```markdown
---
card: SCRUM-12
fase: plano
commit: <mesmo commit>
data: AAAA-MM-DD
---
# Plano · SCRUM-12

## Passos
Cada passo vira um commit pequeno que deixa o projeto compilando.
1. [ ] O que fazer · arquivos: `app/...`, `lib/...` · cobre: CA1
2. [ ] ...

## Banco
Precisa de migration? Qual? É destrutiva? (o banco de desenvolvimento é o de produção)

## Variáveis e dependências novas
Nomes de variável de ambiente e pacotes, com o motivo. Ou "nenhuma".

## Como testar
Comandos e o roteiro manual (o que clicar, o que deve aparecer), incluindo as 4 larguras quando houver tela.

## Guias do Next lidos
Caminhos em node_modules/next/dist/docs/ que valem para este card.
```

## Não faça

- Não altere código do produto e não faça commit. `.card/` está fora do Git de propósito.
- Não comece a implementar "só um pedacinho". A implementação é outro chat.

## Fechamento

> **Fase 2 concluída · $ARGUMENTS** · título do card
> - O que o card pede, em uma frase
> - Critérios de aceite: N · Passos no plano: N · Banco: sim/não
> - Decisões tomadas com o operador (se houve)
>
> **Próximo passo:** abra um **chat novo** e envie:
>
> ```
> /implementar-card $ARGUMENTS
> ```
