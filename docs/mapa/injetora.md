# Mapa do protótipo · Injetora · operador (registro, lote, aviso de parada)

Chave da família: `injetora`. Fonte: quadros `Tela-Injetora-*.dc.html` (versão atual) e `Injetora.dc.html` (versão anterior, só 1280×800).

> Leitura: os 8 quadros `Tela-Injetora-*` são **o mesmo arquivo, byte a byte**, exceto o `<title>` e as props do script (`largura`, `estado`, `$preview`). Não existe marcação diferente por largura: tudo que muda vem de **media queries CSS**. O que está abaixo vale para todos.

---

## 0. Quadros e tamanhos (canvas.json, seção "Injetora · operador")

| Quadro | Tamanho no canvas | Props | O que mostra de diferente |
|---|---|---|---|
| `Tela-Injetora-PC` | 1440×900 (expand: fill) | `largura=pc`, `estado=""` | Estado normal. Mesmo arranjo do tablet horizontal, só mais largo e mais alto. |
| `Tela-Injetora-TabletH` | 1280×800 | `largura=h`, `estado=""` | Estado normal. É o aparelho do operador; tudo cabe sem rolar. |
| `Tela-Injetora-TabletH-Lote` | 1280×800 | `largura=h`, `estado=lote` | Confirmação de fechamento aberta dentro do cartão "LOTE ATUAL" (trocando 3 m por 4 m). |
| `Tela-Injetora-TabletH-Pausa` | 1280×800 | `largura=h`, `estado=pausa` | Aviso de parada automático aberto (modal amarelo), com "Manutenção › Molde" já escolhido. |
| `Tela-Injetora-TabletV` | 800×1280 | `largura=v`, `estado=""` | Estado normal em pé: teclado de registro sobe para o topo, cartões embaixo. |
| `Tela-Injetora-TabletV-Lote` | 800×1280 | `largura=v`, `estado=lote` | Confirmação de fechamento em pé (botões empilhados, principal em cima). |
| `Tela-Injetora-TabletV-Pausa` | 800×1280 | `largura=v`, `estado=pausa` | Aviso de parada em pé (modal de 760 px, categorias em 4 colunas). |
| `Tela-Injetora-Celular` | 390×1920 | `largura=cel`, `estado=""` | Estado normal em uma coluna, com rolagem. |
| `Injetora` (anterior) | 1280×800 (expand: fill) | sem props | Versão antiga: sem modal de pausa, sem faixa amarela; "Pausar" só alterna Rodando/Pausado. |

Não há quadro de PC nem de celular para os estados "lote" e "pausa", mas o CSS cobre os dois (ver seção 8).

A prop `largura` **não muda o layout**: só troca o sufixo dos links (`-PC`, `-TabletH`, `-TabletV`, `-Celular`). A prop `estado` só pré-carrega o estado inicial (`lote` → confirmação aberta com novo tamanho 4 m; `pausa` → aviso automático aberto).

---

## 1. Propósito e quem usa

Tela de trabalho do **operador da Injetora**, no tablet do setor (1280×800 deitado, preso ao posto). Serve para:

1. Contar cada placa que sai da máquina (boa de 2 ciclos, boa de 1 ciclo), cada "cabeça vazia" e cada perda, com um toque.
2. Acompanhar o **lote atual** (um lote = um tamanho de placa) e fechar o lote, trocando ou não de tamanho.
3. Ver o **resumo do dia** contra a meta.
4. Dizer **por que a máquina parou** (aviso automático depois de X minutos sem contar, ou botão "Pausar").

Não há identificação de operador na tela (nenhum nome, avatar ou login visível). O dado é do **setor/tablet**, não da pessoa. O RH consome o resultado em "Agora", "Pausas" e "Desempenho" (outras famílias).

---

## 2. Blocos da tela, de cima para baixo (arranjo 1280×800)

### 2.1 Cabeçalho (`header.inj-head`, min-height 68 px)

Esquerda:
- Botão voltar (seta, 48×48, `aria-label="Voltar para Setores"`).
- Rótulo do setor: quadradinho azul + "INJETORA" + sufixo " · PRODUÇÃO DE PLACAS" (14 px, caixa alta, azul `#93C5FD`).
- Data: "Terça, 03/11" (26 px, Barlow Semi Condensed 800). Texto fixo no protótipo.
- Pílula de status: bolinha + texto. Três valores:
  - "Rodando" (verde `#86EFAC` sobre `#0F2A1B`).
  - "Parada · sem motivo" (amarelo `#FCD34D` sobre `#2A1F07`) enquanto o aviso automático está aberto.
  - "Pausado · {motivo}" (amarelo) com pausa registrada.

Direita:
- Botão "Pausar" / "Retomar" (48 px de altura).
- Link "Histórico" (48 px).
- Relógio "15:36" (28 px, fixo no protótipo).
- Logo AquaPulse 44×44 (some abaixo de 1280).

### 2.2 Faixa de pausa (`.pz-banda`, só quando há pausa registrada)

Faixa amarela escura logo abaixo do cabeçalho, `role="status"`:
- Ícone de pausa (40×40).
- "**Pausado · {motivo}**" (18 px) e, abaixo, "desde {hora de início} · o RH vê este motivo em Pausas" (15 px).
- Botão "Retomar" (52 px de altura, 22 px, âmbar).

### 2.3 Cartão "LOTE ATUAL" (coluna esquerda da área de cima)

- Título "LOTE ATUAL" + botão "Fechar lote" (44 px, contorno azul). O botão some enquanto a confirmação está aberta.
- Herói (79 px de altura): número grande `{boas do lote}` (64 px) com legenda "placas boas no lote" (verde); à direita o tamanho `{3 m}` (40 px, azul claro) com legenda "{1,5 m²} por placa".
- Grade de 6 azulejos (3 colunas × 2 linhas), rótulo 14 px / valor 24 px:
  1. "Área" → boas × área do tamanho (ex.: "360 m²")
  2. "Eficiência" → boas ÷ (boas + perdas) (ex.: "98,8%"; "—" se zero)
  3. "Tempo do lote" (ex.: "8h 14min"; fixo no protótipo, vira "0min" ao abrir lote)
  4. "Ciclos no início" (ex.: "0")
  5. "Ciclos agora" (ex.: "484")
  6. "Δ ciclos do lote" (ex.: "484")
- Seletor "TAMANHO" com dica "trocar fecha o lote" e, à direita, "produzido hoje em cada tamanho". Quatro botões (64 px de altura): "2 m · 1 m²", "3 m · 1,5 m²", "4 m · 2 m²", "5 m · 2,5 m²", cada um com a linha "{N} hoje · {N × área} m²". O atual fica azul cheio (`aria-pressed="true"`).

**Estado "confirmação"** (substitui os azulejos e o seletor dentro do mesmo cartão; não é modal):
- Título (28 px): "Fechar o lote de 3 m?" ou "Fechar o lote de 3 m e começar 4 m?".
- Resumo (16 px): "240 placas boas · 3 perdas · 1 cabeça vazia · 360 m² · 8h 14min" (com singular/plural corretos).
- Botões (60 px de altura): "Cancelar" (contorno) e o principal "Fechar lote" ou "Fechar e começar 4 m" (azul cheio, 24 px).

### 2.4 Cartão "RESUMO DO DIA" (coluna direita da área de cima)

- Título "RESUMO DO DIA" + botão tracejado "Fechar dia… (segurar 2 s)" (44 px). **Sem ação no protótipo.**
- Herói: "{240} / 270" (64 px + 26 px cinza) com "placas boas hoje"; à direita "{89}%" (40 px); barra de progresso de 10 px (azul `#60A5FA`, limitada a 100%).
- Grade de 12 azulejos (4 colunas × 3 linhas), nesta ordem:

| # | Rótulo | Exemplo | Conta |
|---|---|---|---|
| 1 | "Faltam" (ou "Acima" quando passou) | 30 (ou "+N" verde) | meta − boas do dia |
| 2 | "Ritmo" | 29/h | boas do dia ÷ tempo ativo em horas |
| 3 | "Bate a meta" | 16:38 (ou "batida", ou "—") | agora + faltam ÷ ritmo |
| 4 | "Eficiência" | 98,8% | boas ÷ (boas + perdas) do dia |
| 5 | "Perdidas" | 3 (vermelho claro) | soma das perdas do dia |
| 6 | "Vazios" | 1 (amarelo) | cabeças vazias do dia |
| 7 | "Ciclos perdidos" | 3 (vermelho claro) | **mesmo valor de "Perdidas"** |
| 8 | "Lotes hoje" | 1 | lotes fechados + 1 (o aberto) |
| 9 | "Ciclos" | 484 | contador acumulado de ciclos |
| 10 | "Área" | 360 m² | soma de boas × área por lote |
| 11 | "Tempo ativo" | 8h 14min | fixo no protótipo |
| 12 | "Tempo parado" | 9min | fixo no protótipo |

### 2.5 Teclado "Registrar" (`section.inj-pad`, faixa de baixo, 260 px de altura fixa)

Três colunas: `1fr | 292px | 440px`.

**Coluna 1 · placa boa (o botão principal):**
- Botão verde cheio "+ Placa boa {3 m}" (50 px) com a linha "{1,5 m²} · conta 2 ciclos · **{240}** no lote" (18 px).
- Ao lado, botão "−1" (88 px de largura, contorno verde, 36 px), `aria-label="Tirar uma placa boa"`.

**Coluna 2 · secundários (2 linhas iguais):**
- "+ Placa" (contorno verde, 30 px) com "conta 1 ciclo · **{0}** no lote"; "−1" de 60 px (`aria-label="Tirar uma placa de 1 ciclo"`).
- "+ Cabeça vazia" (âmbar cheio, 30 px) com "conta 1 ciclo · **{1}** no lote"; "−1" de 60 px (`aria-label="Tirar uma cabeça vazia"`).

**Coluna 3 · perdas e último registro:**
- Cabeçalho "PERDA" (vermelho claro) + "1 ciclo perdido cada" e, à direita, "**{3}** no lote".
- Grade 2×2 (linhas de 64 px), botões vermelhos cheios (20 px) com "**{N}** no lote" e um "−1" (52 px) ao lado de cada:
  - "+ Cabeçote meio"
  - "+ Cabeçote total"
  - "+ Caninho meio"
  - "+ Caninho total"
- Caixa "Último registro · {hh:mm:ss}" (`aria-live="polite"`): bolinha na cor do tipo + texto (ex.: "+1 placa boa 3 m"); à direita o botão "Desfazer" (52 px, com ícone). O botão some quando o último item é informativo ou um ajuste.

### 2.6 Modal de pausa (`.pz-veu` + `.pz`, `role="dialog" aria-modal="true"`)

Véu escuro (74% de opacidade) cobrindo a tela inteira; caixa central amarela-escura com borda âmbar.

- Cabeçalho âmbar: ícone (triângulo de alerta no automático, pausa no manual), título (32 px) e subtítulo (17 px).
  - Automático: "**A Injetora está parada há 12 min**" / "Nada registrado desde 15:24 (o aviso vem depois de 10 min sem contar). Diga o motivo para o RH."
  - Manual: "**Pausar a Injetora**" / "A pausa começa agora, às 15:36. Escolha o motivo."
- Passo "1. POR QUE PAROU?": 7 categorias com ícone (botões de 96 px de altura mínima): "Manutenção", "Falta de material", "Troca de medida", "Refeição", "Energia, ar ou água", "Pessoas", "Outro".
- Passo "2. {pergunta da categoria}" (só aparece se a categoria tem motivos): botões de 60 px.
- Campo de texto: "3. DESCRIÇÃO · OPCIONAL" (ou "2. …" quando não há passo de motivo; em "Outro" o rótulo vira "2. O QUE ACONTECEU? · OPCIONAL"). Placeholder: "Ex.: molde de 3 m vazando água na saída".
- Rodapé: resumo ao vivo (`aria-live`), botão "Não parou" (automático) ou "Cancelar" (manual), botão "Registrar pausa" (64 px, âmbar; desabilitado até estar completo).

Não há "X" nem fechar tocando fora: só sai pelos dois botões do rodapé.

---

## 3. Ações e o que cada uma faz na lógica

### Registro
| Ação | Efeito |
|---|---|
| "+ Placa boa {tam}" | `lote.boas2 += 1`. Entrada no histórico: "+1 placa boa 3 m" (tipo `boa2`, hora hh:mm:ss). Fecha uma confirmação de lote que esteja aberta. |
| "+ Placa" | `lote.boas1 += 1`. Histórico: "+1 placa (1 ciclo) 3 m" (tipo `boa1`). |
| "+ Cabeça vazia" | `lote.vazios += 1`. Histórico: "+1 cabeça vazia" (tipo `vazio`). |
| "+ Cabeçote meio/total", "+ Caninho meio/total" | `lote.cabMeio / cabTotal / canMeio / canTotal += 1`. Histórico: "Perda · cabeçote meio" etc. (tipo `perda:<campo>`). |
| Qualquer "−1" | Se o contador for 0, não faz nada (o botão fica com opacidade 0,4, mas **não é desabilitado**). Senão subtrai 1 e grava uma entrada tipo `ajuste` ("−1 placa boa 3 m", "−1 perda caninho total"…). |
| "Desfazer" | Só aparece se a última entrada for um "+" (não `info`, não `ajuste`). Subtrai 1 do contador correspondente e **remove a entrada do histórico**; a anterior passa a ser a "última" e também pode ser desfeita (desfazer encadeado até bater num ajuste ou num fechamento de lote). |

Observações:
- O histórico em memória guarda as últimas 50 entradas.
- Um "−1" grava ajuste e, por isso, **bloqueia o Desfazer** das entradas anteriores.
- Não há confirmação em nenhum toque de registro: um toque = um evento.
- Os botões de registro continuam ativos com a confirmação de lote aberta e com a pausa registrada (ver dúvidas).

### Lote
| Ação | Efeito |
|---|---|
| "Fechar lote" | Abre a confirmação com o mesmo tamanho ("Fechar o lote de 3 m?"). |
| Tocar num tamanho diferente do atual | Abre a confirmação "Fechar o lote de 3 m e começar 4 m?". Tocar no tamanho atual não faz nada. |
| "Cancelar" (confirmação) | Fecha a confirmação, nada muda. |
| "Fechar lote" / "Fechar e começar 4 m" | Soma o lote nos acumulados do dia (boas, vazios, perdas, ciclos, área, lotes +1, boas por tamanho), abre um lote novo zerado com o tamanho escolhido, "Ciclos no início" = contador acumulado, tempo "0min", e grava a entrada `info` "Lote 3 m fechado · novo lote 4 m". |

Fechar lote **sempre abre outro** (não existe estado "sem lote aberto"). Não há validação de lote vazio.

### Pausa
| Ação | Efeito |
|---|---|
| "Pausar" (cabeçalho) | Abre o modal em modo manual, sem nada escolhido. |
| Aviso automático | O modal abre sozinho em modo `auto` (no protótipo, pela prop `estado=pausa`; no real, pelo tempo sem contar). |
| Tocar numa categoria | Seleciona a categoria e limpa o motivo. |
| Tocar num motivo | Seleciona o motivo. |
| Digitar na descrição | Guarda o texto (o protótipo descarta ao registrar; no real deve ser gravado). |
| "Registrar pausa" | Só habilita com categoria escolhida e, se a categoria tiver motivos, com motivo escolhido. Fecha o modal, marca pausado, motivo exibido = motivo (ou nome da categoria quando não há motivo), início = "desde" do aviso (automático, **retroativo**) ou "agora" (manual). |
| "Não parou" (automático) | Fecha o aviso sem registrar nada. |
| "Cancelar" (manual) | Fecha o modal sem pausar. |
| "Retomar" (cabeçalho ou faixa) | Encerra a pausa na hora, sem confirmação. |

Texto do resumo no rodapé do modal, conforme o avanço:
1. "Escolha por que parou"
2. "Falta escolher: qual manutenção" (pergunta da categoria em minúsculas, sem "?")
3. "Vai registrar: Manutenção › Molde"

### Sem ação no protótipo
- "Fechar dia… (segurar 2 s)": botão sem `onClick`.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal / rodando | Pílula verde "Rodando"; botão "Pausar"; sem faixa. |
| Lote novo (vazio) | Contadores 0; "Eficiência" = "—"; "Tempo do lote" = "0min"; todos os "−1" com opacidade 0,4. |
| Sem nenhum registro | Caixa "Último registro" mostra "Nenhum registro ainda", sem hora e sem "Desfazer". |
| Fechando lote | Bloco de confirmação azul dentro do cartão "LOTE ATUAL"; botão "Fechar lote" do topo some. |
| Aviso de parada (automático) | Modal amarelo aberto; pílula "Parada · sem motivo" (amarela). |
| Pausar (manual) | Mesmo modal, título "Pausar a Injetora"; pílula continua "Rodando" até registrar. |
| Pausado | Pílula "Pausado · {motivo}"; faixa amarela com "Retomar"; botão do cabeçalho vira "Retomar". |
| Meta batida | "Faltam" vira "Acima" com "+N" verde; "Bate a meta" = "batida"; percentual pode passar de 100%, barra para em 100%. |
| Ritmo zero | "Bate a meta" = "—". |
| Erro, sem conexão, carregando, sincronizando | **Não existem no protótipo.** |
| Dia fechado | **Não existe no protótipo** (só o botão sem ação). |
| Tablet não vinculado | Não é tratado aqui (família ConfigTablet). |

---

## 5. Regras de negócio e contas

| Regra | Valor de exemplo | Configurável? |
|---|---|---|
| Tamanhos de placa | 2 m, 3 m, 4 m, 5 m | Parece catálogo (fixo no script). |
| Área por placa | 2 m = 1 m²; 3 m = 1,5 m²; 4 m = 2 m²; 5 m = 2,5 m² (0,5 m² por metro) | Deriva do tamanho. |
| Placa boa (botão principal) | conta **2 ciclos** e 1 placa boa | Regra fixa na tela. |
| "+ Placa" | conta **1 ciclo** e 1 placa boa (mesma área) | Regra fixa. |
| Cabeça vazia | conta 1 ciclo; **não** é placa nem perda | Regra fixa. |
| Perda (4 tipos) | conta 1 ciclo cada; "meio" e "total" pesam igual na conta | Tipos parecem catálogo. |
| Placas boas do lote | boas2 + boas1 | — |
| Perdas do lote | cabMeio + cabTotal + canMeio + canTotal | — |
| Ciclos do lote | boas2 × 2 + boas1 + vazios + perdas (ex.: 240×2 + 0 + 1 + 3 = 484) | — |
| Eficiência | boas ÷ (boas + perdas) × 100, uma casa, vírgula (ex.: 240 ÷ 243 = 98,8%). Vazios ficam fora. | — |
| Área do lote / do dia | boas × área do tamanho; o dia soma lote a lote (tamanhos diferentes) | — |
| Meta do dia | **270 placas boas** (fixo no script; em placas, sem distinguir tamanho) | Sim, deve vir das Metas do RH. |
| % da meta | arredonda(boas do dia ÷ 270 × 100) (ex.: 89%) | — |
| Ritmo | boas do dia ÷ tempo ativo em horas (240 ÷ 8,23 h = 29/h) | — |
| Previsão "Bate a meta" | hora atual + (faltam ÷ ritmo) (15:36 + 62 min = 16:38) | — |
| "Lotes hoje" | lotes fechados + 1 | — |
| Trocar de tamanho | sempre fecha o lote (um lote = um tamanho) e pede confirmação | Regra fixa. |
| Aviso de parada | Injetora: **10 min** sem contar e sem pausa aberta (Montagem 15, Teste & Embalagem 15) | Sim: "RH › Pausas › Motivos e regras". |
| Início da pausa automática | retroativo: hora do último registro ("desde 15:24"), não a hora do toque | — |
| Início da pausa manual | hora do toque em "Registrar pausa" (texto: "A pausa começa agora") | — |
| Categoria planejada | "Refeição" tem `plan: true` = não conta como parada | Sim (catálogo do RH). |
| Desfazer | só o último "+"; ajustes e fechamento de lote não se desfazem | Regra fixa. |
| Histórico local | últimas 50 entradas | Detalhe do protótipo. |

### Catálogo de pausas (o mesmo do RH › Pausas › Motivos e regras)

| Categoria | Pergunta do 2º passo | Cor no RH | Planejada | Motivos na Injetora |
|---|---|---|---|---|
| Manutenção | "QUAL MANUTENÇÃO?" | `#F87171` | não | Molde · Resistência / aquecimento · Sistema hidráulico · Bico / canhão · Refrigeração · Painel elétrico |
| Falta de material | "FALTOU O QUÊ?" | `#FB923C` | não | Matéria-prima · Pigmento / aditivo · Peça de reposição |
| Troca de medida | "QUE TIPO DE TROCA?" | `#E879F9` | não | Troca de molde · Aquecimento da máquina · Regulagem |
| Refeição | "QUAL REFEIÇÃO?" | `#64748B` | **sim** | Almoço · Café (comum a todos os setores) |
| Energia, ar ou água | "O QUE FALTOU?" | `#FACC15` | não | Queda de energia · Falta de ar comprimido · Falta de água (comum) |
| Pessoas | "O QUE ACONTECEU?" | `#A3E635` | não | Operador ausente · Reunião · Treinamento (comum) |
| Outro | (sem 2º passo) | `#94A3B8` | não | nenhum; só a descrição livre |

Os motivos de Manutenção, Falta de material e Troca de medida são **por setor**; os de Refeição, Energia e Pessoas são comuns. O script da Injetora carrega também as listas de Montagem e Teste (mesmo componente de pausa nos três setores): vale um card único para o modal de pausa.

### Atenção: defeitos do exemplo que não devem ser copiados

1. **Contador de ciclos quebra no 2º fechamento de lote.** Em `trocarTamanho`, `fechados.ciclos = f.ciclos + (c.ciclos − lote.inicio)`, mas `c.ciclos` já é só do lote. Do segundo lote em diante o acumulado fica errado. A intenção é clara: "Ciclos agora" = acumulado do dia; "Ciclos no início" = acumulado quando o lote abriu; "Δ ciclos do lote" = ciclos do lote.
2. **"Ciclos perdidos" repete "Perdidas"** (mesma variável). Falta decidir se "Ciclos perdidos" deveria incluir as cabeças vazias.
3. Estado duplicado de pausa: o `state.pausado` antigo ainda existe, mas é sobrescrito pelo bloco novo (`pausaVals`). É código morto.
4. A descrição digitada no modal é apagada ao registrar (não chega a lugar nenhum).
5. Data, relógio, "Tempo ativo", "Tempo parado" e "Tempo do lote" são textos fixos.
6. Pela conta do CSS, em 1280×800 com a **faixa de pausa** aberta (cerca de 74 px) a área de cima fica com ~350 px e os azulejos do "LOTE ATUAL" (mínimo 52 px por linha) não cabem acima do seletor de tamanho. Conferir no aparelho e ajustar (o protótipo não tem quadro deste estado).
7. A pílula "Pausado · {motivo}" não quebra linha; motivos longos ("Resistência / aquecimento") apertam o cabeçalho em 1280.

---

## 6. Entidades e eventos implícitos

### Entidades
- **Setor**: id, nome ("Injetora"), subtítulo ("Produção de placas"), cor, minutos sem contar até avisar (10).
- **Tablet / dispositivo**: vínculo com o setor (o registro é do tablet, não de uma pessoa).
- **Tamanho de placa**: comprimento (2/3/4/5 m), área (m²), ativo.
- **Tipo de perda**: parte (Cabeçote, Caninho) × grau (meio, total); ciclos perdidos (1).
- **Dia de produção (por setor)**: data, meta de placas boas (270), aberto/fechado, fechado em, tempo ativo, tempo parado, contador de ciclos acumulado.
- **Lote**: setor, dia, tamanho, sequência no dia, aberto em, fechado em, ciclos no início, totais (boas 2 ciclos, boas 1 ciclo, vazios, perdas por tipo), área, tempo.
- **Registro de produção (evento)**: lote, tipo (`boa2`, `boa1`, `vazio`, `perda:cabMeio|cabTotal|canMeio|canTotal`, `ajuste`, `info`), quantidade (+1/−1), rótulo, data/hora com segundos, tablet, id gerado no aparelho (para fila offline e para não duplicar), desfeito em.
- **Categoria de pausa**: id, nome, pergunta do 2º passo, cor, planejada, ícone, ordem.
- **Motivo de pausa**: categoria, setor (ou "todos"), nome, ordem, ativo.
- **Pausa**: setor, dia, início, fim, origem (automática/manual), categoria, motivo, descrição, planejada, tablet.
- **Meta**: setor, placas boas por dia, vigência.

### Eventos que a tela grava
1. +1 placa boa (2 ciclos), +1 placa (1 ciclo), +1 cabeça vazia, +1 perda (4 tipos).
2. −1 (ajuste) em qualquer um dos 7 contadores.
3. Desfazer o último registro.
4. Fechar lote (com ou sem troca de tamanho) e abrir o seguinte.
5. Pausa iniciada (manual, ou automática com início retroativo), com categoria, motivo e descrição.
6. Pausa encerrada ("Retomar").
7. Aviso de parada dispensado ("Não parou") — o protótipo não grava, mas é um fato que o RH pode querer.
8. Fechar dia (previsto, sem lógica).

---

## 7. Navegação

| Elemento | Destino |
|---|---|
| Seta voltar (cabeçalho) | `Tela-Setores{sufixo}` (lista de setores) |
| "Histórico" (cabeçalho) | `Tela-HistInjetora{sufixo}` (histórico do setor) |
| Texto "o RH vê este motivo em Pausas" | Não é link; só informa. |

Sufixo conforme a prop `largura`: `-PC`, `-TabletH`, `-TabletV`, `-Celular`. No sistema real é uma rota única e responsiva. Na versão anterior os links eram `Setores.dc.html` e `Historico-Setor.dc.html`.

---

## 8. Responsividade

### 8.1 Mecanismo

**Media queries CSS por largura da janela (`max-width`)**, no mesmo HTML:

| Faixa | Nome no protótipo | Quadros que caem nela |
|---|---|---|
| ≥ 1280 px | base (estilos inline) | PC 1440, tablet horizontal 1280 |
| 960–1279 px | "Tablet em pé" (1ª quebra) | nenhum quadro; é onde cai um iPad deitado de 1024/1180 px |
| 720–959 px | 2ª quebra | tablet vertical 800 |
| 380–719 px | "Celular: uma coluna" | celular 390 |
| < 380 px | ajuste final | perdas em 1 coluna |

O que troca o arranjo: `order:-1` no teclado, `grid-template-columns` trocados, `flex-direction` invertido, `display:none` em enfeites e tamanhos de fonte com `!important` sobre os estilos inline. Não há container query nem troca por JavaScript. Não há `max-width` de conteúdo: em 1440 a tela simplesmente estica.

### 8.2 Parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| Ordem dos blocos | cabeçalho → (faixa de pausa) → Lote \| Resumo → teclado embaixo | igual ao PC | cabeçalho → (faixa) → **teclado em cima** → Lote \| Resumo | cabeçalho (2 linhas) → (faixa) → teclado → Lote → Resumo |
| Rolagem | nenhuma (tudo em 100vh) | nenhuma (tudo em 100vh) | cabe em 1280 de altura; rola se faltar | rola na vertical (quadro de 1920 px) |
| Cabeçalho | 1 linha, 68 px, padding 0 24 | igual | 1 linha; some o logo e o sufixo "· PRODUÇÃO DE PLACAS" | 2 linhas: (voltar + setor/data + pílula à direita) e ("Pausar" + "Histórico" dividindo a largura + relógio); padding 10 12 |
| Logo | visível 44 px | visível 44 px | oculto | oculto |
| Botões do cabeçalho | 48 px de altura | 48 px | 48 px | 48 px, largura flexível (metade cada) |
| Padding / gap do corpo | 16 24 / 16 | 16 24 / 16 | 16 24 / 16 | 12 / 12 |
| Área de cima (cartões) | 2 colunas iguais, ocupa a sobra (~524 px) | 2 colunas iguais, ocupa a sobra (~424 px) | 2 colunas iguais, abaixo do teclado, cresce para preencher | 1 coluna, altura natural |
| Teclado: colunas | `1fr 292px 440px`, altura fixa 260 | igual | `1fr 260px`; linha 1 = `clamp(220px, 24vh, 300px)` (300 em 1280 de altura); linha 2 = perdas `1fr` + último registro `260px` | 1 coluna, altura automática |
| Botão "Placa boa" (tamanho) | ~530×260 px | ~370×260 px | ~378×300 px | ~284×120 px |
| "Placa boa": fonte do título / subtítulo | 50 / 18 px | 50 / 18 px | 38 / 16 px (42 px entre 960 e 1279) | 32 / 15 px, ícone 26 px |
| "−1" da placa boa | 88 px de largura, 36 px | 88 px, 36 px | 88 px, 36 px | 72 px, 30 px |
| "+ Placa" e "+ Cabeça vazia" | ~224×124 px cada, 30 px | igual | ~192×144 px cada, 26 px | largura total × 72 px cada, 26 px |
| "−1" dos secundários | 60 px de largura, 26 px | igual | igual | igual |
| Perdas | grade 2×2, linhas de 64 px, fonte 20 px, "−1" de 52 px | igual | grade 2×2, linhas de 64 px, fonte 18 px, "−1" de 52 px | grade 2×2, linhas de 56 px, fonte 16 px, "−1" de 44 px (1 coluna abaixo de 380) |
| "Último registro" | linha: texto à esquerda, "Desfazer" (52 px) à direita; ocupa a sobra (~86 px) | igual | coluna de 260 px ao lado das perdas: texto em cima, "Desfazer" embaixo, centralizado | linha, mín. 72 px, "Desfazer" à direita |
| Números-herói (lote e dia) | 64 px (secundário 40 px) | 64 / 40 px | 64 / 40 px; o do dia quebra linha | 64 / 40 px; o do dia quebra linha |
| Azulejos do lote | 3 colunas × 2 linhas, mín. 52 px | igual | 2 colunas × 3 linhas, mín. 56 px (3 colunas entre 960 e 1279) | 2 colunas × 3 linhas, 56 px fixos |
| Azulejos do dia | 4 colunas × 3 linhas, mín. 52 px | igual | 2 colunas × 6 linhas, mín. 56 px (3 colunas entre 960 e 1279) | 2 colunas × 6 linhas, 56 px fixos |
| Azulejo: rótulo / valor | 14 / 24 px | igual | igual | igual |
| Seletor de tamanho | 4 em linha, 64 px de altura | igual | 2×2, 64 px | 2×2, 64 px |
| Dica "produzido hoje em cada tamanho" | visível | visível | oculta | oculta |
| "Fechar lote" | 44 px de altura | igual | igual | igual |
| "Fechar dia… (segurar 2 s)" | 44 px, 1 linha | igual | máx. 124 px de largura, 14 px, quebra em 2 linhas | igual ao tablet V |
| Confirmação de lote | dentro do cartão; "Cancelar" à esquerda, principal ocupa o resto; 60 px | igual | dentro do cartão; botões **empilhados**, principal em cima, "Cancelar" embaixo | igual ao tablet V |
| Faixa de pausa | 1 linha, "Retomar" à direita (52 px) | igual | igual | quebra: texto em cima, "Retomar" em largura total |
| Modal de pausa: forma | caixa central, máx. 1040 px, margem de 24 px | igual | caixa central, máx. 760 px | **tela cheia** (sem borda, sem cantos) |
| Modal: categorias | 7 em linha, mín. 96 px, ícone 30 px em cima | igual | 4 colunas (2 linhas), mín. 96 px | 2 colunas, mín. 64 px, ícone 24 px **à esquerda** do texto, 16 px |
| Modal: motivos | 4 colunas, mín. 60 px, 18 px | igual | 2 colunas, mín. 60 px | 1 coluna, mín. 56 px, 17 px, alinhado à esquerda |
| Modal: título / subtítulo | 32 / 17 px | igual | igual | 24 / 15 px |
| Modal: rodapé | resumo + "Não parou" + "Registrar pausa" em linha, 64 px | igual | igual | resumo numa linha inteira; os dois botões dividem a largura, 64 px, principal 21 px |
| Modal: o que rola | só o miolo (`.pz-b`), cabeçalho e rodapé fixos | igual | igual | igual |
| Menor alvo de toque | 44 px ("Fechar lote", "Fechar dia") | 44 px | 44 px | 44 px (inclui o "−1" de perda: 44×56) |

Medidas dos botões são calculadas a partir do CSS (largura da janela − paddings − colunas fixas); servem de referência, não de pixel exato.

### 8.3 Tipografia e cor (para o card de design system)
- Fontes: **Barlow** (texto, 400–700) e **Barlow Semi Condensed** (números e botões, 600–800); `font-variant-numeric: tabular-nums`.
- Fundo `#0A0E15`; cartões `#111824` com borda `#26334A`; azulejos `#0D1420` com borda `#1C2738`; texto `#EEF2F8`; texto secundário `#A3B0C2`; azul do setor `#60A5FA` / `#93C5FD`.
- Verde boa `#22C55E` (texto `#052E16`); âmbar vazio/pausa `#F59E0B` (texto `#2A1A00`); vermelho perda `#DC2626`; azul ação `#2563EB`.
- Toque: `touch-action: manipulation`, sem realce de toque, `:active` reduz para 98% e escurece; foco visível com contorno de 3 px; respeita `prefers-reduced-motion`.
- Acessibilidade já marcada: `aria-label` nos "−1", `aria-pressed` nos seletores, `aria-live="polite"` no último registro e no resumo do modal, `role="dialog" aria-modal`, `role="status"` na faixa, `role="img"` na barra de meta.

---

## 9. Fase futura, desabilitado ou placeholder

- **"Fechar dia… (segurar 2 s)"**: botão tracejado sem ação; o gesto de segurar 2 s está só no texto.
- **Disparo real do aviso de parada**: não há temporizador; o aviso só abre pela prop `estado=pausa`.
- **Relógio, data, tempo ativo, tempo parado, tempo do lote**: valores fixos.
- **Meta 270**: fixa no script e no HTML ("/ 270").
- **Descrição da pausa**: digitada e descartada.
- **Estados de rede (offline, sincronizando, erro)**: ausentes, embora o projeto preveja offline (Serwist + Dexie).
- **Variável `rh` no script** (sufixo de telas do RH): calculada e não usada; indica um link para "Pausas" que não foi feito.

---

## 10. Divergências da versão anterior (`Injetora.dc.html`)

A versão anterior tem a mesma marcação e a mesma lógica de registro, lote, desfazer e resumo. Diferenças:

| Ponto | Versão anterior | Versão atual |
|---|---|---|
| Pausa | "Pausar" só alterna a pílula "Rodando"/"Pausado" | Modal com categoria, motivo e descrição; faixa amarela; aviso automático; pílula com motivo |
| Links | `Setores.dc.html`, `Historico-Setor.dc.html` | `Tela-Setores{sufixo}`, `Tela-HistInjetora{sufixo}` |
| Teclado no tablet em pé | linha fixa de 220 px | `clamp(220px, 24vh, 300px)` (botões crescem até 300 px) |
| Cartões no tablet em pé | altura natural (`flex:none`), azulejos de 56 px fixos | crescem para preencher (`flex:1 0 auto`), azulejos `minmax(56px, 1fr)` |
| Celular | sem regra própria para os azulejos | azulejos de 56 px fixos, cartões em altura natural |

Nenhuma regra de negócio existe só na versão anterior.

---

## 11. Dúvidas reais para o card

1. **iPad deitado**: o arranjo "horizontal" só vale a partir de 1280 px. Um iPad comum deitado tem 1024 ou 1180 px e cairia no arranjo "em pé". Qual é o tablet real e a quebra deve descer?
2. **Meio × total** nas perdas: qual a diferença no chão de fábrica e ela muda alguma conta (área perdida, ciclos)? Hoje as duas contam 1 ciclo.
3. **"+ Placa" (1 ciclo)**: quando o operador usa em vez de "Placa boa" (2 ciclos)? A placa tem a mesma área e conta igual na meta?
4. **"Ciclos perdidos"** deve incluir as cabeças vazias? Hoje é idêntico a "Perdidas".
5. **Contador de ciclos**: é derivado dos toques ou deve bater com o contador físico da máquina (com campo para conferir/corrigir)?
6. **Meta**: 270 placas por dia vale para qualquer tamanho? Vem do RH (Metas) por setor, por dia ou por turno?
7. **Turnos**: o "dia" é um turno só? "Tempo ativo" = desde o primeiro registro menos as pausas? Pausa planejada (Refeição) desconta de "Tempo parado"?
8. **Fechar dia**: o que faz (fecha o lote aberto, trava registros, gera relatório)? Quem pode? Dá para reabrir? O que acontece se ninguém fechar?
9. **Registrar durante a pausa**: um toque de "+" com o setor pausado encerra a pausa sozinho, é bloqueado ou só soma?
10. **"Não parou"**: zera o temporizador e avisa de novo em 10 min? O RH enxerga que o aviso foi dispensado?
11. **Aviso automático**: dispara fora do horário de trabalho, antes do primeiro registro do dia ou com o dia fechado? Soa/vibra? Reaparece se o tablet for recarregado?
12. **Pausa retroativa**: o início fica no último registro (15:24) mesmo que o operador só responda bem depois? Ele pode ajustar a hora?
13. **"Outro"**: a descrição deveria ser obrigatória nessa categoria? (Hoje é opcional.)
14. **Desfazer e "−1"**: há limite de tempo ou de quantidade? Valem para lote já fechado? Um lote fechado por engano pode ser reaberto?
15. **Lote vazio**: pode fechar um lote com zero placas? Trocar de tamanho logo depois de abrir cria lote vazio no histórico?
16. **Quem registrou**: o evento guarda só o tablet/setor ou também uma pessoa (login do operador)?
17. **Dois aparelhos no mesmo setor** (tablet + celular do encarregado): os contadores sincronizam em tempo real? Como resolver conflito de offline?
18. **Sem conexão**: como a tela avisa que está offline e que há registros na fila? (Não há desenho.)
19. **PC e celular**: são só para consulta ou também registram? (O protótipo deixa registrar em qualquer largura.)
20. **Tamanhos e tipos de perda**: são fixos ou o admin/RH cadastra?
