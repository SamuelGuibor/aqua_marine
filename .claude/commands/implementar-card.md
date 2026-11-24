---
description: Fase 3 · implementa o plano do card na worktree, em commits pequenos (ou corrige o que a revisão/auditoria apontou)
argument-hint: SCRUM-12
---

# Fase 3 de 6 · Implementar card

Card: **$ARGUMENTS**

Objetivo: fazer o que o card pede, seguindo `.card/plano.md`, dentro da worktree do card.
Este chat não participou das fases anteriores: a sua memória são os arquivos de `.card/`.

## Passos

1. Rode `node scripts/harness/card.mjs status $ARGUMENTS`.
   - Sem worktree: pare e indique `/iniciar-card $ARGUMENTS`.
   - Sem `contexto.md` ou `plano.md`: pare e indique `/entender-card $ARGUMENTS`.
   - Todo arquivo e todo comando daqui em diante é em `.worktrees/$ARGUMENTS/`. **Nunca edite a pasta principal.**
2. Leia `.card/contexto.md` e `.card/plano.md` inteiros.
3. **É a primeira vez ou é uma volta?** Se existir `.card/revisao.md` com veredito `AJUSTES` ou `.card/auditoria.md` com veredito
   `BLOQUEADO`, este chat é uma **rodada de correção**: o trabalho é resolver as pendências numeradas desses relatórios
   (R1, R2… / A1, A2…), não refazer o plano. Leia o relatório inteiro antes de mexer.
   Se a pendência for conflito com a `main`, rode `git merge origin/main` na worktree, resolva os conflitos e faça o commit do merge.
4. Antes de usar uma API do Next, leia o guia indicado no plano em `node_modules/next/dist/docs/`. Este Next não é o que você conhece.
5. Implemente **um passo do plano por vez**:
   - escreva o código do passo;
   - confira com `npm run lint` e `npx tsc --noEmit`;
   - faça o commit: mensagem `$ARGUMENTS <o que mudou, no imperativo>`, gravada num arquivo e passada com `git commit -F` (o PowerShell quebra aspas);
   - marque o passo com `[x]` em `.card/plano.md`.
6. Se o plano estiver errado ou incompleto, **pare e corrija o plano primeiro**: anote em `.card/plano.md` o desvio e o motivo.
   Se o desvio mudar um critério de aceite ou o escopo, pergunte ao operador antes de seguir.
7. Fechando: rode na worktree `npm run lint`, `npx tsc --noEmit` e `npm run build`. Os três têm de passar.
   Se o card tem tela, suba o app da worktree (`npm run dev -- --port <porta que o status mostra>`) e confira o roteiro de
   "Como testar" nas 4 larguras: 1440, 1280×800, 800×1280 e 390.
8. Escreva `.card/implementacao.md` (formato abaixo) e confirme com `git status` que **não sobrou nada sem commit**.

## Regras desta fase

- **Escopo:** só o que o card pede. Melhoria que você notou no caminho vira sugestão de card novo no fechamento, não código.
- **Banco:** só existe o banco real. Migration que apaga ou altera coluna/tabela com dados, `DELETE`, `TRUNCATE`: mostre ao operador
  o que vai rodar e espere o "pode". Migration nova fica versionada junto com o código.
- **Segredos:** nunca no código nem no commit. Variável nova: nome no `.env.example` e aviso no relatório (precisa ir para a Vercel).
- **Dependência nova:** só com motivo anotado no plano; instale dentro da worktree e versione o `package-lock.json`.
- **Visual:** tema escuro do protótipo, nenhuma cor nova sem motivo.
- **Não dê push e não abra PR.** Isso é da fase 6, depois da revisão e da auditoria.

### `.card/implementacao.md`

```markdown
---
card: SCRUM-12
fase: implementar
commit: <git rev-parse HEAD depois do último commit>
data: AAAA-MM-DD
---
# Implementação · SCRUM-12

## O que foi feito
| Critério | Como foi atendido | Onde |
| --- | --- | --- |
| CA1 | ... | `app/...:linha` |

## Desvios do plano
O que mudou em relação ao plano e por quê. Ou "nenhum".

## Banco e variáveis
Migrations criadas e se já foram aplicadas; variáveis novas. Ou "nada".

## Como testar
Comandos e roteiro manual que você mesmo executou, com o resultado.

## Verificações
lint: ok · tipos: ok · build: ok · 4 larguras: ok / não se aplica

## Pendências e sugestões
O que ficou de fora (com motivo) e ideias que merecem card próprio.

## Rodadas de correção
(Só nas voltas.) R1: como foi resolvido. A2: como foi resolvido.
```

Numa rodada de correção, **atualize** este arquivo (não crie outro) e troque o `commit` do cabeçalho pelo novo HEAD.

## Fechamento

> **Fase 3 concluída · $ARGUMENTS** · título do card
> - N commits · lint, tipos e build: ok
> - Critérios atendidos: CA1, CA2… · Pendências: nenhuma / quais
> - Desvios do plano (se houve)
>
> **Próximo passo:** abra um **chat novo** e envie:
>
> ```
> /revisar-card $ARGUMENTS
> ```

Se você não conseguiu terminar (bloqueio, dúvida do operador), diga exatamente onde parou, deixe isso em
`.card/implementacao.md` e indique repetir `/implementar-card $ARGUMENTS` num chat novo depois de resolvido.
