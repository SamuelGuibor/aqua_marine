# Mapa do protótipo · Fábrica · setores (cartões dos 3 setores)

Chave da família: `setores`

Quadros lidos:

| Quadro | Tamanho no canvas | Título no canvas |
|---|---|---|
| `Tela-Setores-PC` | 1440 × 900 (expand: fill) | Fábrica · setores · PC |
| `Tela-Setores-TabletH` | 1280 × 800 | Fábrica · setores · tablet horizontal |
| `Tela-Setores-TabletV` | 800 × 1280 | Fábrica · setores · tablet vertical |
| `Tela-Setores-Celular` | 390 × 1620 | Fábrica · setores · celular |
| `Setores` (versão anterior) | 1280 × 800 fixo | Fábrica · setores |

Os quatro quadros `Tela-Setores-*` são **byte a byte o mesmo componente**: o `diff` só acusa o `<title>` e o `data-props`
(`largura` = `pc` / `h` / `v` / `cel` e o tamanho de pré-visualização). Não há quadro de estado alternativo (sem "-Pausa", "-Vazio" etc.):
o único quadro já mostra, ao mesmo tempo, um setor normal, um setor com meta batida, um setor parado sem motivo e um setor pausado.

Nenhum texto dos arquivos parece instrução para o leitor; os comentários do script só descrevem a regra de parada.

---

## 1. Propósito e quem usa

Tela "**Escolha o setor**" (rótulo de cima `FÁBRICA`). É a porta de entrada da área Fábrica: mostra um cartão por setor
(Injetora, Montagem, Teste & Embalagem) com a produção do dia contra a meta e leva para a tela de operação do setor escolhido.

- Chega-se nela pelo cartão "Fábrica · Operação no tablet de cada setor" da tela `Tela-Area` ("Para onde você vai?").
- Quem usa: quem está num aparelho **ainda não ligado a um setor** (a `Tela-Area` tem o rodapé "Este aparelho ainda não está ligado a um setor"
  e o link "Configurar este tablet") e quem entra pelo PC/celular (supervisor, RH, admin) para olhar ou abrir um setor.
  O protótipo não diz se um tablet já vinculado pula esta tela (ver Dúvidas).
- É uma tela **só de leitura + navegação**: não tem formulário, botão de ação, modal nem estado interno. Não grava nada.

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.sr-head`)
- Esquerda: botão quadrado de voltar (seta `‹`, `aria-label="Voltar para o início"`) → `Tela-Area`.
  Ao lado, legenda `FÁBRICA` (14 px, caixa alta, espaçada) e título `<h1>` **"Escolha o setor"**.
- Direita: data e hora corrente no formato **"Terça, 03/11 · 15:36"** (dia da semana, dd/mm, hh:mm) e o logotipo AquaPulse 52 × 52 (some no celular).
- Não tem nome do usuário, "Sair", indicador de conexão nem menu.

### 2.2 Faixa amarela "setores parados agora" (`.sr-av`, condicional)
Só aparece se houver pelo menos um setor parado (`temParados`). `role="status"`, `aria-label="Setores parados agora"`.
- Ícone de alerta (triângulo) em quadrado âmbar 44 × 44.
- Título: **"1 setor parado agora"** ou **"N setores parados agora"** (plural a partir de 2).
- Lista de chips, um por setor parado; cada chip é um **link para a tela do setor** e mostra:
  - quadradinho na cor do setor;
  - nome do setor (negrito 17 px);
  - motivo (15 px, amarelo claro): para parada sem motivo, o texto fixo **"Sem motivo · o tablet está pedindo"**;
    para pausa do operador, **"Categoria › Motivo"** (exemplo: "Manutenção › Compressor / ar");
  - duração à direita (22 px, negrito): "12 min", "5 min".
  - Borda do chip: âmbar vivo `#F59E0B` quando é "sem motivo"; âmbar escuro `#7A5A12` quando é pausa informada.

### 2.3 Grade de cartões (`.sr-grid`), um cartão por setor, nesta ordem fixa
1. **Injetora** · "Produção de placas" · cor `#60A5FA` (azul)
2. **Montagem** · "Placas montadas nas mesas" · cor `#2DD4BF` (verde-água)
3. **Teste & Embalagem** · "Teste de pressão e pacotes" · cor `#C4B5FD` (lilás)

O **cartão inteiro é um link** (`<a>`) para a tela do setor; o "botão" azul no pé é só um `<span>` visual dentro do link.
Cada cartão tem borda de cima de 6 px na cor do setor e contém:

| Parte | Conteúdo | Exemplo (Injetora / Montagem / Teste) |
|---|---|---|
| Nome | nome do setor, 40 px | Injetora / Montagem / Teste & Embalagem |
| Descrição | uma linha, 17 px | Produção de placas / Placas montadas nas mesas / Teste de pressão e pacotes |
| Status de parada (só se parado) | pílula + linha de apoio (ver 4.3) | "Parada · sem motivo · 12 min" / — / "Pausado · Manutenção › Compressor / ar · 5 min" |
| Anel de % | anel cônico na cor do setor, "NN%" + "da meta" no centro | 89% / 143% (anel cheio) / 0% |
| Número do dia | legenda "{unidade} hoje", número grande, linha de meta | "Placas boas hoje" 240 "de 270 placas" / "Placas montadas hoje" 387 "de 270 · meta batida" / "Placas embaladas hoje" 0 "Sem produção hoje" |
| Mini 1 | "Faltam" N, ou "Acima" +N em verde `#86EFAC` | Faltam 30 / Acima +117 / Faltam 270 |
| Mini 2 | "Ritmo" N/h | 29/h / 45/h / — |
| Mini 3 | "Bate a meta" hh:mm, "batida" ou "—" | 16:38 / batida / — |
| Botão | **"Abrir {nome do setor}"** + seta → | Abrir Injetora / Abrir Montagem / Abrir Teste & Embalagem |

Não há rodapé.

## 3. Ações

| Elemento | O que faz |
|---|---|
| Botão voltar `‹` (cabeçalho) | Navega para `Tela-Area` (escolha de área). |
| Chip de setor parado (faixa amarela) | Navega para a tela de operação daquele setor (mesmo destino do cartão). Não abre o aviso de pausa diretamente; é só o link da tela. |
| Cartão do setor / "Abrir {setor}" | Navega para a tela de operação: `Tela-Injetora`, `Tela-Montagem` ou `Tela-Teste` (Teste & Embalagem), na mesma largura. |

Não existem: confirmação, desfazer, validação, campo de texto, filtro, troca de data ou atualização manual.
O script só tem `renderVals()` (sem `state`, sem handlers). Único efeito de interação: `:hover` clareia o fundo do cartão/chip e
`:focus-visible` desenha contorno de 3 px `#BFDBFE`.

## 4. Estados

### 4.1 Setor em produção (normal)
Cartão cinza-azulado `#111824`, borda `#26334A`, sem pílula de status. Mostra anel, número, "Faltam", "Ritmo", previsão hh:mm.
A versão nova **não mostra** indicação positiva de "em produção" (a versão antiga previa, ver seção 9/divergências).

### 4.2 Meta batida
`valor ≥ meta`: linha de meta "de 270 · meta batida"; mini 1 vira **"Acima"** com "+N" em verde; "Bate a meta" = **"batida"**;
o texto do anel passa de 100% (143%) mas o preenchimento do anel trava em 100%.

### 4.3 Setor parado (duas variantes, vindas do mesmo registro de pausas do tablet)
O cartão ganha a classe `parado`: fundo `#17130B`, borda `#7A5A12` (a borda de cima continua na cor do setor), e aparecem
uma pílula e uma linha de apoio abaixo da descrição. O setor também entra na faixa amarela do topo.

| Variante | Quando | Pílula no cartão | Linha de apoio | Visual da pílula |
|---|---|---|---|---|
| `sem` (parada sem motivo) | O tablet do setor avisou que o setor parou de contar e ninguém respondeu ainda | **"Parada · sem motivo · 12 min"** | "nada registrado desde 15:24 · o tablet está pedindo o motivo" | âmbar cheio: fundo e borda `#F59E0B`, texto `#2A1A00` (mais gritante) |
| `pausa` (pausa informada) | O operador apertou Pausar e escolheu categoria/motivo | **"Pausado · Manutenção › Compressor / ar · 5 min"** | "desde 15:31 · o operador pausou" | âmbar escuro: fundo `#2A1F07`, borda `#B7791F`, texto `#FCD34D` |

Os números de produção continuam visíveis no cartão parado.

### 4.4 Sem produção hoje
`valor = 0`: número "0", linha de meta **"Sem produção hoje"**, anel 0%, "Faltam 270", "Ritmo —", "Bate a meta —".
(No exemplo coincide com o setor pausado, mas são coisas independentes.)

### 4.5 Nenhum setor parado
A faixa amarela inteira some (`sc-if temParados`), e a grade sobe para logo abaixo do cabeçalho.

### 4.6 Estados que o protótipo NÃO desenha
Carregando, erro de leitura, sem conexão/offline, dado desatualizado ("atualizado há X"), setor desativado, usuário sem permissão
para um setor, fábrica fora do expediente. A prop `estado` existe no `data-props` mas o script não a usa.

## 5. Regras de negócio e contas

| Regra | Conta / valor de exemplo | Configurável? |
|---|---|---|
| Meta diária por setor | **270** placas, igual nos 3 setores, escrita direto no código (inclusive no `aria-label` "da meta de 270") | Sim, na prática: `RH2-Painel-Metas` tem meta por dia por setor (`pmMeta {inj, mon, tes}` = 270, passo de 10, mínimo 10). Esta tela precisa ler a meta do setor, não uma constante. |
| % da meta | `round(valor / meta × 100)`; texto pode passar de 100% | derivado |
| Preenchimento do anel | `min(100, %)` em `conic-gradient(cor do setor X%, #1C2738 0)` | derivado |
| Falta / acima | `falta = meta − valor`; se `> 0`: rótulo "Faltam" e valor `falta`; senão rótulo "Acima", valor `+(valor − meta)`, cor verde `#86EFAC`. Com valor exatamente igual à meta mostra "Acima +0" | derivado |
| Linha de meta | texto pronto no exemplo: "de 270 placas" (abaixo da meta), "de 270 · meta batida" (≥ meta), "Sem produção hoje" (valor 0) | derivado |
| Ritmo | placas por hora, inteiro + "/h"; "—" sem produção. Nas telas de setor: `valor do dia ÷ horas decorridas` (Injetora 240 ÷ 8h14 = 29/h) | derivado; a base de horas não está definida (ver Dúvidas) |
| "Bate a meta" | `agora + falta ÷ ritmo` → hh:mm (15:36 + 30 ÷ 29/h ≈ 62 min = **16:38**); "batida" se já bateu; "—" sem ritmo | derivado |
| Unidade contada por setor | Injetora = "Placas boas" (perdas não contam); Montagem = "Placas montadas"; Teste & Embalagem = "Placas embaladas" (não as testadas) | fixo por setor |
| Parada sem motivo | o tablet do setor avisa depois de X min sem contar e sem estar pausado. X nas telas de setor: **Injetora 10 min, Montagem 15 min, Teste & Embalagem 15 min** | parece configurável por setor (constante `SET` nas telas de setor) |
| Duração da parada | sem motivo: conta desde o **último registro** (15:24 → 12 min às 15:36), não desde o aviso; pausa: conta desde o início da pausa (15:31 → 5 min) | derivado |
| Texto do motivo | pausa: "Categoria › Motivo" do catálogo de pausas; sem motivo: texto fixo | catálogo configurável no RH (`RH2-Pausas-Motivos`) |
| Contagem da faixa | "1 setor parado agora" / "N setores parados agora"; ordem dos chips = ordem dos setores | derivado |
| Ordem e cores dos setores | Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD` | fixo (identidade visual usada no sistema todo) |

Nada nesta tela soma em outro lugar: ela só lê.

## 6. Entidades e dados implícitos

Para a tela funcionar de verdade é preciso uma consulta "resumo do dia por setor" que devolva, por setor:

- **Setor**: id/chave (`inj`, `mon`, `tes`), nome, descrição curta, cor, ordem, unidade exibida, rota da tela de operação,
  minutos até avisar parada (10 / 15 / 15).
- **Meta**: meta diária do setor vigente hoje (270), com origem na tela de metas do RH.
- **Produção do dia** (agregado de eventos de produção de cada setor):
  Injetora = placas boas registradas hoje; Montagem = placas montadas hoje (soma das mesas);
  Teste & Embalagem = placas embaladas hoje (pacotes fechados × placas, ou contagem direta).
  Precisa também de `hora do primeiro registro` / horas trabalhadas para o ritmo e `hora do último registro` para a parada.
- **Pausa/Parada** (registro de pausas do tablet): setor, tipo (`sem motivo` automática ou `pausa` do operador), início,
  fim (nulo = em aberto), categoria, motivo, descrição, quem registrou. A tela usa só as pausas **em aberto agora**.
- **Catálogo de pausas**: categoria (ex.: Manutenção, Material) e motivo (ex.: Compressor / ar, Molde, Placas da Injetora).
- **Relógio do servidor / fuso**: data e hora mostradas no cabeçalho e base de "hoje" (America/Sao_Paulo).

Eventos gravados por esta tela: **nenhum**. Eventos que ela consome: contagem de produção de cada setor, abertura e fechamento
de pausa, aviso automático de parada. A parada "sem motivo" precisa existir como dado no servidor (ou ser calculada no servidor
a partir do último registro + limite do setor) para aparecer aqui num aparelho que não é o tablet do setor.

## 7. Navegação

| De | Para |
|---|---|
| `Tela-Area` → cartão "Fábrica" | esta tela |
| Voltar `‹` | `Tela-Area` (mesma largura) |
| Cartão / chip Injetora | `Tela-Injetora` |
| Cartão / chip Montagem | `Tela-Montagem` |
| Cartão / chip Teste & Embalagem | `Tela-Teste` |
| Telas de setor → voltar (`aria-label="Voltar para Setores"`) | esta tela |

No protótipo o sufixo do arquivo de destino vem da prop `largura` (`-PC`, `-TabletH`, `-TabletV`, `-Celular`); no sistema real é uma rota só.

## 8. Responsividade

### 8.1 Mecanismo
- **CSS puro com media queries de viewport** dentro do próprio componente (classes `sr-*`):
  - base (≥ 1280 px): PC 1440 e tablet horizontal 1280 usam **o mesmo arranjo**;
  - `@media (max-width:1279px)`: tablet em pé ("um setor por faixa, cada faixa é um alvo de toque inteiro");
  - `@media (max-width:719px)`: celular ("faixa vira cartão em coluna").
- A prop `largura` **não muda o layout**: só escolhe o sufixo dos links. A prop `estado` não é usada.
- A raiz usa `min-height:100vh` + coluna flex: em PC/tablet H a grade estica (`flex:1`) para ocupar a altura; não há altura fixa
  (a versão antiga era 1280 × 800 cravado). Se o conteúdo passar da altura, a **página inteira rola**; nada é fixo/sticky.

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440 × 900 | Tablet H 1280 × 800 | Tablet V 800 × 1280 | Celular 390 |
|---|---|---|---|---|
| Regra CSS ativa | base | base | `max-width:1279px` | `max-width:1279px` + `max-width:719px` |
| Cabeçalho: altura | mín. 88 px | mín. 88 px | mín. 88 px | sem mínimo; quebra em linhas (`flex-wrap`), padding 12 × 16 |
| Cabeçalho: padding lateral | 28 px | 28 px | 24 px | 16 px |
| Botão voltar | 52 × 52 | 52 × 52 | 52 × 52 | 48 × 48 |
| Legenda "FÁBRICA" | 14 px | 14 px | 14 px | 14 px |
| Título "Escolha o setor" | 32 px | 32 px | 32 px | 28 px |
| Data e hora | 30 px, à direita | 30 px, à direita | 30 px, à direita | 18 px; cai para a linha de baixo se não couber |
| Logotipo 52 × 52 | visível | visível | visível | **oculto** |
| Faixa de parados: padding | 12 × 28 | 12 × 28 | 12 × 24 | 12 × 16 |
| Faixa: ícone / título | 44 px / 26 px | 44 px / 26 px | 44 px / 26 px | 40 px / 22 px |
| Faixa: lista de chips | na mesma linha do título, lado a lado (quebra se faltar espaço) | idem | **linha própria abaixo do título** (`flex-basis:100%`), chips lado a lado | **empilhados em coluna**, cada chip 100% da largura |
| Chip: altura de toque | mín. 56 px | mín. 56 px | mín. 56 px | mín. 56 px, largura total |
| Chip: nome / motivo / tempo | 17 / 15 / 22 px | idem | idem | idem |
| Grade: colunas | **3 colunas** iguais | **3 colunas** iguais | **1 coluna**, 3 faixas de altura igual (`grid-auto-rows:1fr`) | **1 coluna**, altura automática |
| Grade: gap / padding | 20 / 28 | 20 / 28 | 16 / 20 24 24 | 12 / 12 |
| Cartão: arranjo interno | coluna: título, corpo (centralizado na sobra), botão no pé | idem | grade 2 × 2: linha 1 = título à esquerda + **botão 280 px à direita**; linha 2 = corpo de ponta a ponta | coluna: título, corpo, **botão no pé** |
| Cartão: padding / raio | 26 / 22 | 26 / 22 | 22 × 26 / 22 | 18 / 18 |
| Corpo: anel + número vs. minis | empilhados (herói em cima, 3 minis embaixo) | idem | **lado a lado**: herói à esquerda (auto), 3 minis à direita (1fr), gap 28 | empilhados, gap 14 |
| Nome do setor | 40 px | 40 px | 40 px | 30 px |
| Descrição | 17 px | 17 px | 17 px | 15 px |
| Pílula de status / apoio | 15 / 14 px | 15 / 14 px | 15 / 14 px | 14 / 14 px |
| Anel (externo / miolo) | 128 / 100 px | 128 / 100 px | 120 / 94 px | 96 / 74 px |
| % no anel / "da meta" | 32 / 14 px | 32 / 14 px | 30 / 14 px | 24 / 13 px |
| Número grande do dia | **88 px** | **88 px** | **88 px** | **60 px** |
| Legenda e linha de meta | 16 px | 16 px | 16 px | 14 px |
| Minis (3 em linha sempre) | rótulo 14, valor 26, padding 10 × 12 | idem | rótulo 14, valor 30, padding 12 × 16 | rótulo 13, valor 22, padding 10 |
| Botão "Abrir {setor}" | altura 60, texto 20, largura total do cartão | idem | altura **64**, texto 20, **280 px** no canto superior direito | altura 56, texto 18, largura total |
| Alvo de toque real | cartão inteiro | cartão inteiro | faixa inteira | cartão inteiro |
| Rolagem | cabe em 900; se passar, página rola | cabe em 800 no exemplo (2 parados); página rola se a faixa quebrar ou houver pílulas longas | grade `flex:1 0 auto`: cresce e pode passar de 1280, página rola | página longa (quadro de 1620 px), rolagem vertical normal |
| Fixo / sticky | nada | nada | nada | nada |
| Detalhe (painel/folha) | não existe nesta tela | não existe | não existe | não existe |
| Navegação | só o voltar do cabeçalho | idem | idem | idem (sem barra inferior nem menu) |

Observações de implementação:
- A quebra é em **1280** e **720**. Um tablet de 1024 ou 820 de largura cai no arranjo "faixas" do tablet em pé; um PC com janela < 1280 também.
- No tablet em pé o botão sobe para o topo direito do cartão, ao lado do nome, e a pílula de status fica na coluna do título (largura útil ~390 px), então a pílula de pausa quebra em 2 linhas.
- Os rótulos das minis têm reticências (`text-overflow:ellipsis`); os valores não.
- Tipografia: Barlow (texto) e Barlow Semi Condensed 700/800 (números e títulos), `font-variant-numeric: tabular-nums`. Fundo `#0A0E15`.

## 9. Fase futura, desabilitado, placeholder; divergências com a versão anterior

Nada nesta família está marcado como fase futura, desabilitado ou "[ ]". Pontos em aberto herdados:

- Prop `estado` declarada e sem uso (nenhum estado alternativo foi desenhado).
- Meta 270 cravada no texto e no `aria-label`.
- Data/hora, números e paradas são dados de exemplo fixos (15:36 de terça 03/11).

Divergências `Setores.dc.html` (anterior, só tablet 1280 × 800) × `Tela-Setores-*` (atual):

| Ponto | Versão anterior | Versão atual |
|---|---|---|
| Tamanho | 1280 × 800 fixo, estilos inline | fluida, 3 arranjos por media query |
| Voltar | `Hub.dc.html` | `Tela-Area` |
| Destinos | `Injetora`, `Montagem`, `Teste` (.dc.html antigos) | `Tela-Injetora`, `Tela-Montagem`, `Tela-Teste` |
| Status do setor | havia dado de status por setor ("● Em produção · 4 mesas" na Montagem, "■ Pausado desde 15:31" no Teste, vazio na Injetora), mas a pílula estava com `display:none` (placeholder nunca mostrado) | só mostra status quando **parado**, com motivo, duração e linha de apoio; não há pílula de "em produção" nem contagem de mesas |
| Faixa de parados no topo | não existia | existe |
| Parada sem motivo (aviso automático) | não existia | existe (Injetora, 12 min) |
| Cartão, anel, número, minis, botão | mesmas medidas e textos | iguais na largura base |

Regra que a versão antiga sugeria e a nova resumiu: mostrar "Em produção · N mesas" no cartão da Montagem.

## 10. Dúvidas reais para o card

1. **Quem cai nesta tela?** Tablet já vinculado a um setor abre direto a tela do setor e nunca vê esta? Operador comum pode abrir outro setor?
   RH/admin no PC, ao abrir um setor, pode operar (contar, pausar) ou só ver?
2. **Atualização dos números**: tempo real (push/SSE), polling a cada N segundos ou só ao abrir? O relógio do cabeçalho e os "min" da parada andam sozinhos?
3. **Meta**: usar a meta por setor definida em `RH2-Painel-Metas` (o texto "de 270" e o `aria-label` passam a ser dinâmicos)? E se a meta for por medida de placa?
4. **Ritmo**: horas desde o primeiro registro do dia, desde o início do turno, ou descontando pausas? Qual janela (dia inteiro ou última hora)?
5. **"Bate a meta"**: o que mostrar se a previsão passar do fim do expediente ou virar o dia? Mostrar com o setor parado?
6. **"Hoje"**: dia civil ou turno? Há mais de um turno? Quando zera?
7. **Parada sem motivo**: quem calcula (servidor ou tablet do setor)? Se o tablet do setor estiver offline, esta tela mostra o quê?
   O limite (10/15/15 min) é configurável por setor e onde?
8. **Setor que ainda não começou o dia** (0 placas, fora do horário): conta como parado? Aparece "Parada · sem motivo"?
9. **Indicador de "em produção"** (e "N mesas" na Montagem), que existia na versão antiga: entra ou fica fora?
10. **Estados não desenhados**: carregando, erro, offline/dado velho. Precisa de selo "sem conexão · dados das hh:mm" já que o app é offline-first?
11. **Chip de setor parado**: deve abrir a tela do setor já com o aviso de pausa/motivo aberto, ou só a tela?
12. **"Acima +0"** quando o valor é exatamente a meta: é o texto desejado? E o "%" acima de 100 no anel cheio, sem segunda volta, está ok?
13. **Teste & Embalagem**: o número do cartão é placas embaladas (pacotes fechados) ou testadas? Pacote aberto conta?
14. **Lista de setores fixa em 3** ou vinda de cadastro (ordem, cor, descrição, ativo/inativo)?
15. Com 3 setores parados e motivos longos a faixa quebra em mais linhas no tablet 1280 × 800 e a tela passa a rolar: é aceitável ou a faixa deve resumir?
