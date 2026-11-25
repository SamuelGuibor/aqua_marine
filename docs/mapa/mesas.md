# Mapa do protótipo · Montagem · mesas e operadoras (`mesas`)

Fonte: quadros `Tela-Mesas-*` do protótipo (versão nova, responsiva) e `Mesas.dc.html` (versão anterior, só 1280×800).
Os seis quadros `Tela-Mesas-*` são **o mesmo arquivo** (mesmo HTML, mesmo CSS, mesma lógica): só mudam o `<title>`, a prop `largura` (`pc` / `h` / `v` / `cel`), a prop `estado` (`""` ou `"operadoras"`) e o tamanho de pré-visualização.

| Quadro | Tamanho no canvas | `largura` | `estado` | O que mostra de diferente |
|---|---|---|---|---|
| `Tela-Mesas-PC` | 1440×900 (expand: fill) | `pc` | `""` | Tabela de 7 colunas, igual ao tablet horizontal, só mais larga |
| `Tela-Mesas-TabletH` | 1280×800 | `h` | `""` | Tabela de 7 colunas (aparelho do operador) |
| `Tela-Mesas-TabletH-Operadoras` | 1280×800 | `h` | `operadoras` | Mesma tela com a gaveta "Operadoras" aberta à direita (400 px) |
| `Tela-Mesas-TabletV` | 800×1280 | `v` | `""` | Cada mesa vira cartão de duas linhas; cabeçalho da tabela some |
| `Tela-Mesas-TabletV-Operadoras` | 800×1280 | `v` | `operadoras` | Cartões + gaveta "Operadoras" de 440 px à direita |
| `Tela-Mesas-Celular` | 390×2080 | `cel` | `""` | Página rola inteira; cartão em 2 colunas; rodapé empilhado |
| `Mesas` (anterior) | 1280×800 | não tem | não tem | Largura fixa em px, estilos inline; mesma lógica |

Não existe quadro "Celular · operadoras aberto": o comportamento no celular vem só do CSS (gaveta com 100% da largura).

---

## 1. Propósito e quem usa

Painel de **configuração e correção das mesas da Montagem**. Serve para:

- dizer **qual operadora** está em cada mesa e **qual tamanho de placa** a mesa está montando;
- ver, por mesa, a contagem do dia ("placas hoje"), o horário do último pulso e se a mesa tem botão ESP32 vinculado;
- **corrigir a quantidade** contada de uma mesa (−1 ou edição);
- **cadastrar/remover operadoras** (gaveta "Operadoras") e **adicionar mesas**.

Quem usa: quem está no **tablet do setor Montagem** (operadora/líder). A tela é aberta a partir da tela do operador da Montagem (`Tela-Montagem-*`), por três caminhos: link "Corrigir quantidade" em cada raia de operadora, link "Painel de mesas e operadoras" no rodapé das raias e o aviso amarelo "Mesas 5 e 6 sem operadora · configurar". O protótipo **não mostra nenhuma barreira de acesso** (PIN, perfil) para entrar aqui — ver dúvidas.

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.ms-head`)

Esquerda:
- Botão quadrado de voltar (seta `<`), `aria-label="Voltar para a Montagem"`, leva para a tela da Montagem.
- Linha de setor: quadradinho turquesa (#2DD4BF) + texto **"MONTAGEM · PAINEL DE MESAS"** (14 px, 700, caixa alta, cor #5EEAD4).
- Título `h1`: **"Total hoje: {total} placas · {qtdMesas} mesas"** — no exemplo "Total hoje: 127 placas · 6 mesas".

Direita:
- Indicador **"atualiza sozinho"** com bolinha verde (#22C55E) — a tela se atualiza em tempo real, sem botão de recarregar.
- Botão **"Operadoras"** (ícone de pessoas) — abre a gaveta de operadoras.
- Logo AquaPulse 52×52 (só em ≥1280 px).

### 2.2 Alerta de mesas pendentes (`.ms-alerta`, `role="status"`)

Só aparece se existir pelo menos uma mesa sem operadora **ou** sem tamanho. Faixa âmbar (fundo #2A1F07, borda #7A5A12, texto #FDE68A) com ícone de triângulo e o texto:

> "Mesas 5 e 6 sem operadora e tamanho: os apertos delas não contam até configurar."

Singular: "Mesa 5 sem operadora e tamanho: …". Os números são unidos com " e " (com 3 pendentes ficaria "5 e 6 e 7" — ajustar para lista com vírgulas).

### 2.3 Lista de mesas (`.ms-lista`, `aria-label="Mesas"`)

Em ≥1280 px é uma tabela com cabeçalho (13 px, 700, caixa alta, #A3B0C2):

`MESA` · `OPERADORA` · `TAMANHO DA PLACA` · `BOTÃO ESP32` · `PLACAS HOJE` (à direita) · `ÚLTIMO PULSO` · `CORRIGIR` (à direita)

Cada linha/cartão de mesa mostra:

| Campo | Conteúdo | Exemplo |
|---|---|---|
| Mesa | Número dentro de círculo 38 px (Barlow Semi Condensed 20 px/800) + situação: **"ativa"** (verde #86EFAC) ou **"configurar"** (âmbar #FCD34D) | 1 · ativa |
| Operadora | `<select>` (`aria-label="Operadora da mesa N"`). Opções: valor atual, Helena, Maiara, Maria, **"— nenhuma —"**. Borda âmbar (#B7791F) quando está em "— nenhuma —" | Helena |
| Tamanho da placa | `<select>` (`aria-label="Tamanho da mesa N"`). Opções: valor atual, **"2 m · 1 m²"**, **"3 m · 1,5 m²"**, **"4 m · 2 m²"**, **"5 m · 2,5 m²"**. Sem valor aparece **"— nenhum —"** com borda âmbar | 3 m · 1,5 m² |
| Botão ESP32 | Bolinha + estado: **"Vinculado"** (verde) com subtexto **"porta 1"**, ou **"Sem botão"** (cinza) com subtexto **"sem token"**. Só leitura nesta tela | Sem botão · sem token |
| Placas hoje | Número grande (34 px, 800). Nos cartões aparece a legenda "placas hoje" embaixo | 31 |
| Último pulso | Horário `HH:MM:SS` do último aperto/toque | 09:17:24 |
| Corrigir | Dois botões 52×48: **"−1"** (`aria-label="Remover uma placa da mesa N"`) e **lápis** (`aria-label="Corrigir quantidade da mesa N"`) | |

Linha de mesa pendente (`.ms-row-pend`): fundo âmbar escuro #1F1806 (nos cartões, também borda #7A5A12).

Dados de exemplo:

| Mesa | Operadora | Tamanho | ESP32 | Placas hoje | Último pulso | Situação |
|---|---|---|---|---|---|---|
| 1 | Helena | 2 m · 1 m² | Vinculado · porta 1 | 31 | 09:17:24 | ativa |
| 2 | Helena | 3 m · 1,5 m² | Sem botão · sem token | 21 | 07:51:53 | ativa |
| 3 | Maiara | 3 m · 1,5 m² | Sem botão · sem token | 44 | 09:17:07 | ativa |
| 4 | Maria | 3 m · 1,5 m² | Sem botão · sem token | 31 | 09:14:17 | ativa |
| 5 | — nenhuma — | — nenhum — | Sem botão · sem token | 0 | 09:46:21 | configurar |
| 6 | — nenhuma — | — nenhum — | Sem botão · sem token | 0 | 16:49:45 | configurar |

Repare: as mesas 5 e 6 têm "último pulso" mesmo sem estar configuradas (o aperto chega, mas não conta). A mesa 6 tem horário 16:49:45 enquanto as outras estão por volta de 09:17 — parece ser pulso de outro dia; a tela não mostra data.

### 2.4 Rodapé (`.ms-foot`)

- Botão **"+ Adicionar mesa"** (borda tracejada, 52 px de altura).
- Nota central: **"Mudanças salvam na hora e valem para os próximos apertos. O que já foi contado não muda."**
- Link-botão azul (#2563EB) **"Voltar para a Montagem"**.

### 2.5 Gaveta "Operadoras" (`.ms-veu` + `.ms-gaveta`, `role="dialog"`, `aria-label="Operadoras"`)

Abre por cima da tela, encostada à direita, com véu escuro (rgba(5,8,13,.6)) sobre o resto.

- Topo: título **"Operadoras"** (24 px/700) + botão **"×"** (`aria-label="Fechar"`, 52×52).
- Lista de operadoras, uma linha por pessoa (mín. 64 px, fundo #0A0E15): nome (18 px/600) + mesas em que está ("Mesas 1 e 2", "Mesa 3", "Mesa 4") + botão de lixeira 48×48 (`aria-label="Remover {nome}"`).
- Espaço flexível que empurra o formulário para o pé da gaveta.
- Rótulo **"Nova operadora"** + campo de texto com placeholder **"Nome"** (56 px de altura, 18 px) + botão azul **"Adicionar"** (56 px).

Exemplo: Helena (Mesas 1 e 2), Maiara (Mesa 3), Maria (Mesa 4).

---

## 3. Ações e o que a lógica do script faz

| Ação | Elemento | O que o protótipo faz | O que o sistema real precisa fazer |
|---|---|---|---|
| Voltar | Seta do cabeçalho e "Voltar para a Montagem" | Navega para `Tela-Montagem{sufixo}` | Navegar para a tela do operador da Montagem |
| Abrir operadoras | Botão "Operadoras" | `opsAberto = true` | Abrir a gaveta |
| Fechar operadoras | "×" | `opsAberto = false`. **Não fecha** tocando no véu nem com Esc | Fechar; decidir se véu/Esc também fecham |
| Trocar operadora | `<select>` da linha | **Sem handler** (select nativo, nada é guardado) | Gravar na hora a operadora da mesa; vale para os próximos apertos |
| Trocar tamanho | `<select>` da linha | **Sem handler** | Gravar na hora o tamanho; vale para os próximos apertos |
| −1 | Botão "−1" | Se `qtd < 1`, não faz nada; senão `qtd -= 1`. Sem confirmação, sem desfazer. O total do cabeçalho recalcula | Gravar um evento de correção −1 na mesa (com autor e hora) |
| Corrigir quantidade | Botão de lápis | **Sem handler** (placeholder) | Abrir edição da quantidade do dia daquela mesa (formato não desenhado) |
| Adicionar mesa | "+ Adicionar mesa" | **Sem handler** | Criar mesa nova (nasce como "configurar") |
| Remover operadora | Lixeira na gaveta | **Sem handler** | Remover/desativar operadora (regra para mesas vinculadas não definida) |
| Adicionar operadora | Campo "Nome" + "Adicionar" | **Sem handler**, sem validação | Criar operadora; validar nome vazio/duplicado |

Não há no protótipo: confirmação de qualquer ação, desfazer, toast de "salvo", mensagem de erro, estado de carregamento.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal | Tabela/cartões com todas as mesas; mesas completas com "ativa" em verde |
| Mesa pendente | Falta operadora **ou** tamanho: rótulo "configurar" em âmbar, fundo da linha #1F1806, borda âmbar só no select que está vazio, e o alerta no topo |
| Sem pendências | O alerta do topo some (`temPendente = false`) |
| Botão vinculado | "Vinculado" + "porta 1" em verde |
| Botão não vinculado | "Sem botão" + "sem token" em cinza |
| Gaveta aberta | Véu + gaveta à direita (quadros `-Operadoras`) |
| Quantidade zero | "−1" não faz nada (na tela da Montagem o botão fica com opacidade 0,4; aqui não muda de aparência) |
| Vazio (nenhuma mesa / nenhuma operadora) | **Não desenhado** |
| Erro ao salvar, sem conexão, carregando | **Não desenhado** |
| Turno pausado | **Não aparece nesta tela** (a pausa é da tela da Montagem) |

Foco de teclado: contorno de 3 px #99F6E4. Botões encolhem para 0,97 ao toque (desligado com `prefers-reduced-motion`).

---

## 5. Regras de negócio e contas

1. **Mesa conta só se estiver configurada**: precisa de operadora **e** tamanho. Sem um dos dois, os apertos "não contam até configurar" (versão anterior dizia: "não entram na produção de ninguém até configurar").
2. **Mudança não é retroativa**: "Mudanças salvam na hora e valem para os próximos apertos. O que já foi contado não muda." Logo, cada placa contada guarda a operadora e o tamanho que valiam naquele momento.
3. **Salvar automático**: não existe botão "Salvar"; trocar um select já grava.
4. **Total do cabeçalho** = soma de "placas hoje" de **todas** as mesas (127 no exemplo = 31+21+44+31+0+0). Na tela da Montagem o total soma só as mesas ativas; no exemplo dá o mesmo porque as pendentes estão em 0. Divergência a resolver.
5. **Contagem de mesas** no título = todas as mesas cadastradas (6), não só as ativas.
6. **−1 nunca deixa negativo** (limite inferior 0).
7. **Uma operadora pode estar em mais de uma mesa** (Helena nas mesas 1 e 2). O contrário (duas operadoras na mesma mesa) não existe: um select por mesa.
8. **Tamanhos de placa** (lista de exemplo, parece cadastro fixo/configurável): 2 m → 1 m²; 3 m → 1,5 m²; 4 m → 2 m²; 5 m → 2,5 m² (área = comprimento × 0,5). A tela da Montagem usa essa área para a "Área total" do dia.
9. **Produção por operadora** (usada na tela da Montagem e no RH) = soma das placas das mesas enquanto ela estava atribuída.
10. **Botão ESP32**: cada mesa pode ter um botão físico vinculado (identificado por token e "porta"). Sem botão, a contagem vem do "+1" tocado no tablet (tela da Montagem). O vínculo não se faz aqui: no Admin a aba aparece como "Botões ESP32 · fase 3" (desabilitada).
11. **Último pulso**: horário do último aperto/toque daquela mesa, mostrado mesmo em mesa pendente.
12. **"Hoje"**: a contagem é do dia corrente; o corte do dia (meia-noite? início do turno?) não é definido aqui.

Valores de exemplo que vêm de outras telas e afetam esta: meta da Montagem 270 placas/dia (configurável nas telas de metas do RH).

---

## 6. Entidades e eventos implícitos

**Mesa** (da Montagem)
- número (sequencial, exibido no círculo)
- setor (Montagem)
- operadora atual (opcional)
- tamanho de placa atual (opcional)
- situação derivada: ativa / configurar
- botão ESP32 vinculado (opcional) — fase 3
- último pulso (data e hora)
- ativa/arquivada (não há remover mesa no protótipo)

**Operadora**
- nome
- ativa/removida (para não perder histórico)
- relação com mesas (derivada: "Mesas 1 e 2")
- possível vínculo com o cadastro de pessoas do RH (não definido)

**Tamanho de placa**
- comprimento em metros (2, 3, 4, 5)
- área em m² (1; 1,5; 2; 2,5)
- rótulo ("3 m · 1,5 m²")

**Botão ESP32** (fase 3)
- token
- porta
- mesa vinculada
- estado (vinculado / sem botão)

**Contagem de montagem (evento por placa ou por ajuste)**
- mesa
- operadora e tamanho **copiados no momento** (regra da não retroatividade)
- origem: botão ESP32, toque "+1" no tablet, "−1", correção manual
- variação (+1, −1, ou ajuste para um valor)
- data e hora; tablet e usuário que fez
- se contou ou foi ignorado (mesa pendente)

**Histórico de configuração da mesa**
- mesa, operadora, tamanho, vigente desde / até, quem mudou

Eventos que esta tela grava: operadora da mesa alterada; tamanho da mesa alterado; mesa criada; operadora criada; operadora removida; −1 em mesa; correção de quantidade. Todos candidatos ao "Registro de ações" do Admin.

Leituras em tempo real: placas hoje por mesa, último pulso, estado do botão ("atualiza sozinho").

---

## 7. Navegação

| De | Para |
|---|---|
| Seta de voltar (cabeçalho) | `Tela-Montagem{-PC, -TabletH, -TabletV, -Celular}` — tela do operador da Montagem |
| "Voltar para a Montagem" (rodapé) | idem |
| "Operadoras" | Gaveta na mesma tela (não muda de rota) |
| Chegada | Da tela da Montagem: "Corrigir quantidade" (em cada raia), "Painel de mesas e operadoras" e o aviso "Mesas 5 e 6 sem operadora · configurar" |

Não há links para Histórico, Setores, RH ou Admin a partir desta tela.

---

## 8. Responsividade

### 8.1 Mecanismo

Um componente só, com **media queries por largura da janela**:

- **base (≥ 1280 px)**: tabela. Vale para PC 1440 e tablet horizontal 1280 (sem diferença de CSS entre os dois).
- **`@media (max-width:1279px)`**: tablet em pé — cartões de duas linhas.
- **`@media (max-width:719px)`**: celular — a página rola inteira, cartão de 2 colunas.

A prop `largura` (`pc`/`h`/`v`/`cel`) **não muda o arranjo**: só escolhe o sufixo dos links (`-PC`, `-TabletH`, `-TabletV`, `-Celular`). A prop `estado="operadoras"` só abre a gaveta de início. No sistema real não existe sufixo: é a mesma rota. A troca de arranjo dentro da linha é feita com `grid-template-areas` (os mesmos 7 elementos mudam de lugar, sem duplicar marcação).

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet horizontal 1280×800 | Tablet vertical 800×1280 | Celular 390 |
|---|---|---|---|---|
| Regra CSS ativa | base | base | `max-width:1279px` | `max-width:1279px` + `max-width:719px` |
| Altura da tela | `100vh` (mín. 560), sem rolagem da página | igual | igual | `height:auto`, `min-height:100vh`; **a página inteira rola** |
| O que é fixo | Cabeçalho e rodapé | Cabeçalho e rodapé | Cabeçalho e rodapé | Nada (tudo rola junto) |
| O que rola | Só o miolo (`.ms-main`, `overflow-y:auto`) | igual | igual | A página |
| Cabeçalho: altura | mín. 88 px | mín. 88 px | mín. 80 px | automática, quebra em 2 linhas, padding 12×16 |
| Cabeçalho: padding lateral | 28 px | 28 px | 24 px | 16 px |
| Cabeçalho: arranjo | 1 linha: voltar + título à esquerda; "atualiza sozinho" + "Operadoras" + logo à direita | igual | 1 linha, sem logo | Linha 1: voltar + título. Linha 2: "atualiza sozinho" à esquerda e "Operadoras" à direita |
| Botão voltar | 52×52 | 52×52 | 52×52 | 48×48 |
| Título `h1` | 30 px | 30 px | 26 px | 22 px |
| Rótulo do setor | 14 px | 14 px | 14 px | 14 px |
| Botão "Operadoras" | 52 px de altura, 17 px | igual | igual | igual |
| Logo AquaPulse | 52×52 visível | visível | escondido | escondido |
| Miolo: padding | 16×28 | 16×28 | 16×24 | 12 |
| Alerta de pendentes | 16 px | 16 px | 16 px | 15 px |
| Forma da lista | Tabela dentro de um painel (fundo #111824, borda, raio 18) | igual | Painel some; **cada mesa é um cartão** (borda, raio 16), 8 px entre cartões | Cartão |
| Cabeçalho da tabela | Visível | Visível | Escondido; rótulos "OPERADORA", "TAMANHO DA PLACA", "ÚLTIMO PULSO" aparecem dentro do cartão | Escondido; rótulos dentro do cartão |
| Colunas da linha | 7: `96 · 1fr · 1fr · 170 · 104 · 110 · 128` | as mesmas 7 | 4: `120 · 1fr · 1fr · auto` | 2: `1fr · 1fr` |
| Áreas da linha | `n op tam esp qtd pulso acoes` | igual | linha 1: `n op tam tam`; linha 2: `qtd esp pulso acoes` | `n acoes` / `op tam` / `esp qtd` / `pulso qtd` |
| Largura aprox. de cada select | ≈ 316 px | ≈ 236 px | operadora ≈ 225 px; tamanho ≈ 351 px | ≈ 164 px cada |
| Select: altura / fonte | 50 px / 18 px | 50 / 18 | 50 / 18 | 50 / 16 (padding 0 8) |
| Número da mesa + situação | lado a lado | lado a lado | empilhados (número em cima, "ativa" embaixo) | lado a lado |
| "Placas hoje" (número) | 34 px, alinhado à direita, sem legenda | igual | 34 px, à esquerda, com legenda "placas hoje" | 34 px, à direita, centralizado nas 2 últimas linhas, com legenda |
| Botões "−1" e lápis | 52×48 cada, à direita | igual | 52×48, no fim da 2ª linha | 52×48, no topo direito do cartão |
| Altura mínima da linha | 66 px | 66 px | cartão ≈ 2 linhas (≈ 140 px) | cartão ≈ 4 linhas (≈ 230 px) |
| Linha pendente | fundo #1F1806 | igual | fundo #1F1806 + borda #7A5A12 | igual ao tablet vertical |
| Rodapé | 1 linha, mín. 80 px: "+ Adicionar mesa" · nota · "Voltar para a Montagem" | igual | igual (nota centralizada, pode quebrar) | Empilhado, largura total: nota primeiro, depois "+ Adicionar mesa", depois "Voltar para a Montagem"; padding 14×16×20 |
| Botões do rodapé | 52 px de altura, 17 px | igual | igual | 52 px, largura total |
| Gaveta "Operadoras" | Painel lateral direito de 400 px, altura total, padding 24 | igual | Painel lateral direito de 440 px | **Tela cheia** (100% da largura, padding 16) |
| Gaveta: alvos | "×" 52×52; linha de pessoa mín. 64 px; lixeira 48×48; campo e "Adicionar" 56 px | igual | igual | igual |
| Véu | Cobre a tela (absoluto dentro de `.ms`) | igual | igual | Cobre a página inteira (como a página é alta, no real deve ser fixo na janela) |
| Quadro com gaveta aberta | não há | `TabletH-Operadoras` | `TabletV-Operadoras` | não há |

Alvos de toque: nada clicável abaixo de 48 px (botões de ação 52×48, selects 50, botões de cabeçalho/rodapé 52, lixeira 48, campo de nome 56).

Faixa não desenhada: entre 720 e 1279 px vale o arranjo de cartões do tablet vertical (inclui tablets de 820 e 1024 px de largura).

---

## 9. Fase futura, desabilitado, placeholder

- **Botão ESP32**: a coluna é só leitura. O vínculo de botão (token/porta) é do Admin, onde a aba se chama "Botões ESP32 · fase 3" e está desabilitada. No exemplo só a mesa 1 está "Vinculado".
- **Lápis "Corrigir quantidade"**: botão sem ação; a edição não foi desenhada.
- **"+ Adicionar mesa"**: botão sem ação.
- **Selects de operadora e tamanho**: sem lógica de gravação; opções fixas no HTML (a lista de operadoras do select não vem da gaveta).
- **Gaveta**: lixeira e "Adicionar" sem ação; campo "Nome" sem validação.
- **"atualiza sozinho"**: só o rótulo; não há atualização real no protótipo.
- Sem estados de vazio, erro, carregando e sem conexão.

---

## 10. Divergências entre a versão anterior (`Mesas.dc.html`) e a nova

| Ponto | Anterior | Nova |
|---|---|---|
| Largura | Fixa 1280×800, estilos inline | Responsiva por media query |
| Texto do alerta | "…: os apertos não entram na produção de ninguém até configurar." | "…: os apertos delas não contam até configurar." |
| Botão "×" da gaveta | 48×48, fonte 22 | 52×52, fonte 26 |
| Linha de pessoa | mín. 56 px | mín. 64 px |
| Lixeira | 44×44 | 48×48 |
| Campo e botão "Nova operadora" | 52 px / 17 px | 56 px / 18 px |
| Miolo | sem rolagem (6 mesas cabem) | rola quando passa da altura |
| Link de volta | `Montagem.dc.html` | `Tela-Montagem{sufixo}` |

Nenhuma regra de negócio mudou; a nova só aumentou alvos de toque e reescreveu o aviso. A frase antiga é mais precisa sobre o efeito ("não entram na produção de ninguém").

---

## 11. Dúvidas para o card

1. **Lápis "Corrigir quantidade"**: abre o quê? Campo numérico com o total do dia? Pede motivo? Tem limite? Quem pode usar?
2. **−1**: precisa de confirmação ou desfazer? Fica no registro de ações? Qualquer operadora pode tirar placa de qualquer mesa?
3. **Apertos em mesa pendente**: são descartados ou ficam guardados? Ao configurar a mesa, os apertos anteriores passam a contar ou continuam fora ("o que já foi contado não muda")?
4. **Remover operadora** que está em alguma mesa: bloqueia, ou tira ela das mesas (que viram "configurar")? Apaga de verdade ou só desativa, para manter o histórico do RH?
5. **Operadora é a mesma pessoa do cadastro do RH** (desempenho, registro) ou um cadastro próprio só com nome? Nome duplicado é aceito?
6. **Adicionar mesa**: o número é o próximo da sequência, automático? Dá para remover/desativar uma mesa (não há botão)? Existe limite de mesas?
7. **Tamanhos de placa**: lista fixa (2, 3, 4, 5 m) ou cadastro editável? Dá para voltar o tamanho para "— nenhum —" (o select não tem essa opção)?
8. **Total do cabeçalho**: soma todas as mesas ou só as ativas (como na tela da Montagem)?
9. **Alerta com pendência parcial** (tem operadora, falta só tamanho): o texto sempre diz "sem operadora e tamanho"; precisa de texto por caso?
10. **Último pulso de outro dia** (mesa 6 mostra 16:49:45): mostrar data, "ontem" ou traço?
11. **"atualiza sozinho"**: de quanto em quanto tempo / por qual meio? O que aparece quando o tablet fica sem conexão, e dá para trocar operadora/tamanho offline?
12. **Acesso**: qualquer pessoa no tablet da Montagem abre este painel, ou só líder/admin (PIN)?
13. **Corte do dia**: "hoje" vira à meia-noite ou no início do turno?
14. **Gaveta**: fecha tocando no véu e com Esc? No celular é tela cheia (não foi desenhado)?
15. **Fase 1 sem ESP32**: enquanto os botões são fase 3, a coluna "BOTÃO ESP32" aparece (sempre "Sem botão") ou fica escondida?
16. **Troca de operadora no meio do dia**: "placas hoje" da mesa continua acumulando por mesa (sim, pelo protótipo); confirmar que a divisão por operadora usa o momento de cada placa.
