# Mapa · Briefing RH (4 partes) e Diagnóstico e escopo

Chave da família: `briefing-escopo`

Arquivos lidos (pasta `project/` do protótipo "TP Sistema — Redesign UX"):

| Arquivo | Título no canvas | Quadro (L×A) | Data no texto |
|---|---|---|---|
| `Main.dc.html` | Diagnóstico e escopo | 1280 × 7120 | 03/11/2026 |
| `Briefing-RH-1-Estrutura.dc.html` | Briefing RH · 1 de 4 · pedido e estrutura | 1280 × 4800 | 17/11/2026 |
| `Briefing-RH-2-Visual.dc.html` | Briefing RH · 2 de 4 · linguagem visual e larguras | 1280 × 4600 | 17/11/2026 |
| `Briefing-RH-3-Telas.dc.html` | Briefing RH · 3 de 4 · tela por tela | 1280 × 6200 | 17/11/2026 |
| `Briefing-RH-4-Entrega.dc.html` | Briefing RH · 4 de 4 · dados, canvas e entrega | 1280 × 5600 | 17/11/2026 |
| `canvas.json` | índice do canvas (112 quadros, 19 títulos de linha) | — | criado em 17/11/2026 |

**Natureza desta família.** Não é tela do sistema. São cinco documentos de texto (sem interação, `renderVals()` vazio nos quatro briefings; no `Main` a lógica só devolve listas de texto). Nada aqui vira rota do produto. Servem de **fonte de regras**: escopo, fases, vocabulário, sistema visual, regras por largura, dados de exemplo e regras de negócio.

**Texto dirigido a outro leitor (relatado, não seguido).** A parte 1 traz uma "Mensagem para colar no outro chat" ("Abra o canvas… crie as telas novas do RH embaixo das atuais… Comece pela tela Agora… e me mostre antes de seguir") e a parte 4 traz "Ordem de entrega", posições x/y no canvas e "Valem as instruções do próprio canvas… prevalecem sobre este briefing". São instruções para quem ia **desenhar o protótipo**, não para quem implementa o sistema. Foram tratadas como dado histórico; nenhuma foi executada.

**Atenção: o briefing é anterior ao estado final do canvas.** Vários pontos do briefing foram superados pelos quadros que existem hoje (ver seção 8). Quando o briefing e um quadro `Tela-*`/`RH2-*` discordarem, o quadro é o mais recente.

---

## 1. Propósito e quem usa

- **Diagnóstico e escopo (`Main`)**: análise de UX do site antigo "a partir de 23 capturas de tela do site e do código público". Lista os números que não batem, o que atrapalha o operador, os 6 princípios dos redesenhos, as fases 0 a 3 e 6 perguntas a validar. Título: "O operador registra sem errar, e o RH confia no número".
- **Briefing RH (4 partes)**: pedido de uma segunda versão das telas de RH ("RH versão objetiva"): 7 telas viram 3 telas + 2 painéis, em 3 larguras (1440, 820, 390), com mais gráfico e menos texto. Título: "RH em menos telas, para entender num relance".
- Leitores do produto final citados nos textos: **operador** (tablet do setor, 1280 × 800 deitado), **RH/gestão** (PC, tablet em pé, celular), **Administração** (lança dias, corrige registros, gera ID de tablet).

---

## 2. Diagnóstico e escopo (`Main.dc.html`), bloco a bloco

### 2.1 Cabeçalho e três resumos

- Logo AquaPulse (292 × 40), "SISTEMA DE PRODUÇÃO · DIAGNÓSTICO DE UX · 03/11/2026".
- Três linhas de telas redesenhadas citadas: "entrada e configuração", "Fábrica (tablet do operador)" e "RH (computador)".
- Cards de resumo:
  - **100% · Tudo é lançado à mão**: cada número nasce de um toque do operador no tablet. Única exceção: botão ESP32 das mesas da Montagem, "que fica para uma etapa posterior".
  - **387 × 0 · O mesmo dia, números diferentes**: Montagem marcava 387 placas e as telas Setores e Metas marcavam 0. "Isso precisa bater antes de qualquer ajuste visual."
  - **~640 px · Layout de celular num tablet**: coluna estreita no centro, operador rola para achar o botão, botões perigosos ao lado dos frequentes.

### 2.2 "1 · PRIORIDADE MÁXIMA" · Números que não batem entre as telas (11 linhas)

Vistos nas capturas de 03/11, entre 15:33 e 15:45.

| Onde | O que aparece | O que deveria aparecer / causa provável |
|---|---|---|
| Fábrica › Setores | Injetora 0, Montagem 0, Teste 0 "hoje" | Montagem já tinha 386 no mesmo minuto. A tela lê só os dias fechados. |
| RH › Metas | Montagem "Hoje: 0/270 (0%)" | 387/270 (143%). Não lê a produção do dia em andamento. |
| RH › Analytics | Comparação entre setores, Fluxo da fábrica e Metas do mês zerados | Somar o dia em andamento com os dias fechados do mês. |
| RH › Analytics | Média/hora: 8.222 | Montagem tem ritmo de 45 placas/h. A conta divide pelo tempo produtivo, gravado como 1 min. |
| RH › Histórico | Placas/hora 206.337 · T. produtivo 1min · Eficiência 100% | Dias "Lançados pela Administração" não têm hora de início; tempo perto de zero, taxa explode. |
| RH › Tempo real | Teste & Embalagem: 326 testadas, 300 embaladas (setor pausado) | São os números de 30/10; hoje o setor está com 0. Mostra o último dia salvo como se fosse hoje. |
| RH › Tempo real | Montagem rotulada "3 m" | A tela da Montagem rotula a mesma produção como "1,5 m²". |
| RH › Histórico | 03/11 Montagem: 0 montadas, término 06:58 | Dia fechado às 06:58 com zero. Provável toque acidental em "Fechar dia". |
| RH › Histórico | "Produção diária" lista 27, 28, 29, 30/10 e 03/11 | Faltam 31/10 e 02/11, que aparecem nos cards abaixo (Injetora 201 e 158 boas). |
| Injetora | "Contador automático: cada placa = +2 ciclos" | O número vem dos toques do operador; "automático" confunde. |
| Navegação da Fábrica | "Ejetora" | Erro de digitação de "Injetora". |

Consequência para os cards: cada linha é um **requisito de dados** do sistema novo (regra única de "produção do dia", tempo sempre gravado, setor sem registro = "sem produção hoje", rótulo único de medida).

### 2.3 "2 · USO NO CHÃO DE FÁBRICA" · O que atrapalha o operador hoje (8 cards)

1. **É preciso rolar para trabalhar**: "+1 placa" abaixo da dobra; numa tela de 1920 px a interface usa ~640 px.
2. **Cinco contadores para a mesma coisa**: "Placas", "Placas boas", "Placas totais", "Ciclos totais", "Ciclos início/atual/Δ".
3. **O desfazer está escondido**: "desfazer · 2 ciclos" e botões "−" apagados; sem registro do que foi desfeito.
4. **Ação perigosa com o mesmo peso**: "Fechar dia" grande e branco, colado em "Fechar lote".
5. **Texto pequeno e sem contraste**: rótulos de 10–11 px em caixa alta, vermelho sobre vinho; ilegíveis a 1 m do tablet.
6. **A cor não tem significado fixo**: verde é "Fábrica", "Montagem", "Injetora" e "placa boa" conforme a tela.
7. **O tamanho pode ser trocado no meio do lote**: seletor solto no topo.
8. **Informação velha em destaque**: em Teste & Embalagem o primeiro card é a OS-00015, concluída, com entrega em 01/10.

### 2.4 "3 · REGRAS DAS NOVAS TELAS" · Seis princípios (regras fixas do operador)

| Nº | Título | Texto |
|---|---|---|
| 01 | Uma tela por posto, sem rolar | Tudo o que o operador toca cabe em **1280×800, com o tablet deitado**. |
| 02 | O maior botão é a ação mais frequente | "+1 placa boa", "Pacote finalizado". Ações raras ficam menores e afastadas. |
| 03 | Cor = significado | Verde, âmbar e vermelho só para boa, vazio e perda. Cada setor tem cor própria, só para identificá-lo. |
| 04 | Todo toque deixa rastro | Lista "Últimos registros" mostra cada toque com horário e tem **Desfazer no último**. Substitui os botões "−". |
| 05 | Ação perigosa pede resumo e confirmação | "Fechar dia" mostra o total do dia e exige **segurar o botão**. Fechar com zero pede **segunda confirmação**. |
| 06 | Uma unidade só | "3 m · 1,5 m²" em todas as telas. Tamanho **travado ao iniciar o lote**; trocar de tamanho **fecha o lote**. |

Legenda "Cores fixas": Placa boa `#22C55E` · Cabeça vazia `#F59E0B` · Perda / defeito `#DC2626` · Ação neutra `#2563EB`. Setores: Injetora `#60A5FA` · Montagem `#2DD4BF` · Teste & Embalagem `#C4B5FD`.

### 2.5 "4 · ESCOPO" · Melhorias em ordem de execução

Esforço relativo: P pequeno · M médio · G grande.

**FASE 0 · FAZER PRIMEIRO — Números confiáveis** ("Qualquer tela mostra o mesmo número para o mesmo dia e setor.")
- G · Uma única regra de cálculo da "produção do dia" (dia aberto + dias fechados), usada por Setores, Metas, Analytics e Tempo real.
- M · Gravar início e fim de cada lote e de cada dia, inclusive nos lançamentos da Administração, e esconder placas/hora quando não houver tempo registrado.
- P · Tempo real: setor sem registro hoje aparece como "sem produção hoje", sem repetir o dia anterior.
- P · Produção diária do Histórico com todos os dias fechados.
- P · Revisar o fechamento de 03/11 às 06:58 e bloquear o fechamento de dia com zero sem confirmação.
- P · Rótulo único "3 m · 1,5 m²" e correção de "Ejetora".

**FASE 1 — Telas do operador (tablet)** ("Registrar com um toque, ver o efeito na hora e conseguir desfazer.")
- M · Injetora em tela única: lote travado; +1 boa, Cabeça vazia e Perda (cabeçote ou caninho, meio ou total); um contador por tipo.
- M · "Últimos registros" com Desfazer em todos os setores, no lugar dos botões "−".
- M · Montagem em grade de mesas: operadora, tamanho, placas e estado do botão de cada mesa, com +1 manual e correção.
- M · Teste e Embalagem lado a lado; a OS aparece só quando houver uma aberta.
- P · Fechar lote e Fechar dia com resumo e "segure para confirmar".
- P · Texto mínimo de 14 px, números grandes em fonte condensada, contraste de 4,5:1.

**FASE 2 — Painel do RH e gestão** ("Ver a fábrica como uma linha de produção e saber onde agir.")
- M · Painel em sequência: Injetora → Montagem → Teste → Embalagem, com a meta do dia em cada etapa.
- M · Alertas: setor pausado, dia fechado com zero, tablet sem registro há X minutos.
- M · Produção por hora e por setor, usando só registros com horário.
- M · Histórico em tabela filtrável com CSV; Relatório mensal com prévia antes do PDF.
- P · Metas por setor e por tamanho (hoje os três setores têm 270/dia e 5.670/mês).

**FASE 3 · DEPOIS — Botões ESP32 da Montagem** ("Saber o que cada botão faz e quando ele falha.")
- P · Mapear botão → porta → mesa e mostrar o estado de cada botão na tela da Montagem.
- M · Alertar quando um botão ficar sem sinal ou mandar pulsos repetidos em sequência.
- P · Documentar o firmware, os endpoints (`esp32-pulse`, `esp32-heartbeat`) e o token de cada ESP32.

### 2.6 "5 · VALIDAR ANTES DE CONSTRUIR" · 6 perguntas (ainda abertas no texto)

1. O "Fechar dia" deveria ser automático, por exemplo às 18:00, horário que aparece em todo o histórico?
2. 3 m sempre equivale a 1,5 m² (placa de 0,5 m de largura)? E 5 m equivale a 2,5 m²?
3. A placa boa da Injetora é contada pelo operador ou poderia vir do contador de ciclos da máquina?
4. Teste e Embalagem são um posto com um tablet ou dois postos separados?
5. As metas iguais em todos os setores (270/dia, 5.670/mês) são intencionais?
6. Quem pode corrigir números depois do dia fechado, e isso precisa ficar registrado?

Observação: a pergunta 4 já tem resposta no `CLAUDE.md` do repositório (Teste e Embalagem são UM setor). As demais continuam sem resposta nos documentos.

---

## 3. Briefing RH · parte 1 · pedido e estrutura

### 3.1 O pedido

- **A · Telas mais objetivas**: mesmo objetivo e mesmos dados das telas de RH, com menos telas, menos leitura e mais conteúdo visual.
- **B · Layout para PC, tablet e celular**: "O conteúdo é o mesmo; o arranjo muda. O celular não é o PC encolhido."
- Três indicadores do topo: "7 → 3" (menos telas), "3 larguras" (1440, 820 e 390 px), "5 s" (teste do relance: em cinco segundos a pessoa responde à pergunta da tela).

### 3.2 Oito regras fixas (para as telas novas de RH)

1. **Nada do que existe muda** (regra de canvas; sem efeito no produto).
2. **As novas ficam embaixo das de RH** (regra de canvas).
3. **Mesmo objetivo, mesmos dados**: todo dado das sete telas antigas tem lugar nas novas, à vista ou a um toque.
4. **Não é troca de pele**: muda a estrutura (o que se junta, o que vira gráfico, o que sai da primeira dobra).
5. **Tema escuro, mesmo sistema visual**: mesmas cores, fontes Barlow e Barlow Semi Condensed, raios e logo.
6. **Um número, um valor**: o mesmo dia e setor mostra o mesmo valor em todas as telas e larguras.
7. **Nenhum dado inventado**: o que não se sabe fica como `[ ]`. Sem números, clientes ou datas fictícios.
8. **Mesmo vocabulário**: português do Brasil e os termos "3 m · 1,5 m²", placas boas, montadas, testadas, embaladas, pacotes, operadora, mesa.

### 3.3 Nova estrutura: 7 telas → 3 telas + 2 painéis

| Tela nova | Pergunta que responde | Junta |
|---|---|---|
| **Agora** | "A fábrica está bem agora? Onde preciso agir?" | Tempo real + parte "hoje" de Metas |
| **Desempenho** | "Estamos batendo a meta do período? O que está piorando?" | Analytics + Histórico + parte "mês" de Metas |
| **Pedidos e estoque** | "Tenho pacote para entregar o que foi pedido?" | Ordens de serviço + Pacotes e estoque |
| **Painel Metas** | (ação) | Abre ao tocar em qualquer indicador de meta ou pelo botão "Metas" da navegação |
| **Painel Exportar** | (ação) | Abre pelo botão "Exportar", já com período e filtros da tela aberta |

Tabela de migração (tela antiga → destino → como aparece):

| Tela antiga | Vai para | Como aparece |
|---|---|---|
| Tempo real | Agora | Linha de produção em quatro etapas ligadas, com anel de meta em cada uma. Alertas no topo. Detalhe de cada setor a um toque. |
| Metas · hoje | Agora | O anel de cada etapa já é a meta do dia. Some o card separado. |
| Metas · mês e ritmo | Desempenho | Três barras de meta com o marcador do esperado e a projeção de fechamento. |
| Metas · edição | Painel Metas | Dias úteis, meta por dia de cada setor, meta por tamanho, salvar e desfazer. |
| Analytics | Desempenho | Tendência por dia, perdas, composição por medida e por operadora, eficiência e tempo. |
| Histórico | Desempenho | Matriz dia × setor no lugar da lista longa. Tocar numa célula abre o registro completo, com "Corrigir este registro". |
| Relatórios | Painel Exportar | Tipo, período, filtros, seções, formato e prévia do documento. |
| Ordens de serviço | Pedidos e estoque | Cards de OS por estado, com barra de pacotes atendidos. Detalhe com a linha do tempo da OS. |
| Pacotes e estoque | Pedidos e estoque | Nível de estoque por medida contra o mínimo, pacotes por dia e movimentações. |

Blocos que existiam duas vezes e passam a existir uma:
- "Produção por dia" (Analytics) + "Produção diária" (Histórico) → um gráfico, em Desempenho.
- "Mix de medidas" + "Por medida" → um bloco.
- "Operadoras da Montagem" + "Ranking da Montagem" → um ranking.
- 6 números do topo do Analytics + 9 do Histórico → no máximo 4 no topo; os demais viram anotação dentro do gráfico.
- A meta do dia (Tempo real, Analytics, Metas) → anel da etapa (Agora) e barra de meta (Desempenho).

Limite declarado: a divisão é recomendação; pode mudar se ficarem **no máximo 4 telas**, todos os dados acessíveis e a mudança for explicada. (O canvas final usa esse limite: existe uma quarta tela, **Pausas**. Ver seção 8.)

---

## 4. Briefing RH · parte 2 · linguagem visual e larguras

### 4.1 Forma fixa por tipo de informação (seção "4 · MENOS LEITURA")

| Para mostrar | Usar | Exemplo |
|---|---|---|
| Progresso até a meta | Anel com o percentual no centro | Injetora: 76 de 270 → anel em 28% |
| Ritmo contra o esperado | Barra com um traço no ponto esperado | Meta do mês em 27%, traço do esperado em 24% |
| Sequência da fábrica | Etapas ligadas por setas, um número em cada | Injetora 76 → Montagem 161 → Teste 139 → Embalagem 120 |
| Valor por dia | Barras verticais com a linha da meta | 801, 695, 565, 415, 660 · meta 540 |
| Taxa ao longo do tempo | Linha, com a média tracejada | Perdas: 4,1% → 10,0% · média 5,34% |
| Comparar pessoas ou medidas | Barras horizontais, da maior para a menor | Maiara 766 · Helena 413 · Maria 364 · Daniel 153 |
| Duas ou três partes de um todo | Uma barra dividida | Produtivo 96,7% × parado 3,3% · caninho × cabeçote |
| Nível contra o mínimo | Coluna de nível com a linha do mínimo | Estoque de 3 m: 384 pacotes |
| Dia × setor | Matriz de células, cor pela meta do dia | Histórico: 5 dias × 3 setores |
| Estado | Ponto colorido + uma palavra | Rodando · Pausado · Sem produção hoje |
| Etapas de um pedido | Linha do tempo de pontos | OS: criada → reservada → atendida → expedida |
| Medida da placa | Chip | 3 m · 1,5 m² |
| Alerta | Faixa com ícone e até 8 palavras | "Teste parado há 4 min" |

Regra extra: pizza só para duas ou três partes; quatro ou mais itens = barras.

### 4.2 Limites de texto e destaque (seção "5")

**Texto**
- Título da tela: até 3 palavras. Sem parágrafo de subtítulo.
- Rótulo de bloco: até 2 palavras. Nota de apoio: até 4.
- Nenhuma frase explicativa à vista. A definição de uma conta ("boas ÷ (boas + perdidas)") fica na dica do ícone de informação e no `aria-label`.
- Número sempre com unidade e referência ao lado: "76 / 270".

**Destaque**
- Um destaque principal por tela.
- Até 4 números no topo.
- Três tamanhos de número: **destaque 56 a 72 px, topo 32 a 40 px, apoio 20 a 26 px**.
- **Texto nunca abaixo de 14 px. Contraste mínimo de 4,5:1.**

**Cor**
- Verde, âmbar e vermelho só para boa, atenção e perda. Azul para ação.
- Azul, verde-água e lilás identificam Injetora, Montagem e Teste & Embalagem, e só isso.
- Todo estado tem também ícone ou palavra. A cor nunca informa sozinha.

**Detalhe e vazio**
- A primeira dobra responde à pergunta da tela sem rolar (PC em 1440 × 900).
- Detalhe sob demanda: painel lateral no PC e no tablet, folha de baixo ou tela cheia no celular.
- Estados vazios desenhados: "sem produção hoje", "sem dados", "nenhuma OS aberta".
- Ícones em SVG de traço, sempre com rótulo. Sem emoji.

### 4.3 Sistema visual (tokens)

| Grupo | Token | Valor |
|---|---|---|
| Superfície | Fundo | `#0A0E15` |
| Superfície | Card | `#111824` |
| Superfície | Navegação | `#0D121B` |
| Superfície | Selecionado | `#16223A` |
| Superfície | Borda | `#26334A` |
| Superfície | Trilho | `#1C2738` |
| Texto | Texto | `#EEF2F8` |
| Texto | Texto 2 | `#CBD5E1` |
| Texto | Apoio | `#A3B0C2` |
| Significado | Boa | `#22C55E` (texto sobre escuro: `#86EFAC`) |
| Significado | Atenção / cabeça vazia | `#F59E0B` (texto: `#FCD34D`) |
| Significado | Perda / defeito | `#DC2626` (texto: `#FCA5A5`) |
| Significado | Ação | `#2563EB` (texto: `#93C5FD`) |
| Setor | Injetora | `#60A5FA` |
| Setor | Montagem | `#2DD4BF` |
| Setor | Teste & Embalagem | `#C4B5FD` |

Cores auxiliares usadas nos próprios documentos (não listadas como token, mas presentes no CSS): parágrafo `#B7C2D3`, link `#93C5FD`/hover `#BFDBFE`, chip `#16223A` com borda `#2E4470` e texto `#BFDBFE`, aviso âmbar fundo `#1A1608` borda `#7A5A12` texto `#FDE68A`/`#FCD34D`, texto verde-água `#5EEAD4`, lilás claro `#DDD6FE`, texto sobre pílula verde `#052E16`, sobre âmbar `#2A1A00`.

- **Fontes**: Barlow (400, 500, 600, 700) no texto; Barlow Semi Condensed (600, 700, 800) nos números e títulos. Carregadas do Google Fonts no protótipo.
- **Raios**: 12 a 18 px (cards dos documentos usam 14 px; pílulas 999 px; chips de código 6 px).
- **Logo da navegação**: blob `/_blob/ca29809a80155992525940c070438ad3`, 219 × 30 (no cabeçalho dos documentos aparece em 292 × 40).
- **Logo da prévia do relatório**: blob `/_blob/b1215d43f356309ca21b972f311e8a28`, 52 × 52.
- Escala tipográfica dos documentos (referência): h1 48–52 px/800 condensada, h2 30–32 px/700, h3 19–20 px/700, parágrafo 16 px (lead 18–19 px), eyebrow 13–14 px/600 com espaçamento .08–.12em.

### 4.4 PC, tablet e celular (regra geral das telas de RH)

"Nada é escondido numa largura e mostrado em outra. O que muda é a ordem, o número de colunas e a forma de abrir o detalhe." Tabela completa na seção 11.

- **Ordem no celular**: alertas, destaque principal, números do topo, gráficos, listas. "O que pede ação vem antes do que só informa."
- **Tablet em pé é o caso de projeto** (820). Deitado (1180 px) usa o mesmo arranjo, com mais respiro.
- **Um código por tela, quando der**: um componente responsivo por tela; os quadros de tablet e celular mostram o mesmo componente em outra largura.
- **Fora do pedido (na época)**: "As telas do operador (tablet da fábrica, 1280 × 800) não mudam. As três larguras valem só para as telas novas de RH." (Superado: ver seção 8.)

---

## 5. Briefing RH · parte 3 · tela por tela

### 5.1 Tela 1 · Agora

Dados do dia em andamento: terça, 10/11, 09:49.

| Bloco | Forma | Dados |
|---|---|---|
| Cabeçalho | Título "Agora", data, ponto ao vivo com a hora da atualização | ter 10/11 · atualizado 09:49:57. Filtro Medida: Todas, 2, 3, 4, 5 m. Filtro Setor sai: tocar numa etapa foca o setor. |
| Alertas | Faixa no topo, até 3, com ícone | "Daniel: 3 placas sem mesa" · "Mesas 5 e 6 sem operadora" · "Teste parado há 4 min" |
| **Linha de produção (destaque)** | 4 etapas ligadas por setas; em cada uma: anel da meta, número grande, estado, chips por medida | Injetora 76 boas · 28% de 270. Montagem 161 montadas · 60%. Teste 139 testadas · 86,3% aprovadas. Embalagem 12 pacotes (120 placas) · 44%. Estado: Rodando, Pausado ou Sem produção hoje. |
| Números do topo | 4 números com rótulo de 2 palavras | Área hoje 513,5 m² · Eficiência da injetora 96,2% · Aprovação no teste 86,3% · Estoque de 3 m 384 pacotes |
| Injetora | Barra dividida boas × perdas × vazios; barra ativo × parado | Boas 76 · perdas 3 · vazios 0. Ativa 2h33 · parada 0s. Apoio: ciclos 156, ciclos perdidos 4, área 114 m², lote atual 3 m · 1,5 m². |
| Montagem | Barras por operadora; grade das 6 mesas com estado | Helena 65 (Mesa 1 · 2 m · 44 e Mesa 2 · 3 m · 21) · Maiara 54 (Mesa 3) · Maria 39 (Mesa 4) · Daniel 3 (sem mesa, em âmbar). Mesas 5 e 6 vazias. Última 09:49:12. Área 219,5 m². |
| Teste & Embalagem | Barra aprovadas × reprovadas; barra caninho × cabeçote | Aprovadas 120 · reprovadas 19 · perda 13,7%. Caninho 7 · cabeçote 12. Embaladas 120 · pacotes 12. Última 09:45:41. |

Arranjo:
- **PC 1440**: alertas, linha de produção com 4 etapas lado a lado e os 4 números na primeira dobra. Três painéis de setor em linha logo abaixo.
- **Tablet 820**: etapas em grade 2 × 2, setas seguindo a ordem. Números em linha. Um painel de setor por vez, trocado por um seletor de 3 opções.
- **Celular 390**: alertas em chips que rolam de lado. Etapas em lista vertical ligada por uma linha (nome, número sobre meta, anel pequeno). Números 2 × 2. Tocar numa etapa abre o setor em tela cheia.

### 5.2 Tela 2 · Desempenho

Dados de novembro de 2026: 5 dias com produção, até 09/11.

| Bloco | Forma | Dados |
|---|---|---|
| Cabeçalho e filtros | Título com o período; filtros em segmentos | Período: Hoje, 7 dias, Mês, Trimestre, Ano. Medida. Setor. Em "Mais filtros": Operadora e Origem (tablet de cada setor ou "Lançado pela Administração"). |
| Números do topo | 4 números, com linha de tendência pequena quando há dado por dia | Placas 4.640 · Área 7.313 m² · Perdas 5,34% (262) · Tempo produtivo 137h51 (96,7%) |
| **Metas do mês (destaque)** | 3 barras de meta com traço do esperado e seta de projeção. Tocar abre o painel Metas | Meta 5.670 por setor · esperado até ontem 24%. Injetora 1.504 · 27% · faz 301/dia, precisa 278 · fecha em 6.016. Montagem 1.696 · 30% · faz 339, precisa 265 · fecha em 6.784. Teste & Embalagem 1.440 · 25% · faz 288, precisa 282 · fecha em 5.760. |
| Produção e perdas por dia | Dois gráficos empilhados no mesmo eixo: barras com linha da meta; linha de perdas | 03/11 a 09/11: 801, 695, 565, 415, 660 placas · meta do dia 540 · 4 de 5 dias bateram · média 627/dia. Perdas 4,1% → 10,0% · média 5,34%. Ao tocar num dia: placas, m² e variação sobre o dia anterior. |
| Composição | Barras horizontais ordenadas; medidas e perdas na mesma linha | Medidas: 3 m 2.343 (170 perdas · 6,8%) · 4 m 407 (22 · 5,1%) · 2 m 386 (30 · 7,2%) · 5 m 0. Operadoras: Maiara 766, Helena 413, Maria 364, Daniel 153. Setores: Injetora 1.504 · 2.269,5 m², Montagem 1.696 · 2.539,5 m², Teste & Embalagem 1.440 · 2.504 m². |
| Eficiência e tempo | 2 anéis e 2 barras divididas | Eficiência da injetora 97,8% · aprovação no teste 86,6%. Produtivo 137h51 × parado 4h41. Defeitos do teste: caninho 12 × cabeçote 28. Apoio: ciclos 2.762, média por hora 34. |
| Registros | Matriz dia × setor; célula com número do dia, cor pela meta, marca da origem; tocar abre o registro | 15 registros (5 dias × 3 setores). Conhecidos: 09/11 Injetora 276 boas, Montagem 390, Teste 343 testadas e 270 embaladas; 06/11 Montagem 185. |

**O que o registro aberto mostra**
- **Sempre**: dia e dia da semana, setor, início → término e duração, medidas, origem, e o botão "Corrigir este registro".
- **Injetora**: placas boas, perdidas, ciclos totais, vazios e perdidos, área, eficiência, taxa de erro; quebra de perdas (cabeçote meio e total, caninho meio e total); produtivo, parado, placas/hora, ciclos/hora, tempo por placa e por ciclo; boas e ruins por medida.
- **Montagem**: montadas, área, ritmo por hora, % da meta, placas por operadora.
- **Teste & Embalagem**: testadas, embaladas, defeitos, % de perda, pacotes, caninho, cabeçote, ritmo por hora.
- Gráficos pequenos (barra dividida, barras por operadora) vêm antes dos números soltos.

Arranjo:
- **PC 1440**: filtros numa linha. Números e metas na primeira dobra. Gráficos por dia em dois terços, composição ao lado. Matriz em largura total; registro em painel lateral.
- **Tablet 820**: metas num card só, 3 barras empilhadas. Gráficos em largura total. Composição em 2 colunas. A matriz cabe inteira (5 dias).
- **Celular 390**: números 2 × 2. Composição em abas: Medidas, Operadoras, Setores. A matriz vira lista de dias, cada dia com 3 células coloridas. Registro em tela cheia.

### 5.3 Tela 3 · Pedidos e estoque

Regra de estoque declarada: "O estoque entra quando a Embalagem finaliza um pacote de 10 placas e sai quando uma OS é expedida."

| Bloco | Forma | Dados |
|---|---|---|
| Cabeçalho | Título, filtro Medida, busca, botão principal | Busca "OS ou cliente". Botão "+ Nova OS". Num menu: "Definir mínimos" e "Ajustar estoque". |
| Números do topo | 4 números | Disponível 384 pacotes (3 m · 3.840 placas) · Reservado `[ ]` · Pacotes hoje 12 (42% da média) · Expedido no mês `[ ]` |
| **Estoque por medida (destaque)** | 4 colunas de nível: disponível cheio, reservado em tom mais claro, traço do mínimo, situação embaixo | 3 m · 1,5 m²: 384 · OK. 2 m, 4 m e 5 m: sem dados (coluna vazia tracejada). Situações: OK, abaixo do mínimo, sem dados. |
| Ordens de serviço | Cards em colunas por estado, com contagem; cada card com barra de pacotes atendidos | Abertas 0 · Em produção 0 · Concluídas 1. Card: OS-00015 · Sem cliente · 3 m · 1,5 m² · entrega 01/10/2026 · 100 / 100. Coluna vazia: "nenhuma OS aberta". |
| Detalhe da OS | Painel com barra de progresso e linha do tempo de 4 pontos | 100 / 100 pacotes · 10 placas por pacote = 1.000 placas. Criada `[data]` → Estoque reservado → Pacotes atendidos 100 de 100 → Expedição ainda não registrada. Botões "Editar" e "Registrar expedição". |
| Pacotes por dia | Barras verticais com linha da média; hoje em outro tom | 03/11 a 10/11: 36, 33, 25, 23, 27, 12 (hoje, até 09:45) · média 28,8 · 144 pacotes em 7 dias |
| Movimentações | Linha do tempo com ícone por tipo e quantidade com sinal | Tipos: Entrada, Reserva, Expedição, Ajuste. Cada linha: quando, detalhe, medida, quantidade. 5 últimas e "ver todas". Ajuste mostra quem fez e o motivo. |

Arranjo:
- **PC 1440**: estoque por medida e pacotes por dia à esquerda (um terço). Ordens de serviço à direita (dois terços). Movimentações abaixo. Detalhe da OS em painel lateral.
- **Tablet 820**: 4 colunas de nível em linha no topo. Ordens de serviço em abas com contagem. Depois pacotes por dia e movimentações.
- **Celular 390**: estoque em 4 barras horizontais, uma por medida. OS em abas e cards. "+ Nova OS" como botão flutuante. Detalhe da OS em tela cheia.

### 5.4 Painel Metas

Abre pelo anel (Agora), pela barra de meta (Desempenho) ou pelo botão "Metas".
- Dias úteis no mês: 21.
- Uma linha por setor, com o que conta: Injetora (placas boas), Montagem (placas montadas), Teste & Embalagem (placas embaladas).
- Meta por dia (270) com botões de menos e mais. Meta do mês calculada na hora: 270 × 21 = 5.670.
- Duas barras pequenas ao lado: hoje (76, 161 e 120 de 270) e mês (1.504, 1.696 e 1.440 de 5.670).
- Ritmo para bater a meta: faltam 4.166, 3.974 e 4.230 · 15 dias úteis restantes · 278, 265 e 282 placas por dia.
- "Meta por tamanho" (2, 3, 4 e 5 m) como seção que abre, opcional.
- "Desfazer mudanças" e "Salvar metas". Aviso curto: só o RH altera; aparece no tablet de cada setor.
- **PC e tablet**: painel lateral de **480 px**. **Celular**: tela cheia, com Salvar fixo embaixo.

### 5.5 Painel Exportar

Substitui a tela Relatórios e os botões "Exportar CSV" e "PDF" do Histórico. Abre com o período e os filtros da tela de onde foi chamado.
- Tipo, em 5 blocos com ícone: Relatório mensal, Produção por operadora, Perdas e defeitos, Pacotes e estoque, Fechamentos e correções.
- Período, Medida e Setores.
- Seções: Resumo do período, Por setor e meta, Por medida, Perdas e defeitos, Operadoras, Pontos de atenção.
- Formato: PDF (principal), Excel, CSV.
- Opção "Enviar todo dia 1º por e-mail para o RH".
- Prévia do documento em página branca, incluindo Pontos de atenção.
- **PC**: painel largo, formulário à esquerda e prévia à direita. **Tablet**: formulário e prévia abaixo. **Celular**: formulário em tela cheia e botão "Ver prévia".

---

## 6. Briefing RH · parte 4 · dados, canvas e entrega

### 6.1 Uma fonte por assunto (dados de exemplo)

| Assunto | Fonte (tela antiga) | Momento | Valores |
|---|---|---|---|
| Hoje | RH · tempo real | terça, 10/11/2026, relógio 09:49 | Injetora 76 · Montagem 161 · Teste 139 · Embaladas 120 |
| Mês | RH · analytics | novembro de 2026, 5 dias com produção até 09/11 | Injetora 1.504 · Montagem 1.696 · Teste & Embalagem 1.440 |
| Pedidos e estoque | RH · ordens de serviço e RH · pacotes e estoque | — | Uma OS (OS-00015) e estoque só de 3 m |

Constantes: metas 270 por dia e 5.670 por mês em cada setor; 21 dias úteis, 15 restantes. Medidas: 2 m · 1 m², 3 m · 1,5 m², 4 m · 2 m², 5 m · 2,5 m². Um pacote = 10 placas.

### 6.2 Sete divergências das telas antigas e o valor adotado

| Assunto | O que aparecia | O que a versão nova usa |
|---|---|---|
| Produção de hoje | Metas: 240, 387 e 0 (15:36). Tempo real: 76, 161 e 139 (09:49). | Tempo real: 76, 161, 139 e 120 embaladas. |
| Produção do mês | Metas: 398, 387 e 0. Analytics: 1.504, 1.696 e 1.440. Relatórios: Injetora 0 com asterisco. | Analytics: 1.504, 1.696 e 1.440. |
| Totais do período | Analytics: 4.640 placas, 7.313 m², 5,34% de perdas, 34/hora. Histórico: 4.482 boas, 7.076 m², 5,5%, 33/hora. | Analytics. A diferença vira pergunta. |
| Média por dia | Analytics: 928 no topo (três setores somados) e 627 no gráfico (montadas + embaladas). | 627, anotada no gráfico. |
| Área de hoje | Tempo real calcula 513,5 m² e anota "tela atual: 542 m²". | 513,5 m². |
| Alertas | Tempo real tem 3 alertas nos dados e nenhum na tela. | Os 3 alertas aparecem no topo de Agora. |
| Relógio | 09:49 em cinco telas, 15:36 em Metas e Ordens de serviço. | 09:49 em todas. |

### 6.3 Canvas (posições pedidas na época)

O briefing pedia 13 quadros em y = 5124: Agora, Desempenho e Pedidos em PC/tablet/celular (x 1400 a 9760), Painel Metas PC e celular (x 10310 e 11830), Painel Exportar PC e celular (x 12380 e 13900). 80 px entre larguras da mesma tela, 160 px entre telas. Título de quadro no padrão "RH objetivo · Agora · PC". Título da linha: "RH e gestão · versão objetiva · PC, tablet e celular" (existe no canvas em x 1400, y 4824).

Regras de quadro que valem como requisito de produto:
- "Página fluida e interativa… Altura igual à altura real da página naquela largura."
- "As abas ligam Agora, Desempenho e Pedidos e estoque na mesma largura. O logo leva a `Hub.dc.html`."
- "Os painéis abrem dentro das telas… Os quadros 'Painel' mostram cada painel já aberto sobre a tela."

### 6.4 Ordem de entrega do protótipo (histórico)

1. Ler. 2. Agora nas três larguras (parar e mostrar). 3. Desempenho. 4. Pedidos e estoque. 5. Painéis Metas e Exportar (PC e celular). 6. Resposta final com tabela de paridade e divergências.

### 6.5 "Pronto quando" · doze verificações (viram critérios de aceite das telas de RH)

1. Os 20 quadros que já existiam estão iguais (canvas).
2. As telas novas estão abaixo da linha de RH (canvas).
3. No máximo 4 telas novas.
4. Cada tela existe em 1440, 820 e 390 px, com o mesmo conteúdo nas três.
5. **Nenhuma largura tem rolagem horizontal da página.**
6. **Cada tela tem um destaque principal e no máximo 4 números no topo.**
7. **Não há parágrafo nem frase explicativa à vista. Rótulos com até 2 palavras.**
8. **Cada informação usa a forma fixa da parte 2.**
9. Todo dado das sete telas antigas está à vista ou a um toque, e consta na tabela de paridade.
10. **O mesmo dado mostra o mesmo valor em todas as telas e larguras.**
11. **Texto com 14 px ou mais, contraste de 4,5:1, alvos de toque de 44 px no tablet e 48 px no celular.**
12. **Em 5 segundos olhando a primeira dobra, dá para responder à pergunta da tela.**

### 6.6 Paridade de dados

O briefing exige uma "tabela de paridade" (uma linha por bloco das sete telas antigas → tela e bloco novos → à vista ou a um toque) como parte da **resposta final do outro chat**. Essa tabela **não está em nenhum arquivo desta família**; só existe a tabela de migração por tela (seção 3.3) e a lista de blocos fundidos. Os sete arquivos das telas antigas (`Painel-RH`, `Analytics`, `Historico`, `Metas`, `Relatorios`, `OS`, `Estoque`) **não estão mais na pasta `project/`**, então a paridade bloco a bloco não pode ser conferida a partir do protótipo.

### 6.7 Cinco decisões que "quem pediu pode mudar"

1. **Metas e Relatórios viram painéis**, não telas. Se a prévia precisar de mais espaço, Relatórios pode voltar a ser a quarta tela.
2. **Tablet em pé, 820 px.** Se o RH usa o tablet deitado, trocar para 1180 px.
3. **As três larguras valem só para as telas novas de RH.** (Superada: ver seção 8.)
4. **Sem gráfico de pizza** para quatro ou mais itens.
5. **O filtro Setor sai da tela Agora.** Tocar numa etapa faz o mesmo papel.

---

## 7. Regras de negócio e contas (consolidado, com conferência dos números)

Todas as contas abaixo foram refeitas com os números de exemplo; "confere" significa que a aritmética fecha.

### Medidas e área
- Medidas: 2 m = 1 m², 3 m = 1,5 m², 4 m = 2 m², 5 m = 2,5 m² (placa de 0,5 m de largura, a confirmar). Rótulo único "3 m · 1,5 m²". Parece **cadastro fixo**, não configurável na interface.
- Área = soma de placas × m² da medida. Injetora hoje: 76 × 1,5 = 114 m² (confere). Montagem hoje: 44 × 1 + (21 + 54 + 39 + 3) × 1,5 = 219,5 m² (confere).
- **"Área hoje" 513,5 m² = 114 (Injetora) + 219,5 (Montagem) + 180 (120 embaladas × 1,5)**: confere, ou seja, soma a área dos três setores (a mesma placa conta até três vezes).

### Metas
- Meta por dia por setor: 270 (configurável pelo RH, com botões menos/mais). Meta por tamanho (2, 3, 4, 5 m): opcional.
- Dias úteis no mês: 21 (configurável). Meta do mês = meta/dia × dias úteis = 270 × 21 = 5.670 (calculada na hora).
- O que conta para a meta: Injetora = placas boas; Montagem = placas montadas; Teste & Embalagem = placas **embaladas** (não as testadas).
- % do dia: 76/270 = 28%; 161/270 = 60%; 120/270 = 44% (conferem). Na etapa Teste, o anel mostra a **aprovação** (86,3%), não a meta.
- "Esperado até ontem" 24% = 5 dias com produção ÷ 21 dias úteis = 23,8% (confere).
- "Faz por dia" = produzido no mês ÷ dias com produção: 1.504/5 = 301; 1.696/5 = 339; 1.440/5 = 288 (conferem).
- "Precisa por dia" = (meta do mês − produzido) ÷ dias úteis restantes: 4.166/15 = 278; 3.974/15 = 265; 4.230/15 = 282 (conferem).
- "Fecha em" (projeção) = faz por dia × 20: 6.016, 6.784, 5.760 (conferem com 20 dias = 5 produzidos + 15 restantes; o dia de hoje, 10/11, não entra em nenhum dos dois lados; ver dúvidas).
- Meta do dia no gráfico de produção: 540 = 270 × 2 (montadas + embaladas). "4 de 5 dias bateram" (só 415 ficou abaixo).

### Produção
- "Produção do dia" tem de ser uma regra única: dia aberto + dias fechados (Fase 0).
- Produção por dia no gráfico = montadas + embaladas: 801 + 695 + 565 + 415 + 660 = 3.136 = 1.696 + 1.440 (confere). Média 627/dia (confere). 09/11: 390 + 270 = 660 (confere). 06/11: 185 + 230 = 415 (confere).
- "Placas 4.640" no topo de Desempenho = 1.504 + 1.696 + 1.440 (soma dos três setores; confere).
- Soma das medidas 2.343 + 407 + 386 = 3.136 (bate com montadas + embaladas, não com 4.640).
- Operadoras: 766 + 413 + 364 + 153 = 1.696 = total da Montagem (confere).
- Setor sem registro no dia = estado "Sem produção hoje" (nunca repetir o dia anterior).

### Injetora: ciclos, perdas, eficiência
- Tipos de toque: +1 placa boa, Cabeça vazia, Perda (cabeçote ou caninho; meio ou total).
- "cada placa = +2 ciclos" (texto antigo). Hoje: 76 boas × 2 = 152 + 4 ciclos perdidos = 156 ciclos (confere). Com 3 perdas e 4 ciclos perdidos, a leitura provável é perda "meio" = 1 ciclo e "total" = 2 ciclos (inferência; não está escrito).
- Eficiência da injetora = boas ÷ (boas + perdidas): 76/79 = 96,2% (confere). Mês: 97,8%.
- Lote: tamanho travado ao iniciar; trocar de tamanho fecha o lote.

### Perdas e teste
- Aprovação no teste = aprovadas ÷ testadas: 120/139 = 86,3% (confere). Perda do teste = 19/139 = 13,7% (confere). Defeitos: caninho 7 + cabeçote 12 = 19 (confere).
- Perdas do período 5,34% (262) = 262 ÷ (4.640 + 262) (confere).
- Perdas por medida: 170/(2.343 + 170) = 6,8%; 22/(407 + 22) = 5,1%; 30/(386 + 30) = 7,2% (conferem). Soma 222, não 262 (diferença de 40 = caninho 12 + cabeçote 28 do teste; não explicado no texto).

### Tempo
- Produtivo 137h51 × parado 4h41 → 96,7% produtivo (confere). Média por hora 34 = 4.640 ÷ 137,85 h (confere).
- Início e fim de cada lote e de cada dia sempre gravados, inclusive em lançamento da Administração. **Sem tempo registrado, esconder placas/hora.**
- Injetora hoje: ativa 2h33 · parada 0s.

### Pausas e alertas
- Alertas previstos (Fase 2): setor pausado, dia fechado com zero, tablet sem registro há X minutos. Exemplo: "Teste parado há 4 min".
- Alertas de exemplo em Agora: "Daniel: 3 placas sem mesa" · "Mesas 5 e 6 sem operadora" · "Teste parado há 4 min". Máximo de 3 à vista, até 8 palavras cada.
- O valor de X **não está nesta família**. Nos quadros posteriores (conferido por busca): o tablet avisa depois de **10 min (Injetora), 15 min (Montagem)** sem contar, e o valor é configurável em "RH › Pausas › Motivos e regras" (passos de 5 minutos). Detalhe pertence às famílias `injetora`, `montagem`, `teste` e `rh2-pausas`.

### Fechamentos e confirmações
- "Fechar lote" e "Fechar dia": mostram resumo e exigem "segure para confirmar".
- Fechar dia com zero: segunda confirmação.
- "Últimos registros": cada toque com horário; Desfazer só no último; registro do que foi desfeito.
- Correção depois do dia fechado: botão "Corrigir este registro" no registro aberto (quem pode e como audita: em aberto). Relatório "Fechamentos e correções" pressupõe trilha de auditoria.

### Pacotes, estoque e OS
- Um pacote = 10 placas (briefing). 12 pacotes = 120 placas. Pacotes × 10 por dia = embaladas do dia (36, 33, 25, 23, 27 → 1.440 no mês; confere).
- Estoque: entra quando a Embalagem finaliza um pacote; sai quando uma OS é expedida. Unidade do estoque: pacote, por medida.
- Situação por medida: OK, abaixo do mínimo, sem dados. Mínimo por medida configurável ("Definir mínimos"). Ajuste manual ("Ajustar estoque") grava quem fez e o motivo.
- Movimentações: Entrada, Reserva, Expedição, Ajuste (quantidade com sinal).
- Estados da OS: Abertas, Em produção, Concluídas. Linha do tempo: criada → reservada → atendida → expedida.
- "Pacotes hoje 12 (42% da média)": 12 ÷ 28,8 (confere). Média 28,8 = 144 ÷ 5 dias com produção (o texto diz "em 7 dias").
- OS-00015: sem cliente, 3 m · 1,5 m², entrega 01/10/2026, 100/100 pacotes = 1.000 placas, expedição não registrada.

### Origem do registro
- Origem: tablet de cada setor ou "Lançado pela Administração". É filtro em Desempenho e marca na célula da matriz.

### ESP32 (Fase 3)
- Botão físico por mesa da Montagem: mapa botão → porta → mesa; endpoints `esp32-pulse` e `esp32-heartbeat`; token por ESP32; alerta de botão sem sinal ou com pulsos repetidos.

---

## 8. O que mudou entre o briefing e o canvas atual

Conferido no `canvas.json` e por busca nos arquivos `RH2-*`/`Tela-*` (sem mapear essas telas; elas têm famílias próprias).

| Ponto | Briefing (17/11) | Canvas atual |
|---|---|---|
| Sete telas antigas de RH | "permanecem na linha 'RH e gestão · computador'" | Não existem mais em `project/` nem no índice. Só a versão `RH2-*`. |
| Número de telas de RH | 3 telas + 2 painéis | **4 telas + 2 painéis**: existe **Pausas** (`RH2-Pausas*`), com "motivos e regras" e "classificar parada". O briefing não descreve Pausas. |
| Vocabulário de pedido | "OS", "Ordens de serviço", "+ Nova OS", "OS-00015" | **"OP", "Ordens de produção", "Nova OP", "OP-00015"** nos quadros `RH2-Pedidos*` (títulos "OP aberta"). |
| Pacote | "um pacote de 10 placas" (fixo) | "10 placas por padrão; o operador ajusta quando sai com outra quantid[ade]" (texto em `RH2-Pedidos`; botões "Uma placa a mais/a menos por pacote" em `Tela-Teste`). |
| Larguras das telas do operador | "não mudam… não ganham versão de tablet e celular" | Existem `Tela-*` em **PC 1440×900, tablet horizontal 1280×800, tablet vertical 800×1280 e celular 390** para Entrar, Escolher área, Configurar tablet, Admin · tablets, Setores, Injetora, Montagem, Mesas, Teste, e os três Históricos de setor. |
| Posição dos painéis | Painel Metas em x 10310 | Pausas ocupa x 10310 a 12730; Painel Metas em 13280 e 14800; Painel Exportar em 15350 e 16870. |
| Quadros de estado | Não previstos | Existem quadros de detalhe aberto: Agora · celular/tablet por setor, Desempenho · registro aberto (3 larguras), Pedidos · OP aberta (3 larguras), Pausas · motivos e classificar, Exportar · celular · prévia. |
| Painéis no tablet | "Painéis Metas e Exportar, em PC e celular" | Sem quadro de tablet para os painéis (só PC e celular), como pedido. |
| Linha "Fábrica · tablet do operador" | 20 quadros antigos | Continuam os quadros de 1280×800 sem prefixo (`Login`, `Hub`, `Tablet`, `Admin-Tablets`, `Setores`, `Injetora`, `Montagem`, `Mesas`, `Teste`, `Historico-*`), anteriores aos `Tela-*`. |

Linhas (títulos) do canvas hoje: "Briefing para o próximo chat · RH versão objetiva" · "Entrada e configuração" · "Fábrica · tablet do operador" · "RH e gestão · versão objetiva · PC, tablet e celular" · "Entrada · PC, tablet e celular" · "Fábrica · PC, tablet e celular" · "Histórico do setor · PC, tablet e celular".

---

## 9. Glossário e vocabulário obrigatório

| Termo | Uso |
|---|---|
| AquaPulse | Nome do produto (logo). O canvas se chama "TP Sistema — Redesign UX". |
| Setor | Injetora, Montagem, Teste & Embalagem (três). No painel do RH a linha tem **quatro etapas**: Injetora → Montagem → Teste → Embalagem. |
| Injetora | Nunca "Ejetora". |
| Placa boa / placas boas | Unidade contada na Injetora. |
| Cabeça vazia / vazios | Ciclo sem placa na Injetora (âmbar). |
| Perda | Injetora: cabeçote ou caninho, meio ou total. Vermelho. |
| Ciclo | Contador da Injetora; ciclos totais, vazios, perdidos. |
| Lote | Série da Injetora numa medida; tamanho travado. |
| Montadas | Unidade da Montagem. |
| Mesa | Posto da Montagem (6 mesas: Mesa 1 a Mesa 6). |
| Operadora | Pessoa da Montagem (Helena, Maiara, Maria, Daniel nos exemplos). "Sem mesa" é estado de alerta. |
| Testadas / aprovadas / reprovadas | Unidades do Teste. Defeitos: caninho, cabeçote. |
| Embaladas / pacotes | Unidades da Embalagem. Pacote = 10 placas (padrão). |
| Medida | "3 m · 1,5 m²" sempre nesse formato (comprimento · área). Medidas 2, 3, 4, 5 m. |
| OS / OP | Briefing: "Ordem de serviço" (OS-00015). Quadros finais: "Ordem de produção" (OP-00015). |
| Estados de etapa | "Rodando" · "Pausado" · "Sem produção hoje". |
| Origem | Tablet do setor ou "Lançado pela Administração". |
| Registro | Um dia × um setor (célula da matriz). |
| Últimos registros | Lista de toques com horário e Desfazer no último. |
| Fechar lote / Fechar dia | Ações perigosas, com resumo e "segure para confirmar". |
| Agora / Desempenho / Pedidos e estoque / (Pausas) | Telas do RH. |
| Metas / Exportar | Painéis que abrem por cima. |
| `[ ]` | Dado desconhecido; não inventar. |

Regras de redação: português do Brasil; título de tela até 3 palavras; rótulo até 2; nota até 4; alerta até 8 palavras; número com unidade e referência ("76 / 270"); sem emoji; ícone sempre com rótulo.

---

## 10. Entidades e campos citados nos textos

| Entidade | Campos implícitos |
|---|---|
| Setor | id (injetora, montagem, teste-embalagem), nome, cor, o que conta para a meta, minutos até avisar parada |
| Medida | comprimento (2, 3, 4, 5 m), área por placa (1 / 1,5 / 2 / 2,5 m²), rótulo |
| Dia de produção (registro dia × setor) | data, setor, início, término, duração, estado (aberto/fechado), origem, fechado por, totais, medidas |
| Lote (Injetora) | dia, medida travada, início, fim, boas, vazios, perdas, ciclos |
| Evento/toque | setor, tipo (+1 boa, cabeça vazia, perda, montada, testada aprovada/reprovada, pacote finalizado), horário, medida, mesa, operadora, origem (tablet/admin/ESP32), desfeito em/por |
| Perda (Injetora) | parte (cabeçote/caninho), extensão (meio/total), ciclos perdidos |
| Defeito (Teste) | tipo (caninho/cabeçote) |
| Mesa | número (1 a 6), operadora atual, medida, estado, botão ESP32 |
| Operadora | nome, mesa(s), placas do dia e do mês |
| Pacote | medida, placas (10 por padrão), finalizado em, OS/OP atendida |
| Estoque por medida | disponível, reservado, mínimo, situação |
| Movimentação de estoque | tipo (Entrada, Reserva, Expedição, Ajuste), quando, detalhe, medida, quantidade com sinal, quem, motivo |
| Ordem (OS/OP) | número, cliente (pode ser "Sem cliente"), medida, pacotes pedidos, pacotes atendidos, entrega, estado, criada em, reservada em, expedida em |
| Meta | setor, meta por dia, meta por tamanho (opcional), dias úteis do mês, alterada por/em |
| Pausa / parada | setor, início, fim, motivo, planejada ou não, classificada por (família `rh2-pausas`) |
| Alerta | tipo (setor parado, dia fechado com zero, tablet sem registro, placas sem mesa, mesa sem operadora, botão sem sinal), setor, desde |
| Correção de registro | registro, quem, quando, antes/depois, motivo |
| Relatório / exportação | tipo, período, medida, setores, seções, formato (PDF, Excel, CSV), envio mensal por e-mail |
| Tablet | ID, setor vinculado, último registro (família `config-tablet` / `admin-tablets`) |
| Dispositivo ESP32 | token, porta, mesa, último heartbeat, pulsos |
| Usuário / papel | operador, RH, Administração |

Eventos que os textos mandam gravar: cada toque de produção com horário; desfazer; abertura e fechamento de lote; abertura e fechamento de dia; lançamento da Administração (com início e fim); correção de registro; alteração de meta; movimentação de estoque; criação, reserva, atendimento e expedição de ordem; pausa e retomada.

---

## 11. Larguras: regras gerais e tabela parâmetro × largura

### 11.1 Mecanismo do protótipo

- **Documentos desta família**: página fluida de largura única (quadro de 1280), coluna central com `max-width: 1120px`, grades `repeat(auto-fit, minmax(min(440px,100%),1fr))` e `minmax(min(300px,100%),1fr)`, tabelas com `overflow-x:auto` e `min-width` de 820/860 px. Não têm variantes por largura.
- **Telas `RH2-*`** (conferido por busca): um componente por tela, copiado em um arquivo por largura. O arranjo troca por **media query** (`max-width:1199px` e `max-width:767px`, iguais às faixas do briefing). A prop `largura` (`pc` | `tablet` | `celular`) só escolhe o sufixo dos links (`''`, `-Tablet`, `-Celular`) para a navegação ficar na mesma largura. Props extras abrem estados: `foco` (`inj`/`mon`/`tes`), `painel`, `previa`, `os`, `motivos`, `classificar`, `estado` ("Dia em andamento" | "Sem produção hoje").
- **Telas `Tela-*`** (conferido por busca): mesmo esquema, com media queries em `max-width:1279px`, `959px`, `719px` e `379px`; prop `largura` (`pc` | `h` | `v` | `cel`) escolhe os sufixos `-PC`, `-TabletH`, `-TabletV`, `-Celular`; prop `estado` (`''`, `lote`, `pausa`, `vinculado`) abre o estado do quadro.
- Para o produto real: um componente responsivo por tela, com CSS (media/container query), sem arquivo por largura.

### 11.2 Telas de RH (regra do briefing, parte 2, seção 7)

| Parâmetro | PC | Tablet | Celular |
|---|---|---|---|
| Quadro de referência | 1440 de largura | 820 de largura, em pé | 390 de largura |
| Faixa de largura | 1200 px ou mais | 768 a 1199 px | até 767 px |
| Navegação | Barra no topo: logo, 3 abas, Metas, Exportar, relógio | Barra no topo compacta: ícone e rótulo em cada aba | Barra fixa embaixo com 3 ícones rotulados. No topo só logo e relógio; Metas e Exportar num menu |
| Colunas | Blocos lado a lado, até 4 por linha | 2 colunas | 1 coluna |
| Números do topo | 4 em linha | 4 em linha ou 2 × 2 | 2 × 2 |
| Filtros | À vista, em segmentos | À vista, numa linha que rola na horizontal | Botão "Filtros" abre folha de baixo. Filtro ativo vira chip |
| Detalhe | Painel lateral à direita | Painel lateral ou folha de baixo | Tela cheia, com voltar |
| Painel Metas | Painel lateral de 480 px | Painel lateral de 480 px | Tela cheia, "Salvar" fixo embaixo |
| Painel Exportar | Painel largo: formulário à esquerda, prévia à direita | Formulário e prévia abaixo | Formulário em tela cheia e botão "Ver prévia" |
| Tabelas | Tabela completa | Colunas principais; o resto no detalhe | Lista de cards. A página nunca rola na horizontal |
| Gráficos | Lado a lado | Largura total, empilhados | Largura total, 180 px de altura no mínimo, menos rótulos |
| Alvo de toque | 40 px | 44 px | 48 px |
| Número de destaque | 56 a 72 px | 56 a 72 px | 56 a 72 px (o briefing não reduz por largura) |
| Número de topo | 32 a 40 px | 32 a 40 px | 32 a 40 px |
| Número de apoio | 20 a 26 px | 20 a 26 px | 20 a 26 px |
| Texto mínimo | 14 px | 14 px | 14 px |
| Primeira dobra | Responde à pergunta sem rolar (1440 × 900) | Não definido | Ordem: alertas, destaque, números, gráficos, listas |
| Rolagem | Vertical da página | Vertical da página | Vertical; nunca horizontal na página (só chips de alerta e linha de filtros rolam de lado) |
| Agora · linha de produção | 4 etapas lado a lado | Grade 2 × 2 com setas | Lista vertical ligada por linha, anel pequeno |
| Agora · painéis de setor | 3 em linha | Um por vez, seletor de 3 opções | Tocar na etapa abre o setor em tela cheia |
| Agora · alertas | Faixa no topo, até 3 | Faixa no topo | Chips que rolam de lado |
| Desempenho · metas do mês | 3 barras na primeira dobra | Um card com 3 barras empilhadas | (segue a ordem geral) |
| Desempenho · gráficos por dia | Dois terços, composição ao lado | Largura total | Largura total |
| Desempenho · composição | Ao lado dos gráficos | 2 colunas | Abas: Medidas, Operadoras, Setores |
| Desempenho · matriz | Largura total; registro em painel lateral | Cabe inteira (5 dias) | Lista de dias, 3 células por dia; registro em tela cheia |
| Pedidos · estoque por medida | À esquerda, um terço (com pacotes por dia) | 4 colunas de nível em linha no topo | 4 barras horizontais, uma por medida |
| Pedidos · ordens | À direita, dois terços, colunas por estado | Abas com contagem | Abas e cards |
| Pedidos · botão principal | "+ Nova OS" no cabeçalho | "+ Nova OS" no cabeçalho | Botão flutuante |
| Pedidos · detalhe da ordem | Painel lateral | (painel lateral ou folha) | Tela cheia |

Alturas reais dos quadros `RH2-*` no canvas (todas rolam na vertical): Agora 1440×1380 / 820×1270 / 390×880; Desempenho 1440×2100 / 820×3150 / 390×3190; Pedidos 1440×1220 / 820×2150 / 390×2440; Pausas 1440×1500 / 820×2320 / 390×2700; Painel Metas 1440×1200 / 390×1230; Painel Exportar 1440×1320 / 390×1370. Quadros de detalhe: 1440×900 (PC), 820×1180 a 1460 (tablet), 390×844 (celular).

### 11.3 Telas do operador e de entrada (o que esta família fixa + tamanhos do canvas)

Esta família só fixa o princípio 01 ("cabe em 1280×800, com o tablet deitado, sem rolar") e os mínimos de texto e contraste. Os demais parâmetros estão nos mapas de cada tela (`injetora.md`, `montagem.md`, `teste.md` etc.). O índice do canvas mostra:

| Parâmetro | PC 1440×900 | Tablet horizontal 1280×800 | Tablet vertical 800×1280 | Celular 390 |
|---|---|---|---|---|
| Papel | Uso eventual (gestão, admin) | **Aparelho do operador; caso de projeto** | Tablet em pé | Consulta e emergência |
| Altura do quadro | 900 (uma dobra) | 800 (uma dobra) | 1280 (uma dobra) | Maior que a tela: 844 a 2450 |
| Rolagem | Sem rolar (exceto Admin · tablets, 1048) | Sem rolar (exceto Admin · tablets, 860) | Sem rolar | Rola na vertical |
| Regra de botões | Maior botão = ação mais frequente | Idem; perigosas menores e afastadas | Idem | Idem |
| Texto mínimo / contraste | 14 px / 4,5:1 | 14 px / 4,5:1 | 14 px / 4,5:1 | 14 px / 4,5:1 |
| Números | Grandes, Barlow Semi Condensed | Idem | Idem | Idem |
| Estados com quadro próprio | — | Fechar lote/pacote, aviso de parada, tablet vinculado, operadoras aberto | Os mesmos | — |
| Breakpoints do protótipo | acima de 1279 | até 1279 | até 959 | até 719 (ajuste extra até 379) |

Alturas dos quadros de celular por tela: Entrar 844 · Escolher área 1180 · Configurar tablet 1000 · Admin · tablets 1480 · Setores 1620 · Injetora 1920 · Montagem 1760 · Mesas 2080 · Teste 2000 · Hist. Injetora 2240 · Hist. Montagem 1700 · Hist. Teste 2450.

---

## 12. Ações

Os cinco documentos não têm ação nenhuma (sem botões, sem estado). As ações abaixo são as que os textos **descrevem** para o produto:

- Operador: "+1 placa boa"; "Cabeça vazia"; "Perda" (cabeçote ou caninho, meio ou total); "+1" manual na mesa e correção; "Pacote finalizado"; "Desfazer" no último registro; "Fechar lote" e "Fechar dia" (resumo + segurar; zero pede segunda confirmação); trocar tamanho fecha o lote.
- RH · Agora: filtro Medida (Todas, 2, 3, 4, 5 m); tocar numa etapa foca o setor; tocar no anel abre o painel Metas.
- RH · Desempenho: filtros Período (Hoje, 7 dias, Mês, Trimestre, Ano), Medida, Setor, "Mais filtros" (Operadora, Origem); tocar num dia do gráfico mostra placas, m² e variação; tocar na barra de meta abre o painel Metas; tocar numa célula abre o registro; "Corrigir este registro".
- RH · Pedidos e estoque: busca "OS ou cliente"; "+ Nova OS"; menu com "Definir mínimos" e "Ajustar estoque"; abrir ordem; "Editar"; "Registrar expedição"; "ver todas" as movimentações.
- Painel Metas: menos/mais na meta por dia; dias úteis; abrir "Meta por tamanho"; "Desfazer mudanças"; "Salvar metas".
- Painel Exportar: escolher tipo (5), período, medida, setores, seções (6), formato (PDF, Excel, CSV); "Enviar todo dia 1º por e-mail para o RH"; "Ver prévia" (celular).
- Navegação: abas Agora / Desempenho / Pedidos e estoque (e Pausas nos quadros finais); botões "Metas" e "Exportar"; logo leva ao Hub ("Escolher área").

---

## 13. Fase futura, desabilitado, `[ ]` e placeholders

- **Fase 3 · Depois**: botões ESP32 da Montagem (mapa botão → porta → mesa, alertas de botão, documentação de firmware, `esp32-pulse`, `esp32-heartbeat`, token).
- `Reservado [ ]` e `Expedido no mês [ ]` nos números do topo de Pedidos e estoque.
- `Criada [data]` na linha do tempo da OS-00015; "Expedição ainda não registrada".
- Estoque de 2 m, 4 m e 5 m: "sem dados" (coluna vazia tracejada). 5 m com produção 0 no mês.
- OS-00015 "Sem cliente".
- "Meta por tamanho": seção opcional, fechada por padrão.
- "Enviar todo dia 1º por e-mail para o RH": opção citada, sem detalhe de destinatários ou serviço.
- Excel e CSV como formatos secundários (PDF é o principal).
- Tablet deitado do RH (1180 px): citado como alternativa, sem quadro.
- Painéis Metas e Exportar no tablet: sem quadro (só PC e celular).
- Períodos "Trimestre" e "Ano": citados como filtro, sem dados de exemplo (só há 5 dias de novembro).
- Fechar dia automático às 18:00: é pergunta, não decisão.

---

## 14. Dúvidas reais (o que os documentos não decidem)

1. **OS ou OP?** O briefing fala em "Ordem de serviço / OS-00015"; os quadros finais usam "Ordem de produção / OP-00015". Qual nome vai para o banco e para a interface?
2. **Pacote fixo ou variável?** Briefing: 1 pacote = 10 placas. Quadros finais: 10 por padrão e o operador ajusta. Se variável, estoque e OS contam pacotes ou placas?
3. **Tela Pausas** não existe no briefing. Quais regras valem para ela (motivos, pausa planejada, minutos por setor)? Fonte: família `rh2-pausas`.
4. **"Área hoje"** soma os três setores (513,5 m² = 114 + 219,5 + 180). É a intenção, ou deveria ser a área de um ponto só da linha?
5. **"Placas 4.640"** soma os três setores (a mesma placa conta até três vezes), enquanto "produção por dia" usa montadas + embaladas (3.136). Qual é a definição oficial de "placas do período"?
6. **Perdas 262 × 222**: o total de perdas (262) não bate com a soma por medida (222). Os 40 são os defeitos do teste? A taxa de 5,34% mistura perdas da Injetora e do Teste?
7. **Área do Teste & Embalagem no mês**: 1.440 placas com 2.504 m² (1,74 m²/placa) não segue a mesma proporção dos outros setores. Conta testadas ou embaladas?
8. **Dia de hoje na projeção**: 21 dias úteis, 5 produzidos, 15 restantes; o dia 10/11 não entra em "faz por dia" nem em "restantes". "Restantes" inclui hoje?
9. **Dias úteis**: digitados pelo RH todo mês ou vindos de calendário com feriados? "Faz por dia" divide por dias com produção ou por dias úteis decorridos?
10. **Meta do Teste & Embalagem** conta embaladas. A etapa "Teste" da linha mostra aprovação no lugar da meta. Existe meta de testadas?
11. **Meta por tamanho**: como convive com a meta por setor (soma, substitui, só informa)?
12. **Quem corrige registro fechado** e o que fica gravado (pergunta 6 do diagnóstico). Há papel "Administração" separado de "RH"?
13. **Fechar dia automático** (por exemplo às 18:00)? O que acontece com dia que ninguém fechou?
14. **Placa boa da Injetora**: contada pelo operador ou pelo contador de ciclos da máquina? Regra dos ciclos (placa = 2 ciclos; perda meio = 1, total = 2?) precisa de confirmação.
15. **Medidas**: 3 m = 1,5 m² e 5 m = 2,5 m² sempre? A lista de medidas é fixa ou cadastrável?
16. **Metas iguais** nos três setores (270/dia) são intencionais?
17. **Minutos até alerta**: "tablet sem registro há X minutos" não tem valor aqui; os quadros finais usam 10 e 15 min. Valor do Teste & Embalagem e quem altera?
18. **Estoque reservado e expedido**: sem dados de exemplo. Reserva acontece na criação da ordem ou manualmente? Expedição parcial existe?
19. **Estoque inicial**: 384 pacotes de 3 m não vêm da produção do mês (144 pacotes). Haverá carga inicial por "Ajuste"?
20. **Exportar**: Excel é .xlsx de verdade? O envio mensal por e-mail entra na primeira entrega? Para quais endereços?
21. **Tablet do RH**: em pé (820) ou deitado (1180)? O briefing escolheu em pé "para o trabalho não parar".
22. **Larguras intermediárias** (por exemplo 1024, 1180, 600): o briefing manda declarar "o que não foi verificado"; não há quadro para elas.
23. **Tamanhos de número por largura**: o briefing dá uma faixa única (56–72 / 32–40 / 20–26 px) sem dizer qual valor em cada largura.
24. **Alertas**: limite de 3 à vista; e quando houver mais? Quem dispensa um alerta?
25. **Tabela de paridade** com as sete telas antigas não está no protótipo e as telas antigas foram removidas. Vale conferir a paridade ou os quadros `RH2-*` são a especificação final?
26. **Tempo real**: "atualizado 09:49:57" com ponto ao vivo. Qual o intervalo de atualização (polling, push)?
27. **Diagnóstico Fase 0** descreve defeitos do site antigo. No sistema novo (do zero) vira requisito de modelagem; existe migração dos dados antigos (dias "Lançados pela Administração" sem horário)?
