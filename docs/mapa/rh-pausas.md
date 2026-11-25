# Mapa do protótipo · RH · Pausas (`rh-pausas`)

Fonte: 8 quadros `RH2-Pausas*.dc.html` do protótipo. Todos são **o mesmo componente** (HTML, CSS e script idênticos byte a byte); só mudam o `<title>` e os valores padrão das props na linha do `<script data-props>`.
Cruzado com: `Tela-Injetora-TabletH-Pausa.dc.html` (lado do operador, mesmo catálogo de motivos), `RH2-Desempenho.dc.html` (card "PARADAS POR MOTIVO"), `Historico-Setor.dc.html`, `Briefing-RH-2/3`.
Não existe versão anterior (sem prefixo `RH2-`) desta tela: Pausas nasce na versão "RH objetivo".

---

## 1. Propósito e quem usa

Tela do **RH** (quarta aba do RH: Agora · Desempenho · Pedidos e estoque · **Pausas**). Responde: "quanto tempo a fábrica ficou parada, por quê, em qual setor e quem informou o motivo".

Três funções:

1. **Ler** as paradas (hoje, ontem, mês) por motivo, por setor e em linha do tempo.
2. **Classificar** as paradas que ficaram "Sem motivo" (o tablet avisou e ninguém respondeu).
3. **Configurar** ("Motivos e regras") os minutos sem contar até o tablet avisar, por setor, e a lista padronizada de motivos que o tablet do operador mostra.

Usuário: RH (rodapé dos painéis: "Só o RH altera · vai para os tablets"). O operador não vê esta tela; ele alimenta os dados pelo aviso de parada / botão "Pausar" do tablet do setor (família das telas `Tela-Injetora/Montagem/Teste`).

Uso em PC (principal), tablet em pé 820 e celular 390.

---

## 2. Quadros

| Quadro | Tamanho | Props | Mostra |
|---|---|---|---|
| `RH2-Pausas` | 1440×1500 | `largura=pc` | Tela inteira, estado padrão (Hoje · Todos) |
| `RH2-Pausas-Motivos` | 1440×900 | `largura=pc`, `motivos=sim` | Painel lateral "Motivos e regras" aberto |
| `RH2-Pausas-Classificar` | 1440×900 | `largura=pc`, `classificar=inj-0752` | Painel lateral "Classificar parada" aberto, com "Manutenção" já marcada |
| `RH2-Pausas-Tablet` | 820×2320 | `largura=tablet` | Tela inteira em 1 coluna |
| `RH2-Pausas-Tablet-Motivos` | 820×1180 | `largura=tablet`, `motivos=sim` | Painel lateral "Motivos e regras" (480 px) |
| `RH2-Pausas-Celular` | 390×2700 | `largura=celular` | Tela inteira, barra de abas embaixo |
| `RH2-Pausas-Celular-Motivos` | 390×844 | `largura=celular`, `motivos=sim` | "Motivos e regras" em tela cheia |
| `RH2-Pausas-Celular-Classificar` | 390×844 | `largura=celular`, `classificar=inj-0752` | "Classificar parada" em tela cheia |

Não existe quadro "Tablet · Classificar"; o comportamento sai do CSS (painel lateral de 440 px).

Props do componente: `largura` (pc | tablet | celular), `painel` ('' | metas | exportar), `previa` ('' | sim), `motivos` ('' | sim), `classificar` ('' | id da parada).
A prop `largura` **só** troca o sufixo dos links das abas (`''`, `-Tablet`, `-Celular`). O arranjo é trocado por **media query**.

---

## 3. Blocos da tela, de cima para baixo

### 3.1 Barra do RH (comum às 4 telas do RH)
- Logo AquaPulse + selo "RH" → link para `Hub.dc.html`.
- Abas: "Agora", "Desempenho", "Pedidos e estoque" (vira "Pedidos" abaixo de 1200 px), "Pausas" (ativa, `aria-current="page"`).
- Ações: "Metas" e "Exportar" (abrem os painéis compartilhados do RH; pertencem à família dos painéis RH, o código está duplicado aqui).
- Relógio "09:49".
- Só no celular: botão "⋯" ("Mais opções") abre menu com "Metas", "Exportar", separador, "Motivos e regras".

### 3.2 Cabeçalho da página
- Título "Pausas".
- Subtítulo: selo "ter 10/11 · 09:49" + texto do período: "hoje, 07:00 até agora" | "segunda, 09/11" | "novembro, 03/11 até agora".
- Filtro "PERÍODO" (segmentado): "Hoje" · "Ontem" · "Novembro".
- Filtro "SETOR" (segmentado): "Todos" · "Injetora" · "Montagem" · "Teste & Emb.".
- Botão "Motivos e regras".
- No celular os dois filtros e o botão somem; entram: chip do filtro ativo (ex.: "Ontem · Montagem" com X) + botão "Filtros" (abre folha de baixo).

### 3.3 "Setores agora" (3 cards, não depende do período)
Um card por setor, com quadradinho da cor do setor:
- Injetora: "Rodando" (verde) · "Última placa às 09:48" · "avisa depois de 10 min sem contar".
- Montagem: "Rodando" · "Último pulso às 09:47" · "avisa depois de 15 min sem contar".
- Teste & Embalagem: "Pausado · 4 min" (amarelo, card com fundo âmbar `.pausa`) · "Refeição › Café" · "desde 09:45 · o operador pausou".
- Os minutos do texto "avisa depois de N min" vêm ao vivo da regra de "Motivos e regras".
- Filtro de setor: os cards dos outros setores ficam esmaecidos (opacidade .4), não somem.
- Existe no CSS a variante `.pa-ag.alerta` (borda âmbar 2 px), **não usada** nos dados de exemplo: é o estado "parado sem motivo / aviso tocando".

### 3.4 Números (4 cards)
Cada card: ícone, rótulo, botão "i" (abre/fecha a dica dentro do card; uma por vez), valor, nota.

| Card | Valor (Hoje · Todos) | Nota | Dica |
|---|---|---|---|
| "Tempo parado" | 1h26 | "sem contar refeição · hoje" | "Soma das paradas não planejadas: tudo menos refeição. Inclui as paradas sem motivo." |
| "Paradas" | 5 | "+ 2 de refeição" | "Cada vez que um setor parou por um motivo que não é refeição." |
| "Avisos do tablet" | 4 (amarelo se houver sem resposta) | "1 sem resposta · classificar" ou "todos respondidos" | "O tablet avisa quando o setor fica sem contar pelo tempo definido em Motivos e regras e ninguém apertou Pausar." |
| "Maior causa" | Manutenção (vermelho claro) | "43 min · 50% do tempo parado" ou "nenhuma parada" | "O motivo com mais tempo parado no período." |

Em "Novembro · Todos": 6h07 · 24 paradas (+ 32 de refeição) · 17 avisos (3 sem resposta) · Manutenção 2h29 (41%).

### 3.5 "Tempo parado por motivo" (card)
- Nota do cabeçalho: "1h26 hoje · toque para filtrar".
- Uma barra-botão por motivo, na ordem fixa: Manutenção, Falta de material, Troca de medida, Energia ar ou água, Pessoas, Outro, Sem motivo. Só aparecem os que têm tempo > 0; **"Sem motivo" aparece sempre** (com "—" e "0 paradas" quando zerado).
- Cada linha: quadradinho da cor + nome · barra (largura = minutos ÷ maior motivo) · tempo ("43 min", "1h46") · "N paradas" / "1 parada".
- "Sem motivo" tem cor listrada âmbar (gradiente repetido).
- Rodapé tracejado: "Refeição · planejada" · tempo · "N pausas" · "não conta como parada".

### 3.6 "Linha do tempo · hoje" (card)
- Nota: "07:00 até agora". **Sempre hoje**, mesmo com período Ontem/Novembro.
- 3 trilhas (Injetora, Montagem, Teste & Embalagem), fundo verde escuro = "produzindo"; blocos coloridos pela categoria da pausa, posicionados por `left = (início − 07:00) ÷ 169 min`, `width = duração ÷ 169 min` (mín. 4 px).
- Eixo: "07:00", "08:00", "09:00", "09:49" (agora, em negrito).
- Legenda: "produzindo" + só as categorias que aparecem hoje (inclui "Refeição" e "Sem motivo").
- Filtro de setor esmaece as outras trilhas.
- Acessibilidade: `role="img"` com descrição textual de todas as paradas.
- Os blocos **não são clicáveis** (sem tooltip nem detalhe).

### 3.7 "Registro de pausas" (card)
- Cabeçalho: título, chip do motivo filtrado (ex.: "Manutenção" com X, quando há filtro por barra), nota "7 pausas hoje" / "1 pausa ontem" / em Novembro: "novembro tem 24 paradas e 32 refeições · aqui, hoje e ontem".
- Colunas (PC): "QUANDO" · "SETOR" · "MOTIVO" · "COMO FOI REGISTRADA" · (ação).
- Linha:
  - Quando: "08:12–08:31" (ou só "09:45" se em andamento) + duração ("19 min"; com prefixo "ontem · " quando o período não é Ontem).
  - Setor: quadradinho + nome.
  - Motivo: "Manutenção › Molde" (categoria › motivo) ou "Sem motivo"; descrição livre embaixo, se houver ("Molde de 3 m vazando água na saída").
  - Como foi registrada (ícone + texto): "Operador pausou" · "Aviso do tablet · respondeu 08:23" · "Aviso às 08:02 · sem resposta" · "Classificada pelo RH".
  - Ação: botão "Classificar" (só em "Sem motivo") ou selo "em andamento" (pausa sem fim).
- Linha "Sem motivo": fundo âmbar e origem em amarelo. Linha de refeição: texto do motivo mais apagado (`.plan`).
- Ordem: mais recente primeiro (hoje antes de ontem).
- Vazio: caixa tracejada com ícone de pausa e "Nenhuma pausa com este filtro".
- Sem paginação, busca ou ordenação.

---

## 4. Ações e lógica

| Ação | Efeito no script |
|---|---|
| Período "Hoje" / "Ontem" / "Novembro" | `per` muda; **limpa o filtro de motivo** (`cat=null`). Recalcula números, barras e registro. Não muda "Setores agora" nem a linha do tempo. |
| Setor "Todos" / setor | `setor` muda; limpa `cat`. Filtra números, barras e registro; esmaece cards "agora" e trilhas. |
| Tocar numa barra de motivo | Alterna `cat` (toca de novo = tira). As outras barras esmaecem (.35), a barra ganha contorno azul; o registro mostra só aquele motivo e aparece o chip com X no cabeçalho do registro. Os 4 números **não** mudam com esse filtro. |
| Chip do motivo (X) no registro | `cat=null`. |
| Botão "i" de um número | Abre/fecha a dica dentro do card (uma aberta por vez). |
| "Classificar" (linha sem motivo) | Abre o painel "Classificar parada" para aquela parada, **sem** categoria marcada. |
| Painel Classificar · categoria (7 pílulas) | Marca `clCat`, zera o motivo. Se a categoria tem lista para o setor da parada, aparece o 2º grupo com a pergunta da categoria ("QUAL MANUTENÇÃO?", "FALTOU O QUÊ?", "QUE TIPO DE TROCA?", "QUAL REFEIÇÃO?", "O QUE FALTOU?", "O QUE ACONTECEU?"). "Outro" não tem 2º passo. |
| Painel Classificar · motivo | Marca `clMot`. |
| Painel Classificar · "DESCRIÇÃO · OPCIONAL" | Texto livre (placeholder "Ex.: conversado com o operador às 10:10"). |
| "Salvar motivo" | Desabilitado até: categoria escolhida **e** (categoria sem lista **ou** motivo escolhido). Grava `{cat, mot, desc}` na parada, fecha o painel. A parada passa a ter origem "Classificada pelo RH", sai de "Sem motivo" e entra no tempo do motivo escolhido (texto: "Fica marcada como “classificada pelo RH” no registro e entra no tempo do motivo escolhido."). |
| "Cancelar" / X / fundo escuro / "‹ Pausas" (celular) | Fecha e descarta a seleção. |
| "Motivos e regras" | Abre o painel. |
| Painel Motivos · "−" / "+" por setor | Muda os minutos do aviso em passos de **5**, mínimo **5**, máximo **60**. Aplica na hora no estado (o card "agora" já reflete). |
| Painel Motivos · seletor "Injetora / Montagem / Teste & Emb." | Troca o setor cujas listas de motivos são mostradas. |
| Painel Motivos · "+ motivo" | **Sem ação** (botão placeholder). |
| Painel Motivos · "Salvar" | Só fecha o painel (igual a X / fundo / "‹ Voltar"). Não há rascunho, "Desfazer" nem confirmação "salvo". |
| Celular · "Filtros" | Abre a folha de baixo com PERÍODO ("Hoje", "Ontem · 09/11", "Novembro até agora") e SETOR ("Todos os setores", "Injetora", "Montagem", "Teste & Embalagem"). Cada toque **aplica na hora**; "Ver resultado" só fecha. |
| Celular · chip do filtro (X) | Volta para Hoje + Todos e limpa o motivo. |
| Celular · "⋯" | Abre/fecha o menu (Metas, Exportar, Motivos e regras). Abrir o menu fecha a folha e vice-versa. |
| "Metas" / "Exportar" | Abrem os painéis compartilhados do RH. Exportar abre em "Relatório mensal", novembro, todos os setores: **não leva os filtros da tela de Pausas** e não existe tipo de relatório "Pausas". |

Não há desfazer nem reclassificar: depois de "Salvar motivo" o botão "Classificar" some da linha.

---

## 5. Estados

- **Normal**: Hoje · Todos.
- **Setor filtrado**: cards/trilhas dos outros setores esmaecidos; números e listas só do setor.
- **Motivo filtrado**: barras esmaecidas, chip no registro.
- **Registro vazio**: "Nenhuma pausa com este filtro".
- **Setor rodando** (card verde) × **setor pausado** (card âmbar, "Pausado · N min", motivo e "desde HH:MM · o operador pausou") × **alerta** (classe existe, sem exemplo).
- **Pausa em andamento**: linha sem hora de fim e selo "em andamento".
- **Parada sem motivo**: linha âmbar + "Classificar"; card "Avisos do tablet" em amarelo com "N sem resposta · classificar".
- **Todos respondidos**: card "Avisos do tablet" em branco, "todos respondidos".
- **Classificar aberto**: sem categoria (botão desabilitado) → categoria com lista (falta motivo) → pronto.
- **Motivos e regras aberto**: por setor; categoria "Outro" mostra "sem lista · o operador escreve na descrição".
- **Celular**: folha de filtros aberta; menu "⋯" aberto.
- **Não desenhados**: carregando, erro, sem conexão, sem nenhuma pausa no período (os números mostrariam "0 min", "0", "—"), dica de permissão negada.

---

## 6. Regras de negócio e contas

1. **Refeição é planejada**: não entra em "Tempo parado" nem em "Paradas"; aparece à parte ("Refeição · planejada · não conta como parada", "+ N de refeição"). É a única categoria com `plan: true` (fixo no protótipo; a etiqueta "planejada" / "conta como parada" não é editável).
2. **Tempo parado** = soma dos minutos das paradas de todas as categorias não planejadas, **incluindo "Sem motivo"**. Exemplo hoje: 43 + 18 + 12 + 13 = 86 min = 1h26.
3. **Paradas** = quantidade de paradas não planejadas (hoje: 5).
4. **Avisos do tablet** = paradas com origem "aviso respondido" + "aviso sem resposta" + "classificada pelo RH" (que era sem resposta). Hoje: 4. No mês o exemplo usa um total fixo (17).
5. **Sem resposta** = paradas ainda em "Sem motivo" no período.
6. **Maior causa** = categoria (exceto "Sem motivo") com mais minutos; nota = minutos + % sobre o tempo parado total.
7. **Largura das barras** = minutos ÷ minutos do maior motivo (não ÷ total).
8. **Formato de tempo**: < 60 min → "43 min"; ≥ 60 → "1h26".
9. **Aviso de parada no tablet**: o tablet avisa quando o setor fica **N minutos sem contar** e ninguém apertou "Pausar". Padrão: Injetora **10**, Montagem **15**, Teste & Embalagem **15**. Configurável por setor, 5 a 60, passo 5. (No tablet o texto é "o aviso vem depois de N min sem contar".)
10. **Origens de uma pausa**:
    - "Operador pausou": apertou "Pausar" e escolheu o motivo; a pausa começa na hora do toque.
    - "Aviso do tablet · respondeu HH:MM": o aviso apareceu e o operador informou o motivo; a pausa começa na **última contagem** (não na hora do aviso). Ex.: parou 08:12, respondeu 08:23.
    - "Aviso às HH:MM · sem resposta": o aviso apareceu e ninguém respondeu até a produção voltar; fica "Sem motivo". Ex.: parou 07:52, aviso 08:02 (10 min depois = regra da Injetora), voltou 08:05.
    - "Classificada pelo RH": o RH deu o motivo depois.
11. **Classificar como Refeição** é permitido: a parada sai do tempo parado e vai para as refeições (o script trata esse caso).
12. **Catálogo em dois níveis** (categoria › motivo), o mesmo no tablet e no RH. Categorias (ordem do tablet): Manutenção, Falta de material, Troca de medida, Refeição, Energia ar ou água, Pessoas, Outro. Listas de motivo **por setor** para Manutenção, Falta de material e Troca de medida; **iguais para todos** em Refeição, Energia e Pessoas; "Outro" não tem lista.

    | Categoria | Cor | Injetora | Montagem | Teste & Embalagem |
    |---|---|---|---|---|
    | Manutenção | `#F87171` | Molde · Resistência / aquecimento · Sistema hidráulico · Bico / canhão · Refrigeração · Painel elétrico | Bancada / mesa · Botão ESP32 · Ferramenta · Elétrica | Bancada de teste · Compressor / ar · Manômetro · Vedação / conexão |
    | Falta de material | `#FB923C` | Matéria-prima · Pigmento / aditivo · Peça de reposição | Placas da Injetora · Componentes · Insumos | Placas da Montagem · Embalagem · Etiquetas |
    | Troca de medida | `#E879F9` | Troca de molde · Aquecimento da máquina · Regulagem | Troca de medida · Organização da bancada | Troca de medida · Ajuste da bancada |
    | Refeição (planejada) | `#64748B` | Almoço · Café (todos) | | |
    | Energia, ar ou água | `#FACC15` | Queda de energia · Falta de ar comprimido · Falta de água (todos) | | |
    | Pessoas | `#A3E635` | Operador ausente · Reunião · Treinamento (todos) | | |
    | Outro | `#94A3B8` | sem lista, o operador escreve na descrição | | |
    | Sem motivo (só RH) | listrado âmbar | não é escolhível; é a ausência de motivo | | |

13. Texto do painel: "Lista inicial para conferir com a fábrica. O tablet mostra exatamente estes nomes, na mesma ordem; motivos já usados em registros antigos continuam no histórico." → motivo removido/renomeado não pode apagar o histórico (guardar o texto no registro ou desativar em vez de excluir).
14. **Período "Novembro"**: números e barras são do mês inteiro (03/11 até agora), mas o **registro lista só hoje e ontem** ("aqui, hoje e ontem"). Classificar uma parada de hoje/ontem ajusta os totais do mês.
15. **Coerência com Desempenho**: o tempo parado do mês até 09/11 (4h41) é o mesmo "parado" do Desempenho, e o card "PARADAS POR MOTIVO" de lá (manutenção 1h46 · falta de material 1h05 · troca de medida 48 min · outros 1h02) sai desta mesma base. É uma única fonte de dados.
16. **Jornada**: linha do tempo começa às 07:00 (fixo no exemplo).
17. Cores dos setores: Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`.

---

## 7. Entidades e eventos implícitos

**Pausa / parada**
- id, setor, início, fim (nulo = em andamento), duração (derivada)
- categoria (nula = sem motivo), motivo (texto ou referência + texto gravado), descrição livre
- origem: `operador` | `aviso_respondido` | `aviso_sem_resposta` | `rh`
- hora do aviso, hora da resposta
- classificada por (usuário do RH), classificada em, descrição do RH
- tablet/dispositivo e operador que registrou (não aparecem na tela, mas são necessários para auditoria)

**Categoria de pausa**: id, nome, pergunta do 2º passo, cor, ícone, planejada (sim/não), ordem.

**Motivo de pausa**: id, categoria, setor (nulo = todos os setores), nome, ordem, ativo.

**Regra de aviso por setor**: setor, minutos sem contar (5–60), quem alterou, quando.

**Estado do setor agora** (derivado): rodando / pausado / parado sem motivo, hora da última contagem ("Última placa" na Injetora, "Último pulso" na Montagem), pausa aberta.

**Jornada / dia de trabalho**: hora de início (07:00) para a linha do tempo e para "hoje, 07:00 até agora".

**Agregados**: minutos e quantidade por dia × setor × categoria (o mês não lista registros, só soma).

**Eventos gravados**
- Pelo tablet (outra família): pausa iniciada pelo operador, aviso de parada emitido, aviso respondido, aviso fechado com "Não parou", produção retomada ("Retomar" ou nova contagem), aviso expirado sem resposta.
- Por esta tela: parada classificada pelo RH (categoria, motivo, descrição, autor), regra de aviso alterada, motivo criado (futuro).

---

## 8. Navegação

- Logo → `Hub.dc.html` (área inicial).
- Abas → `RH2-Agora`, `RH2-Desempenho`, `RH2-Pedidos`, `RH2-Pausas` (com sufixo `-Tablet` / `-Celular` conforme a largura; no sistema real é a mesma rota responsiva).
- "Metas" / "Exportar" → painéis sobrepostos (família dos painéis do RH).
- "Motivos e regras" e "Classificar" → painéis sobrepostos na própria tela (sem rota no protótipo).
- Chegada: Hub/Área ("Agora, desempenho, pedidos e pausas"; item "Pausas") e abas das outras telas do RH. O tablet do operador cita a tela: "o RH vê este motivo em Pausas".

---

## 9. Responsividade

**Mecanismo**: um único componente e um único CSS com duas media queries: `max-width:1199px` (tablet) e `max-width:767px` (celular). Nada é trocado por JavaScript; a prop `largura` só muda os links. Os painéis mudam de forma só por CSS (largura 480 → 440 → 100%; X vira "‹ voltar").

### Tabela parâmetro × largura

| Parâmetro | PC ≥ 1200 (quadro 1440) | Tablet 768–1199 (quadro 820 em pé) | Celular ≤ 767 (quadro 390) |
|---|---|---|---|
| Barra do topo | 1 linha, 68 px: logo · abas · Metas/Exportar · hora | 2 linhas: logo + hora (60 px) / abas (52 px) + ações | 1 linha fixa no topo (sticky), 60 px: logo · hora · "⋯" |
| Logo | 219×30 | 219×30 | 175×24 |
| Abas | No topo, 68 px de altura, ícone + texto 16 px, sublinhado azul na ativa | No topo, 52 px, "Pedidos" abreviado | **Barra fixa embaixo**, 4 colunas, 62 px, ícone 22 px sobre texto 14 px, traço azul em cima da ativa |
| Metas / Exportar | Botões 40 px no topo | Botões 44 px no topo | Dentro do menu "⋯" (itens 48 px) |
| Hora | 24 px | 24 px | 22 px |
| Margens do conteúdo | 24 / 40 / 64 px, largura máx. 1440 | 24 / 24 / 64 px | 16 / 16 / **168 px** embaixo (folga da barra de abas) |
| Espaço entre blocos | 22 px | 22 px | 18 px |
| Título "Pausas" | 44 px | 44 px | 28 px |
| Filtros | Dois segmentados na linha do título + "Motivos e regras" (48 px) | Os mesmos, quebrando para a linha de baixo; segmentado rola na horizontal se faltar espaço | Somem; botão "Filtros" (48 px) + chip do filtro ativo (48 px); **folha de baixo** com opções de 48 px e "Ver resultado" de 52 px |
| Botões do segmentado | 40 px de altura | 44 px | (na folha) 48 px |
| "Motivos e regras" | Botão no cabeçalho | Botão no cabeçalho | Item do menu "⋯" |
| Grade principal | 2 colunas (1fr / 1,35fr): agora (inteira) · números (inteira) · motivos \| linha do tempo · registro (inteira) | 1 coluna: agora · números · motivos · linha do tempo · registro | 1 coluna, mesma ordem |
| "Setores agora" | 3 colunas | 3 colunas | 1 coluna (3 cards empilhados), texto do motivo 20 px (era 24) |
| Números | 4 colunas, valor 38 px | 4 colunas, valor 38 px | 2×2, valor 32 px, rótulo 14 px |
| Botão "i" | 40×40 | 44×44 | 48×48 |
| Padding dos cards | 20 px | 20 px | 16 px |
| Barras por motivo | Linha de 4 colunas: nome 180 · barra · tempo 64 · qtd 76; altura mín. 46 px | Igual ao PC | 2 linhas: nome + tempo / barra + quantidade |
| Rodapé "Refeição" | Uma linha, "não conta como parada" à direita | Igual | A frase desce para linha própria |
| Linha do tempo | Rótulo 160 px ao lado da trilha (40 px de altura) | Igual | Rótulo **acima** da trilha; eixo sem a coluna do rótulo |
| Registro | Tabela de 5 colunas (130 · 180 · 1fr · 240 · 140) com cabeçalho; linha mín. 64 px | Sem cabeçalho; linha em 3 colunas: quando (110) · setor/motivo/origem empilhados · ação | Card: setor + quando (à direita) / motivo / origem / ação em largura total |
| Botão "Classificar" | 44 px, à direita | 44 px, à direita | 48 px, largura total |
| Painel "Classificar parada" | Lateral direita 480 px, fundo escurecido, X para fechar, rodapé fixo com "Cancelar" / "Salvar motivo" (48 px) à direita | Lateral direita 440 px | **Tela cheia**, "‹ Pausas" no lugar do X, botões do rodapé dividindo a largura |
| Painel "Motivos e regras" | Lateral direita 480 px, cabeçalho 68 px com ícone e X, rodapé com aviso + "Salvar" | Lateral direita 480 px (quadro 820×1180) | **Tela cheia**, cabeçalho 60 px, "‹ Voltar", título 24 px sem ícone, "Salvar" em largura total |
| Stepper de minutos | Botões 44×44, valor 26 px | 44×44 | 48×48 |
| Pílulas de categoria/motivo | mín. 40 px | mín. 44 px | mín. 48 px |
| O que rola | A página; o corpo do painel rola por dentro | Idem | A página (topo e abas fixos); painel rola por dentro com rodapé fixo |
| Altura do quadro | 1500 | 2320 | 2700 |

Fontes: Barlow (texto) e Barlow Semi Condensed 800 (números). Tema escuro `#0A0E15` / cards `#111824`. Foco visível: contorno de 3 px `#BFDBFE`. `prefers-reduced-motion` desliga a transição das barras.

Tablet **horizontal** (1280×800) não tem quadro: cai na regra de PC (≥ 1200), com 2 colunas.

---

## 10. Fase futura, desabilitado ou placeholder

- Botão "+ motivo" em cada categoria: sem ação. Não há editar, renomear, reordenar, remover motivo nem criar categoria.
- Etiqueta "planejada" / "conta como parada": só leitura.
- "Salvar" de Motivos e regras: só fecha; não há estado "salvo" nem "Desfazer" (o painel Metas tem os dois).
- "Lista inicial para conferir com a fábrica": o catálogo é provisório.
- Variante `.pa-ag.alerta` (setor parado sem motivo agora) existe no CSS e não tem exemplo.
- Classe `.r2-tag` usada nas etiquetas do painel Classificar (setor, horário) **não está definida** neste arquivo (existe em Desempenho/Pedidos): no protótipo elas aparecem como texto solto.
- Registro do mês: só hoje e ontem; não há lista dos outros dias nem paginação.
- Linha do tempo só de hoje; sem interação nos blocos.
- Painel Exportar não tem relatório de pausas.
- "Aprovação no teste ... (meta a definir)" e campos "[ ]" pertencem ao painel Exportar (outra família).

---

## 11. Divergências entre arquivos

- Estado do Teste & Embalagem agora: aqui "Pausado · 4 min · Refeição › Café"; em `RH2-Agora` "Pausado · café · 4 min"; em `Tela-Area` "pausado · manutenção"; em `Setores.dc.html` (antigo) "Pausado desde 15:31". São dados de exemplo desencontrados; a regra (mostrar motivo e duração) é a daqui.
- `Historico-Setor` / `Tela-HistInjetora` mostram "T. parado 1h00 · pausas registradas" num resumo e "Parado 7min" no dia 09/11. O 7 min bate com esta tela (Injetora ontem: troca de molde 7 min; almoço e café fora). O "1h00" parece incluir refeição: conferir qual regra vale no histórico.
- No tablet, o aviso tem o botão "Não parou" (fecha sem registrar). Esta tela não tem origem para esse caso.
- No tablet, a faixa mostra só o motivo ("Pausado · Molde"); no RH mostra "categoria › motivo".

---

## 12. Dúvidas para o card

1. Quando o operador toca "Não parou" no aviso, o RH vê alguma coisa (conta em "Avisos do tablet"? vira parada sem motivo? some)?
2. Quando exatamente uma parada sem resposta se fecha: na próxima contagem do setor? E se o dia acabar com o aviso aberto?
3. O RH pode **reclassificar** ou corrigir uma parada já classificada (por ele ou pelo operador)? Pode editar início/fim ou excluir uma parada falsa?
4. Registro no período "Novembro": deve listar todos os dias (com paginação) ou fica só hoje e ontem como no protótipo? E "Ontem" quando ontem não foi dia útil?
5. A linha do tempo deve acompanhar o período (ontem) ou é sempre hoje? Os blocos devem abrir o detalhe?
6. Períodos: bastam Hoje / Ontem / mês atual, ou precisa mês anterior e intervalo de datas (o Exportar tem)?
7. "+ motivo": o RH cria, renomeia, reordena e desativa motivos? Pode criar categoria e mudar "planejada"? Motivo desativado some do tablet e fica no histórico?
8. "Salvar" de Motivos e regras: salvar explícito com "Desfazer" (como Metas) ou gravação imediata? Em quanto tempo a regra chega ao tablet, e o que acontece com tablet sem conexão?
9. Refeição: tem horário/duração prevista? Refeição acima do previsto vira parada? O aviso de parada fica suspenso no horário de almoço?
10. Jornada: o início 07:00 é fixo ou configurável por setor/dia? Há mais de um turno?
11. Uma pausa é do **setor** inteiro ou pode ser de uma mesa/operadora da Montagem (lá a contagem é por mesa)?
12. "Rodando" × "parado": qual evento conta como "contar" em cada setor (placa na Injetora, pulso na Montagem, teste ou pacote no Teste & Embalagem)?
13. Quem acessa: só o perfil RH, ou admin/supervisor também? Quem pode classificar e quem pode mudar regras?
14. Exportar precisa de um relatório de pausas e deve herdar os filtros desta tela?
15. A tela atualiza sozinha (tempo real) ou só ao recarregar? O "Pausado · 4 min" precisa correr ao vivo?
16. Deve existir alerta/notificação para o RH quando um setor fica parado sem motivo (a variante `alerta` do card sugere que sim)?
17. A descrição do RH substitui ou se soma a uma descrição do operador? Há limite de caracteres?
