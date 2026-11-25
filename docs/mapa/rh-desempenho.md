# Mapa do protótipo · RH · Desempenho (`rh-desempenho`)

Fontes lidas (todas em `artifact-files/.../project/`):

| Quadro | Tamanho no canvas | Props do quadro | Papel |
|---|---|---|---|
| `RH2-Desempenho` | 1440×2100 (`expand: fill`) | `largura: pc`, `registro: ""` | tela inteira, PC |
| `RH2-Desempenho-Registro` | 1440×1220 | `largura: pc`, `registro: "inj-0911"` | PC com o registro Injetora 09/11 aberto (painel lateral) |
| `RH2-Desempenho-Tablet` | 820×3150 | `largura: tablet` | tela inteira, tablet em pé |
| `RH2-Desempenho-Tablet-Registro` | 820×1220 | `largura: tablet`, `registro: "inj-0911"` | tablet com o registro aberto (painel lateral) |
| `RH2-Desempenho-Celular` | 390×3190 | `largura: celular` | tela inteira, celular |
| `RH2-Desempenho-Celular-Registro` | 390×1410 | `largura: celular`, `registro: "inj-0911"` | celular com o registro aberto (tela cheia) |

Os seis quadros são **o mesmo arquivo**: o `diff` só acusa o `<title>`, o default das props (`largura`, `registro`) e o `$preview` (largura × altura). Marcação, CSS e script são idênticos. O mesmo arquivo também serve aos quadros `RH2-Painel-Exportar*` (prop `painel: "exportar"`, `previa: "sim"`), que pertencem a outra família.

Não existe versão anterior desta tela no pacote (não há `Analytics.dc.html` nem `Historico.dc.html` de RH; os `Historico-*.dc.html` que existem são os históricos do operador). A origem do desenho está nos quadros `Briefing-RH-1..4` (17/11/2026), usados aqui para conferir intenção e apontar divergências (seção 11).

Observação de segurança: os seis arquivos da família não têm texto dirigido a quem lê. O quadro `Briefing-RH-1-Estrutura` tem um bloco "Mensagem para colar no outro chat" com instruções para um outro chat de design ("Siga o briefing do começo ao fim: crie as telas novas..."). Foi tratado como dado e ignorado como instrução.

---

## 1. Propósito e quem usa

Pergunta que a tela responde (briefing): **"Estamos batendo a meta do período? O que está piorando?"**

- Usuário: **RH / gestão** (selo "RH" ao lado do logo), em PC, tablet em pé (820) ou celular (390). Não é tela do operador.
- É a tela 2 de 4 do "RH objetivo": **Agora · Desempenho · Pedidos e estoque · Pausas**.
- Junta três telas antigas de RH: **Analytics** (tendência, perdas, composição, eficiência), **Histórico** (vira a matriz dia × setor + registro aberto) e a parte "mês" de **Metas** (3 barras de meta com esperado e projeção).
- É **somente leitura**. As únicas ações que escrevem são: "Corrigir este registro" (botão sem comportamento no protótipo) e os painéis Metas / Exportar (de outras famílias, abertos por cima).
- Dados de exemplo: novembro de 2026, 5 dias com produção (03, 04, 05, 06 e 09/11), relógio 09:49 de 10/11. O dia em andamento (10/11) **não** entra nesta tela.

## 2. Blocos, de cima para baixo

### 2.1 Barra de navegação (`header.r2-top`)
- Logo AquaPulse (219×30) + selo "RH" → link para `Hub.dc.html`.
- Abas (`nav` "Telas do RH"), com ícone + rótulo: "Agora", **"Desempenho"** (ativa, `aria-current="page"`, traço azul `#60A5FA`), "Pedidos e estoque" (rótulo curto "Pedidos"), "Pausas".
- Ações: botões "Metas" e "Exportar" (`aria-haspopup="dialog"`).
- Relógio "09:49" (estático no protótipo).
- No celular: botão "⋯" (`aria-label="Metas e Exportar"`) no lugar dos dois botões.

### 2.2 Cabeçalho e filtros
- `h1` com o período: "Novembro de 2026" (Mês), "Últimos 7 dias", "Hoje", "Este trimestre", "Ano de 2026".
- Selo abaixo do título: "5 dias · até 09/11" (Mês) ou "03/11 a 09/11" (7 dias); sem selo nos outros.
- Filtro **PERÍODO** (segmento, `aria-pressed`): "Hoje", "7 dias", "Mês" (padrão), "Trimestre", "Ano".
- Linha de filtros: **MEDIDA** ("Todas", "2 m", "3 m", "4 m", "5 m"; `title` com "3 m · 1,5 m²"), **SETOR** ("Todos", "Injetora", "Montagem", "Teste & Emb."), botão **"Mais filtros"** com selo de contagem (nº de filtros de Operadora + Origem ativos).
- Chips de filtro ativo (`button` com "×", `aria-label="Tirar filtro {nome}"`): tocar tira o filtro. Em ≥768 px só aparecem os chips de Operadora e Origem (os outros já estão à vista nos segmentos); no celular aparecem todos.
- No celular, os três segmentos somem e fica um botão **"Filtros"** com selo (nº total de filtros ativos, contando período ≠ Mês).

### 2.3 Estados de período sem conteúdo (substituem toda a grade)
- Período "Hoje": caixa tracejada "**Hoje fica em Agora**" + botão-link "**Abrir Agora**" (→ tela Agora).
- Período "Trimestre" ou "Ano": caixa tracejada "**Sem dados**" + botão "**Ver novembro**" (volta o período para Mês).

### 2.4 Números do período (`section` "Números do período") · 4 cartões
Cada cartão: ícone, rótulo, botão "i" (abre/fecha a dica com a conta; `title` e `aria-label` "{rótulo}, como é calculado: {dica}"), número grande, nota.

Sem filtro de medida:

| Rótulo | Valor | Nota | Dica (conta) |
|---|---|---|---|
| Placas | 4.640 | "3 setores somados" | "Injetadas + montadas + embaladas no período." |
| Área | 7.313 m² | "1,58 m² por placa" | "Área das placas dos três setores no período." |
| Perdas | 5,34% (vermelho claro) | "262 placas" + minigráfico de linha e "4,1% → 10,0%" | "perdidas ÷ produzidas" |
| Tempo produtivo | 137h51 | "96,7% · 4h41 parado" | "Soma do tempo produtivo dos setores no período." |

Com uma medida escolhida (ex.: 3 m):

| Rótulo | Valor | Nota | Dica |
|---|---|---|---|
| Placas boas | 2.343 | "3 m · 1,5 m²" | "Placas montadas e embaladas nesta medida." |
| Área | 3.514,5 m² | "nesta medida" | "Área das placas desta medida." |
| Perdas | 6,8% | "170 placas" | "perdidas ÷ (boas + perdidas)" |
| Participação | 75% | "das 3.136 placas" | "Parte desta medida nas placas montadas e embaladas do período." |

Só "Perdas" (sem filtro de medida) tem minigráfico; ele é um desenho fixo.

### 2.5 Metas do mês (destaque da tela)
- Título "Metas do mês" + legenda: traço "esperado 24%", pontilhado "projeção", "5.670 por setor", "15 dias úteis restantes".
- 3 cartões (um por setor, na cor do setor). **O cartão inteiro é um botão** que abre o painel Metas (`aria-label` com a leitura completa + "Abrir metas.").
  - Cabeçalho: quadrado da cor + nome do setor; estado "à frente" (verde, seta para cima) ou "atrás" (âmbar, seta para baixo).
  - Número grande "27%" + "1.504 / 5.670".
  - Barra de meta: preenchimento na cor do setor até o %; linha pontilhada do % atual até a projeção (limitada a 100%); traço branco no % esperado; seta ">" na ponta quando a projeção passa da meta.
  - Rodapé: "faz **301** · precisa **278** /dia" e "fecha em **6.016**" (verde se bate, âmbar se não).

| Setor | Feito | % | faz/dia | precisa/dia | fecha em | Estado |
|---|---|---|---|---|---|---|
| Injetora | 1.504 | 27% | 301 | 278 | 6.016 | à frente |
| Montagem | 1.696 | 30% | 339 | 265 | 6.784 | à frente |
| Teste & Embalagem | 1.440 | 25% | 288 | 282 | 5.760 | à frente |

### 2.6 Por dia (produção + perdas no mesmo eixo de dias)
- Título "Por dia" + leitura (`aria-live`): padrão "**4 de 5 dias na meta · média 627/dia**"; com um dia tocado: "09/11 · 660 placas · 1.057,5 m² · ▲ 59%".
- Gráfico de barras (altura 220 px; escala fixa 0–900): 5 colunas-botão com o valor em cima; verde ("na meta", ≥ 540) ou âmbar ("abaixo"). Linha tracejada azul "meta 540" e linha pontilhada cinza "média 627", com o rótulo na margem direita (84 px reservados).
- Valores: 03/11 ter 801 · 04/11 qua 695 · 05/11 qui 565 · 06/11 sex **415 (abaixo)** · 09/11 seg 660. m² por dia: 1.252,5 · 1.137,5 · 872 · 724 · 1.057,5.
- "PERDAS": linha vermelha com 5 pontos, média tracejada "média 5,34%", rótulos só no primeiro e no último ponto ("4,1%" e "10,0%"), tendência "4,1% → 10,0%". O último ponto é maior; o ponto do dia selecionado ganha halo.
- Eixo: dia, dia da semana abreviado e variação sobre o dia anterior ("—", "▼ 13%", "▼ 19%", "▼ 27%", "▲ 59%"; verde se ≥ 0, vermelho se < 0).
- Legenda: "na meta", "abaixo", "meta do dia", "média".

### 2.7 Composição · 3 grupos de barras horizontais
Cada linha: nome, barra (proporcional ao maior do grupo), número, informação extra.
- **MEDIDAS** ("3.136 placas"): 3 m 2.343 · "170 · 6,8%" | 4 m 407 · "22 · 5,1%" | 2 m 386 · "30 · 7,2%" | 5 m 0 · "sem produção". Extra em vermelho = perdas e taxa de erro da medida. Ordenado do maior para o menor.
- **OPERADORAS** ("1.696 montadas"): Maiara 766 · 45% | Helena 413 · 24% | Maria 364 · 21% | Daniel 153 · 9%.
- **SETORES** ("7.313 m²"): Injetora 1.504 · "2.269,5 m²" | Montagem 1.696 · "2.539,5 m²" | Teste & Emb. 1.440 · "2.504 m²" (com quadrado da cor do setor).
- Cada linha tem `title` com a leitura completa. No celular os grupos viram abas "Medidas" / "Operadoras" / "Setores".

### 2.8 Eficiência e tempo · 6 blocos de barra dividida
Cabeçalho com apoio: "ciclos **2.762**" e "**34** placas por hora". Cada bloco: rótulo, número, barra dividida, legenda com os valores.

| Bloco | Número | Partes |
|---|---|---|
| EFICIÊNCIA INJETORA | 97,8% (verde) | boas 97,8% × perdas 2,2% |
| APROVAÇÃO NO TESTE | 86,6% (âmbar) | aprovadas 86,6% × reprovadas 13,4% |
| TEMPO | 137h51 "produtivo" | produtivo 96,7% × parado 4h41 |
| DEFEITOS DO TESTE | 70% "cabeçote" | caninho 12 × cabeçote 28 |
| PLACAS POR PACOTE | 9,9 "média · padrão 10" | com 10: 136 × com 8: 10 (pacotes) |
| PARADAS POR MOTIVO | 1h46 "manutenção" | manutenção 38% · material 23% · troca 17% · outros 22% (1h46, 1h05, 48 min, 1h02) |

### 2.9 Registros · matriz dia × setor (substitui a lista do Histórico)
- Legenda: "na meta", "abaixo", "sem dados", ícone tablet "tablet", ícone escudo "Administração".
- PC/tablet: linhas = setores (nome + o que conta: "boas", "montadas", "embaladas"); colunas = 5 dias (dia + dia da semana).
- Celular: invertida. Cabeçalho com os 3 setores ("Injetora", "Montagem", "Teste & Emb."), uma linha por dia com 3 células.
- Célula (botão): número do dia, "% da meta do dia" (sobre 270), cor verde (≥ 270) ou âmbar (< 270), ícone de origem no canto (tablet ou Administração). Sem dados: borda tracejada e "[ ]".
- 15 células; só 4 têm dados de exemplo: Injetora 09/11 **276** (102%), Montagem 09/11 **390** (144%), Teste & Emb. 09/11 **270** (100%), Montagem 06/11 **185** (69%, âmbar). As outras 11 mostram "[ ]".
- Tocar em qualquer célula (inclusive "[ ]") abre o registro.

### 2.10 Registro aberto (`aside role="dialog" aria-modal`)
- Cabeçalho fixo no topo do painel: quadrado + nome do setor; dia grande "09/11" + "segunda"; botão "×" (PC/tablet) ou botão "‹ **Desempenho**" (celular).
- Etiquetas: horário "07:09 → 17:51", duração "10h34", uma etiqueta por medida ("2 m · 1 m²", "3 m · 1,5 m²"), origem ("Tablet Injetora", "Tablet Montagem", "Tablet Teste/Embalagem" ou "Lançado pela Administração").
- Sem dados: etiquetas "[ ]" e caixa "**Sem dados**".
- Com dados:
  - Topo: anel com o % da meta do dia (limitado a 100% no desenho; o texto mostra o valor real, ex. 144%) + número grande "276 / 270" + unidade ("boas").
  - Barras divididas, barras por item e depois os números soltos (grade de 3 colunas; 2 no celular).
- Botão "**Corrigir este registro**" (ícone de lápis) no fim. **Sem `onClick` no protótipo.**

Conteúdo por setor, nos exemplos:

| Registro | Barras divididas | Barras por item | Números soltos |
|---|---|---|---|
| Injetora 09/11 (276 boas) | PLACAS: boas 276 × perdidas 6 · TEMPO: produtivo 10h34 × parado 7min | QUEBRA DE PERDAS: Caninho total 3, Cabeçote meio 1, Cabeçote total 1, Caninho meio 1 · POR MEDIDA: "3 m · 1,5 m²" 248 ("3 ruins"), "2 m · 1 m²" 28 ("3 ruins") | Ciclos totais 564 · Ciclos vazios 2 · Ciclos perdidos 10 · Área 400 m² · Eficiência 97,9% · Taxa de erro 2,1% · Início 07:09 · Término 17:51 · Placas/hora 26 · Ciclos/hora 53 · Tempo/placa 138,0 s · Tempo/ciclo 67,5 s |
| Montagem 09/11 (390) | — | POR OPERADORA: Maiara, Helena, Maria, Daniel, todos "[ ]" | Área 585 m² · Ritmo 39/h · Operadoras 4 |
| Teste & Emb. 09/11 (270 embaladas) | RESULTADO ("343 testadas"): embaladas 270 × defeitos 73 | — | Testadas 343 · Embaladas 270 · Defeitos 73 · % perda 21,3% · Pacotes 27 · Placas/pacote 10,0 · Ritmo 45/h · Caninho "[ ]" · Cabeçote "[ ]" |
| Montagem 06/11 (185) | — | POR OPERADORA: todos "[ ]" | Área "[ ]" · Ritmo 20/h · Operadoras 4 |

### 2.11 Folha de filtros (`role="dialog"`, título "Filtros")
- Celular: folha de baixo com PERÍODO, MEDIDA (nomes longos "3 m · 1,5 m²"), SETOR, **OPERADORA** ("Todas", "Maiara", "Helena", "Maria", "Daniel") e **ORIGEM** ("Todas", "Tablet Injetora", "Tablet Montagem", "Tablet Teste/Embalagem", "Lançado pela Administração"), em pílulas, e o botão "**Ver resultado**".
- PC/tablet ("Mais filtros"): caixa flutuante de 420 px no canto superior direito, só com OPERADORA e ORIGEM + "Ver resultado".

### 2.12 Menu "⋯" (só celular)
`role="menu"` "Mais opções" com "Metas" e "Exportar".

### 2.13 Painéis Metas e Exportar (outras famílias; o código está embutido aqui)
O comentário do script diz que é "o mesmo código nas três telas". Pontos de contato com Desempenho:
- **Metas** abre pelo botão da navegação, pelo menu "⋯" ou tocando em qualquer cartão de "Metas do mês".
- **Exportar** abre já com o contexto da tela: período "7 dias" → "Últimos 7 dias", qualquer outro → "Novembro 2026"; a medida filtrada; o setor filtrado vira o único setor marcado.
- O comentário do script diz que Exportar "substitui RH · relatórios e os botões CSV/PDF do histórico".

## 3. Ações e o que a lógica faz

| Ação | Efeito no estado (`state`) |
|---|---|
| Segmento PERÍODO | `periodo` = hoje / 7d / mes / tri / ano. Troca título e selo; "hoje" e "tri"/"ano" trocam a grade por um estado vazio. "7 dias" e "Mês" mostram **os mesmos números**. |
| Segmento MEDIDA | `tam` = todas / 2 / 3 / 4 / 5. Troca os 4 números do topo; esmaece (opacidade .35) as outras medidas na Composição; esmaece (.3) as células da matriz cujo registro não tem a medida (células sem dados também esmaecem). Não altera Metas, Por dia nem Eficiência. |
| Segmento SETOR | `setor`. Esmaece os cartões de meta, as barras de "SETORES" e as linhas/células da matriz dos outros setores. Não recalcula nada. |
| Pílulas OPERADORA | `op`. Esmaece as outras operadoras na Composição. Cria chip. |
| Pílulas ORIGEM | `orig`. Esmaece as células cuja origem é diferente (ou sem dados). Cria chip. |
| Chip de filtro (×) | Volta aquele filtro para o padrão (Mês / Todas / Todos). |
| "Mais filtros" / "Filtros" | Abre a folha (`folha: true`, fecha o menu). Os filtros aplicam **na hora**, a cada toque. |
| "Ver resultado", "×" da folha, fundo escuro | Só fecha a folha. |
| "Abrir Agora" | Link para a tela Agora. |
| "Ver novembro" | `periodo: 'mes'`. |
| Botão "i" de um número | Abre/fecha a dica daquele cartão (uma por vez; `aria-expanded`). |
| Cartão de meta | Abre o painel Metas. |
| Coluna de um dia | Seleciona/deseleciona o dia (`dia`; tocar de novo limpa). Destaca a coluna, o ponto de perdas e troca a leitura. Não filtra os outros blocos. |
| Aba da Composição (celular) | `aba` = med / ops / set. Padrão "Medidas". |
| Célula da matriz | `reg: '<setor>-<ddmm>'` → abre o registro. |
| "×", "‹ Desempenho", fundo escuro do registro | `reg: null`. |
| "Corrigir este registro" | Nada (sem comportamento). |
| "⋯" (celular) | Abre/fecha o menu (fecha a folha). |
| "Metas" / "Exportar" | Abre o painel correspondente (fecha o menu). |

Não há confirmações, desfazer nem validações nesta tela (existem no painel Metas: "Desfazer" e "Salvar metas"). Nenhum estado fica na URL: registro aberto, filtros e painel são estado local (no canvas, vêm por props `registro`, `painel`, `previa`).

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal (Mês ou 7 dias) | Grade completa. |
| Período "Hoje" | "Hoje fica em Agora" + "Abrir Agora". |
| Período sem dados (Trimestre, Ano) | "Sem dados" + "Ver novembro". |
| Filtro ativo | Itens que não casam ficam esmaecidos (não somem); chips e selos de contagem. |
| Dia selecionado | Coluna com fundo `#16223A`, halo no ponto de perdas, leitura do dia. |
| Dica aberta | Caixa azul-escura com a conta dentro do cartão. |
| Célula na meta / abaixo / sem dados | Verde / âmbar / tracejada com "[ ]". |
| Registro aberto, com dados | Painel lateral (PC, tablet) ou tela cheia (celular). |
| Registro aberto, sem dados | Etiquetas "[ ]" + caixa "Sem dados"; o botão "Corrigir este registro" continua. |
| Meta "à frente" / "atrás" | Seta e cor (verde / âmbar). No exemplo os três setores estão "à frente" e fecham acima da meta; o caso "atrás" e "não bate" existe na lógica, sem exemplo. |
| Folha de filtros, menu, painel Metas, painel Exportar | Camadas por cima (z-index 60, 60, 70, 70; registro é 50). |

**Não desenhados**: carregando, erro de servidor, sem conexão, sem permissão, mês sem nenhum dia de produção (só existe o "Sem dados" de trimestre/ano), setor sem meta definida.

## 5. Regras de negócio e contas

Constantes do exemplo (no script): `META_MES = 5670`, `META_DIA = 270`, `RESTAM = 15`, `DIAS_PROD = 5`, 21 dias úteis, `PASSADOS = 6`.

| Regra | Conta | Exemplo | Configurável? |
|---|---|---|---|
| Meta do mês por setor | meta por dia × dias úteis | 270 × 21 = 5.670 | Sim: painel Metas (meta por dia em passos de 10, mínimo 10; dias úteis de 7 a 31). Na tela, o valor está fixo e igual para os três setores. |
| % da meta do mês | feito ÷ meta do mês, arredondado | 1.504 ÷ 5.670 = 27% | — |
| Esperado até ontem | dias com produção ÷ dias úteis | 5 ÷ 21 = 24% | Derivado. Ver dúvida 6. |
| "à frente" / "atrás" | % ≥ esperado | 27 ≥ 24 → à frente | — |
| "faz" por dia | feito ÷ dias com produção | 1.504 ÷ 5 = 301 | — |
| "precisa" por dia | (meta − feito) ÷ dias úteis restantes, arredondado para cima | 4.166 ÷ 15 = 278 | — |
| "fecha em" (projeção) | feito + (feito ÷ dias com produção) × restantes | 1.504 + 300,8 × 15 = 6.016 | — |
| Projeção bate a meta | fecha em ≥ meta do mês → verde e seta; senão âmbar | 6.016 ≥ 5.670 | — |
| Unidade contada por setor | Injetora = placas boas; Montagem = montadas; Teste & Embalagem = embaladas | — | Fixo |
| "Placas" do topo | injetadas + montadas + embaladas | 1.504 + 1.696 + 1.440 = 4.640 | Fixo |
| Área | soma da área das placas por medida | 7.313 m²; 1,58 m² por placa | Medidas: 2 m = 1 m², 3 m = 1,5 m², 4 m = 2 m², 5 m = 2,5 m² |
| Perdas do período | perdidas ÷ produzidas (boas + perdidas) | 262 ÷ (4.640 + 262) = 5,34% | — |
| Perdas por medida | perdidas ÷ (boas + perdidas) | 3 m: 170 ÷ 2.513 = 6,8% | — |
| Participação da medida | placas da medida ÷ 3.136 (montadas + embaladas) | 3 m: 75% | — |
| "Por dia" | montadas + embaladas do dia | soma dos 5 dias = 3.136 | — |
| Meta do dia no gráfico | meta Montagem + meta Teste | 270 + 270 = 540 | Segue as metas |
| Dia "na meta" | valor do dia ≥ 540 | 4 de 5 dias | — |
| Média por dia | total ÷ dias com produção | 3.136 ÷ 5 = 627 | — |
| Variação do dia | (dia − dia anterior) ÷ dia anterior | 660 vs 415 = ▲ 59% | — |
| Célula da matriz | valor do setor no dia ÷ 270; verde se ≥ 270 | 185 → 69% âmbar | Segue a meta do setor |
| Tempo produtivo | soma dos setores; % = produtivo ÷ (produtivo + parado) | 137h51 ÷ 142h32 = 96,7% | — |
| Placas por hora | placas ÷ tempo produtivo | 4.640 ÷ 137h51 ≈ 34 | — |
| Eficiência da injetora | boas ÷ (boas + perdidas) | 97,8% | — |
| Aprovação no teste | aprovadas ÷ testadas | 86,6% | Limite de cor "a definir" (texto da prévia do relatório: "meta a definir") |
| Defeitos do teste | caninho × cabeçote | 12 × 28 (30% × 70%) | Tipos fixos |
| Placas por pacote | embaladas ÷ pacotes; padrão 10 | (136 × 10 + 10 × 8) ÷ 146 = 9,9 | Padrão 10 |
| Paradas por motivo | tempo parado por motivo | 1h46 + 1h05 + 48 min + 1h02 = 4h41 | Motivos vêm da tela Pausas |
| Registro Injetora | eficiência = boas ÷ (boas + perdidas); ciclos totais = boas × 2 + perdidos + vazios | 276 ÷ 282 = 97,9%; 552 + 10 + 2 = 564 | — |
| Ciclos perdidos | no exemplo bate com "total" = 2 ciclos e "meio" = 1 ciclo | 4 × 2 + 2 × 1 = 10 | Diverge da tela do operador (dúvida 11) |
| Registro: placas/hora, ciclos/hora, tempo/placa, tempo/ciclo | sobre o tempo produtivo | 276 ÷ 10h34 = 26/h; 564 ÷ 10h34 = 53/h; 138,0 s; 67,5 s | — |
| Registro Teste | % perda = defeitos ÷ testadas; placas/pacote = embaladas ÷ pacotes | 73 ÷ 343 = 21,3%; 270 ÷ 27 = 10,0 | — |

Escala do gráfico de barras: fixa em 900 no protótipo (precisa ser calculada com os dados reais).

## 6. Entidades e dados implícitos

A tela não grava eventos próprios; ela **agrega** o que os tablets e a Administração lançaram. Para funcionar de verdade precisa de:

- **Setor**: chave (`inj`, `mon`, `tes`), nome, nome curto, cor, unidade contada.
- **Medida**: comprimento (2, 3, 4, 5 m), área por placa (1 / 1,5 / 2 / 2,5 m²).
- **Meta**: setor, meta por dia, vigência (mês); opcional meta por medida. **Dias úteis do mês** (21) e dias úteis restantes.
- **Registro do dia por setor** (15 no exemplo = 5 dias × 3 setores): data, setor, início, término, tempo produtivo, tempo parado, medidas produzidas, **origem** (tablet do setor ou "Lançado pela Administração"), total contado, situação (fechado, corrigido).
  - Injetora: boas, perdidas, ciclos totais / vazios / perdidos, perdas por tipo (cabeçote meio, cabeçote total, caninho meio, caninho total), boas e ruins por medida, área.
  - Montagem: montadas, área, placas por **operadora**, nº de operadoras, medidas.
  - Teste & Embalagem: testadas, embaladas, defeitos (caninho, cabeçote), pacotes, placas por pacote.
- **Operadora**: nome; produção da Montagem por operadora e por dia.
- **Pausa / parada**: setor, início, fim, motivo (manutenção, falta de material, troca de medida, outros).
- **Pacote**: data, medida, quantidade de placas (10 padrão; existem pacotes com 8).
- **Tablet / origem do lançamento**: `tab-inj`, `tab-mon`, `tab-tes`, `adm`.
- **Correção de registro**: quem, quando, o que mudou (o tipo de exportação "Fechamentos e correções" fala em "Quem fechou, corrigiu ou usou −1 em cada dia").

Consultas que a tela pede: totais do período por setor / medida / operadora; série por dia (produção, m², perdas %); tempo produtivo × parado; paradas por motivo; distribuição de placas por pacote; matriz dia × setor; detalhe de um registro.

Eventos que a tela (ou o que ela abre) gravaria: correção de registro (não definida), salvar metas (painel), agendar envio mensal e gerar arquivo (painel Exportar).

## 7. Navegação

| De | Para |
|---|---|
| Logo | `Hub.dc.html` (hub do sistema) |
| Aba "Agora" | `RH2-Agora{sufixo}` |
| Aba "Desempenho" | a própria tela |
| Aba "Pedidos e estoque" / "Pedidos" | `RH2-Pedidos{sufixo}` |
| Aba "Pausas" | `RH2-Pausas{sufixo}` |
| "Abrir Agora" (estado Hoje) | `RH2-Agora{sufixo}` |
| "Metas", cartões de meta | painel Metas por cima |
| "Exportar" | painel Exportar por cima |
| Célula da matriz | registro aberto por cima (sem trocar de página) |

`{sufixo}` = "", "-Tablet" ou "-Celular", só para ligar os quadros do canvas da mesma largura. No sistema real são rotas únicas.

## 8. Responsividade

### Mecanismo
Um componente só, fluido, com **media queries de CSS**:
- PC: 1200 px ou mais (regras base).
- Tablet: `@media (max-width:1199px)` (768 a 1199).
- Celular: `@media (max-width:767px)`.
- `@media (min-width:768px)` transforma a folha de filtros em caixa flutuante.
- `@media (prefers-reduced-motion:reduce)` tira as transições de opacidade.

A prop `largura` **não** muda o layout: só escolhe o sufixo dos links. O que troca o arranjo é a largura do quadro. O tablet do operador (1280×800) e o PC caem na faixa "PC"; tablet deitado de 1180 cai na faixa "tablet". A matriz tem duas marcações (`.r2-mx` por setor e `.r2-mxc` por dia) e o CSS mostra uma ou outra.

### Tabela parâmetro × largura

| Parâmetro | PC · 1440 (≥ 1200) | Tablet · 820 (768–1199) | Celular · 390 (≤ 767) |
|---|---|---|---|
| Altura do quadro no canvas | 2100 | 3150 | 3190 |
| Margem lateral da página | 40 px (conteúdo até 1440; navegação até 1360) | 24 px | 16 px |
| Espaço entre blocos | 22 px | 22 px | 18 px |
| Navegação | 1 linha de 68 px: logo, abas, Metas, Exportar, relógio | 2 linhas: logo + relógio (60 px) / abas + Metas e Exportar (52 px) | Topo fixo (sticky) de 60 px: logo 175×24, relógio, "⋯"; abas em barra **fixa embaixo**, 4 colunas |
| Abas | 68 px de altura, texto 16 px, traço embaixo | 52 px, traço embaixo | 62 px, ícone 22 px sobre rótulo 14 px, traço em cima |
| Rótulo da 3ª aba | "Pedidos e estoque" | "Pedidos" (intenção; ver divergência 11.6) | "Pedidos" |
| Metas / Exportar | botões de 40 px na barra | botões de 44 px na barra | dentro do menu "⋯" (botão 48×48; itens de 48 px) |
| Relógio | 24 px | 24 px | 22 px |
| Título (h1) | 44 px | 44 px | 28 px |
| Filtro Período | segmento à direita do título | segmento (quebra para a linha de baixo se faltar espaço) | dentro da folha "Filtros" |
| Filtros Medida e Setor | linha à vista, com quebra | linha única que **rola na horizontal** | dentro da folha "Filtros" |
| Altura dos botões de segmento | 40 px | 44 px | pílulas de 48 px na folha |
| Botão "Mais filtros" / "Filtros" | "Mais filtros", 48 px | "Mais filtros", 48 px | "Filtros", 48 px, ao lado do título |
| Folha de filtros | caixa flutuante 420 px, topo 150 px, à direita; só Operadora e Origem | igual ao PC | folha de baixo (até 88% da altura, cantos 18 px, alça), com os 5 grupos; "Ver resultado" 52 px |
| Chips de filtro | só Operadora e Origem, 40 px | igual ao PC | todos os filtros ativos, 48 px |
| Ordem dos blocos | números, metas, [por dia · composição], eficiência, registros | números, metas, por dia, composição, eficiência, registros | **metas**, números, por dia, composição, eficiência, registros |
| Grade principal | 2 colunas (2fr · 1fr): "Por dia" em 2/3 e "Composição" em 1/3; resto em largura total | 1 coluna | 1 coluna |
| Números do topo | 4 em linha; número 38 px | 4 em linha; número 38 px | 2 × 2; número 32 px; minigráfico acima do texto de tendência |
| Botão "i" | 40×40 | 44×44 | 48×48 |
| Metas do mês | 3 cartões lado a lado; % em 56 px | 3 cartões empilhados num card; % em 48 px | 3 cartões empilhados; % em 44 px |
| Gráfico por dia | 220 px de altura; valor da coluna 18 px; margem direita 84 px | igual ao PC | 180 px; valor 15 px; margem direita 70 px |
| Gráfico de perdas | 110 px; rótulo 18 px | igual ao PC | 90 px; rótulo 16 px |
| Composição | 3 grupos empilhados na coluna de 1/3 | 2 colunas (Medidas, Operadoras) + Setores em largura total | abas "Medidas / Operadoras / Setores" (48 px), um grupo por vez |
| Linha da composição | colunas 76 · barra · 56 · 92 px (Setores: 112 no nome) | igual ao PC | 62 · barra · 50 · 84 px (Setores: 104 · barra · 48 · 78) |
| Eficiência e tempo | 3 colunas (2 linhas); número 36 px | 2 colunas (3 linhas); número 36 px | 2 colunas; número 28 px |
| Registros | matriz setor × dia: 170 px + 5 colunas; célula ≥ 72 px, número 26 px | mesma matriz: 128 px + 5 colunas | **matriz por dia**: 58 px + 3 colunas de setor; célula ≥ 60 px, número 22 px |
| Registro aberto | painel lateral à direita, 480 px, fundo escurecido; "×" 44×44 | painel lateral, 440 px | **tela cheia**, sem borda; "‹ Desempenho" (48 px) no lugar do "×" |
| Dentro do registro | anel 100 px, número 60 px, números soltos em 3 colunas | igual ao PC | números soltos em 2 colunas |
| "Corrigir este registro" | 48 px | 48 px | 48 px |
| O que rola | a página inteira; o painel do registro rola por dentro com cabeçalho fixo | página; linha de filtros rola de lado | página entre o topo fixo e a barra de abas (104 px de folga embaixo) |
| Painel Metas | lateral 480 px | lateral 480 px | tela cheia, com "Voltar" |
| Painel Exportar | lateral largo (até 1180 px): formulário 400 px + prévia | até 780 px, formulário e prévia empilhados | tela cheia; "Ver prévia" / "Formulário" alternam |
| Alvo de toque mínimo (regra do briefing) | 40 px | 44 px | 48 px |

Outras regras do briefing que valem aqui: texto nunca abaixo de 14 px; contraste 4,5:1; a página nunca rola na horizontal; a primeira dobra do PC (1440×900) mostra números e metas.

### Acessibilidade já prevista
`aria-pressed` nos segmentos e pílulas; `role="tablist"`/`aria-selected` nas abas da composição; `aria-live="polite"` na leitura do gráfico; `aria-label` com a leitura completa em cada coluna, célula, barra dividida e cartão de meta; `role="dialog" aria-modal` nos painéis; foco visível (contorno 3 px `#BFDBFE`); cor nunca informa sozinha (ícone ou palavra junto).

## 9. Fase futura, desabilitado, "[ ]", placeholder

- "**Corrigir este registro**": botão sem ação.
- 11 das 15 células da matriz com "[ ]" (sem dados de exemplo).
- No registro: "POR OPERADORA" com todos os valores "[ ]"; "Caninho" e "Cabeçote" do Teste por dia "[ ]"; "Área" de Montagem 06/11 "[ ]".
- Períodos "Trimestre" e "Ano": só o estado "Sem dados". "7 dias" repete os números do mês.
- Linha de perdas por dia: só 03/11 e 09/11 têm número; a forma da linha e o minigráfico são desenho fixo.
- Relógio "09:49" estático.
- Filtros apenas esmaecem; não recalculam números.
- Metas na tela são constantes: salvar no painel Metas não muda os cartões.
- Painel Metas: "Meta por tamanho · opcional" com campos sem ligação. Painel Exportar: botão "Baixar PDF/Excel/CSV" sem ação; datas livres sem ligação; prévia com "[ ]" quando há filtro de medida; "Outubro 2026" → "Sem dados de outubro".

## 10. Dúvidas reais para o card

1. **Filtro esmaece ou recalcula?** Medida, Setor, Operadora e Origem só esmaecem. No sistema real os números do topo, o gráfico por dia e a eficiência devem recalcular pelo filtro?
2. **Períodos longos.** O gráfico e a matriz foram desenhados para 5 dias. Como ficam com 21+ dias do mês, trimestre e ano (agrupar por semana/mês, rolagem, paginação)? No celular a matriz por dia vira uma lista longa?
3. **Meses anteriores.** O filtro "Mês" é só o mês atual; não há seletor de mês nem de datas na tela (só no Exportar). Precisa?
4. **"Hoje".** Confirmar que o período Hoje apenas manda para a tela Agora e que o dia em andamento nunca entra em Desempenho.
5. **O que somar.** "Placas" do topo soma os três setores (a mesma placa conta até 3 vezes); "Por dia" soma montadas + embaladas (meta 540). São essas as definições desejadas? O briefing registra a divergência (928 × 627 de média) e o Analytics × Histórico (4.640 × 4.482 placas, 7.313 × 7.076 m², 5,34% × 5,5%) como pergunta em aberto.
6. **Esperado e dias úteis.** O esperado usa dias com produção (5 ÷ 21 = 24%), mas o painel Metas trata 6 dias úteis como passados (21 − 15; 02/11 conta como útil sem produção). Qual base usar? Feriados entram como? Os dias úteis são digitados pelo RH todo mês?
7. **Meta que muda no meio do mês** e metas diferentes por setor: os dias passados usam a meta da época? A tela mostra "5.670 por setor" fixo.
8. **Composição das perdas.** 262 perdidas no período, mas a soma por medida dá 222 (170 + 22 + 30). Quais setores entram em "perdas" (injetora + reprovadas do teste?) e como ratear por medida e por dia?
9. **Limites de cor** dos blocos de eficiência (97,8% verde, 86,6% âmbar): quais os cortes? A prévia do relatório diz "meta a definir".
10. **"Corrigir este registro".** O que pode ser corrigido, por quem (RH? admin?), com que trilha de auditoria, e se a correção altera eventos ou só o total do dia. Relação com a origem "Lançado pela Administração" (onde fica essa tela de lançamento?).
11. **Ciclos na Injetora.** No registro, 10 ciclos perdidos só fecham se "total" valer 2 ciclos e "meio" 1; o mapa da tela do operador diz que toda perda conta 1 ciclo. Qual vale?
12. **Duração do registro.** "07:09 → 17:51" dá 10h42, a etiqueta mostra "10h34" (igual ao tempo produtivo). A etiqueta é tempo produtivo ou duração total?
13. **Mais de um registro por setor/dia** (dois tablets, dois turnos, tablet + Administração): a célula soma? Qual ícone de origem mostra?
14. **Filtro Operadora.** Só a Montagem tem operadora. O filtro deve afetar só Montagem ou esconder os outros setores?
15. **Pacotes com 8 placas.** São permitidos (pacote incompleto) ou é erro a destacar?
16. **Permissão.** Só RH vê? Admin também? Operador nunca?
17. **Atualização dos dados.** Fechamento diário (até ontem) com cache, ou recalcula a cada abertura? Há estado de carregando / erro / sem conexão a desenhar.
18. **URL.** Filtros, dia selecionado e registro aberto devem ir para a URL (link compartilhável, botão voltar do celular fechando o registro)?
19. **Tablet deitado do RH (1180 px)** cai no arranjo de tablet em pé; o briefing aceita. Confirmar.

## 11. Divergências (briefing × protótipo, e dentro do protótipo)

1. Briefing fala em 3 abas; o protótipo tem **4** (entrou "Pausas"). Barra do celular com 4 colunas.
2. Briefing pede "2 anéis e 2 barras divididas" em Eficiência; o protótipo tem **6 barras divididas**, com "PLACAS POR PACOTE" e "PARADAS POR MOTIVO" a mais e nenhum anel.
3. Briefing pede linha de tendência em cada número do topo "quando há dado por dia"; só "Perdas" tem.
4. Briefing diz "Números e metas" nessa ordem em todas as larguras; no celular o protótipo põe **Metas antes dos números** (coerente com "destaque principal primeiro").
5. Briefing diz que o detalhe no tablet pode ser "painel lateral ou folha de baixo"; o protótipo usa painel lateral de 440 px.
6. Rótulo da aba no tablet: o CSS de Desempenho (e de Agora) esconde `.r2-tl-txt`, mas a marcação usa `.r2-tl`; na faixa 768–1199 aparecem "Pedidos e estoque" e "Pedidos" juntos. Em Pedidos e Pausas a classe está certa. A intenção é o rótulo curto.
7. Classes `.r2-legmeta` e `.r2-metab` existem no CSS e não são usadas nesta tela (vêm do código compartilhado dos painéis).
8. O exemplo de registro de Teste usa 270 embaladas como número principal e 343 testadas no detalhe; o briefing cita "343 testadas e 270 embaladas". A célula conta **embaladas**.
