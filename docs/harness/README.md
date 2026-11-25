# Harness de cards · como trabalhamos neste repositório

Todo trabalho nasce de um **card do Jira** (`SCRUM-xx`) e passa por **seis fases**, cada uma num **chat novo** do Claude Code,
iniciado por um comando que leva a chave do card. No fim de cada fase o Claude diz qual é o próximo comando.

```
/criar-card  →  1 /iniciar-card  →  2 /entender-card  →  3 /implementar-card  →  4 /revisar-card  →  5 /auditar-codigo  →  6 /publicar-pr  →  /encerrar-card
                                                              ↑                        │ AJUSTES             │ BLOQUEADO
                                                              └────────────────────────┴─────────────────────┘
```

## Por que um chat por fase

- **Contexto limpo.** Quem revisa não é quem escreveu: o chat da revisão não viu as decisões do chat da implementação e por isso
  não as defende. O mesmo vale para a auditoria.
- **Nada depende da memória do chat.** O que uma fase descobre fica escrito na worktree, em `.card/`. O chat seguinte começa lendo esses arquivos.
- **Dá para parar e voltar.** Fechou o computador no meio? `node scripts/harness/card.mjs status SCRUM-12` diz onde o card está e qual é o próximo comando.

## As fases

| # | Comando | O que faz | O que escreve | Jira |
| --- | --- | --- | --- | --- |
| 0 | `/criar-card <demanda>` | Transforma a demanda em card(s) no modelo certo, depois do seu "pode criar" | o card | cria |
| 1 | `/iniciar-card SCRUM-12` | Branch `SCRUM-12-titulo` a partir da `origin/main`, worktree em `.worktrees/SCRUM-12/`, `.env.local`, `npm ci` | a worktree | atribui a você, "Em andamento" |
| 2 | `/entender-card SCRUM-12` | Lê card, épico, protótipo e código; tira dúvidas com você; planeja | `.card/contexto.md`, `.card/plano.md` | comenta decisões |
| 3 | `/implementar-card SCRUM-12` | Implementa o plano em commits pequenos `SCRUM-12 ...`; lint, tipos e build | código + `.card/implementacao.md` | |
| 4 | `/revisar-card SCRUM-12` | Confere critério por critério se o feito é o pedido, nem menos nem mais. Não corrige | `.card/revisao.md` (`APROVADO` / `AJUSTES`) | |
| 5 | `/auditar-codigo SCRUM-12` | Main à frente/atrás, conflitos, build, segredos, banco, Next 16, lacunas, quem mais usa o que mudou | `.card/auditoria.md` (`LIBERADO` / `BLOQUEADO`) | |
| 6 | `/publicar-pr SCRUM-12` | `git push`, abre o PR para a `main` com roteiro de teste | o PR | "Testes" + link do PR |
| fim | `/encerrar-card SCRUM-12` | Depois do merge do PR que conclui o card: remove worktree e branch, atualiza a `main` | | "Concluído" |

### As voltas

- Revisão deu `AJUSTES` ou auditoria deu `BLOQUEADO` → chat novo com `/implementar-card SCRUM-12`. Ele lê o relatório e corrige só as pendências.
- **Todo commit novo invalida a revisão e a auditoria anteriores.** Depois de corrigir, as duas rodam de novo. O `status` mostra `DESATUALIZADO` e o `/publicar-pr` se recusa a seguir.
  (Exceção: o merge limpo da `main` feito pela própria auditoria não invalida a revisão.)
- Pediram mudança no PR → `/implementar-card` → `/revisar-card` → `/auditar-codigo` → `/publicar-pr` (com o PR ainda aberto,
  atualiza o mesmo PR; PR já mesclado não é editado).

### Entrega em partes

Um card pode sair em mais de um PR, um por parte, na **mesma branch e worktree** (por exemplo, quando uma parte depende de outro card).

1. **Registre a divisão** num comentário do card no Jira e em `.card/contexto.md` e `.card/plano.md`: quais critérios, ou pedaços
   deles, entram em cada parte. Sem esse registro a revisão cobra todos os critérios.
2. Cada parte passa por implementar → revisar → auditar → publicar. A revisão julga a parte da vez, pode dar `APROVADO` só para
   ela e registra a situação de cada critério inteiro.
3. O `/publicar-pr` avisa no corpo que o PR é **parcial** (não conclui o card), marca só os critérios completos e move o card
   para "Testes". Mescle com **"Create a merge commit"**.
4. Depois do merge de um PR parcial, **não rode `/encerrar-card`**: ele apaga a worktree e a `.card/` e move o card para
   "Concluído". Volte o card para "Em andamento":

   ```powershell
   node scripts/harness/jira.mjs mover SCRUM-12 "Em andamento"
   ```

5. Quando der para fazer a parte seguinte, chat novo com `/implementar-card SCRUM-12`. Ela começa trazendo a `origin/main` para a
   branch (`git merge origin/main`; deixe isso como primeiro passo da parte no plano) e termina num **PR novo**.
6. O `/encerrar-card` é só depois do merge do PR que conclui o card.

**O que o `status` sabe:** ele compara a branch com o que o último PR mesclado levou. Sem commit além disso (receber a `main`
não conta), sugere `/encerrar-card`; com commit novo, volta ao fluxo normal até o `/publicar-pr`. Por isso, logo depois do merge
de um PR parcial, antes do primeiro commit da parte seguinte, ele **ainda sugere encerrar**: não siga a sugestão. O `encerrar`
(sem `--abandonar`) recusa apagar commit que não entrou em PR mesclado.

## CI

Todo PR para a `main` e todo push na `main` disparam o GitHub Actions (`.github/workflows/ci.yml`), com quatro verificações separadas.
Para repetir na sua máquina, rode na worktree o comando da verificação:

| Verificação | Comando |
| --- | --- |
| `lint` | `npm run lint` |
| `tipos` | `npm run tipos` |
| `testes` | `npm test` (`npm run test:ver` fica observando) |
| `build` | `npm run build` |

- O CI roda **sem nenhum segredo e sem banco** (o único banco é o de produção): teste e build não podem depender de variável do `.env.local`.
- Um push novo no PR cancela a execução anterior dele.
- **O CI precisa estar verde antes de `/publicar-pr` pedir revisão.** Vermelho → chat novo com `/implementar-card SCRUM-12`.

## Regras de ouro

1. **Um chat = uma fase de um card.** Terminou a fase, feche o chat e abra outro com o comando que o Claude indicou.
2. **A pasta principal fica sempre na `main` e ninguém edita código nela.** É de lá que você abre os chats e é lá que moram os comandos.
   O código de cada card vive em `.worktrees/SCRUM-xx/`.
3. **Nada entra na `main` sem PR**, e o PR só nasce depois de revisão `APROVADO` e auditoria `LIBERADO`.
4. **Quem mescla o PR é uma pessoa**, depois de testar o preview da Vercel. O Claude não faz merge.
5. **O Jira é a fonte da verdade do que foi pedido.** Mudou o combinado? Atualize o card (ou comente nele), não só o chat.
6. **O banco é o real** (Neon, uma branch só). Migration destrutiva e apagar dados: o Claude pergunta antes; leia antes de dizer "pode".

## Onde fica cada coisa

| Caminho | O que é | Vai para o Git? |
| --- | --- | --- |
| `.claude/commands/*.md` | Os comandos das fases (o texto que o Claude segue) | sim |
| `scripts/harness/jira.mjs` | Jira pela REST API: ler, criar, mover, comentar | sim |
| `scripts/harness/card.mjs` | Worktree e situação do card: `status`, `lista`, `iniciar`, `encerrar` | sim |
| `docs/harness/` | Este guia e o modelo de card | sim |
| `.worktrees/SCRUM-xx/` | Cópia de trabalho do card, com a própria `node_modules` e `.env.local` | não |
| `.worktrees/SCRUM-xx/.card/` | Memória do card entre os chats: contexto, plano, implementação, revisão, auditoria, corpo do PR | não |

## Preparar a máquina (operador novo)

1. Instale Git, Node 26 (npm 12), GitHub CLI (`gh`) e o Claude Code. Faça `gh auth login` com uma conta que tenha acesso de escrita ao repositório.
2. Clone e instale:

   ```powershell
   git clone https://github.com/SamuelGuibor/aqua_marine.git
   ```

   ```powershell
   npm ci
   ```

3. Crie o `.env.local` na raiz, a partir do `.env.example`. Os valores do banco e do `AUTH_SECRET` você recebe de quem já tem o
   projeto rodando, **por um canal seguro, nunca por chat aberto nem por commit**.
4. Gere o **seu** token do Jira (cada operador usa o próprio, para o card sair no seu nome): <https://id.atlassian.com/manage-profile/security/api-tokens>.
   Preencha no `.env.local`: `JIRA_BASE_URL=https://guiborsamuel.atlassian.net`, `JIRA_EMAIL` (o e-mail da sua conta Atlassian) e `JIRA_API_TOKEN`.
   Sua conta precisa estar convidada no projeto `SCRUM`.
5. Teste (deve mostrar o seu nome e a lista de cards):

   ```powershell
   node scripts/harness/jira.mjs eu
   ```

   ```powershell
   node scripts/harness/jira.mjs buscar "project = SCRUM AND statusCategory != Done"
   ```

6. Abra o Claude Code **na pasta principal do repositório**. Digite `/` e confira que aparecem `/iniciar-card`, `/entender-card` etc.

## Dois operadores

- **Um card, um dono.** O `/iniciar-card` atribui o card a você e se recusa a iniciar um card que está com outra pessoa (combine antes; `--forcar` existe para quando combinaram).
- **Cards diferentes não se atrapalham:** cada um tem a sua worktree e a sua branch. Você pode ter vários cards abertos ao mesmo tempo.
- **Assumir um card que o outro começou:** peça para ele dar `git push` da branch. O seu `/iniciar-card` acha a branch no GitHub e continua dela.
  A pasta `.card/` não viaja pelo Git: rode `/entender-card` de novo na sua máquina (ou peça os arquivos).
- **Mantenha a pasta principal em dia:** `git pull` na `main` de vez em quando. É assim que você recebe comandos e scripts novos do harness
  (o `/encerrar-card` já faz isso).
- **Dois cards no mesmo arquivo:** quem publicar depois vai encontrar a `main` à frente. A auditoria detecta, faz o merge se for limpo e bloqueia se houver conflito.

## Comandos de apoio (fora dos chats)

```powershell
node scripts/harness/card.mjs status SCRUM-12
```

```powershell
node scripts/harness/card.mjs lista
```

```powershell
node scripts/harness/jira.mjs card SCRUM-12
```

`node scripts/harness/jira.mjs ajuda` e `node scripts/harness/card.mjs ajuda` listam o resto.

Para rodar o app de um card: entre em `.worktrees/SCRUM-12/` e use `npm run dev -- --port 3012`. A porta sugerida é 3000 + o número do card,
assim dois cards não disputam a mesma.

## Problemas comuns

| Sintoma | Causa e saída |
| --- | --- |
| `Faltam no .env.local: JIRA_...` | Preencha as três variáveis `JIRA_*` na pasta principal (passo 4 acima). |
| `Jira respondeu HTTP 401` | Token ou e-mail errado. Gere outro token e confira o e-mail da conta. |
| `Jira respondeu HTTP 404` num card que existe | Sua conta não foi convidada para o projeto `SCRUM`. |
| `não tem transição para "Testes"` | O quadro do Jira mudou de nome de coluna. Ajuste `STATUS` em `scripts/harness/lib.mjs`. |
| O comando `/iniciar-card` não aparece | O chat não foi aberto na pasta principal, ou a `main` local está velha (`git pull`). |
| `npm ci` falha na worktree | npm 12 bloqueia scripts de instalação: veja "Ambiente Windows" no `CLAUDE.md`. |
| Não consigo remover a worktree | Feche o `npm run dev` e o editor dela. Depois `/encerrar-card` de novo. |
| O status mostra `DESATUALIZADO` | Entrou commit depois da revisão/auditoria. Rode a fase de novo: é o esperado. |
| O Claude editou a pasta principal por engano | `git -C <pasta principal> status` mostra. Desfaça lá e refaça na worktree; a auditoria confere isso. |
| O Claude não abre o protótipo | O artefato precisa estar compartilhado com a sua conta do Claude. Enquanto isso, mande um print do quadro. |

## Mudar o harness

O harness é código do repositório: mudança em comando, script ou neste guia entra por card e PR como qualquer outra.
Os comandos valem a partir do momento em que estão na `main` da sua pasta principal.
