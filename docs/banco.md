# Banco de dados do AquaPulse

Mapa de todas as tabelas, gerado a partir de `lib/db/schema.ts` (o schema é a fonte; este arquivo é o retrato).
O modelo vem da síntese de dados (`docs/sintese/modelo-de-dados-e-back.md`, seção 1) e das decisões registradas nos cards do Jira.

## Situação

- **O banco inteiro já existe.** Migrations `0001_base`, `0002_tablets` e `0003_banco_completo` (SCRUM-100): 30 tabelas e 2 views, aplicadas no Neon (branch `production`) em 25/11/2026 junto com o seed.
  Nenhum card planejado precisa criar tabela. Se faltar uma coluna ou um índice, a migration nova é só aditiva (`npm run db:gerar` + `npm run db:migrar`, nunca `push`).
- Seed (`npm run db:seed`, dados em `lib/db/semear.ts`): 3 setores e configs, 4 medidas, 1 admin, mesas 1 a 6, 7 categorias e 38 motivos de pausa,
  meta 270 por setor desde 2026-11-01, dias úteis do mês corrente e a linha do envio mensal (desligada). Pode rodar quantas vezes for.
- `lib/db/banco.test.ts` aplica as três migrations num Postgres em memória (PGlite) e confere as restrições dos cards; roda no `npm test` e no CI.
- O que **não** está no banco e continua nos cards: rotas, Server Actions, regras de `lib/dominio/` e telas.

## Regras de modelagem

- Nada se apaga: toda chave estrangeira é `ON DELETE RESTRICT`; cadastro desativa ou arquiva.
- Quatro naturezas de tabela: **EVENTO** (só `INSERT`), **CADASTRO** (muda pouco, desativa), **CONFIGURAÇÃO** (valor vigente, alteração em `registro_acao`) e **ESTADO** (linha com ciclo de vida).
- Ids de `registro_producao`, `lote`, `pausa` e `aviso_dispensado` vêm do aparelho (UUID v7) e não têm padrão no banco: são a chave de idempotência (`on conflict (id) do nothing`).
- Tudo em `timestamptz`. `dia` é `date` calculado no servidor em `America/Sao_Paulo`.
- Totais (de lote, de dia, saldo de estoque) não são colunas: saem da soma dos eventos (views `v_producao_dia` e `v_montagem_dia`, e soma de `estoque_movimento`).
- Diferenças em relação à síntese: `pulso_esp32.boot_id` é `bigint` (o número sorteado pelo ESP32 é de 32 bits sem sinal);
  `exportacao.tablet_id` registra o CSV pedido pelo tablet; `pausa_motivo` tem nome único entre os ativos da categoria e do setor;
  `ordem_producao.numero` é coluna de identidade (no lugar da sequence avulsa).

## Índice

| Tabela | Natureza | Migration | Cards |
| --- | --- | --- | --- |
| [`setor`](#setor) | CADASTRO fixo (seed) | 0001 | SCRUM-23 |
| [`setor_config`](#setor_config) | CONFIGURAÇÃO | 0001 | SCRUM-23, SCRUM-57, SCRUM-60, SCRUM-79, SCRUM-44 |
| [`setor_estado`](#setor_estado) | ESTADO | 0001 | SCRUM-38, SCRUM-39, SCRUM-47, SCRUM-88 |
| [`medida`](#medida) | CADASTRO (seed) | 0001 | SCRUM-23, SCRUM-74 |
| [`usuario`](#usuario) | CADASTRO | 0001 | SCRUM-34, SCRUM-35, SCRUM-43 |
| [`tentativa_acesso`](#tentativa_acesso) | EVENTO | 0001 | SCRUM-34, SCRUM-36, SCRUM-42 |
| [`registro_acao`](#registro_acao) | EVENTO | 0001 | SCRUM-33, SCRUM-43, SCRUM-81 |
| [`tablet`](#tablet) | CADASTRO | 0002 | SCRUM-36, SCRUM-41, SCRUM-42 |
| [`tablet_vinculo`](#tablet_vinculo) | CADASTRO | 0002 | SCRUM-36, SCRUM-41, SCRUM-42 |
| [`operacao_tablet`](#operacao_tablet) | EVENTO | 0002 | SCRUM-38, SCRUM-86, SCRUM-87 |
| [`jornada`](#jornada) | ESTADO | 0003 | SCRUM-37, SCRUM-38, SCRUM-44, SCRUM-73 |
| [`lote`](#lote) | ESTADO | 0003 | SCRUM-37, SCRUM-38, SCRUM-50, SCRUM-57 |
| [`operadora`](#operadora) | CADASTRO | 0003 | SCRUM-37, SCRUM-55 |
| [`mesa`](#mesa) | CADASTRO | 0003 | SCRUM-37, SCRUM-53, SCRUM-55 |
| [`correcao_registro`](#correcao_registro) | EVENTO | 0003 | SCRUM-37, SCRUM-73 |
| [`registro_producao`](#registro_producao) | EVENTO (livro-razão) | 0003 | SCRUM-37, SCRUM-38, SCRUM-49, SCRUM-52, SCRUM-54, SCRUM-56, SCRUM-73, SCRUM-88 |
| [`pausa_categoria`](#pausa_categoria) | CADASTRO fixo (seed) | 0003 | SCRUM-47, SCRUM-60, SCRUM-79 |
| [`pausa_motivo`](#pausa_motivo) | CADASTRO | 0003 | SCRUM-47, SCRUM-60, SCRUM-79 |
| [`pausa`](#pausa) | ESTADO | 0003 | SCRUM-47, SCRUM-60, SCRUM-61, SCRUM-77, SCRUM-78 |
| [`aviso_dispensado`](#aviso_dispensado) | EVENTO | 0003 | SCRUM-47, SCRUM-60, SCRUM-77 |
| [`meta_setor`](#meta_setor) | CONFIGURAÇÃO com vigência | 0003 | SCRUM-51, SCRUM-80 |
| [`meta_medida`](#meta_medida) | CONFIGURAÇÃO com vigência | 0003 | SCRUM-51, SCRUM-80 |
| [`calendario_mes`](#calendario_mes) | CONFIGURAÇÃO | 0003 | SCRUM-51, SCRUM-80 |
| [`ordem_producao`](#ordem_producao) | CADASTRO com ciclo de vida | 0003 | SCRUM-58, SCRUM-75 |
| [`op_evento`](#op_evento) | EVENTO | 0003 | SCRUM-58, SCRUM-75, SCRUM-76 |
| [`estoque_movimento`](#estoque_movimento) | EVENTO (razão do estoque) | 0003 | SCRUM-58, SCRUM-59, SCRUM-74, SCRUM-76 |
| [`exportacao`](#exportacao) | EVENTO | 0003 | SCRUM-62, SCRUM-81, SCRUM-82, SCRUM-83 |
| [`relatorio_agendado`](#relatorio_agendado) | CONFIGURAÇÃO (1 linha, id = 1) | 0003 | SCRUM-81, SCRUM-84 |
| [`botao_esp32`](#botao_esp32) | CADASTRO | 0003 | SCRUM-88, SCRUM-89, SCRUM-91 |
| [`pulso_esp32`](#pulso_esp32) | EVENTO | 0003 | SCRUM-88, SCRUM-90 |
| [`v_producao_dia`](#v_producao_dia) | VIEW | 0003 | SCRUM-37, SCRUM-39, SCRUM-62, SCRUM-69 |
| [`v_montagem_dia`](#v_montagem_dia) | VIEW | 0003 | SCRUM-37, SCRUM-53, SCRUM-54, SCRUM-64 |

## Setores e catálogos

### `setor` · CADASTRO fixo (seed)

Os 3 setores: `inj`, `mon`, `tes`.

Migration 0001 · cards: SCRUM-23

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | text | não | PK |  |
| `nome` | text | não |  |  |
| `nome_curto` | text | não |  |  |
| `descricao` | text | não |  |  |
| `slug` | text | não |  |  |
| `cor` | text | não |  |  |
| `ordem` | smallint | não |  |  |
| `unidade` | text | não |  |  |

Restrições e índices:

- único (slug)

### `setor_config` · CONFIGURAÇÃO

Regras vigentes de cada setor: minutos do aviso de parada, placas por pacote, início da jornada, fechamento automático.

Migration 0001 · cards: SCRUM-23, SCRUM-57, SCRUM-60, SCRUM-79, SCRUM-44

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `setor_id` | text | não | PK | → setor.id |
| `minutos_aviso_parada` | smallint | não |  |  |
| `placas_por_pacote_padrao` | smallint | sim |  |  |
| `placas_por_pacote_min` | smallint | sim |  |  |
| `placas_por_pacote_max` | smallint | sim |  |  |
| `inicio_jornada` | time | sim |  |  |
| `fechamento_automatico` | time | sim |  |  |
| `atualizado_por` | uuid | sim |  | → usuario.id |
| `atualizado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- check `setor_config_minutos_aviso_parada_check`: minutos_aviso_parada between 5 and 60

### `setor_estado` · ESTADO

Atalho de leitura: `versao` sobe em toda escrita do setor (polling) e guarda o último registro e a última atividade (detecção de parada). Atualizada na mesma transação de cada escrita.

Migration 0001 · cards: SCRUM-38, SCRUM-39, SCRUM-47, SCRUM-88

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `setor_id` | text | não | PK | → setor.id |
| `versao` | bigint | não | 0 |  |
| `ultimo_registro_em` | timestamp with time zone | sim |  |  |
| `ultima_atividade_em` | timestamp with time zone | sim |  |  |
| `atualizado_em` | timestamp with time zone | não | now() |  |

### `medida` · CADASTRO (seed)

As medidas 2, 3, 4 e 5 m, com área e o mínimo de estoque em pacotes.

Migration 0001 · cards: SCRUM-23, SCRUM-74

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | smallint | não | PK |  |
| `comprimento_m` | numeric(4, 2) | não |  |  |
| `area_m2` | numeric(5, 2) | não |  |  |
| `ordem` | smallint | não |  |  |
| `ativa` | boolean | não | true |  |
| `estoque_minimo_pacotes` | integer | sim |  |  |

Restrições e índices:

- único (comprimento_m)

## Acesso e auditoria

### `usuario` · CADASTRO

Quem entra com senha (RH e Administração). Operador não é usuário.

Migration 0001 · cards: SCRUM-34, SCRUM-35, SCRUM-43

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `nome` | text | não |  |  |
| `papel` | papel_usuario | não |  |  |
| `senha_hash` | text | não |  |  |
| `senha_versao` | integer | não | 1 |  |
| `ativo` | boolean | não | true |  |
| `ultimo_acesso_em` | timestamp with time zone | sim |  |  |
| `criado_em` | timestamp with time zone | não | now() |  |
| `criado_por` | uuid | sim |  | → usuario.id |

Restrições e índices:

- índice `usuario_ativo_idx` (ativo)

### `tentativa_acesso` · EVENTO

Limite de tentativas de login (`alvo = 'login'`) e de vínculo de tablet (`alvo = 'vinculo'`).

Migration 0001 · cards: SCRUM-34, SCRUM-36, SCRUM-42

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | bigserial | não | PK |  |
| `alvo` | text | não |  |  |
| `chave` | text | não |  |  |
| `sucesso` | boolean | não |  |  |
| `ocorrido_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `tentativa_acesso_alvo_chave_ocorrido_em_idx` (alvo, chave, ocorrido_em)

### `registro_acao` · EVENTO

Auditoria de toda escrita que não seja toque de produção (`acao` com ponto: `tablet.criado`, `meta.alterada`, `jornada.reaberta`...).

Migration 0001 · cards: SCRUM-33, SCRUM-43, SCRUM-81

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | bigserial | não | PK |  |
| `ocorrido_em` | timestamp with time zone | não | now() |  |
| `ator` | text | não |  |  |
| `usuario_id` | uuid | sim |  | → usuario.id |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `acao` | text | não |  |  |
| `entidade` | text | sim |  |  |
| `entidade_id` | text | sim |  |  |
| `antes` | jsonb | sim |  |  |
| `depois` | jsonb | sim |  |  |
| `ip` | text | sim |  |  |
| `user_agent` | text | sim |  |  |

Restrições e índices:

- índice `registro_acao_ocorrido_em_idx` (ocorrido_em)
- índice `registro_acao_entidade_idx` (entidade, entidade_id)
- índice `registro_acao_acao_ocorrido_em_idx` (acao, ocorrido_em)

## Tablets

### `tablet` · CADASTRO

Cadastro de cada tablet (nome = origem nos históricos, setor, código `TAB-MONT-01`). Arquiva, não exclui.

Migration 0002 · cards: SCRUM-36, SCRUM-41, SCRUM-42

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `nome` | text | não |  |  |
| `modo` | modo_tablet | não | "setor" |  |
| `setor_id` | text | sim |  | → setor.id |
| `codigo` | text | não |  |  |
| `codigo_seq` | integer | não |  |  |
| `codigo_gerado_em` | timestamp with time zone | não | now() |  |
| `criado_por` | uuid | não |  | → usuario.id |
| `criado_em` | timestamp with time zone | não | now() |  |
| `arquivado_em` | timestamp with time zone | sim |  |  |

Restrições e índices:

- único (codigo)
- único (codigo_seq)
- índice único `tablet_nome_ativo_idx` (lower(nome)) onde arquivado_em is null
- índice `tablet_setor_id_idx` (setor_id)
- check `tablet_setor_id_check`: modo <> 'setor' or setor_id is not null

### `tablet_vinculo` · CADASTRO

Aparelhos que usaram cada cadastro; um vínculo ativo por tablet; guarda só o SHA-256 do token.

Migration 0002 · cards: SCRUM-36, SCRUM-41, SCRUM-42

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `tablet_id` | uuid | não |  | → tablet.id |
| `token_hash` | text | não |  |  |
| `vinculado_em` | timestamp with time zone | não | now() |  |
| `vinculado_por` | uuid | sim |  | → usuario.id |
| `user_agent` | text | sim |  |  |
| `app_versao` | text | sim |  |  |
| `ultimo_acesso_em` | timestamp with time zone | sim |  |  |
| `revogado_em` | timestamp with time zone | sim |  |  |
| `revogado_motivo` | motivo_revogacao | sim |  |  |

Restrições e índices:

- único (token_hash)
- índice único `tablet_vinculo_ativo_idx` (tablet_id) onde revogado_em is null

### `operacao_tablet` · EVENTO

Cada item recebido da fila do tablet: idempotência pelo `id` do item e lista de rejeitados para o Admin.

Migration 0002 · cards: SCRUM-38, SCRUM-86, SCRUM-87

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | PK |  |
| `tablet_id` | uuid | não |  | → tablet.id |
| `vinculo_id` | uuid | não |  | → tablet_vinculo.id |
| `setor_id` | text | não |  | → setor.id |
| `tipo` | text | sim |  |  |
| `seq` | bigint | sim |  |  |
| `ocorrido_em` | timestamp with time zone | sim |  |  |
| `recebido_em` | timestamp with time zone | não | now() |  |
| `resultado` | resultado_operacao | não |  |  |
| `motivo_rejeicao` | text | sim |  |  |
| `payload` | jsonb | não |  |  |
| `resolvida_em` | timestamp with time zone | sim |  |  |
| `resolvida_por` | uuid | sim |  | → usuario.id |

Restrições e índices:

- índice `operacao_tablet_tablet_id_recebido_em_idx` (tablet_id, recebido_em)
- índice `operacao_tablet_rejeitada_pendente_idx` (resultado) onde resultado = 'rejeitada' and resolvida_em is null

## Produção

### `jornada` · ESTADO

O dia de um setor (`unique (setor_id, dia)`): abertura, fechamento, quem fechou, fechado com zero, revisão, origem e lançamento sem horário.

Migration 0003 · cards: SCRUM-37, SCRUM-38, SCRUM-44, SCRUM-73

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `setor_id` | text | não |  | → setor.id |
| `dia` | date | não |  |  |
| `aberta_em` | timestamp with time zone | sim |  |  |
| `fechada_em` | timestamp with time zone | sim |  |  |
| `fechamento` | fechamento_jornada | sim |  |  |
| `fechada_por_tablet_id` | uuid | sim |  | → tablet.id |
| `fechada_por_usuario_id` | uuid | sim |  | → usuario.id |
| `fechada_com_zero` | boolean | não | false |  |
| `revisada_em` | timestamp with time zone | sim |  |  |
| `revisada_por` | uuid | sim |  | → usuario.id |
| `origem` | origem_registro | não | "tablet" |  |
| `sem_horario` | boolean | não | false |  |
| `operadoras_informadas` | smallint | sim |  |  |

Restrições e índices:

- único `jornada_setor_id_dia_unique` (setor_id, dia)
- check `jornada_fechamento_check`: (fechada_em is null) = (fechamento is null)
- check `jornada_operadoras_informadas_check`: operadoras_informadas is null or operadoras_informadas > 0

### `lote` · ESTADO

Lote da Injetora e "pacote atual" do Teste & Embalagem. Medida travada, um aberto por setor, id gerado no tablet. Totais saem da soma dos registros.

Migration 0003 · cards: SCRUM-37, SCRUM-38, SCRUM-50, SCRUM-57

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | PK |  |
| `setor_id` | text | não |  | → setor.id |
| `jornada_id` | uuid | não |  | → jornada.id |
| `dia` | date | não |  |  |
| `medida_id` | smallint | não |  | → medida.id |
| `sequencia` | smallint | não |  |  |
| `aberto_em` | timestamp with time zone | não |  |  |
| `fechado_em` | timestamp with time zone | sim |  |  |
| `motivo_fechamento` | motivo_fechamento_lote | sim |  |  |
| `aberto_por_tablet_id` | uuid | sim |  | → tablet.id |
| `fechado_por_tablet_id` | uuid | sim |  | → tablet.id |

Restrições e índices:

- índice único `lote_aberto_idx` (setor_id) onde fechado_em is null
- índice `lote_setor_id_dia_idx` (setor_id, dia)
- check `lote_setor_id_check`: setor_id in ('inj', 'tes')
- check `lote_sequencia_check`: sequencia >= 1
- check `lote_fechamento_check`: (fechado_em is null) = (motivo_fechamento is null)
- check `lote_fechado_em_check`: fechado_em is null or fechado_em >= aberto_em

### `operadora` · CADASTRO

Operadoras da Montagem. Remover = desativar (nome único entre as ativas).

Migration 0003 · cards: SCRUM-37, SCRUM-55

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `nome` | text | não |  |  |
| `ativa` | boolean | não | true |  |
| `criada_em` | timestamp with time zone | não | now() |  |
| `desativada_em` | timestamp with time zone | sim |  |  |

Restrições e índices:

- índice único `operadora_nome_ativa_idx` (lower(nome)) onde ativa
- check `operadora_nome_check`: btrim(nome) <> ''

### `mesa` · CADASTRO

Mesas da Montagem com operadora e medida atuais (seed: mesas 1 a 6). A troca não é retroativa: cada registro copia mesa e operadora.

Migration 0003 · cards: SCRUM-37, SCRUM-53, SCRUM-55

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `numero` | smallint | não |  |  |
| `operadora_id` | uuid | sim |  | → operadora.id |
| `medida_id` | smallint | sim |  | → medida.id |
| `ativa` | boolean | não | true |  |
| `config_alterada_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- único (numero)
- check `mesa_numero_check`: numero >= 1

### `correcao_registro` · EVENTO

Cabeçalho de uma correção ou de um lançamento do RH, com motivo obrigatório e antes/depois. As linhas compensatórias vão para `registro_producao`.

Migration 0003 · cards: SCRUM-37, SCRUM-73

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `tipo` | text | não |  |  |
| `setor_id` | text | não |  | → setor.id |
| `dia` | date | não |  |  |
| `jornada_id` | uuid | não |  | → jornada.id |
| `usuario_id` | uuid | não |  | → usuario.id |
| `motivo` | text | não |  |  |
| `antes` | jsonb | sim |  |  |
| `depois` | jsonb | sim |  |  |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `correcao_registro_setor_id_dia_idx` (setor_id, dia)
- check `correcao_registro_tipo_check`: tipo in ('correcao', 'lancamento')
- check `correcao_registro_motivo_check`: btrim(motivo) <> ''

### `registro_producao` · EVENTO (livro-razão)

Todo toque de produção, imutável. −1, Desfazer, correção e lançamento são linhas novas. `placas` e `ciclos` são copiados no toque. Id gerado no aparelho = idempotência.

Migration 0003 · cards: SCRUM-37, SCRUM-38, SCRUM-49, SCRUM-52, SCRUM-54, SCRUM-56, SCRUM-73, SCRUM-88

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | PK |  |
| `setor_id` | text | não |  | → setor.id |
| `dia` | date | não |  |  |
| `jornada_id` | uuid | não |  | → jornada.id |
| `lote_id` | uuid | sim |  | → lote.id |
| `tipo` | tipo_registro | não |  |  |
| `natureza` | natureza_registro | não |  |  |
| `quantidade` | integer | não |  |  |
| `placas` | integer | não |  |  |
| `ciclos` | integer | não | 0 |  |
| `medida_id` | smallint | não |  | → medida.id |
| `mesa_id` | uuid | sim |  | → mesa.id |
| `operadora_id` | uuid | sim |  | → operadora.id |
| `origem` | origem_registro | não |  |  |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `botao_id` | uuid | sim |  | → botao_esp32.id |
| `usuario_id` | uuid | sim |  | → usuario.id |
| `estorna_id` | uuid | sim |  | → registro_producao.id |
| `correcao_id` | uuid | sim |  | → correcao_registro.id |
| `ocorrido_em` | timestamp with time zone | não |  |  |
| `recebido_em` | timestamp with time zone | não | now() |  |
| `desvio_relogio_ms` | integer | sim |  |  |

Restrições e índices:

- índice `registro_producao_setor_id_dia_idx` (setor_id, dia)
- índice `registro_producao_setor_id_ocorrido_em_idx` (setor_id, ocorrido_em)
- índice `registro_producao_lote_id_idx` (lote_id)
- índice `registro_producao_mesa_id_dia_idx` (mesa_id, dia) onde setor_id = 'mon'
- índice `registro_producao_operadora_id_dia_idx` (operadora_id, dia) onde setor_id = 'mon'
- índice único `registro_producao_desfazer_idx` (estorna_id) onde natureza = 'desfazer'
- índice `registro_producao_correcao_id_idx` (correcao_id) onde correcao_id is not null
- índice `registro_producao_tablet_id_recebido_em_idx` (tablet_id, recebido_em)
- check `registro_producao_quantidade_check`: quantidade <> 0
- check `registro_producao_tipo_setor_check`: (setor_id = 'inj' and left(tipo::text, 4) = 'inj_') or (setor_id = 'mon' and tipo = 'mon_placa') or (setor_id = 'tes' and left(tipo::text, 4) = 'tes_')
- check `registro_producao_lote_id_check`: lote_id is not null or origem <> 'tablet' or setor_id = 'mon'
- check `registro_producao_montagem_check`: setor_id = 'mon' or (mesa_id is null and operadora_id is null)
- check `registro_producao_origem_check`: (origem <> 'tablet' or tablet_id is not null) and (origem <> 'esp32' or botao_id is not null) and (origem <> 'rh' or usuario_id is not null)
- check `registro_producao_desfazer_check`: natureza <> 'desfazer' or estorna_id is not null
- check `registro_producao_correcao_check`: natureza not in ('correcao', 'lancamento') or correcao_id is not null

### `v_producao_dia` · VIEW

Soma por setor, dia, medida e tipo: quantidade, placas, ciclos, primeiro e último registro e se teve correção. Fonte única de todo número de produção.

Migration 0003 · cards: SCRUM-37, SCRUM-39, SCRUM-62, SCRUM-69

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `setor_id` | text | não |  |  |
| `dia` | date | não |  |  |
| `medida_id` | smallint | não |  |  |
| `tipo` | tipo_registro | não |  |  |
| `quantidade` | bigint | não |  |  |
| `placas` | bigint | não |  |  |
| `ciclos` | bigint | não |  |  |
| `primeiro_em` | timestamp with time zone | não |  |  |
| `ultimo_em` | timestamp with time zone | não |  |  |
| `teve_correcao` | boolean | não |  |  |

### `v_montagem_dia` · VIEW

Soma da Montagem por dia, operadora, mesa e medida: placas e último registro.

Migration 0003 · cards: SCRUM-37, SCRUM-53, SCRUM-54, SCRUM-64

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `dia` | date | não |  |  |
| `operadora_id` | uuid | sim |  |  |
| `mesa_id` | uuid | sim |  |  |
| `medida_id` | smallint | não |  |  |
| `placas` | bigint | não |  |  |
| `ultimo_em` | timestamp with time zone | não |  |  |

## Pausas

### `pausa_categoria` · CADASTRO fixo (seed)

As 7 categorias do "Por que parou?". Só Refeição é planejada.

Migration 0003 · cards: SCRUM-47, SCRUM-60, SCRUM-79

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | text | não | PK |  |
| `nome` | text | não |  |  |
| `pergunta` | text | sim |  |  |
| `cor` | text | não |  |  |
| `icone` | text | não |  |  |
| `planejada` | boolean | não | false |  |
| `ordem` | smallint | não |  |  |
| `ativa` | boolean | não | true |  |

### `pausa_motivo` · CADASTRO

Motivos do 2º passo, por categoria e por setor (setor nulo = comum aos três). Desativa, não apaga. Seed com a lista inicial do SCRUM-47.

Migration 0003 · cards: SCRUM-47, SCRUM-60, SCRUM-79

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `categoria_id` | text | não |  | → pausa_categoria.id |
| `setor_id` | text | sim |  | → setor.id |
| `nome` | text | não |  |  |
| `ordem` | smallint | não |  |  |
| `ativo` | boolean | não | true |  |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `pausa_motivo_categoria_id_setor_id_ordem_idx` (categoria_id, setor_id, ordem)
- índice único `pausa_motivo_nome_ativo_idx` (categoria_id, coalesce(setor_id, '*'), lower(nome)) onde ativo
- check `pausa_motivo_nome_check`: btrim(nome) <> ''

### `pausa` · ESTADO

Pausa do setor inteiro (uma aberta por setor). Categoria e motivo nulos = "Sem motivo". Guarda cópia do texto do motivo e de `planejada`.

Migration 0003 · cards: SCRUM-47, SCRUM-60, SCRUM-61, SCRUM-77, SCRUM-78

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | PK |  |
| `setor_id` | text | não |  | → setor.id |
| `dia` | date | não |  |  |
| `jornada_id` | uuid | não |  | → jornada.id |
| `inicio` | timestamp with time zone | não |  |  |
| `fim` | timestamp with time zone | sim |  |  |
| `origem` | origem_pausa | não |  |  |
| `categoria_id` | text | sim |  | → pausa_categoria.id |
| `motivo_id` | uuid | sim |  | → pausa_motivo.id |
| `motivo_texto` | text | sim |  |  |
| `planejada` | boolean | não | false |  |
| `descricao` | text | sim |  |  |
| `aviso_em` | timestamp with time zone | sim |  |  |
| `respondida_em` | timestamp with time zone | sim |  |  |
| `encerrada_por` | encerramento_pausa | sim |  |  |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `classificada_por` | uuid | sim |  | → usuario.id |
| `classificada_em` | timestamp with time zone | sim |  |  |
| `descricao_rh` | text | sim |  |  |

Restrições e índices:

- índice único `pausa_aberta_idx` (setor_id) onde fim is null
- índice `pausa_setor_id_dia_idx` (setor_id, dia)
- índice `pausa_setor_id_inicio_idx` (setor_id, inicio)
- índice `pausa_categoria_id_dia_idx` (categoria_id, dia)
- check `pausa_fim_check`: fim is null or fim >= inicio
- check `pausa_encerrada_por_check`: (fim is null) = (encerrada_por is null)
- check `pausa_motivo_check`: motivo_id is null or categoria_id is not null

### `aviso_dispensado` · EVENTO

Cada "Não parou" do aviso de parada.

Migration 0003 · cards: SCRUM-47, SCRUM-60, SCRUM-77

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | PK |  |
| `setor_id` | text | não |  | → setor.id |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `ultimo_registro_em` | timestamp with time zone | sim |  |  |
| `aviso_em` | timestamp with time zone | não |  |  |
| `dispensado_em` | timestamp with time zone | não |  |  |

Restrições e índices:

- índice `aviso_dispensado_setor_id_dispensado_em_idx` (setor_id, dispensado_em)

## Metas

### `meta_setor` · CONFIGURAÇÃO com vigência

Meta por dia de cada setor. A meta de um dia é a linha com maior `vigente_de` ≤ dia; linha antiga nunca muda. Seed: 270 desde 2026-11-01.

Migration 0003 · cards: SCRUM-51, SCRUM-80

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `setor_id` | text | não |  | → setor.id |
| `placas_dia` | integer | não |  |  |
| `vigente_de` | date | não |  |  |
| `criado_por` | uuid | sim |  | → usuario.id |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- único `meta_setor_setor_id_vigente_de_unique` (setor_id, vigente_de)
- check `meta_setor_placas_dia_check`: placas_dia >= 10

### `meta_medida` · CONFIGURAÇÃO com vigência

"Meta por tamanho · opcional": guardada, fora das contas.

Migration 0003 · cards: SCRUM-51, SCRUM-80

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `medida_id` | smallint | não |  | → medida.id |
| `placas_dia` | integer | sim |  |  |
| `vigente_de` | date | não |  |  |
| `criado_por` | uuid | sim |  | → usuario.id |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- único `meta_medida_medida_id_vigente_de_unique` (medida_id, vigente_de)
- check `meta_medida_placas_dia_check`: placas_dia is null or placas_dia > 0

### `calendario_mes` · CONFIGURAÇÃO

Dias úteis de cada mês (PK `ano, mes`). Mês sem linha: o servidor cria com os dias de segunda a sexta (`lib/dominio/calendario.ts`). Seed: o mês corrente.

Migration 0003 · cards: SCRUM-51, SCRUM-80

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `ano` | smallint | não |  |  |
| `mes` | smallint | não |  |  |
| `dias_uteis` | smallint | não |  |  |
| `atualizado_por` | uuid | sim |  | → usuario.id |
| `atualizado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- PK (ano, mes)
- check `calendario_mes_mes_check`: mes between 1 and 12
- check `calendario_mes_dias_uteis_check`: dias_uteis between 1 and 31

## Estoque e OP

### `ordem_producao` · CADASTRO com ciclo de vida

Ordem de Produção: uma medida, pacotes pedidos, entrega, estado e contadores de reservados e expedidos. `numero` é identidade (exibido `OP-00015`); valor inicial ajustável com `alter table ordem_producao alter column numero restart with N`.

Migration 0003 · cards: SCRUM-58, SCRUM-75

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `numero` | integer | não | identidade |  |
| `cliente` | text | sim |  |  |
| `medida_id` | smallint | não |  | → medida.id |
| `pacotes_pedidos` | integer | não |  |  |
| `data_entrega` | date | sim |  |  |
| `observacao` | text | sim |  |  |
| `estado` | estado_op | não | "aberta" |  |
| `pacotes_reservados` | integer | não | 0 |  |
| `pacotes_expedidos` | integer | não | 0 |  |
| `criada_por` | uuid | não |  | → usuario.id |
| `criada_em` | timestamp with time zone | não | now() |  |
| `expedida_em` | timestamp with time zone | sim |  |  |
| `cancelada_em` | timestamp with time zone | sim |  |  |

Restrições e índices:

- único (numero)
- índice `ordem_producao_estado_data_entrega_idx` (estado, data_entrega)
- índice `ordem_producao_medida_id_idx` (medida_id)
- check `ordem_producao_pacotes_pedidos_check`: pacotes_pedidos > 0
- check `ordem_producao_contadores_check`: pacotes_reservados >= 0 and pacotes_expedidos >= 0
- check `ordem_producao_cancelada_check`: (estado = 'cancelada') = (cancelada_em is not null)

### `op_evento` · EVENTO

Linha do tempo da OP (criada, editada, reserva, liberação, atendida, expedição, cancelada).

Migration 0003 · cards: SCRUM-58, SCRUM-75, SCRUM-76

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `op_id` | uuid | não |  | → ordem_producao.id |
| `tipo` | tipo_op_evento | não |  |  |
| `pacotes` | integer | sim |  |  |
| `usuario_id` | uuid | sim |  | → usuario.id |
| `detalhe` | jsonb | sim |  |  |
| `ocorrido_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `op_evento_op_id_ocorrido_em_idx` (op_id, ocorrido_em)

### `estoque_movimento` · EVENTO (razão do estoque)

Movimentos em pacotes. Físico = Σ `pacotes`; reservado = Σ `reservado`; disponível = físico − reservado. Entrada sempre aponta o pacote (`registro_id`, único); ajuste e saldo inicial exigem motivo.

Migration 0003 · cards: SCRUM-58, SCRUM-59, SCRUM-74, SCRUM-76

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `tipo` | tipo_movimento | não |  |  |
| `medida_id` | smallint | não |  | → medida.id |
| `pacotes` | integer | não |  |  |
| `placas` | integer | não |  |  |
| `reservado` | integer | não | 0 |  |
| `op_id` | uuid | sim |  | → ordem_producao.id |
| `registro_id` | uuid | sim |  | → registro_producao.id |
| `usuario_id` | uuid | sim |  | → usuario.id |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `motivo` | text | sim |  |  |
| `ocorrido_em` | timestamp with time zone | não |  |  |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `estoque_movimento_medida_id_ocorrido_em_idx` (medida_id, ocorrido_em)
- índice único `estoque_movimento_registro_id_idx` (registro_id) onde registro_id is not null
- índice `estoque_movimento_op_id_idx` (op_id)
- check `estoque_movimento_motivo_check`: tipo not in ('ajuste', 'saldo_inicial') or btrim(coalesce(motivo, '')) <> ''
- check `estoque_movimento_entrada_check`: tipo <> 'entrada' or (registro_id is not null and reservado = 0)
- check `estoque_movimento_op_id_check`: tipo not in ('reserva', 'liberacao', 'expedicao') or op_id is not null
- check `estoque_movimento_reserva_check`: tipo not in ('reserva', 'liberacao') or pacotes = 0

## Exportação

### `exportacao` · EVENTO

Cada arquivo pedido: painel Exportar, CSV dos históricos (pelo tablet: `tablet_id`) e envio mensal (usuário nulo). `arquivo_chave` só para PDF no S3.

Migration 0003 · cards: SCRUM-62, SCRUM-81, SCRUM-82, SCRUM-83

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `usuario_id` | uuid | sim |  | → usuario.id |
| `tablet_id` | uuid | sim |  | → tablet.id |
| `tipo` | tipo_exportacao | não |  |  |
| `formato` | formato_exportacao | não |  |  |
| `periodo_de` | date | não |  |  |
| `periodo_ate` | date | não |  |  |
| `medida_id` | smallint | sim |  | → medida.id |
| `setores` | text[] | não | '{}'::text[] |  |
| `secoes` | text[] | não | '{}'::text[] |  |
| `status` | text | não | "gerando" |  |
| `arquivo_chave` | text | sim |  |  |
| `erro` | text | sim |  |  |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice `exportacao_criado_em_idx` (criado_em)
- check `exportacao_status_check`: status in ('gerando', 'pronto', 'erro')
- check `exportacao_periodo_check`: periodo_de <= periodo_ate

### `relatorio_agendado` · CONFIGURAÇÃO (1 linha, id = 1)

Envio mensal por e-mail: ligado/desligado, destinatários, seções, último envio. Seed: a linha, desligada e sem destinatários.

Migration 0003 · cards: SCRUM-81, SCRUM-84

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | smallint | não | 1 · PK |  |
| `ativo` | boolean | não | false |  |
| `destinatarios` | text[] | não | '{}'::text[] |  |
| `secoes` | text[] | não | '{}'::text[] |  |
| `ultimo_envio_em` | timestamp with time zone | sim |  |  |
| `ultimo_resultado` | text | sim |  |  |
| `atualizado_por` | uuid | sim |  | → usuario.id |
| `atualizado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- check `relatorio_agendado_id_check`: id = 1

## Botões ESP32

### `botao_esp32` · CADASTRO

Botão de uma mesa (um por mesa). O token não é guardado: é `<id>.<token_versao>.<HMAC>`; subir `token_versao` invalida o anterior. "Sem sinal" é derivado de `ultimo_heartbeat_em`.

Migration 0003 · cards: SCRUM-88, SCRUM-89, SCRUM-91

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | uuid | não | gen_random_uuid() · PK |  |
| `nome` | text | não |  |  |
| `mesa_id` | uuid | sim |  | → mesa.id |
| `porta` | smallint | sim |  |  |
| `token_versao` | integer | não | 1 |  |
| `ativo` | boolean | não | true |  |
| `ultimo_heartbeat_em` | timestamp with time zone | sim |  |  |
| `ultimo_pulso_em` | timestamp with time zone | sim |  |  |
| `firmware` | text | sim |  |  |
| `rssi` | smallint | sim |  |  |
| `criado_por` | uuid | não |  | → usuario.id |
| `criado_em` | timestamp with time zone | não | now() |  |

Restrições e índices:

- índice único `botao_esp32_mesa_id_idx` (mesa_id) onde mesa_id is not null
- check `botao_esp32_token_versao_check`: token_versao >= 1

### `pulso_esp32` · EVENTO

Todo aperto que chega, conte ou não (`resultado`). Idempotência por `(botao_id, boot_id, seq)`. Quando conta, aponta o `registro_producao`.

Migration 0003 · cards: SCRUM-88, SCRUM-90

| Coluna | Tipo | Nulo | Padrão | Referência |
| --- | --- | --- | --- | --- |
| `id` | bigserial | não | PK |  |
| `botao_id` | uuid | não |  | → botao_esp32.id |
| `boot_id` | bigint | não |  |  |
| `seq` | integer | não |  |  |
| `ocorrido_em` | timestamp with time zone | não |  |  |
| `recebido_em` | timestamp with time zone | não | now() |  |
| `mesa_id` | uuid | sim |  | → mesa.id |
| `resultado` | resultado_pulso | não |  |  |
| `registro_id` | uuid | sim |  | → registro_producao.id |

Restrições e índices:

- único `pulso_esp32_botao_id_boot_id_seq_unique` (botao_id, boot_id, seq)
- índice `pulso_esp32_mesa_id_ocorrido_em_idx` (mesa_id, ocorrido_em)
- check `pulso_esp32_registro_id_check`: (resultado = 'contou') = (registro_id is not null)

## Enums

- `encerramento_pausa`: `retomar`, `contagem`, `fechamento_dia`, `rh`
- `estado_op`: `aberta`, `em_producao`, `concluida`, `cancelada`
- `fechamento_jornada`: `manual`, `automatico`, `rh`
- `formato_exportacao`: `pdf`, `xlsx`, `csv`
- `modo_tablet`: `setor`, `tv`
- `motivo_fechamento_lote`: `manual`, `troca_medida`, `fim_do_dia`, `virada_do_dia`
- `motivo_revogacao`: `novo_codigo`, `desvinculado_admin`, `usar_outro_id`, `substituido`
- `natureza_registro`: `toque`, `ajuste`, `desfazer`, `correcao`, `lancamento`
- `origem_pausa`: `operador`, `aviso_respondido`, `aviso_sem_resposta`, `rh`
- `origem_registro`: `tablet`, `esp32`, `rh`
- `papel_usuario`: `rh`, `admin`
- `resultado_operacao`: `aplicada`, `rejeitada`
- `resultado_pulso`: `contou`, `mesa_pendente`, `duplicado`, `rapido_demais`, `botao_inativo`
- `tipo_exportacao`: `mensal`, `operadoras`, `perdas`, `estoque`, `fechamentos`, `historico_setor`
- `tipo_movimento`: `entrada`, `reserva`, `liberacao`, `expedicao`, `ajuste`, `saldo_inicial`
- `tipo_op_evento`: `criada`, `editada`, `reserva`, `liberacao`, `atendida`, `expedicao`, `cancelada`
- `tipo_registro`: `inj_boa2`, `inj_boa1`, `inj_vazio`, `inj_perda_cab_meio`, `inj_perda_cab_total`, `inj_perda_can_meio`, `inj_perda_can_total`, `mon_placa`, `tes_pacote`, `tes_defeito_caninho`, `tes_defeito_cabecote`
