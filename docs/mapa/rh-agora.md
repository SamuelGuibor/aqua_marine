# Mapa do protótipo · RH · Agora (tempo real + detalhe por setor)

Chave da família: `rh-agora`

Fontes lidas (todas em `artifact-files/.../project/`):

| Quadro | Tamanho no canvas | Props que mudam |
|---|---|---|
| `RH2-Agora` | 1440 × 1380 | `largura: "pc"`, `foco: ""` |
| `RH2-Agora-Tablet` | 820 × 1270 | `largura: "tablet"`, `foco: ""` |
| `RH2-Agora-Tablet-Montagem` | 820 × 1460 | `largura: "tablet"`, `foco: "mon"` |
| `RH2-Agora-Tablet-Teste` | 820 × 1260 | `largura: "tablet"`, `foco: "tes"` |
| `RH2-Agora-Celular` | 390 × 880 | `largura: "celular"`, `foco: ""` |
| `RH2-Agora-Celular-Injetora` | 390 × 844 | `largura: "celular"`, `foco: "inj"` |
| `RH2-Agora-Celular-Montagem` | 390 × 980 | `largura: "celular"`, `foco: "mon"` |
| `RH2-Agora-Celular-Teste` | 390 × 844 | `largura: "celular"`, `foco: "tes"` |

Os oito arquivos são **o mesmo componente, byte a byte**, exceto o `<title>` e a linha de `data-props` (conferido com `diff`). O quadro `RH2-Agora-Celular` só tem a mais um `<div data-dc-group>` em volta, sem efeito. Não há versão anterior desta tela entre os arquivos (a antiga "RH · tempo real" era `Painel-RH.dc.html`, que não está no pacote; o `Hub.dc.html` antigo ainda aponta para ela). As regras que a versão anterior tinha foram recuperadas dos quadros `Briefing-RH-1..4`, que descrevem o pedido que gerou esta tela; divergências entre briefing e protótipo final estão na seção 11.

Nenhum texto dos arquivos tenta dar instrução a quem lê; os briefings são instruções para "o outro chat" que desenhou as telas, tratadas aqui só como especificação.

---

## 1. Propósito e quem usa

- Tela **"Agora"** da área **RH e gestão** (selo "RH" ao lado do logo). Pergunta que responde (briefing): *"A fábrica está bem agora? Onde preciso agir?"*
- Usuário: **RH / gestão**, em PC (1440), tablet em pé (820) ou celular (390). Não é tela do operador.
- É **somente leitura** sobre a produção do dia em andamento: mostra o que os tablets dos 3 setores estão lançando. As únicas gravações possíveis a partir dela são pelos painéis sobrepostos **Metas** (editar metas) e **Exportar** (gerar relatório), que são compartilhados com Desempenho e Pedidos (mesmo código nas três telas, segundo comentário do script).
- Substitui a antiga tela "Tempo real" e a parte "hoje" da antiga tela "Metas".
- Dados de exemplo: terça 10/11/2026, relógio 09:49.

## 2. Blocos da tela, de cima para baixo

### 2.1 Barra de navegação (`header.r2-top`)

- Logo AquaPulse (219 × 30) + selo **"RH"**. Link para `Hub.dc.html` (no sistema novo: tela de escolher área, `Tela-Area-*`).
- Abas (nav "Telas do RH"), cada uma com ícone + rótulo: **"Agora"** (ativa, `aria-current="page"`), **"Desempenho"**, **"Pedidos e estoque"** (rótulo curto **"Pedidos"**), **"Pausas"**.
- Ações: botão **"Metas"** e botão **"Exportar"** (abrem os painéis).
- Relógio **"09:49"**.
- No celular, as ações somem e entra o botão **"⋯"** (`aria-label="Metas e Exportar"`), que abre um menu com "Metas" e "Exportar".

### 2.2 Cabeçalho da página

- Título `h1` **"Agora"**.
- Linha de apoio: chip do dia **"ter 10/11"** + ponto verde pulsando com **"atualizado 09:49:57"** (hora da última atualização dos dados, com segundos).
- Filtro **"MEDIDA"** em segmentos: **"Todas"**, **"2 m"**, **"3 m"**, **"4 m"**, **"5 m"** (title: "Todas as medidas", "2 m · 1 m²", "3 m · 1,5 m²", "4 m · 2 m²", "5 m · 2,5 m²"). Padrão: "Todas".
- No celular o segmento some e entram: chip do filtro ativo (ex.: **"3 m ×"**, `aria-label="Tirar filtro 3 m"`) e o botão **"Filtros"**.

### 2.3 Seção "Produção hoje" (destaque da tela)

- Título `h2` **"Produção hoje"** e, à direita, botão-legenda **"% da meta · 270 por dia"** (mini anel + texto; abre o painel Metas).
- **3 cards de etapa** ligados por setas (→), um por setor, na ordem do fluxo. Cada card é um botão inteiro:
  - Barra colorida do setor (4 px no topo; no celular vira faixa vertical à esquerda).
  - Número do passo em círculo (1, 2, 3) + nome em caixa alta: **"INJETORA"**, **"MONTAGEM"**, **"TESTE & EMBALAGEM"** (no tablet o terceiro usa o nome curto **"TESTE & EMB."**).
  - Estado: ponto + texto. Exemplo: Injetora **"Rodando"**, Montagem **"Rodando"**, Teste & Embalagem **"Pausado · café · 4 min"**.
  - Anel de progresso com o % da meta do dia no centro (28%, 60%, 44%).
  - Número grande + referência + unidade: **"76 / 270 boas"**, **"161 / 270 montadas"**, **"120 / 270 embaladas"**.
  - Só na etapa 3: faixa de teste **"139 testadas"** · **"86,3% aprovadas"** + barra dividida verde (aprovadas) × vermelho (reprovadas).
  - Chips por medida no rodapé do card: Injetora "3 m 76"; Montagem "2 m 44" e "3 m 117"; Teste & Embalagem "3 m 120" e **"pacotes 12"**. Sem dados: chip tracejado "sem produção" ou "sem 2 m".
  - `aria-label` completo, ex.: "Injetora: 76 placas boas de 270, 28% da meta do dia. Rodando. Ver Injetora."

### 2.4 Números do topo (`section "Números de hoje"`) · 4 cards

| Rótulo | Valor de exemplo | Nota abaixo | Dica (botão "i") |
|---|---|---|---|
| **"Área hoje"** | 513,5 m² | "3 setores somados" | "Placas boas da Injetora, montadas e embaladas, em m² (2 m = 1 m², 3 m = 1,5 m², 4 m = 2 m², 5 m = 2,5 m²)." |
| **"Eficiência injetora"** | 96,2% | "76 boas · 3 perdas" (vazio: "sem placas") | "boas ÷ (boas + perdas)" |
| **"Aprovação no teste"** | 86,3% | "120 de 139" (vazio: "sem testes") | "embaladas ÷ testadas" |
| **"Estoque 3 m"** | 384 pacotes | "3.840 placas" (sem dado: valor "[ ]", nota "sem dados") | "Pacotes de 10 placas disponíveis nesta medida." |

Cada card tem ícone, rótulo, botão de informação (abre a dica dentro do card; também está no `title` e no `aria-label`).

### 2.5 Seção "Setores" · 3 painéis de detalhe

Título `h2` **"Setores"**; quando há setor em foco aparece o botão **"Ver todos"** (só PC). No tablet aparece um seletor em segmentos (**"Injetora"**, **"Montagem"**, **"Teste & Embalagem"**, cada um com quadradinho da cor). No celular a seção inteira só existe como tela cheia (ver 4.3).

Cabeçalho comum de cada painel: quadrado da cor + nome do setor, estado (ponto + texto), botão **"meta 270"** (abre Metas; `aria-label` "Meta de Injetora: 270 por dia. Abrir metas") e uma etiqueta à direita.

**Injetora** (etiqueta: **"lote 3 m · 1,5 m²"**)
- **"PLACAS"**: barra dividida boas (verde) × perdas (vermelho) × vazios (âmbar), com legenda "76 boas · 3 perdas · 0 vazios".
- **"TEMPO"**: barra dividida ativa (verde) × parada (âmbar), legenda **"2h33 ativa"** · **"0s parada"**.
- 3 ladrilhos: **"Ciclos" 156**, **"Ciclos perdidos" 4** (tom vermelho claro), **"Área" 114 m²**.

**Montagem** (etiqueta: relógio + **"última 09:49:12"**)
- **"OPERADORAS"**: uma linha por operadora, da maior para a menor, com barra horizontal (proporcional à maior) e total: Helena 65, Maiara 54, Maria 39, Daniel 3. Operadora com produção sem mesa: barra âmbar + aviso **"sem mesa"** com ícone de alerta (Daniel). `title` da linha traz o detalhe: "Mesa 1 · 2 m · 1 m² · 44 / Mesa 2 · 3 m · 1,5 m² · 21".
- **"MESAS"**: grade das 6 mesas. Ocupada: "Mesa 1" + quantidade (44), operadora (Helena) + chip da medida ("2 m"). Vaga: borda tracejada âmbar, ícone de alerta e texto **"sem operadora"** (Mesas 5 e 6).
- 2 ladrilhos: **"Área" 219,5 m²**, **"Operadoras" 4**.

**Teste & Embalagem** (etiqueta: relógio + **"última 09:45:41"**)
- **"RESULTADO"** + "139 testadas": barra dividida embaladas (verde) × caninho (vermelho claro) × cabeçote (vermelho), legenda "120 embaladas · 7 caninho · 12 cabeçote".
- 4 ladrilhos (2 × 2): **"Reprovadas" 19**, **"Perda" 13,7%**, **"Embaladas" 120**, **"Pacotes" 12**.

Painel sem dados: caixa tracejada com ícone de bandeja e o texto **"Sem produção hoje"** ou **"Sem 2 m hoje"** (nome da medida filtrada).

### 2.6 Sobreposições

- **Folha "Filtros"** (celular): título "Filtros", X de fechar, rótulo "MEDIDA", lista de 5 opções com nome longo e marca de selecionado, botão **"Ver resultado"**.
- **Menu "Mais opções"** (celular): "Metas", "Exportar".
- **Painel "Metas"** e **painel "Exportar"**: ver seção 5. Têm família própria no canvas (`RH2-Painel-Metas*`, `RH2-Painel-Exportar*`), mas o código está embutido nesta tela.

## 3. Ações e o que cada uma faz no script

Estado do componente: `tam` (medida: 'todas' | 2 | 3 | 4 | 5), `foco` (null | 'inj' | 'mon' | 'tes'), `folha`, `menu`, `dica` (id do número com dica aberta), mais o estado dos painéis (`painel`, `pmMeta`, `pmDias`, `pmBase`, `pmTam`, `pmSalvo`, `pxTipo`, `pxPer`, `pxTam`, `pxSet`, `pxSec`, `pxFmt`, `pxMail`, `pxPrev`).

| Ação | Efeito |
|---|---|
| Segmento **MEDIDA** (PC/tablet) ou opção na folha (celular) | `tam = x`. Recalcula tudo na hora: etapas, anéis, números, painéis. Na folha a escolha já aplica; a folha continua aberta até "Ver resultado", X ou toque no fundo. |
| Chip do filtro ativo (celular) | `tam = 'todas'`. |
| Botão **"Filtros"** (celular) | abre a folha de baixo; fecha o menu se estiver aberto. |
| Botão **"⋯"** (celular) | alterna o menu Metas/Exportar; fecha a folha. Toque no fundo fecha. |
| Toque num **card de etapa** | `foco = setor`; tocar de novo no mesmo card desfaz (`foco = null`). PC: realça o painel do setor e esmaece os outros dois. Tablet: troca o painel visível. Celular: abre o setor em tela cheia. |
| **"Ver todos"** (PC) | `foco = null`. |
| Seletor de setor (tablet) | `foco = k` (sem alternar; sempre há um selecionado, padrão Injetora). |
| **"‹ Agora"** (celular, tela cheia do setor) | `foco = null`, volta à lista. |
| Botão **"i"** de cada número | abre/fecha a dica daquele card; só uma aberta por vez. |
| **"% da meta · 270 por dia"**, **"meta 270"**, **"Metas"** (barra ou menu) | abre o painel Metas e fecha o menu. |
| **"Exportar"** (barra ou menu) | abre o painel Exportar já com o contexto da tela: `pxTam` = medida filtrada em Agora, tipo "Relatório mensal", período "Novembro 2026", todos os setores. |
| Abas da navegação | navegam para Desempenho, Pedidos e estoque, Pausas na mesma largura. |

Não há nesta tela: confirmação, desfazer de produção, edição de lançamento, nem ação sobre alerta. Tudo é leitura.

## 4. Estados

### 4.1 Dia em andamento (padrão)
Como descrito na seção 2.

### 4.2 "Sem produção hoje" (prop `estado`)
- As 3 etapas: valor 0, anel 0%, estado **"Sem produção hoje"** (texto cinza `#A3B0C2`, ponto `#4B5B78`), chip tracejado "sem produção". A faixa de teste da etapa 3 some.
- Números: Área "0 m²"; Eficiência "—" com nota "sem placas"; Aprovação "—" com nota "sem testes"; Estoque continua "384 pacotes" (estoque não depende do dia).
- Painéis: os três mostram a caixa vazia "Sem produção hoje"; as etiquetas "lote…" e "última…" somem. O cabeçalho do painel continua com estado e botão "meta 270".

### 4.3 Setor em foco
- **PC**: card da etapa com `aria-pressed="true"` (fundo `#16223A`, borda `#60A5FA`); painel do setor com borda azul e fundo `#121D2E`; os outros dois com opacidade 0,45; botão "Ver todos".
- **Tablet**: card da etapa realçado; só o painel do setor aparece; seletor marca o setor. Sem foco, o painel visível é Injetora.
- **Celular**: a seção Setores vira camada fixa de tela cheia (`position: fixed; inset: 0; z-index: 40`), cobrindo inclusive a barra de abas de baixo. Conteúdo: cabeçalho fixo com **"‹ Agora"** + quadrado da cor + nome do setor; card-resumo da etapa (mesmo conteúdo do card de etapa, em tamanho grande: anel 100 px, número 60 px, faixa de teste e chips); depois o painel do setor.

### 4.4 Filtro de medida ativo
- Somas consideram só a medida escolhida. Setor sem aquela medida: card com 0, chip tracejado "sem 2 m", painel com "Sem 2 m hoje".
- Mesas: as 6 continuam aparecendo; a mesa ocupada com outra medida fica esmaecida (opacidade 0,4). Mesas vagas não mudam.
- Operadoras: só as que produziram a medida.
- Card de estoque passa a ser "Estoque 2 m" etc.; sem dado mostra "[ ]" e "sem dados".
- O bloco "TEMPO" da Injetora e as etiquetas "lote…"/"última…" são fixos no protótipo (não reagem ao filtro).

### 4.5 Estados do setor (ponto + texto)
- **"Rodando"**: verde (`#86EFAC` texto, `#22C55E` ponto).
- **"Pausado · café · 4 min"**: âmbar (`#FCD34D` / `#F59E0B`). Formato: "Pausado · {motivo} · {minutos} min".
- **"Sem produção hoje"**: cinza.

### 4.6 Avisos embutidos (não há faixa de alertas)
- Operadora com placas **"sem mesa"** (âmbar, na linha da operadora).
- Mesa **"sem operadora"** (card tracejado âmbar).
- Setor pausado (texto do estado).

### 4.7 Estados que o protótipo NÃO desenha
Carregando, erro ao buscar dados, sem conexão/dado desatualizado, tablet do setor offline, dia já fechado, setor parado sem motivo informado (aviso de parada), meta batida (>100%: o anel trava em 100% por `Math.min`), sem permissão.

## 5. Painéis sobrepostos (mesmo código em Agora, Desempenho e Pedidos)

### 5.1 Painel "Metas"
- Abre à direita com fundo escurecido; título "Metas"; X (no celular vira **"‹ Voltar"**).
- **"Dias úteis"** · "novembro · 15 restantes" + contador −/+ (exemplo 21). Limites: mínimo = dias já passados + 1 (6 + 1 = 7), máximo 31.
- Um card por setor (borda de cima na cor): nome + o que conta (**"placas boas"**, **"placas montadas"**, **"placas embaladas"**); **"POR DIA"** com contador −/+ (passo 10, mínimo 10, sem máximo); **"MÊS"** = por dia × dias úteis ("270 × 21 dias" = 5.670); barras **"hoje"** (76 / 270, 161 / 270, 120 / 270) e **"mês"** (1.504, 1.696, 1.440 / 5.670); linha **"faltam 4.166"** · **"precisa 278 por dia"** (Montagem 3.974 → 265; Teste 4.230 → 282).
- **"Meta por tamanho"** *opcional*: seção que abre com 4 campos numéricos (2 m · 1 m², 3 m · 1,5 m², 4 m · 2 m², 5 m · 2,5 m²), `step=10`, placeholder "—". **Campos sem lógica ligada.**
- Rodapé: cadeado + **"Só o RH altera · vai para os tablets"**; **"Desfazer"** (desabilitado enquanto nada mudou; volta ao último valor salvo); **"Salvar metas"** (grava a base e mostra **"Metas salvas"**; qualquer mudança depois apaga o aviso).
- No protótipo, salvar a meta **não** muda os "270" da tela Agora (constante `META = 270` separada). No sistema real, os anéis, "/ 270", "meta 270" e "% da meta · 270 por dia" devem ler a meta salva.

### 5.2 Painel "Exportar"
- Painel largo; no PC formulário à esquerda (400 px) e prévia do documento à direita.
- **"TIPO"** (5 blocos com ícone): "Relatório mensal", "Produção por operadora", "Perdas e defeitos", "Pacotes e estoque", "Fechamentos e correções".
- **"PERÍODO"**: "Novembro 2026", "Outubro 2026", "Últimos 7 dias", "Escolher datas" (mostra campos "De" e "Até", sem lógica).
- **"MEDIDA"**: "Todas", "2 m", "3 m", "4 m", "5 m". **"SETORES"**: 3 chips liga/desliga. **"SEÇÕES"**: 6 caixas ("Resumo do período", "Por setor e meta", "Por medida", "Perdas e defeitos", "Operadoras", "Pontos de atenção"). **"FORMATO"**: "PDF", "Excel", "CSV".
- Caixa **"Enviar todo dia 1º por e-mail para o RH"** (só alterna).
- Prévia em página branca: logo, título do tipo, período, chips de filtro, 4 KPIs, tabela "Por setor e meta do mês", "Por medida", "Montagem por operadora", "Perdas e defeitos", "Pontos de atenção", rodapé "Gerado em 10/11/2026 às 09:49 · página 1 de 2". Sem dados: "Sem dados de outubro" ou "Escolha as datas".
- Rodapé: **"Fechar"** (PC/tablet) ou **"Ver prévia" / "Formulário"** (celular) + **"Baixar PDF" / "Baixar Excel" / "Baixar CSV"** (rótulo segue o formato; **botão sem ação no protótipo**).

## 6. Regras de negócio e contas

| Regra | Conta | Valor de exemplo | Configurável? |
|---|---|---|---|
| Meta do dia por setor | constante usada em anel e referência | 270 placas/dia, igual nos 3 setores | Sim: painel Metas, por setor, passo 10, mínimo 10 |
| Dias úteis do mês | contador | 21 (6 passados, 15 restantes) | Sim: painel Metas, 7 a 31 |
| Meta do mês | meta/dia × dias úteis | 5.670 | Derivada |
| Falta / precisa por dia | `max(0, metaMês − feito)`; `ceil(falta ÷ dias restantes)`; "—" se não há dias restantes | 4.166 → 278 | Derivada |
| % da meta (anel) | `min(100, round(valor ÷ meta × 100))` | 76 → 28%; 161 → 60%; 120 → 44% | Trava em 100% |
| O que conta em cada setor | Injetora = placas **boas**; Montagem = **montadas**; Teste & Embalagem = **embaladas** | 76 / 161 / 120 | Regra fixa |
| Área por placa | 2 m = 1 m²; 3 m = 1,5 m²; 4 m = 2 m²; 5 m = 2,5 m² | — | Tabela de medidas (provável cadastro) |
| Área hoje | área das boas (Injetora) + montadas + embaladas, **os 3 setores somados** | 114 + 219,5 + 180 = 513,5 m² | Regra a confirmar (a mesma placa conta até 3 vezes) |
| Eficiência injetora | boas ÷ (boas + perdas); vazios não entram | 76 ÷ 79 = 96,2% | Regra fixa |
| Aprovação no teste | embaladas ÷ testadas | 120 ÷ 139 = 86,3% | Regra fixa |
| Reprovadas | testadas − embaladas | 19 (= caninho 7 + cabeçote 12) | Derivada |
| Perda no teste | reprovadas ÷ testadas | 13,7% | Derivada |
| Testadas | embaladas + defeitos (caninho + cabeçote) (comentário do script) | 139 | Regra fixa |
| Pacote | 10 placas; pacotes do dia = embaladas ÷ 10 | 12 | Constante 10 (ver dúvida sobre fração) |
| Estoque | pacotes disponíveis por medida; placas = pacotes × 10 | 3 m: 384 pacotes = 3.840 placas | Dado de estoque |
| Estoque com filtro "Todas" | mostra a medida 3 m | "Estoque 3 m" | Critério não explicado |
| Barras das operadoras | largura = total da operadora ÷ total da maior | Helena 65 = 100% | — |
| Operadora "sem mesa" | lançamento com mesa = 0 | Daniel, 3 placas de 3 m | — |
| Mesas | 6 fixas; mostra a 1ª linha de produção daquela mesa | Mesas 1 a 4 ocupadas, 5 e 6 vagas | Quantidade provavelmente configurável (tela Mesas) |
| Partes da barra PLACAS | boas, perdas, vazios sobre (boas + perdas + vazios) | 76 / 3 / 0 | — |
| Ciclos / ciclos perdidos | contadores da injetora | 156 / 4 | — |
| Tempo ativa × parada | fixo no protótipo | 2h33 / 0s | Vem dos eventos de pausa |
| Formato de número | `pt-BR` (milhar com ponto, decimal com vírgula), 1 casa nos percentuais | 86,3% | — |
| Alvo de toque mínimo (briefing) | 40 px PC, 44 px tablet, 48 px celular | — | Regra de projeto |
| Texto mínimo | 14 px; contraste 4,5:1 | — | Regra de projeto |

Dados de exemplo do dia (base das contas):
- Injetora, 3 m: boas 76, ciclos 156, perdas 3, vazios 0, ciclos perdidos 4.
- Montagem: Helena · Mesa 1 · 2 m · 44; Helena · Mesa 2 · 3 m · 21; Maiara · Mesa 3 · 3 m · 54; Maria · Mesa 4 · 3 m · 39; Daniel · sem mesa · 3 m · 3. Total 161.
- Teste & Embalagem, 3 m: testadas 139, embaladas 120, caninho 7, cabeçote 12.
- Estoque: só 3 m = 384 pacotes.
- Mês (painel Metas/Exportar): Injetora 1.504, Montagem 1.696, Teste & Embalagem 1.440 (novembro até 09/11, 5 dias com produção).

## 7. Entidades e campos implícitos

Para a tela funcionar de verdade, o banco precisa responder, **por dia e por medida**:

- **Setor**: chave (`inj`, `mon`, `tes`), nome, cor, ordem (1, 2, 3), o que conta para a meta.
- **Medida**: comprimento (2, 3, 4, 5 m), área por placa (m²), rótulo ("3 m · 1,5 m²").
- **Meta**: setor, meta por dia, vigência; opcional por medida; **dias úteis do mês**; quem alterou e quando (o painel diz "Só o RH altera").
- **Produção da Injetora (dia × medida)**: placas boas, perdas, vazios, ciclos, ciclos perdidos; lote/medida atual; tempo ativo e parado.
- **Produção da Montagem**: lançamentos por operadora × mesa × medida × quantidade; horário do último lançamento.
- **Mesa**: número (1 a 6), operadora atual, medida atual, quantidade do dia.
- **Operadora**: nome; vínculo com mesa (pode estar sem mesa).
- **Teste & Embalagem (dia × medida)**: testadas, embaladas, defeito caninho, defeito cabeçote; pacotes fechados; horário do último lançamento.
- **Pausa**: setor, motivo ("café"), início, fim (para "Pausado · café · 4 min" e para o tempo parado).
- **Estoque**: pacotes disponíveis por medida (10 placas por pacote).
- **Estado do setor**: derivado (Rodando / Pausado / Sem produção hoje).
- **Carimbo de atualização**: hora da última leitura ("atualizado 09:49:57").

Eventos que **esta tela grava**: nenhum de produção. Pelos painéis: alteração de metas (meta por dia de cada setor, dias úteis, opcionalmente por medida) e geração/agendamento de relatório (tipo, período, medida, setores, seções, formato, envio mensal por e-mail).

Eventos que ela **lê** (gravados pelos tablets): ciclos e placas da injetora, lançamentos de montagem por mesa, testes/embalagens/defeitos, pacotes fechados, pausas com motivo, vínculo operadora-mesa.

## 8. Navegação

| Origem | Destino |
|---|---|
| Logo + selo RH | `Hub.dc.html` (versão nova: `Tela-Area-*`, escolher área) |
| Aba "Agora" | `RH2-Agora{-Tablet,-Celular}` (a própria) |
| Aba "Desempenho" | `RH2-Desempenho{suf}` |
| Aba "Pedidos e estoque" / "Pedidos" | `RH2-Pedidos{suf}` |
| Aba "Pausas" | `RH2-Pausas{suf}` |
| "Metas", "meta 270", "% da meta · 270 por dia" | painel Metas sobre a tela (sem trocar de rota) |
| "Exportar" | painel Exportar sobre a tela |
| Card de etapa | foco no setor (painel na própria tela; tela cheia no celular) |
| Chegada | `Tela-Area-PC` aponta "RH e gestão" para `RH2-Agora` + sufixo da largura: Agora é a tela inicial do RH |

O sufixo de largura (`''`, `-Tablet`, `-Celular`) existe só para ligar os quadros do canvas; no sistema real é uma rota única e responsiva. Sugestão de implementação: o setor em foco e o painel aberto como parâmetros de URL (o protótipo já os trata como props `foco`, `painel`, `previa`), para o "voltar" do celular funcionar.

## 9. Responsividade, parâmetro por parâmetro

**Mecanismo**: um único componente e um único CSS, com duas media queries: `@media (max-width: 1199px)` (tablet) e `@media (max-width: 767px)` (celular). PC é 1200 px ou mais. A prop `largura` **não** muda o arranjo: só escolhe o sufixo dos links entre quadros; o arranjo vem da largura real do quadro (1440, 820, 390). O detalhe do setor usa classes calculadas no script (`foco`, `sel`, `tsel`, `dim`, `aberto`) que o CSS interpreta de forma diferente em cada faixa. Tablet deitado (1180) cai no arranjo de tablet; iPad de 12,9" deitado (1366) cai no de PC.

### Tabela parâmetro × largura

| Parâmetro | PC · 1440 (≥ 1200) | Tablet em pé · 820 (768 a 1199) | Celular · 390 (≤ 767) |
|---|---|---|---|
| Barra de navegação | 1 linha, 68 px: logo, abas, Metas/Exportar, relógio; largura máx. 1360 | 2 linhas: logo + relógio (60 px) / abas + Metas/Exportar (52 px) | Topo fixo (sticky) 60 px: logo, relógio, "⋯". Abas em barra fixa embaixo |
| Margem lateral da barra | 40 px | 24 px | 16 px à esquerda, 8 px à direita |
| Logo | 219 × 30 | 219 × 30 | 175 × 24 |
| Abas | texto 16 px + ícone 20 px, lado a lado, sublinhado 3 px na ativa, altura 68 | altura 52, padding 12 | grade de 4 colunas fixa no rodapé, ícone 22 px sobre rótulo 14 px, altura 62, traço em cima na ativa |
| Rótulo da 3ª aba | "Pedidos e estoque" | "Pedidos" (intenção; ver bug na seção 11) | "Pedidos" |
| Metas / Exportar | 2 botões com borda, altura 40 | 2 botões, altura 44 | escondidos; menu do "⋯" (48 × 48) com itens de 48 px |
| Relógio | 24 px | 24 px | 22 px |
| Padding do conteúdo | 24 / 40 / 64 px (topo/lados/base), máx. 1440 | 24 / 24 / 64 | 16 / 16 / 104 (folga para a barra de baixo) |
| Espaço entre seções | 22 px | 22 px | 18 px |
| Título "Agora" | 44 px | 44 px | 36 px |
| Linha dia + "atualizado" | 15 px, abaixo do título | igual | 14 px, linha própria abaixo de título + Filtros |
| Filtro Medida | segmentos à vista, à direita do título; botões 40 px, mín. 52 de largura | segmentos à vista, 44 px, rola na horizontal se faltar espaço | escondido; botão "Filtros" (48 px) abre folha de baixo; filtro ativo vira chip (48 px) |
| Folha de filtros | não existe | não existe | folha de baixo, cantos 18 px, opções de 48 px, "Ver resultado" 52 px, fundo 72% |
| Etapas: arranjo | 3 colunas, espaço 36 px | 3 colunas, espaço 28 px | lista vertical, espaço 16 px |
| Etapas: setas | → à direita do card (26 px) | → (deslocada 27 px) | ↓ entre os cards (20 px, à esquerda, sob o anel) |
| Card de etapa: forma | coluna: cabeçalho, anel + número, teste, chips | igual, mais apertado (padding 18/14/14) | linha em grade: anel · nome/estado · número · chevron (52 px / 1fr / auto / 20 px) |
| Barra de cor do setor | 4 px no topo | 4 px no topo | 4 px na lateral esquerda |
| Nome da etapa | caixa alta, 15 px, completo | caixa alta, nome curto ("TESTE & EMB.") | caixa alta, 14 px, completo |
| Anel da meta | 100 px, % 24 px | 72 px, % 18 px | 52 px, % 15 px |
| Número grande | 60 px | 44 px | 28 px (alinhado à direita) |
| Referência "/ 270" | 22 px | 18 px | 14 px |
| Unidade ("boas") | 15 px | 15 px | 14 px |
| Faixa de teste (etapa 3) | visível | visível | escondida na lista; aparece no resumo da tela cheia |
| Chips por medida | visíveis | visíveis | escondidos na lista; aparecem no resumo da tela cheia |
| Chevron no card | não | não | sim (indica que abre) |
| Números do topo | 4 em linha, espaço 14 px | 4 em linha | 2 × 2, espaço 10 px |
| Valor do número | 38 px | 38 px | 32 px |
| Botão "i" | 40 × 40 | 44 × 44 | 48 × 48 |
| Seção Setores | 3 painéis lado a lado, espaço 14 px | 1 painel por vez, largura total | fora do fluxo; abre em tela cheia |
| Escolha do setor | tocar na etapa realça; "Ver todos" limpa | seletor de 3 segmentos (44 px, rola de lado) + tocar na etapa | tocar na etapa abre; "‹ Agora" (48 px) fecha |
| Setor sem foco | os 3 iguais | mostra Injetora | lista de etapas, sem painel |
| Painéis fora do foco | opacidade 0,45 | escondidos | escondidos |
| Detalhe do setor | realce no lugar (não abre nada) | troca do painel no lugar | tela cheia fixa, rola por dentro, cabeçalho fixo de 60 px, resumo da etapa + painel |
| Resumo da etapa na tela cheia | não existe | não existe | card com anel 100 px e número 60 px |
| "Ver todos" | visível com foco | escondido | escondido |
| Linha de operadora | grade 72 px / barra / 44 px; barra 14 px; total 22 px | igual | igual |
| Grade de mesas | 3 colunas | 3 colunas | 2 colunas |
| Ladrilhos | 3 colunas (Injetora) ou 2 (Montagem, Teste) | igual | igual |
| Botão "meta 270" | mín. 40 px | mín. 44 px | mín. 48 px |
| Painel Metas | lateral direita, 480 px, com X | lateral direita, 480 px | tela cheia, "‹ Voltar" no lugar do X, contadores 48 px |
| Painel Exportar | lateral, até 1180 px; formulário 400 px + prévia ao lado | lateral, até 780 px; formulário em cima, prévia embaixo, rola junto | tela cheia; só formulário; "Ver prévia" troca para a prévia e "Formulário" volta |
| O que é fixo | nada (página rola inteira) | nada | topo (sticky), barra de abas (fixed), cabeçalho da tela cheia (sticky), rodapé dos painéis |
| Rolagem horizontal da página | nenhuma | nenhuma (só dentro dos segmentos) | nenhuma |
| Altura do quadro de referência | 1380 | 1270 (Montagem aberta 1460, Teste 1260) | 880 (lista); 844 / 980 / 844 com Injetora / Montagem / Teste abertos |

Larguras úteis calculadas: PC, 3 cards de etapa de cerca de 429 px; tablet 820, cerca de 239 px por card de etapa e 182 px por número; celular, 358 px de coluna única.

Acessibilidade presente no protótipo: `aria-pressed` nos cards e segmentos, `aria-label` descritivo nas etapas, `role="img"` com descrição nas barras divididas, `aria-expanded` nos botões de dica e menu, `role="dialog" aria-modal` nos painéis e na folha, foco visível de 3 px, `prefers-reduced-motion` desliga o pulso do ponto "ao vivo".

Tema: fundo `#0A0E15`, card `#111824`, navegação `#0D121B`, selecionado `#16223A`, borda `#26334A`, trilho `#1C2738`; Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`; boa `#22C55E`, atenção `#F59E0B`, perda `#DC2626`, ação `#2563EB`. Fontes Barlow (texto) e Barlow Semi Condensed 800 (números e títulos). Raios de 12 a 18 px.

## 10. Fase futura, desabilitado, "[ ]" e placeholders

- **"Meta por tamanho" (opcional)**: os 4 campos existem mas não guardam nem calculam nada.
- **Botão "Baixar PDF/Excel/CSV"**: sem ação.
- **"Escolher datas"**: campos "De"/"Até" sem lógica; prévia mostra "[início] a [fim]" e "Escolha as datas".
- **"Outubro 2026"**: prévia "Sem dados de outubro", subtítulo "[ ]".
- **"Enviar todo dia 1º por e-mail para o RH"**: só alterna a caixa.
- Prévia com medida filtrada: linhas por setor, operadoras, caninho e cabeçote aparecem como "[ ]".
- "Aprovação no teste em 86,6% (meta a definir)": não existe meta de aprovação.
- "página 1 de 2" e "Gerado em 10/11/2026 às 09:49": texto fixo.
- **Estoque de 2 m, 4 m e 5 m**: "[ ]" / "sem dados".
- **Faixa de alertas no topo** (pedida no briefing, até 3 alertas): não existe na tela final.
- Bloco **"TEMPO"** da Injetora, etiqueta **"lote 3 m · 1,5 m²"** e horários **"última …"**: valores fixos no HTML.
- Relógio, dia e "atualizado 09:49:57": fixos; não há lógica de atualização.
- Os "270" da tela não seguem o painel Metas (constante separada).
- Botão "Desfazer" do painel Metas começa desabilitado (habilita ao mudar algo).

## 11. Divergências entre briefing e protótipo final

| Assunto | Briefing (17/11) | Protótipo final |
|---|---|---|
| Etapas da linha | 4 etapas: Injetora, Montagem, Teste, Embalagem | **3 etapas**; Teste e Embalagem são um card só, com a faixa "testadas / aprovadas" dentro (bate com a regra do projeto: um setor só) |
| Alertas | faixa no topo com até 3 ("Daniel: 3 placas sem mesa", "Mesas 5 e 6 sem operadora", "Teste parado há 4 min") | sem faixa; os três aparecem embutidos (linha da operadora, cards de mesa, estado do setor) |
| Abas | 3 (Agora, Desempenho, Pedidos e estoque) | **4**: entrou "Pausas" |
| Etapas no tablet | grade 2 × 2 | 3 colunas em linha |
| Teste: barras | "aprovadas × reprovadas" e "caninho × cabeçote" (duas barras) | uma barra de 3 partes (embaladas × caninho × cabeçote) |
| Tamanho do número de destaque | 56 a 72 px | 60 px PC, 44 px tablet, 28 px celular |
| Rótulo do tablet na 3ª aba | "ícone e rótulo em cada aba" | CSS do tablet mostra `.r2-tc` mas esconde uma classe que não existe (`.r2-tl-txt`), então em 768 a 1199 px os dois rótulos ("Pedidos e estoque" e "Pedidos") ficam visíveis juntos. Parece defeito do protótipo; a intenção é "Pedidos" |
| Área hoje | antiga tela anotava 542 m² | 513,5 m² (valor adotado) |

## 12. Dúvidas reais para quem pediu

1. **Atualização**: de quanto em quanto tempo a tela busca dados (ou é push)? O que "atualizado 09:49:57" mostra quando a busca falha ou o RH está sem conexão? A tela do RH precisa funcionar offline ou só os tablets?
2. **Faixa de alertas**: fica de fora mesmo (como no protótipo) ou volta, como o briefing pedia? Se voltar, quais regras geram alerta e com que limite de minutos?
3. **Estado do setor**: como se decide "Rodando", "Pausado" e "Sem produção hoje"? "Pausado" vem só de pausa registrada no tablet, ou também de inatividade (X minutos sem lançamento)? Existe estado para pausa sem motivo, tablet offline, dia encerrado?
4. **Meta diferente por setor**: o rótulo "% da meta · 270 por dia" supõe a mesma meta nos três. Se forem diferentes, o que o rótulo mostra?
5. **Meta com filtro de medida**: ao filtrar "3 m", o anel compara as placas de 3 m com a meta total (270). Deve usar a "meta por tamanho" quando existir?
6. **Meta batida**: o anel trava em 100%. Mostrar 112%? Alguma marca de "meta batida"?
7. **Área hoje**: somar os 3 setores (a mesma placa conta em cada etapa) é o número que o RH quer? Ou a área de um setor de referência?
8. **Estoque com "Todas"**: por que 3 m? É a medida do lote atual, a mais vendida ou deveria ser o total de pacotes?
9. **Pacotes do dia**: `embaladas ÷ 10` dá fração (125 → 12,5). Usar a contagem de pacotes fechados?
10. **Reprovadas**: `testadas − embaladas` só é igual a caninho + cabeçote se toda placa aprovada já estiver embalada. Placa testada e ainda não embalada conta como quê?
11. **Mesas**: são sempre 6 ou vem do cadastro (tela Mesas)? Se uma mesa teve duas operadoras ou duas medidas no dia, o que o card mostra (o protótipo mostra a primeira)?
12. **"Sem mesa"**: em que situação uma operadora lança placa sem mesa? É erro a corrigir ou uso normal?
13. **Tempo ativa × parada**: conta a partir de quê (primeiro ciclo, início de turno)? Pausas de café entram como "parada"? Montagem e Teste não têm esse bloco: é de propósito?
14. **"Hoje"**: dia de calendário (fuso de São Paulo) ou turno? Existe mais de um turno?
15. **Quem acessa**: só o perfil RH? Admin vê? "Só o RH altera" as metas: precisa registrar quem alterou e desde quando a meta vale (não mudar o passado)?
16. **Detalhe no PC**: tocar na etapa só realça o painel. Não há caminho para o registro do dia nem para o histórico do setor. É suficiente?
17. **Celular com setor aberto**: o filtro de medida e as abas ficam inacessíveis (cobertos pela tela cheia). Aceitável?
18. **iPad deitado**: 1024 e 1180 px caem no arranjo de tablet (um painel por vez); 1366 px cai no de PC. O briefing deixou em aberto se o RH usa o tablet em pé ou deitado.
19. **Nomes de operadoras** aparecem só pelo primeiro nome (coluna de 72 px): como tratar homônimos e nomes longos?
20. **Exportar**: PDF gerado no servidor (Railway, pela stack)? O envio mensal por e-mail vai para quais endereços? "Fechamentos e correções" depende de auditoria que ainda não existe em nenhuma tela desta família.
