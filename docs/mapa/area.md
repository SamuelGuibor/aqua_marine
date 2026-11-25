# Mapa do protótipo · Escolher área (hub Fábrica × RH) · chave `area`

Fonte: `Tela-Area-PC.dc.html`, `Tela-Area-TabletH.dc.html`, `Tela-Area-TabletV.dc.html`, `Tela-Area-Celular.dc.html` (versão nova, responsiva) e `Hub.dc.html` (versão anterior, só 1280×800). Índice: `canvas.json` (seção "Escolher área", nota `resp-area`).

Os quatro quadros `Tela-Area-*` são **o mesmo arquivo byte a byte**, exceto três coisas: o `<title>`, o valor padrão da prop `largura` (`pc` / `h` / `v` / `cel`) e o tamanho do `$preview`. Marcação, CSS e lógica são idênticos. Não há texto no protótipo que pareça instrução para agente.

---

## 1. Propósito e quem usa

Tela de entrada logo depois do login. Pergunta "Para onde você vai?" e oferece duas áreas:

- **Fábrica**: a operação no tablet de cada setor (leva à tela "Setores").
- **RH e gestão**: acompanhamento (leva à tela "Agora" do RH).

Mais um atalho no rodapé para vincular o aparelho a um setor ("Configurar este tablet").

Quem usa: qualquer pessoa que acabou de entrar com a senha. O login do protótipo (`Tela-Entrar-*`) tem **um único campo "Senha de acesso"**, sem usuário e sem perfil, e o botão "Entrar" leva direto para esta tela. Logo, o protótipo não distingue operador, RH e admin aqui: todos veem os dois cartões. Na prática:

- Operador em tablet **ainda não vinculado**: usa o rodapé para vincular, ou entra em Fábrica.
- Tablet **já vinculado**: a tela de configuração diz "Feito uma vez por aparelho. Depois ele abre direto no setor certo." Ou seja, o tablet vinculado deveria pular este hub (ver dúvidas).
- RH/gestão no PC ou celular: entra em "RH e gestão".

A tela também funciona como mini painel: o cartão Fábrica já mostra a produção do dia e o estado de cada setor.

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.hb-head`)
- Fundo `#0D121B`, borda inferior `#1F2A3D`.
- Esquerda: logo AquaPulse (imagem, 263×36; 190×26 no celular). Não é link nesta tela.
- Direita: data e hora `Terça, 03/11 · 15:36` (Barlow Semi Condensed 26px/700, `#CBD5E1`; texto fixo no protótipo, relógio de verdade no sistema) e o botão-link **"Sair"**.
- No celular a data some do cabeçalho e reaparece acima do título (ver 2.2).

### 2.2 Título (`.hb-tit`)
- Só no celular: linha de data `Terça, 03/11 · 15:36` (15px/600, `#A3B0C2`).
- `<h1>` **"Para onde você vai?"** (Barlow Semi Condensed 800, 44px; 32px no celular).

### 2.3 Cartão "Fábrica" (`<a class="hb-card">`, o cartão inteiro é um link)
- Topo: ícone de fábrica em quadrado `#16223A` (64×64, svg 32; 48/24 no celular), nome **"Fábrica"** (42px/800; 30px no celular), subtítulo **"Operação no tablet de cada setor"** (18px; 15px no celular), e à direita um círculo azul `#2563EB` com seta (56×56; 44×44 no celular; svg 26px). A seta é decorativa, não é botão separado.
- Lista (encostada no fundo do cartão, `justify-content:flex-end`):
  - Rótulo **"PRODUÇÃO DE HOJE · META 270 POR SETOR"** (14px/700, caixa alta, espaçamento .08em, `#A3B0C2`).
  - Uma linha por setor (3 linhas), cada uma num bloco `#0A0E15` com borda `#1C2738`:
    - quadradinho 12×12 com a cor do setor + nome do setor (19px/600; 17px no celular);
    - à direita: **`{q}`** (número produzido hoje, Barlow Semi Condensed 26px branco; 22px no celular) + ` / 270 · {status}` (17px; 15px no celular), com a cor do status;
    - barra de progresso de 6px, preenchida com a cor do setor, largura `pct%`.
  - Dados de exemplo:

    | Setor | Cor | q | pct | Status | Cor do status |
    |---|---|---|---|---|---|
    | Injetora | `#60A5FA` | 240 | 89% | `parada sem motivo · 12 min` | âmbar `#FCD34D` |
    | Montagem | `#2DD4BF` | 387 | 100% (travado) | `em produção` | neutro `#B7C2D3` |
    | Teste & Embalagem | `#C4B5FD` | 0 | 0% | `pausado · manutenção` | âmbar `#FCD34D` |

### 2.4 Cartão "RH e gestão" (`<a class="hb-card">`, o cartão inteiro é um link)
- Topo igual ao do Fábrica: ícone de gráfico de barras, nome **"RH e gestão"**, subtítulo **"Agora, desempenho, pedidos e pausas"**, círculo azul com seta.
- Lista com o rótulo **"O QUE TEM LÁ"** e quatro itens informativos (ícone 44×44; 40×40 no celular; título 19px/700 → 17px; descrição 15px → 14px):
  1. **Agora** · "O que cada setor está fazendo neste momento"
  2. **Desempenho** · "Dias, semanas e metas de cada setor"
  3. **Pedidos e estoque** · "Ordens de produção e pacotes prontos"
  4. **Pausas** · "Por que cada setor parou e por quanto tempo"
- Os quatro itens **não são links próprios**: o cartão inteiro é um único `<a>` para a tela "Agora" do RH. Texto estático, sem dados.

### 2.5 Rodapé (`.hb-foot`)
- Botão-link **"Configurar este tablet"** (ícone de tablet, altura 52px, borda `#33425C`, fundo `#111824`, 17px/600).
- Nota **"Este aparelho ainda não está ligado a um setor"** (15px, `#A3B0C2`). Texto fixo: o protótipo não mostra a variante para aparelho já vinculado.

---

## 3. Ações

Não há nenhum handler de clique nem estado no script: a tela é só navegação. `renderVals()` monta os destinos dos links e a lista de setores.

| Elemento | Texto | Efeito no protótipo |
|---|---|---|
| Link no cabeçalho | **Sair** | Vai para `Tela-Entrar{sufixo}`. Sem confirmação. No sistema real: encerrar a sessão. |
| Cartão inteiro | **Fábrica** | Vai para `Tela-Setores{sufixo}` (visão dos 3 setores). |
| Cartão inteiro | **RH e gestão** | Vai para `RH2-Agora` (PC e tablet horizontal), `RH2-Agora-Tablet` (tablet vertical) ou `RH2-Agora-Celular` (celular). |
| Link no rodapé | **Configurar este tablet** | Vai para `Tela-ConfigTablet{sufixo}` (vincular o aparelho por ID ou QR). |

Sufixos: `largura` `pc` → `-PC`, `h` → `-TabletH`, `v` → `-TabletV`, `cel` → `-Celular` (padrão `-TabletH`). Para o RH: `pc` e `h` → sem sufixo (o RH não tem quadro de tablet horizontal, usa o de PC), `v` → `-Tablet`, `cel` → `-Celular`.

Interações de apoio:
- `:hover` no cartão: borda passa de `#26334A` para `#3B5B9A`.
- `:focus-visible` em qualquer link: contorno de 3px `#BFDBFE`, afastado 2px (navegação por teclado no PC).
- Não há desfazer, confirmação, validação nem limite nesta tela.

---

## 4. Estados

O protótipo desenha **um estado só**. A prop `estado` existe (padrão `""`) mas **não é lida** pelo script.

O que aparece dentro desse estado único (variações por setor, na linha do cartão Fábrica):
- **Em produção**: texto neutro `#B7C2D3` ("em produção").
- **Parada sem motivo**: âmbar `#FCD34D`, com o tempo ("parada sem motivo · 12 min"). É o aviso automático do tablet do setor que ficou X minutos sem contar e ninguém respondeu.
- **Pausado com motivo**: âmbar `#FCD34D`, com o motivo resumido ("pausado · manutenção").
- **Meta batida**: só aparece como barra cheia (387/270 → 100%); não há texto nem cor de "batida" aqui (na tela Setores há "meta batida" e verde).
- **Sem produção**: q = 0, barra vazia.

Não desenhados (precisam de decisão): aparelho já vinculado (texto do rodapé), carregando, erro ao buscar a produção, sem conexão/offline, sessão expirada, perfil sem acesso a uma das áreas.

---

## 5. Regras de negócio e contas

- **Meta diária por setor: 270** (valor de exemplo, escrito direto no rótulo "META 270 POR SETOR", no texto "/ 270" e na conta). É **configurável no sistema real**: a tela `RH2-Painel-Metas` tem meta por setor (`pmMeta: { inj: 270, mon: 270, tes: 270 }`) e dias úteis (21). Se as metas forem diferentes entre setores, o rótulo único "META 270 POR SETOR" deixa de servir (ver dúvidas).
- **Percentual da barra**: `pct = min(100, round(q / 270 × 100))`. Travado em 100% (387 → 143% vira 100%). Na tela Setores o percentual escrito **não** é travado (só o anel é).
- **q por setor** (unidade conforme a tela Setores): Injetora = "Placas boas", Montagem = "Placas montadas", Teste & Embalagem = "Placas embaladas". Os números de exemplo (240, 387, 0) são os mesmos da tela Setores.
- **Status do setor**: vem do mesmo registro de pausas do tablet (comentário na tela Setores). Três valores possíveis: em produção; pausado com motivo escolhido pelo operador; parado sem motivo (o tablet avisou e ninguém respondeu).
- **Minutos até o aviso de parada** (definido nas telas dos setores, não aqui): Injetora 10 min, Montagem 15 min, Teste & Embalagem 15 min sem contar. O "12 min" do hub é o tempo desde o último registro (15:24 → 15:36).
- **Cores fixas dos setores**: Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`.
- **Ordem fixa dos setores**: Injetora, Montagem, Teste & Embalagem (Teste e Embalagem são um setor só).
- O hub mostra o motivo resumido ("manutenção"); a tela Setores mostra o caminho completo ("Manutenção › Compressor / ar").

---

## 6. Entidades e dados implícitos

Esta tela **não grava nada** (além do encerramento de sessão em "Sair"). Só lê.

| Entidade | Campos que esta tela consome |
|---|---|
| Setor | id, nome, cor, ordem de exibição |
| Meta do setor | setor, meta diária (270), vigência |
| Produção do dia (agregado por setor) | setor, data, quantidade boa do dia (q) — derivada dos eventos de contagem de cada setor |
| Estado atual do setor | setor, situação (em produção / pausado / parado sem motivo), motivo (categoria), desde quando (para os minutos) |
| Pausa / parada | setor, início, fim, motivo, origem (operador ou aviso automático) |
| Sessão | autenticada, perfil (se existir), expiração |
| Aparelho (tablet) | id (ex.: `TAB-MONT-01`), nome, setor vinculado — decide o texto do rodapé e se o hub é pulado |

Leitura sugerida: uma consulta "resumo do dia por setor" (q, meta, situação, minutos), a mesma que alimenta a tela Setores e o "Agora" do RH, para os números baterem ("o mesmo número nos dois", texto do login).

Eventos: nenhum de produção. Possíveis: `logout`.

Atualização: o protótipo é estático; não define se os números se atualizam sozinhos enquanto a tela está aberta.

---

## 7. Navegação

Saídas:
- **Sair** → Entrar (`Tela-Entrar-*`).
- **Fábrica** → Setores (`Tela-Setores-*`).
- **RH e gestão** → RH · Agora (`RH2-Agora`, `RH2-Agora-Tablet`, `RH2-Agora-Celular`).
- **Configurar este tablet** → Configurar tablet (`Tela-ConfigTablet-*`).

Entradas (quem aponta para o hub):
- Entrar: botão "Entrar" → hub.
- Setores: botão de voltar ("Voltar para o início") → hub.
- Configurar tablet: botão "Voltar" → hub.
- Admin · Tablets: o logo com a pílula "Admin" → hub.
- Telas RH2 (todas): o logo com a pílula "RH" → `Hub.dc.html` (a **versão antiga**; no sistema real é esta mesma rota).

Lacuna: **não há link do hub para "Admin › Tablets"**. As telas `Tela-AdminTablets-*` não são apontadas por nenhuma outra tela do protótipo.

---

## 8. Responsividade

### 8.1 Mecanismo
- **Media queries CSS por largura da janela**, num único componente:
  - padrão (≥ 1024px): PC e tablet horizontal;
  - `@media (max-width:1023px)`: tablet em pé (comentário do protótipo: "os dois cartões um embaixo do outro, Fábrica primeiro e maior");
  - `@media (max-width:719px)`: celular.
- A prop `largura` (`pc`/`h`/`v`/`cel`) **não muda o arranjo**: só escolhe o sufixo dos links para manter o usuário na mesma largura dentro do canvas. No sistema real essa prop some (uma rota só, CSS responsivo).
- PC e tablet horizontal usam exatamente o mesmo CSS; a única diferença é o espaço que sobra (o quadro PC tem `expand: fill` no canvas).
- Raiz `.hb`: `min-height:100vh`, coluna flex. Em ≥ 720px o corpo é `flex:1` e a grade estica para ocupar a altura que sobra (a tela cabe sem rolar em 1440×900, 1280×800 e 800×1280). No celular o corpo vira `flex:none`: altura natural e a página rola.
- Nenhum painel lateral, folha de baixo ou modal: esta tela não tem detalhe.

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 (quadro 390×1180) |
|---|---|---|---|---|
| Regra CSS ativa | padrão | padrão | `max-width:1023px` | `max-width:1023px` + `max-width:719px` |
| Altura do cabeçalho | 84px | 84px | 84px | 64px |
| Margem lateral do cabeçalho | 56px | 56px | 32px | 16px |
| Logo | 263×36 | 263×36 | 263×36 | 190×26 |
| Data/hora | no cabeçalho, 26px/700 | no cabeçalho, 26px/700 | no cabeçalho, 26px/700 | sai do cabeçalho; vai acima do título, 15px/600 |
| Botão "Sair" (altura × fonte) | 48px × 17px, padding 0 20 | 48px × 17px | 48px × 17px | 44px × 16px, padding 0 16 |
| Padding do corpo (topo/lados/base) | 30 / 56 / 32 | 30 / 56 / 32 | 28 / 32 / 32 | 20 / 16 / 24 |
| Espaço entre blocos do corpo | 24px | 24px | 24px | 16px |
| Título "Para onde você vai?" | 44px/800 | 44px/800 | 44px/800 | 32px/800 |
| Colunas da grade | 2 iguais | 2 iguais | 1 | 1 |
| Linhas da grade | 1 (estica na altura) | 1 (estica na altura) | 2: Fábrica `minmax(0,1fr)` (fica com a sobra), RH `auto` | 2, altura natural |
| Ordem dos cartões | Fábrica à esquerda, RH à direita | idem | Fábrica em cima (maior), RH embaixo | Fábrica em cima, RH embaixo |
| Espaço entre cartões | 24px | 24px | 24px | 16px |
| Largura de cada cartão (calculada) | ~652px | ~572px | ~736px | ~358px |
| Padding / raio do cartão | 28px / 24px | 28px / 24px | 28px / 24px | 20px / 20px |
| Espaço interno do cartão (gap) | 20px | 20px | 20px | 16px |
| Ícone do cartão | 64×64 (svg 32), raio 16 | 64×64 | 64×64 | 48×48 (svg 24), raio 12 |
| Nome do cartão | 42px/800 | 42px/800 | 42px/800 | 30px/800 |
| Subtítulo do cartão | 18px | 18px | 18px | 15px |
| Círculo da seta | 56×56 (svg 26) | 56×56 | 56×56 | 44×44 (svg 26) |
| Alvo de toque do cartão | cartão inteiro (~652 × altura da grade) | cartão inteiro (~572 × ~510) | cartão inteiro (~736 de largura) | cartão inteiro (~358 de largura) |
| Rótulos em caixa alta | 14px/700 | 14px/700 | 14px/700 | 14px/700 (o de Fábrica tende a quebrar em 2 linhas) |
| Linha de setor: padding | 14 / 18 | 14 / 18 | 14 / 18 | 12 / 14 |
| Linha de setor: nome | 19px/600 | 19px/600 | 19px/600 | 17px/600 |
| Linha de setor: número `q` | 26px | 26px | 26px | 22px |
| Linha de setor: "/ 270 · status" | 17px, na mesma linha do nome | 17px, mesma linha | 17px, mesma linha | 15px; quebra para a linha de baixo quando não cabe (`flex-wrap`) |
| Barra de progresso | 6px | 6px | 6px | 6px |
| Item do RH: padding | 12 / 16 | 12 / 16 | 12 / 16 | 10 / 12 |
| Item do RH: ícone | 44×44 | 44×44 | 44×44 | 40×40 |
| Item do RH: título / descrição | 19px / 15px | 19px / 15px | 19px / 15px | 17px / 14px |
| Posição da lista no cartão | encostada na base do cartão | encostada na base | Fábrica: encostada na base (sobra espaço acima); RH: justa | natural |
| Rodapé | linha: botão à esquerda, nota à direita | idem | idem (quebra se faltar espaço, `flex-wrap`) | coluna: botão em largura total, nota centralizada embaixo |
| Botão "Configurar este tablet" | 52px de altura, largura do texto | 52px | 52px | 52px, largura total (~358px) |
| Nota do rodapé | 15px, à direita | 15px, à direita | 15px, à direita | 15px, centralizada |
| O que é fixo / o que rola | nada rola; grade estica para caber em 100vh | nada rola (sobra pouca folga: grade ~510px para ~470px de conteúdo no cartão RH) | nada rola; Fábrica absorve a sobra | página inteira rola; cabeçalho **não** é fixo (rola junto) |
| Navegação | sem barra/abas; 3 links + Sair | idem | idem | idem |
| Detalhe (painel/folha) | não existe | não existe | não existe | não existe |
| Destino de "RH e gestão" | RH · Agora (PC) | RH · Agora (PC; não há quadro RH de tablet horizontal) | RH · Agora (tablet 820) | RH · Agora (celular) |

Observações de medida:
- Menor alvo de toque: "Sair" com 44px no celular e 48px nas demais. "Configurar este tablet" tem 52px em todas.
- Não há `max-width` no conteúdo: em monitores maiores que 1440 os cartões crescem sem limite.
- Entre 720 e 1023px vale o arranjo de tablet em pé; entre 1024 e 1279px vale o de duas colunas (cartões mais estreitos que no 1280, o texto do status pode quebrar).
- Tipografia: Barlow (400/500/600/700) para texto e Barlow Semi Condensed (600/700/800) para títulos e números; `font-variant-numeric: tabular-nums`.
- Tema escuro: fundo `#0A0E15`, cartões `#111824`, bordas `#26334A` / `#1C2738`, texto `#EEF2F8`, secundário `#B7C2D3` / `#A3B0C2`, azul de ação `#2563EB`, alerta âmbar `#FCD34D`.

---

## 9. Fase futura, desabilitado ou placeholder

- Nada está marcado como "fase futura", desabilitado ou "[ ]" nesta tela.
- Placeholders de fato:
  - data e hora fixas ("Terça, 03/11 · 15:36");
  - números e status dos setores fixos no script;
  - nota do rodapé fixa ("Este aparelho ainda não está ligado a um setor"), sem a variante de aparelho vinculado;
  - prop `estado` declarada e não usada;
  - "Sair" é só um link para o login (sem encerrar sessão).

---

## 10. Divergências entre a versão antiga (`Hub.dc.html`) e a nova (`Tela-Area-*`)

| Ponto | `Hub.dc.html` (antiga) | `Tela-Area-*` (nova) |
|---|---|---|
| Tamanho | fixo 1280×800, estilos inline | responsivo, classes `.hb-*` e media queries |
| Subtítulo do RH | "Tempo real, histórico, metas, OS e estoque" | "Agora, desempenho, pedidos e pausas" |
| Conteúdo do cartão RH | vazio abaixo do topo | lista "O QUE TEM LÁ" com 4 itens |
| Destino do RH | `Painel-RH.dc.html` (arquivo que não existe mais no projeto) | `RH2-Agora*` |
| Status da Injetora | "rodando" (neutro) | "parada sem motivo · 12 min" (âmbar) |
| Status de Teste & Embalagem | "pausado" | "pausado · manutenção" |
| Data no celular | não existe | linha própria acima do título |
| Links | `Login`, `Setores`, `Tablet` | `Tela-Entrar`, `Tela-Setores`, `Tela-ConfigTablet` |
| Seta do cartão | svg 28px | svg 26px |

Nenhuma regra da versão antiga foi perdida; a nova só acrescenta (parada sem motivo com minutos, motivo da pausa, lista do RH). Vale a nova. Atenção: as telas RH2 ainda apontam o logo para `Hub.dc.html`; no sistema real o destino é esta tela.

---

## 11. Dúvidas reais (o protótipo não decide)

1. **Perfis e acesso**: o login tem só uma senha. Operador, RH e admin veem os dois cartões? Ou o hub esconde/bloqueia "RH e gestão" para quem não é RH? Existe mais de uma senha (uma por perfil)?
2. **Tablet vinculado**: a configuração diz que o aparelho vinculado "abre direto no setor certo". Então o hub é pulado depois do login? Se o hub for aberto num aparelho vinculado, o que o rodapé mostra (ex.: nome do setor e "Abrir a Montagem")?
3. **Rodapé em PC e celular**: "Configurar este tablet" e "Este aparelho ainda não está ligado a um setor" aparecem em todas as larguras. Faz sentido mostrar isso no PC do RH e no celular, ou só em tablet?
4. **Caminho para o Admin**: não há link para "Admin › Tablets" em nenhuma tela. Entra por onde (terceiro cartão no hub, link no rodapé, URL direta)? Quem pode?
5. **Meta por setor**: o rótulo diz "META 270 POR SETOR", mas o RH pode definir metas diferentes por setor. Se forem diferentes, o rótulo e o "/ 270" passam a mostrar a meta de cada linha?
6. **Meta batida**: a barra trava em 100% e o texto fica "387 / 270 · em produção". Deve haver indicação de meta batida (texto/verde) como na tela Setores?
7. **Atualização dos números**: os dados do cartão Fábrica se atualizam sozinhos com a tela aberta (intervalo? tempo real?) ou só ao carregar?
8. **Sem conexão / erro**: o que mostrar no cartão Fábrica quando não dá para buscar a produção (o app é offline-first no tablet)? Último valor conhecido com horário? Traços?
9. **"Sair"**: pede confirmação? Num tablet vinculado, sair desfaz o vínculo ou só encerra a sessão?
10. **Itens do cartão RH**: os quatro itens são só descritivos (o cartão inteiro leva a "Agora"). Devem virar atalhos diretos para Desempenho, Pedidos e estoque e Pausas?
11. **Status com vários motivos**: o hub mostra o motivo resumido ("manutenção"). É sempre a categoria de primeiro nível? E quando o texto não couber na linha (celular)?
12. **Fuso e formato da data**: "Terça, 03/11 · 15:36" segue o relógio do aparelho ou o do servidor (fuso da fábrica)?
13. **Tela larga**: há largura máxima do conteúdo acima de 1440px?
14. **Destino do RH no tablet horizontal**: o RH só tem quadros em 1440, 820 e 390. Em 1280 de largura vale o arranjo de PC?
