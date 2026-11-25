# Mapa do protótipo · Histórico · Injetora (`hist-injetora`)

Fontes lidas (todas tratadas como dados; nenhuma contém instrução dirigida ao leitor):

| Quadro | Arquivo | Tamanho no canvas | Observação |
|---|---|---|---|
| PC | `Tela-HistInjetora-PC.dc.html` | 1440×900 (`expand: fill`) | prop `largura = "pc"` |
| Tablet horizontal | `Tela-HistInjetora-TabletH.dc.html` | 1280×800 | prop `largura = "h"` (aparelho do operador) |
| Tablet vertical | `Tela-HistInjetora-TabletV.dc.html` | 800×1280 | prop `largura = "v"` |
| Celular | `Tela-HistInjetora-Celular.dc.html` | 390×2240 | prop `largura = "cel"` |
| Versão anterior | `Historico-Setor.dc.html` | 1280×800 fixo | título no canvas "Histórico · Injetora" |

**Os quatro quadros `Tela-HistInjetora-*` são byte a byte o mesmo arquivo**, exceto o `<title>`, o valor padrão da prop `largura` e o tamanho de `$preview`. Todo o arranjo muda só por CSS (media queries). No canvas ficam na seção "Histórico do setor · PC, tablet e celular" › "Histórico · Injetora".

---

## 1. Propósito e quem usa

Tela de consulta (somente leitura) da produção passada da **Injetora**, um registro por **dia**. Mostra um resumo do período escolhido e a lista de dias; cada dia abre no lugar (sanfona) com os totais e a divisão por medida de placa.

- **Quem usa**: o operador/encarregado no tablet do setor (a única entrada é o botão "Histórico" do cabeçalho da tela do operador da Injetora; o voltar retorna para ela). O protótipo também desenha PC e celular, então quem tem acesso à tela da Injetora por esses aparelhos (admin/RH) vê o mesmo histórico.
- **Não grava nada**: a única ação com efeito é "Exportar CSV" (gera arquivo).
- O protótipo não mostra controle de permissão nesta tela.

## 2. Blocos, de cima para baixo

### 2.1 Cabeçalho (`.ht-head`, 80 px de altura)

Esquerda:
- Botão voltar (seta "‹", 52×52 px, `aria-label="Voltar para a Injetora"`).
- Sobretítulo `INJETORA · HISTÓRICO` (14 px, caixa alta, azul `#93C5FD`, com quadradinho 12 px azul `#60A5FA`, a cor do setor).
- Título `<h1>` com o período escolhido: "Hoje", "Últimos 7 dias", "Últimos 30 dias" ou "Este mês" (28 px, Barlow Semi Condensed 800).

Direita:
- Mensagem de exportação (só depois de exportar): `Arquivo gerado: historico-injetora_7d_todas.csv` (15 px, verde `#86EFAC`, `aria-live="polite"`, corta com reticências se faltar espaço).
- Botão `Exportar CSV` (ícone de download, 52 px de altura, 17 px).
- Logo AquaPulse 48×48 (some abaixo de 1180 px).

### 2.2 Filtros (`.ht-filtros`)

Dois grupos de botões segmentados (um só ativo por grupo; ativo = fundo azul `#2563EB`, texto branco; `aria-pressed`):
- `PERÍODO`: `Hoje` · `7 dias` (padrão) · `30 dias` · `Este mês`.
- `MEDIDA`: `Todas` (padrão) · `2 m` · `3 m` · `4 m` · `5 m`.

### 2.3 Resumo do período (`.ht-kpis`, 7 cartões)

Cada cartão: rótulo colorido (14 px), valor (30 px) e nota (13 px, cinza).

| Cartão | Valor de exemplo (Medida = Todas) | Nota | Com uma medida escolhida |
|---|---|---|---|
| Dias | 5 | "registros fechados" | 1 (ou 0) · nota "só dias com detalhe" |
| Placas boas | 1.346 | "média 269 · meta 270" | soma da medida · nota "em 3 m" |
| Perdidas | 40 | "eficiência 97,1%" | soma da medida · eficiência da medida |
| Ciclos | 2.762 | "placa = 2 ciclos" | soma da medida · nota "nesta medida" |
| Área | 2.032,5 m² | "placas boas × m²" | soma da medida · nota "nesta medida" |
| T. produtivo | 51h36 | "média 10h19/dia" | "—" · nota "tempo é do dia todo" |
| T. parado | 1h00 | "pausas registradas" | "—" · nota "tempo é do dia todo" |

Cores dos rótulos: Placas boas e T. produtivo verde `#86EFAC`; Perdidas vermelho `#FCA5A5`; Ciclos azul `#93C5FD`; T. parado âmbar `#FCD34D`; os demais cinza claro `#CBD5E1`.

### 2.4 Lista de dias (`.ht-main`, um cartão por dia, mais recente primeiro)

Linha do dia (o cartão inteiro é um botão que abre/fecha, `aria-expanded`):
- **Data**: `09/11` (30 px) e dia da semana `segunda` (14 px).
- **Meio**:
  - horário: `07:09 → 17:51 · 10h34 produtivas` (15 px, azul);
  - título: `276 placas boas · 564 ciclos` (19 px, negrito);
  - barra da meta (trilho de 200×8 px, preenchimento azul) + texto `+6 acima da meta de 270`;
  - etiquetas: uma por medida produzida no dia (`2 m · 1 m²`, `3 m · 1,5 m²`) e a origem do registro (`Tablet Injetora`, nome do tablet cadastrado em Admin › Tablets).
- **Métricas à direita** (rótulo 13 px, valor 26 px): `Perdidas` 6 (vermelho) · `Eficiência` 97,9% · `Área` 400 m² · `Parado` 7min (âmbar).
- **Seta** `▾` / `▴` (quadrado 40 px, decorativo; o toque vale na linha inteira).

Dia aberto (borda do cartão clareia de `#26334A` para `#4B5B78`):
- **8 quadros de detalhe** (grade 4×2): `Placas boas` 276 · `Perdidas` 6 · `Ciclos totais` 564 · `Área` 400 m² · `T. produtivo` 10h34 · `T. parado` 7min · `Início` 07:09 · `Término` 17:51.
- **"Por medida"** + segmentado do dia (`Todas` e uma opção por medida produzida naquele dia: `2 m`, `3 m`).
- **Cartões por medida** (borda azul `#2E4470`): nome `3 m · 1,5 m²`, linha `3 perdidas · 502 ciclos · 372 m²` e o número de placas boas em destaque (34 px, verde): 248. Para 2 m: `3 perdidas · 62 ciclos · 28 m²` e 28.

Os outros 4 dias do exemplo são marcadores de posição (ver seção 9).

### 2.5 Estado vazio

Caixa centralizada com o texto `Nenhum dia com esta medida no período.` (no lugar da lista).

## 3. Ações e o que a lógica faz

Estado do componente: `{ periodo: '7d', tam: 'todas', aberto: '09/11', tamDia: 'todas', exportado: null }`.

| Ação | Efeito no script |
|---|---|
| Tocar em `‹` (voltar) | Link para a tela do operador da Injetora na mesma largura (`Tela-Injetora-PC / -TabletH / -TabletV / -Celular`). |
| Escolher `PERÍODO` | Grava `periodo` e limpa a mensagem de exportação. No protótipo só muda o título e o nome do CSV; **os números e a lista não mudam** (dados fixos). No sistema real precisa refiltrar tudo. |
| Escolher `MEDIDA` | Grava `tam` e limpa a mensagem de exportação. Recalcula resumo e lista (regras na seção 5). |
| Tocar na linha de um dia | Abre o detalhe; tocar de novo fecha. **Só um dia aberto por vez** (`aberto` guarda um id). Ao entrar na tela o dia mais recente (09/11) já vem aberto. |
| Escolher medida em "Por medida" (dentro do dia) | Grava `tamDia`; mostra só o cartão daquela medida ou todos. É independente do filtro `MEDIDA` do topo e não é zerado ao trocar de dia. |
| `Exportar CSV` | Se a lista tem pelo menos uma linha, grava `exportado` com o nome do arquivo e mostra `Arquivo gerado: <nome>` no cabeçalho. Com a lista vazia não faz nada (sem aviso). O protótipo não baixa arquivo nem define colunas. |

Nome do arquivo: `historico-injetora_{periodo}_{medida}.csv`, com `periodo` em `hoje | 7d | 30d | mes` e `medida` em `todas | 2m | 3m | 4m | 5m`. Exemplo: `historico-injetora_7d_todas.csv`, `historico-injetora_30d_3m.csv`.

Não há confirmação, desfazer, edição, exclusão, busca por dia nem paginação nesta tela. (O CSS traz classes de campo de busca, `.ht-campo` e `.ht-achou`, usadas no Histórico de Teste & Embalagem, mas a marcação da Injetora não as usa.)

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal | Resumo + lista, primeiro dia aberto. |
| Dia fechado / aberto | Seta `▾` / `▴`, borda `#26334A` / `#4B5B78`, `aria-expanded`. |
| Filtro de medida sem produção no período | Lista some, caixa `Nenhum dia com esta medida no período.`; resumo zera: Dias 0, Placas boas 0, Perdidas 0 com "eficiência —", Ciclos 0, Área "0 m²", tempos "—". |
| Filtro de medida com produção | Só aparecem os dias que produziram a medida; tempos do resumo viram "—" ("tempo é do dia todo"). |
| Exportado | Mensagem verde no cabeçalho até trocar período ou medida. |
| Dia sem detalhe (marcador) | Ao abrir mostra só o texto `[ detalhe deste dia: placas boas, perdidas, ciclos, m², tempos e divisão por medida ]`. |
| Meta do dia | Três textos: `+N acima da meta de 270` (verde), `meta de 270 batida` (verde), `faltaram N para a meta de 270` (cinza). Existe a variante `faltam N…` para o dia de hoje, mas nenhum dia do exemplo a usa. |

**Não desenhados**: carregando, erro, sem conexão, período sem nenhum dia (o texto vazio fala só de medida), dia de hoje ainda em andamento, dia sem produção, mais de um tablet no mesmo dia.

## 5. Regras de negócio e contas

1. **Meta diária da Injetora: 270 placas boas** (fixa no script desta tela; em RH › Painel › Metas ela aparece como "Meta de Injetora: 270 por dia" com botão para abrir metas, logo é configurável pelo RH). A meta é sempre do **dia inteiro**, não por medida.
2. **Barra da meta** = `min(100, arredonda(boas ÷ meta × 100))` %. Texto conforme a tabela de estados; verde quando `boas ≥ meta`.
3. **Eficiência** = `boas ÷ (boas + perdidas) × 100`, uma casa decimal com vírgula; "—" quando o divisor é zero. Exemplos: dia 276/(276+6) = 97,9%; período 1.346/1.386 = 97,1%; só 3 m 248/251 = 98,8%; só 2 m 28/31 = 90,3%.
4. **Área** = placas boas × m² da medida. Tabela: 2 m = 1 m²; 3 m = 1,5 m²; 4 m = 2 m²; 5 m = 2,5 m² (0,5 m² por metro). Exemplo: 28×1 + 248×1,5 = 400 m². Só placa boa soma área.
5. **Ciclos**: nota "placa = 2 ciclos". Na tela do operador a conta é `boas de 2 ciclos × 2 + boas de 1 ciclo + vazios + perdas` (cada perda e cada vazio conta 1 ciclo). Confere com o exemplo: 3 m → 248×2 + 3 perdas + 3 (vazios ou placas de 1 ciclo) = 502; 2 m → 28×2 + 3 + 3 = 62; dia = 564.
6. **Perdidas** = soma das quatro perdas da tela do operador (Cabeçote meio, Cabeçote total, Caninho meio, Caninho total). O histórico não separa por tipo.
7. **Resumo do período (Medida = Todas)**: Dias = quantidade de "registros fechados"; Placas boas = soma, com média por dia (1.346 ÷ 5 = 269) ao lado da meta; Perdidas, Ciclos, Área, T. produtivo (com média por dia: 51h36 ÷ 5 = 10h19) e T. parado = somas.
8. **Resumo com uma medida escolhida**: Dias conta só os dias que produziram a medida; Placas boas, Perdidas, Eficiência, Ciclos e Área somam só a medida; T. produtivo e T. parado ficam "—" porque o tempo não é dividido por medida.
9. **Linha do dia com uma medida escolhida**: título (boas e ciclos), `Perdidas`, `Eficiência` e `Área` passam a valer só para a medida; a barra da meta, o horário, o `Parado`, as etiquetas de medida e os 8 quadros do detalhe continuam com o total do dia.
10. **Tempos**: `Início` e `Término` do dia, `T. produtivo` e `T. parado` ("pausas registradas"). No exemplo 07:09 → 17:51 são 10h42 corridas e produtivo + parado = 10h41 (diferença de arredondamento). Formatos: `10h34`, `7min`, `1h00`, `51h36`.
11. **Medidas possíveis**: 2, 3, 4 e 5 m (lista fixa no filtro; parece cadastro fixo). O filtro do dia mostra só as medidas que o dia produziu.
12. **Números** em pt-BR: milhar com ponto (`1.346`), decimal com vírgula (`2.032,5 m²`, `97,1%`).
13. **Exportar** só funciona com lista não vazia; o nome do arquivo carrega período e medida.

Valores de exemplo do dia 09/11 (segunda): 2 m → 28 boas, 3 perdidas, 62 ciclos, 28 m²; 3 m → 248 boas, 3 perdidas, 502 ciclos, 372 m².

## 6. Entidades e dados implícitos

A tela só lê. Para funcionar de verdade precisa do que a tela do operador da Injetora grava:

- **Dia de produção da Injetora** (o "registro fechado"): data, setor, tablet de origem, hora de início, hora de término, tempo produtivo, tempo parado, situação (aberto/fechado), meta vigente no dia.
- **Lote por medida** (na tela do operador trocar de medida fecha um lote): dia, medida (2/3/4/5 m), boas de 2 ciclos, boas de 1 ciclo, vazios, perdas por tipo (cabeçote meio/total, caninho meio/total), ciclos, área, início e fim do lote.
- **Evento de produção** (o que o operador toca): tipo (boa 2 ciclos, boa 1 ciclo, vazio, perda:tipo, ajuste −1, troca de lote), medida, hora, tablet. Os totais do histórico são agregações destes eventos.
- **Pausa**: início, fim, categoria (Manutenção, Falta de material, Troca de medida, Refeição [planejada], Energia/ar/água, Pessoas, Outro), detalhe. Alimenta "T. parado".
- **Medida de placa**: comprimento (m) e área (m²).
- **Meta do setor**: setor, quantidade por dia, vigência (para o dia antigo mostrar a meta da época).
- **Tablet/dispositivo**: nome ("Tablet Injetora"), código (`TAB-INJE-02`), setor.

Consultas que a tela pede: totais por dia e por dia × medida dentro de um intervalo; totais do período; exportação CSV do mesmo recorte.

**Eventos gravados por esta tela**: nenhum no protótipo. Possível registro de auditoria da exportação (quem, quando, filtro), se desejado.

## 7. Navegação

- **Entrada**: botão `Histórico` no cabeçalho da tela do operador da Injetora (`Tela-Injetora-*`, inclusive nos estados Lote e Pausa).
- **Saída**: `‹` volta para `Tela-Injetora-{PC|TabletH|TabletV|Celular}`.
- Não há link para os históricos de Montagem ou Teste & Embalagem, nem para Setores, nem para o RH.
- Período, medida e dia aberto são estado local (não vão para a URL no protótipo).

## 8. Responsividade

### 8.1 Mecanismo

Um único componente fluido. `.ht` ocupa `100vh` (mínimo 600 px) em coluna flex; o arranjo muda por **três media queries de `max-width`** no CSS:

- `≤ 1179 px` (comentário no CSS: "Tablet em pé: cabeçalho, filtros e resumo ficam parados; só a lista de dias rola"): some o logo, resumo em 4 colunas, detalhe sem recuo à esquerda.
- `≤ 959 px`: as métricas da linha do dia descem para uma segunda fileira.
- `≤ 719 px` (comentário: "Celular: a página rola inteira, uma coluna"): página inteira rola, tudo empilha.

A prop `largura` (`pc | h | v | cel`) **não muda o arranjo**: só escolhe o sufixo do link de voltar. A prop `estado` está declarada e não é usada. PC (1440) e tablet horizontal (1280) caem na mesma faixa (≥ 1180) e têm arranjo idêntico; só a largura das colunas estica.

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| Faixa CSS | ≥ 1180 | ≥ 1180 | ≤ 1179 e ≤ 959 | ≤ 719 (herda as duas anteriores) |
| Altura da página | 100vh, sem rolagem de página | 100vh, sem rolagem de página | 100vh, sem rolagem de página | automática (mín. 100vh); a página inteira rola |
| O que é fixo / o que rola | cabeçalho, filtros e resumo fixos; só a lista de dias rola | igual | igual | nada fixo; tudo rola junto |
| Margem lateral | 24 px | 24 px | 24 px | 12 px |
| Cabeçalho | 80 px, uma linha | 80 px, uma linha | 80 px, uma linha | altura automática, quebra em linhas; padding 10×12 |
| Logo | 48×48 visível | 48×48 visível | oculto | oculto |
| Título (período) | 28 px | 28 px | 28 px | 24 px |
| Botão voltar | 52×52 | 52×52 | 52×52 | 52×52 |
| Botão `Exportar CSV` | 52 px alt., largura do texto | igual | igual | 52 px alt., ocupa a linha inteira (`flex: 1`) abaixo do título |
| Mensagem "Arquivo gerado…" | à esquerda do botão, uma linha com reticências | igual | igual | linha própria abaixo do botão, pode quebrar |
| Filtros | Período e Medida lado a lado, uma linha | lado a lado, uma linha | quebram em duas linhas (`flex-wrap`), rótulo ao lado | empilhados; rótulo acima; segmentado 100% com botões de largura igual |
| Botões dos filtros | 48 px alt., 16 px, padding 16 | igual | igual | 48 px alt., 16 px, padding 6, `flex: 1` |
| Resumo (7 cartões) | 7 colunas (≈190 px cada) | 7 colunas (≈167 px cada) | 4 colunas (4 + 3) | 2 colunas (4 fileiras, última com 1) |
| Valor do cartão de resumo | 30 px | 30 px | 30 px | 30 px |
| Linha do dia: grade | `96px · 1fr · auto · 40px` (data, meio, métricas, seta) | igual | `80px · 1fr · 40px`; métricas numa 2ª fileira de ponta a ponta | `64px · 1fr · 36px`; métricas na 2ª fileira; padding 12 |
| Data do dia | 30 px | 30 px | 30 px | 26 px |
| Título da linha | 19 px | 19 px | 19 px | 17 px |
| Barra da meta | 200×8 px, texto ao lado | igual | igual | largura total, texto na linha de baixo |
| Métricas (4) | à direita, alinhadas à direita, mín. 76 px, espaçamento 22 | igual | distribuídas (`space-between`), alinhadas à esquerda | igual ao tablet V |
| Valor das métricas | 26 px | 26 px | 26 px | 26 px |
| Seta | 40×40 | 40×40 | 40×40 | 36×36 |
| Como o detalhe abre | sanfona no próprio cartão | sanfona | sanfona | sanfona |
| Recuo do detalhe | 132 px à esquerda (alinha com a coluna do meio) | 132 px | sem recuo (18 px) | sem recuo (12 px) |
| Quadros de detalhe (8) | 4 colunas × 2 | 4 × 2 | 4 × 2 | 2 colunas × 4 |
| Valor do quadro de detalhe | 20 px | 20 px | 20 px | 20 px |
| Segmentado "Por medida" | 44 px alt., 15 px | igual | igual | igual |
| Cartões por medida | 2 colunas | 2 colunas | 2 colunas | 1 coluna |
| Número do cartão por medida | 34 px | 34 px | 34 px | 34 px |
| Navegação | só o voltar no cabeçalho (sem menu, abas ou barra inferior) | igual | igual | igual |

Alturas aproximadas da parte fixa: tablet H ≈ 80 (cabeçalho) + 83 (filtros) + 109 (resumo) = 272 px, sobram ≈ 528 px para a lista; tablet V ≈ 80 + 151 + 214 = 445 px, sobram ≈ 835 px. No celular o quadro do canvas tem 2.240 px de altura com o primeiro dia aberto.

### 8.3 Toque, foco e movimento

- Alvos de toque: voltar 52×52; `Exportar CSV` 52; filtros 48; filtro do dia 44; linha do dia inteira (≥ 100 px de altura).
- Hover clareia (`brightness 1.12`), toque escurece e encolhe (`scale .99`), foco por teclado com contorno de 3 px `#BFDBFE`.
- `prefers-reduced-motion` desliga a transição.
- Fontes: Barlow (texto) e Barlow Semi Condensed 800 (números); `tabular-nums`.
- Cores do tema: fundo `#0A0E15`, cartão `#111824`, borda `#26334A`, texto `#EEF2F8`, apoio `#A3B0C2`, azul do setor `#60A5FA`/`#93C5FD`, ativo `#2563EB`.

### 8.4 Reaproveitamento entre setores

O CSS (`.ht-*`) é o mesmo dos históricos de Montagem e Teste & Embalagem; entre Injetora e Montagem só mudam as cores do setor (azul → verde-água). Vale um componente de histórico compartilhado com cor e conteúdo por setor.

## 9. Fase futura, desabilitado ou marcador de posição

- **4 dos 5 dias da lista são marcadores**: `[data]`, `[dia da semana]`, `[início] → [término] · [tempo]`, `[ ] placas boas · [ ] ciclos`, `[ ] para a meta de 270`, etiqueta `[medidas]`, métricas `[ ]`. Aberto, o dia mostra `[ detalhe deste dia: placas boas, perdidas, ciclos, m², tempos e divisão por medida ]`. São lacunas de dados de exemplo, não função futura: no sistema real todo dia tem o detalhe completo.
- **Filtro de período não filtra** (só troca título e nome do arquivo).
- **Exportar CSV não baixa nada**: mostra apenas o nome do arquivo. Colunas, separador e codificação não estão definidos.
- Os números do resumo com Medida = Todas são texto fixo (não saem de conta no script).
- Nada aparece desabilitado ou marcado como "fase 2" nesta tela.

## 10. Divergências entre a versão anterior (`Historico-Setor`) e a nova

| Ponto | Anterior (1280×800 fixo) | Nova (`Tela-HistInjetora-*`) |
|---|---|---|
| Largura | fixa, estilos em linha | fluida, classes + media queries |
| `Exportar CSV` | botão sem ação | gera nome de arquivo e mostra "Arquivo gerado: …"; limpa ao trocar filtro |
| Filtro do dia | 40 px de altura, sem `aria-pressed` | 44 px, com `aria-pressed` |
| Voltar | `Injetora.dc.html` | `Tela-Injetora-{largura}` |
| Dados do dia de exemplo | objeto com `ini`, `fim`, `prod`, `parado`, `origem: 'Tablet Injetora'` | mesmos valores escritos direto no texto (campos saíram do objeto) |
| Acessibilidade | título em `div` | `<h1>`, rótulos de grupo, foco visível, `color-scheme: dark`, movimento reduzido |
| Regras e contas | idênticas | idênticas |

Nenhuma regra de negócio da versão anterior foi perdida; ela confirma que início, término, tempo produtivo, tempo parado e origem são campos do registro do dia.

## 11. Dúvidas para quem escreve os cards

1. **Quando um dia vira "registro fechado"?** A tela do operador não tem "encerrar dia". É à meia-noite, no fim do turno, ou manual? O dia de hoje em andamento aparece no histórico (o texto "faltam N" existe, mas não é usado)?
2. **Período "Hoje"**: mostra o dia em andamento com dados parciais? "7 dias" e "30 dias" incluem hoje? "Este mês" é mês de calendário?
3. **Dias sem produção** (fim de semana, feriado): aparecem zerados ou somem? Entram na média por dia?
4. **Filtro de medida × linha do dia**: com uma medida escolhida, a barra da meta, o `Parado`, as etiquetas e os 8 quadros do detalhe continuam com o total do dia. É o desejado ou falha do protótipo? O filtro do topo deveria pré-selecionar o "Por medida" do dia?
5. **Meta histórica**: se o RH mudar a meta, os dias antigos mostram a meta da época ou a atual? A média do resumo compara com qual?
6. **T. parado**: soma todas as pausas ou só as não planejadas (Refeição é marcada como planejada, "não conta como parada")? T. produtivo = término − início − pausas?
7. **Vazios, placas de 1 ciclo, perdas por tipo e lista de pausas** não aparecem no histórico. Devem aparecer no detalhe ou no CSV?
8. **CSV**: uma linha por dia ou por dia × medida? Quais colunas, separador (`;` para Excel pt-BR?), codificação, nome com datas reais? Em RH › Painel › Exportar há um comentário dizendo que aquele painel "substitui … os botões CSV/PDF do histórico": o botão do histórico do setor permanece?
9. **Quem pode ver e exportar**: qualquer operador no tablet do setor, ou só encarregado/RH/admin? O tablet vinculado à Injetora vê só a Injetora?
10. **Mais de um tablet no mesmo dia** (ex.: "Tablet Injetora 2"): uma linha por dia somando os dois (várias etiquetas de origem) ou uma linha por tablet?
11. **Lotes**: o dia mostra só o total por medida. Se a mesma medida teve dois lotes no dia, interessa ver lote a lote (início, fim, ciclos)?
12. **Volume e carregamento**: 30 dias cabem numa lista só? Precisa de paginação/"carregar mais", carregando e mensagem de erro?
13. **Sem conexão**: o histórico funciona offline (cache do último período) ou mostra aviso? O protótipo não desenha.
14. **Período sem nenhum dia** (medida = Todas): qual texto? O único texto vazio fala de medida.
15. **Medidas 2 a 5 m** são lista fixa ou cadastro? O filtro deve esconder medidas nunca produzidas no período?
16. **Estado na URL**: período, medida e dia aberto devem sobreviver ao voltar/recarregar?
17. **Fuso e virada do dia**: produção que cruza a meia-noite pertence a qual dia?
