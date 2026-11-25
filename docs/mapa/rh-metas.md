# Mapa do protótipo · RH · Painel Metas (`rh-metas`)

Fontes lidas (protótipo = especificação; o sistema real ainda não existe):

- `RH2-Painel-Metas.dc.html` (PC, quadro 1440 × 1200) — lido por inteiro.
- `RH2-Painel-Metas-Celular.dc.html` (celular, quadro 390 × 1230) — `diff` com o de PC.
- `Briefing-RH-1..4` (texto do pedido que originou as telas RH2) — para regras que o quadro resume.
- `RH2-Agora`, `RH2-Desempenho`, `RH2-Pedidos`, `RH2-Pausas` — só para conferir de onde o painel abre e se o código do painel é o mesmo.
- `Tela-Injetora/Montagem/Teste/HistInjetora/Area-TabletH` — só para ver onde a meta salva aparece nos tablets.

Nenhum texto dos arquivos parecia instrução dirigida ao leitor; nada foi ignorado por esse motivo.

## 0. O que é esta "família" de verdade

- **Não é uma tela, é um painel** (`role="dialog"`, `aria-modal="true"`) que abre **por cima** de qualquer tela do RH. O briefing diz: "Editar metas e gerar relatório deixam de ser telas: viram painéis que abrem por cima de qualquer tela, porque são ações, não lugares de consulta".
- Os dois quadros são **o mesmo arquivo da tela `RH2-Agora`** com a prop `painel: "metas"` (painel já aberto). O `diff` entre `RH2-Painel-Metas` e `RH2-Agora` é só o `<title>`, a prop `painel` e a altura do quadro (1200 contra 1380).
- O `diff` entre PC e celular é só o `<title>`, a prop `largura` (`pc` → `celular`) e o `$preview` (1440 × 1200 → 390 × 1230). **Marcação, CSS e lógica são idênticos.**
- O bloco de marcação e a lógica do painel (`painelInicial` + `paineisVals`) são **byte a byte iguais** em `RH2-Agora`, `RH2-Desempenho`, `RH2-Pedidos` e `RH2-Pausas` (conferido com `diff`). O comentário do código diz "o mesmo código nas três telas (Agora, Desempenho, Pedidos e estoque)"; Pausas também tem. No sistema real: **um componente só**, montado no layout do RH.
- **Não existe quadro de tablet (820) para este painel.** O briefing pede "Painéis Metas e Exportar, em PC e celular" e define "PC e tablet: painel lateral de 480 px". O comportamento em 820 abaixo é deduzido do CSS.
- A tela atrás do painel (Agora) pertence à família `rh-agora`; aqui ela só é descrita no que toca o painel (gatilhos e leitura das metas).

## 1. Propósito e quem usa

- **Quem usa:** RH (perfil de gestão). Rodapé do painel: "Só o RH altera · vai para os tablets" (ícone de cadeado).
- **Para quê:** definir, para o mês corrente, (a) quantos **dias úteis** o mês tem e (b) a **meta por dia** de cada um dos 3 setores; ver na hora a **meta do mês**, o **andamento de hoje e do mês**, **quanto falta** e **quanto precisa fazer por dia** para bater.
- **Substitui** a tela antiga "RH · Metas" (não está na pasta do protótipo; só é citada no briefing). A parte "hoje" da tela antiga foi para os anéis da tela Agora; a parte "mês e ritmo" foi para as barras "Metas do mês" da tela Desempenho; a **edição** ficou neste painel.
- A meta salva é lida por: tela Agora (anéis, legenda "% da meta · 270 por dia", selo "meta 270"), tela Desempenho (barras "Metas do mês", "esperado", "projeção", linha "meta 540" do gráfico por dia, cor da matriz de registros), relatório do painel Exportar (coluna "Meta" de "Por setor e meta do mês") e **telas do operador nos tablets** (anel/barra "% da meta do dia", "Faltam N para a meta", "Bate a meta HH:MM", históricos "meta de 270", Área "PRODUÇÃO DE HOJE · META 270 POR SETOR").

## 2. Como o painel abre (gatilhos)

Todos chamam `abrirMetas` (`painel: 'metas'`, fecha o menu do celular).

| Onde | Elemento | Texto / rótulo | Em que largura aparece |
|---|---|---|---|
| Barra do topo (todas as telas RH2) | botão `.r2-act` com ícone de alvo | "Metas" | PC e tablet (some no celular) |
| Barra do topo, celular | botão "⋯" (`aria-label="Metas e Exportar"`) abre menu com 2 itens | "Metas" / "Exportar" | só celular |
| Agora · cabeçalho de "Produção hoje" | botão-legenda com mini anel (`title="Abrir metas"`) | "% da meta · 270 por dia" | todas |
| Agora · cabeçalho de cada painel de setor | selo `.r2-metab` (`aria-label="Meta de Injetora: 270 por dia. Abrir metas"`) | "meta 270" | todas (no celular só com o setor aberto em tela cheia) |
| Desempenho · card "Metas do mês" | cada uma das 3 barras é um botão (`aria-label` termina em "Abrir metas.") | — | todas |
| Pedidos e estoque, Pausas | só o botão "Metas" do topo / menu "⋯" | "Metas" | — |

Divergência: o briefing diz "Abre pelo anel (Agora)". No protótipo, tocar no card da etapa (onde está o anel) **abre o detalhe do setor** (`foco`), não o painel. Quem abre o painel na Agora são a legenda "% da meta · 270 por dia" e o selo "meta 270".

O painel **não muda a URL** (é estado local `painel`). O quadro "Painel Metas" é só a tela Agora com o painel já aberto.

## 3. Blocos do painel, de cima para baixo

### 3.1 Fundo
- Camada fixa `inset:0`, `z-index:70` (acima da barra de abas do celular, z 30, e do setor em tela cheia, z 40).
- Fundo escurecido `rgba(5,8,13,.66)`; é um `<button aria-label="Fechar metas">`: **tocar fora fecha**.

### 3.2 Cabeçalho do painel (fixo no topo do painel)
- Celular: botão "‹ Voltar" (fecha). PC/tablet: escondido.
- Título `<h2>` "Metas" com ícone de alvo (ícone some no celular).
- PC/tablet: botão "X" (`aria-label="Fechar metas"`). Celular: escondido.

### 3.3 Card "Dias úteis"
- Rótulo "**Dias úteis**"; abaixo "novembro · **15** restantes" (`{{pm.rest}}`; o mês está fixo em texto).
- Stepper (`role="group"`, `aria-label="Dias úteis em novembro"`): botão "−" (`aria-label="Menos um dia útil"`), valor "**21**" (`aria-live="polite"`), botão "+" (`aria-label="Mais um dia útil"`).

### 3.4 Um card por setor (3 cards, na ordem Injetora, Montagem, Teste & Embalagem)
Borda de cima de 4 px na cor do setor (Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`).

1. Linha de título: quadradinho da cor + nome do setor; à direita **o que conta**: "placas boas" (Injetora), "placas montadas" (Montagem), "placas embaladas" (Teste & Embalagem).
2. Linha de meta:
   - Esquerda: rótulo "POR DIA" + stepper "−  **270**  +" (`aria-label="Meta por dia de {setor}"`; botões "Diminuir meta por dia de {setor}" / "Aumentar meta por dia de {setor}").
   - Direita: rótulo "MÊS", número grande "**5.670**", abaixo a conta "270 × 21 dias".
3. Duas barras pequenas (grade `40px | barra | valor`):
   - "hoje" — barra na cor do setor — "**76** / 270" (Montagem "161 / 270", Teste "120 / 270").
   - "mês" — barra — "**1.504** / 5.670" (Montagem "1.696", Teste "1.440").
4. Caixa de ritmo: "faltam **4.166**" · "precisa **278** por dia" (Montagem 3.974 / 265; Teste 4.230 / 282).

### 3.5 "Meta por tamanho" (opcional, recolhida)
- Botão de abrir/fechar largura total: "Meta por tamanho" + "opcional" + chevron (`aria-expanded`).
- Aberto: 4 linhas, uma por medida, rótulo + campo numérico: "2 m · 1 m²", "3 m · 1,5 m²", "4 m · 2 m²", "5 m · 2,5 m²". Campo `type="number" min="0" step="10" placeholder="—"`, `aria-label="Meta por dia de {medida}"`.

### 3.6 Rodapé do painel (fixo embaixo do painel)
- Aviso com cadeado: "Só o RH altera · vai para os tablets".
- Depois de salvar: "✓ Metas salvas" (verde `#86EFAC`).
- Botão secundário "Desfazer" (desabilitado enquanto não houver mudança).
- Botão principal azul "Salvar metas".

## 4. Ações e o que a lógica faz

Estado do painel (em `painelInicial`): `pmMeta {inj, mon, tes}` (rascunho), `pmDias` (rascunho), `pmBase {inj, mon, tes, dias}` (último salvo), `pmTam` (seção aberta), `pmSalvo` (mostra "Metas salvas").

| Ação | Efeito no protótipo |
|---|---|
| "−" de Dias úteis | `pmDias = max(PASSADOS + 1, pmDias − 1)` → mínimo **7** (6 dias já passados + 1). Zera `pmSalvo`. |
| "+" de Dias úteis | `pmDias = min(31, pmDias + 1)` → máximo **31**. Zera `pmSalvo`. |
| "−" de POR DIA (setor) | meta do setor `= max(10, meta − 10)` → passo **10**, mínimo **10**. Zera `pmSalvo`. |
| "+" de POR DIA (setor) | meta do setor `+= 10`, **sem máximo**. Zera `pmSalvo`. |
| "Meta por tamanho" | abre/fecha a lista (`pmTam`). Não conta como mudança. |
| Digitar num campo de tamanho | **nada**: os campos não estão ligados ao estado, não entram em "mudou", não são desfeitos nem salvos. |
| "Desfazer" | volta `pmMeta` e `pmDias` para `pmBase` (último salvo) e zera `pmSalvo`. Desabilitado (`opacity .4`) quando rascunho = salvo. |
| "Salvar metas" | `pmBase = rascunho`, `pmSalvo = true` → aparece "Metas salvas" e "Desfazer" desabilita. **Sempre habilitado**, mesmo sem mudança. **O painel não fecha.** |
| "X", "Voltar", toque no fundo | `painel = null`. **O rascunho não é descartado** (reabrindo na mesma sessão, os valores não salvos continuam lá) e **não há confirmação**. |

Tudo recalcula na hora a cada toque: "MÊS", a conta "270 × 21 dias", as duas barras, "faltam", "precisa por dia" e "restantes".

Não existe no protótipo: digitar a meta direto (só ±10), tecla Esc, prisão de foco, estado de carregando/erro ao salvar, aviso de mudança não salva, seletor de mês.

**O salvar não propaga nada no protótipo:** a tela Agora usa a constante `META = 270` e os textos "270 por dia" / "meta 270" são fixos; a Desempenho usa `META_MES = 5670`, `META_DIA = 270`, `RESTAM = 15`. No sistema real, salvar tem de atualizar todas essas leituras e os tablets.

## 5. Estados

| Estado | Como aparece |
|---|---|
| Fechado | a tela de baixo normal. |
| Aberto, sem mudança | "Desfazer" desabilitado; sem "Metas salvas". |
| Aberto, com mudança | "Desfazer" habilitado; sem "Metas salvas". |
| Recém-salvo | "✓ Metas salvas" no rodapé; "Desfazer" desabilitado. Some ao mexer em qualquer stepper. |
| "Meta por tamanho" aberta | 4 campos visíveis; chevron para cima. |
| Meta já batida | barras travam em 100% (`min(100, …)`); "faltam 0"; "precisa 0 por dia". |
| Sem dias restantes | "precisa — por dia" (ramo `rest ? … : '—'`; inalcançável pelos steppers, pois o mínimo de dias é passados + 1). |
| Prop do quadro "Sem produção hoje" | só muda a tela de baixo. **O painel continua mostrando 76 / 161 / 120 em "hoje"** (constantes `HOJE`), o que é inconsistente. |
| Erro, carregando, sem conexão, sem permissão | **não desenhados**. |

## 6. Regras de negócio e contas

Valores de exemplo: terça 10/11/2026, 09:49.

| Regra | Conta | Exemplo | Configurável? |
|---|---|---|---|
| Meta por dia de cada setor | número inteiro, um por setor | 270 nos 3 setores | Sim: é o que o painel edita (passo 10, mínimo 10). |
| Dias úteis do mês | inteiro | 21 (novembro) | Sim: stepper de 1 em 1, de 7 a 31. |
| Meta do mês | `meta por dia × dias úteis` | 270 × 21 = 5.670 | Derivada. |
| Dias passados | constante `PASSADOS = 6` ("21 dias úteis − 15 restantes") | 6 | No real: calculado pelo calendário. |
| Dias restantes | `max(0, dias úteis − passados)`; **inclui hoje** | 15 | Derivado. |
| Feito no mês | produção acumulada do setor **até ontem** ("novembro até 09/11", 5 dias com produção) | 1.504 / 1.696 / 1.440 | Vem dos registros. |
| Hoje | produção do dia em andamento | 76 / 161 / 120 | Vem do tempo real. |
| Barra "hoje" | `min(100, hoje ÷ meta por dia)` | 28,1% / 59,6% / 44,4% | — |
| Barra "mês" | `min(100, feito ÷ meta do mês)` | 26,5% / 29,9% / 25,4% | — |
| Faltam | `max(0, meta do mês − feito)` | 4.166 / 3.974 / 4.230 | — |
| Precisa por dia | `ceil(faltam ÷ restantes)`; "—" se restantes = 0 | 278 / 265 / 282 | — |
| O que conta em cada setor | Injetora = **placas boas**; Montagem = **placas montadas**; Teste & Embalagem = **placas embaladas** (não as testadas) | — | Fixo. |
| Medidas | 2 m · 1 m², 3 m · 1,5 m², 4 m · 2 m², 5 m · 2,5 m² | — | Cadastro de medidas. |
| Meta por tamanho | por dia, por medida, passo 10, mínimo 0, vazio = sem meta | vazio | Opcional; não ligado. |
| Quem altera | "Só o RH altera" | — | Permissão por perfil. |
| Alcance | "vai para os tablets" (briefing: "aparece no tablet de cada setor") | — | — |

Observações de calendário: novembro/2026 tem 21 dias de segunda a sexta (02 a 30). Os 6 "passados" são 02, 03, 04, 05, 06 e 09; só 5 tiveram produção (02/11 é Finados). Ou seja, o 21 do protótipo **não desconta feriado**: o stepper existe para o RH acertar isso à mão. 20/11 também é feriado nacional.

Contas que dependem destas metas em outras telas (para o implementador não esquecer a ligação):
- Agora: anel `= min(100, round(feito hoje ÷ meta por dia))`; "/ 270" ao lado do número.
- Desempenho: `esperado até ontem 24%`; "faz 301/dia, precisa 278 · fecha em 6.016"; linha "meta 540" no gráfico por dia (= 2 × 270, montadas + embaladas); cor da célula da matriz "pela meta do dia".
- Exportar: seção "Por setor e meta do mês" com coluna "Meta" (27% / 30% / 25%).
- Tablets do operador: "% da meta do dia", "Faltam N para a meta" / "Meta batida", "Bate a meta HH:MM", históricos "+N acima da meta de 270" / "faltaram N para a meta de 270".

## 7. Entidades e eventos implícitos

**Meta do setor** (uma por setor e período de vigência)
- setor (injetora | montagem | teste_embalagem)
- meta_por_dia (inteiro ≥ 10, múltiplo de 10 no protótipo)
- vigência (mês/ano, ou "a partir de" — o protótipo não decide)
- alterado_por (usuário RH), alterado_em

**Calendário do mês**
- ano, mês
- dias_uteis (inteiro; 7 a 31 no protótipo)
- (derivado ou guardado) dias úteis já passados / restantes

**Meta por tamanho** (opcional)
- medida (2 | 3 | 4 | 5 m), meta_por_dia (inteiro ≥ 0, nulo = sem meta)
- setor? (o protótipo mostra um campo por medida, sem setor)

**Leituras que o painel precisa** (vêm de outras famílias)
- produção de hoje por setor: boas (Injetora), montadas (Montagem), embaladas (Teste & Embalagem)
- produção acumulada do mês por setor, até ontem
- medidas cadastradas (nome e m²)
- usuário e perfil (para "Só o RH altera")

**Eventos que o painel grava**
- meta alterada: setor, valor anterior, valor novo, quem, quando
- dias úteis do mês alterados: mês, anterior, novo, quem, quando
- meta por tamanho alterada (se entrar)
- efeito colateral: avisar/atualizar tablets e telas do RH (invalidar cache das leituras de meta; tablets offline pegam na próxima sincronização)

## 8. Navegação

- O painel não tem links próprios. "Voltar" / "X" / fundo → fecham e devolvem à tela de onde abriu (Agora, Desempenho, Pedidos e estoque ou Pausas).
- Barra do topo da tela de baixo: logo → `Hub.dc.html`; abas "Agora", "Desempenho", "Pedidos e estoque" (curto: "Pedidos"), "Pausas" → `RH2-{Tela}{sufixo}.dc.html`, com sufixo `""`, `-Tablet` ou `-Celular` conforme a prop `largura` (artifício do canvas; no real é a mesma rota).
- Botão "Exportar" ao lado de "Metas" abre o outro painel (família `rh-exportar`).

## 9. Responsividade

### 9.1 Mecanismo
- **Um componente responsivo só**, com **media queries CSS por largura da janela**: `@media (max-width:1199px)` (tablet, 768–1199) e `@media (max-width:767px)` (celular). Acima de 1199 vale o CSS base (PC).
- A prop `largura` (`pc` | `tablet` | `celular`) **não muda o arranjo**: só troca o sufixo dos links das abas. A largura real vem do tamanho do quadro (`$preview`: 1440 × 1200 e 390 × 1230).
- A prop `painel: "metas"` só serve para o quadro já nascer com o painel aberto.
- Classes utilitárias de troca dentro do painel: `.r2-pp-volta` (só celular), `.r2-pp-x` (some no celular).

### 9.2 Tabela parâmetro × largura

| Parâmetro | PC 1440 (≥ 1200) | Tablet 820 em pé (768–1199) — **sem quadro, deduzido do CSS** | Celular 390 (≤ 767) |
|---|---|---|---|
| Quadro no canvas | `RH2-Painel-Metas` 1440 × 1200 | não existe | `RH2-Painel-Metas-Celular` 390 × 1230 |
| Forma do painel | painel lateral direito, altura total | painel lateral direito, altura total | **tela cheia** |
| Largura do painel | 480 px (`max-width:100%`) | 480 px (sobram 340 px de fundo em 820) | 100% |
| Borda / sombra | borda esquerda 1 px `#33425C` + sombra `-24px 0 48px` | igual ao PC | sem borda e sem sombra |
| Fundo escurecido | visível à esquerda, fecha ao tocar | visível à esquerda, fecha ao tocar | coberto pelo painel (não dá para tocar) |
| Como fecha | "X" 48 × 48 no canto + toque no fundo | igual ao PC | "‹ Voltar" (altura 48, texto 16 px, azul `#93C5FD`) |
| Altura do cabeçalho | mín. 68 px, padding 10/14/10/20 | igual ao PC | mín. 60 px, padding 6/12/6/6 |
| Título "Metas" | 30 px, Barlow Semi Condensed 800, com ícone 24 px | igual ao PC | 24 px, **sem ícone** |
| Corpo | rola por dentro (`overflow-y:auto`), padding 18/20/24, espaço 16 px | igual ao PC | rola por dentro, padding 16 |
| Colunas do corpo | 1 coluna (cards empilhados) | 1 coluna | 1 coluna |
| Ordem dos blocos | Dias úteis → Injetora → Montagem → Teste & Embalagem → Meta por tamanho | igual | igual |
| Card do setor | padding 16, raio 14, borda de cima 4 px na cor do setor | igual | igual |
| Linha "POR DIA" × "MÊS" | lado a lado (stepper à esquerda, mês à direita), quebra se faltar espaço (`flex-wrap`) | igual | lado a lado (cabe em 390 − 32 − 32) |
| Botões "−" / "+" dos steppers | 44 × 44 px, sinal 22 px | 44 × 44 px | **48 × 48 px** |
| Número do stepper | 26 px (largura mín. 56) | 26 px | 26 px |
| Número "MÊS" | 30 px | 30 px | 30 px |
| Barras "hoje" / "mês" | trilho de 10 px; valor 18 px + texto 14 px | igual | igual |
| Caixa "faltam / precisa" | texto 14 px, números 20 px, duas pontas | igual | igual (quebra em 2 linhas se precisar) |
| Botão "Meta por tamanho" | altura mín. 52 px, largura total, 16 px | igual | igual |
| Campos de tamanho | 120 × 44 px, 18 px | 120 × 44 px | 120 × **48** px |
| Rodapé | fixo embaixo do painel; aviso à esquerda (base 180 px), botões à direita, numa linha | igual ao PC | fixo embaixo; **aviso numa linha inteira** em cima, botões embaixo |
| Botões do rodapé | altura 48; "Desfazer" padding 0 16, "Salvar metas" padding 0 18; largura pelo texto | igual ao PC | altura 48; os dois **dividem a largura** (`flex:1 1 0`), padding 0 10 |
| "Metas salvas" | 15 px, entre o aviso e os botões | igual | 15 px, na linha dos botões (quebra se não couber) |
| Gatilho na navegação | botão "Metas" no topo, altura 40 | botão "Metas" no topo (2ª linha da barra, ao lado das abas), altura 44 | botão "⋯" 48 × 48 no topo → menu (itens de 48 px) "Metas" / "Exportar" |
| Selo "meta 270" (Agora) | altura mín. 40 | 44 | 48 (só visível com o setor aberto em tela cheia) |
| Legenda "% da meta · 270 por dia" | altura mín. 40 | 40 | 40 (abaixo dos 48 do critério do briefing) |
| Camada | `z-index:70` | 70 | 70 (cobre a barra de abas fixa embaixo, z 30) |
| O que fica fixo / o que rola | cabeçalho e rodapé do painel fixos; corpo rola | igual | igual; a página de trás não aparece |
| Texto mínimo | 14 px | 14 px | 14 px |

Critério do briefing que vale para todas: "Texto com 14 px ou mais, contraste de 4,5:1, alvos de toque de 44 px no tablet e 48 px no celular". No PC o protótipo já usa 44–48 px nos controles do painel.

Tablet deitado (1180): cai na mesma faixa ≤ 1199 → mesmo painel lateral de 480 px, "com mais respiro" (briefing).

### 9.3 Tela de baixo, só o que importa para o painel
- PC: barra do topo numa linha (logo, 4 abas, "Metas", "Exportar", relógio).
- Tablet: barra em 2 linhas (logo + relógio / abas + "Metas" e "Exportar").
- Celular: topo fixo (`sticky`) só com logo, relógio e "⋯"; abas viram barra fixa embaixo (4 colunas, 62 px de altura).

## 10. Cores e tipografia do painel (tema escuro do protótipo)

- Fundo do painel `#0D121B`; cards `#111824` com borda `#26334A`; caixas internas `#0A0E15` com borda `#1C2738`; trilho das barras `#1C2738`.
- Texto `#EEF2F8`; secundário `#A3B0C2`; rótulos em caixa alta 14 px 700 com `letter-spacing .06em`.
- Primário `#2563EB` (hover `#1D4ED8`); botões de stepper `#16223A` (hover `#1E2D4A`); confirmação `#86EFAC`.
- Setores: Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`.
- Fontes: Barlow (texto) e Barlow Semi Condensed 800 (números), `tabular-nums`.
- Foco visível: contorno 3 px `#BFDBFE`.

## 11. Fase futura, desabilitado, placeholder

- **"Meta por tamanho"**: marcada "opcional"; campos com `placeholder="—"`, **sem ligação com estado, salvar ou desfazer**. Não há regra de como ela se relaciona com a meta do setor nem onde aparece.
- **Quadro de tablet** do painel: não desenhado.
- **Mês fixo** "novembro" em texto; sem troca de mês nem metas de meses futuros.
- **Propagação**: "vai para os tablets" é só um aviso; nada é atualizado nas outras telas ao salvar.
- **Estados de erro / carregando / sem conexão / sem permissão**: não existem.
- Tela antiga "RH · Metas": substituída; o arquivo não está na pasta do protótipo.

## 12. Divergências anotadas

1. Briefing: "Abre pelo anel (Agora)". Protótipo: o card do anel abre o setor; o painel abre pela legenda e pelo selo "meta 270".
2. Briefing: rótulo "Desfazer mudanças". Protótipo: botão "Desfazer".
3. Briefing: "aparece no tablet de cada setor". Protótipo: "vai para os tablets".
4. Prop "Sem produção hoje": a tela de baixo zera, o painel continua com 76 / 161 / 120 em "hoje".
5. Comentário do código fala em "três telas"; o painel está em quatro (Pausas também).
6. Dias úteis 21 não desconta os feriados de 02/11 e 20/11.

## 13. Dúvidas para quem escreve os cards

1. **Vigência da meta:** mudar a meta no meio do mês vale para o mês inteiro (recalcula passado) ou só de hoje em diante? Dias antigos no histórico continuam coloridos pela meta da época?
2. **Meta é por mês?** Cada mês tem seu registro (dias úteis + metas) ou é um valor único até alguém mudar? Dá para preparar o mês seguinte?
3. **Dias úteis:** o sistema sugere (segunda a sexta menos feriados) e o RH ajusta, ou o RH digita sempre? Sábado conta? O que são "dias passados": dias de calendário ou dias com produção?
4. **"Feito no mês"** conta até ontem (como no protótipo) ou inclui hoje?
5. **Meta por tamanho:** entra agora ou depois? É por setor ou geral? Soma na meta do setor, substitui ou é só referência? Onde aparece?
6. **Fechar com mudança não salva:** descarta, mantém ou pergunta?
7. **Propagação:** o tablet muda na hora, no próximo carregamento ou só no dia seguinte? E tablet sem conexão?
8. **Permissão:** só RH ou admin também? Outros perfis veem o painel só para leitura ou nem veem o botão?
9. **Limites e digitação:** existe meta máxima? Pode digitar o número (hoje só ±10)? Meta fora de múltiplo de 10 é válida?
10. **Auditoria:** precisa guardar quem mudou e quando, e mostrar isso em algum lugar?
11. **Dois RH editando ao mesmo tempo:** último a salvar vence?
12. **"Salvar metas" sem mudança** deve ficar desabilitado? O painel fecha depois de salvar?
13. **Tablet 820:** confirmar o painel lateral de 480 px (não há quadro).
14. **Filtro de medida** da tela Agora deve afetar "hoje" e "mês" do painel? (No protótipo não afeta.)
15. **Linha "meta 540"** da Desempenho é a soma das metas de Montagem e Teste & Embalagem? Se as metas ficarem diferentes entre setores, como ela é calculada?
