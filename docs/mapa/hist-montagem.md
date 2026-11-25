# Mapa do protótipo · Histórico · Montagem (`hist-montagem`)

Fontes lidas (todas dentro de `artifact-files/.../project/`):

| Quadro | Tamanho no canvas | Papel |
|---|---|---|
| `Tela-HistMontagem-PC` | 1440×900 (`expand: fill`) | versão nova, PC |
| `Tela-HistMontagem-TabletH` | 1280×800 | versão nova, tablet horizontal (aparelho do operador) |
| `Tela-HistMontagem-TabletV` | 800×1280 | versão nova, tablet em pé |
| `Tela-HistMontagem-Celular` | 390×1700 | versão nova, celular |
| `Historico-Montagem` | 1280×800 | versão anterior (só tablet horizontal, largura fixa) |

Os quatro quadros `Tela-*` são **o mesmo arquivo byte a byte**, exceto: `<title>`, o default da prop `largura` (`pc` / `h` / `v` / `cel`) e o `$preview` (largura × altura do quadro). Marcação, CSS e script são idênticos. Não há quadro de estado extra (não existe "-Pausa", "-Vazio", "-Detalhe" nesta família); os estados são alcançados por interação.

Observação de segurança: nenhum dos cinco arquivos contém texto dirigido a quem lê (nenhuma instrução embutida). Só marcação, CSS e dados de exemplo.

---

## 1. Propósito e quem usa

Tela de **consulta (somente leitura)** do histórico de produção do setor **Montagem**, dia a dia. Aberta a partir da tela do setor Montagem pelo botão "Histórico" do cabeçalho. Mostra, para um período escolhido, um resumo (7 indicadores) e a lista de dias; cada dia se expande para mostrar a produção por operadora, medida e mesa.

- Usuário principal: operador(a)/líder no **tablet do setor Montagem** (1280×800).
- Também funciona em PC, tablet em pé e celular (mesma tela, arranjo por largura).
- Não há edição nesta tela: quando um dia está errado, o texto manda procurar o RH ("Peça ao RH para revisar no Desempenho do RH.").
- A única saída de dados é "Exportar CSV".

Vocabulário do setor: "placas montadas", "operadoras" (feminino no protótipo), "mesa 1..4", "medida" (2 m, 3 m, 4 m, 5 m), cor do setor teal (`#2DD4BF` / `#5EEAD4`).

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.ht-head`, 80 px de altura, borda inferior)

Esquerda:
- Botão voltar (seta "<" em SVG), 52×52 px, `aria-label="Voltar para a Montagem"`.
- Rótulo do setor: quadradinho teal 12×12 + texto `MONTAGEM · HISTÓRICO` (14 px, bold, espaçado, cor `#5EEAD4`).
- Título `h1` (28 px, Barlow Semi Condensed 800): muda com o período: `Hoje` / `Últimos 7 dias` / `Últimos 30 dias` / `Este mês`.

Direita:
- Mensagem de exportação (só depois de exportar): `Arquivo gerado: historico-montagem_7d_todas.csv` em verde `#86EFAC`, 15 px, `aria-live="polite"`, com reticências se não couber.
- Botão `Exportar CSV` (ícone de download + texto), 52 px de altura, 17 px.
- Logo AquaPulse 48×48 (some abaixo de 1180 px).

### 2.2 Filtros (`.ht-filtros`, `aria-label="Filtros"`, borda inferior)

Dois grupos de botões segmentados (um ativo por vez, `aria-pressed`):

- `PERÍODO`: `Hoje` · `7 dias` · `30 dias` · `Este mês`. Padrão inicial: **7 dias**.
- `MEDIDA`: `Todas` · `2 m` · `3 m` · `4 m` · `5 m`. Padrão inicial: **Todas**.

Botão ativo: fundo azul `#2563EB`, texto branco. Inativo: transparente, texto `#CBD5E1`. Altura de cada botão 48 px, fonte 16 px bold.

Não há campo de busca nem seletor de data livre nesta tela (o CSS traz classes `.ht-campo*` e `.ht-achou` de busca, mas a marcação da Montagem não as usa; são sobra do CSS compartilhado com os outros históricos).

### 2.3 Resumo do período (`.ht-kpis`, `aria-label="Resumo do período"`)

Sete cartões, sempre nesta ordem. Cada cartão: rótulo (14 px, colorido), valor (30 px, Barlow Semi Condensed 800), nota (13 px, cinza).

| # | Rótulo | Valor (exemplo com filtros padrão) | Nota | Cor do rótulo | Conta no script |
|---|---|---|---|---|---|
| 1 | `Dias` | `3` | `com registro` | cinza claro | quantidade de dias listados |
| 2 | `Montadas` | `469` | `todas as mesas` | teal | soma de `total` dos dias listados |
| 3 | `Média/dia` | `156` | `meta 270` | cinza claro | `round(total / dias)`; `—` se não há dias |
| 4 | `Área` | `688 m²` | `placas × m²` | cinza claro | soma de `area` dos dias |
| 5 | `Ritmo` | `54/h` | `só dias com horário` | verde | **fixo no protótipo** ("54/h" se algum dia tem ritmo, senão `—`) |
| 6 | `Destaque` | `Helena` | `52 placas em 10/11` | teal | **fixo no protótipo**; sem dados por operadora: `—` / `sem dados por operadora` |
| 7 | `Para revisar` | `1` | `dia fechado com zero` (ou `nada pendente`) | vermelho `#FCA5A5` se > 0, verde se 0 | quantidade de dias com alerta |

Números com separador de milhar pt-BR (`toLocaleString('pt-BR')`).

### 2.4 Lista de dias (`.ht-main`, `aria-label="Dias do período"`)

Um cartão por dia (`.ht-dia`), mais recente primeiro. O cartão inteiro é um botão (`.ht-linha`, `aria-expanded`). Conteúdo da linha:

1. **Data** (coluna de 96 px): `10/11` (30 px, 800) e embaixo o dia da semana `terça · hoje` / `terça` / `sexta` (14 px, cinza).
2. **Meio**:
   - Horário (15 px): `07:00 → em andamento · 2h21` (azul `#93C5FD` quando há horário), `sem horário · fechado 18:00` (amarelo `#FCD34D`), `— → 06:58 · fechado com zero` (vermelho `#FCA5A5` quando há alerta).
   - Título (19 px bold): `127 placas montadas · 3 operadoras` (o trecho de operadoras some quando não há contagem).
   - Barra da meta: trilho de 200×8 px, preenchimento teal `#2DD4BF` até `min(100, round(total/270×100))%`, e texto (14 px bold): `faltam 143 para a meta de 270` (hoje), `faltaram N para a meta de 270` (dia passado), `meta de 270 batida` (igual), `+72 acima da meta de 270` (acima, texto verde), `sem produção registrada` (dia com alerta).
   - Chips (13 px bold, pílula): um por medida produzida (`2 m · 1 m²`, `3 m · 1,5 m²`, `4 m · 2 m²`, `5 m · 2,5 m²`; fundo teal escuro `#123B35`), um de origem (`Tablet + botão ESP32`, `Tablet Montagem`, `Lançado pelo RH`; fundo escuro neutro), e, conforme o caso, `sem horário` (amarelo) ou o alerta `revisar fechamento` (vermelho).
3. **Métricas** (3 colunas à direita, rótulo 13 px + valor 26 px 800): `Área` (`175 m²`), `Ritmo` (`54/h` ou `—`), `Meta` (`47%`; verde quando ≥ 100%).
4. **Seta** 40×40: `▾` fechado, `▴` aberto.

Aparência do cartão: fundo `#111824`, borda `#26334A`; aberto: borda `#4B5B78`; com alerta: fundo `#1A0D10`, borda `#7F1D1D`.

### 2.5 Detalhe do dia (`.ht-dentro`, dentro do próprio cartão, abaixo da linha)

- Se o dia tem divisão por operadora: grade de cartões (`.ht-cards`), um por operadora: nome (18 px bold) + total do dia (26 px, teal) e, embaixo, uma linha por combinação medida/mesa: `2 m · mesa 1` → `31`, `3 m · mesa 2` → `21`.
- Sempre: uma nota (14 px, cinza):
  - com operadoras: `Por operadora e medida. Toque de novo para fechar.`
  - dia com alerta: `O dia foi fechado às 06:58 sem nenhuma placa. Peça ao RH para revisar no Desempenho do RH.`
  - dia lançado pelo RH sem detalhe: `Lançado pelo RH sem divisão por operadora nem horário.`

### 2.6 Estado vazio

Quando o filtro de medida não deixa nenhum dia: cartão centralizado `Nenhum dia com esta medida no período.` (18 px). O resumo continua visível com `Dias 0`, `Montadas 0`, `Média/dia —`, `Área 0 m²`, `Ritmo —`, `Destaque —` / `sem dados por operadora`, `Para revisar 0` / `nada pendente`.

---

## 3. Ações e o que a lógica faz

Estado do componente: `{ periodo: '7d', tam: 'todas', aberto: '10/11', exportado: null }`.

| Ação | Efeito no script |
|---|---|
| Tocar em um botão de `PERÍODO` | `periodo = x` e `exportado = null` (apaga a mensagem de arquivo gerado). Troca o título do cabeçalho e o nome do arquivo de exportação. **No protótipo não filtra os dias**: a lista de exemplo é a mesma em qualquer período. |
| Tocar em um botão de `MEDIDA` | `tam = x` e `exportado = null`. Mantém só os dias cujo conjunto de medidas produzidas contém a medida. Resumo e lista são recalculados sobre os dias que sobraram. |
| Tocar na linha de um dia | Abre o detalhe daquele dia; tocar de novo fecha. **Só um dia aberto por vez** (`aberto` guarda uma data só). Seta troca `▾`/`▴`, borda clareia. |
| Tocar em `Exportar CSV` | Se há pelo menos um dia listado: `exportado = 'historico-montagem_<periodo>_<medida>.csv'` e aparece `Arquivo gerado: ...` no cabeçalho. Com lista vazia **não faz nada** (sem aviso). Nenhum arquivo é gerado de verdade no protótipo. |
| Tocar em voltar | Navega para `Tela-Montagem<sufixo da largura>` (a tela do setor Montagem na mesma largura). |

Nome do arquivo: `historico-montagem_{hoje|7d|30d|mes}_{todas|2m|3m|4m|5m}.csv`.

Não existem: confirmação, desfazer, validação de campo, paginação, "carregar mais", ordenação, seleção de datas livres, edição.

Detalhe de abertura inicial: o dia de hoje (`10/11`) já vem aberto. Se o filtro de medida esconder o dia aberto, `aberto` continua guardado e ele reabre quando o dia voltar à lista.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal | filtros 7 dias / Todas, 3 dias listados, hoje expandido |
| Dia em andamento (hoje) | horário `07:00 → em andamento · 2h21`, semana `terça · hoje`, texto da meta no presente (`faltam`) |
| Dia fechado com produção e horário | (não há exemplo de dia passado com horário completo; inferido pelo formato `início → fim · duração`) |
| Dia sem horário | horário em amarelo `sem horário · fechado 18:00`, chip `sem horário`, `Ritmo —`; origem `Lançado pelo RH` |
| Dia com alerta (fechado com zero) | cartão vermelho-escuro, horário `— → 06:58 · fechado com zero`, chip `revisar fechamento`, texto `sem produção registrada`, conta em `Para revisar` |
| Dia sem divisão por operadora | detalhe só com a nota; título ainda pode dizer `· 3 operadoras` (contagem vem separada: `nOps`) |
| Detalhe aberto / fechado | acordeão em linha, um por vez |
| Vazio | `Nenhum dia com esta medida no período.` |
| Exportado | mensagem verde `Arquivo gerado: ...` até a próxima troca de filtro |
| Carregando, erro, sem conexão | **não existem no protótipo** |

A prop `estado` é declarada (`default: ""`) mas **não é lida pelo script**: não há variação de estado por prop.

---

## 5. Regras de negócio e contas

| Regra | Valor de exemplo | Configurável? |
|---|---|---|
| Meta diária da Montagem | **270 placas/dia** (fixo no código, aparece em texto, barra, `Média/dia` e `Meta %`) | Deve ser configurável (a tela do setor usa o mesmo 270); o protótipo não mostra onde |
| `Meta %` do dia | `round(total / 270 × 100)`: 127 → 47%, 342 → 127%, 0 → 0%. Verde se total ≥ 270 | deriva da meta |
| Barra da meta | `min(100, round(total/270×100))%` (trava em 100%) | — |
| Texto da meta | `> 270`: `+N acima da meta de 270`; `= 270`: `meta de 270 batida`; `< 270`: `faltam N` (hoje) ou `faltaram N` (dia passado) `para a meta de 270`; dia com alerta: `sem produção registrada` | — |
| Área por placa (m²) | 2 m = 1 m²; 3 m = 1,5 m²; 4 m = 2 m²; 5 m = 2,5 m² (ou seja, 0,5 m² por metro) | tabela de medidas; parece cadastro |
| Área do dia | soma de `placas × m² da medida`. Confere: 31×1 + (21+44+31)×1,5 = 175 m²; 342×1,5 = 513 m² | — |
| Ritmo do dia | placas por hora = `total / horas trabalhadas`. Confere: 127 / 2h21 (2,35 h) ≈ 54/h. Só existe quando o dia tem horário de início | — |
| Ritmo do período | nota `só dias com horário`: média considerando apenas dias com horário. Valor fixo `54/h` no protótipo; a fórmula exata (média ponderada por horas ou média simples) não está definida | — |
| `Média/dia` | `round(soma das montadas / número de dias com registro)`. Inclui o dia fechado com zero no divisor (469/3 = 156) | — |
| `Dias` | dias **com registro** no período (não dias corridos) | — |
| `Destaque` | operadora com maior produção em um dia do período (`Helena`, `52 placas em 10/11`). Fixo no protótipo; critério (maior dia único x maior soma no período) não está definido | — |
| `Para revisar` | número de dias com alerta. Único alerta de exemplo: dia fechado com zero placas (`revisar fechamento`) | — |
| Filtro de medida | mantém o dia se ele produziu a medida; **os números do dia continuam sendo o total de todas as medidas** (não recalcula só a medida escolhida) | ver dúvidas |
| Origem do registro | `Tablet + botão ESP32`, `Tablet Montagem`, `Lançado pelo RH` | — |
| Um dia = um registro de turno | início, fim (ou "em andamento"), duração; pode não ter horário (lançamento do RH) | — |
| Acordeão | no máximo 1 dia aberto | — |
| Exportação | só com pelo menos 1 dia; nome do arquivo leva período e medida | — |

Somas implícitas: total do dia = soma das operadoras = soma das linhas medida/mesa (52 = 31+21; 127 = 52+44+31).

---

## 6. Entidades e dados implícitos

Para a tela funcionar de verdade é preciso existir (nomes sugeridos, o protótipo não nomeia tabelas):

- **Setor**: Montagem (identidade, cor, meta diária = 270).
- **Dia de produção do setor** (turno/jornada): data, setor, hora de início, hora de fechamento, situação (em andamento / fechado), origem (tablet, tablet + botão ESP32, lançado pelo RH), indicador "sem horário", alerta de revisão (fechado com zero), quem fechou.
- **Medida de placa**: comprimento (2, 3, 4, 5 m) e área (1 / 1,5 / 2 / 2,5 m²).
- **Mesa**: número (mesa 1..4), setor.
- **Operadora** (funcionário): nome.
- **Apontamento de montagem**: dia, operadora, mesa, medida, quantidade, origem (toque no tablet ou botão ESP32), horário. É o que alimenta os cartões por operadora (`2 m · mesa 1 → 31`).
- **Lançamento manual do RH**: total do dia por medida, número de operadoras (`nOps`), sem divisão por operadora nem horário.
- **Meta do setor**: valor por dia (270), possivelmente com vigência.

Agregados que a tela consome (consulta por setor + intervalo de datas + medida opcional): por dia → total, área, ritmo, medidas produzidas, origem, alerta, número de operadoras, quebra operadora × medida × mesa; do período → dias, total, média/dia, área, ritmo, destaque, pendências.

Eventos que esta tela grava: **nenhum de produção**. No máximo um registro de auditoria de "exportou CSV" (não previsto no protótipo). É uma tela de leitura.

---

## 7. Navegação

| De | Para |
|---|---|
| Tela do setor Montagem, botão `Histórico` do cabeçalho (`hHist`) | esta tela (mesma largura) |
| Botão voltar (`aria-label="Voltar para a Montagem"`) | `Tela-Montagem-PC` / `-TabletH` / `-TabletV` / `-Celular`, conforme a prop `largura` |
| Texto "Peça ao RH para revisar no Desempenho do RH." | **não é link**; só menciona a tela RH2-Desempenho |
| `Exportar CSV` | não navega; gera arquivo |

No sistema real o sufixo de largura some: é uma rota só (ex.: `/montagem/historico`) voltando para `/montagem`. Período, medida e dia aberto são estado local no protótipo; não há indicação de que devam ir para a URL.

---

## 8. Responsividade

### 8.1 Mecanismo

- **CSS com media queries por largura da janela**, três cortes, do maior para o menor: `max-width: 1179px`, `max-width: 959px`, `max-width: 719px`. É um único componente e uma única marcação; nenhum bloco é duplicado para outra largura.
- A prop `largura` (`pc` / `h` / `v` / `cel`) **não muda o arranjo**: serve só para montar o link de voltar com o sufixo certo. A prop `estado` não é usada.
- Faixas resultantes: **≥ 1180** (PC 1440 e tablet horizontal 1280: arranjo idêntico), **960–1179** (faixa intermediária sem quadro próprio, ex.: iPad 1024 deitado), **720–959** (tablet em pé 800), **≤ 719** (celular 390).
- Há também `prefers-reduced-motion: reduce` (tira a transição e o "afundar" dos botões) e foco visível (`outline 3px #99F6E4`).

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| Faixa de CSS | base (≥1180) | base (≥1180) | ≤1179 + ≤959 | ≤1179 + ≤959 + ≤719 |
| Altura da página | 100vh, mín. 600 | 100vh, mín. 600 | 100vh, mín. 600 | automática (mín. 100vh) |
| O que rola | só a lista de dias | só a lista de dias | só a lista de dias | a página inteira |
| O que fica fixo | cabeçalho, filtros, resumo | cabeçalho, filtros, resumo | cabeçalho, filtros, resumo | nada (sem sticky) |
| Cabeçalho: altura | 80 px | 80 px | 80 px | automática, quebra em linhas |
| Cabeçalho: padding lateral | 24 px | 24 px | 24 px | 10 px 12 px |
| Cabeçalho: lado direito | na mesma linha | na mesma linha | na mesma linha | linha própria, 100% da largura |
| Título (`h1`) | 28 px | 28 px | 28 px | 24 px |
| Botão voltar | 52×52 | 52×52 | 52×52 | 52×52 |
| Botão `Exportar CSV` | 52 px alt., largura do texto | igual | igual | 52 px alt., ocupa a linha toda (`flex:1`) |
| Mensagem `Arquivo gerado` | à esquerda do botão, uma linha com reticências | igual | igual | linha inteira abaixo do botão, pode quebrar |
| Logo AquaPulse 48 px | visível | visível | oculto | oculto |
| Filtros: arranjo | dois grupos lado a lado, rótulo à esquerda | igual | grupos quebram em duas linhas (flex-wrap), rótulo à esquerda | um grupo por linha, rótulo **acima** |
| Filtros: padding | 12 px 24 px | 12 px 24 px | 12 px 24 px | 10 px 12 px |
| Botão de segmento | 48 px alt., padding 0 16, 16 px | igual | igual | 48 px alt., largura igual entre si (`flex:1`), padding 0 6 |
| Largura do segmentado | do conteúdo | do conteúdo | do conteúdo | 100% |
| Resumo: colunas | 7 | 7 | 4 (4 + 3) | 2 (4 linhas, último sozinho) |
| Resumo: padding | 14 24 0 | 14 24 0 | 14 24 0 | 12 12 0 |
| Resumo: valor | 30 px | 30 px | 30 px | 30 px |
| Lista: padding | 14 24 20 | 14 24 20 | 14 24 20 | 12 |
| Linha do dia: grade | `96px 1fr auto 40px` (data, meio, métricas, seta) | igual | `80px 1fr 40px` + métricas em segunda linha de ponta a ponta | `64px 1fr 36px` + métricas em segunda linha |
| Linha: padding / gap | 14 18 / 18 | 14 18 / 18 | 14 18 / 12 14 | 12 / 10 12 |
| Data (número) | 30 px | 30 px | 30 px | 26 px |
| Título do dia | 19 px | 19 px | 19 px | 17 px |
| Métricas do dia (Área, Ritmo, Meta) | 3 colunas à direita, alinhadas à direita, mín. 76 px, gap 22 | igual | linha própria, distribuídas (`space-between`), alinhadas à esquerda | igual ao tablet V |
| Valor das métricas | 26 px | 26 px | 26 px | 26 px |
| Trilho da meta | 200×8 px fixo, texto ao lado | igual | igual | 100% da largura, texto embaixo |
| Seta | 40×40 | 40×40 | 40×40 | 36×36 |
| Alvo de toque da linha | cartão inteiro (≈110 px+ de altura) | igual | igual (mais alto) | igual (mais alto) |
| Detalhe: como abre | acordeão dentro do cartão | acordeão | acordeão | acordeão |
| Detalhe: recuo | 132 px à esquerda (alinha com a coluna do meio) | 132 px | sem recuo (12 18 16) | sem recuo (12 12 14) |
| Cartões de operadora | 3 colunas | 3 colunas | 2 colunas | 1 coluna |
| Nome / total da operadora | 18 px / 26 px | igual | igual | igual |
| Estado vazio | cartão com padding 40, 18 px | igual | igual | igual |

Faixa intermediária **960–1179** (sem quadro no canvas): logo oculto, resumo em 4 colunas, detalhe sem recuo, operadoras em 2 colunas, mas a linha do dia continua em 4 colunas (métricas à direita).

Notas de responsividade:
- Em nenhuma largura o detalhe vira painel lateral, folha de baixo ou tela cheia: é sempre expansão em linha. Nada vira tabela; a lista já é de cartões em todas as larguras.
- PC e tablet horizontal são visualmente o mesmo arranjo; o PC só ganha largura (não há `max-width` de conteúdo: em 1440 os cartões esticam).
- Menor alvo de toque isolado: botões de segmento com 48 px de altura; no celular, com 5 medidas em 366 px, cada botão fica com ≈ 70 px de largura.
- A navegação da tela é só o botão voltar; não há barra lateral, abas nem barra inferior em nenhuma largura.
- Tema escuro fixo (`color-scheme: dark`), fontes Barlow e Barlow Semi Condensed, números tabulares.

---

## 9. Fase futura, desabilitado, placeholder

- Nada está marcado como "fase futura", "[ ]" ou desabilitado nesta tela.
- Placeholders de fato (valores fixos no script, a calcular no sistema real): `Ritmo 54/h` do resumo, `Destaque Helena · 52 placas em 10/11`, a hora `06:58` dentro da nota do dia com alerta, a nota `dia fechado com zero` do cartão `Para revisar`.
- O filtro `PERÍODO` não filtra os dados de exemplo (só troca título e nome do arquivo).
- `Exportar CSV` só mostra o nome do arquivo; não gera nem baixa nada.
- Prop `estado` declarada e sem uso.
- CSS sem uso na marcação da Montagem (sobra do CSS comum aos três históricos): `.ht-campo*` e `.ht-achou` (campo de busca), `.ht-det*` (grade de 4 detalhes), `.ht-fm*` e `.ht-seg2*` (segundo segmentado dentro do detalhe), `.ht-pm*` (pares com valor verde grande), `.ht-ph`. Não fazem parte desta tela.
- `hint-placeholder-count` / `hint-placeholder-val` nos `sc-for` / `sc-if` são só dicas do editor do protótipo.

---

## 10. Divergências entre a versão anterior (`Historico-Montagem`) e a nova (`Tela-HistMontagem-*`)

| Ponto | Versão anterior | Versão nova |
|---|---|---|
| Largura | fixa 1280×800, estilos em linha | fluida, classes `.ht-*` e media queries |
| Voltar | `Montagem.dc.html` | `Tela-Montagem<sufixo>` |
| `Exportar CSV` | botão sem ação | grava `exportado` e mostra `Arquivo gerado: ...`; trocar filtro apaga a mensagem |
| Nota do dia com alerta | `...revisar no Histórico do RH.` | `...revisar no Desempenho do RH.` (nome novo da tela do RH) |
| Detalhe aberto | sem linha divisória, padding `0 18 16 132` | com borda superior e padding `12 18 16 132` |
| Cor da barra da meta | passada por parâmetro (`metaBarCor`, sempre teal) | fixa no CSS (teal) |
| Título | `div` | `h1`; seções com `aria-label`, grupos com `role="group"` |
| Dados, contas, textos, filtros, resumo | iguais | iguais |

Nenhuma regra de negócio existe só na versão anterior; a nova não resumiu nada.

---

## 11. Dúvidas reais para o card

1. **Filtro de medida**: ao escolher `3 m`, os números do dia (montadas, área, meta %, operadoras) devem contar só as placas de 3 m ou o dia inteiro, como no protótipo? E a meta de 270 vale para o filtro por medida?
2. **Períodos**: `7 dias` e `30 dias` incluem hoje? São dias corridos ou dias com registro? `Este mês` é mês-calendário até hoje? Não há intervalo de datas livre: é isso mesmo?
3. **Meta 270**: onde é configurada, por quem, e se muda ao longo do tempo o histórico usa a meta vigente no dia ou a atual?
4. **Ritmo do período**: média ponderada (total de placas ÷ total de horas dos dias com horário) ou média simples dos ritmos diários? Pausas descontam das horas?
5. **Destaque**: maior produção de uma operadora em um único dia, ou maior soma no período? Empate? Deve mesmo expor nome de pessoa no tablet do setor?
6. **Média/dia**: dia fechado com zero (para revisar) entra no divisor, como no protótipo?
7. **Alertas**: "fechado com zero" é o único motivo de `Para revisar`? Quem tira o alerta (RH, ao corrigir no Desempenho)? A nota deve virar link para a tela do RH para quem tem permissão?
8. **Quem acessa**: o operador vê todo o histórico e pode exportar, ou exportar é só para RH/admin? Precisa de login além do tablet vinculado?
9. **CSV**: uma linha por dia ou por operadora × medida × mesa? Quais colunas, separador (`;`), codificação, decimal com vírgula? Download direto no tablet ou envio?
10. **Dia lançado pelo RH**: pode ter divisão por operadora? De onde vem o `3 operadoras` quando não há divisão?
11. **Mais de um turno no mesmo dia** (ou reabertura depois de fechar): vira dois cartões ou soma em um?
12. **Lista longa** (30 dias): paginação, rolagem infinita ou tudo de uma vez? Ordem sempre do mais recente ao mais antigo?
13. **Estados ausentes**: carregando, erro, e **sem conexão** (o app é offline-first): o histórico fica em cache local? Até quantos dias?
14. **Dia em andamento**: os números de hoje atualizam ao vivo enquanto a tela está aberta?
15. **Faixa 960–1179 px** (iPad 1024 deitado): o arranjo intermediário que sai das media queries é o desejado, ou esse aparelho deve se comportar como o tablet horizontal de 1280?
16. **PC largo**: o conteúdo deve esticar sem limite (como no protótipo) ou ter largura máxima?
17. **Celular**: filtros e resumo rolam junto com a página; é aceitável não ter nada fixo no topo?
18. **Um componente para os três históricos?** Conferido por `diff`: o bloco de CSS de `Tela-HistMontagem`, `Tela-HistInjetora` e `Tela-HistTeste` é o mesmo, mudando só 4 linhas de cor do setor (foco, rótulo/quadradinho do setor, foco do campo, preenchimento da barra: teal na Montagem, azul na Injetora, lilás no Teste). Vale um card de base comum (casca, filtros, resumo, lista, acordeão, exportação, responsividade) + um card por setor (dados, colunas e detalhe próprios).
