# Preparação do ambiente · Sistema AquaPulse

Tudo o que precisa estar pronto **antes da primeira linha de código**: contas, ferramentas no Windows, repositório, variáveis, serviços e o Jira com o backlog mapeado. Siga na ordem; cada seção termina com uma lista para marcar.

- Protótipo (especificação das telas): <https://claude.ai/artifact/LFC3oCvfAfdz288hmVFxNv>
- Orçamento (escopo, prazo e entregas): <https://claude.ai/artifact/QpekMkXXrC5cSPkiZZRT2y>
- Repositório: <https://github.com/SamuelGuibor/aqua_marine> (esta pasta, branch `main`)

---

## 1. Visão geral da stack

| Parte | Serviço | Para quê | Custo |
| --- | --- | --- | --- |
| App (telas, API, PWA) | **Vercel** | Next.js publicado em `*.vercel.app`, preview a cada PR | gratuito |
| Banco de dados | **Neon** | Postgres; branch `main` (produção) e `dev` | gratuito |
| Login | **Auth.js** (dentro do app) | senha do RH/Admin e token de cada tablet | — |
| PDFs do Exportar | **Railway** | serviço Node + Chromium que gera o PDF | ~US$ 5/mês |
| Backup e arquivos | **AWS S3** | `pg_dump` noturno do Neon + arquivos gerados | poucos reais/mês |
| E-mail do relatório mensal | **Resend** | envio do PDF todo dia 1º | gratuito |
| Uso | **PostHog** | quem usa cada tela e quando | gratuito |
| Erros | **Sentry** | aviso de erro no app e na API | gratuito |
| Fora do ar | **UptimeRobot** | checa `/api/health` a cada 5 min | gratuito |
| Botões das mesas | **ESP32** + PlatformIO | pulsos da Montagem via `POST /api/pulsos` | hardware da AquaPulse |
| Demandas e tarefas | **Jira** | backlog, entregas, pedidos do cliente | gratuito (até 10 usuários) |
| Código assistido | **Claude Code** | IA first, com acesso ao Jira | sua assinatura |

Bibliotecas que vão entrar no projeto (instaladas no passo 4): `drizzle-orm` + `@neondatabase/serverless` (banco), `next-auth` (login), `@serwist/next` + `dexie` (PWA e fila offline no tablet), `@sentry/nextjs`, `posthog-js`, `resend`, `xlsx` (Excel), `zod` (validação).

---

## 2. Contas a criar

Use **um e-mail só para o projeto** em todas (facilita entregar tudo para a AquaPulse depois) e ative a verificação em duas etapas em cada uma.

- [ ] **GitHub**: o repositório já existe; deixe-o privado.
- [ ] **Vercel**: entre com o GitHub (plano Hobby).
- [ ] **Neon**: entre com o GitHub; região **AWS São Paulo (sa-east-1)**, ou a mais próxima disponível.
- [ ] **Railway**: entre com o GitHub (plano Hobby).
- [ ] **AWS**: conta já usada pela AWS CLI desta máquina; criar só o bucket e um usuário IAM (passo 7).
- [ ] **Resend**: e-mail de envio do relatório mensal.
- [ ] **PostHog**: projeto `aquapulse` (região US ou EU).
- [ ] **Sentry**: projeto Next.js `aquapulse-web`.
- [ ] **UptimeRobot**: plano gratuito.
- [ ] **Atlassian (Jira)**: site novo, plano gratuito (passo 10).

---

## 3. Ferramentas no Windows

Já instalado nesta máquina: Git 2.46, Node 26 + npm 12, pnpm 10, AWS CLI 2, VS Code. Falta o resto. Rode no PowerShell:

```powershell
winget install --id GitHub.cli -e
winget install --id Google.PlatformTools -e   # adb, para depurar o Chrome do tablet
npm install -g vercel @railway/cli neonctl
```

Feche e abra o terminal e confira:

```powershell
gh --version; vercel --version; railway --version; neonctl --version; adb version
```

Extensões do VS Code:

```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension platformio.platformio-ide
code --install-extension Atlassian.atlascode
code --install-extension github.vscode-pull-request-github
```

Login nas CLIs:

```powershell
gh auth login
vercel login
railway login
neonctl auth
aws configure   # só se ainda não estiver configurado; região sa-east-1
```

- [x] Todas as CLIs respondem `--version`
- [ ] Todas logadas (feito: `gh`, `neonctl` · falta: `vercel` (login expirado), `railway`, `aws configure`)
- [x] Extensões instaladas (a do PlatformIO baixa o toolchain do ESP32 na primeira abertura)

---

## 4. Repositório

O projeto foi criado com **Next.js 14** e npm (`package-lock.json`). Como ainda não há código, este é o momento mais barato para atualizar para a versão atual do Next e do React:

```powershell
npx @next/codemod@latest upgrade latest
npm run build   # tem que passar antes de seguir
```

> **npm 12:** o `@next/codemod` 16.4.6 quebra com o npm 12 (usa `npm view --field`, que foi removido, e espera outro formato de JSON). O upgrade foi feito apontando `npm` para um npm 11 só durante o comando. Resultado: Next 16.4.6, React 19.3.1, ESLint 9 com `eslint.config.mjs` (os plugins do Next ainda não aceitam ESLint 10) e Cache Components + Partial Prefetching ligados no `next.config.mjs`, como num projeto novo do `create-next-app`.

Estrutura que o projeto vai ter (o app fica na raiz, como já está):

```text
aqua_marine/
├─ app/                    # telas e rotas de API do Next.js
├─ lib/                    # banco (Drizzle), auth, regras (meta, placas por pacote, pausas)
├─ services/pdf/           # serviço de PDF que roda no Railway (package.json próprio)
├─ firmware/botao-esp32/   # projeto PlatformIO dos botões
├─ .github/workflows/      # CI e backup noturno para o S3
├─ docs/                   # decisões, prints do protótipo
├─ .env.example            # nomes das variáveis, sem valores
└─ CLAUDE.md               # contexto do projeto para o Claude Code
```

Regras do repositório:

- `main` = produção (deploy automático na Vercel). Nada entra direto: tudo por PR.
- Branch por card do Jira: `AQUA-12-injetora-fechar-lote`.
- Commit e título de PR começam com a chave do card: `AQUA-12 fechar lote e trocar medida`. Isso liga o código ao card no Jira (passo 10).
- No GitHub: *Settings → Branches* → proteger `main` (exigir PR e o CI verde).

> **Atenção ao `.gitignore`:** ele ignora `.env*.local`, mas **não** ignora `.env`. Guarde os segredos em `.env.local` e versione só o `.env.example`.

- [x] Next atualizado e `npm run build` passando (branch `setup/atualizar-next`, ainda sem PR)
- [ ] Pastas criadas, `main` protegida
- [ ] `.env.example` versionado, `.env.local` fora do Git

---

## 5. Variáveis de ambiente

Crie `.env.example` com os nomes abaixo (sem valores) e preencha o `.env.local`. Na Vercel, cadastre os mesmos nomes em *Settings → Environment Variables* (Production e Preview).

```bash
# Banco (Neon) — a integração Neon na Vercel preenche estas duas sozinha
DATABASE_URL=            # conexão com pooling (o app usa esta)
DATABASE_URL_UNPOOLED=   # conexão direta (migrations e pg_dump)

# Login (Auth.js)
AUTH_SECRET=             # gerar com: npx auth secret

# PDF (Railway)
PDF_SERVICE_URL=
PDF_SERVICE_TOKEN=       # segredo compartilhado entre o app e o serviço de PDF

# AWS S3
AWS_REGION=sa-east-1
S3_BUCKET=aquapulse-backup
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# E-mail (Resend)
RESEND_API_KEY=
RELATORIO_EMAIL_PARA=    # e-mail do RH que recebe o relatório mensal

# Métricas
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=       # só no build (upload de source maps)

# Botões ESP32
ESP32_PULSO_SEGREDO=     # assina o token de cada botão cadastrado no Admin
```

- [ ] `.env.example` com todos os nomes
- [ ] `.env.local` preenchido
- [ ] Mesmas variáveis na Vercel

---

## 6. Banco (Neon) e publicação (Vercel)

**Neon**

1. Criar o projeto `aquapulse` na região de São Paulo.
2. Criar a branch `dev` a partir de `main`: você desenvolve na `dev`; a `main` é produção.
3. As migrations ficam no repositório (Drizzle) e rodam com `DATABASE_URL_UNPOOLED`.

**Vercel**

1. *Add New → Project* → importar `SamuelGuibor/aqua_marine`.
2. *Integrations* → adicionar **Neon**: cada PR ganha uma branch do banco só para o preview.
3. *Settings → Functions* → região **São Paulo (gru1)**, perto do banco.
4. O endereço de produção fica `aquapulse.vercel.app` (ou o nome livre mais próximo).

- [ ] Primeiro deploy da `main` no ar
- [ ] PR de teste gera preview com banco próprio

---

## 7. AWS S3 (backup e arquivos)

1. Bucket `aquapulse-backup` em `sa-east-1`, com **bloqueio de acesso público** e **versionamento** ligados.
2. Regra de ciclo de vida: apagar backups com mais de 30 dias.
3. Usuário IAM `aquapulse-app` só com acesso a esse bucket (ler, gravar e listar). Nada de chave de administrador no projeto.
4. Backup noturno com GitHub Actions (gratuito): todo dia às 03h, `pg_dump` do Neon, compacta e envia para `s3://aquapulse-backup/neon/`. Os segredos vão em *GitHub → Settings → Secrets → Actions*.
5. Testar a restauração uma vez numa branch do Neon. Backup que nunca foi restaurado não é backup.

- [ ] Bucket e usuário IAM criados
- [ ] Workflow de backup rodou e o arquivo apareceu no S3
- [ ] Restauração testada

---

## 8. Railway (PDF), e-mail e métricas

**Railway**: criar o serviço `pdf` apontando para `services/pdf/` do repositório, com imagem que já traz o Chromium (Playwright). O app chama `PDF_SERVICE_URL` com o `PDF_SERVICE_TOKEN`; sem token, o serviço recusa.

**Resend**: verificar o remetente e testar um envio para o seu e-mail.

**Métricas**

- **PostHog**: copiar a chave para `NEXT_PUBLIC_POSTHOG_KEY` e registrar eventos com nomes fixos (`registro_placa`, `pausa_registrada`, `lote_fechado`, `pdf_exportado`).
- **Sentry**: rodar `npx @sentry/wizard@latest -i nextjs` depois que o app tiver a primeira tela.
- **UptimeRobot**: monitor HTTP em `https://<app>.vercel.app/api/health` a cada 5 minutos, com alerta por e-mail.

- [ ] Serviço de PDF respondendo
- [ ] E-mail de teste recebido
- [ ] PostHog, Sentry e UptimeRobot recebendo dados

---

## 9. Tablets e botões ESP32

**Tablets (Android, 10")**

1. Abrir o sistema no Chrome e usar *Instalar app* (PWA).
2. *Opções do desenvolvedor* → **Manter tela ativa** enquanto carrega.
3. *Configurações → Segurança* → **Fixar app**, para o operador não sair do sistema.
4. Depurar pelo PC: cabo USB, *Depuração USB* ligada, `adb devices` e `chrome://inspect` no Chrome do computador.

**ESP32**

1. Projeto PlatformIO em `firmware/botao-esp32/`.
2. Cada botão é cadastrado no Admin › Botões ESP32 e recebe um token.
3. O firmware conecta no Wi-Fi, envia `POST /api/pulsos` com o token, ignora toques repetidos em menos de 300 ms e guarda os pulsos na memória quando o Wi-Fi cai.

**Levar na visita de 26 e 27/11**

- [ ] Botões já gravados e testados em casa contra o preview
- [ ] Cabos USB e fontes, mais 1 botão reserva
- [ ] Notebook com PlatformIO e o projeto compilando sem internet
- [ ] Nome e senha do Wi-Fi da fábrica (pedir antes)
- [ ] Teste por mesa: toque → número subindo na tela da Montagem

---

## 10. Jira: cards de demanda e backlog

### 10.1 Criar o projeto

1. Em <https://www.atlassian.com/software/jira/free>, criar o site (ex.: `aquapulse.atlassian.net`).
2. Projeto **Kanban**, gerenciado pela equipe, chave **`AQUA`**.
3. Tipos de item: **Épico**, **História** (uma tela ou funcionalidade), **Tarefa** (configuração, infra), **Bug** e um tipo novo, **Demanda** (pedido que chega da AquaPulse).
4. Campos personalizados:
   - **Tela no protótipo** (texto): nome do quadro no canvas, ex. `Tela-Injetora-TabletH`.
   - **Larguras** (caixas): PC · Tablet horizontal · Tablet vertical · Celular.
   - **Setor** (lista): Injetora · Montagem · Teste & Embalagem · RH · Todos.

### 10.2 Fluxo do quadro

`Triagem` → `A fazer` → `Fazendo` → `Em revisão` → `Aprovação do cliente` → `Concluído`

- **Triagem**: toda Demanda cai aqui. Você estima e decide: entra no escopo (vira História) ou é aditivo (orçar à parte).
- **Em revisão**: PR aberto e preview da Vercel no ar.
- **Aprovação do cliente**: a AquaPulse testa pelo link do preview. Só passa para Concluído com o "ok".

### 10.3 Entregas (versões), ligadas ao pagamento

| Versão no Jira | Data | O que fecha | Pagamento |
| --- | --- | --- | --- |
| Entrega 1 · Todas as telas | 25/11 | épicos 1 a 14 | 30% |
| Entrega 2 · ESP32 na fábrica | 27/11 | épico 15 | 30% |
| Entrega 3 · Publicação | 02/12 | épico 16 + aceite | 10% |

Os outros 30% são pagos na assinatura.

### 10.4 Pedidos da AquaPulse (cards de demanda)

1. *Projeto → Formulários* → criar **"Pedir uma mudança"** com os campos: o que precisa, setor, tela (ou print), urgência.
2. O formulário cria um item do tipo **Demanda** em **Triagem**.
3. Mandar o link do formulário para a AquaPulse, ou convidar a pessoa responsável como usuário (o plano gratuito vai até 10 pessoas).

### 10.5 Integrações

- **GitHub for Jira** (app do Atlassian Marketplace): conectar o repositório `aqua_marine`. Branches, commits e PRs com `AQUA-12` aparecem dentro do card.
- **Automação** (*Configurações do projeto → Automação*, modelos prontos): PR aberto → `Em revisão`; PR mesclado → `Aprovação do cliente`.
- **VS Code**: a extensão Atlassian mostra os cards e cria a branch com o nome certo.
- **Claude Code**: autorize o conector **Atlassian** (comando `/mcp`) para o Claude ler e criar cards. Depois peça para ele criar o backlog abaixo e ligar cada card ao quadro do protótipo.

### 10.6 Backlog inicial (épicos e cards)

| # | Épico | Cards (Histórias e Tarefas) | Entrega |
| --- | --- | --- | --- |
| 1 | Ambiente e base | atualizar Next; schema Drizzle + migrations; login Auth.js; layout escuro e componentes do protótipo; Sentry e PostHog; `/api/health` | 1 |
| 2 | Entrada e configuração | Entrar; Escolher área; Configurar tablet (ID e QR); Admin › Tablets; Admin › Botões ESP32 | 1 |
| 3 | Setores | cartões dos 3 setores; faixa de setores parados com motivo | 1 |
| 4 | Injetora | registrar placa boa, 1 ciclo, cabeça vazia e perdas; tamanho e fechar lote; resumo do dia; desfazer | 1 |
| 5 | Montagem | raias por operadora com +1/−1 por mesa; painel de mesas e operadoras | 1 |
| 6 | Teste & Embalagem | pacotes e defeitos; placas por pacote (padrão 10); estoque e Ordens de Produção | 1 |
| 7 | Pausas no tablet | aviso após X min sem contar; pop-up de motivo; faixa de pausado e Retomar | 1 |
| 8 | Históricos | histórico dos 3 setores com filtros; exportar CSV | 1 |
| 9 | RH · Agora | setores em tempo real (atualização automática); detalhe por setor | 1 |
| 10 | RH · Desempenho | metas do mês; por dia; composição; eficiência e placas por pacote; registros | 1 |
| 11 | RH · Pedidos e estoque | estoque por medida; Ordens de Produção; movimentações | 1 |
| 12 | RH · Pausas | tempo parado por motivo; linha do tempo; classificar parada sem motivo; motivos e regras | 1 |
| 13 | Metas e Exportar | painel Metas; painel Exportar; serviço de PDF no Railway; envio mensal por e-mail | 1 |
| 14 | Offline no tablet | fila local (IndexedDB) e envio quando o Wi-Fi volta; aviso de "sem conexão" | 1 |
| 15 | Botões ESP32 | firmware; endpoint `POST /api/pulsos`; instalação e teste na fábrica | 2 |
| 16 | Publicação e operação | produção na Vercel; backup noturno no S3 + restauração testada; UptimeRobot; checklist de aceite | 3 |

**Pronto para "Concluído"** (vale para todo card de tela):

- [ ] Igual ao quadro do protótipo indicado no card
- [ ] Funciona nas 4 larguras: PC 1440, tablet horizontal 1280×800, tablet vertical 800×1280, celular 390
- [ ] Testado num tablet de verdade (toque, teclado e sem rolar onde o protótipo não rola)
- [ ] PR mesclado, com preview aprovado pela AquaPulse

---

## 11. Claude Code (IA first)

Crie `CLAUDE.md` na raiz com o contexto que o Claude precisa em toda sessão:

```markdown
# AquaPulse · sistema de produção

- Especificação: protótipo https://claude.ai/artifact/LFC3oCvfAfdz288hmVFxNv (quadros Tela-* e RH2-*).
- 3 setores: Injetora, Montagem, Teste & Embalagem (Teste e Embalagem são UM setor).
- Tablet horizontal 1280×800 é o aparelho do operador; toda tela funciona também em 1440, 800×1280 e 390.
- Stack: Next.js + Drizzle + Neon, Auth.js, Serwist + Dexie (offline), PDF no Railway, backup no S3.
- Cada mudança é ligada a um card do Jira (AQUA-xx) no nome da branch e no commit.
- Tema escuro do protótipo; nada de cor nova sem motivo.
```

- [ ] `CLAUDE.md` criado
- [ ] Conector Atlassian autorizado no Claude Code (`/mcp`)

---

## 12. Pronto para codar

- [ ] Contas criadas (passo 2) e CLIs logadas (passo 3)
- [ ] Next atualizado, build passando, `main` protegida (passo 4)
- [ ] `.env.local` e variáveis na Vercel (passo 5)
- [ ] Neon com `main` e `dev`, primeiro deploy na Vercel (passo 6)
- [ ] S3 com backup noturno testado (passo 7)
- [ ] PDF, e-mail e métricas respondendo (passo 8)
- [ ] Um tablet com o PWA instalado e depuração USB funcionando (passo 9)
- [ ] Jira com fluxo, versões, formulário de demanda e backlog criado (passo 10)
- [ ] `CLAUDE.md` no repositório (passo 11)
