# Mapa · RH · Painel Exportar (`rh-exportar`)

Fonte: quadros `RH2-Painel-Exportar` (PC 1440×1320), `RH2-Painel-Exportar-Celular` (390×1370) e `RH2-Painel-Exportar-Celular-Previa` (390×1170).
Apoio: `Briefing-RH-1-Estrutura`, `Briefing-RH-2-Visual`, `Briefing-RH-3-Telas` (seção 11), `Briefing-RH-4-Entrega` (seções 13 e 18), e os botões "Exportar CSV" de `Historico-*` / `Tela-Hist*`.

> Observação sobre os arquivos: os três quadros são **byte a byte o mesmo componente da tela RH · Desempenho**. Só mudam o `<title>` e as props iniciais:
> `largura` (`pc` / `celular`), `painel: "exportar"` (abre o painel já no carregamento) e `previa` (`""` / `"sim"`).
> O bloco de CSS, a marcação e a lógica do painel (`painelInicial`, `pxDe`, `paineisVals`) são **idênticos** em `RH2-Agora`, `RH2-Desempenho`, `RH2-Pedidos` e `RH2-Pausas` (conferido com `diff`). Não existe quadro de tablet para o painel; o comportamento de tablet sai das media queries.

---

## 1. Propósito e quem usa

- **O que é:** um painel (diálogo modal) que abre **por cima de qualquer tela do RH** para montar e baixar um relatório/exportação: escolhe tipo, período, medida, setores, seções e formato, vê a prévia do documento e baixa.
- **Quem usa:** RH / gestão (pill "RH" ao lado do logo). Não é tela do operador. Não há quadro de admin.
- **O que substitui:** a antiga tela "RH · Relatórios" e os botões "Exportar CSV" / "PDF" do Histórico (comentário no script: `// Painel Exportar (substitui RH · relatórios e os botões CSV/PDF do histórico)`).
- **Por que é painel e não tela:** briefing: "Editar metas e gerar relatório deixam de ser telas: viram painéis que abrem por cima de qualquer tela, porque são ações, não lugares de consulta." Decisão reversível declarada no briefing 4: "Se a prévia do relatório precisar de mais espaço, Relatórios pode voltar a ser a quarta tela."

## 2. Onde abre (pontos de entrada)

| Largura | Gatilho | Detalhe |
|---|---|---|
| PC (≥1200) e tablet (768–1199) | Botão **"Exportar"** na barra do topo (`.r2-act`, ícone de download), ao lado de **"Metas"** | altura 40 px no PC, 44 px no tablet; `aria-haspopup="dialog"` |
| Celular (≤767) | Botão **"⋯"** (48×48, `aria-label="Metas e Exportar"`; em Pedidos e Pausas o rótulo é "Mais opções") abre um menu flutuante com **"Metas"** e **"Exportar"** | menu em `top:64px; right:12px`, largura mínima 210 px, itens de 48 px; fundo escurecido `rgba(5,8,13,.45)` fecha ao tocar. Em Pedidos o menu tem mais dois itens ("Definir mínimos", "Ajustar estoque"), fora desta família |

**Pré-preenchimento pelo contexto da tela de origem** (`pxDe(ctx)`, chamado em `abrirExportar`):

| Tela de origem | `ctx` passado | Efeito no painel |
|---|---|---|
| Agora | `{ tam }` | Medida = filtro de medida da tela; tipo "Relatório mensal"; período "Novembro 2026"; todos os setores |
| Desempenho | `{ per, tam, setor }` | Período = "Últimos 7 dias" se a tela está em `7d`, senão mês corrente ("Novembro 2026", inclusive quando a tela está em Hoje/Trimestre/Ano); Medida = filtro da tela; Setores = só o setor filtrado (ou os 3 se "todos") |
| Pedidos e estoque | `{ tipo: 3, tam }` | Tipo já em **"Pacotes e estoque"**; Medida = filtro da tela |
| Pausas | `{ tipo: 0 }` | Tipo "Relatório mensal"; resto padrão |

Regras de abertura:
- Abrir sempre **reinicia** tipo, período, medida e setores a partir do contexto e volta para o formulário (`pxPrev: false`), fechando o menu "⋯".
- **Seções, formato e a opção de e-mail NÃO são reiniciados** ao reabrir: ficam como o usuário deixou enquanto a tela estiver montada (estado local; some ao trocar de tela/recarregar).
- Padrões iniciais: tipo 0 ("Relatório mensal"), período `nov`, medida `todas`, 3 setores marcados, 6 seções marcadas, formato `pdf`, e-mail desmarcado.

## 3. Blocos do painel, de cima para baixo

Estrutura: `div.r2-pw` (fixo, `inset:0`, `z-index:70`) → fundo clicável `rgba(5,8,13,.66)` → `aside.r2-pp.lg` (`role="dialog" aria-modal="true"`), colado à direita, altura total, com 3 faixas: **cabeçalho** (fixo), **corpo** (rola) e **rodapé** (fixo).

### 3.1 Cabeçalho (`.r2-pp-h`)
- PC/tablet: ícone de download (24 px, azul `#93C5FD`) + título **"Exportar"** (Barlow Semi Condensed 800, 30 px) + botão **X** (44×44, `aria-label="Fechar exportar"`). Altura mínima 68 px.
- Celular: botão **"‹ Voltar"** (48 px de altura, azul) no lugar do X; título 24 px sem ícone; altura mínima 60 px. No estado prévia o título vira **"Prévia"** e o botão vira **"‹ Formulário"**.

### 3.2 Formulário (`.r2-px-f`), rótulos em caixa alta 14 px (`.r2-cap`)

1. **TIPO** — 5 blocos em grade de 2 colunas (o 5º fica sozinho na 3ª linha), cada um com ícone + nome, altura mínima 76 px, seleção única (`aria-pressed`). Selecionado: borda 2 px `#60A5FA`, fundo `#16223A`. O `title` (dica) de cada bloco traz a descrição:
   | # | Nome | Descrição (tooltip) |
   |---|---|---|
   | 0 | Relatório mensal | "Resumo da fábrica, setores, medidas, perdas, operadoras e metas" |
   | 1 | Produção por operadora | "Montagem por pessoa, medida e dia" |
   | 2 | Perdas e defeitos | "Injetora (cabeçote, caninho, meio/total) e Teste, por medida" |
   | 3 | Pacotes e estoque | "Entradas, reservas por OP e expedições" |
   | 4 | Fechamentos e correções | "Quem fechou, corrigiu ou usou −1 em cada dia" |
2. **PERÍODO** — pílulas de seleção única: "Novembro 2026" · "Outubro 2026" · "Últimos 7 dias" · "Escolher datas". Com "Escolher datas" aparecem dois campos `type="date"` lado a lado: **"De"** e **"Até"** (altura 44 px, `color-scheme: dark`).
3. **MEDIDA** — pílulas de seleção única: "Todas" · "2 m" · "3 m" · "4 m" · "5 m" (tooltip: "2 m · 1 m²", "3 m · 1,5 m²", "4 m · 2 m²", "5 m · 2,5 m²").
4. **SETORES** — pílulas de seleção **múltipla** (liga/desliga), cada uma com quadradinho da cor do setor: "Injetora" (`#60A5FA`) · "Montagem" (`#2DD4BF`) · "Teste & Embalagem" (`#C4B5FD`). Pode ficar com nenhum marcado.
5. **SEÇÕES** — 6 caixas de marcar empilhadas (linha inteira clicável, caixa de 22 px): "Resumo do período" · "Por setor e meta" · "Por medida" · "Perdas e defeitos" · "Operadoras" · "Pontos de atenção".
6. **FORMATO** — pílulas de seleção única: "PDF" (padrão) · "Excel" · "CSV".
7. Caixa de marcar solta: **"Enviar todo dia 1º por e-mail para o RH"**.

### 3.3 Prévia (`.r2-px-p`) — fundo `#182233`, "folha" branca centrada (`.r2-doc`, largura máx. 680 px, `role="img" aria-label="Prévia do relatório"`)

De cima para baixo na folha:
- **Cabeçalho do documento:** logo AquaPulse 52×52 + "AQUAPULSE" (14 px, espaçado) + **título = nome do tipo escolhido**; à direita o período em negrito e uma segunda linha (ex.: "Novembro 2026" / "até 09/11 · 5 dias"; "Últimos 7 dias" / "03/11 a 09/11"). Linha preta de 2 px embaixo.
- **Chips de filtro:** medida ("Todas as medidas" ou "3 m · 1,5 m²") e setores ("Todos os setores", ou os nomes unidos por " · ", ou "Nenhum setor").
- **Resumo do período** (se a seção estiver marcada): 4 indicadores em linha.
  - Todas as medidas: "Placas 4.640" · "Área 7.313 m²" · "Perdas 262 · 5,34%" · "Produtivo 137h51".
  - Uma medida: "Placas boas {q}" · "Área {m²}" · "Perdas {n} · {erro}" · "Participação {q/3.136}%".
- **"Por setor e meta do mês"** (seção marcada E pelo menos um setor): tabela Setor | Placas | m² | Meta. Exemplo: Injetora 1.504 / 2.269,5 / 27% · Montagem 1.696 / 2.539,5 / 30% · Teste & Embalagem 1.440 / 2.504 / 25%. Só aparecem as linhas dos setores marcados.
- Duas colunas lado a lado (aparece se uma das duas existir):
  - **"Por medida"**: uma linha por medida com produção, ex.: "3 m · 1,5 m² — 2.343 · 6,8% erro", "4 m · 2 m² — 407 · 5,1% erro", "2 m · 1 m² — 386 · 7,2% erro" (ordem do exemplo: maior volume primeiro; 5 m, com zero, não aparece). Com filtro de medida, só a medida filtrada.
  - **"Montagem por operadora"** (seção "Operadoras" marcada E setor Montagem marcado): Maiara 766 · Helena 413 · Maria 364 · Daniel 153.
- **"Perdas e defeitos"**: "Perdas no período 262 · 5,34%" · "Perdas por dia 4,1% → 10,0%" · "Caninho (teste) 12" · "Cabeçote (teste) 28".
- **"Pontos de atenção"** (caixa rosada `#FEF2F2`, texto vinho): "• Perdas subindo: 4,1% em 03/11 para 10,0% em 09/11." e "• Aprovação no teste em 86,6% (meta a definir)."
- **Rodapé do documento:** "Gerado em 10/11/2026 às 09:49 · página 1 de 2".

### 3.4 Rodapé do painel (`.r2-pp-f`), fixo embaixo
- PC/tablet: **"Fechar"** (secundário, contorno) + **"Baixar PDF"** (primário azul `#2563EB`, ícone de download). Alinhados à direita.
- Celular: **"Ver prévia"** (secundário) + **"Baixar PDF"** (primário), cada um ocupando metade da largura. No estado prévia, "Ver prévia" vira **"Formulário"**.
- O rótulo do primário acompanha o formato: **"Baixar PDF" / "Baixar Excel" / "Baixar CSV"**.

## 4. Ações e o que a lógica faz

| Ação | Efeito no script |
|---|---|
| Botão "Exportar" (topo) ou item "Exportar" (menu ⋯) | `painel='exportar'`, fecha menu, `pxPrev=false`, aplica `pxDe(ctx)` (tipo, período, medida, setores da tela de origem) |
| Clique no fundo escuro, X, "Fechar" | `fecharPainel`: `painel=null`, `pxPrev=false`. Sem confirmação; nada é "salvo" |
| "‹ Voltar" (celular, formulário) | fecha o painel |
| "‹ Formulário" (celular, prévia) / botão "Formulário" do rodapé | volta ao formulário (`pxPrev=false`) |
| "Ver prévia" (celular) | alterna `pxPrev` (mostra só a prévia, esconde o formulário) |
| Bloco de TIPO | `pxTipo=i`. **Na prévia só muda o título do documento**; o conteúdo continua o do relatório mensal |
| Pílula de PERÍODO | `pxPer`. `nov` e `7d` têm dados (prévia cheia; só mudam as duas linhas de período do cabeçalho, os números são os mesmos). `out` → prévia vazia "Sem dados de outubro". `datas` → mostra De/Até e prévia vazia "Escolha as datas" |
| Campos "De" / "Até" | `<input type="date">` **sem ligação com estado**: não validam nem alteram a prévia (título fica "[início] a [fim]") |
| Pílula de MEDIDA | `pxTam`. Troca os 4 indicadores para a versão por medida, reduz "Por medida" a uma linha, e põe **"[ ]"** nas células de setor, operadoras, caninho e cabeçote (dados por medida não definidos) |
| Pílula de SETOR | liga/desliga; filtra as linhas da tabela de setores; sem nenhum → tabela some e chip "Nenhum setor"; sem Montagem → some "Montagem por operadora" |
| Caixa de SEÇÃO | liga/desliga o bloco correspondente na prévia |
| Pílula de FORMATO | `pxFmt`; só muda o rótulo do botão de baixar. A prévia é a mesma para PDF, Excel e CSV |
| "Enviar todo dia 1º por e-mail para o RH" | alterna `pxMail`; **nenhum outro efeito** (sem destinatário, sem confirmação, sem persistência) |
| "Baixar PDF/Excel/CSV" | **botão sem `onClick`**: o protótipo não gera arquivo, não mostra carregando, sucesso nem erro |

Não há no script: tecla Esc, armadilha de foco, estado de carregando, erro, desfazer ou confirmação. A prévia responde na hora a cada toque.

## 5. Estados

| Estado | Como aparece |
|---|---|
| Fechado | só a tela de origem |
| Aberto · formulário + prévia (PC/tablet) | padrão do quadro `RH2-Painel-Exportar` |
| Aberto · formulário (celular) | quadro `RH2-Painel-Exportar-Celular`; prévia escondida |
| Aberto · prévia (celular) | quadro `RH2-Painel-Exportar-Celular-Previa`; formulário escondido, título "Prévia" |
| Prévia vazia · período sem dados | caixa tracejada na folha: "Sem dados de outubro" (cabeçalho mostra "Outubro 2026" / "[ ]") |
| Prévia vazia · datas não escolhidas | "Escolha as datas" (cabeçalho "[início] a [fim]" / "[ ]") |
| Nenhum setor marcado | chip "Nenhum setor"; sem tabela de setores; o resto continua (resumo, medidas, perdas, atenção) |
| Todas as seções desmarcadas | folha só com cabeçalho, chips e rodapé; "Baixar" continua habilitado |
| Filtro por medida | células "[ ]" (ver ação MEDIDA) |
| Carregando, erro, sem conexão, sem permissão, download concluído, e-mail agendado | **não existem no protótipo** |

## 6. Regras de negócio e contas (valores de exemplo)

- **Data/hora do exemplo:** 10/11/2026, 09:49. Mês corrente = novembro/2026, "até 09/11 · 5 dias" com produção. "Últimos 7 dias" = 03/11 a 09/11 (não inclui o dia em curso).
- **Medidas e área:** 2 m = 1 m², 3 m = 1,5 m², 4 m = 2 m², 5 m = 2,5 m² por placa. Confere: 2.343 × 1,5 = 3.514,5 m²; 407 × 2 = 814 m²; 386 × 1 = 386 m². (Catálogo de medidas: parece configurável/cadastro.)
- **Por medida (exemplo):** 2 m: 386 placas, 30 perdas, 7,2% erro · 3 m: 2.343, 170, 6,8% · 4 m: 407, 22, 5,1% · 5 m: 0.
- **Participação** = placas boas da medida ÷ total das medidas (386+2.343+407 = 3.136), arredondado. Ex.: 3 m = 75%.
- **Coluna "Meta"** da tabela de setores = produção do mês ÷ meta do mês do setor (270/dia × 21 dias úteis = 5.670): 1.504→27%, 1.696→30%, 1.440→25%. Metas e dias úteis vêm do painel Metas (configuráveis pelo RH).
- **O que conta por setor** (do painel Metas, mesmo código): Injetora = placas boas; Montagem = placas montadas; Teste & Embalagem = placas embaladas.
- **Resumo geral:** Placas 4.640 = 1.504 + 1.696 + 1.440 (soma dos 3 setores); Área 7.313 m² = 2.269,5 + 2.539,5 + 2.504; Perdas 262 · 5,34%; Produtivo 137h51 (tempo produtivo somado).
- **Operadoras:** soma = 1.696 = total da Montagem (766+413+364+153). Só Montagem tem quebra por pessoa.
- **Perdas:** total do período com %, tendência por dia (primeiro → último dia: 4,1% → 10,0%), defeitos do teste por tipo (caninho, cabeçote). O tipo "Perdas e defeitos" cita ainda Injetora com cabeçote, caninho e "meio/total".
- **Pontos de atenção:** frases geradas a partir dos dados (perdas subindo; aprovação no teste 86,6% com "meta a definir"). Regra de geração não definida.
- **Divergência de totais registrada no briefing 4 (seção 13):** Analytics dá 4.640 placas / 7.313 m² / 5,34%; o Histórico, nos mesmos dias, 4.482 boas / 7.076 m² / 5,5%. O painel usa os números do Analytics; a diferença está listada como pergunta em aberto.
- **Formato principal:** PDF ("PDF (principal), Excel, CSV").
- **Envio recorrente:** "todo dia 1º", para "o RH" (presume o relatório do mês anterior fechado).
- **Paginação:** rodapé "página 1 de 2" indica que o PDF tem mais de uma página; a prévia mostra só a primeira.

## 7. Entidades e dados implícitos

O painel não grava produção; ele **lê** quase tudo o que as outras telas gravam. Para funcionar de verdade precisa de:

- **Produção diária** por setor × medida × dia: placas (boas / montadas / embaladas), área derivada da medida.
- **Produção por operadora** (Montagem): operadora, medida, dia, quantidade.
- **Perdas/defeitos**: setor, tipo (Injetora: cabeçote, caninho, meio/total; Teste: caninho, cabeçote), medida, dia, quantidade; % de erro.
- **Tempo produtivo e pausas** por setor/dia (para "Produtivo 137h51").
- **Metas**: meta por dia por setor, dias úteis do mês (painel Metas).
- **Pacotes e estoque**: entradas, reservas por OP/OS, expedições (tipo 3).
- **Fechamentos e correções**: quem fechou o dia, quem corrigiu, uso do "−1", por dia/setor — ou seja, **log de auditoria com autor** (tipo 4).
- **Catálogos**: setores (nome, cor), medidas (comprimento, m²), operadoras.
- **Novos, próprios desta família:**
  - `exportacao` (opcional, auditoria): quem gerou, quando, tipo, período (início/fim), medida, setores, seções, formato, arquivo/URL.
  - `envio_agendado` / `relatorio_recorrente`: ativo, dia do mês (1), tipo, filtros, seções, formato, destinatários (e-mails do RH), último envio, resultado.
- **Eventos que a tela gravaria:** "exportação gerada" (se houver auditoria) e "envio mensal ligado/desligado". No protótipo nada é gravado.
- **Serviços implícitos:** gerador de PDF (o CLAUDE.md do projeto prevê "PDF no Railway"), gerador de XLSX e CSV, envio de e-mail agendado (cron mensal), consulta agregada reutilizável pela prévia e pelo arquivo.

## 8. Navegação

- O painel não tem rota própria no protótipo: é estado da tela (`painel`). Fechar volta à tela de origem no mesmo ponto.
- Por baixo do painel a navegação do RH continua a mesma: logo → `Hub.dc.html`; abas **Agora**, **Desempenho**, **Pedidos e estoque** (rótulo curto "Pedidos" em tablet/celular), **Pausas** → `RH2-<Tela><sufixo>.dc.html` (sufixo `-Tablet` / `-Celular` pela prop `largura`).
- Divergência: o briefing 2 fala em "3 abas"; o protótipo tem **4** (Pausas entrou depois). No celular a barra de baixo é uma grade de 4 colunas.
- O comentário do código diz "o mesmo código nas três telas (Agora, Desempenho, Pedidos e estoque)", mas o painel está também em **Pausas** (4 telas).

## 9. Responsividade

**Mecanismo:** uma única marcação + **media queries CSS por largura da janela**: PC `≥1200px` (base), tablet `768–1199px` (`@media (max-width:1199px)`), celular `≤767px` (`@media (max-width:767px)`). A prop `largura` **não** troca o arranjo: só escolhe o sufixo dos links de navegação. No celular a troca formulário ↔ prévia é por **estado** (`pxPrev` → classe `.prev` em `.r2-px`); botões só-celular/só-PC usam as classes `.r2-ph-only` / `.r2-pc-only`.

### Tabela parâmetro × largura

| Parâmetro | PC 1440 (≥1200) | Tablet 820 em pé (768–1199) | Celular 390 (≤767) |
|---|---|---|---|
| Quadro no protótipo | `RH2-Painel-Exportar` 1440×1320 | **não há quadro**; só CSS | `…-Celular` 390×1370 e `…-Celular-Previa` 390×1170 |
| Como abre | painel lateral direito, largo | painel lateral direito | tela cheia |
| Largura do painel | `min(1180px, 100% − 48px)` → 1180 px | `min(780px, 100%)` → 780 px (sobram 40 px de fundo à esquerda em 820) | 100%, sem borda nem sombra |
| Fundo atrás | escurecido `rgba(5,8,13,.66)`, clicável para fechar | idem | não aparece |
| Gatilho | botão "Exportar" no topo (40 px) | botão "Exportar" no topo (44 px) | "⋯" (48×48) → menu → "Exportar" (item 48 px) |
| Cabeçalho | 68 px mín.; ícone + "Exportar" 30 px; X 44×44 | igual ao PC | 60 px mín.; "‹ Voltar" (48 px) + título 24 px sem ícone; sem X |
| Colunas do corpo | 2: formulário **400 px** fixo à esquerda + prévia no resto (~780 px) | 1: formulário em cima, prévia embaixo | 1: **ou** formulário **ou** prévia |
| O que rola | formulário e prévia rolam **separados**, cada um na sua coluna | formulário + prévia rolam **juntos** numa coluna só | o formulário (ou a prévia) rola; a página de trás não |
| O que é fixo | cabeçalho e rodapé do painel | cabeçalho e rodapé do painel | cabeçalho e rodapé do painel |
| Divisor formulário/prévia | borda à direita do formulário | borda embaixo do formulário | — |
| Espaçamento do formulário | 18 px topo, 20 px lados, 24 px base; 18 px entre grupos | igual | 16 px |
| TIPO | grade 2 col., blocos ≥76 px, texto 15 px | igual | igual (2 col. em ~171 px cada) |
| Pílulas (período, medida, setores, formato) | altura mín. 40 px, 15 px | 44 px | 48 px |
| Caixas de marcar (seções, e-mail) | linha de 44 px, caixa 22 px | 44 px | 48 px |
| Campos De / Até | 2 colunas, 44 px | igual | 2 colunas, 44 px (não sobe para 48) |
| Fundo da prévia | `#182233`, padding 24 px | igual, abaixo do formulário | padding 12 px |
| Folha da prévia | máx. 680 px, padding 32×36, gap 18 | igual (≈680 px dentro de 780) | largura total, padding 18×16, gap 14 |
| Cabeçalho da folha | logo+título à esquerda, período à direita; título 28 px | igual | empilhado, tudo à esquerda; título 22 px |
| Indicadores do resumo | 4 em linha, valor 22 px | 4 em linha | 2 × 2 |
| "Por medida" + "Operadoras" | 2 colunas | 2 colunas | 1 coluna (empilhados) |
| Tabela de setores | 4 colunas (1,6fr + 3×1fr), 14 px | igual | igual (mesma grade, mais apertada) |
| Rodapé do painel | "Fechar" + "Baixar PDF" à direita, 48 px de altura, padding 14×20 | igual | "Ver prévia"/"Formulário" + "Baixar PDF", metade cada (`flex:1`), 48 px, padding 12×16×16 |
| Botão principal | "Baixar PDF", 48 px, 16 px/700, azul | igual | igual, meia largura |
| Ver a prévia | sempre à vista, ao vivo | rolando para baixo | toque em "Ver prévia" (troca de vista); volta por "Formulário" |
| Navegação por baixo | abas no topo | abas compactas no topo (2 linhas) | barra fixa embaixo com 4 ícones; coberta pelo painel |

Notas:
- Briefing: "**PC:** painel largo, formulário à esquerda e prévia à direita. **Tablet:** formulário e prévia abaixo. **Celular:** formulário em tela cheia e botão 'Ver prévia'."
- **Tablet horizontal 1280×800** (aparelho do operador no resto do sistema) cai na faixa PC (≥1200): painel de 1180 px, duas colunas; com 800 px de altura as duas colunas rolam por dentro.
- Regra geral do briefing: "Nada é escondido numa largura e mostrado em outra" e "A página nunca rola na horizontal". No celular a prévia não some: muda de vista.
- Tipografia: Barlow (texto) e Barlow Semi Condensed (títulos e números). Raios 10–12 px nos controles; a folha da prévia tem raio 6 px e fundo branco (único bloco claro do tema escuro). `prefers-reduced-motion` tratado no resto da tela.
- Alvos de toque: mínimo 40 px no PC, 44 no tablet, 48 no celular.

## 10. Fase futura, desabilitado, "[ ]" e placeholders

- **"Baixar PDF/Excel/CSV"**: sem ação no protótipo.
- **"Enviar todo dia 1º por e-mail para o RH"**: só liga/desliga visualmente.
- **Campos De/Até**: sem estado, sem validação; cabeçalho da prévia fica "[início] a [fim]".
- **"[ ]"** (dado ainda não definido): segunda linha do período em "Outubro 2026" e em "Escolher datas"; Placas/m²/Meta por setor quando há filtro de medida; operadoras com filtro de medida; "Caninho (teste)" e "Cabeçote (teste)" com filtro de medida.
- **Outubro 2026**: "Sem dados de outubro" (o exemplo só tem novembro).
- **Tipos 1 a 4** (Produção por operadora, Perdas e defeitos, Pacotes e estoque, Fechamentos e correções): só trocam o título; **o leiaute de cada documento não foi desenhado**.
- **Prévia de Excel/CSV**: não existe; a folha é sempre a do PDF.
- **Página 2** do PDF ("página 1 de 2"): não desenhada.
- **"Aprovação no teste em 86,6% (meta a definir)"**: a meta de aprovação do teste não existe ainda.
- Nada aparece como botão `disabled` neste painel.

## 11. Divergências com a versão anterior / outras telas

- A tela antiga "RH · Relatórios" não está nesta pasta do protótipo (só é citada nos briefings); o painel declara ter "tudo o que a tela Relatórios tem, com a prévia".
- Os históricos por setor (`Historico-*` antigos **e os novos `Tela-HistInjetora/HistMontagem/HistTeste`**) **ainda têm o botão "Exportar CSV"** com lógica própria: gera o nome `historico-<setor>_<periodo>_<todas|Nm>.csv`, só se houver linhas, e mostra "Arquivo gerado: <nome>". O briefing do RH diz que o painel substitui esses botões, mas eles continuam nas telas do operador. Precisa decidir se convivem.
- Briefing fala em 3 abas e "três telas"; o código tem 4 telas com o painel (inclui Pausas).
- Seção "Por setor e meta" (formulário) × "Por setor e meta do mês" (documento); "Operadoras" × "Montagem por operadora".
- A coluna "Meta" é sempre "do mês", mesmo com período "Últimos 7 dias" ou datas livres.

## 12. Dúvidas reais para quem for escrever os cards

1. Qual é o conteúdo (colunas, blocos, páginas) de cada um dos 4 tipos além do "Relatório mensal"? A lista de SEÇÕES vale para todos os tipos ou muda por tipo?
2. O que vai na página 2 do relatório mensal?
3. Excel e CSV: quais abas/colunas? CSV é um arquivo só ou um por seção (zip)? As SEÇÕES se aplicam a CSV?
4. A lista de PERÍODO é fixa ("mês atual", "mês anterior", "últimos 7 dias", "datas") ou deve cobrir hoje/trimestre/ano como a tela Desempenho? Quando a tela está em Hoje/Trimestre/Ano o painel cai no mês atual: é isso mesmo?
5. "Escolher datas": limites (intervalo máximo, datas futuras, De > Até), e como a coluna "Meta do mês" se comporta em períodos que não são um mês.
6. Com filtro de medida, de onde vêm produção por setor, por operadora e defeitos do teste por medida (hoje "[ ]")? Se o dado não existir, a linha some ou mostra traço?
7. E-mail do dia 1º: para quais endereços, quem pode ligar, vale por usuário ou para a fábrica, usa os filtros/seções/formato marcados na hora, manda o mês anterior fechado, a que horas, e onde se vê/cancela depois? Precisa de provedor de e-mail no orçamento?
8. Os "Pontos de atenção": quais regras geram cada frase (limiares de perda, tendência, aprovação do teste) e qual é a meta de aprovação?
9. Totais: usar a conta do Analytics (4.640 / 7.313 m² / 5,34%) ou a do Histórico (4.482 / 7.076 m² / 5,5%)? "Placas" soma os 3 setores (a mesma placa conta 3 vezes)?
10. Quem pode exportar: só RH, ou também admin/gestor? O tipo "Fechamentos e correções" expõe nomes: tem restrição?
11. Precisa de histórico/auditoria das exportações geradas e de guardar o arquivo (S3), ou é gerar e baixar?
12. Nenhum setor marcado ou nenhuma seção marcada: bloquear "Baixar" com aviso ou gerar assim mesmo?
13. Estados de carregando/erro/sem dados no download e comportamento sem conexão (o sistema tem modo offline): exportar exige rede?
14. As escolhas (seções, formato) devem ser lembradas entre sessões por usuário?
15. A prévia deve ser o PDF real renderizado ou um HTML equivalente (como no protótipo)? Precisa bater 1:1 com o arquivo?
16. Tablet do RH em pé (820) ou deitado (1180/1280)? No deitado vale o arranjo de PC. Não há quadro de tablet para conferir o resultado.
17. O painel deve ter URL própria (link direto, botão voltar do navegador/Android fecha o painel) e fechar com Esc?
18. Os botões "Exportar CSV" dos históricos por setor continuam, ou passam a abrir este painel já filtrado no setor?
19. Nome do arquivo baixado (padrão), fuso e formato de números/datas (pt-BR, vírgula decimal no CSV, separador `;`?).
