# Mapa do protótipo · RH · Pedidos e estoque (`rh-pedidos`)

Fonte: `RH2-Pedidos*.dc.html` (6 quadros), `canvas.json`, quadros `Briefing-RH-1..4` (o pedido que originou a tela) e, para a regra de entrada no estoque, `Tela-Teste-TabletH.dc.html`.
Os arquivos antigos `OS.dc.html` e `Estoque.dc.html` (telas "RH · ordens de serviço" e "RH · pacotes e estoque" citadas no briefing) **não estão na pasta exportada**; a única "versão anterior" disponível para comparar é o texto do briefing.

---

## 0. Resumo em uma tela

- **Pergunta que a tela responde** (briefing): "Tenho pacote para entregar o que foi pedido?"
- **Quem usa**: RH / gestão (selo "RH" ao lado do logo). Não é tela de operador. Chega-se por `Tela-Area` (card RH, item "Pedidos e estoque · Ordens de produção e pacotes prontos") ou pelas abas do RH.
- **O que junta**: as antigas telas "Ordens de serviço" e "Pacotes e estoque".
- **Um componente só** para as 6 variações. O que muda entre arquivos é apenas `<title>` e os props do script:

| Quadro | `largura` | `os` | Tamanho no canvas |
|---|---|---|---|
| `RH2-Pedidos` | `pc` | `""` | 1440 × 1220 (expand: fill) |
| `RH2-Pedidos-OS` | `pc` | `OP-00015` | 1440 × 900 |
| `RH2-Pedidos-Tablet` | `tablet` | `""` | 820 × 2150 |
| `RH2-Pedidos-Tablet-OS` | `tablet` | `OP-00015` | 820 × 1180 |
| `RH2-Pedidos-Celular` | `celular` | `""` | 390 × 2440 |
| `RH2-Pedidos-Celular-OS` | `celular` | `OP-00015` | 390 × 844 |

Props existentes: `largura` (só define o sufixo dos links das abas), `os` (id da OP que já abre no detalhe), `painel` (`metas` / `exportar`, abre o painel), `previa` (`sim`, prévia do Exportar no celular).

**Mecanismo de responsividade**: CSS puro com duas media queries de `max-width` no mesmo HTML. Não há troca de componente por prop.
- PC: 1200 px ou mais (regras base).
- Tablet: `@media (max-width:1199px)` → 768 a 1199.
- Celular: `@media (max-width:767px)`.
- Blocos alternativos ficam **os dois no DOM** e alternam com `display`: quadro kanban (`.r2-kb`) × abas + lista (`.r2-ostabs` / `.r2-oslist`); colunas de nível (`.r2-lvs`) × barras horizontais (`.r2-hbs`); ações do cabeçalho (`.r2-hacts`) × botão "Filtros" + FAB.
- Consequência: o tablet do operador deitado (1280 × 800) e iPad Pro deitado (1366) caem no arranjo **PC**; iPad deitado de 1180 px e tablet em pé (800/820) caem no arranjo **tablet**. Não existe quadro de 1280 nem de 1180 para esta tela (não verificado pelo protótipo).

---

## 1. Blocos da tela, de cima para baixo (arranjo PC)

### 1.1 Barra de navegação do RH (`.r2-top`)
- Logo AquaPulse (219 × 30) + selo "RH" → link para `Hub.dc.html`.
- Abas: **Agora**, **Desempenho**, **Pedidos e estoque** (ativa, `aria-current="page"`; em tablet e celular o rótulo vira **Pedidos**), **Pausas**. Cada aba tem ícone + rótulo.
- Ações: botão **Metas** e botão **Exportar** (abrem painéis por cima da tela).
- Relógio "09:49" (24 px).
- Só no celular: botão "⋯" ("Mais opções").

### 1.2 Cabeçalho (`.r2-head`)
- H1 "Pedidos e estoque" (44 px) e chip de data "ter 10/11 · 09:45" (momento da última atualização dos dados).
- Filtro **MEDIDA** em segmentos: "Todas", "2 m", "3 m", "4 m", "5 m" (title com o nome longo: "Todas as medidas", "2 m · 1 m²", "3 m · 1,5 m²", "4 m · 2 m²", "5 m · 2,5 m²").
- Botão principal **"+ Nova OP"**.
- Botão "⋯" ("Ações de estoque") que abre um menu suspenso com **"Definir mínimos"** e **"Ajustar estoque"**.

### 1.3 Números do topo (`.r2-nums`, 4 cards)
Cada card: ícone, rótulo, botão "i" (dica), valor grande, unidade, barra opcional, nota.

| Card | Valor de exemplo | Nota | Texto da dica (botão i) |
|---|---|---|---|
| **Disponível** | 384 pacotes | "3 m · 3.840 placas" | "Entra quando a Embalagem finaliza um pacote (10 placas por padrão; o operador ajusta quando sai com outra quantidade). Sai quando uma OP é expedida." |
| **Reservado** | `[ ]` | "nenhuma OP aberta" | "Pacotes separados para OP ainda não expedidas." |
| **Pacotes hoje** | 12 | "42% da média · até 09:45" + barra lilás em 42% | "Pacotes finalizados hoje até 09:45, contra a média de 28,8 por dia." |
| **Expedido no mês** | `[ ]` | "saídas registradas" | "Pacotes que saíram com OP expedidas em novembro." |

### 1.4 Estoque por medida (`.g-est`) · destaque da tela
- Legenda: "disponível" (lilás #C4B5FD), "reservado [ ]" (#5B5490), "mínimo [ ]" (traço tracejado). Reservado e mínimo ainda são placeholder.
- 4 colunas de nível (2 m, 3 m, 4 m, 5 m) com eixo Y 0, 100, 200, 300, 400, 500. Em cada coluna: valor em cima, caixa de 200 px com o preenchimento, medida e área embaixo ("3 m" / "1,5 m²"), e a situação.
- Exemplo: 3 m = 384, preenchimento 76,8%, situação "OK" (verde, ícone de check). 2 m, 4 m e 5 m: valor `[ ]`, caixa tracejada vazia, situação "sem dados" (cinza).
- Situações previstas: "OK", "sem dados" e **abaixo do mínimo** (classe `.r2-sit.bx` âmbar e ícone de alerta `IC.baixa` existem no código mas não são usados no exemplo).
- Cada coluna é um botão: tocar filtra a tela por aquela medida; tocar de novo volta a "Todas".

### 1.5 Pacotes por dia (`.g-dia`)
- Título + nota "144 em 7 dias".
- 6 barras verticais: 03/11 ter 36 · 04/11 qua 33 · 05/11 qui 25 · 06/11 sex 23 · 09/11 seg 27 · 10/11 hoje 12 (barra de hoje hachurada, rótulo "hoje").
- Linha tracejada "média 28,8".
- Altura do gráfico 180 px; escala fixa de 0 a 40 no exemplo.

### 1.6 Ordens de produção (`.g-os`)
- Título + campo de busca (placeholder "OP ou cliente", aria "Buscar OP ou cliente").
- **PC**: quadro de 3 colunas por estado, cada uma com chip de estado e contagem: **Abertas** (0), **Em produção** (0), **Concluídas** (1). Coluna vazia mostra caixa tracejada com ícone e texto.
- **Tablet e celular**: abas "Abertas", "Em produção", "Concluídas", "Todas" (cada uma com contagem; "Todas" é a aba inicial) e uma lista de cards.
- Card de OP (botão inteiro): número "OP-00015" (22 px), chip de estado ("Aberta" / "Em produção" / "Concluída"), cliente ("Sem cliente"), chip da medida ("3 m · 1,5 m²"), chip com calendário e data de entrega ("01/10/2026"), linha "pacotes **100** / 100" com barra verde de progresso.

### 1.7 Movimentações (`.g-mov`)
- Título + legenda dos 4 tipos com ícone: **Entrada** (verde), **Reserva**, **Expedição** (cinza claro), **Ajuste** (âmbar).
- Lista (linha do tempo), cada linha: ícone do tipo, quando, tipo, detalhe, chip de medida, quantidade com sinal.
- Exemplo (9 linhas, 5 visíveis):
  1. 10/11 09:45 · Entrada · "Pacotes finalizados · Tablet Teste/Embalagem" · 3 m · 1,5 m² · +12
  2. 09/11 · Entrada · "Pacotes finalizados no dia" · 2, 3 e 4 m · +27
  3. 06/11 · idem · 2, 3 e 4 m · +23
  4. 05/11 · idem · 3 e 4 m · +25
  5. 04/11 · idem · 3 m · 1,5 m² · +33
  6. 03/11 · idem · 3 m · 1,5 m² · +36
  7. `[data]` · Reserva · "Separado para OP [ ]" · `[medida]` · `[ ]`
  8. `[data]` · Expedição · "Saída da OP [ ] para o cliente" · `[medida]` · `[ ]`
  9. `[data]` · Ajuste · "[quem] · [motivo]" · `[medida]` · `[ ]`
- Botão "Ver todas (9)" ↔ "Ver só as 5 últimas".

### 1.8 Detalhe da OP (`.r2-rp`, abre por cima)
- Cabeçalho fixo: número da OP (34 px) + chip de estado; "X" para fechar (PC/tablet) ou "‹ Pedidos" (celular).
- Chips: cliente ("Sem cliente"), "entrega 01/10/2026", medida ("3 m · 1,5 m²").
- Card **"PACOTES ATENDIDOS"**: "100 / 100" (número de 56 px), barra verde, e "1.000 placas" (title: "soma das placas de cada pacote").
- Linha do tempo de 4 etapas:
  - "Criada" · `[data]` (ponto azul, feito)
  - "Estoque reservado" · "separado para esta OP" (ponto azul, feito)
  - "Pacotes atendidos" · "100 de 100" (ponto verde)
  - "Expedição" · "não registrada · [data]" (ponto tracejado, pendente)
- Botões: **"Editar"** (secundário) e **"Registrar expedição"** (primário).

### 1.9 Sobreposições auxiliares
- **Menu "Ações de estoque"** (PC/tablet, popover do "⋯" do cabeçalho): "Definir mínimos", "Ajustar estoque".
- **Folha "Filtros"** (celular, folha de baixo): título "Filtros", "X", rótulo "MEDIDA", 5 opções com nome longo e check na escolhida, botão "Ver resultado".
- **Menu "Mais opções"** (celular, "⋯" do topo): "Metas", "Exportar", separador, "Definir mínimos", "Ajustar estoque".
- **Painel Metas** e **Painel Exportar**: mesmo código das telas Agora e Desempenho (ver seção 7).

---

## 2. Ações e o que cada uma faz no script

Estado do componente: `tam` ('todas' | 2 | 3 | 4 | 5), `aba` ('todas' | 'ab' | 'pr' | 'co'), `q` (busca), `os` (id da OP aberta), `todas` (movimentações expandidas), `folha`, `menu`, `pop`, `dica` (id do card com dica aberta), mais o estado dos painéis.

| Ação | Efeito |
|---|---|
| Segmento de MEDIDA | `tam = x`. Um só ativo (`aria-pressed`). |
| Tocar numa coluna/barra de estoque | Alterna: se já é a medida filtrada volta para 'todas', senão filtra por ela. Coluna selecionada ganha anel azul; as outras ficam com opacidade 0,35. |
| Chip do filtro ativo (celular, "3 m ✕") | `tam = 'todas'`. |
| "Filtros" (celular) | Abre a folha de baixo e fecha o menu. A escolha aplica na hora; "Ver resultado", "X" e o fundo só fecham. |
| Botão "i" de um número | Abre/fecha a dica em linha dentro do card. Só uma dica aberta por vez. `aria-expanded`. |
| Busca | `q` = texto digitado. Filtra por substring, sem diferenciar maiúsculas, em `id + ' ' + cliente`. |
| Aba de estado (tablet/celular) | `aba = estado`. Filtra a lista. |
| Tocar num card de OP | `os = id` → abre o detalhe. |
| Fundo escuro, "X" ou "‹ Pedidos" no detalhe | `os = null`. |
| "Ver todas (N)" | Alterna entre as 5 primeiras e todas as movimentações. |
| "⋯" do cabeçalho | Abre/fecha o popover "Ações de estoque". Não há fundo clicável: fecha só clicando no "⋯" de novo ou num item. |
| "⋯" do topo (celular) | Abre/fecha o menu; fecha a folha de filtros. Fundo escuro fecha. |
| "Metas" | Abre o painel Metas (`painel = 'metas'`), fecha o menu. |
| "Exportar" | Abre o painel Exportar **já com o tipo "Pacotes e estoque" (índice 3) e a medida filtrada na tela**; período padrão "Novembro 2026"; setores todos. |
| Abas da navegação | Link para a outra tela de RH na mesma largura (sufixo `''`, `-Tablet`, `-Celular`). |
| Logo | `Hub.dc.html`. |

**Sem lógica no protótipo (só o botão):**
- "+ Nova OP" (cabeçalho e FAB do celular): sem `onClick`.
- "Editar" e "Registrar expedição" no detalhe: sem `onClick`.
- "Definir mínimos" e "Ajustar estoque": só fecham o menu.
- Não há confirmação, desfazer nem validação nesta tela, porque nenhuma ação de escrita foi desenhada.

### Como o filtro de medida afeta cada bloco
- **Disponível**: mostra a medida filtrada. Com "Todas", mostra **3 m** (`estT = tam === 'todas' ? 3 : tam`), não a soma. Medida sem dado: valor `[ ]`, nota "4 m · sem dados".
- **Reservado** e **Expedido no mês**: `[ ]` sempre.
- **Pacotes hoje**: 12 com "Todas" ou "3 m"; 0 nas outras, com nota "sem 4 m hoje" e sem barra.
- **Estoque por medida**: esmaece as outras colunas, não esconde.
- **Ordens de produção**: esconde as OP de outra medida. As **contagens** das colunas e das abas não mudam com filtro nem busca (contam o total por estado).
- **Movimentações**: esmaece (opacidade 0,35) as linhas que não incluem a medida; não esconde. Linhas placeholder (sem medida) também esmaecem.
- **Pacotes por dia**: não reage ao filtro no protótipo (sempre o total).

---

## 3. Estados

| Estado | Como aparece |
|---|---|
| Normal | Como descrito na seção 1. |
| Medida sem dados | Coluna tracejada vazia, valor `[ ]`, situação "sem dados"; card Disponível com `[ ]` e "… · sem dados". |
| Abaixo do mínimo | Previsto (estilo âmbar `.bx` + ícone de alerta), sem exemplo. Depende de "Definir mínimos". |
| Coluna de OP vazia (PC) | Caixa tracejada: "nenhuma OP aberta" / "nenhuma em produção" / "nenhuma concluída". |
| Lista vazia (tablet/celular) | Idem por aba; aba "Todas": "nenhuma OP". |
| Busca ou filtro sem resultado | "nenhuma OP encontrada" (em todas as colunas ou na lista). |
| Sem pacote da medida hoje | Pacotes hoje = 0, nota "sem X m hoje", sem barra. |
| Detalhe aberto | Painel lateral (PC 480 px, tablet 440 px) ou tela cheia (celular). |
| Dica aberta | Caixa azul-escura dentro do card do número. |
| Movimentações expandidas | Lista completa, botão "Ver só as 5 últimas". |
| Filtro ativo (celular) | Chip azul com a medida e "✕" ao lado de "Filtros". |
| OP: Aberta / Em produção / Concluída | Chips cinza / azul / verde. |
| Etapa da linha do tempo | "feito" (azul), "ok" (verde), "pend" (tracejado). |

**Não desenhados**: carregando, erro, sem conexão, sem permissão, lista longa de OP (paginação ou rolagem dentro da coluna), formulário de Nova OP, formulário de Editar, confirmação de expedição, telas de Definir mínimos e Ajustar estoque, OP atrasada (entrega vencida), OP parcialmente atendida (só existe o exemplo 100/100).

---

## 4. Regras de negócio e contas

| Regra | Valor de exemplo | Configurável? |
|---|---|---|
| Unidade do estoque | pacote | fixo |
| Placas por pacote | 10 por padrão; o operador da Embalagem ajusta por pacote (na tela Teste: −1/+1, de 1 a 30, aviso "fora do padrão (10)") | padrão parece configurável; valor real é por pacote |
| Entrada no estoque | quando Teste & Embalagem finaliza um pacote ("cada pacote entra no estoque" na tela do operador); o "−1 pacote" do operador desfaz a entrada | regra fixa |
| Saída do estoque | quando uma OP é expedida ("Registrar expedição") | regra fixa |
| Reservado | pacotes separados para OP ainda não expedidas | regra fixa |
| Disponível | no protótipo um número único por medida; a legenda separa disponível × reservado dentro da mesma coluna | — |
| Placas do disponível | `pacotes × 10` (384 → 3.840) | deveria ser a soma real das placas |
| Placas da OP | `atendidos × 10` no script, mas o title diz "soma das placas de cada pacote" | soma real |
| Progresso da OP | `round(atendidos / total × 100)` | — |
| Medidas | 2 m = 1 m², 3 m = 1,5 m², 4 m = 2 m², 5 m = 2,5 m² | cadastro fixo de 4 medidas |
| Mínimo por medida | `[ ]` | sim ("Definir mínimos") |
| Situação da medida | OK / abaixo do mínimo / sem dados | derivada do mínimo |
| Escala do gráfico de nível | 0 a 500 pacotes, passo 100 | fixa no exemplo; na prática deve acompanhar o maior valor |
| Pacotes por dia | 6 colunas: os 5 últimos dias com embalagem + hoje | janela "7 dias" |
| "144 em 7 dias" | 36+33+25+23+27 (03/11 a 09/11, sem contar hoje) | — |
| Média diária | 144 ÷ 5 dias com embalagem = 28,8 (dias sem produção não entram) | — |
| "42% da média" | 12 ÷ 28,8 | — |
| Escala do gráfico por dia | 0 a 40 | fixa no exemplo |
| Movimentações visíveis | 5 últimas; "Ver todas" expande | — |
| Agrupamento das entradas | uma linha por dia ("Pacotes finalizados no dia", medidas somadas: "2, 3 e 4 m"); hoje com hora da última e origem "Tablet Teste/Embalagem" | — |
| Ajuste | registra quem fez e o motivo | obrigatórios, ao que indica |
| Sinal da quantidade | "+" em verde; demais em cinza | — |
| Número da OP | "OP-00015" (prefixo + 5 dígitos, sequencial) | — |
| Cliente | opcional ("Sem cliente") | — |
| Estados da OP | Aberta → Em produção → Concluída | transições não definidas |
| Etapas da OP | Criada → Estoque reservado → Pacotes atendidos → Expedição | — |
| Uma OP = uma medida | o card e o detalhe mostram uma medida só | não decidido se pode ter várias |

Painel Metas (compartilhado): meta diária 270 por setor, passo de 10, mínimo 10; dias úteis 21 (entre dias passados + 1 e 31); meta do mês = dia × dias úteis (5.670); "Só o RH altera · vai para os tablets".

---

## 5. Entidades e dados implícitos

**Medida** (`tamanho`): metros (2, 3, 4, 5), área em m², estoque mínimo (pacotes), meta opcional por tamanho.

**Pacote**: id, medida, quantidade de placas (padrão 10), finalizado em, tablet/setor de origem, operador, pacote-lote do Teste, situação (disponível, reservado, expedido), OP vinculada.

**Movimentação de estoque**: id, tipo (entrada, reserva, expedição, ajuste), data e hora, medida, quantidade com sinal (em pacotes), origem (tablet Teste/Embalagem, RH), OP relacionada, usuário (quem), motivo (ajuste), detalhe.

**Ordem de produção (OP)**: número sequencial, cliente (opcional), medida, pacotes pedidos (total), pacotes atendidos, placas (soma), data de entrega, estado (aberta, em produção, concluída), criada em / por, reservada em, expedida em / por.

**Evento da OP** (linha do tempo): tipo (criada, estoque reservado, pacotes atendidos, expedição), data, usuário.

**Cliente**: no mínimo o nome (texto livre ou cadastro, não decidido).

**Saldo por medida** (derivado ou materializado): disponível, reservado.

**Agregados lidos**: pacotes finalizados por dia e por medida; média diária; expedido no mês.

**Eventos que esta tela gravaria**: OP criada; OP editada; expedição registrada (baixa do estoque + movimentação "Expedição" + etapa da OP); reserva de estoque (manual ou automática, não decidido); mínimos alterados; ajuste de estoque (quem + motivo + medida + quantidade). **Eventos que ela só lê**: pacote finalizado e "−1 pacote" vindos do tablet de Teste & Embalagem.

---

## 6. Navegação

| De | Para |
|---|---|
| Logo + selo RH | `Hub.dc.html` |
| Aba Agora | `RH2-Agora{sufixo}` |
| Aba Desempenho | `RH2-Desempenho{sufixo}` |
| Aba Pedidos e estoque | `RH2-Pedidos{sufixo}` (a própria) |
| Aba Pausas | `RH2-Pausas{sufixo}` |
| Metas | painel Metas sobre a tela |
| Exportar | painel Exportar sobre a tela |
| Card de OP | detalhe da OP sobre a tela (no sistema real convém ter URL própria, ex.: `?op=OP-00015`, já que existe quadro "OP aberta") |
| Entrada na tela | `Tela-Area` (card RH lista "Pedidos e estoque", mas o link do card leva a `RH2-Agora`) |

---

## 7. Painéis compartilhados (resumo; o detalhe pertence à família dos painéis)

- **Metas**: painel lateral de 480 px (PC/tablet), tela cheia no celular com "‹ Voltar". Dias úteis com −/+; por setor: meta por dia com −/+ (passo 10), meta do mês calculada, barras hoje e mês, "faltam" e "precisa por dia"; "Meta por tamanho · opcional" (4 campos numéricos, passo 10); rodapé "Só o RH altera · vai para os tablets", "Desfazer" (desabilitado sem mudança), "Salvar metas" → "Metas salvas".
- **Exportar**: painel largo (até 1180 px no PC, formulário 400 px + prévia; até 780 px no tablet, formulário e prévia empilhados; tela cheia no celular com botão "Ver prévia" / "Formulário"). Campos: TIPO (Relatório mensal, Produção por operadora, Perdas e defeitos, **Pacotes e estoque** "Entradas, reservas por OP e expedições", Fechamentos e correções), PERÍODO (Novembro 2026, Outubro 2026, Últimos 7 dias, Escolher datas), MEDIDA, SETORES, SEÇÕES, FORMATO (PDF, Excel, CSV), "Enviar todo dia 1º por e-mail para o RH", botão "Baixar PDF/Excel/CSV" (sem lógica).
- A prévia do documento não muda de conteúdo conforme o tipo: para "Pacotes e estoque" continua mostrando os blocos do relatório mensal. O layout do relatório de pacotes e estoque não está desenhado.

---

## 8. Responsividade, parâmetro por parâmetro

### 8.1 Tabela parâmetro × largura

| Parâmetro | PC (≥ 1200; quadro 1440) | Tablet (768 a 1199; quadro 820 em pé) | Celular (≤ 767; quadro 390) |
|---|---|---|---|
| Barra de navegação | 1 linha: logo · abas · Metas/Exportar · relógio; altura 68; não fixa | 2 linhas: logo + relógio / abas + Metas/Exportar; logo 60, abas 52; não fixa | Topo fixo (sticky) de 60: logo 175 × 24, relógio, "⋯" 48 × 48. Abas viram barra fixa embaixo |
| Abas | Texto 16 px + ícone 20, sublinhado 3 px na ativa; rótulo "Pedidos e estoque" | Idem, padding menor; rótulo "Pedidos" | Barra inferior fixa, 4 colunas iguais, ícone 22 em cima do rótulo 14 px, altura 62, traço em cima na ativa; rótulo "Pedidos" |
| Metas / Exportar | Botões de 40 px na barra | Botões de 44 px na 2ª linha | Dentro do menu "⋯" (itens de 48 px) |
| Relógio | 24 px | 24 px | 22 px |
| Margens da página | 24 / 40 / 64; conteúdo até 1440 (nav até 1360) | 24 / 24 / 64 | 16 / 16 / 168 (folga para barra inferior e FAB) |
| Espaço entre blocos | 22 | 22 | 18 |
| Título (H1) | 44 px | 44 px | 28 px |
| Cabeçalho | Título à esquerda, ações à direita na mesma linha | Mesmos elementos; quebram para a linha de baixo quando não cabem (flex-wrap) | Grade: título + "Filtros" na 1ª linha, data na 2ª; ações do PC escondidas |
| Filtro de medida | Segmentos à vista, botões de 40 px | Segmentos à vista, 44 px, a faixa rola na horizontal | Botão "Filtros" (48 px) abre folha de baixo; filtro ativo vira chip de 48 px com "✕" |
| "Nova OP" | Botão de 48 px no cabeçalho | Botão de 48 px no cabeçalho | Botão flutuante (FAB) fixo: direita 16, base 84, altura 56, fonte 17 |
| Ações de estoque | "⋯" 48 × 48 → popover (itens 44 px) | Idem | No menu "⋯" do topo (itens 48 px) |
| Grade principal | 2 colunas 1fr / 2fr | 1 coluna | 1 coluna |
| Ordem dos blocos | Números (largura total) → esquerda: Estoque, Pacotes por dia · direita: Ordens de produção, Movimentações | Números → Estoque → Ordens de produção → Pacotes por dia → Movimentações | **Estoque** → Números → Ordens de produção → Pacotes por dia → Movimentações |
| Números do topo | 4 em linha; valor 38 px | 4 em linha; valor 38 px | 2 × 2; valor 32 px; rótulo 14 px |
| Botão "i" | 40 × 40 | 44 × 44 | 48 × 48 (com margem negativa) |
| Estoque por medida | 4 colunas de nível (caixa de 200 px) + eixo de 34 px; valor 26 px | Igual, eixo de 40 px e espaço de 14 | 4 **barras horizontais**: medida/área · trilho de 16 px · valor 22 px · situação; linha de 52 px; sem eixo |
| Ordens de produção | Kanban de 3 colunas com contagem | Abas (4, com contagem, rolam na horizontal) + lista em 2 colunas | Abas em grade 2 × 2 (48 px, contagem à direita) + lista em 1 coluna |
| Busca | 260 × 44, ao lado do título do bloco | Igual | Largura total, 44 px |
| Card de OP | Número 22 px, padding 14 | Igual | Igual, largura total |
| Pacotes por dia | 180 px de altura, margem direita 84 para o rótulo da média, valor 18 px, barra 56% da coluna | Igual, largura total | 170 px, margem 58, valor 15 px, barra 64% |
| Movimentações | Linha em 6 colunas (ícone 38 · quando 100 · tipo 96 · detalhe · medida · quantidade 64), mín. 56 px, quantidade 22 px | 6 colunas mais estreitas (96 / 92 / 56) | Card de 3 linhas: ícone à esquerda; quando / detalhe / chip da medida; quantidade à direita. O texto do tipo some (fica o ícone) |
| "Ver todas" | Botão de 44 px | 44 px | 44 px |
| Detalhe da OP | Painel lateral direito de 480 px, fundo escurecido, "X" 44 × 44 | Painel lateral de 440 px, "X" | Tela cheia, sem borda; "‹ Pedidos" (48 px) no lugar do "X" |
| Número grande do detalhe | 56 px (id da OP 34 px) | Igual | Igual |
| Botões do detalhe | "Editar" e "Registrar expedição" lado a lado, 48 px | Lado a lado | Empilhados, largura total, 48 px |
| O que rola | A página inteira; o painel de detalhe rola por dentro com cabeçalho fixo | Igual | Página rola entre topo fixo e barra inferior fixa; detalhe rola por dentro |
| O que é fixo | Nada (só sobreposições) | Nada | Topo, barra de abas, FAB |
| Alvo de toque mínimo | 40 px | 44 px | 48 px |
| Rolagem horizontal da página | Nunca | Nunca (só a faixa de segmentos/abas) | Nunca |
| Primeira dobra | Números, estoque e OP visíveis em 1440 × 900 | Números e estoque | Estoque e números |

### 8.2 Tablet deitado 1280 × 800 e tablet em pé 800 × 1280
- 1280 de largura usa o arranjo **PC** (duas colunas, kanban, painel lateral de 480 px). As colunas do kanban ficam com cerca de 240 px. Não há quadro para conferir.
- 800 de largura usa o arranjo **tablet** (igual ao quadro de 820).
- Alvos de 40 px do arranjo PC ficam abaixo dos 44 px pedidos para toque se o 1280 for usado com o dedo; ponto a decidir (seção 10).

### 8.3 Sistema visual usado
- Fundo #0A0E15, card #111824, navegação #0D121B, selecionado #16223A, borda #26334A, trilho #1C2738; texto #EEF2F8 / #CBD5E1 / #A3B0C2.
- Ação #2563EB; boa #22C55E; lilás #C4B5FD para estoque e pacotes (cor de Teste & Embalagem); âmbar #FCD34D para ajuste e "abaixo do mínimo".
- Fontes Barlow (texto) e Barlow Semi Condensed 800 (números e títulos); raios 10 a 18 px; texto nunca abaixo de 14 px; `font-variant-numeric: tabular-nums`.
- Acessibilidade: `aria-label` descritivo em colunas e cards, `role="dialog" aria-modal`, `aria-pressed` / `aria-selected` / `aria-expanded`, foco visível de 3 px #BFDBFE, `prefers-reduced-motion`.

---

## 9. Fase futura, desabilitado, `[ ]` ou placeholder

- **Reservado** (número do topo e faixa "reservado [ ]" da coluna de nível).
- **Mínimo** por medida ("mínimo [ ]") e a situação "abaixo do mínimo".
- **Expedido no mês** (`[ ]`).
- Estoque de **2 m, 4 m e 5 m** (`[ ]`, "sem dados"): hoje só 3 m é contado (na tela do operador o estoque só soma quando a medida é 3 m).
- Movimentações de **Reserva**, **Expedição** e **Ajuste**: linhas-modelo com `[data]`, `[medida]`, `[ ]`, "[quem] · [motivo]".
- Data de criação da OP (`[data]`) e data da expedição (`[data]`).
- Botões sem lógica: "Nova OP", "Editar", "Registrar expedição", "Definir mínimos", "Ajustar estoque", "Baixar …" (Exportar).
- Prévia do relatório "Pacotes e estoque" no Exportar (não tem layout próprio).
- "Meta por tamanho · opcional" e "Enviar todo dia 1º por e-mail para o RH" (painéis).

---

## 10. Divergências entre o briefing (versão anterior) e o protótipo

| Assunto | Briefing | Protótipo (vale este) |
|---|---|---|
| Nome do pedido | "Ordem de serviço", "OS-00015", "+ Nova OS", "nenhuma OS aberta" | "Ordem de produção", "OP-00015", "Nova OP", "nenhuma OP aberta" (o prop e os arquivos ainda se chamam `os` / `-OS`) |
| Abas do RH | 3 (Agora, Desempenho, Pedidos e estoque) | 4 (entra **Pausas**) |
| Busca | No cabeçalho da tela | No cabeçalho do bloco Ordens de produção |
| Abas de OP | Por estado | Por estado + "Todas" (inicial) |
| Ordem no tablet | Colunas de nível no topo | Números primeiro, depois estoque |
| Ordem no celular | Destaque, depois números | Confere: estoque antes dos números |
| Placas por pacote | "Um pacote = 10 placas"; detalhe "10 placas por pacote = 1.000 placas" | "10 placas por padrão; o operador ajusta"; detalhe "1.000 placas" como soma das placas de cada pacote |
| Hub antigo | "Tempo real, histórico, metas, OS e estoque" | — |

---

## 11. Dúvidas reais para quem vai escrever os cards

1. **Ciclo de vida da OP**: o que move Aberta → Em produção → Concluída? "Concluída" é ter todos os pacotes atendidos ou ter sido expedida? (o exemplo está Concluída com expedição "não registrada").
2. **"Pacotes atendidos"**: conta pacotes do estoque reservados para a OP ou pacotes produzidos depois que a OP foi criada?
3. **Reserva**: é automática ao criar a OP (se houver estoque), manual, ou parcial? O que acontece se não houver estoque suficiente?
4. **Disponível × reservado**: disponível = total − reservado? A coluna de nível empilha os dois?
5. **Expedição**: pode ser parcial (várias saídas por OP)? Precisa de data, responsável, nota/observação? Pode ser desfeita?
6. **Formulário "Nova OP" / "Editar"**: quais campos (cliente, medida, quantidade em pacotes ou em placas, data de entrega, observação)? Uma OP pode ter mais de uma medida? Pode cancelar/excluir OP?
7. **Cliente**: cadastro próprio ou texto livre? "Sem cliente" é permitido sempre?
8. **Numeração**: OP-00015 é sequencial automática? Continua de onde o sistema antigo parou?
9. **Definir mínimos**: um valor por medida, em pacotes? Gera alerta em outra tela (Agora)?
10. **Ajustar estoque**: campos (medida, quantidade +/−, motivo obrigatório)? Quem pode? Motivos de lista fixa?
11. **Estoque das outras medidas**: 2, 4 e 5 m passam a ser contadas desde o primeiro dia? Há saldo inicial a carregar por medida (os 384 de 3 m vêm de onde)?
12. **Disponível com filtro "Todas"**: o protótipo mostra 3 m; o certo é a soma de todas as medidas?
13. **Placas do estoque**: usar a soma real das placas de cada pacote (pacotes fora do padrão) em vez de pacotes × 10?
14. **Pacotes por dia**: a janela é "últimos 7 dias corridos" ou "últimos N dias com produção"? A média ignora dias sem embalagem? Deve reagir ao filtro de medida?
15. **Movimentações**: entradas agrupadas por dia (como no exemplo) ou uma linha por pacote? Paginação quando forem centenas? O "−1 pacote" do operador aparece como movimentação?
16. **Contagens do kanban e das abas** devem refletir busca e filtro?
17. **Muitas OP**: rolagem dentro da coluna, paginação, ou esconder concluídas antigas?
18. **Atualização**: a tela atualiza sozinha (tempo real / intervalo) ou só ao abrir? O chip "ter 10/11 · 09:45" é a hora do último dado.
19. **Permissão**: quem vê e quem altera (RH, admin)? Operador enxerga?
20. **Sem conexão / erro / carregando**: não desenhados para as telas de RH; seguir o padrão das telas do operador?
21. **Tablet deitado (1280 e 1180)**: aceitar o arranjo PC em 1280 com alvos de 40 px, ou subir o corte do arranjo tablet / aumentar os alvos?
22. **Exportar "Pacotes e estoque"**: qual o conteúdo do relatório (entradas, reservas por OP, expedições)?
23. **OP atrasada**: destacar entrega vencida ou próxima? Ordenação dos cards (por entrega, por número)?
24. **URL do detalhe**: o detalhe da OP deve ter endereço próprio (link compartilhável e botão voltar do navegador)?
