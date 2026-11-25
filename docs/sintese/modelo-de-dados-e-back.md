# AquaPulse · modelo de dados e back-end (síntese para os cards de "banco" e "back")

Fontes: os 19 mapas em `docs/mapa/*.md` (um por família de tela), `PREPARACAO-DO-AMBIENTE.md` (stack e backlog 10.6), `CLAUDE.md` / `AGENTS.md` e os guias do Next 16 em `node_modules/next/dist/docs/` (`09-revalidating.md`, `15-route-handlers.md`, `16-proxy.md`).
O protótipo foi tratado como dado. Nada foi alterado no repositório nem no Jira.

Chaves das famílias de tela usadas em "quem lê / quem grava":
`entrar` · `area` · `config-tablet` · `admin-tablets` · `setores` · `injetora` · `montagem` · `mesas` · `teste` · `hist-injetora` · `hist-montagem` · `hist-teste` · `rh-agora` · `rh-desempenho` · `rh-pedidos` · `rh-pausas` · `rh-metas` · `rh-exportar`.

Convenção deste documento: tudo o que está marcado **[padrão proposto]** é uma decisão que tomei para o modelo fechar e que depende de resposta do dono do produto (seção 7). O resto vem direto dos mapas.

---

## 0. Decisões de arquitetura que amarram o resto

1. **Livro-razão de eventos.** Todo toque de produção é uma linha imutável em `registro_producao`. Nada é atualizado nem apagado: "−1", "Desfazer", correção do RH e lançamento da Administração são **novas linhas** com sinal e natureza próprios. É o que atende o princípio 04 do diagnóstico ("todo toque deixa rastro") e o relatório "Fechamentos e correções".
2. **Um número, um valor.** Existe uma única consulta de agregação (`v_producao_dia` + `lib/dominio/producao.ts`) e toda tela passa por ela: Área, Setores, telas de setor, históricos, RH · Agora, Desempenho, Metas, Exportar. A Fase 0 do diagnóstico (387 × 0) vira regra de modelagem: **dia aberto e dia fechado são lidos do mesmo lugar**.
3. **Três tipos de tabela**, marcados em cada uma:
   - **EVENTO** (imutável, só `INSERT`): `registro_producao`, `estoque_movimento`, `op_evento`, `pulso_esp32`, `aviso_dispensado`, `correcao_registro`, `registro_acao`, `operacao_tablet`, `tentativa_acesso`, `exportacao`.
   - **CADASTRO** (muda pouco, nunca se apaga: desativa): `usuario`, `tablet`, `tablet_vinculo`, `operadora`, `mesa`, `botao_esp32`, `ordem_producao`, `setor`, `medida`, `pausa_categoria`, `pausa_motivo`.
   - **CONFIGURAÇÃO** (valor vigente, alteração auditada): `setor_config`, `meta_setor`, `meta_medida`, `calendario_mes`, `relatorio_agendado`, colunas `medida.estoque_minimo_pacotes`.
   - **ESTADO** (linha com ciclo de vida, transições auditadas em `registro_acao`): `jornada`, `lote`, `pausa`, `setor_estado`.
4. **Id gerado no aparelho.** `registro_producao.id`, `lote.id` e `pausa.id` são UUID v7 criados no tablet. O próprio id é a chave de idempotência (`INSERT ... ON CONFLICT (id) DO NOTHING`). É isso que deixa a fila offline reenviar sem duplicar.
5. **Hora.** Tudo em `timestamptz`. O "dia de produção" é a coluna `dia date`, calculada **no servidor** em `America/Sao_Paulo` a partir de `ocorrido_em` (as funções da Vercel rodam em UTC: nunca usar `new Date().getDate()`). **[padrão proposto]** o dia vira à meia-noite e há um turno por dia.
6. **Driver.** `@neondatabase/serverless`: `neon()` (HTTP) para leituras; **`Pool` (WebSocket) + `drizzle-orm/neon-serverless` no caminho de escrita**, porque `aplicarOperacao` precisa de transação interativa (ler saldo, validar, gravar) e o driver HTTP só oferece `batch`. `DATABASE_URL` (pooling) no app; `DATABASE_URL_UNPOOLED` só em migration e `pg_dump`.
7. **Escrita do tablet e do botão por Route Handler, não por Server Action.** O id de uma Server Action muda a cada deploy; um item que ficou na fila offline atravessando um deploy quebraria. `POST /api/tablet/sync` e `POST /api/pulsos` são URLs estáveis. Server Actions ficam para RH/Admin (sempre online).
8. **Cache (Next 16, `cacheComponents`).** "Hoje/agora" **não** é cacheado (leitura direta, dentro de `<Suspense>`). Dia fechado, mês e catálogos usam `'use cache'` + `cacheLife` + `cacheTag`. Em Server Action invalida-se com `updateTag` (o RH vê a própria mudança na hora); em Route Handler com `revalidateTag(tag, 'max')` (`updateTag` só existe em Server Action, conforme `09-revalidating.md`). Função cacheada não lê `cookies()`: setor e dia entram como argumento.

---

## 1. Tabelas

Tipos em notação Postgres/Drizzle. `uuid` = `uuid().primaryKey()`; `criado_em` = `timestamptz default now()`. FK sempre `ON DELETE RESTRICT` (nada se apaga).

### 1.1 Enums

| Enum | Valores |
|---|---|
| `papel_usuario` | `rh`, `admin` |
| `modo_tablet` | `setor`, `tv` |
| `motivo_revogacao` | `novo_codigo`, `desvinculado_admin`, `usar_outro_id`, `substituido` |
| `tipo_registro` | `inj_boa2`, `inj_boa1`, `inj_vazio`, `inj_perda_cab_meio`, `inj_perda_cab_total`, `inj_perda_can_meio`, `inj_perda_can_total`, `mon_placa`, `tes_pacote`, `tes_defeito_caninho`, `tes_defeito_cabecote` |
| `natureza_registro` | `toque` (+1 normal), `ajuste` (botão −1), `desfazer`, `correcao` (RH), `lancamento` (dia lançado pela Administração) |
| `origem_registro` | `tablet`, `esp32`, `rh` |
| `fechamento_jornada` | `manual`, `automatico`, `rh` |
| `motivo_fechamento_lote` | `manual`, `troca_medida`, `fim_do_dia`, `virada_do_dia` |
| `origem_pausa` | `operador`, `aviso_respondido`, `aviso_sem_resposta`, `rh` |
| `encerramento_pausa` | `retomar`, `contagem`, `fechamento_dia`, `rh` |
| `estado_op` | `aberta`, `em_producao`, `concluida`, `cancelada` |
| `tipo_op_evento` | `criada`, `editada`, `reserva`, `liberacao`, `atendida`, `expedicao`, `cancelada` |
| `tipo_movimento` | `entrada`, `reserva`, `liberacao`, `expedicao`, `ajuste`, `saldo_inicial` |
| `resultado_operacao` | `aplicada`, `rejeitada` |
| `resultado_pulso` | `contou`, `mesa_pendente`, `duplicado`, `rapido_demais`, `botao_inativo` |
| `tipo_exportacao` | `mensal`, `operadoras`, `perdas`, `estoque`, `fechamentos`, `historico_setor` |
| `formato_exportacao` | `pdf`, `xlsx`, `csv` |

### 1.2 Acesso e auditoria

#### `usuario` · CADASTRO
Quem entra com senha (RH e Administração). Operador não é usuário: o registro é do tablet.

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `nome` | text not null | aparece em "quem fez" (ajuste de estoque, correção, classificação) |
| `papel` | `papel_usuario` not null | `admin` enxerga tudo o que `rh` enxerga, mais o Admin |
| `senha_hash` | text not null | argon2id ou bcrypt; nunca a senha |
| `senha_versao` | int default 1 | sobe ao trocar a senha; derruba sessões antigas |
| `ativo` | boolean default true | |
| `ultimo_acesso_em` | timestamptz | |
| `criado_em`, `criado_por` | timestamptz, uuid → `usuario` | |

Índices: `(ativo)`. Lê: `entrar`, Admin › Usuários (aba de `admin-tablets`). Grava: Admin › Usuários, seed (1 admin inicial).
**[padrão proposto]** a tela Entrar só tem "Senha de acesso": o login compara a senha com o hash de cada usuário ativo (são poucos) e entra como o usuário que casar. Isso mantém a tela do protótipo e ainda dá autor às ações. Se a resposta for "uma senha por papel", bastam duas linhas nesta tabela.

#### `tentativa_acesso` · EVENTO
Limite de tentativas (login, vínculo de tablet).

| Coluna | Tipo |
|---|---|
| `id` | bigserial PK |
| `alvo` | text (`login`, `vinculo`) |
| `chave` | text (IP, ou IP + código) |
| `sucesso` | boolean |
| `ocorrido_em` | timestamptz default now() |

Índice: `(alvo, chave, ocorrido_em desc)`. Lê/grava: `entrar`, `config-tablet`. Limpeza por cron (30 dias).

#### `registro_acao` · EVENTO (auditoria; aba "Registro de ações" do Admin)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | bigserial PK | |
| `ocorrido_em` | timestamptz default now() | |
| `ator` | text | `usuario`, `tablet`, `botao`, `sistema` |
| `usuario_id` | uuid → `usuario` null | |
| `tablet_id` | uuid → `tablet` null | |
| `acao` | text not null | nome fixo com ponto: `tablet.criado`, `tablet.codigo_regenerado`, `tablet.vinculado`, `tablet.desvinculado`, `meta.alterada`, `dias_uteis.alterados`, `pausa.classificada`, `pausa.regra_alterada`, `motivo.criado`, `mesa.operadora_alterada`, `mesa.medida_alterada`, `mesa.criada`, `operadora.criada`, `operadora.removida`, `jornada.fechada`, `jornada.reaberta`, `lote.fechado`, `op.criada`, `op.expedida`, `estoque.ajustado`, `estoque.minimo_alterado`, `registro.corrigido`, `dia.lancado`, `exportacao.gerada`, `usuario.senha_trocada`, `login.sucesso`, `login.recusado` |
| `entidade`, `entidade_id` | text, text | ex.: `mesa`, uuid |
| `antes`, `depois` | jsonb null | estado anterior e novo |
| `ip`, `user_agent` | text null | |

Índices: `(ocorrido_em desc)`, `(entidade, entidade_id)`, `(acao, ocorrido_em desc)`. Lê: Admin › Registro de ações, `rh-exportar` (tipo "Fechamentos e correções"). Grava: toda ação de escrita que não seja um toque de produção (os toques já são o próprio livro-razão).

### 1.3 Tablets e fila

#### `tablet` · CADASTRO

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `nome` | text not null | "Tablet Montagem"; é a **origem** mostrada nos históricos |
| `modo` | `modo_tablet` default `setor` | `tv` = "TV da fábrica (só visualizar)" |
| `setor_id` | text → `setor` null | obrigatório quando `modo = 'setor'` (CHECK) |
| `codigo` | text unique not null | `TAB-MONT-01`; gerado pelo sistema; regenerável |
| `codigo_seq` | int | número sequencial global usado no código |
| `codigo_gerado_em` | timestamptz | |
| `criado_por`, `criado_em` | uuid → `usuario`, timestamptz | |
| `arquivado_em` | timestamptz null | não existe excluir |

Índices: `unique (codigo)`, `unique (lower(nome)) where arquivado_em is null`, `(setor_id)`. A "situação" (Vinculado / Aguardando vínculo) é **derivada**: existe `tablet_vinculo` ativo?
Lê: `admin-tablets`, `config-tablet`, `area` (rodapé), históricos (origem), `rh-desempenho` (filtro Origem). Grava: `admin-tablets`.

#### `tablet_vinculo` · CADASTRO (histórico de aparelhos que usaram cada cadastro)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `tablet_id` | uuid → `tablet` | |
| `token_hash` | text unique not null | SHA-256 do token do dispositivo; o token em claro só existe no aparelho |
| `vinculado_em` | timestamptz default now() | |
| `vinculado_por` | uuid → `usuario` null | quem estava logado ao vincular |
| `user_agent`, `app_versao` | text null | |
| `ultimo_acesso_em` | timestamptz | atualizado no sync (no máximo 1×/min) |
| `revogado_em` | timestamptz null | |
| `revogado_motivo` | `motivo_revogacao` null | |

Índices: `unique (tablet_id) where revogado_em is null` (**um aparelho ativo por cadastro**; um segundo vínculo revoga o primeiro com `substituido` **[padrão proposto]**), `(token_hash)`.
Lê: toda rota `/api/tablet/*` (autenticação), `admin-tablets`. Grava: `config-tablet` (vincular, "Usar outro ID"), `admin-tablets` ("Gerar novo ID", "Desvincular").
Preferências "Manter a tela sempre ligada" e "Tela cheia" ficam **no aparelho** (Dexie): são do navegador, não do cadastro.

#### `operacao_tablet` · EVENTO (registro de idempotência e de reconciliação da fila)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | id do item da fila, gerado no aparelho |
| `tablet_id`, `vinculo_id` | uuid | |
| `setor_id` | text | |
| `tipo` | text | ver seção 5.2 |
| `seq` | bigint | ordem local do aparelho |
| `ocorrido_em` | timestamptz | hora do toque (corrigida pelo desvio do relógio) |
| `recebido_em` | timestamptz default now() | |
| `resultado` | `resultado_operacao` | |
| `motivo_rejeicao` | text null | `sem_saldo`, `lote_fechado`, `tablet_revogado`, `dado_invalido`, `depende_de_rejeitada` |
| `payload` | jsonb | o item como chegou (guardado sempre; limpeza das `aplicada` com 90 dias) |
| `resolvida_em`, `resolvida_por` | timestamptz, uuid null | quando o RH/Admin tratou uma rejeitada |

Índices: `(tablet_id, recebido_em desc)`, `(resultado) where resultado = 'rejeitada' and resolvida_em is null`.
Lê: Admin (itens rejeitados), o próprio sync (resposta repetida para item já visto). Grava: `POST /api/tablet/sync`.

### 1.4 Catálogos e configuração

#### `setor` · CADASTRO fixo (seed, 3 linhas)

| Coluna | Tipo | Valores |
|---|---|---|
| `id` | text PK | `inj`, `mon`, `tes` |
| `nome`, `nome_curto`, `descricao` | text | "Teste & Embalagem" / "Teste & Emb." / "Teste de pressão e pacotes" |
| `slug` | text unique | `injetora`, `montagem`, `teste` (rota) |
| `cor` | text | `#60A5FA`, `#2DD4BF`, `#C4B5FD` |
| `ordem` | smallint | 1, 2, 3 |
| `unidade` | text | `boas`, `montadas`, `embaladas` (o que conta para a meta) |

Lê: todas as telas. Grava: só seed.

#### `setor_config` · CONFIGURAÇÃO (1 linha por setor)

| Coluna | Tipo | Observação |
|---|---|---|
| `setor_id` | text PK → `setor` | |
| `minutos_aviso_parada` | smallint CHECK 5..60 | 10 / 15 / 15; RH › Pausas › Motivos e regras (passo 5) |
| `placas_por_pacote_padrao` | smallint null | 10 (só `tes`) |
| `placas_por_pacote_min`, `_max` | smallint null | 1 e 30 |
| `inicio_jornada` | time null | 07:00; eixo da linha do tempo de Pausas |
| `fechamento_automatico` | time null | nulo = sem fechamento automático |
| `atualizado_por`, `atualizado_em` | uuid, timestamptz | |

Lê: `injetora`, `montagem`, `teste` (aviso), `setores`, `area`, `rh-agora`, `rh-pausas`. Grava: `rh-pausas` (Motivos e regras).

#### `setor_estado` · ESTADO (1 linha por setor; atalho de leitura)

| Coluna | Tipo | Observação |
|---|---|---|
| `setor_id` | text PK | |
| `versao` | bigint not null default 0 | sobe em toda escrita do setor (evento, pausa, lote, jornada, mesa) |
| `ultimo_registro_em` | timestamptz null | último toque que conta |
| `ultima_atividade_em` | timestamptz null | maior entre último toque, fim da última pausa e última dispensa de aviso |
| `atualizado_em` | timestamptz | |

Atualizada **na mesma transação** de cada escrita. Serve para (a) o polling responder "nada mudou" com uma leitura por PK e (b) a detecção de parada sem varrer eventos. Lê: `/api/agora`, `/api/tablet/estado`. Grava: `aplicarOperacao`, `/api/pulsos`, ações de RH que mexem no setor.

#### `medida` · CADASTRO (seed 2, 3, 4, 5 m)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | smallint PK | |
| `comprimento_m` | numeric(4,2) unique | 2, 3, 4, 5 |
| `area_m2` | numeric(5,2) | 1; 1,5; 2; 2,5 |
| `ordem` | smallint | |
| `ativa` | boolean default true | |
| `estoque_minimo_pacotes` | int null | CONFIGURAÇÃO: "Definir mínimos"; nulo = sem mínimo |

Rótulo "3 m · 1,5 m²" é montado em `lib/dominio/medidas.ts` (formato único). Lê: todas as telas com medida. Grava: seed; `rh-pedidos` (mínimo).

#### `pausa_categoria` · CADASTRO (seed, 7 linhas)

| Coluna | Tipo | Exemplo |
|---|---|---|
| `id` | text PK | `manutencao`, `falta_material`, `troca_medida`, `refeicao`, `energia_ar_agua`, `pessoas`, `outro` |
| `nome`, `pergunta` | text | "Manutenção", "QUAL MANUTENÇÃO?" (nulo em `outro`) |
| `cor`, `icone` | text | `#F87171`, nome do ícone |
| `planejada` | boolean | só `refeicao` = true |
| `ordem` | smallint | ordem do tablet |
| `ativa` | boolean | |

#### `pausa_motivo` · CADASTRO

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `categoria_id` | text → `pausa_categoria` | |
| `setor_id` | text → `setor` null | nulo = vale para os três setores |
| `nome` | text | "Molde", "Placas da Injetora", "Almoço" |
| `ordem` | smallint | |
| `ativo` | boolean default true | desativar não apaga o histórico (a pausa guarda o texto) |

Índice: `(categoria_id, setor_id, ordem)`. Seed com a "lista inicial para conferir com a fábrica" (tabela do mapa `rh-pausas`).
Lê (as duas tabelas): `injetora`, `montagem`, `teste` (modal de pausa), `rh-pausas`, `setores`, `area`, `rh-agora`. Grava: `rh-pausas` (Motivos e regras; "+ motivo" é placeholder no protótipo).

### 1.5 Dia, lote e produção

#### `jornada` · ESTADO (o "registro" dia × setor: célula da matriz do Desempenho, linha do histórico)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `setor_id`, `dia` | text, date | `unique (setor_id, dia)` |
| `aberta_em` | timestamptz null | hora do primeiro registro; nulo em lançamento sem horário |
| `fechada_em` | timestamptz null | nulo = dia em andamento |
| `fechamento` | `fechamento_jornada` null | |
| `fechada_por_tablet_id`, `fechada_por_usuario_id` | uuid null | |
| `fechada_com_zero` | boolean default false | alerta "revisar fechamento" (Histórico da Montagem, "Para revisar") |
| `revisada_em`, `revisada_por` | timestamptz, uuid null | RH tirou o alerta |
| `origem` | `origem_registro` | `tablet` ou `rh` ("Lançado pela Administração") |
| `sem_horario` | boolean default false | lançamento do RH sem início/fim: esconder ritmo e placas/hora |
| `operadoras_informadas` | smallint null | "3 operadoras" quando o RH lança sem divisão por pessoa |

A jornada nasce no primeiro registro do dia (dentro de `aplicarOperacao`) ou num lançamento do RH. Meta do dia **não** é copiada aqui: é resolvida por vigência em `meta_setor` (dia antigo mostra a meta da época).
Lê: todas as leituras de produção. Grava: telas de setor (primeiro toque, "Fechar dia"), cron de fechamento, `rh-desempenho` (corrigir, lançar).

#### `lote` · ESTADO (Injetora: "lote"; Teste & Embalagem: o "pacote atual" da tela)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | gerado no tablet |
| `setor_id` | text CHECK in (`inj`, `tes`) | Montagem não tem lote |
| `jornada_id`, `dia` | uuid, date | lote não cruza dia |
| `medida_id` | smallint → `medida` | travada: trocar de medida fecha o lote |
| `sequencia` | smallint | ordem no dia ("Lotes hoje") |
| `aberto_em`, `fechado_em` | timestamptz, timestamptz null | |
| `motivo_fechamento` | `motivo_fechamento_lote` null | |
| `aberto_por_tablet_id`, `fechado_por_tablet_id` | uuid null | |

Índices: `unique (setor_id) where fechado_em is null` (sempre existe no máximo um lote aberto por setor), `(setor_id, dia)`.
Totais do lote (boas, perdas, ciclos, área, tempo) **não são colunas**: saem da soma dos eventos. "Ciclos no início" = ciclos do dia antes de `aberto_em`; "Ciclos agora" = ciclos do dia; "Δ" = ciclos do lote. (Corrige o defeito do protótipo no 2º fechamento.)
No banco o nome é `lote` nos dois setores; "Pacote atual / Fechar pacote" é só rótulo da tela do Teste (dúvida 12).
Lê: `injetora`, `teste`, `hist-injetora`, `hist-teste`, `rh-agora`, `rh-desempenho`. Grava: `injetora`, `teste`.

#### `operadora` · CADASTRO

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `nome` | text not null |
| `ativa` | boolean default true |
| `criada_em`, `desativada_em` | timestamptz, timestamptz null |

Índice: `unique (lower(nome)) where ativa`. Lê: `mesas`, `montagem`, `hist-montagem`, `rh-agora`, `rh-desempenho`, `rh-exportar`. Grava: `mesas` (gaveta Operadoras). Remover = desativar e soltar das mesas **[padrão proposto]**.

#### `mesa` · CADASTRO com configuração vigente

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `numero` | smallint unique | próximo da sequência em "+ Adicionar mesa" |
| `operadora_id` | uuid → `operadora` null | atual |
| `medida_id` | smallint → `medida` null | atual |
| `ativa` | boolean default true | |
| `config_alterada_em` | timestamptz | |

"ativa / configurar" é derivado (tem operadora **e** medida). A troca não é retroativa porque cada evento **copia** operadora e medida. O histórico de quem estava em qual mesa fica em `registro_acao` (`mesa.operadora_alterada`, antes/depois). Seed: mesas 1 a 6.
Lê: `mesas`, `montagem`, `rh-agora`. Grava: `mesas`.

#### `registro_producao` · EVENTO (o livro-razão; tabela central)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | gerado no tablet (toque); no servidor para `esp32` (determinístico: botão + boot + seq) e `rh` |
| `setor_id` | text → `setor` | |
| `dia` | date not null | calculado no servidor |
| `jornada_id` | uuid → `jornada` | |
| `lote_id` | uuid → `lote` null | obrigatório em `inj` e `tes` com origem tablet (CHECK) |
| `tipo` | `tipo_registro` | |
| `natureza` | `natureza_registro` | |
| `quantidade` | int not null, ≠ 0 | +1 / −1 no tablet; ±N em correção ou lançamento do RH |
| `placas` | int not null | placas que contam para a unidade do setor: `inj_boa*` e `mon_placa` = `quantidade`; `tes_pacote` = `quantidade × placas do pacote`; demais = 0 |
| `ciclos` | int not null default 0 | Injetora: `boa2` = 2, `boa1` = 1, vazio = 1, perda = 1 (× sinal). **Copiado no evento**: se a regra mudar, o passado não muda |
| `medida_id` | smallint → `medida` not null | medida vigente no toque |
| `mesa_id` | uuid → `mesa` null | só `mon` |
| `operadora_id` | uuid → `operadora` null | só `mon`; nulo em lançamento do RH sem divisão |
| `origem` | `origem_registro` | |
| `tablet_id` | uuid → `tablet` null | origem `tablet` |
| `botao_id` | uuid → `botao_esp32` null | origem `esp32` |
| `usuario_id` | uuid → `usuario` null | origem `rh` |
| `estorna_id` | uuid → `registro_producao` null | "Desfazer" aponta o toque desfeito; "−1 pacote" aponta o pacote estornado (para devolver as placas certas) |
| `correcao_id` | uuid → `correcao_registro` null | natureza `correcao` ou `lancamento` |
| `ocorrido_em` | timestamptz not null | hora do toque no aparelho (já corrigida) |
| `recebido_em` | timestamptz default now() | hora em que o servidor recebeu (mede atraso da fila) |
| `desvio_relogio_ms` | int null | diferença aparelho × servidor medida no envio |

Índices:
- `(setor_id, dia)` — toda agregação diária;
- `(setor_id, ocorrido_em desc)` — último registro;
- `(lote_id)` — totais do lote;
- `(mesa_id, dia) where setor_id = 'mon'` e `(operadora_id, dia) where setor_id = 'mon'`;
- `unique (estorna_id) where natureza = 'desfazer'` — um toque só pode ser desfeito uma vez;
- `(correcao_id) where correcao_id is not null`;
- `(tablet_id, recebido_em desc)` — "últimos registros" do aparelho.

Volume esperado: cerca de mil linhas por dia útil (300 a 400 por setor). Sem particionamento nem tabela-resumo: a soma por `(setor_id, dia)` é barata; dia fechado entra no cache.
Lê: todas as telas com número de produção. Grava: `injetora`, `montagem`, `mesas` (−1 e correção), `teste`, `POST /api/pulsos`, `rh-desempenho` (corrigir / lançar).

#### `v_producao_dia` · VIEW (fonte única de agregação)

```sql
select setor_id, dia, medida_id, tipo,
       sum(quantidade) as quantidade, sum(placas) as placas, sum(ciclos) as ciclos,
       min(ocorrido_em) as primeiro_em, max(ocorrido_em) as ultimo_em,
       bool_or(natureza in ('ajuste','desfazer','correcao')) as teve_correcao
from registro_producao
group by setor_id, dia, medida_id, tipo;
```
Uma segunda view, `v_montagem_dia` (`dia, operadora_id, mesa_id, medida_id → placas, ultimo_em`), serve Montagem, Mesas, Histórico da Montagem, Agora e "Produção por operadora".

#### `correcao_registro` · EVENTO (cabeçalho de "Corrigir este registro" e de "Lançado pela Administração")

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `tipo` | text | `correcao` ou `lancamento` |
| `setor_id`, `dia`, `jornada_id` | text, date, uuid | |
| `usuario_id` | uuid → `usuario` not null | |
| `motivo` | text not null | obrigatório |
| `antes`, `depois` | jsonb | totais e horários do dia antes e depois |
| `criado_em` | timestamptz default now() | |

A correção **não edita eventos**: grava N linhas compensatórias em `registro_producao` (`natureza = 'correcao'`, `origem = 'rh'`, `correcao_id`) e, se mudar início/fim, atualiza a `jornada`. Índice: `(setor_id, dia)`.
Lê: `rh-desempenho` (registro aberto), `rh-exportar` ("Fechamentos e correções"), `hist-*` (etiqueta de origem). Grava: `rh-desempenho`.

### 1.6 Pausas

#### `pausa` · ESTADO

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | gerado no tablet (ou no servidor, quando ele fecha uma lacuna) |
| `setor_id`, `dia`, `jornada_id` | text, date, uuid | pausa é do **setor** inteiro |
| `inicio` | timestamptz not null | manual: hora do toque; automática: hora do **último registro** (retroativa) |
| `fim` | timestamptz null | nulo = em andamento |
| `origem` | `origem_pausa` | "Operador pausou" / "Aviso do tablet · respondeu" / "Aviso · sem resposta" / "Classificada pelo RH" |
| `categoria_id` | text → `pausa_categoria` null | nulo = "Sem motivo" |
| `motivo_id` | uuid → `pausa_motivo` null | |
| `motivo_texto` | text null | **cópia** do nome do motivo (motivo renomeado ou desativado não muda o histórico) |
| `planejada` | boolean default false | cópia de `categoria.planejada` no momento |
| `descricao` | text null | texto do operador (o protótipo descartava; aqui grava) |
| `aviso_em` | timestamptz null | quando o aviso apareceu (`inicio + minutos_aviso`) |
| `respondida_em` | timestamptz null | quando o operador respondeu o aviso |
| `encerrada_por` | `encerramento_pausa` null | |
| `tablet_id` | uuid null | quem registrou |
| `classificada_por`, `classificada_em` | uuid → `usuario`, timestamptz null | RH |
| `descricao_rh` | text null | soma-se à do operador, não substitui |

Índices: `unique (setor_id) where fim is null` (uma pausa aberta por setor), `(setor_id, dia)`, `(setor_id, inicio)`, `(categoria_id, dia)`.
Lê: `injetora`, `montagem`, `teste` (pílula e faixa), `setores`, `area`, `rh-agora`, `rh-pausas`, `rh-desempenho` (tempo e "Paradas por motivo"), `hist-*` (T. parado), `rh-exportar`. Grava: `injetora`, `montagem`, `teste` (Pausar, aviso, Retomar), `rh-pausas` (Classificar), servidor (lacuna sem resposta).

#### `aviso_dispensado` · EVENTO ("Não parou")

| Coluna | Tipo |
|---|---|
| `id` | uuid PK (do tablet) |
| `setor_id`, `tablet_id` | text, uuid |
| `ultimo_registro_em` | timestamptz |
| `aviso_em`, `dispensado_em` | timestamptz |

Índice: `(setor_id, dispensado_em desc)`. A dispensa reinicia a contagem de inatividade (entra em `ultima_atividade_em`) e conta em "Avisos do tablet" **[padrão proposto]**. Lê: `rh-pausas`. Grava: `injetora`, `montagem`, `teste`.

### 1.7 Metas

#### `meta_setor` · CONFIGURAÇÃO com vigência

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `setor_id` | text → `setor` | |
| `placas_dia` | int CHECK ≥ 10 | 270 |
| `vigente_de` | date not null | salvar hoje cria linha com `vigente_de = hoje` |
| `criado_por`, `criado_em` | uuid, timestamptz | |

Índice: `unique (setor_id, vigente_de)`. Meta de um dia = linha com maior `vigente_de ≤ dia`. Nunca se atualiza linha antiga.

#### `meta_medida` · CONFIGURAÇÃO ("Meta por tamanho · opcional")

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `medida_id` | smallint → `medida` |
| `placas_dia` | int null (nulo = sem meta) |
| `vigente_de` | date |
| `criado_por`, `criado_em` | uuid, timestamptz |

No protótipo os campos não estão ligados a nada. Entra no schema, fica fora das contas até a dúvida 9 ser respondida.

#### `calendario_mes` · CONFIGURAÇÃO

| Coluna | Tipo | Observação |
|---|---|---|
| `ano`, `mes` | smallint, smallint | PK composta |
| `dias_uteis` | smallint CHECK 1..31 | 21 em novembro/2026; o RH acerta feriado à mão |
| `atualizado_por`, `atualizado_em` | uuid, timestamptz | |

Mês sem linha: o servidor cria com os dias de segunda a sexta do calendário.
Lê (as três): `rh-metas`, `rh-agora`, `rh-desempenho`, `rh-exportar`, `area`, `setores`, `injetora`, `montagem`, `teste`, `hist-*`. Grava: `rh-metas`.

### 1.8 Estoque e Ordens de Produção

#### `ordem_producao` · CADASTRO com ciclo de vida

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `numero` | int unique | sequence; exibição `OP-00015` (`lpad 5`) |
| `cliente` | text null | texto livre; nulo = "Sem cliente" |
| `medida_id` | smallint → `medida` | uma OP = uma medida |
| `pacotes_pedidos` | int CHECK > 0 | |
| `data_entrega` | date null | |
| `observacao` | text null | |
| `estado` | `estado_op` | mantido por `lib/dominio/ordens.ts` a cada evento |
| `pacotes_reservados`, `pacotes_expedidos` | int default 0 | contadores mantidos na mesma transação do movimento (atendidos = reservados + expedidos) |
| `criada_por`, `criada_em` | uuid, timestamptz | |
| `expedida_em`, `cancelada_em` | timestamptz null | |

Índices: `(estado, data_entrega)`, `(medida_id)`, `unique (numero)`.
Lê: `rh-pedidos`, `teste` (azulejo "Ordens de produção · N abertas"), `rh-exportar`. Grava: `rh-pedidos`.

#### `op_evento` · EVENTO (linha do tempo da OP)

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `op_id` | uuid → `ordem_producao` |
| `tipo` | `tipo_op_evento` |
| `pacotes` | int null |
| `usuario_id` | uuid null (nulo = reserva automática) |
| `detalhe` | jsonb null |
| `ocorrido_em` | timestamptz default now() |

Índice: `(op_id, ocorrido_em)`.

#### `estoque_movimento` · EVENTO (razão do estoque, em pacotes)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `tipo` | `tipo_movimento` | na tela: Entrada, Reserva (reserva / liberação), Expedição, Ajuste (ajuste / saldo inicial) |
| `medida_id` | smallint → `medida` | |
| `pacotes` | int not null | efeito no estoque **físico** (+ entrada, − expedição, ± ajuste, 0 em reserva) |
| `placas` | int not null | placas correspondentes (soma real, não pacotes × 10) |
| `reservado` | int not null default 0 | efeito no **reservado** (+ reserva, − liberação, − expedição) |
| `op_id` | uuid → `ordem_producao` null | reserva, liberação, expedição |
| `registro_id` | uuid → `registro_producao` null | entrada gerada por um pacote do tablet |
| `usuario_id`, `tablet_id` | uuid null | |
| `motivo` | text null | obrigatório em `ajuste` e `saldo_inicial` (CHECK) |
| `ocorrido_em`, `criado_em` | timestamptz | |

Índices: `(medida_id, ocorrido_em desc)`, `unique (registro_id) where registro_id is not null` (idempotência da entrada), `(op_id)`.
Saldos por medida (uma consulta): físico = Σ `pacotes`; reservado = Σ `reservado`; **disponível = físico − reservado**; placas = Σ `placas`.
Lê: `rh-pedidos`, `rh-agora` (cartão Estoque), `teste` (azulejo Estoque), `rh-exportar`. Grava: `teste` (indiretamente: cada `tes_pacote` gera a entrada na mesma transação), `rh-pedidos` (expedição, ajuste, saldo inicial), reserva automática.

### 1.9 Exportação

#### `exportacao` · EVENTO

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `usuario_id` | uuid null (nulo = envio mensal) |
| `tipo` | `tipo_exportacao` |
| `formato` | `formato_exportacao` |
| `periodo_de`, `periodo_ate` | date |
| `medida_id` | smallint null |
| `setores`, `secoes` | text[] |
| `status` | text (`gerando`, `pronto`, `erro`) |
| `arquivo_chave` | text null (chave no S3) |
| `erro` | text null |
| `criado_em` | timestamptz |

Lê/grava: `rh-exportar`, cron mensal, CSV dos históricos.

#### `relatorio_agendado` · CONFIGURAÇÃO (1 linha)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | smallint PK default 1 | |
| `ativo` | boolean | caixa "Enviar todo dia 1º por e-mail para o RH" |
| `destinatarios` | text[] | padrão: `RELATORIO_EMAIL_PARA` |
| `secoes` | text[] | |
| `ultimo_envio_em`, `ultimo_resultado` | timestamptz, text null | |
| `atualizado_por`, `atualizado_em` | uuid, timestamptz | |

### 1.10 Botões ESP32 (Entrega 2)

#### `botao_esp32` · CADASTRO

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | |
| `nome` | text | "Botão mesa 1" |
| `mesa_id` | uuid → `mesa` null | `unique where mesa_id is not null` (um botão por mesa) |
| `porta` | smallint null | "porta 1" mostrado em Mesas |
| `token_versao` | int default 1 | sobe ao gerar token novo |
| `ativo` | boolean default true | |
| `ultimo_heartbeat_em`, `ultimo_pulso_em` | timestamptz null | "sem sinal" derivado |
| `firmware`, `rssi` | text, smallint null | do heartbeat |
| `criado_por`, `criado_em` | uuid, timestamptz | |

Token = `<id>.<versao>.<HMAC-SHA256(id + versao, ESP32_PULSO_SEGREDO)>`: confere sem ir ao banco e ainda checa `ativo` e `token_versao` na mesma consulta que resolve a mesa.
Lê: `mesas` (coluna BOTÃO ESP32), `montagem` ("· botão"), Admin › Botões. Grava: Admin › Botões.

#### `pulso_esp32` · EVENTO (todo aperto que chega, conte ou não)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | bigserial PK | |
| `botao_id` | uuid → `botao_esp32` | |
| `boot_id` | int | número aleatório gerado a cada ligação do ESP32 |
| `seq` | int | contador do firmware |
| `ocorrido_em` | timestamptz | `recebido − atraso_ms` (ou hora NTP) |
| `recebido_em` | timestamptz default now() | |
| `mesa_id` | uuid null | mesa resolvida |
| `resultado` | `resultado_pulso` | |
| `registro_id` | uuid → `registro_producao` null | quando contou |

Índices: `unique (botao_id, boot_id, seq)` (idempotência do buffer do firmware), `(mesa_id, ocorrido_em desc)`.
Pulso em mesa sem operadora ou sem medida fica aqui com `mesa_pendente` e **não** vira placa ("os apertos delas não contam até configurar"); o "último pulso" da mesa vem desta tabela. Lê: `mesas`, `montagem`. Grava: `POST /api/pulsos`.

### 1.11 Relações (resumo)

```
usuario 1—N registro_acao, correcao_registro, meta_setor, ordem_producao, exportacao
tablet 1—N tablet_vinculo 1—N operacao_tablet
setor 1—1 setor_config, setor_estado
setor 1—N jornada 1—N lote 1—N registro_producao
jornada 1—N pausa            jornada 1—N correcao_registro 1—N registro_producao
medida 1—N lote, registro_producao, mesa, estoque_movimento, ordem_producao, meta_medida
mesa N—1 operadora            mesa 1—0..1 botao_esp32 1—N pulso_esp32 0..1—1 registro_producao
registro_producao (tes_pacote) 1—1 estoque_movimento (entrada)
ordem_producao 1—N op_evento, estoque_movimento
pausa_categoria 1—N pausa_motivo; pausa N—1 categoria, motivo
```

### 1.12 Tela × tabela (L = lê, G = grava)

| Tabela | Telas |
|---|---|
| `usuario`, `tentativa_acesso` | `entrar` L/G · `admin-tablets` (aba Usuários) L/G |
| `tablet`, `tablet_vinculo` | `admin-tablets` L/G · `config-tablet` L/G · `area` L · históricos e `rh-desempenho` L (origem) |
| `operacao_tablet` | sync dos tablets G · Admin L |
| `setor`, `setor_config`, `setor_estado` | todas L · `rh-pausas` G (minutos) |
| `medida` | todas com medida L · `rh-pedidos` G (mínimo) |
| `jornada` | `injetora`, `montagem`, `teste` L/G · `setores`, `area`, `hist-*`, `rh-agora`, `rh-pausas`, `rh-metas`, `rh-exportar` L · `rh-desempenho` L/G |
| `lote` | `injetora`, `teste` L/G · `hist-injetora`, `hist-teste`, `rh-agora`, `rh-desempenho` L |
| `operadora`, `mesa` | `mesas` L/G · `montagem`, `hist-montagem`, `rh-agora`, `rh-desempenho`, `rh-exportar` L |
| `registro_producao` (+ views) | `injetora`, `montagem`, `mesas`, `teste` L/G · `rh-desempenho` L/G (correção) · `area`, `setores`, `hist-*`, `rh-agora`, `rh-metas`, `rh-pedidos` (pacotes por dia), `rh-exportar` L |
| `correcao_registro` | `rh-desempenho` L/G · `rh-exportar`, `hist-*` L |
| `pausa_categoria`, `pausa_motivo` | `injetora`, `montagem`, `teste` L · `rh-pausas` L/G |
| `pausa`, `aviso_dispensado` | `injetora`, `montagem`, `teste` L/G · `rh-pausas` L/G · `area`, `setores`, `rh-agora`, `rh-desempenho`, `hist-*`, `rh-exportar` L |
| `meta_setor`, `meta_medida`, `calendario_mes` | `rh-metas` L/G · todas as telas com "% da meta" L |
| `ordem_producao`, `op_evento` | `rh-pedidos` L/G · `teste`, `rh-exportar` L |
| `estoque_movimento` | `teste` G (via pacote) e L · `rh-pedidos` L/G · `rh-agora`, `rh-exportar` L |
| `exportacao`, `relatorio_agendado` | `rh-exportar` L/G · `hist-*` G (CSV) |
| `botao_esp32`, `pulso_esp32` | Admin › Botões L/G · `mesas`, `montagem` L · `/api/pulsos` G |
| `registro_acao` | Admin › Registro de ações L · `rh-exportar` L · todas as ações de escrita G |

---

## 2. Regras de negócio centralizadas (`lib/dominio/`)

Funções **puras** (sem banco), em TypeScript, importadas pelo servidor **e** pelo tablet (o estado otimista offline usa as mesmas contas). Cada uma com teste unitário usando os números de exemplo dos mapas.

```
lib/
  db/         schema.ts, cliente.ts (neon http + pool ws), migrations/, seed.ts
  auth/       auth.ts (Auth.js), acesso.ts (exigirRH, exigirAdmin, exigirTablet, exigirBotao), limite.ts
  dominio/    tempo.ts medidas.ts producao.ts metas.ts injetora.ts montagem.ts teste.ts
              lotes.ts jornada.ts pausas.ts estoque.ts ordens.ts correcoes.ts
              aplicar-operacao.ts   <- porta única de escrita de tablet e botão
  consultas/  agora.ts setor.ts historico.ts desempenho.ts pausas.ts pedidos.ts metas.ts exportar.ts admin.ts
  acoes/      server actions de RH e Admin
  offline/    dexie.ts fila.ts sync.ts estado-local.ts
  cache/      tags.ts
  validacao/  esquemas zod compartilhados (cliente e servidor)
```

### 2.1 `tempo.ts`
- `FUSO = 'America/Sao_Paulo'`; `diaDe(instante): 'YYYY-MM-DD'`; `agoraSP()`.
- Formatos: `43 min` / `1h26` / `10h34` / `8h 14min`; números pt-BR (milhar com ponto, decimal com vírgula, 1 casa em percentuais).
- `diasUteisDecorridos(ano, mes, hoje)`, `diasUteisRestantes(...)` (restantes **inclui hoje**, como no painel Metas).

### 2.2 `producao.ts` · a regra única
- `UNIDADE = { inj: 'boas', mon: 'montadas', tes: 'embaladas' }`.
- `valorDoSetor(linhas)`: `inj` = Σ `placas` de `inj_boa2 + inj_boa1`; `mon` = Σ `placas` de `mon_placa`; `tes` = Σ `placas` de `tes_pacote`.
- `resumoDoDia(setor, dia)`: monta, a partir de `v_producao_dia`, o objeto que **todas** as telas consomem: valor, por medida, área (Σ placas × `area_m2`; só placa que conta soma área), primeiro e último registro, contadores por tipo.
- Setor sem linha no dia = `sem_producao` (nunca repetir o dia anterior).
- `Montagem`: só conta evento com operadora e medida (pulso em mesa pendente nem chega a virar evento), o que resolve a divergência "todas × só ativas" entre Mesas e Montagem.

### 2.3 `metas.ts` · metas e ritmo
| Função | Conta | Exemplo |
|---|---|---|
| `metaDoDia(setor, dia)` | `meta_setor` vigente | 270 |
| `pctMeta(valor, meta)` | `round(valor ÷ meta × 100)`; texto sem trava | 387 → 143% |
| `pctBarra(...)` | `min(100, pct)` | anel e barra |
| `faltam(valor, meta)` | `meta − valor`; ≤ 0 → `{ acima: valor − meta }` | "Acima +117" |
| `ritmo(valor, minutosAtivos)` | `round(valor ÷ horas ativas)`; nulo se não há tempo registrado (Fase 0: esconder placas/hora) | 240 ÷ 8h14 = 29/h |
| `bateMeta(agora, faltam, ritmo)` | `agora + faltam ÷ ritmo` → `HH:MM` \| `'batida'` \| `'—'` | 16:38 |
| `metaDoMes(metaDia, diasUteis)` | produto | 5.670 |
| `esperado(...)` | dias úteis decorridos ÷ dias úteis **[padrão proposto]** (o protótipo usa dias com produção: 5 ÷ 21 = 24%) | 24% |
| `fazPorDia(feito, diasComProducao)` | divisão | 301 |
| `precisaPorDia(metaMes, feito, restantes)` | `ceil((metaMes − feito) ÷ restantes)`; `'—'` se 0 | 278 |
| `projecao(feito, fazPorDia, restantes)` | `feito + fazPorDia × restantes` | 6.016 |
| `aFrente(pct, esperado)` | `pct ≥ esperado` | |
| `metaDoDiaGrafico()` | meta Montagem + meta Teste | 540 |

"Feito no mês" é sempre **até ontem**; "hoje" vem do dia em andamento (mesma `resumoDoDia`).

### 2.4 `injetora.ts` · ciclos, eficiência, perdas
- `CICLOS = { inj_boa2: 2, inj_boa1: 1, inj_vazio: 1, inj_perda_*: 1 }` (constante usada **só** para preencher `registro_producao.ciclos`; a leitura soma a coluna).
- `eficiencia(boas, perdas)` = `boas ÷ (boas + perdas)`; vazios fora; `'—'` se o divisor é zero.
- `perdas` = soma dos 4 tipos; `ciclosPerdidos` = Σ `ciclos` das perdas **[padrão proposto]**; `ciclosVazios` = Σ `ciclos` de `inj_vazio` (mostrados separados, o que acaba com "Ciclos perdidos repete Perdidas").
- `ciclosDoLote`, `ciclosNoInicio`, `ciclosAgora` (seção 1.5).
- `placasPorHora`, `ciclosPorHora`, `tempoPorPlaca`, `tempoPorCiclo` sobre o tempo produtivo (registro aberto do Desempenho).

### 2.5 `teste.ts` · testadas, aprovação, placas por pacote
- `testadas = embaladas + defeitos`; `aprovacao = embaladas ÷ testadas`; `perda = defeitos ÷ testadas`.
- `placasPorPacote(embaladas, pacotes)` = média com 1 casa; `distribuicaoPorTamanho` ("com 10: 136 × com 8: 10") = `group by placas ÷ quantidade` nos `tes_pacote`.
- `validarPlacasPorPacote(n, config)`: entre `min` e `max`; `foraDoPadrao = n ≠ padrao`.
- **O histórico soma placas reais** (não pacotes × 10): a coluna `placas` já carrega o valor de cada pacote.

### 2.6 `montagem.ts`
- `mesaAtiva(mesa)` = tem operadora e medida.
- `porOperadora(linhas)`: total, `% do dia`, ritmo (mesmas horas do setor), ordenado do maior para o menor.
- `semMesa(operadora)`: tem produção hoje e nenhuma mesa atual (alerta do Agora).

### 2.7 `pausas.ts` · detecção de parada e tempos
- `ultimaAtividade(setor)` = maior entre último toque que conta, fim da última pausa e última dispensa (`setor_estado.ultima_atividade_em`).
- `detectarParada({ ultimaAtividade, pausaAberta, jornada, minutosAviso, agora })` devolve um de: `rodando` · `pausado { categoria, motivo, desde }` · `parado_sem_motivo { desde = ultimaAtividade, avisoEm, minutos }` · `sem_producao` · `fechado`. Só há parada se a jornada está aberta, já teve registro hoje e não há pausa aberta. **É a mesma função no tablet (abre o modal) e no servidor (Setores, Área, Agora, Pausas)**: a parada aparece para o RH mesmo que o tablet esteja desligado.
- `fecharLacuna(setor, novoEvento)`: ao chegar um toque com `ocorrido_em − ultimaAtividade > minutosAviso` e sem pausa cobrindo o intervalo, o servidor cria a pausa `aviso_sem_resposta` (`inicio = ultimaAtividade`, `fim = ocorrido_em`, `aviso_em = inicio + minutos`). É assim que nasce a linha "Sem motivo · Classificar".
- Contagem com pausa aberta: o toque **encerra a pausa** (`encerrada_por = 'contagem'`, `fim = ocorrido_em`) **[padrão proposto]**.
- `temposDoDia(jornada, pausas, agora)`: `duracao = termino − inicio`; `refeicao` = Σ pausas planejadas; `parado` = Σ pausas não planejadas (inclui sem motivo); `ativo = duracao − refeicao − parado`. `termino` = `fechada_em` (manual) ou último registro (automático / em andamento = agora).
- `resumoPausas(periodo, setor)`: tempo parado, nº de paradas, avisos (pausas com `aviso_em` + dispensas), sem resposta, maior causa, por categoria; "Refeição · planejada" à parte.
- `classificar(pausa, categoria, motivo, descricao, usuario)`: troca origem para `rh`, copia `motivo_texto` e `planejada` (classificar como Refeição tira do tempo parado).

### 2.8 `lotes.ts` e `jornada.ts` · fechamentos
- `fecharLote({ loteId, novoLoteId, novaMedidaId, em })`: fecha o lote, abre o seguinte (sempre existe um aberto), `motivo = troca_medida` se a medida muda. Idempotente pelo `novoLoteId`. Lote vazio pode fechar, mas **não aparece** nos históricos **[padrão proposto]**.
- Virada do dia: o primeiro toque de um novo `dia` fecha o lote de ontem (`virada_do_dia`) e abre outro com a mesma medida. O tablet faz isso localmente com ids próprios; o servidor repete a regra se o tablet não fizer.
- `abrirJornada(setor, dia, em)`: no primeiro registro. `fecharJornada({ em, confirmouZero })`: fecha o lote aberto (`fim_do_dia`), encerra a pausa aberta (`fechamento_dia`), grava `fechada_em`; total zero exige `confirmouZero = true` e marca `fechada_com_zero`.
- Toque depois do dia fechado, no mesmo dia: **reabre** a jornada e grava `jornada.reaberta` em `registro_acao` **[padrão proposto]** (recusar produção é pior do que reabrir).
- Fechamento automático (cron): fecha jornadas abertas de dias anteriores com `fechamento = 'automatico'` e `fechada_em = último registro`.

### 2.9 `estoque.ts` e `ordens.ts` · estoque e baixa por OP
- **Entrada**: toda linha `tes_pacote` (qualquer natureza, qualquer sinal) gera, na mesma transação, um `estoque_movimento` `entrada` com `pacotes = quantidade` e `placas = placas`. Vale para as **quatro** medidas (o protótipo só somava 3 m). "−1 pacote" e "Desfazer" entram como entrada negativa.
- `saldos(medida)`: físico, reservado, disponível, placas; `situacao` = `ok` \| `abaixo_do_minimo` \| `sem_dados` (sem nenhum movimento).
- `realocarReservas(medida, tx)` **[padrão proposto: reserva automática]**: depois de qualquer movimento da medida, distribui o disponível entre as OP `aberta` / `em_producao` daquela medida, por `data_entrega` e depois `numero`, até `pacotes_pedidos`. Gera `reserva` / `liberacao` em `estoque_movimento` e `op_evento`.
- `estadoDaOP(op)`: `aberta` (nada atendido) → `em_producao` (atendido parcial) → `concluida` (atendidos ≥ pedidos); `expedida_em` é uma etapa à parte (o exemplo do protótipo é "Concluída" com expedição não registrada).
- `expedir(op, pacotes, usuario)`: `estoque_movimento` `expedicao` com `pacotes = −n`, `reservado = −n`; soma em `pacotes_expedidos`; `op_evento` `expedicao`. Parcial permitido **[padrão proposto]**.
- `ajustar(medida, pacotes, placas, motivo, usuario)`: motivo obrigatório; `saldo_inicial` é um ajuste com tipo próprio (carga dos 384 de 3 m).
- Estoque nunca fica negativo: validação dentro da transação com `select ... for update` no saldo da medida.

### 2.10 `correcoes.ts`
- `corrigirRegistro({ setor, dia, novosTotais, horario?, motivo, usuario })`: calcula a diferença contra `resumoDoDia`, grava o cabeçalho em `correcao_registro` e as linhas compensatórias. Passa pela mesma `aplicarOperacao` (logo, corrigir pacotes mexe no estoque e avisa em tela).
- `lancarDia(...)`: cria jornada `origem = 'rh'`, com ou sem horário (`sem_horario`), e as linhas `natureza = 'lancamento'`.

### 2.11 `aplicar-operacao.ts` · porta única de escrita
Toda escrita de tablet, botão e correção passa por `aplicarOperacao(tx, operacao, autor)`:
1. valida o formato (zod) e a permissão (tablet do setor certo);
2. calcula `dia`; abre a jornada se preciso; reabre se estava fechada;
3. resolve o lote (seção 5.4);
4. valida o piso (um "−1" exige saldo ≥ 1 naquele contador do lote ou da mesa);
5. grava o evento; efeitos colaterais na mesma transação: entrada de estoque, realocação de reserva, fechamento de lacuna, encerramento de pausa aberta;
6. atualiza `setor_estado` (versão, último registro);
7. devolve o que precisa ser invalidado no cache (a rota chama `revalidateTag`).

---

## 3. Superfície de API

### 3.1 Autenticação: três credenciais

| Quem | Credencial | Onde fica | Como o servidor confere |
|---|---|---|---|
| RH / Admin | senha → sessão Auth.js (Credentials, JWT em cookie httpOnly; 12 h com renovação) | cookie | `exigirRH()` / `exigirAdmin()` em **toda** action e rota; confere `senha_versao` e `ativo` |
| Tablet | token opaco de dispositivo (32 bytes), emitido no vínculo | cookie httpOnly de 1 ano **e** IndexedDB (a fila manda `Authorization: Bearer`) | `exigirTablet()`: SHA-256 → `tablet_vinculo` ativo → `{ tabletId, setorId, modo }`. Revogar o vínculo derruba na hora |
| Botão ESP32 | token assinado com `ESP32_PULSO_SEGREDO` | flash do ESP32 | `exigirBotao()`: HMAC + `ativo` + `token_versao` |

`proxy.ts` (Next 16; não existe mais `middleware.ts`) faz só o redirecionamento otimista: sem sessão e sem token de tablet → `/entrar`; rota `/rh/**` e `/admin/**` sem sessão → `/entrar`. A checagem de verdade é dentro de cada action e rota. Ler antes `02-guides/authentication-with-cache-components.md`.
**[padrão proposto]** tablet vinculado abre direto a tela do seu setor, sem senha; para ir à Área ou ao RH pede a senha. Sessão de RH/Admin abre as telas de setor **só para leitura**; registrar exige tablet vinculado ao setor.

### 3.2 Route Handlers (URLs estáveis)

| Rota | Quem chama | Autenticação | Idempotência | Invalida |
|---|---|---|---|---|
| `POST /api/tablet/vincular` | `config-tablet` | sessão válida **+** código do tablet; limite de tentativas | revoga vínculo anterior do mesmo cadastro | `revalidateTag('config:tablets','max')` |
| `POST /api/tablet/desvincular` | `config-tablet` ("Usar outro ID") | token do tablet | — | `config:tablets` |
| `GET /api/tablet/estado?v=` | telas de setor (abertura, polling, depois do sync) | token do tablet | — (leitura; responde `{ mudou: false }` se `v` = `setor_estado.versao`) | — |
| `POST /api/tablet/sync` | fila do tablet (telas `injetora`, `montagem`, `mesas`, `teste`) | token do tablet | por item: `operacao_tablet.id`; eventos, lotes e pausas também pelo próprio id | `dia:<setor>:<dia>` e `mes:<setor>:<mes>` **só** se o item for de dia anterior a hoje; `pausas:<dia>`; `estoque` e `op` se houve pacote; `config:mesas` se houve operação de mesa |
| `POST /api/pulsos` | firmware ESP32 | token do botão | `unique (botao_id, boot_id, seq)`; aceita lote de pulsos do buffer | nada cacheado (hoje é ao vivo); mesmas tags do sync se o pulso for de dia anterior |
| `POST /api/pulsos/heartbeat` | firmware | token do botão | sobrescreve "último" | — |
| `GET /api/agora?v=` | `area`, `setores`, `rh-agora`, `rh-pausas` (Setores agora), `mesas`, TV | sessão RH/Admin **ou** token de tablet | — | — (nunca cacheado) |
| `GET /api/historico/[setor]/csv?periodo&medida` | `hist-injetora`, `hist-montagem`, `hist-teste` | tablet do setor ou sessão | — | grava `exportacao` |
| `GET /api/exportar/[id]` | `rh-exportar` (baixar o arquivo gerado) | sessão RH/Admin | — | — |
| `GET /relatorio/imprimir?t=` | serviço de PDF no Railway (Chromium abre esta página) | token curto assinado com `PDF_SERVICE_TOKEN` (5 min) | — | — |
| `GET /api/health` | UptimeRobot | nenhuma | — | sem cache; faz `select 1` e devolve versão do app |
| `GET /api/cron/fechar-dia` | Vercel Cron (diário) | `Authorization: Bearer CRON_SECRET` | fecha só jornada ainda aberta | `dia:*` do dia fechado, `mes:*` |
| `GET /api/cron/relatorio-mensal` | Vercel Cron (dia 1º) | `CRON_SECRET` | não reenvia se `ultimo_envio_em` é do mês | — |
| `GET /api/cron/limpeza` | Vercel Cron (diário) | `CRON_SECRET` | — | — |

Variável nova para o `.env.example`: `CRON_SECRET`.

### 3.3 Server Actions (RH e Admin; sempre online)

Todas: validam com zod, conferem o papel, rodam em transação, gravam `registro_acao` e chamam `updateTag`. Formulário com duplo clique é protegido por `idem` (uuid gerado no cliente e guardado em `registro_acao`).

| Action | Tela | Papel | Invalida (`updateTag`) |
|---|---|---|---|
| `entrar(senha)` / `sair()` | `entrar`, `area` | — | — |
| `salvarMetas({ diasUteis, porSetor, porMedida })` | `rh-metas` | rh, admin | `config:metas`, `mes:*:<mes>` |
| `classificarPausa(pausaId, categoria, motivo, descricao)` | `rh-pausas` | rh, admin | `pausas:<dia>`, `dia:<setor>:<dia>`, `mes:<setor>:<mes>` |
| `salvarRegrasPausa({ minutos por setor })` | `rh-pausas` | rh, admin | `config:pausas` |
| `criarMotivo` / `editarMotivo` / `desativarMotivo` / `reordenarMotivos` | `rh-pausas` | rh, admin | `config:pausas` |
| `criarOP` / `editarOP` / `cancelarOP` | `rh-pedidos` | rh, admin | `op`, `estoque` |
| `registrarExpedicao(opId, pacotes, data)` | `rh-pedidos` | rh, admin | `op`, `op:<id>`, `estoque` |
| `definirMinimos({ porMedida })` | `rh-pedidos` | rh, admin | `estoque`, `config:medidas` |
| `ajustarEstoque({ medida, pacotes, placas, motivo })` | `rh-pedidos` | rh, admin | `estoque`, `op` |
| `corrigirRegistro(...)` / `lancarDia(...)` / `marcarRevisado(jornadaId)` | `rh-desempenho` | **[padrão proposto]** admin; rh a confirmar | `dia:<setor>:<dia>`, `mes:<setor>:<mes>`, `estoque` |
| `gerarExportacao(filtros)` | `rh-exportar` | rh, admin | — |
| `salvarEnvioMensal({ ativo, destinatarios })` | `rh-exportar` | rh, admin | `config:relatorio` |
| `criarTablet` / `editarTablet` / `gerarNovoCodigo` / `desvincularTablet` / `arquivarTablet` | `admin-tablets` | admin | `config:tablets` |
| `criarBotao` / `vincularBotaoMesa` / `gerarTokenBotao` / `desativarBotao` | Admin › Botões | admin | `config:mesas` |
| `criarUsuario` / `redefinirSenha` / `desativarUsuario` | Admin › Usuários | admin | — |
| `resolverOperacaoRejeitada(id, decisao)` | Admin | admin | conforme a decisão |

### 3.4 Leituras (`lib/consultas/`) e tags de cache

| Consulta | Usada por | Cache |
|---|---|---|
| `resumoAgora()` (os 3 setores: estado, valor, meta, ritmo, previsão, por medida, detalhe de cada setor, estoque, alertas, `versao`, `atualizadoEm`) | `/api/agora`: `area`, `setores`, `rh-agora`, `rh-pausas`, `mesas` | **sem cache** |
| `estadoDoSetor(setor)` (config + jornada + lote aberto + totais + pausa aberta + últimos 50 registros + mesas) | `/api/tablet/estado`: `injetora`, `montagem`, `mesas`, `teste` | **sem cache** |
| `configDoSetor(setor)` (meta, minutos, medidas, catálogo de pausas) | telas de setor | `'use cache'`, `cacheLife('hours')`, tags `config:metas`, `config:pausas`, `config:medidas` |
| `historicoDoSetor(setor, de, ate, medida?)` | `hist-*`, CSV | por dia: `cacheLife('days')` + tag `dia:<setor>:<dia>`; o dia de hoje é lido ao vivo e juntado |
| `desempenho(mes, filtros)` | `rh-desempenho`, prévia do `rh-exportar` | `cacheLife('hours')` + `mes:<setor>:<mes>` |
| `registroDoDia(setor, dia)` | `rh-desempenho` (registro aberto) | `dia:<setor>:<dia>` |
| `pausasDoPeriodo(periodo, setor)` | `rh-pausas` | dias fechados: `pausas:<dia>`; hoje ao vivo |
| `pedidosEEstoque(medida?)` | `rh-pedidos`, `teste`, `rh-agora` | `cacheLife('minutes')` + `estoque`, `op` |
| `metasDoMes(mes)` | `rh-metas`, `rh-desempenho`, `rh-agora` | `config:metas` + `mes:*` |
| `adminTablets()`, `adminBotoes()`, `registroDeAcoes(filtros)` | Admin | `config:tablets`, `config:mesas`; ações sem cache |

Lista fechada de tags (`lib/cache/tags.ts`): `config:metas`, `config:pausas`, `config:medidas`, `config:mesas`, `config:tablets`, `config:relatorio`, `dia:<setor>:<AAAA-MM-DD>`, `mes:<setor>:<AAAA-MM>`, `pausas:<AAAA-MM-DD>`, `estoque`, `op`, `op:<id>`.
Os filtros de medida, setor, operadora e origem do RH são aplicados **no cliente** sobre um resultado que já vem quebrado por essas dimensões: trocar de filtro não refaz a consulta.

### 3.5 PDF, Excel, CSV e e-mail
- **CSV e Excel**: gerados no próprio app (`xlsx`), a partir das mesmas consultas da prévia. CSV com `;`, UTF-8 com BOM, decimal com vírgula **[padrão proposto]**.
- **PDF**: a prévia do painel e o documento são **o mesmo componente** (`/relatorio/imprimir`). O app pede ao serviço do Railway (`PDF_SERVICE_URL`, cabeçalho com `PDF_SERVICE_TOKEN`) que abra essa URL com um token curto e devolva o PDF; o app guarda no S3 e registra em `exportacao`.
- **Mensal**: o cron do dia 1º gera o "Relatório mensal" do mês anterior e envia pelo Resend para `relatorio_agendado.destinatarios`.

---

## 4. Tempo real

**Recomendação para Vercel + Neon: polling curto com checagem de versão. Sem SSE nesta entrega.**

Por quê:
- Função serverless não mantém memória entre instâncias: um SSE precisaria de um barramento externo (Redis/Ably) ou de `LISTEN/NOTIFY` do Postgres, que exige conexão **direta e permanente** por espectador (fora do pooler) e impede o Neon de suspender.
- São poucos espectadores (3 tablets, 1 ou 2 pessoas do RH, talvez uma TV) e o próprio desenho já fala em polling: "atualizado 09:49:57", "atualiza sozinho".
- Polling funciona igual no iPad, no Android e atrás do Wi-Fi da fábrica, e se recupera sozinho de queda de rede.

Como:
1. Toda escrita sobe `setor_estado.versao` na mesma transação.
2. O cliente chama `GET /api/agora?v=<soma das versões>` (ou `/api/tablet/estado?v=`). Se nada mudou, o servidor lê 3 linhas por PK e responde `{ mudou: false }`. Se mudou, devolve o resumo inteiro (JSON pequeno).
3. Intervalos:

| Tela | Intervalo com a aba visível | Observação |
|---|---|---|
| `montagem`, `mesas` | 2 s | o pulso do botão ESP32 tem de aparecer na hora (teste da visita: toque → número subindo) |
| `rh-agora`, `setores`, `area`, `rh-pausas` (Setores agora), TV | 5 s | |
| `injetora`, `teste` | 15 s | o tablet é a fonte dos próprios toques (estado otimista); o polling só pega outro aparelho, mudança de meta e regra |
| `rh-pedidos` | 30 s | |
| `rh-desempenho`, históricos | sem polling | dado até ontem; revalida ao focar a aba |

4. Pausa o polling com a aba escondida (`visibilitychange`) e recua para 30 s depois de 5 min sem mudança. Volta ao ritmo normal na primeira mudança ou toque.
5. Os minutos correndo ("Pausado · 4 min", "parada há 12 min") são calculados **no cliente** a partir de `desde`, com o relógio do servidor (`atualizadoEm`) como base: não dependem do intervalo.
6. Um hook só (`useAoVivo(url, intervalo)`) para todas as telas.

Custo e limite (conferir antes de publicar): o banco fica acordado durante todo o expediente (os tablets gravam o dia inteiro de qualquer forma) e o volume fica na ordem de centenas de milhares de chamadas por mês. Vale conferir a cota de computação do plano gratuito do Neon e a de invocações do plano da Vercel; o primeiro ajuste, se apertar, é subir os intervalos (Montagem 3 s, RH 10 s).

Caminho de evolução, se 2 s não bastar para a Montagem: SSE **só** nessa tela, com um barramento gerenciado (Upstash Redis ou Ably) publicado dentro de `/api/pulsos`. Não muda o modelo de dados.

---

## 5. Offline

### 5.1 O que funciona sem rede
| Funciona offline (entra na fila) | Precisa de conexão |
|---|---|
| Injetora: +1 placa boa, +1 placa (1 ciclo), +1 cabeça vazia, +1 perda (4 tipos), todos os −1, Desfazer | Vincular / desvincular tablet |
| Montagem: +1 e −1 por mesa | Mesas: trocar operadora ou medida, adicionar mesa, operadoras, corrigir quantidade (configuração: sem conexão o controle fica desabilitado com aviso) |
| Teste: + Pacote (com as placas do pacote), −1 pacote, + Caninho, + Cabeçote, −1 defeito, Desfazer | Históricos e CSV (mostram o último resultado em cache, com aviso de "sem conexão") |
| Fechar lote / fechar pacote (com ou sem troca de medida) | Todas as telas de RH e Admin |
| Pausar (motivo e descrição), responder o aviso, "Não parou", Retomar | Entrar (a sessão de senha exige rede) |
| Fechar dia **[padrão proposto]** | |

O aviso de parada dispara **no aparelho** (temporizador local desde o último toque local), com a regra `minutos_aviso_parada` guardada no último `estado` recebido.

### 5.2 Formato do item da fila (Dexie, tabela `fila`)

```ts
type ItemFila = {
  id: string            // UUID v7 gerado no aparelho = operacao_tablet.id
  seq: number           // contador crescente do aparelho (ordem garantida)
  setor: 'inj' | 'mon' | 'tes'
  tipo:
    | 'registro'            // dados: { registroId, tipoRegistro, quantidade: 1 | -1, natureza: 'toque' | 'ajuste',
                            //          loteId?, medidaId, mesaId?, placasNoPacote? }
    | 'registro.desfazer'   // dados: { registroId, alvoId }
    | 'lote.fechar'         // dados: { loteId, novoLoteId, novaMedidaId }
    | 'pausa.iniciar'       // dados: { pausaId, origem: 'operador' | 'aviso_respondido', inicio, avisoEm?,
                            //          categoriaId, motivoId?, descricao? }
    | 'pausa.encerrar'      // dados: { pausaId }
    | 'aviso.dispensar'     // dados: { avisoId, ultimoRegistroEm, avisoEm }
    | 'jornada.fechar'      // dados: { dia, confirmouZero }
  ocorridoEm: string    // ISO, relógio do aparelho
  estado: 'pendente' | 'enviando' | 'rejeitado'
  tentativas: number
  ultimoErro?: string
}
```

Envelope de envio (`POST /api/tablet/sync`): `{ enviadoEm, appVersao, itens: ItemFila[] }` (até 100 por chamada, em ordem de `seq`). Resposta: `{ resultados: [{ id, resultado: 'aplicada' | 'rejeitada', motivo? }], estado, versao, agoraServidor }`.

Outras tabelas locais: `dispositivo` (token, tablet, setor, preferências), `estado` (último retrato do servidor por setor), `registros` (últimos 50 toques, para "Último registro" e Desfazer).

### 5.3 Envio
- Dispara: a cada toque (com espera de 300 ms para juntar toques), ao voltar a rede (`online`), ao voltar a aba para frente e a cada 15 s enquanto houver pendente. Background Sync do Serwist onde existir (Chrome/Android); o Safari do iPad não tem, então os gatilhos acima são o caminho principal, não o reserva.
- Um envio por vez (trava local); nova tentativa com recuo de 2 s até 60 s.
- Serwist: pré-cache da casca das rotas de setor, fontes e ícones; **nunca** intercepta `POST`. `GET /api/tablet/estado` é rede primeiro, com queda para o retrato do Dexie.
- A tela mostra sempre: "sem conexão" (quando offline), "N registros para enviar" (fila) e "N recusados" (toque abre a lista). Não há desenho no protótipo: precisa de um card de interface.

### 5.4 Reconciliação
1. **Servidor é a verdade; o tablet rebaseia.** Depois de cada resposta, o estado local vira `estado do servidor + itens ainda pendentes reaplicados` com as funções de `lib/dominio/` (as mesmas contas dos dois lados).
2. **Duplicata**: item com `id` já visto devolve o resultado gravado em `operacao_tablet`, sem reaplicar.
3. **Ordem**: o servidor aplica por `seq`. Cada item em sua transação; a rejeição de um não trava os outros, exceto dependentes (evento de um lote cujo `lote.fechar` foi rejeitado → `depende_de_rejeitada`).
4. **Relógio**: `desvio = agoraServidor − enviadoEm`. Se passar de 2 min, o servidor soma o desvio a cada `ocorridoEm` do envio e grava `desvio_relogio_ms`. O `dia` é sempre calculado no servidor depois da correção.
5. **Lote**: o evento entra no lote informado se `ocorridoEm` estiver dentro da janela dele; se o lote já foi fechado por outro aparelho, entra no lote aberto da **mesma medida**; se a medida não bate, é rejeitado (`lote_fechado`) e aparece para o operador e para o Admin.
6. **Piso do −1**: validado na ordem de chegada; sem saldo → `sem_saldo` (o tablet tira o −1 do estado local).
7. **Dois aparelhos no mesmo setor**: somas são comutativas, não há conflito em +1; a pausa aberta é única (o segundo `pausa.iniciar` é rejeitado e o aparelho passa a mostrar a pausa do primeiro).
8. **Tablet revogado com fila pendente** ("Gerar novo ID" / "Desvincular"): os itens com `ocorridoEm` **anterior** à revogação são aceitos; os posteriores são rejeitados (`tablet_revogado`) **[padrão proposto]**. O aparelho volta para Configurar tablet.
9. **Item atrasado de outro dia**: é aplicado no dia certo e invalida `dia:<setor>:<dia>` e `mes:<setor>:<mes>`.
10. **Rejeitados** ficam em `operacao_tablet` com o `payload`, para o Admin aplicar à mão (via `corrigirRegistro`) ou descartar.

---

## 6. Ordem de construção das migrations e dependências

Regra por causa do banco único (uma branch só no Neon, usada em dev e produção): migrations **só aditivas** (`drizzle-kit generate` + `migrate`, nunca `push`), seed **idempotente** (`on conflict do nothing`), nada de `drop` sem card próprio e confirmação.

| # | Migration | Conteúdo | Destrava |
|---|---|---|---|
| 0001 | `base` | enums; `setor`, `setor_config`, `setor_estado`, `medida`, `usuario`, `tentativa_acesso`, `registro_acao` | login, layout, `/api/health` |
| 0002 | `tablets` | `tablet`, `tablet_vinculo`, `operacao_tablet` | Admin › Tablets, Configurar tablet |
| 0003 | `producao` | `jornada`, `lote`, `operadora`, `mesa`, `correcao_registro`, `registro_producao`, views `v_producao_dia` e `v_montagem_dia` | telas de setor, Mesas, Setores, Área, históricos, Agora |
| 0004 | `pausas` | `pausa_categoria`, `pausa_motivo`, `pausa`, `aviso_dispensado` | modal de pausa, RH · Pausas, tempos |
| 0005 | `metas` | `meta_setor`, `meta_medida`, `calendario_mes` | painel Metas, "% da meta" real (até aqui, seed com 270) |
| 0006 | `estoque_op` | `ordem_producao` (+ sequence), `op_evento`, `estoque_movimento` | azulejo Estoque do Teste, RH · Pedidos |
| 0007 | `exportacao` | `exportacao`, `relatorio_agendado` | painel Exportar, CSV dos históricos, envio mensal |
| 0008 | `esp32` | `botao_esp32`, `pulso_esp32`, FK `registro_producao.botao_id` | Admin › Botões, `/api/pulsos` (Entrega 2) |

Seeds (um script, por blocos): setores e `setor_config` (10/15/15, pacote 10, 1 a 30, 07:00); medidas (2, 3, 4, 5 m); categorias e motivos de pausa (lista do mapa `rh-pausas`); metas 270 com `vigente_de` = primeiro dia; `calendario_mes` do mês corrente; mesas 1 a 6; um usuário `admin` (senha vinda de variável de ambiente, nunca do código).

Dependências entre as partes (ordem sugerida de cards):

```
A  Banco base (0001) + cliente Drizzle + seed + /api/health
B  Auth: usuario, Entrar, sessão, proxy.ts, exigirRH/exigirAdmin            <- A
C  Tablets: cadastro (Admin) + vínculo + token de dispositivo               <- A, B
D  Núcleo de escrita: 0003 + aplicarOperacao + POST /api/tablet/sync
   + GET /api/tablet/estado + idempotência                                  <- C
E  Domínio puro com testes: producao, metas, injetora, teste, montagem      <- (nenhuma; pode ir em paralelo com A-C)
F  Leitura ao vivo: resumoAgora + /api/agora + hook de polling              <- D, E
G  Pausas: 0004 + iniciar/encerrar/dispensar no sync + detectarParada
   + fecharLacuna                                                           <- D
H  Metas: 0005 + salvarMetas + leitura em todas as telas                    <- A, B (as telas usam 270 do seed até aqui)
I  Lotes e fechamento de dia (lote.fechar, jornada.fechar, cron)            <- D, G
J  Mesas e operadoras (configuração, −1, correção)                          <- D
K  Estoque e OP: 0006 + entrada automática + reserva + expedição + ajuste   <- D
L  Históricos (consulta por dia + CSV)                                      <- D, G, H
M  Desempenho (consultas do mês, matriz, registro aberto)                   <- L
N  Correção de registro e lançamento da Administração                       <- D, K, M
O  RH · Pausas (classificar, motivos e regras)                              <- G
P  Exportar: 0007 + CSV/Excel + serviço de PDF + envio mensal               <- M
Q  Offline: Dexie + fila + Serwist + estado local + indicadores             <- D (mesmo envelope), G, I
R  ESP32: 0008 + Admin › Botões + /api/pulsos + heartbeat                   <- J
S  Admin › Usuários e Registro de ações                                     <- B
T  Operação: cron de limpeza, backup, Sentry/PostHog nos pontos de escrita  <- A
```

O caminho crítico é `A → C → D → F`: sem ele nenhuma tela de setor grava e nenhuma tela de RH mostra número. `E` (contas puras com testes) é o único bloco grande que anda em paralelo desde o primeiro dia.

---

## 7. Dúvidas que precisam de resposta do dono do produto

Em ordem de impacto no modelo. Entre colchetes, o padrão que este documento assumiu.

**Acesso**
1. A senha é única para todos, uma por perfil ou uma por pessoa? RH e Administração são papéis separados? [tabela de usuários com papel; a tela continua só com o campo de senha]
2. Tablet vinculado abre direto o setor, sem senha? O operador pode abrir o RH? [abre direto; RH e Área pedem senha]
3. Quem pode **registrar** produção: só o tablet vinculado ao setor, ou também PC/celular com senha? [só o tablet; senha dá leitura]
4. O código `TAB-MONT-01` é curto e adivinhável. Pode exigir alguém logado para vincular? Um código serve a um aparelho só? [exige sessão; segundo aparelho substitui o primeiro]
5. Como o administrador chega ao Admin (não há link na tela Área)? As abas Usuários e Registro de ações entram nesta entrega (não têm desenho)?

**Dia, turno e fechamento**
6. O dia vira à meia-noite? Existe mais de um turno? [meia-noite; um turno]
7. "Fechar dia (segurar 2 s)": quem pode, o que trava, dá para reabrir? Um toque depois de fechar reabre o dia? Se ninguém fechar, fecha sozinho (18:00? meia-noite)? [reabre com registro; fecha automático na virada]
8. Lote vazio pode ser fechado? Aparece no histórico? [fecha; não aparece]

**Injetora**
9. Perda "meio" e "total" contam quantos ciclos? O registro de exemplo do Desempenho só fecha com meio = 1 e total = 2; a tela do operador diz 1 para todas. [1 para todas]
10. Quando o operador usa "+ Placa (1 ciclo)" em vez de "Placa boa (2 ciclos)"? Conta igual na meta e na área? [conta igual]
11. "Ciclos perdidos" inclui as cabeças vazias? O contador de ciclos precisa bater com o contador físico da máquina? [não inclui; é derivado dos toques]

**Pausas**
12. Contar com o setor pausado encerra a pausa sozinho? [sim]
13. "Não parou": fica registrado e reinicia a contagem? O RH vê? [sim, sim, conta em Avisos do tablet]
14. Refeição desconta do tempo ativo? O "T. parado" dos históricos inclui refeição (o exemplo mostra 1h00 num lugar e 7 min em outro)? [refeição à parte; parado = só não planejadas]
15. O RH pode reclassificar, editar horário ou excluir uma parada? Pode criar, renomear e desativar motivos e categorias? [reclassificar sim; resto a definir]
16. A pausa é do setor inteiro, ou uma operadora parada na Montagem conta? [setor inteiro]
17. Descrição obrigatória em "Outro"? [opcional]

**Metas e somas**
18. Meta alterada no meio do mês: os dias passados usam a meta da época? [sim, por vigência]
19. "Esperado até ontem": dias úteis decorridos ou dias com produção? Feriado entra como? Os dias úteis são digitados todo mês? [dias úteis decorridos; RH digita]
20. "Meta por tamanho" soma, substitui ou só informa? [só guarda; fora das contas]
21. "Placas" do período soma os três setores (a mesma placa conta três vezes) e "Área hoje" também. É a definição desejada? [mantido como no protótipo]
22. "Perdas" do período = perdas da Injetora + reprovadas do Teste? Como ratear por medida (262 × 222 no exemplo)? [soma dos dois]
23. Limites de cor de eficiência e aprovação ("meta a definir")? [aprovação < 90% âmbar]

**Teste, pacote, estoque e OP**
24. Na tela do Teste, a corrida por medida se chama "pacote" ou "lote"? Hoje há "Pacotes: 30" dentro de "PACOTE ATUAL". [`lote` no banco]
25. Placas por pacote: padrão por medida? Volta a 10 ao fechar? Pacote com 8 é normal ou erro? [padrão único 10; não volta; permitido]
26. Placa reprovada no teste vai para onde (retrabalho, sucata)? Entra em perda de outro setor? [só conta como defeito]
27. Estoque passa a contar 2, 4 e 5 m desde o primeiro dia? De onde vêm os 384 pacotes de 3 m (carga inicial)? [conta as quatro; saldo inicial por ajuste]
28. Reserva de estoque para OP é automática ou manual? Por qual ordem? [automática, por data de entrega]
29. Ciclo da OP: o que é "Concluída" (atendida ou expedida)? Expedição parcial existe? Pode cancelar? Uma OP tem uma medida só? A numeração continua do sistema antigo (OP-00015)? [concluída = atendida; parcial sim; cancela; uma medida; sequência configurável]
30. Cliente é texto livre ou cadastro? [texto livre]

**Montagem e ESP32**
31. Aperto de botão em mesa sem operadora ou medida: descarta ou guarda para atribuir depois? [guarda o pulso, não conta]
32. O lápis "Corrigir quantidade": campo com o total do dia? Pede motivo? Quem pode? O −1 pode tirar placa contada pelo botão? [total do dia com motivo; −1 pode]
33. Remover operadora que está numa mesa: bloqueia ou solta das mesas? Operadora é a mesma pessoa de algum cadastro do RH? [solta e desativa; cadastro próprio só com nome]
34. Atraso aceitável entre o aperto do botão e o número na tela? [até 2 s]

**Correção e histórico**
35. "Corrigir este registro": quem pode (RH ou só Admin), o que pode mudar (totais, horário, divisão por operadora), precisa de motivo? Corrigir pacotes mexe no estoque? [Admin; totais e horário; motivo obrigatório; mexe]
36. Existe a tela de "Lançar dia pela Administração"? Há dados do sistema antigo para migrar (dias sem horário, OS-00015, estoque)? [sem migração; lançamento pelo próprio registro aberto]
37. Filtro de medida nos históricos: os números do dia passam a ser só da medida, ou continua o dia inteiro (Montagem e Teste fazem diferente da Injetora)? [recalcula só a medida]
38. CSV: uma linha por dia ou por dia × medida × operadora? O botão do histórico continua, já que o painel Exportar "substitui os botões CSV/PDF"? [por dia × medida; continua]

**Exportar**
39. Conteúdo dos tipos "Produção por operadora", "Perdas e defeitos", "Pacotes e estoque" e "Fechamentos e correções" (só o mensal tem desenho). Envio mensal entra na primeira entrega? Para quais e-mails? [mensal + CSV primeiro; e-mail de `RELATORIO_EMAIL_PARA`]

**Aparelhos e offline**
40. O pedido fala em iPad; o documento de preparação fala em tablet Android de 10". Qual é o aparelho do operador? Muda o offline (o Safari não tem envio em segundo plano e apaga dados de site sem uso fora de app instalado) e os cortes de largura (iPad deitado tem 1024 a 1194 px, abaixo dos 1280 do desenho).
41. Quanto tempo o tablet precisa aguentar sem rede? Fechar dia e fechar lote podem ser feitos offline? [um turno; sim]
42. "TV da fábrica (só visualizar)" entra agora? Que tela abre?

**Ambiente**
43. Com uma branch só no Neon, os testes desta fase gravam em produção. Como separar ou limpar antes da virada (tablets de teste marcados, limpeza por script, ou criar a branch de desenvolvimento antes de a fábrica começar a usar)?
