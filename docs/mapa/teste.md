# Mapa do protótipo · Teste & Embalagem · operador

Família `teste` · pacotes, defeitos, fechar pacote, aviso de parada.

Fontes lidas (pasta `project/` do artefato):

| Quadro | Tamanho no canvas | Props do componente | O que mostra |
|---|---|---|---|
| `Tela-Teste-PC` | 1440×900 (expand: fill) | `largura=pc`, `estado=""` | estado normal |
| `Tela-Teste-TabletH` | 1280×800 | `largura=h`, `estado=""` | estado normal (aparelho do operador) |
| `Tela-Teste-TabletH-Lote` | 1280×800 | `largura=h`, `estado=lote` | confirmação "fechar pacote e começar 4 m" aberta |
| `Tela-Teste-TabletH-Pausa` | 1280×800 | `largura=h`, `estado=pausa` | aviso amarelo de parada aberto (modo automático) |
| `Tela-Teste-TabletV` | 800×1280 | `largura=v`, `estado=""` | estado normal |
| `Tela-Teste-TabletV-Lote` | 800×1280 | `largura=v`, `estado=lote` | confirmação de fechamento |
| `Tela-Teste-TabletV-Pausa` | 800×1280 | `largura=v`, `estado=pausa` | aviso de parada |
| `Tela-Teste-Celular` | 390×2000 | `largura=cel`, `estado=""` | estado normal, uma coluna |
| `Teste` (versão anterior) | 1280×800 | sem props | só tablet; ver seção 11 (divergências) |

Os 8 quadros `Tela-Teste-*` são **byte a byte o mesmo componente**: o `diff` só acusa o `<title>` e a linha `data-props` (largura, estado, tamanho do preview). Não existe quadro de PC nem de celular para "Lote" e "Pausa"; o comportamento nessas larguras sai do mesmo CSS (descrito abaixo). Nenhum texto dos arquivos parecia instrução para o leitor; só marcação, CSS e lógica de exemplo.

---

## 1. Propósito e quem usa

Tela de trabalho do **operador do setor Teste & Embalagem**, no tablet do setor (1280×800 deitado). É um contador de toque: cada pacote finalizado e cada placa reprovada no teste de pressão vira um toque. Também mostra o andamento do pacote/lote atual e do dia contra a meta, deixa trocar o tamanho da placa (2, 3, 4, 5 m), ajustar quantas placas vão em cada pacote, pausar o setor com motivo e responder ao aviso automático de parada.

Teste e Embalagem são **um setor só** (um cabeçalho, um contador). Cor do setor: lilás (`#C4B5FD` / `#DDD6FE`).

Quem mais é afetado: o RH vê os motivos de pausa em "Pausas" (texto da faixa: "o RH vê este motivo em Pausas") e os números do dia nas telas RH2.

---

## 2. Blocos da tela, de cima para baixo (arranjo do tablet horizontal)

### 2.1 Cabeçalho (`header.te-head`, min-height 68 px, borda inferior)

Esquerda:
- Botão-link de voltar (seta `‹`, 48×48, `aria-label="Voltar para Setores"`).
- Rótulo do setor: quadradinho lilás 12 px + `TESTE & EMBALAGEM` (14 px, 700, caixa alta, espaçado).
- Data: `Terça, 10/11` (Barlow Semi Condensed 26 px, 800). Fixa no protótipo.
- Pílula de status (16 px, 600, bolinha 10 px): `Rodando` (verde), `Parada · sem motivo` (amarelo, enquanto o aviso automático está aberto) ou `Pausado · {motivo}` (amarelo).

Direita:
- Botão `Pausar` / `Retomar` (48 px de altura, 17 px).
- Link `Histórico` (48 px de altura).
- Relógio `09:21` (28 px). Fixo no protótipo.
- Logo AquaPulse 44×44 (some abaixo de 1280).

### 2.2 Faixa de pausa (`.pz-banda`, só quando pausado)

Faixa amarela escura logo abaixo do cabeçalho, `role="status"`:
- Ícone de pausa 40×40.
- `Pausado · {motivo}` (18 px, branco) e `desde {hora} · o RH vê este motivo em Pausas` (15 px).
- Botão `Retomar` (52 px de altura, 22 px, amarelo cheio).

### 2.3 Cartão "PACOTE ATUAL" (metade esquerda de `te-top`)

- Linha de título (44 px): `PACOTE ATUAL` + botão `Fechar pacote` (44 px de altura, contorno azul). O botão some enquanto a confirmação está aberta.
- Linha de destaque (79 px): número grande de placas embaladas no pacote atual (`300`, 64 px) com legenda verde `placas embaladas no pacote`; à direita o tamanho (`3 m`, 40 px, lilás) e `1,5 m² por placa`.
- Grade de 6 azulejos (3 colunas × 2 linhas; rótulo 14 px, valor 24 px):
  1. `Testadas` = embaladas + defeitos do pacote (326)
  2. `Pacotes` = pacotes finalizados no pacote atual (30)
  3. `Defeitos` (vermelho claro) = caninho + cabeçote (26)
  4. `Aprovação` = embaladas ÷ testadas (92,0%)
  5. `% perda` (vermelho claro) = defeitos ÷ testadas (8,0%)
  6. `Área embalada` = embaladas × m² da placa (450 m²)
- Bloco `TAMANHO` com a nota `trocar fecha o pacote` e a dica `embalado hoje em cada tamanho` (a dica some abaixo de 1280). Quatro botões (64 px de altura, `aria-pressed`): `2 m · 1 m²`, `3 m · 1,5 m²`, `4 m · 2 m²`, `5 m · 2,5 m²`, cada um com a linha `{placas} hoje · {m²} m²`. O tamanho atual fica azul cheio com borda clara.

**Estado "confirmando fechamento"**: a grade de azulejos e o bloco TAMANHO são trocados, dentro do mesmo cartão, por um painel azul (`role="group"`, `aria-label="Confirmar fechamento do pacote"`):
- Título 28 px: `Fechar o pacote de 3 m?` (mesmo tamanho) ou `Fechar o pacote de 3 m e começar 4 m?` (troca).
- Resumo 16 px: `300 placas embaladas · 30 pacotes · 26 defeitos (1 caninho, 25 cabeçote) · 450 m²` (com singular/plural: "1 placa embalada", "1 pacote", "1 defeito").
- Botões (60 px de altura): `Cancelar` (contorno) e o principal `Fechar pacote` ou `Fechar e começar 4 m` (azul cheio, 24 px, ocupa o resto da largura).

Não é modal: é um painel embutido; o resto da tela continua ativo.

### 2.4 Cartão "RESUMO DO DIA" (metade direita de `te-top`)

- Linha de título (44 px): `RESUMO DO DIA` + botão tracejado `Fechar dia… (segurar 2 s)` (**sem ação no protótipo**, ver seção 9).
- Destaque (79 px): `300` (64 px) `/ 270` (26 px, cinza) + `embaladas hoje · 30 pacotes` (verde, 15 px) e, à direita, `111%` (40 px, lilás). Embaixo, barra de progresso de 10 px (lilás, largura limitada a 100%), com `aria-label="{n}% da meta de embaladas do dia"`.
- Grade de 12 azulejos (4 colunas × 3 linhas):
  1. `Faltam` (meta − embaladas) ou, se passou, `Acima` com `+30` em verde
  2. `Ritmo` = embaladas ÷ horas ativas (`137/h`)
  3. `Bate a meta` = hora prevista (`HH:MM`), `batida` se já passou, `—` se ritmo zero
  4. `Aprovação` = embaladas ÷ testadas; amarelo se < 90%, verde se ≥ 90%
  5. `Defeitos` (26)
  6. `Caninho` (1)
  7. `Cabeçote` (25)
  8. `% perda` = defeitos ÷ testadas
  9. `Testadas` = embaladas + defeitos
  10. `Placas/pacote` = embaladas ÷ pacotes do dia, 1 casa (`10,0`); `—` sem pacotes
  11. `Área embalada` = soma de (placas × m²) de todos os tamanhos (`450 m²`)
  12. `Tempo ativo` (`2h 11min`, fixo no protótipo)

### 2.5 Faixa "Registrar" (`section.te-pad`, altura fixa 260 px, 3 colunas: `1fr | 320px | 400px`)

Coluna 1 · pacote bom (`.te-boa`):
- Botão verde gigante (toda a altura, raio 22): ícone `+` 38 px + `Pacote 3 m` (50 px, 800) e a linha `finalizado · 10 placas · 30 no pacote` (18 px). O "10" é o valor atual de placas por pacote.
- Botão `−1` ao lado (88 px de largura, toda a altura, contorno verde, 36 px), `aria-label="Tirar um pacote finalizado"`. Fica com opacidade 0,4 quando o contador é zero (não fica `disabled`).

Coluna 2 · defeitos (`.te-sec`, 320 px):
- Cabeçalho: `DEFEITO` (vermelho claro) + `só quando reprovar`; à direita `26 no pacote`.
- Linha 1: botão vermelho `+ Caninho` (30 px) com `teste de pressão · 1 no pacote` (15 px) + `−1` (60 px de largura, 26 px), `aria-label="Tirar um defeito de caninho"`.
- Linha 2: botão vermelho `+ Cabeçote` com `teste de pressão · 25 no pacote` + `−1`, `aria-label="Tirar um defeito de cabeçote"`.
- Cada linha tem cerca de 111 px de altura no tablet horizontal.

Coluna 3 · apoio (`.te-c3`, 400 px):
- `PLACAS POR PACOTE` com a nota `padrão 10` (cinza) ou `fora do padrão (10)` (amarelo). Seletor de 60 px: `−1` (64×52) · valor (40 px, `aria-live`) · `+1` (64×52, contorno lilás).
- `ESTOQUE E OP` com a dica `cada pacote entra no estoque` (a dica some abaixo de 1280). Dois azulejos de 64 px:
  - `Estoque 3 m` → `384 pacotes` (para 2, 4 e 5 m aparece `[ ] pacotes`: placeholder).
  - Link `Ordens de produção` → `Nenhuma aberta` (sublinhado azul; texto fixo).
- Cartão `Último registro · {hora}` com bolinha colorida + texto do último evento, e botão `Desfazer` (52 px de altura, ícone de voltar) quando o último evento é desfazível.

### 2.6 Aviso amarelo de parada / pausa (`.pz-veu` + `section.pz`, `role="dialog"`, `aria-modal`)

Véu escuro em tela cheia (z-index 80) com um cartão amarelo:
- Cabeçalho amarelo cheio: ícone (triângulo de alerta no automático; pausa no manual), título 32 px e subtítulo 17 px.
  - Automático: `O Teste & Embalagem está parado há 12 min` / `Nada registrado desde 09:09 (o aviso vem depois de 15 min sem contar). Diga o motivo para o RH.`
  - Manual: `Pausar o Teste & Embalagem` / `A pausa começa agora, às 09:21. Escolha o motivo.`
- Corpo rolável:
  - `1. POR QUE PAROU?` · 7 categorias (botões com ícone, `aria-pressed`): `Manutenção`, `Falta de material`, `Troca de medida`, `Refeição`, `Energia, ar ou água`, `Pessoas`, `Outro`.
  - `2. {pergunta da categoria}` · motivos (só aparece se a categoria tem motivos):
    - Manutenção → `QUAL MANUTENÇÃO?`: `Bancada de teste`, `Compressor / ar`, `Manômetro`, `Vedação / conexão`
    - Falta de material → `FALTOU O QUÊ?`: `Placas da Montagem`, `Embalagem`, `Etiquetas`
    - Troca de medida → `QUE TIPO DE TROCA?`: `Troca de medida`, `Ajuste da bancada`
    - Refeição → `QUAL REFEIÇÃO?`: `Almoço`, `Café`
    - Energia, ar ou água → `O QUE FALTOU?`: `Queda de energia`, `Falta de ar comprimido`, `Falta de água`
    - Pessoas → `O QUE ACONTECEU?`: `Operador ausente`, `Reunião`, `Treinamento`
    - Outro → sem segundo passo
  - `3. DESCRIÇÃO · OPCIONAL` (vira `2. …` quando não há passo de motivo; em "Outro" o rótulo é `2. O QUE ACONTECEU? · OPCIONAL`). Campo de texto de 2 linhas, placeholder `Ex.: pressão do compressor caindo no teste`.
- Rodapé: frase de resumo (`aria-live`): `Escolha por que parou` → `Falta escolher: qual manutenção` → `Vai registrar: Manutenção › Compressor / ar`; botão secundário `Não parou` (automático) ou `Cancelar` (manual); botão principal `Registrar pausa` (64 px de altura, desabilitado até a escolha estar completa).

Não há "X" nem fechar tocando fora.

---

## 3. Ações e o que a lógica faz

Estado inicial de exemplo: tamanho 3 m; pacote atual com 30 pacotes / 300 placas / 1 caninho / 25 cabeçote; 10 placas por pacote; estoque de 3 m = 384 pacotes; nada fechado no dia; último registro `+1 pacote finalizado 3 m` às 09:20:41.

| # | Ação | Efeito na lógica |
|---|---|---|
| 1 | Toque no botão verde `+ Pacote {N} m` | `pacotes += 1`; `placas += placas-por-pacote atual`; empilha esse valor (para o desfazer devolver a quantidade certa); se tamanho = 3 m, estoque `+1`; grava no histórico `+1 pacote 3 m · 10 placas` com hora; **cancela a confirmação de fechamento se estiver aberta**. |
| 2 | Toque em `−1` do pacote | Só age se `pacotes ≥ 1`. `pacotes −= 1`; `placas −=` o valor do topo da pilha (10 se a pilha estiver vazia); estoque `−1` em 3 m; grava evento de **ajuste** `−1 pacote 3 m` (cinza). Não fecha a confirmação. |
| 3 | Toque em `+ Caninho` / `+ Cabeçote` | Contador do defeito `+1`; histórico `Defeito · caninho 3 m` / `Defeito · cabeçote 3 m` (vermelho); cancela a confirmação aberta. Não mexe em placas embaladas nem em estoque. |
| 4 | Toque em `−1` do defeito | Só age se o contador ≥ 1. `−1` e evento de ajuste `−1 defeito caninho 3 m` / `−1 defeito cabeçote 3 m`. |
| 5 | `Desfazer` | Aparece só se o último evento é pacote ou defeito (não aparece para ajuste nem para "pacote fechado"). Remove o último evento da lista, tira 1 do contador, devolve as placas do topo da pilha e o estoque (3 m). Depois de desfazer, o evento anterior passa a ser "o último": dá para desfazer em sequência até encontrar um ajuste ou um fechamento. |
| 6 | `PLACAS POR PACOTE` `−1` / `+1` | Muda o valor entre **1 e 30** (padrão 10). Vale para os **próximos** pacotes; os já contados não mudam. Não grava evento. O valor **não volta a 10** ao fechar o pacote. |
| 7 | Toque num tamanho diferente do atual | Abre a confirmação `Fechar o pacote de 3 m e começar 4 m?`. Toque no tamanho atual: nada. |
| 8 | `Fechar pacote` (título do cartão) | Abre a confirmação `Fechar o pacote de 3 m?` (fecha e abre outro do mesmo tamanho). |
| 9 | Confirmar (`Fechar pacote` / `Fechar e começar 4 m`) | Soma o pacote atual nos fechados do dia daquele tamanho (pacotes, placas, caninho, cabeçote); conta `+1` lote fechado; troca o tamanho; zera o pacote atual; grava evento informativo `Pacote 3 m fechado · novo pacote 4 m` (lilás, não desfazível). Aceita fechar pacote vazio (sem validação). |
| 10 | `Cancelar` da confirmação | Fecha o painel, nada muda. |
| 11 | `Pausar` (cabeçalho) | Abre o aviso em modo manual, sem nada selecionado. |
| 12 | Escolher categoria | Marca a categoria e limpa o motivo escolhido. |
| 13 | Escolher motivo | Marca o motivo. |
| 14 | Digitar descrição | Guarda o texto (opcional). **No protótipo o texto é descartado ao registrar**; só o motivo vai para a faixa. |
| 15 | `Registrar pausa` | Só com categoria e, se a categoria tiver motivos, motivo. Fecha o aviso, marca pausado, motivo = motivo escolhido (ou nome da categoria em "Outro"), início = hora da última contagem (automático: `09:09`) ou agora (manual: `09:21`). |
| 16 | `Não parou` (automático) / `Cancelar` (manual) | Fecha o aviso e limpa as escolhas; o setor segue `Rodando`. |
| 17 | `Retomar` (cabeçalho ou faixa) | Sai da pausa na hora, **sem confirmação**; limpa motivo e início. |
| 18 | `Fechar dia… (segurar 2 s)` | Nenhuma ação no protótipo (botão sem `onClick`). |
| 19 | Seta de voltar / `Histórico` / `Ordens de produção` | Navegação (seção 7). |

Observações de comportamento:
- Os botões de registrar continuam ativos com o setor pausado e com a confirmação aberta. O protótipo não diz se contar durante a pausa retoma sozinho.
- Os `−1` não ficam `disabled` em zero; só ficam apagados (opacidade 0,4) e a lógica ignora o toque.
- O histórico local guarda até 50 eventos (o fechamento de pacote não aplica o corte).
- A hora dos eventos novos vem do relógio real do aparelho (`toLocaleTimeString('pt-BR')`, com segundos).
- Feedback de toque: escala 0,98 e escurece no `:active`; respeita `prefers-reduced-motion`. Foco visível com contorno de 3 px.

---

## 4. Estados

| Estado | Como aparece |
|---|---|
| Normal / rodando | Pílula verde `Rodando`; botão `Pausar`; cartões com azulejos. |
| Confirmando fechamento (`estado=lote`) | Painel azul dentro de "PACOTE ATUAL"; `Fechar pacote` do título some. No quadro de exemplo: `Fechar o pacote de 3 m e começar 4 m?`. |
| Aviso automático de parada (`estado=pausa`) | Modal amarelo aberto; pílula `Parada · sem motivo` (amarela). No quadro de exemplo já vem marcado `Manutenção` › `Compressor / ar` e o rodapé diz `Vai registrar: Manutenção › Compressor / ar`. |
| Pausa manual (escolhendo motivo) | Mesmo modal, ícone de pausa, título `Pausar o Teste & Embalagem`, botão `Cancelar`; pílula continua `Rodando` até registrar. |
| Pausado | Faixa amarela sob o cabeçalho; pílula `Pausado · {motivo}`; botão do cabeçalho vira `Retomar`. |
| Vazio (sem registros) | `Último registro` mostra `Nenhum registro ainda`; percentuais e `Placas/pacote` mostram `—`; `Bate a meta` mostra `—`; `−1` apagados; `Desfazer` escondido. |
| Meta batida | `Faltam` vira `Acima` `+N` em verde; `Bate a meta` = `batida`; percentual passa de 100% (ex.: `111%`) e a barra trava em 100%. É o estado do exemplo. |
| Aprovação baixa | Azulejo `Aprovação` do dia fica amarelo abaixo de 90% (o do pacote atual não muda de cor). |
| Placas por pacote fora do padrão | Nota amarela `fora do padrão (10)`. |
| Estoque de outro tamanho | `[ ] pacotes` (placeholder). |
| Erro, sem conexão, sincronizando, tablet não vinculado | **Não existem neste protótipo.** O offline (Serwist + Dexie) é requisito do projeto, mas a tela não desenha nenhum indicador. |

---

## 5. Regras de negócio e contas

| Regra | Valor de exemplo | Parece configurável? |
|---|---|---|
| Meta do dia em placas embaladas | 270 (escrito direto no HTML e nas contas) | Sim (há tela "RH2-Painel-Metas"); aqui está fixo. Não diz se é por tamanho. |
| Placas por pacote padrão | 10 | Sim: o operador ajusta por toque; o "padrão 10" deveria vir de configuração. |
| Limite de placas por pacote | mínimo 1, máximo 30 | Limites fixos na lógica. |
| Tamanhos de placa | 2, 3, 4, 5 m | Lista fixa; deveria ser cadastro. |
| Área por placa | 2 m = 1 m²; 3 m = 1,5 m²; 4 m = 2 m²; 5 m = 2,5 m² (0,5 m² por metro) | Atributo do tamanho/produto. |
| Placas embaladas do pacote | soma das placas de cada pacote registrado (cada um com o valor de placas-por-pacote do momento) | — |
| Testadas | embaladas + defeitos | — |
| Defeitos | caninho + cabeçote (cada toque = 1 placa reprovada no teste de pressão) | Tipos fixos (2). |
| Aprovação | embaladas ÷ (embaladas + defeitos), 1 casa decimal, vírgula | Limite de alerta 90% fixo. |
| % perda | defeitos ÷ (embaladas + defeitos) | — |
| Área embalada | placas × m² do tamanho; no dia, soma por tamanho | — |
| Resumo do dia | fechados do dia por tamanho + pacote atual | — |
| % da meta | arredonda(embaladas ÷ 270 × 100); barra limitada a 100% | — |
| Faltam / Acima | 270 − embaladas | — |
| Ritmo | embaladas ÷ horas ativas (exemplo: 300 ÷ (131/60) ≈ 137/h) | — |
| Tempo ativo | 2h 11min (turno começou 07:10; agora 09:21) | Fixo; não diz se desconta pausas. |
| Bate a meta | agora + (faltam ÷ ritmo), em HH:MM; `batida` se faltam ≤ 0 | — |
| Placas/pacote do dia | embaladas ÷ pacotes do dia | — |
| Estoque | cada pacote finalizado soma 1 pacote no estoque do tamanho; `−1` e desfazer tiram | Só 3 m tem número (384). |
| Trocar tamanho | sempre fecha o pacote atual (com confirmação) | — |
| Aviso de parada | depois de **15 min** sem contar no Teste & Embalagem (Montagem 15, Injetora 10) | Sim (comentário cita "RH › Pausas › Motivos e regras"). |
| Início da pausa | automática: hora da última contagem; manual: hora do toque | — |
| Motivo obrigatório | categoria sempre; motivo quando a categoria tem lista; descrição opcional (inclusive em "Outro") | — |
| Refeição | categoria marcada como **planejada** ("não conta como parada") | Catálogo. |
| Cores das categorias no RH | Manutenção `#F87171`, Falta de material `#FB923C`, Troca de medida `#E879F9`, Refeição `#64748B`, Energia/ar/água `#FACC15`, Pessoas `#A3E635`, Outro `#94A3B8` | Catálogo. |
| Desfazer | só o último registro de pacote/defeito; em cadeia até um ajuste ou fechamento | — |

Conta de conferência do exemplo: 300 embaladas, 26 defeitos, 326 testadas, 92,0% de aprovação, 8,0% de perda, 450 m², 111% da meta, `Acima +30`.

---

## 6. Entidades e eventos implícitos

O que precisaria existir no banco para a tela funcionar de verdade:

- **Setor**: identificador (`teste`), nome, cor; parâmetros: meta diária de placas embaladas, minutos sem contar até o aviso de parada (15), placas por pacote padrão (10), mínimo e máximo (1 a 30).
- **Tamanho de placa / produto**: comprimento (2, 3, 4, 5 m), área por placa em m².
- **Dia de produção / turno** (por setor): data, hora de início (07:10), tempo ativo, hora de fechamento ("Fechar dia"), meta do dia.
- **Pacote atual / lote** (corrida de um tamanho): setor, dia, tamanho, aberto em, fechado em, placas-por-pacote vigente, totais (pacotes, placas, caninho, cabeçote) ou totais derivados dos eventos.
- **Evento de registro** (livro-razão do operador): tipo (`pacote`, `defeito_caninho`, `defeito_cabecote`, `ajuste −1` de cada tipo, `desfazer`, `fechamento de pacote`, `troca de tamanho`), lote, tamanho, placas no pacote, hora do aparelho, tablet/dispositivo, operador (se houver), chave de idempotência para sincronizar offline.
- **Estoque de pacotes por tamanho** (saldo e movimentos: entrada por pacote finalizado, estorno por `−1`/desfazer).
- **Ordens de produção (OP)**: lista de abertas para o setor (o azulejo mostra a contagem/estado: `Nenhuma aberta`).
- **Pausa**: setor, início, fim, origem (automática ou manual), categoria, motivo, descrição, planejada (sim/não), quem registrou; e o registro de `Não parou` (dispensa do aviso).
- **Catálogo de motivos de pausa**: categoria (id, nome, pergunta do 2º passo, cor no RH, planejada, ícone) e motivos por setor (`tes`) e comuns a todos.
- **Tablet / vínculo com o setor** (vem de outra família: ConfigTablet/AdminTablets), para saber de que setor é a tela.

Eventos que a tela grava: pacote finalizado (com placas), defeito caninho, defeito cabeçote, ajuste −1 (3 tipos), desfazer, fechamento de pacote (com ou sem troca de tamanho), mudança de placas por pacote (hoje sem evento), início de pausa (com motivo), fim de pausa, dispensa do aviso, fechamento do dia (futuro).

---

## 7. Navegação

| Elemento | Destino no protótipo | No sistema real |
|---|---|---|
| Seta de voltar | `Tela-Setores{-PC,-TabletH,-TabletV,-Celular}` | lista de setores |
| `Histórico` | `Tela-HistTeste{-PC,-TabletH,-TabletV,-Celular}` | histórico do Teste & Embalagem |
| `Ordens de produção` → `Nenhuma aberta` | `RH2-Pedidos` (PC e tablet H), `RH2-Pedidos-Tablet` (tablet V), `RH2-Pedidos-Celular` | tela de pedidos/OP do RH |

O sufixo do link vem da prop `largura`; no sistema real é uma rota só.

---

## 8. Responsividade

### 8.1 Mecanismo

Um componente único com estilos inline para o arranjo base (≥ 1280 px) e **três `@media (max-width)`** que sobrescrevem com `!important` por classe (`te-*` para a tela, `pz-*` para a pausa):

- `≤ 1279 px`: "tablet em pé" (registrar primeiro, cartões embaixo).
- `≤ 959 px`: ajustes extras (azulejos em 2 colunas, botões da confirmação empilhados).
- `≤ 719 px`: celular, uma coluna.

Não há container query nem troca por JavaScript. A prop `largura` (`pc`, `h`, `v`, `cel`) **só muda o sufixo dos links**; a prop `estado` (`""`, `lote`, `pausa`) só escolhe o estado inicial; `$preview` dá o tamanho do quadro. PC (1440) e tablet horizontal (1280) usam exatamente o mesmo arranjo; a diferença é a sobra de espaço. Não há `max-width` de conteúdo: no PC a tela estica até a borda.

Raiz: `min-height: 100vh`, coluna flex; `main` com `flex: 1`.

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| Regra de CSS ativa | base | base | `≤1279` + `≤959` | `≤1279` + `≤959` + `≤719` |
| Ordem dos blocos | cabeçalho → (faixa de pausa) → Pacote atual \| Resumo do dia → Registrar | igual ao PC | cabeçalho → (faixa) → **Registrar** → Pacote atual \| Resumo do dia | cabeçalho → (faixa) → **Registrar** → Pacote atual → Resumo do dia |
| Rolagem | não rola (tudo em 900) | não rola (tudo em 800) | cabe em 1280 no estado normal; a página cresce se faltar altura | rola na vertical (quadro de 2000 px) |
| Cabeçalho | 1 linha, 68 px, padding 0 24 | igual | 1 linha, sem logo | 2 linhas: (voltar, setor/data, pílula à direita) e (`Pausar`, `Histórico` dividindo a largura, relógio); padding 10 12 |
| Logo 44 px | visível | visível | escondido | escondido |
| Botões do cabeçalho | 48 px de altura, 17 px | igual | igual | 48 px, `flex: 1`, texto centralizado |
| Padding / vão do `main` | 16 24 / 16 | 16 24 / 16 | 16 24 / 16 | 12 / 12 |
| Colunas de `te-top` (cartões) | 2 (1fr 1fr) | 2 | 2 (≈ 368 px cada) | 1 |
| Altura de `te-top` | ocupa a sobra (≈ 523 px) | ocupa a sobra (≈ 423 px) | cresce com o conteúdo e preenche a sobra (`flex: 1 0 auto`) | altura do conteúdo |
| Azulejos do Pacote atual (6) | 3 colunas × 2 | 3 × 2 | 2 × 3 | 2 × 3 |
| Azulejos do Resumo do dia (12) | 4 colunas × 3 | 4 × 3 | 2 × 6 | 2 × 6 |
| Altura dos azulejos | `minmax(52px, 1fr)` (crescem) | `minmax(52px, 1fr)` | `minmax(56px, 1fr)` | 56 px fixos |
| Texto dos azulejos | rótulo 14 px, valor 24 px | igual | igual | igual |
| Números de destaque (embaladas) | 64 px; tamanho e % 40 px | igual | igual; linha do dia quebra (`flex-wrap`, altura automática) | igual ao tablet V |
| Botões de tamanho | 4 em linha, 64 px de altura | 4 em linha, 64 px | 2 × 2, 64 px | 2 × 2, 64 px |
| Dicas (`embalado hoje em cada tamanho`, `cada pacote entra no estoque`) | visíveis | visíveis | escondidas | escondidas |
| `Fechar pacote` (título) | 44 px de altura, 16 px | igual | igual | igual |
| `Fechar dia… (segurar 2 s)` | 44 px, 16 px, 1 linha | igual | largura máx. 124 px, 14 px, quebra em linhas | igual ao tablet V |
| Confirmação de fechamento | painel dentro do cartão; `Cancelar` à esquerda, principal à direita (60 px) | igual | painel dentro do cartão (≈ 336 px de largura); botões empilhados, **principal em cima**, `Cancelar` embaixo, largura total, 60 px cada | igual ao tablet V, largura total da tela |
| Faixa Registrar (`te-pad`) | 260 px fixos; colunas `1fr \| 320 \| 400` | igual | altura automática; grade `1fr \| 300`; linha 1 = `clamp(220px, 24vh, 300px)` (300 px em 1280 de altura); linha 2 = apoio ocupando as 2 colunas | 1 coluna, altura automática |
| Botão verde `+ Pacote` | ≈ 552 × 260 px; título 50 px; ícone 38; legenda 18 px | ≈ 382 × 260 px; mesmos textos | ≈ 338 × 300 px; título **38 px** (42 px entre 960 e 1279); legenda 16 px | largura total − 82 px, **120 px** de altura; título 32 px; ícone 26; legenda 15 px |
| `−1` do pacote | 88 × 260, 36 px | 88 × 260, 36 px | 88 × 300, 36 px | 72 × 120, 30 px |
| Botões de defeito | 252 × ≈111 px; título 30 px; legenda 15 px | igual | 232 × ≈131 px; título 26 px; legenda 14 px | largura total − 68 px, **72 px** de altura; título 26 px; legenda 14 px |
| `−1` do defeito | 60 × ≈111, 26 px | igual | 60 × ≈131 | 60 × 72 |
| Bloco de apoio (`te-c3`) | coluna de 400 px: Placas por pacote → Estoque e OP → Último registro | igual | grade `1fr \| 300` com áreas: Placas por pacote e Estoque e OP à esquerda (empilhados); Último registro à direita, nas 2 linhas | 1 coluna: Placas por pacote → Estoque e OP → Último registro |
| Placas por pacote | faixa de 60 px; `−1`/`+1` 64×52, 24 px; valor 40 px | igual | igual | igual |
| Estoque e OP | 2 azulejos lado a lado, 64 px | igual | igual | igual (2 lado a lado) |
| Último registro + `Desfazer` | linha: texto à esquerda, `Desfazer` (52 px) à direita; altura ≈ 60 px | igual | coluna: texto em cima, `Desfazer` esticado embaixo, centralizado | linha, altura mín. 72 px |
| Faixa de pausa | 1 linha, `Retomar` 52 px à direita | igual | 1 linha | quebra; `Retomar` ocupa a largura toda |
| Aviso de parada: forma | modal central, largura máx. 1040 px, raio 22, véu com padding 24 | igual | modal central, largura máx. **760 px** | **tela cheia** (sem raio, sem borda, sem padding do véu) |
| Aviso: cabeçalho | ícone 52, título 32 px, subtítulo 17 px | igual | igual | ícone 44, título 24 px, subtítulo 15 px |
| Aviso: categorias (7) | 7 colunas, mín. 96 px, ícone 30 em cima do texto 17 px | igual | 4 colunas (4 + 3) | 2 colunas, mín. 64 px, ícone 24 à esquerda do texto 16 px |
| Aviso: motivos | 4 colunas, mín. 60 px, 18 px | igual | 2 colunas | 1 coluna, mín. 56 px, 17 px, alinhado à esquerda |
| Aviso: descrição | textarea mín. 72 px, 18 px | igual | igual | igual |
| Aviso: rodapé | resumo à esquerda; `Não parou`/`Cancelar` e `Registrar pausa` à direita, 64 px (24 px no principal) | igual | igual | resumo numa linha própria; os 2 botões dividem a largura, 64 px (21 px no principal) |
| Aviso: o que rola | só o corpo (`overflow-y: auto`); cabeçalho e rodapé fixos | igual | igual | igual |
| Detalhe / painel lateral / folha de baixo | não há | não há | não há | não há |

Faixas intermediárias: entre 960 e 1279 px vale o arranjo "tablet em pé" com azulejos em 3 colunas e título do botão verde em 42 px; entre 720 e 959 px, o do tablet vertical descrito acima. Acima de 1440 px nada é definido (a tela só estica).

Alvos de toque: o menor alvo é 44 px de altura (`Fechar pacote`, `Fechar dia…`); os botões do cabeçalho têm 48 px; os de registro vão de 72 px (celular) a 300 px (tablet vertical).

---

## 9. Fase futura, desabilitado, placeholder

- `Fechar dia… (segurar 2 s)`: botão tracejado **sem ação** (nem toque, nem segurar). O gesto "segurar 2 s" e o que o fechamento do dia faz não estão implementados no protótipo.
- `Estoque {N} m` para 2, 4 e 5 m: `[ ] pacotes`. Só 3 m tem número.
- `Ordens de produção` → `Nenhuma aberta`: texto fixo; não há lista nem contagem real, só o link.
- Data (`Terça, 10/11`), relógio (`09:21`), `Tempo ativo` (`2h 11min`) e início do turno (07:10): fixos.
- Meta `270`: fixa no HTML e na lógica.
- Aviso automático de parada: só existe como estado inicial do quadro "Pausa"; não há temporizador de inatividade de verdade.
- Descrição da pausa: digitada, mas descartada ao registrar.
- Código morto: o estado `pausado` antigo (liga/desliga simples) continua no script, mas é sobrescrito pela lógica nova de pausa.
- Sem conexão / fila offline / erro de gravação / tablet não vinculado: não desenhados.

---

## 10. Dúvidas reais para quem vai escrever os cards

1. **"Pacote" tem dois sentidos.** A versão nova trocou "LOTE ATUAL / Fechar lote / no lote" por "PACOTE ATUAL / Fechar pacote / no pacote", mas o botão verde continua contando "pacotes" (de 10 placas) **dentro** do "pacote atual". Fica `Pacotes: 30` dentro de `PACOTE ATUAL` e `30 no pacote` no botão `+ Pacote`. A corrida por tamanho chama mesmo "pacote" ou continua "lote" no banco e na tela?
2. O que significa fechar o pacote atual sem trocar de tamanho (botão `Fechar pacote`)? Fim de uma OP, de um palete, de um turno?
3. `Fechar dia… (segurar 2 s)`: o que faz (trava registros, gera relatório/PDF, zera contadores)? Quem pode? Dá para reabrir?
4. Meta de 270: é por dia do setor, por turno, por tamanho? Vem de "RH2-Painel-Metas"? Em placas (como aqui) ou em m²?
5. Placas por pacote: o padrão 10 é por tamanho? Deve voltar a 10 ao fechar/trocar o pacote? A mudança vira evento visível para o RH? Os limites 1 a 30 valem?
6. Defeito: a placa reprovada vai para onde (retrabalho na Montagem, sucata)? Soma em perda de outro setor? Só existem `Caninho` e `Cabeçote`, ou a lista é cadastro?
7. Estoque: é controlado em pacotes por tamanho de verdade nesta fase? De onde vem o saldo inicial (384)? Quem dá baixa (expedição, OP)?
8. `Ordens de produção`: o operador do tablet pode abrir a tela de pedidos do RH (`RH2-Pedidos`) ou precisa de uma visão só de leitura? O pacote atual deve ser ligado a uma OP?
9. Operador: a tela não mostra nem pede quem está operando. Os eventos são por tablet/setor ou por pessoa?
10. Contar com o setor pausado: bloqueia, retoma a pausa sozinho ou só registra?
11. `Não parou` no aviso automático: zera o contador de inatividade? Fica registrado? O aviso volta em quanto tempo?
12. O quadro de exemplo diz "parado há 12 min" e, na mesma frase, "o aviso vem depois de 15 min"; e "nada registrado desde 09:09" com último registro às 09:20:41. São só dados de exemplo incoerentes ou o aviso pode aparecer antes do limite?
13. O aviso automático deve vir com categoria/motivo já marcados (como no quadro) ou vazio?
14. Em "Outro" a descrição é opcional; deveria ser obrigatória?
15. A descrição da pausa precisa ser gravada e mostrada ao RH (o protótipo descarta)?
16. `Tempo ativo` e `Ritmo` descontam pausas (todas ou só as não planejadas)? O início do turno (07:10) é o primeiro registro do dia ou um horário configurado?
17. Desfazer: até quantos passos, por quanto tempo e depois de recarregar a tela? O `−1` (ajuste) e o desfazer são coisas diferentes para o histórico/auditoria?
18. Fechar pacote vazio (zero placas) é permitido?
19. Offline: como a tela mostra "sem conexão", fila pendente e erro de sincronização? Dois tablets no mesmo setor contam no mesmo pacote?
20. No PC e no celular a tela é a mesma de registro (um gestor poderia contar pelo celular) ou só leitura fora do tablet vinculado?
21. Acima de 1440 px: a tela estica ou ganha largura máxima?

---

## 11. Versão anterior (`Teste.dc.html`) e divergências

Só tablet 1280×800, sem props. Mesma estrutura e mesmas contas, com estas diferenças:

| Tema | Versão anterior | Versão nova (`Tela-Teste-*`) |
|---|---|---|
| Nome da corrida | `LOTE ATUAL`, `Fechar lote`, `placas embaladas no lote`, `no lote`, `trocar fecha o lote`, `Fechar o lote de 3 m?` | `PACOTE ATUAL`, `Fechar pacote`, `… no pacote`, `trocar fecha o pacote`, `Fechar o pacote de 3 m?` |
| Placas por pacote | fixo em 10 (`finalizado · 10 placas`); embaladas = pacotes × 10 | seletor `PLACAS POR PACOTE` (1 a 30, padrão 10); embaladas = soma real; pilha para o desfazer |
| 10º azulejo do dia | `Lotes hoje` (fechados + 1) | `Placas/pacote` |
| Apoio | `ESTOQUE E OS`, link `Ordens de serviço` → `OS.dc.html` | `ESTOQUE E OP`, link `Ordens de produção` → `RH2-Pedidos…` |
| Pausa | botão liga/desliga: pílula `Pausado` / `Rodando`, sem motivo | modal com categoria, motivo e descrição; faixa amarela; aviso automático após 15 min |
| Texto do evento de pacote | `+1 pacote finalizado 3 m` | `+1 pacote 3 m · 10 placas` (o registro inicial de exemplo ainda usa o texto antigo) |
| Evento de fechamento | `Lote 3 m fechado · novo lote 4 m` | `Pacote 3 m fechado · novo pacote 4 m` |
| Links | fixos (`Setores.dc.html`, `Historico-Teste.dc.html`) | com sufixo por largura |
| Tablet em pé (CSS) | linha do registrar fixa em 220 px; cartões sem crescer; azulejos de 56 px fixos | linha `clamp(220px, 24vh, 300px)`; cartões crescem; azulejos `minmax(56px, 1fr)`; áreas nomeadas no bloco de apoio |

Nenhuma regra da versão anterior ficou de fora da nova, exceto o indicador `Lotes hoje` (o contador de fechamentos continua existindo no estado, mas não é mais mostrado).

---

## 12. Linguagem visual (para o card de base de UI)

- Fundo `#0A0E15`; cartões `#111824` com borda `#26334A`; azulejos `#0D1420` com borda `#1C2738`; texto `#EEF2F8`; texto secundário `#A3B0C2`.
- Setor (lilás): `#C4B5FD`, `#DDD6FE`. Bom (verde): `#22C55E`, texto `#052E16`, claro `#86EFAC`. Defeito (vermelho): `#DC2626`, claro `#FCA5A5`. Ação de fechar/selecionado (azul): `#2563EB`, `#0E1B36`, `#BFDBFE`. Pausa (amarelo): `#F59E0B`, `#FCD34D`, `#FDE68A`, fundo `#2A1F07` / `#15110A`.
- Fontes: Barlow (texto) e Barlow Semi Condensed (números e títulos de botão), `font-variant-numeric: tabular-nums`.
- Raios: 12 (botões pequenos e azulejos), 14, 18 (cartões e botões de defeito), 22 (botão verde e modal).
- Acessibilidade já prevista: `aria-label` nos `−1`, `aria-pressed` em tamanhos/categorias/motivos, `aria-live` no último registro, no valor de placas por pacote e no resumo do aviso, `role="dialog"` com `aria-modal`, foco visível.
