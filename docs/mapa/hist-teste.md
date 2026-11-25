# Mapa do protótipo · Histórico · Teste & Embalagem (`hist-teste`)

Fonte: quadros `Tela-HistTeste-PC`, `Tela-HistTeste-TabletH`, `Tela-HistTeste-TabletV`, `Tela-HistTeste-Celular` (versão atual) e `Historico-Teste` (versão anterior, só tablet 1280×800).
Conferência cruzada (só leitura de trechos): `Tela-Teste-TabletH` (tela do operador), `RH2-Painel-Metas`, `RH2-Painel-Exportar`, `Tela-HistMontagem-TabletH`.

Observação sobre os arquivos: os quatro quadros `Tela-HistTeste-*` são **byte a byte o mesmo componente**; o `diff` só acusa o `<title>`, o valor padrão da prop `largura` (`pc` / `h` / `v` / `cel`) e o tamanho de pré-visualização. Nenhum dos arquivos contém texto com instruções para o leitor; são só marcação, CSS e dados de exemplo.

---

## 1. Propósito e quem usa

Tela **somente leitura** com o histórico diário do setor Teste & Embalagem: um dia por linha, com quantas placas foram testadas, quantas embaladas (em pacotes, por medida), quantos defeitos (caninho / cabeçote), tempo produtivo e tempo parado, comparados com a meta diária de embaladas.

- Entrada: botão de histórico no cabeçalho da tela do operador (`Tela-Teste-*`, link `hHist`).
- Usuário principal: operador / líder no **tablet do setor** (1280×800). Também existe em PC 1440, tablet em pé 800 e celular 390, então serve a quem consulta fora da linha (supervisão). O protótipo não mostra login nem perfil nesta tela.
- Não grava produção, não edita nem corrige nada. A única ação com efeito "para fora" é `Exportar CSV`.

Cor do setor: lilás (`#C4B5FD` quadrado/trilho, `#DDD6FE` texto e foco). O esqueleto e o CSS são compartilhados com `Tela-HistInjetora` e `Tela-HistMontagem` (o `diff` do CSS com HistMontagem só troca as cores do setor): na implementação deve ser **um componente de histórico por setor**, parametrizado.

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.ht-head`, 80 px de altura, borda inferior)
Esquerda:
- Botão voltar (52×52, seta `‹`, `aria-label="Voltar para Teste e Embalagem"`).
- Sobretítulo `TESTE & EMBALAGEM · HISTÓRICO` (14 px, caixa alta, lilás, com quadradinho de 12 px da cor do setor).
- Título `h1` = nome do período: `Hoje`, `Últimos 7 dias`, `Últimos 30 dias` ou `Novembro` (nome do mês corrente quando o período é "Este mês"). 28 px, Barlow Semi Condensed 800.

Direita:
- Mensagem de exportação (só depois de exportar): `Arquivo gerado: historico-teste_7d_todas.csv` em verde `#86EFAC`, 15 px, `aria-live="polite"`, corta com reticências se faltar espaço.
- Botão `Exportar CSV` (ícone de download, 52 px de altura, 17 px).
- Logo AquaPulse 48×48 (some abaixo de 1180 px).

### 2.2 Filtros (`.ht-filtros`, faixa fixa, quebra de linha automática)
1. `PERÍODO` — segmentado com 4 opções: `Hoje` · `7 dias` · `30 dias` · `Este mês`. Padrão: `7 dias`.
2. `MEDIDA` — segmentado com 5 opções: `Todas` · `2 m` · `3 m` · `4 m` · `5 m`. Padrão: `Todas`.
3. `BUSCAR DIA` — **só aparece em `30 dias` e `Este mês`**. Campo de busca (58 px de altura, 260 px de largura, lupa, placeholder `Ex.: 21 ou sexta…`), botão `×` (44×44, `aria-label="Limpar a busca"`) quando há texto, e contador ao lado: `3 de 20 dias` (`aria-live="polite"`).

Segmento ativo: fundo `#2563EB`, texto branco, `aria-pressed="true"`. Inativo: transparente, texto `#CBD5E1`.

### 2.3 Resumo do período (`.ht-kpis`, 7 cartões)
| # | Rótulo | Valor | Nota embaixo | Cor do rótulo |
|---|---|---|---|---|
| 1 | `Dias` | nº de dias listados | `com registro` (ou `dia em curso` em Hoje) | cinza claro |
| 2 | `Testadas` | soma de testadas | `embaladas + defeitos` | azul claro |
| 3 | `Embaladas` | soma de embaladas | `144 pacotes` | verde |
| 4 | `Defeitos` | testadas − embaladas | `13,4% · pior 09/11` (ou `16,7% de perda` quando só há 1 dia) | vermelho claro |
| 5 | `Área` | soma em m² (`2.200 m²`) | `todas as medidas` ou `dias com 3 m` | cinza claro |
| 6 | `T. produtivo` | soma de minutos produtivos em `40h22` | `média 8h04/dia` | verde |
| 7 | `T. parado` | soma de minutos parados em `3h40` | `pausas registradas` | amarelo |

Valores de exemplo acima = período `7 dias`, medida `Todas` (5 dias: 03 a 09/11; 1.662 testadas, 1.440 embaladas, 222 defeitos).

### 2.4 Lista de dias (`.ht-main`, a única parte que rola em tablet/PC)
Um cartão por dia, do mais recente para o mais antigo. A **linha inteira é um botão** (`aria-expanded`) que abre/fecha o detalhe.

Linha fechada, da esquerda para a direita:
- **Data**: `09/11` (30 px) e dia da semana embaixo (`segunda`; no dia corrente `terça · hoje`).
- **Meio**:
  - horário em azul: `07:14 → 16:45 · 7h37 produtivas` (no dia de hoje: `07:10 → em andamento · 2h11`, sem a palavra "produtivas");
  - título: `343 testadas · 27 pacotes` (19 px, negrito);
  - barra de meta (trilho de 200×8 px, preenchimento lilás) + texto da meta:
    - acima: `+60 acima da meta de 270 embaladas` (verde);
    - igual: `meta de 270 embaladas batida` (verde);
    - abaixo, dia passado: `faltaram 40 para a meta de 270 embaladas` (cinza);
    - abaixo, hoje: `faltam 190 para a meta de 270 embaladas` (cinza);
  - chips: um por medida do dia (`3 m · 15 pacotes`, lilás), um de origem (`Tablet Teste`, cinza) e, no pior dia do período, `maior perda do período` (vermelho).
- **Métricas** (4 colunas alinhadas à direita, valor em 26 px): `Embaladas` (verde) · `Defeitos` (vermelho) · `% perda` (vermelho, 1 casa, vírgula) · `Ritmo` (`45/h`, cinza).
- **Seta** `▾` / `▴` (40×40).

Detalhe do dia aberto (`.ht-dentro`, dentro do mesmo cartão, borda do cartão clareia para `#4B5B78`):
- Grade de cartões:
  - um por medida produzida no dia: nome `3 m · 1,5 m²`, valor grande = placas embaladas da medida (lilás), linhas `Pacotes` e `Área embalada` (`225 m²`);
  - `Defeitos`: valor total (vermelho), linhas `Caninho · 56%` → `41` e `Cabeçote · 44%` → `32`;
  - `Tempo`: valor = tempo produtivo (`7h37`, azul), linhas `Início → fim` (`07:14 → 16:45`) e `Parado` (`0h38`).
- Nota: `Embaladas por medida, defeitos por tipo e tempo do dia. Toque de novo para fechar.`

### 2.5 Estados vazios (dentro da lista)
- Filtro de medida sem nenhum dia: `Nenhum dia com esta medida no período.`
- Busca sem resultado: `Nenhum dia encontrado para “xx”. Tente o dia do mês (21) ou o dia da semana (sexta), ou limpe a busca.`

---

## 3. Ações e lógica

Estado inicial do componente: `{ periodo: '7d', tam: 'todas', aberto: '09/11', exportado: null, q: '' }` (o dia mais recente já vem aberto).

| Ação | Efeito |
|---|---|
| Toque em `‹` | Navega para a tela do operador `Tela-Teste` da mesma largura. |
| Toque em um período | Troca `periodo`, **limpa a busca** (`q = ''`) e apaga a mensagem de exportação. Título do cabeçalho muda. |
| Toque em uma medida | Troca `tam` e apaga a mensagem de exportação. Mantém a busca. |
| Digitar em `BUSCAR DIA` | Filtra a lista a cada tecla (sem botão de enviar). Não mexe nos cartões de resumo. |
| Toque em `×` | Limpa a busca. |
| Toque numa linha de dia | Abre o detalhe daquele dia; **só um dia aberto por vez** (abrir outro fecha o anterior); tocar de novo fecha. |
| Toque em `Exportar CSV` | Se houver ao menos um dia no período/medida: mostra `Arquivo gerado: <nome>`. Se não houver dia: não faz nada (sem aviso). Não há confirmação nem desfazer. |

Nome do arquivo exportado: `historico-teste_<periodo>_<medida>.csv`, com `<periodo>` ∈ `hoje | 7d | 30d | mes` e `<medida>` ∈ `todas | 2m | 3m | 4m | 5m`. Ex.: `historico-teste_30d_3m.csv`. O protótipo **não gera arquivo de verdade** e não define colunas. O nome não leva a busca em conta (a exportação é do período + medida, não do resultado da busca).

Regras da busca de dia (cada palavra separada por espaço precisa casar; "E" lógico):
- 1 ou 2 dígitos (`21`, `5`): casa com o **dia do mês** exato (`5` casa com `05/11`).
- Começa com dígito e tem mais coisa (`21/1`): casa como prefixo de `dd/mm`.
- Texto: prefixo do dia da semana, sem acento e sem diferenciar maiúsculas (`sex`, `terca`); a palavra `hoje` (ou prefixo) casa com o dia corrente.
- Contador: `N de M dias` (singular `dia` quando M = 1); vazio quando não há termo.

Não existem nesta tela: confirmação, desfazer, validação de formulário, edição de registro, paginação, seletor de datas livre, ordenação.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal | Lista de dias, primeiro dia aberto. |
| Dia aberto / fechado | Seta `▴` / `▾`, borda `#4B5B78` / `#26334A`, `aria-expanded`. |
| Dia de hoje (em andamento) | Semana `terça · hoje`, horário `→ em andamento`, meta `faltam N…`, resumo com nota `dia em curso`. |
| Meta batida / acima / abaixo | Texto verde (≥ 270) ou cinza (< 270); barra limitada a 100%. |
| Pior dia do período | Chip `maior perda do período` + nota `· pior dd/mm` no cartão Defeitos. Só quando há mais de 1 dia. |
| Vazio por medida | `Nenhum dia com esta medida no período.` (no exemplo, `5 m` em qualquer período). Resumo mostra zeros, `—` na média. |
| Busca sem resultado | Mensagem com o termo entre aspas curvas. |
| Exportado | Texto verde no cabeçalho até trocar período ou medida. |
| Busca visível / oculta | Só em `30 dias` e `Este mês`. |
| **Não desenhados** | Carregando, erro de servidor, sem conexão, sem permissão, período sem nenhum registro (diferente de "sem a medida"). |

A prop `estado` é declarada no componente mas não é usada (não há quadros `-Pausa`/`-Lote` nesta família).

---

## 5. Regras de negócio e contas

| Regra | Valor no protótipo | Configurável? |
|---|---|---|
| Meta diária de embaladas do setor | **270** (fixo no script, aparece nos textos) | Sim, na prática: `RH2-Painel-Metas` tem meta por setor (`pmMeta.tes = 270`). O histórico deveria ler a meta, não fixar. |
| Placas por pacote | **10** (fixo: `embaladas = pacotes × 10`) | Na tela do operador é ajustável por pacote (`PLACAS POR PACOTE`, −1/+1, limites 1 a 30, "padrão 10"). **Divergência**: o histórico real precisa somar as placas reais de cada pacote. |
| Medidas e área por placa | 2 m = 1 m² · 3 m = 1,5 m² · 4 m = 2 m² · 5 m = 2,5 m² | Cadastro de medidas (tabela), igual nas outras telas. |
| Testadas | `embaladas + defeitos` (no exemplo `testadas` vem pronta e `defeitos = testadas − embaladas`) | Derivado. |
| Defeitos por tipo | `caninho` e `cabeçote`; a soma dos dois = defeitos do dia. Percentual de cada um = `round(tipo ÷ defeitos × 100)` | Tipos fixos nas telas de Teste. |
| % perda | `defeitos ÷ testadas × 100`, 1 casa decimal, vírgula; `—` se testadas = 0 | Derivado. |
| Ritmo | `round(testadas ÷ (minutos produtivos ÷ 60))` em `/h` | Derivado. Usa **testadas**, não embaladas. |
| Área do dia | `Σ pacotes(medida) × 10 × área(medida)` | Derivado. |
| Barra de meta | `min(100, round(embaladas ÷ 270 × 100))` % | Derivado. |
| Pior dia | Dia com maior % de perda entre os dias do período + medida (ignora a busca); empate fica com o mais recente | Derivado. |
| Tempo | `min` = minutos produtivos; `parado` = minutos de pausa registrada; formato `7h37` | Vem das pausas da tela do operador. |
| Média por dia | `T. produtivo ÷ nº de dias` | Derivado. |
| Formato de número | `pt-BR` (ponto de milhar, vírgula decimal) | — |

**Filtro de medida**: filtra os **dias que tiveram aquela medida**, mas os números mostrados (testadas, embaladas, defeitos, área, tempo) continuam sendo o **total do dia**, não só da medida. A nota do cartão Área avisa: `dias com 3 m`. Ver dúvida 1.

**Períodos nos dados de exemplo** ("hoje" = 10/11):
- `Hoje`: só 10/11, em andamento.
- `7 dias`: 03, 04, 05, 06 e 09/11 (5 dias úteis; **não inclui hoje**).
- `Este mês` (`Novembro`): os 5 acima + 02/11 (não inclui hoje).
- `30 dias`: os 6 acima + 14 dias de outubro (13 a 30/10), total 20 dias com registro.
Só aparecem dias "com registro"; fim de semana e dia sem produção não entram.

Conferência do exemplo 09/11: pacotes 6 (2 m) + 15 (3 m) + 6 (4 m) = 27 → 270 embaladas; 343 testadas → 73 defeitos (41 caninho + 32 cabeçote); perda 21,3%; área 60 + 225 + 120 = 405 m²; ritmo 343 ÷ 7,62 h = 45/h; meta batida.

Inconsistências dos dados de exemplo (não são regra): 06/11 mostra `14:17 → 16:41` com 7h40 produtivas; em geral `fim − início − parado` não fecha com o tempo produtivo. A definição de "tempo produtivo" precisa ser decidida (dúvida 6).

---

## 6. Entidades e dados implícitos

A tela não grava eventos de produção; ela **lê** o que a tela do operador de Teste & Embalagem grava. Para funcionar de verdade precisa existir:

| Entidade | Campos usados aqui |
|---|---|
| Setor | id, nome (`Teste & Embalagem`), cor, meta diária de embaladas |
| Meta do setor | setor, valor (270), vigência (para o histórico usar a meta do dia) |
| Medida | comprimento (2/3/4/5 m), área por placa em m² |
| Tablet / origem do lançamento | id, nome (`Tablet Teste`), setor vinculado; no RH existe também a origem `Lançado pela Administração` |
| Jornada do dia no setor | data, setor, hora do primeiro e do último registro (início/fim), em andamento ou encerrada |
| Pacote fechado (evento) | data/hora, setor, medida, **placas no pacote** (padrão 10), lote, tablet |
| Defeito no teste (evento) | data/hora, setor, medida, tipo (`caninho` / `cabeçote`), tablet |
| Lote | medida, abertura/fechamento (a tela do operador fecha lote ao trocar de medida) |
| Pausa | início, fim, motivo, setor (soma vira `T. parado`) |
| Resumo diário (visão ou tabela agregada) | data, setor, testadas, embaladas e pacotes por medida, defeitos por tipo, minutos produtivos, minutos parados, área |

Eventos que esta tela poderia gravar: apenas um registro de auditoria de exportação (quem, quando, período, medida). O protótipo não mostra isso.

Consultas necessárias: resumo por dia filtrado por setor + intervalo de datas (+ medida); totais do período; detalhe do dia por medida, por tipo de defeito e tempos. Tudo cabe em uma consulta agregada; o detalhe do dia já vem junto no protótipo (abrir a linha não busca nada novo).

---

## 7. Navegação

- `‹` (voltar) → `Tela-Teste-<largura>` (tela do operador de Teste & Embalagem). Na versão antiga: `Teste.dc.html`.
- Chegada: botão de histórico no cabeçalho de `Tela-Teste-*`.
- Não há outros links: nada para RH, Setores, OS, nem para o histórico dos outros setores.

---

## 8. Responsividade, parâmetro por parâmetro

### Mecanismo
- **Media queries por largura da janela**, no CSS do próprio componente. Pontos de quebra: `max-width: 1179px`, `max-width: 959px`, `max-width: 719px`.
- A prop `largura` (`pc` / `h` / `v` / `cel`) **não muda o arranjo**; só escolhe o sufixo do link de voltar.
- Marcação única: nada é escondido/duplicado por largura, exceto o logo.
- `prefers-reduced-motion`: desliga a transição e o "afundar" dos botões.
- Faixa intermediária 960 a 1179 px (ex.: tablet 1024 deitado): logo some, resumo em 4 colunas, cartões do detalhe em 2, mas a linha do dia continua em uma faixa só.

### Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 (quadro 390×2450) |
|---|---|---|---|---|
| Regras CSS ativas | base | base | ≤1179 + ≤959 | ≤1179 + ≤959 + ≤719 |
| Altura da página | 100vh (mín. 600) | 100vh | 100vh | automática (mín. 100vh) |
| O que rola | só a lista de dias | só a lista de dias | só a lista de dias | a página inteira |
| O que fica fixo | cabeçalho + filtros + resumo | idem | idem | nada |
| Cabeçalho | 80 px, uma linha, padding 0 24 | idem | idem | altura automática, quebra em 2+ linhas, padding 10 12 |
| Logo 48 px | visível | visível | oculto | oculto |
| Título (período) | 28 px | 28 px | 28 px | 24 px |
| Botão voltar | 52×52 | 52×52 | 52×52 | 52×52 |
| `Exportar CSV` | 52 px alt., largura do texto | idem | idem | 52 px alt., largura total da linha |
| Mensagem `Arquivo gerado…` | à esquerda do botão, uma linha com reticências | idem | idem | linha própria abaixo do botão, quebra texto |
| Filtros: disposição | rótulo ao lado do segmentado; período + medida na mesma linha; busca na mesma linha ou na seguinte | período + medida na 1ª linha; busca cai para a 2ª linha (estimado) | período e medida em linhas separadas; busca na 3ª | cada filtro empilhado: rótulo em cima, controle embaixo, largura total |
| Segmentado | botões 48 px alt., 16 px, padding 0 16 | idem | idem | largura total, botões divididos por igual, padding 0 6 |
| Campo de busca | 260×58 | 260×58 | 260×58 | largura total × 58 |
| Botão `×` | 44×44 | 44×44 | 44×44 | 44×44 |
| Resumo: colunas | 7 | 7 | 4 (4 + 3) | 2 (4 linhas, último sozinho) |
| Resumo: valor / rótulo / nota | 30 / 14 / 13 px | idem | idem | idem |
| Padding lateral | 24 px | 24 px | 24 px | 12 px |
| Linha do dia: grade | `96px · 1fr · auto · 40px` (data, meio, métricas, seta) | idem | `80px · 1fr · 40px` + métricas numa 2ª linha de ponta a ponta | `64px · 1fr · 36px` + métricas na 2ª linha |
| Métricas da linha | 4 em fila à direita, alinhadas à direita, gap 22, mín. 76 px cada | idem | 4 distribuídas na largura, alinhadas à esquerda | idem |
| Data do dia | 30 px | 30 px | 30 px | 26 px |
| Título da linha | 19 px | 19 px | 19 px | 17 px |
| Valor das métricas | 26 px | 26 px | 26 px | 26 px |
| Trilho da meta | 200×8 px, texto ao lado | idem | idem (texto quebra se faltar espaço) | largura total, texto embaixo |
| Seta | 40×40 | 40×40 | 40×40 | 36×36 |
| Alvo de toque da linha | linha inteira (≈ 110 px alt.) | idem | linha inteira (≈ 170 px) | linha inteira |
| Como o detalhe abre | sanfona dentro do cartão do dia | idem | idem | idem |
| Detalhe: recuo | 132 px à esquerda (alinha com a coluna do meio) | idem | sem recuo (18 px) | sem recuo (12 px) |
| Detalhe: colunas de cartões | 3 | 3 | 2 | 1 |
| Cartão do detalhe: nome / valor / linhas | 18 / 26 / 15 px | idem | idem | idem |
| Navegação | só o botão voltar no cabeçalho | idem | idem | idem |

Não há painel lateral, folha de baixo nem tela cheia: em todas as larguras o detalhe é a mesma sanfona. Nada vira "lista × cartão" entre larguras; a linha do dia já é um cartão em todas.

Pontos de atenção para o tablet do operador (1280×800): com a busca visível (30 dias / Este mês) a faixa fixa passa de ~260 px para ~330 px (cabeçalho 80 + filtros em 2 linhas + resumo), sobrando ~470 px para a lista; um dia aberto com 5 cartões (2 linhas de cartões) ocupa quase toda essa área. No tablet em pé a faixa fixa chega a ~420 a 490 px de 1280.

Tipografia e cor: Barlow (texto) e Barlow Semi Condensed 800 (números), `tabular-nums`; fundo `#0A0E15`, cartão `#111824`, borda `#26334A`; foco visível com contorno de 3 px `#DDD6FE`.

Acessibilidade já prevista: `aria-label` no voltar e no limpar, `role="group"` + `aria-labelledby` nos segmentados, `aria-pressed`, `aria-expanded` na linha, `aria-live="polite"` na exportação e no contador da busca, `label` ligado ao campo, `enterkeyhint="search"`.

---

## 9. Fase futura, desabilitado, placeholder

- **Exportar CSV é simulado**: só mostra o nome do arquivo; não há conteúdo, colunas nem download.
- Um comentário no script de `RH2-Painel-Exportar` diz que o painel Exportar do RH "substitui RH · relatórios e os botões CSV/PDF do histórico". Aqui o botão `Exportar CSV` continua na tela: decidir se fica (dúvida 5).
- Prop `estado` declarada e sem uso.
- CSS sem uso nesta tela, herdado do modelo comum de histórico: `.ht-det*`, `.ht-fm*`, `.ht-seg2*`, `.ht-pm*`, `.ht-ph` (usados no histórico da Injetora). Não fazem parte do escopo do Teste.
- `5 m` não tem nenhum dado de exemplo: sempre cai no estado vazio.
- Sem estados de carregando / erro / sem conexão.
- Chip de origem sempre `Tablet Teste` (fixo no script).
- Não há nada marcado com `[ ]` nesta família.

---

## 10. Divergências entre a versão antiga (`Historico-Teste`) e a nova

- Lógica e dados de exemplo **idênticos**. Mudou só: link de voltar por largura, classes CSS nomeadas (em vez de seletores por tag), mensagem de exportação dentro de um `sc-if`.
- **Rolagem**: na versão antiga, abaixo de 1180 px a página inteira rolava. Na nova, o tablet em pé mantém cabeçalho, filtros e resumo fixos e só a lista rola; a página inteira só rola abaixo de 720 px. Vale a nova.
- Detalhe aberto ganhou linha divisória no topo e respiro de 12 px.
- A versão antiga não tinha nenhuma regra a mais que a nova tenha resumido.

---

## 11. Dúvidas reais para o card

1. **Filtro de medida**: deve mostrar o total do dia nos dias que tiveram a medida (como no protótipo) ou só os números daquela medida? Os defeitos existem por medida na tela do operador, então dá para fazer dos dois jeitos.
2. **Placas por pacote**: o histórico fixa 10, mas o operador pode fechar pacote com 1 a 30. Confirmar que o histórico soma as placas reais (e se mostra pacotes "fora do padrão").
3. **Períodos**: `7 dias`, `30 dias` e `Este mês` incluem o dia de hoje em andamento? São dias corridos ou os últimos N dias com registro? `Este mês` mostra o nome do mês; precisa do ano? As datas aparecem sem ano.
4. **Meta**: qual meta vale para um dia antigo quando a meta mudar no RH (a do dia ou a atual)? E com filtro de medida, a comparação com 270 continua fazendo sentido?
5. **Exportar CSV**: fica nesta tela ou só no painel Exportar do RH? Se ficar: colunas, uma linha por dia ou por dia × medida, separador `;` e vírgula decimal, respeita a busca?, quem pode exportar, e o que acontece no tablet do operador (baixar arquivo no aparelho?).
6. **Tempo produtivo**: definição exata (fim − início − pausas? só tempo com lote aberto? almoço conta?). Os exemplos não fecham.
7. **Ritmo**: testadas por hora produtiva (protótipo) ou embaladas por hora?
8. **Origem**: o chip `Tablet Teste` deve mostrar o nome real do tablet? E quando houver lançamento da Administração ou dois tablets no mesmo dia?
9. **Acesso**: o operador vê o histórico sem login, só por estar no tablet vinculado? RH/admin entram por onde (não há link do RH para esta tela)?
10. **Sem conexão**: o histórico precisa abrir offline (dados em cache no Dexie) ou basta um aviso "sem conexão"? Faltam também os estados de carregando e de erro.
11. **Volume**: 30 dias traz até ~22 linhas sem paginação; haverá período maior ou seletor de datas livre no futuro?
12. **Dia inicial aberto**: abrir sempre o dia mais recente (como no exemplo) ou começar tudo fechado?
13. **Medidas sem dado**: `5 m` deve aparecer sempre no filtro, mesmo sem produção no período?
14. **Virada do dia**: fuso (America/Sao_Paulo) e o que fazer com produção que passa da meia-noite ou com dois turnos no mesmo dia.
15. **Correções**: o histórico é só leitura para todos, ou alguém (admin) poderá corrigir um dia a partir daqui?
16. **Busca**: confirmar que só existe em `30 dias` e `Este mês`, e que não afeta os cartões de resumo nem a exportação.
