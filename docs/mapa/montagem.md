# Mapa do protótipo · Montagem · operador (raias por operadora, aviso de parada)

Chave da família: `montagem`

Arquivos lidos (pasta `artifact-files/9bd8db24-.../project/`):

| Quadro | Tamanho no canvas | Props do componente | Observação |
|---|---|---|---|
| `Tela-Montagem-PC` | 1440×900 (`expand: fill`) | `largura: "pc"`, `estado: ""` | estado normal |
| `Tela-Montagem-TabletH` | 1280×800 | `largura: "h"`, `estado: ""` | estado normal; aparelho do operador |
| `Tela-Montagem-TabletH-Pausa` | 1280×800 | `largura: "h"`, `estado: "pausa"` | abre com o aviso amarelo de parada |
| `Tela-Montagem-TabletV` | 800×1280 | `largura: "v"`, `estado: ""` | estado normal |
| `Tela-Montagem-TabletV-Pausa` | 800×1280 | `largura: "v"`, `estado: "pausa"` | abre com o aviso amarelo de parada |
| `Tela-Montagem-Celular` | 390×1760 | `largura: "cel"`, `estado: ""` | estado normal (página longa, rola) |
| `Montagem` (versão anterior) | 1280×800 (`expand: fill`) | nenhuma | só tablet; sem fluxo de motivo de pausa |

Os seis quadros `Tela-Montagem-*` são **byte a byte o mesmo componente**: o `diff` só acusa a linha do `<title>` e a linha das props (`largura`, `estado`, `$preview`). Marcação, CSS e lógica são idênticos.

Não existe quadro "PC · pausa" nem "Celular · pausa", mas o CSS do aviso cobre essas larguras (ver seção 8).

Nenhum dos arquivos contém texto com instruções para quem lê; é só marcação, CSS e lógica de exemplo.

---

## 1. Propósito e quem usa

Tela de contagem do setor **Montagem**, usada pelo **operador no tablet do setor** (tablet horizontal 1280×800 é o aparelho de referência). Mostra o total de placas montadas no dia contra a meta e uma **raia por operadora**, com as mesas que ela ocupa; em cada mesa há `−1` e `+1` para corrigir/somar placas na mão. A contagem "oficial" de uma mesa pode vir de um **botão físico (ESP32)** vinculado à mesa — a tela mostra o horário do último "pulso" e marca `· botão` nas mesas que têm botão.

A mesma tela leva o fluxo de **pausa do setor**: botão `Pausar`/`Retomar` no cabeçalho, faixa amarela enquanto pausado e um **aviso amarelo automático** quando o setor fica X minutos sem contar e ninguém apertou Pausar.

Quem mais lê os dados gravados aqui: RH (Agora, Pausas, Desempenho "Montagem por operadora"), Histórico da Montagem, tela Setores.

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.mt-head`, min-height 68 px, borda inferior)

Lado esquerdo (`.mt-hl`):
- Botão voltar (seta, 48×48, `aria-label="Voltar para Setores"`).
- Rótulo do setor `MONTAGEM` com quadradinho teal (14 px, maiúsculas, espaçado) e, embaixo, a data `Terça, 10/11` (26 px, Barlow Semi Condensed).
- Pílula de status (`.mt-pill`, 16 px, bolinha + texto), três variantes:
  - verde `Em produção · 2h 21min` (cor `#86EFAC`, fundo `#0F2A1B`, borda `#1F6B3D`);
  - âmbar `Parada · sem motivo` (enquanto o aviso automático está aberto);
  - âmbar `Pausado · {motivo}` (cor `#FCD34D`, fundo `#2A1F07`, borda `#7A5A12`).

Lado direito (`.mt-hr`):
- Botão `Pausar` (vira `Retomar` quando pausado), 48 px de altura.
- Link `Histórico` (mesmo estilo de botão, 48 px).
- Relógio `09:21` (28 px).
- Logo AquaPulse 44×44 (só a partir de 1280 px de largura).

### 2.2 Faixa de pausa (`.pz-banda`, só quando pausado)

Faixa amarela escura logo abaixo do cabeçalho, `role="status"`:
- ícone de pausa (40×40, fundo `#F59E0B`);
- título `Pausado · {motivo}` (18 px, branco);
- subtítulo `desde {hora} · o RH vê este motivo em Pausas` (15 px);
- botão `Retomar` (52 px de altura, fundo `#F59E0B`, 22 px).

### 2.3 Painel "Hoje" (`.mt-hoje`, `aria-label="Hoje"`, fundo teal escuro `#0E2A26`)

- Legenda `PLACAS MONTADAS HOJE`.
- **Anel da meta**: `conic-gradient` teal proporcional ao total; dentro, o total do dia (exemplo `127`, 88 px) e `de 270 · 47%`. `aria-label="{pct}% da meta de 270 placas"`.
- Linha `Faltam 143 para a meta` (22 px, `aria-live="polite"`), ou `Meta batida` quando total ≥ meta.
- Grade 2×2 de indicadores (`.mt-stat`, min-height 64 px, valor em 24 px):
  - `Ritmo` → `54/h`
  - `Bate a meta` → `12:00` (previsão), `batida` ou `—`
  - `Último pulso` → `09:17:24` (com segundos)
  - `Área total` → `175 m²`
- Botão tracejado `Fechar dia… (segurar 2 s)` (min-height 48 px). **Sem ação no protótipo** (ver seção 9).

### 2.4 Operadoras (`.mt-ops`, `aria-label="Operadoras"`)

Uma **raia** (`article.mt-lane`) por operadora que tem pelo menos uma mesa ativa, **ordenadas por quantidade do dia, da maior para a menor**. Cada raia tem três zonas:

1. **Quem** (`.mt-who`): avatar redondo com a inicial (56 px), nome (26 px, corta com reticências) e `Mesa 3` ou `Mesas 1 e 2`.
2. **Mesas** (`.mt-mesas`): um cartão por mesa da operadora, lado a lado em colunas iguais. Em cada cartão:
   - topo: `Mesa {n}` e etiqueta da medida (`2 m`, `3 m`…);
   - passo: botão `−1`, quantidade da mesa (46 px), botão `+1` (botões 60×56 px);
   - rodapé: `pulso 09:17` e, se a mesa tem botão físico, `pulso 09:17 · botão`.
3. **Total da operadora** (`.mt-tot`): número grande teal (64 px), `41% do dia · 22/h`, barra de participação (8 px de altura, largura = % do dia) e link `Corrigir quantidade`.

Dados de exemplo:

| Operadora | Mesas | Medida | Qtd mesa | Total | % do dia | Ritmo | Último pulso | Botão |
|---|---|---|---|---|---|---|---|---|
| Helena | 1 e 2 | 2 m / 3 m | 31 / 21 | 52 | 41% | 22/h | 09:17 / 07:51 | mesa 1 sim |
| Maiara | 3 | 3 m | 44 | 44 | 35% | 19/h | 09:17 | não |
| Maria | 4 | 3 m | 31 | 31 | 24% | 13/h | 09:14 | não |
| — | 5 e 6 | — | 0 | — | — | — | — | sem operadora |

### 2.5 Rodapé da lista (`.mt-foot`)

- Link-botão `Painel de mesas e operadoras` (48 px).
- Pílula âmbar de aviso, só quando há mesa sem operadora ou sem medida: `Mesas 5 e 6 sem operadora · configurar` (singular: `Mesa 5 sem operadora · configurar`), min-height 44 px.

### 2.6 Aviso amarelo de pausa (`.pz-veu` + `section.pz`, `role="dialog"`, `aria-modal="true"`)

Sobreposição com véu escuro (`rgba(5,8,13,.74)`), caixa âmbar. Estrutura:

- **Cabeçalho âmbar** (`#F59E0B`): ícone (triângulo de alerta no automático; barras de pausa no manual), título e subtítulo.
  - automático: título `A Montagem está parada há 18 min`; subtítulo `Nada registrado desde 09:03 (o aviso vem depois de 15 min sem contar). Diga o motivo para o RH.`
  - manual: título `Pausar a Montagem`; subtítulo `A pausa começa agora, às 09:21. Escolha o motivo.`
- **Corpo rolável**:
  - `1. POR QUE PAROU?` — 7 categorias com ícone: `Manutenção`, `Falta de material`, `Troca de medida`, `Refeição`, `Energia, ar ou água`, `Pessoas`, `Outro`.
  - `2. {pergunta da categoria}` — motivos da categoria (só aparece se a categoria tem motivos):
    - Manutenção → `2. QUAL MANUTENÇÃO?`: `Bancada / mesa`, `Botão ESP32`, `Ferramenta`, `Elétrica`
    - Falta de material → `2. FALTOU O QUÊ?`: `Placas da Injetora`, `Componentes`, `Insumos`
    - Troca de medida → `2. QUE TIPO DE TROCA?`: `Troca de medida`, `Organização da bancada`
    - Refeição → `2. QUAL REFEIÇÃO?`: `Almoço`, `Café`
    - Energia, ar ou água → `2. O QUE FALTOU?`: `Queda de energia`, `Falta de ar comprimido`, `Falta de água`
    - Pessoas → `2. O QUE ACONTECEU?`: `Operador ausente`, `Reunião`, `Treinamento`
    - Outro → sem lista de motivos
  - Campo de texto (`textarea`, 2 linhas): rótulo `3. DESCRIÇÃO · OPCIONAL` (ou `2. O QUE ACONTECEU? · OPCIONAL` quando a categoria é `Outro`); placeholder `Ex.: esperando placas de 3 m da Injetora`.
- **Rodapé fixo**: resumo à esquerda (`aria-live`), botão secundário e botão principal.
  - resumo: `Escolha por que parou` → `Falta escolher: faltou o quê` → `Vai registrar: Falta de material › Placas da Injetora`
  - secundário: `Não parou` (automático) ou `Cancelar` (manual)
  - principal: `Registrar pausa` (desabilitado até a escolha estar completa)

---

## 3. Ações e o que a lógica faz

| Ação | Onde | Efeito na lógica do protótipo |
|---|---|---|
| Tocar `+1` numa mesa | cartão da mesa | soma 1 em `qtd[mesa]`; atualiza `Último pulso` para a hora atual com segundos. Sem confirmação. `aria-label="Somar uma placa na mesa {n}, de {nome}"`. |
| Tocar `−1` numa mesa | cartão da mesa | subtrai 1; **não deixa passar de 0** (se `qtd < 1` não faz nada, e o botão aparece com opacidade 0,4 — mas não fica `disabled`). Não altera `Último pulso`. Sem confirmação e sem desfazer. `aria-label="Tirar uma placa da mesa {n}, de {nome}"`. |
| Tocar `Pausar` (não pausado) | cabeçalho | abre o aviso no modo **manual**, com categoria/motivo/descrição zerados. |
| Tocar `Retomar` (pausado) | cabeçalho ou faixa amarela | encerra a pausa na hora, **sem confirmação**: `pausado=false`, limpa motivo e início. A faixa some e a pílula volta a verde. |
| Escolher categoria | aviso | marca a categoria (`aria-pressed`) e **zera o motivo** escolhido antes. |
| Escolher motivo | aviso | marca o motivo. |
| Digitar descrição | aviso | guarda o texto no estado; é opcional em todos os casos (inclusive `Outro`). |
| `Registrar pausa` | aviso | só age se a escolha está completa. Fecha o aviso, `pausado=true`, `motivo = motivo escolhido` (ou o nome da categoria quando ela não tem motivos), `inicio = "desde"` no automático (retroativo ao último registro, ex. 09:03) ou `agora` no manual (09:21). |
| `Não parou` (automático) / `Cancelar` (manual) | aviso | fecha o aviso e limpa a escolha; não registra nada. |
| `Fechar dia… (segurar 2 s)` | painel Hoje | **nenhuma** (botão sem `onClick`). |
| Voltar (seta) | cabeçalho | vai para Setores. |
| `Histórico` | cabeçalho | vai para o histórico da Montagem. |
| `Corrigir quantidade` | total da operadora | vai para o painel de Mesas. |
| `Painel de mesas e operadoras` | rodapé | vai para o painel de Mesas. |
| Pílula `Mesas 5 e 6 sem operadora · configurar` | rodapé | vai para o painel de Mesas. |

Regra de "escolha completa" (`pronto`): tem categoria **e** (a categoria não tem lista de motivos **ou** um motivo foi escolhido). Ou seja, `Outro` libera o botão só com a categoria.

Retorno tátil/visual dos botões: `:active` encolhe para 0,97 e escurece; `:hover` clareia; `focus-visible` com contorno de 3 px (`#99F6E4` na tela, branco no aviso). `prefers-reduced-motion` desliga a animação.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal / em produção | pílula verde `Em produção · 2h 21min`; botão `Pausar`; sem faixa. |
| Aviso automático aberto | quadros `*-Pausa` (`estado: "pausa"`). Modal aberto, pílula âmbar `Parada · sem motivo`; vem **pré-selecionado** `Falta de material › Placas da Injetora` (dado de exemplo), então `Registrar pausa` já está habilitado e o resumo diz `Vai registrar: Falta de material › Placas da Injetora`. |
| Aviso manual aberto | depois de tocar `Pausar`. Mesmo modal, título `Pausar a Montagem`, nada pré-selecionado, `Registrar pausa` desabilitado, pílula continua verde. |
| Pausado | faixa amarela `Pausado · {motivo}` + `desde {hora}`; pílula âmbar `Pausado · {motivo}`; botão do cabeçalho vira `Retomar`. Os `+1`/`−1` **continuam funcionando** no protótipo. |
| Meta batida | `Meta batida` no lugar de "Faltam…"; indicador `Bate a meta` = `batida`; anel cheio (limitado a 360°); o percentual pode passar de 100%. |
| Zero placas | `Bate a meta` = `—`; `Ritmo` = `0/h`; `% do dia` = 0 para todas; `−1` esmaecido. |
| Mesa sem operadora/medida | a mesa **não aparece** em nenhuma raia e não soma no total; aparece só na pílula âmbar do rodapé. |
| Operadora com 2+ mesas | uma raia só, com um cartão por mesa (lado a lado; empilhados no celular). |
| Nenhuma mesa configurada | não desenhado: a lista ficaria vazia, só com o rodapé. Falta estado vazio. |
| Erro / sem conexão / carregando | **não existem no protótipo** (ver dúvidas). |

---

## 5. Regras de negócio e contas

| Regra | Valor de exemplo | Configurável? |
|---|---|---|
| Meta diária da Montagem | `270` placas/dia (fixo na marcação e na lógica) | Sim, pelo RH: o painel do RH mostra "Meta de Montagem: 270 por dia. Abrir metas" (`RH2-Painel-Metas`). |
| Total do dia | soma das quantidades das **mesas ativas** (mesa com operadora **e** medida) = 31+21+44+31 = `127` | — |
| % da meta | `round(total / meta × 100)` = 47% | — |
| Ângulo do anel | `min(360, round(total / meta × 360))` | — |
| Faltam | `meta − total` = 143; se total ≥ meta, `Meta batida` | — |
| Horas trabalhadas | `2h 21min` fixo no exemplo (mesmo texto da pílula) | deveria ser tempo desde o início do turno/primeiro pulso; não está definido se desconta pausas |
| Ritmo do setor | `round(total / horas)` = 54/h | — |
| Bate a meta (previsão) | `agora + (meta − total) / (total / horas)` em minutos → `12:00`; `—` se total = 0; `batida` se total ≥ meta; hora com módulo 24 | — |
| Área por medida | 2 m → 1 m²; 3 m → 1,5 m²; 4 m → 2 m²; 5 m → 2,5 m² (0,5 m² por metro) | tabela de medidas; parece cadastro |
| Área total | `Σ (qtd da mesa × área da medida da mesa)` = 31×1 + 21×1,5 + 44×1,5 + 31×1,5 = `175 m²` | — |
| Total da operadora | soma das mesas dela | — |
| % do dia da operadora | `round(total da operadora / total do setor × 100)`; 0 se total = 0 | — |
| Ritmo da operadora | `round(total da operadora / horas)` (mesmas horas do setor) | — |
| Ordem das raias | por total do dia, decrescente (reordena ao vivo conforme os +1) | — |
| Piso do `−1` | quantidade da mesa nunca fica negativa | — |
| Último pulso (setor) | hora com segundos do último `+1`; `−1` não mexe | — |
| Último pulso (mesa) | hora:minuto por mesa, com `· botão` quando a mesa tem botão ESP32 (no exemplo é estático, não atualiza com `+1`) | — |
| Aviso de parada | Montagem: **15 min** sem contar e sem pausa aberta (Injetora 10, Teste & Embalagem 15) | Sim: RH › Pausas › "Motivos e regras" ("Minutos sem contar em {setor}"). |
| Início da pausa automática | retroativo ao último registro (`desde 09:03`), não à hora da resposta | — |
| Início da pausa manual | hora em que o operador apertou `Pausar` | — |
| Motivo gravado | texto do motivo, ou nome da categoria quando não há motivos (`Outro`) | — |
| Categoria planejada | `Refeição` tem `plan: true`: não conta como parada. No RH, "Soma das paradas não planejadas: tudo menos refeição. Inclui as paradas sem motivo." | catálogo é do RH |
| Catálogo de motivos | 7 categorias fixas; motivos de Manutenção, Falta de material e Troca de medida são **por setor**; Refeição, Energia/ar/água, Pessoas e Outro são comuns aos 3 setores | Sim: "os mesmos no tablet e no RH › Pausas › Motivos e regras" |
| Cor da categoria no RH | Manutenção `#F87171`, Falta de material `#FB923C`, Troca de medida `#E879F9`, Refeição `#64748B`, Energia/ar/água `#FACC15`, Pessoas `#A3E635`, Outro `#94A3B8` | usado só nas telas de RH |
| Mesas | 6 mesas no exemplo; cada mesa tem 0 ou 1 operadora e 0 ou 1 medida; uma operadora pode ter várias mesas | cadastro no painel de Mesas |
| Mesa sem configuração | "os apertos delas não contam até configurar" (texto do painel de Mesas) | — |

---

## 6. Entidades e eventos implícitos

**Entidades**

- **Setor**: id (`mon`), nome, meta diária (270), minutos até avisar parada (15).
- **Mesa** (da Montagem): número (1–6), operadora atual (opcional), medida atual (opcional), botão ESP32 vinculado (sim/não, porta/token), horário do último pulso, origem do último pulso.
- **Operadora**: nome (a inicial vira avatar), mesas que ocupa hoje.
- **Medida / tamanho de placa**: comprimento (2, 3, 4, 5 m), área em m² (1 / 1,5 / 2 / 2,5).
- **Pulso / contagem** (evento): mesa, operadora e medida vigentes no momento, data-hora com segundos, delta (+1 / −1), origem (botão ESP32 ou toque no tablet), tablet/usuário que registrou.
- **Dia de produção / turno**: data, setor, hora de início (para "Em produção · 2h 21min"), fechado sim/não, hora do fechamento.
- **Pausa**: setor, início, fim, origem (aviso automático ou botão `Pausar`), categoria, motivo, descrição livre, planejada sim/não (derivado da categoria), quem registrou; estado "sem motivo" quando o aviso não foi respondido.
- **Categoria de pausa**: id, nome, pergunta do 2º passo, cor, planejada, ícone.
- **Motivo de pausa**: categoria, setor (ou "todos"), nome, ordem.

**Eventos que a tela grava**

1. `+1` na mesa (pulso manual pelo tablet).
2. `−1` na mesa (correção).
3. Pausa iniciada manualmente (com categoria, motivo, descrição, início = agora).
4. Pausa classificada a partir do aviso automático (início retroativo ao último registro).
5. Aviso dispensado com `Não parou` (o protótipo não grava nada; ver dúvidas).
6. Pausa encerrada (`Retomar`).
7. Fechamento do dia (botão ainda sem lógica).

**O que a tela lê**: meta e limite de minutos do setor, mesas com operadora/medida/botão, contagens do dia por mesa, hora do último pulso (setor e mesa), pausa em aberto, catálogo de categorias e motivos, relógio do servidor.

---

## 7. Navegação

O sufixo do destino segue a prop `largura` (`-PC`, `-TabletH`, `-TabletV`, `-Celular`); no sistema real é uma rota só.

| Elemento | Destino no protótipo | Rota real provável |
|---|---|---|
| Seta voltar | `Tela-Setores{suf}` | lista de setores da fábrica |
| `Histórico` | `Tela-HistMontagem{suf}` | histórico da Montagem |
| `Corrigir quantidade` | `Tela-Mesas{suf}` | painel de mesas e operadoras |
| `Painel de mesas e operadoras` | `Tela-Mesas{suf}` | idem |
| Pílula `Mesas … sem operadora · configurar` | `Tela-Mesas{suf}` | idem |

A tela de Mesas volta para cá (`hMontagem`). A lógica também calcula um sufixo de RH (`rh`), mas não usa: **não há link para o RH nesta tela**.

---

## 8. Responsividade

### 8.1 Mecanismo

- **Só CSS, com media queries de `max-width`** em três cortes: `1279px`, `959px` e `719px`. Não há container query nem troca de componente.
- A prop `largura` (`pc` / `h` / `v` / `cel`) **não muda o arranjo**: serve apenas para montar o sufixo dos links. A prop `estado: "pausa"` só abre o aviso.
- Consequência: são 4 faixas reais de arranjo.
  - **≥ 1280 px** — PC 1440 e tablet horizontal 1280 (mesmo arranjo; só sobra mais largura para as raias).
  - **960–1279 px** — faixa intermediária, **sem quadro desenhado** (é onde caem os iPads deitados: 1024, 1080, 1180, 1194).
  - **720–959 px** — tablet vertical 800.
  - **≤ 719 px** — celular 390.
- A página inteira rola (`.mt{min-height:100vh}`); **nada é fixo ou sticky** na tela principal. Só o aviso de pausa é `position: fixed`.

### 8.2 Tabela parâmetro × largura — tela principal

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | (960–1279, sem quadro) | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|---|
| Arranjo geral (`.mt-main`) | 2 colunas: Hoje 340 px fixo + raias | igual ao PC | 1 coluna: Hoje em cima, raias embaixo | 1 coluna: Hoje em cima, raias embaixo | 1 coluna |
| Padding da área principal | 16 px / 24 px, gap 16 | igual | igual | igual | 12 px, gap 12 |
| Cabeçalho | 1 linha, 68 px, padding 0 24 | igual | pode quebrar (`flex-wrap`), padding vertical 10 | idem, lado direito encostado à direita | 2 linhas: (voltar + setor/data + pílula à direita) e (Pausar + Histórico dividindo a largura + relógio); padding 10/12 |
| Logo AquaPulse | visível, 44 px | visível | oculto | oculto | oculto |
| Botões do cabeçalho (`Pausar`, `Histórico`) | 48 px alt., padding 0 20, 17 px | igual | 48 px, padding 0 16 | 48 px, padding 0 16 | 48 px, `flex:1` (dividem a linha) |
| Botão voltar | 48×48 | 48×48 | 48×48 | 48×48 | 48×48 |
| Data / relógio | 26 px / 28 px | igual | igual | igual | igual |
| Pílula de status | 16 px, ao lado da data | igual | igual | igual | empurrada para a direita da 1ª linha |
| Painel Hoje — forma | coluna de 340 px, itens centralizados | igual | faixa horizontal em grade: `cap fd` / `ring falta` / `ring stats` | igual à faixa intermediária | 1 coluna centralizada: legenda, anel, falta, indicadores, fechar dia |
| Anel da meta | 236 px, miolo recuado 18 | igual | 180 px, miolo recuado 14 | 180 px | 180 px |
| Número do total | 88 px | 88 px | 64 px | 64 px | 64 px |
| "Faltam N para a meta" | 22 px, abaixo do anel | igual | à direita do anel, em cima | idem | abaixo do anel |
| Indicadores | grade 2×2 abaixo | igual | grade 2×2 à direita do anel | idem | grade 2×2, largura total |
| `Fechar dia…` | base do painel (margin-top auto), largura total, 48 px | igual | canto superior direito, na linha da legenda | idem | última linha, largura total |
| Raia — colunas | 3 zonas: `quem 190px | mesas 1fr | total 168px` | igual | igual (3 zonas) | 2 linhas: `quem + total` em cima, `mesas` embaixo na largura toda | 2 linhas, igual ao tablet V |
| Raia — altura | `flex:1`, min 150 px (as raias esticam para encher a tela) | igual (≈205 px com 3 raias) | altura do conteúdo (`flex:none`), min 150 | altura do conteúdo | altura do conteúdo |
| Raia — padding / gap | 14×20, gap 18 | igual | igual | 14×16, gap 12 | 14, gap 12 |
| Avatar / nome | 56 px / 26 px | igual | igual | igual | 48 px / 22 px |
| Mesas dentro da raia | lado a lado, colunas iguais | igual | igual | lado a lado | **empilhadas** (uma por linha) |
| Botões `−1` / `+1` | 60×56 px, 24 px | igual | igual | igual | igual |
| Quantidade da mesa | 46 px | igual | igual | igual | igual |
| Total da operadora | 64 px, alinhado à direita, com % e barra abaixo | igual | igual | 52 px; número à esquerda, `% · ritmo` e barra (150 px) à direita | 48 px; coluna alinhada à direita, barra 120 px |
| `Corrigir quantidade` | visível (alvo 44 px) | visível | visível | **oculto** | **oculto** |
| Rodapé da lista | botão à esquerda, aviso à direita | igual | igual | igual (quebra se faltar espaço) | cada link ocupa a largura toda, centralizado |
| Rolagem | página; com 3 raias cabe em 900 | página; com 3 raias cabe em 800 | página | página (cabe em 1280 com 3 raias) | página longa (quadro de 1760 px) |
| Fixos | nenhum | nenhum | nenhum | nenhum | nenhum |

### 8.3 Tabela parâmetro × largura — faixa de pausa e aviso amarelo

| Parâmetro | PC 1440 / Tablet H 1280 | 720–1279 (Tablet V 800 e iPads deitados) | Celular 390 |
|---|---|---|---|
| Faixa `Pausado · …` | 1 linha, padding 10/24; `Retomar` 52 px à direita | igual | quebra; padding 10/12; `Retomar` na linha de baixo, largura total |
| Forma do aviso | modal central, `max-width` 1040 px, véu com 24 px de folga, cantos 22 px, borda 2 px | modal central, `max-width` 760 px | **tela cheia** (sem folga, sem cantos, sem borda) |
| Cabeçalho do aviso | padding 18/24; ícone 52 px; título 32 px; subtítulo 17 px | igual | padding 14/16; ícone 44 px; título 24 px; subtítulo 15 px |
| Categorias | 7 colunas (uma linha), ícone em cima do texto, min 96 px de altura, 17 px | 4 colunas (2 linhas), min 96 px | 2 colunas, ícone ao lado do texto, min 64 px, 16 px |
| Motivos | 4 colunas, min 60 px, 18 px | 2 colunas, min 60 px | 1 coluna, min 56 px, alinhado à esquerda, 17 px |
| Descrição | textarea min 72 px, 18 px | igual | igual |
| Rodapé do aviso | resumo à esquerda + `Não parou`/`Cancelar` + `Registrar pausa`, ambos com 64 px de altura | igual | resumo numa linha própria; os dois botões dividem a linha de baixo meio a meio (64 px) |
| Botão principal | 24 px, padding 0 32 | igual | 21 px, padding 0 12 |
| Rolagem | só o corpo do aviso rola; cabeçalho e rodapé do aviso ficam fixos | igual | igual |

### 8.4 Alvos de toque (todas as larguras)

Voltar 48×48 · botões do cabeçalho 48 · `−1`/`+1` 60×56 · `Fechar dia…` ≥48 · `Corrigir quantidade` ≥44 · pílula de aviso ≥44 · link do rodapé 48 · `Retomar` da faixa 52 · categoria 96 (64 no celular) · motivo 60 (56 no celular) · botões do aviso 64.

### 8.5 Tipografia e cores

- Fontes: `Barlow` (texto, 400–700) e `Barlow Semi Condensed` (números e botões fortes, 600–800), com `tabular-nums`.
- Fundo `#0A0E15`; texto `#EEF2F8`; cartões `#111824` / borda `#26334A`; teal do setor `#2DD4BF` / `#5EEAD4` / `#99F6E4`; painel Hoje `#0E2A26`; âmbar de pausa `#F59E0B` / `#FCD34D` / `#2A1F07`; link azul `#93C5FD`.

---

## 9. Fase futura, desabilitado ou placeholder

- `Fechar dia… (segurar 2 s)`: botão sem ação; o gesto "segurar 2 s" está só no rótulo.
- Data `Terça, 10/11`, relógio `09:21` e `Em produção · 2h 21min` são fixos.
- Meta `270` fixa na marcação (`de 270`) e na lógica.
- `pulso HH:MM` por mesa e a marca `· botão` são dados estáticos; a integração com o botão ESP32 não existe no protótipo.
- A descrição digitada no aviso é **descartada** ao registrar (o estado é limpo); no sistema real precisa ser gravada.
- O aviso automático não dispara por tempo: só existe como estado inicial dos quadros `*-Pausa`.
- `state.pausado` e os primeiros `stTxt`/`pausar` de `renderVals` são restos da versão antiga, sobrescritos por `pausaVals`.
- Variável `rh` (sufixo de telas de RH) calculada e não usada.
- Sem estados de carregando, erro, offline ou fila de sincronização.

---

## 10. Divergências entre a versão anterior (`Montagem.dc.html`) e a nova (`Tela-Montagem-*`)

| Ponto | Versão anterior | Versão nova |
|---|---|---|
| Larguras | só tablet 1280×800 (o CSS já tinha os 3 cortes) | 4 quadros + 2 de aviso |
| Pausar | alternava direto `Pausar`/`Retomar`; pílula `Pausado` sem motivo | abre o aviso com categoria/motivo/descrição; pílula `Pausado · {motivo}`; faixa amarela com `desde {hora}` |
| Aviso automático de parada | não existia | existe (15 min na Montagem) |
| Links | fixos (`Setores`, `Historico-Montagem`, `Mesas`) | com sufixo pela prop `largura` |
| Painel Hoje em ≤1279 | `Fechar dia…` na base, largura total | `Fechar dia…` no canto superior direito |
| Total da operadora em ≤959 | coluna alinhada à direita | número ao lado de `% · ritmo` + barra de 150 px (120 px no celular) |
| `Corrigir quantidade` em ≤959 | visível | oculto |
| Botões do cabeçalho em ≤1279 | padding 0 20 | padding 0 16, gaps de 10 |

Contas (meta, ritmo, previsão, área, ordenação, piso do `−1`) são **idênticas** nas duas versões; a versão nova não resumiu nenhuma regra.

---

## 11. Dúvidas reais para quem vai escrever os cards

1. **iPad deitado**: a maioria dos iPads tem menos de 1280 px de largura em paisagem (1024, 1080, 1180, 1194) e cai na faixa 960–1279, que empilha Hoje em cima das raias e não tem quadro desenhado. O arranjo lado a lado deve valer a partir de 1024 px, ou a faixa intermediária é a intenção?
2. **`+1`/`−1` com o setor pausado**: continuam habilitados no protótipo. Um pulso durante a pausa encerra a pausa sozinho, é bloqueado, ou conta e a pausa continua?
3. **`Não parou`**: grava alguma coisa? O aviso volta depois de quanto tempo (soneca), ou só no próximo intervalo de 15 min sem contar?
4. **Aviso sem resposta**: se ninguém responder, a parada fica "sem motivo" para o RH classificar (o RH tem "N sem resposta · classificar"). Quando o operador volta a contar, a parada fecha sozinha?
5. **`Retomar`**: sem confirmação mesmo? Pede quem retomou?
6. **`Fechar dia… (segurar 2 s)`**: o que fecha (bloqueia `+1`, zera contagem, gera relatório/PDF)? Quem pode? Dá para reabrir? O que acontece se ninguém fechar?
7. **Quem aperta `+1`**: o tablet é do setor (um aparelho para todas as operadoras) e não há identificação de quem tocou. Basta registrar o tablet/sessão?
8. **`−1`**: precisa de motivo, confirmação ou limite? Fica registrado como evento de correção (auditoria) ou só diminui o total? Pode tirar placa contada pelo botão físico?
9. **`Corrigir quantidade`** leva ao painel de Mesas (que só tem `−1`) e some abaixo de 960 px. Há correção por digitação de número? No tablet vertical e no celular a correção fica só pelo `−1` da raia?
10. **Horas trabalhadas** (`2h 21min`): contam desde quando (início do turno, primeiro pulso, login)? Descontam pausas e refeição? O ritmo por operadora usa as mesmas horas do setor mesmo se ela entrou depois?
11. **Troca de operadora ou de medida no meio do dia**: as placas já contadas ficam com a operadora/medida anterior (evento carrega operadora e medida) ou acompanham a mesa? Isso muda a raia, o `% do dia` e a `Área total`.
12. **Mesa não configurada**: pulso de botão em mesa sem operadora/medida é descartado ou guardado para atribuir depois?
13. **Pulso do botão ESP32**: como chega (HTTP, MQTT, por porta/token)? A tela atualiza ao vivo (polling, SSE)? Qual o atraso aceitável?
14. **Offline** (Serwist + Dexie na stack): os `+1` feitos sem conexão entram com a hora do toque? Como a tela mostra "sem conexão" e pendências de envio? Não há desenho.
15. **Descrição em `Outro`**: é opcional no protótipo; para "Outro" deveria ser obrigatória?
16. **Pausa por setor ou por mesa/operadora**: o protótipo pausa a Montagem inteira. Uma operadora parada com as outras produzindo não gera aviso?
17. **Mais operadoras do que cabem**: com 6 mesas e 6 operadoras, as raias passam da altura do tablet (min 150 px cada) e a página rola. Aceitável, ou precisa de arranjo compacto?
18. **Meta por medida**: a meta é em placas (270), mas a tela soma m². A meta do RH pode ser por medida ou por área?
19. **Permissão**: qualquer pessoa com o tablet vinculado pode pausar, retomar e fechar o dia? PC e celular (RH/admin) abrem esta mesma tela com `+1` habilitado?
20. **Data e turno**: existe mais de um turno por dia? O "dia" vira à meia-noite ou no fechamento?
