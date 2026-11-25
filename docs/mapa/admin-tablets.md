# Mapa do protótipo · Admin · Tablets (gera o ID) e abas do Admin

Chave da família: `admin-tablets`

Arquivos lidos (todos em `.../artifact-files/9bd8db24-86c5-4245-a2e0-770b6c4f53a3/project/`):

| Quadro | Tamanho no canvas | Props padrão | Observação |
|---|---|---|---|
| `Tela-AdminTablets-PC` | 1440 × 1048 (`expand: fill`) | `largura: "pc"`, `estado: ""` | versão nova |
| `Tela-AdminTablets-TabletH` | 1280 × 860 | `largura: "h"`, `estado: ""` | versão nova; lido por inteiro |
| `Tela-AdminTablets-TabletV` | 800 × 1280 | `largura: "v"`, `estado: ""` | versão nova |
| `Tela-AdminTablets-Celular` | 390 × 1480 | `largura: "cel"`, `estado: ""` | versão nova |
| `Admin-Tablets` | 1440 × 1048 (`expand: fill`) | sem props | versão anterior, título "Admin · tablets (gera o ID)" |

Os quatro quadros `Tela-AdminTablets-*` são **o mesmo arquivo, byte a byte**, exceto duas linhas: o `<title>` e o `data-props` (valor padrão de `largura` e tamanho do `$preview`). Marcação, CSS e script são idênticos. Não há quadro de estado extra (nenhum quadro usa `estado: "novo"`, embora a prop exista).

No canvas a seção se chama "Admin · tablets" (título `resp-admintablets`, y = 16740), com os quatro quadros lado a lado em y = 17000.

---

## 1. Propósito e quem usa

Tela de **cadastro dos tablets da fábrica**, usada pelo **administrador** (o texto da tela "Configurar tablet" diz "No computador, em Admin › Tablets, ele dá um nome ao tablet e escolhe o setor"). É onde o sistema **gera o ID** (e o QR code) que o operador cola, digita ou escaneia no tablet, na tela "Configurar tablet", para o aparelho passar a abrir direto no setor.

Texto de apoio da própria tela: "Cada tablet fica ligado a um setor. O nome dele aparece no histórico como origem dos registros."

É também a **casca do Admin**: a barra de abas mostra as outras áreas administrativas (Botões ESP32, Usuários, Registro de ações), mas só "Tablets" existe no protótipo.

O aparelho principal é o PC (o protótipo diz "No computador"), mas a tela foi desenhada para as quatro larguras.

---

## 2. Blocos da tela, de cima para baixo

### 2.1 Barra do Admin (`nav.ad-nav`, `aria-label="Admin"`)

Fundo `#0D121B`, borda inferior `#1F2A3D`. Conteúdo limitado a 1360 px e centralizado.

Linha de cima (`ad-nav-top`, altura mínima 68 px):
- Esquerda: logo AquaPulse (imagem 219 × 30) + pílula "Admin" (14 px, peso 700, fundo `#16223A`, borda `#2E4470`, texto `#BFDBFE`). O conjunto é um link.
- Direita: link-botão "Ir para o RH" (altura mínima 48 px, borda `#33425C`, 16 px peso 600).

Linha de abas (`ad-tabs`):
- "Tablets" (ativa: branco, peso 700, sublinhado de 3 px `#60A5FA`, `aria-current="page"`).
- "Botões ESP32 · fase 3" (cinza `#7D8BA0`, é um `<span>`, não é link).
- "Usuários" (cinza, `<span>`).
- "Registro de ações" (cinza, `<span>`).

Cada aba tem altura mínima 48 px, 16 px, padding lateral 14 px.

### 2.2 Cabeçalho da página (`ad-topo`)

- `<h1>` "Tablets" (Barlow Semi Condensed 800, 40 px).
- Parágrafo: "Cada tablet fica ligado a um setor. O nome dele aparece no histórico como origem dos registros." (17 px, `#B7C2D3`).
- Botão primário "+ Novo tablet" (altura 52 px, azul `#2563EB`, 17 px peso 700), alinhado à direita e na base do título.

### 2.3 Lista de tablets (`ad-tabela`)

Cartão `#111824` com borda `#26334A`, raio 16 px.

Cabeçalho de colunas (13 px, peso 700, caixa alta, `aria-hidden`): **TABLET · SETOR · ID · SITUAÇÃO**.

Cada linha é um `<button>` inteiro (altura mínima 68 px, 17 px), com `aria-pressed`:
- **Nome** do tablet em negrito.
- **Setor** com um quadradinho de 10 px na cor do setor.
- **ID** (15 px, `#CBD5E1`, espaçamento de letra).
- **Situação** em pílula (14 px peso 700).

Dados de exemplo:

| Nome | Setor | Cor do setor | ID | Situação |
|---|---|---|---|---|
| Tablet Montagem | Montagem | `#2DD4BF` | `TAB-MONT-01` | Vinculado |
| Tablet Injetora | Injetora | `#60A5FA` | `TAB-INJE-02` | Aguardando vínculo |
| Tablet Teste | Teste & Embalagem | `#C4B5FD` | `TAB-TEST-03` | Aguardando vínculo |
| Tablet Injetora 2 (aparece depois de "Criar e gerar ID") | Injetora | `#60A5FA` | `TAB-INJE-04` | Aguardando vínculo |

Pílulas de situação:
- "Vinculado": fundo `#0F2A1B`, texto `#86EFAC`.
- "Aguardando vínculo": fundo `#2A1F07`, texto `#FCD34D`.

Linha selecionada: fundo `#16223A` e borda 2 px `#60A5FA`. As outras têm borda transparente de 2 px (não há salto de layout).

### 2.4 Painel (`aside.ad-painel`)

Cartão `#111824`, padding 24 px. Mostra **um de dois conteúdos**, nunca os dois:

**A) Detalhe do tablet selecionado** (padrão)
1. Topo: nome do tablet (24 px peso 700), setor com o quadradinho de cor (16 px), e a pílula de situação à direita.
2. Caixa do QR (`ad-qrbox`, fundo `#0A0E15`):
   - Desenho de QR code 132 × 132 branco (`role="img"`, `aria-label="QR code do ID"`). É um **desenho falso**: três cantos e dois blocos.
   - Rótulo "ID do tablet" (15 px).
   - O ID em destaque (Barlow Semi Condensed 800, 36 px, por exemplo `TAB-MONT-01`).
   - Instrução: "No tablet: Configurar tablet › colar o ID ou escanear o QR code." (15 px).
3. Dois botões lado a lado (`ad-dois`, altura mínima 52 px, 17 px):
   - "Copiar ID" (primário azul).
   - "Editar nome ou setor" (secundário com borda).
4. Zona de risco (`ad-risco`, separada por uma linha no topo):
   - Título "SE O TABLET FOR TROCADO OU PERDIDO" (15 px peso 700, `#A3B0C2`).
   - Botão âmbar "Gerar novo ID (o atual para de funcionar)" (borda `#7A5A12`, texto `#FCD34D`, altura mínima 52 px, 16 px).
   - Botão vermelho "Desvincular este tablet" (borda `#7F1D1D`, texto `#FCA5A5`, altura mínima 52 px, 16 px).

**B) Formulário "Novo tablet"** (quando `criando` é verdadeiro)
- Título "Novo tablet" (22 px peso 700).
- Campo "Nome": `input type="text"`, placeholder "Ex.: Tablet Injetora 2" (altura 56 px, 18 px).
- Campo "Setor": `select` com as opções "Injetora", "Montagem", "Teste & Embalagem", "TV da fábrica (só visualizar)".
- Botões lado a lado: "Cancelar" (secundário) e "Criar e gerar ID" (primário). Altura mínima 52 px.

---

## 3. Ações e o que a lógica faz

Estado do componente: `{ sel: 'mont', criando: props.estado === 'novo', extra: false }`.

| Ação | Efeito no script | Observação para o sistema real |
|---|---|---|
| Tocar numa linha da lista | `sel = id da linha`, `criando = false`. O painel mostra o detalhe daquele tablet. | Seleção simples; também serve para sair do formulário. |
| "+ Novo tablet" | `criando = true`. O painel troca o detalhe pelo formulário; nenhuma linha fica destacada. | Não abre modal: usa o mesmo painel. |
| "Cancelar" (formulário) | `criando = false`. Volta ao detalhe do tablet que estava selecionado. | Sem confirmação, descarta o que foi digitado. |
| "Criar e gerar ID" | `criando = false`, `extra = true`, `sel = 'novo'`. Aparece a 4.ª linha fixa "Tablet Injetora 2 · Injetora · TAB-INJE-04 · Aguardando vínculo", já selecionada, com o ID e o QR no painel. | Os campos **não estão ligados ao estado**: o que o usuário digita é ignorado, e não há validação. Clicar de novo não cria um 5.º (é um booleano). |
| "Copiar ID" | Sem `onClick`. | Deve copiar o ID para a área de transferência; falta retorno visual ("Copiado"). |
| "Editar nome ou setor" | Sem `onClick`. | Falta desenhar o formulário de edição (provável reuso do "Novo tablet"). |
| "Gerar novo ID (o atual para de funcionar)" | Sem `onClick`. | Ação destrutiva: invalida o ID atual. Falta confirmação e o que acontece com o tablet que está usando o ID antigo. |
| "Desvincular este tablet" | Sem `onClick`. | Ação destrutiva. Falta confirmação e o estado resultante. |
| Aba "Tablets" | Link para a própria tela. | |
| Abas "Botões ESP32 · fase 3", "Usuários", "Registro de ações" | `<span>`, sem ação. | Placeholders. |
| Logo + "Admin" | Vai para "Escolher área" (`Tela-Area` da mesma largura). | |
| "Ir para o RH" | Vai para `RH2-Agora` da largura equivalente. | |

Não há no protótipo: confirmação, desfazer, mensagem de erro, mensagem de sucesso, carregamento, busca, filtro, ordenação nem paginação.

---

## 4. Estados

| Estado | Como aparece | Existe no protótipo? |
|---|---|---|
| Normal, com tablet selecionado | Lista + detalhe do "Tablet Montagem" (primeiro, "Vinculado"). | Sim, é o padrão dos quatro quadros. |
| Detalhe de tablet "Aguardando vínculo" | Mesmo painel, pílula âmbar. Os botões são os mesmos do "Vinculado". | Sim (tocando na linha). |
| Criando | Painel mostra "Novo tablet"; nenhuma linha destacada. | Sim (botão ou prop `estado: "novo"`), mas sem quadro próprio no canvas. |
| Recém-criado | Nova linha selecionada, ID e QR à mostra, "Aguardando vínculo". | Sim (interação). |
| Lista vazia (nenhum tablet) | Não desenhado. O script cai em `lista[0]`, que não existiria. | Não. |
| Editando nome/setor | Não desenhado. | Não. |
| Confirmação de "Gerar novo ID" e de "Desvincular" | Não desenhado. | Não. |
| Tablet desvinculado / ID revogado | Não há terceira situação; só "Vinculado" e "Aguardando vínculo". | Não. |
| Erro (nome vazio, nome repetido, falha de rede), carregando, sem conexão | Não desenhado. | Não. |
| Sem permissão (usuário que não é admin) | Não desenhado. | Não. |

---

## 5. Regras de negócio e contas

1. **Um tablet pertence a um setor.** Setores possíveis no cadastro: Injetora, Montagem, Teste & Embalagem (um setor só) e um quarto tipo "TV da fábrica (só visualizar)".
2. **O sistema gera o ID** ao criar o tablet ("Criar e gerar ID"). O admin não digita o ID.
3. **Formato do ID nos exemplos**: `TAB-` + 4 letras do setor em maiúsculas + `-` + número de 2 dígitos. Prefixos vistos: `MONT`, `INJE`, `TEST`. O número é **sequencial global**, não por setor: 01 (Montagem), 02 (Injetora), 03 (Teste), 04 (Injetora 2). Não parece configurável; é só exemplo. O prefixo do tipo "TV da fábrica" não aparece.
4. **Situação** tem dois valores: "Aguardando vínculo" (criado, ninguém usou o ID ainda) e "Vinculado" (um aparelho informou o ID em "Configurar tablet").
5. **O ID também vira QR code**: o tablet tem o botão "Escanear QR code da tela do admin" (família `config-tablet`). O QR precisa codificar o ID (ou um endereço que o contenha; o protótipo não decide).
6. **"Gerar novo ID (o atual para de funcionar)"**: gira o ID; o aparelho que usava o antigo perde o vínculo. Texto da seção: "SE O TABLET FOR TROCADO OU PERDIDO".
7. **"Desvincular este tablet"**: solta o aparelho do cadastro. O protótipo não diz se o cadastro volta a "Aguardando vínculo" com o mesmo ID ou se é apagado.
8. **O nome do tablet é a "origem" dos registros no histórico** ("O nome dele aparece no histórico como origem dos registros"). Nos históricos aparecem origens como "Tablet Montagem", "Tablet + botão ESP32" e "Lançado pelo RH"; no RH há filtro "Origem (tablet de cada setor ou Lançado pela Administração)".
9. Do outro lado (tela "Configurar tablet", só para contexto): o exemplo aceita qualquer ID com 4 caracteres ou mais; o erro é "ID vazio, incompleto ou não encontrado. Confira com o administrador se o tablet foi criado."; depois de vinculado mostra Nome, Setor e ID ("Estes dados vêm do cadastro feito pelo administrador.") e oferece "Usar outro ID".
10. Não há metas, percentuais nem contas de produção nesta tela.

Cores de setor usadas aqui (devem ser as mesmas do resto do sistema): Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`.

---

## 6. Entidades e eventos implícitos

**Tablet** (cadastro)
- `id` interno
- `nome` (ex.: "Tablet Montagem"; aparece como origem no histórico)
- `setor` (Injetora | Montagem | Teste & Embalagem) ou `tipo` "TV da fábrica (só visualizar)"
- `codigo` / ID de vínculo (ex.: `TAB-MONT-01`), único, gerado pelo sistema
- `situacao` (Aguardando vínculo | Vinculado)
- implícitos: data de criação, quem criou, data do vínculo, identificação do aparelho vinculado (sessão/token do dispositivo), data da última troca de ID, data de desvinculação, ativo/inativo

**Setor** (referência): nome, cor, código curto de 4 letras para o ID.

**Vínculo de aparelho** (pode ser campo do Tablet ou tabela à parte): qual navegador/aparelho está usando o ID, desde quando, e opções locais ("Manter a tela sempre ligada", "Tela cheia" ficam na tela do tablet).

**Usuário** com papel de administrador (a aba "Usuários" e o texto "Esqueceu a senha? Peça ao administrador." indicam que o admin gerencia usuários e senhas).

**Registro de ações** (auditoria): a aba existe; as ações desta tela são candidatas naturais a serem gravadas.

**Botão ESP32** (fase 3): dispositivo físico associado a setor/mesa; só o nome da aba aparece aqui.

Eventos que esta tela gravaria:
- tablet criado (nome, setor, ID gerado, quem)
- nome ou setor do tablet alterado
- ID regenerado (ID antigo invalidado)
- tablet desvinculado
- (do lado do tablet) tablet vinculado / trocou de ID

---

## 7. Navegação

| De | Para | Regra de sufixo |
|---|---|---|
| Logo AquaPulse + "Admin" | "Escolher área" (`Tela-Area-PC`, `-TabletH`, `-TabletV`, `-Celular`) | mesma largura |
| "Ir para o RH" | `RH2-Agora` (pc e h), `RH2-Agora-Tablet` (v), `RH2-Agora-Celular` (cel) | o RH só tem três larguras |
| Aba "Tablets" | a própria tela | mesma largura |
| Outras abas | nada | placeholders |

**Ninguém leva até esta tela.** Nenhum outro quadro do protótipo tem link para `Tela-AdminTablets-*` (nem para o antigo `Admin-Tablets`). "Escolher área" só oferece Setores, RH, "Configurar tablet" e "Sair". A entrada do Admin precisa ser decidida.

Não há botão "Sair" nem nome do usuário na barra do Admin.

---

## 8. Responsividade

### 8.1 Mecanismo

- O arranjo muda **só por CSS**: `flex-wrap` com bases (`flex: 3 1 560px` na lista, `flex: 2 1 400px` no painel) e **uma media query** `@media (max-width: 719px)`.
- A prop `largura` (`pc` | `h` | `v` | `cel`) **não altera o layout**: serve só para montar os links (`-PC`, `-TabletH`, `-TabletV`, `-Celular`, e o sufixo do RH).
- A prop `estado` (`""` | `"novo"`) só decide se a tela abre com o formulário.
- Conteúdo limitado a `max-width: 1360px`, centralizado.

Pontos de troca efetivos:
- **≥ 1016 px de janela** (largura útil ≥ 976 = 560 + 400 + 16): duas colunas, lista à esquerda e painel à direita.
- **720 a 1015 px**: uma coluna; lista em cima (ainda em tabela de 4 colunas), painel embaixo.
- **≤ 719 px**: uma coluna; cada tablet vira cartão de duas linhas; ajustes de fonte e padding.

### 8.2 Tabela parâmetro × largura

Larguras calculadas a partir do CSS (padding lateral 20 px, ou 16 px no celular).

| Parâmetro | PC 1440 | Tablet horizontal 1280 | Tablet vertical 800 | Celular 390 |
|---|---|---|---|---|
| Altura do quadro no canvas | 1048 | 860 (não 800) | 1280 | 1480 |
| Largura útil do conteúdo | 1360 (limite) | 1240 | 760 | 358 |
| Padding lateral (nav e main) | 20 px | 20 px | 20 px | 16 px |
| Padding do main (topo / base) | 32 / 72 px | 32 / 72 px | 32 / 72 px | 20 / 48 px |
| Colunas da seção | 2 (lista + painel) | 2 (lista + painel) | 1 (lista, depois painel) | 1 (lista, depois painel) |
| Largura da lista | cerca de 790 px | cerca de 718 px | 760 px | 358 px |
| Largura do painel | cerca de 554 px | cerca de 506 px | 760 px | 358 px |
| Ordem dos blocos | barra, cabeçalho, lista e painel lado a lado | igual ao PC | barra, cabeçalho, lista, painel | barra, cabeçalho, botão, lista, painel |
| Barra superior | logo + "Admin" à esquerda, "Ir para o RH" à direita, uma linha | igual | igual | quebra: "Ir para o RH" desce para a linha de baixo (não cabe em 358 px) |
| Abas | cabem em uma linha | cabem | cabem | não cabem: rolagem horizontal (`overflow-x: auto`, barra oculta) |
| Altura das abas e do "Ir para o RH" | 48 px | 48 px | 48 px | 48 px |
| Título `h1` | 40 px | 40 px | 40 px | 32 px |
| Parágrafo de apoio | 17 px | 17 px | 17 px | 16 px |
| "+ Novo tablet" | 52 px de altura, à direita do título | igual | igual (à direita, se couber na linha) | 52 px, largura total, abaixo do texto |
| Cabeçalho de colunas | visível (TABLET, SETOR, ID, SITUAÇÃO) | visível | visível | oculto |
| Forma da linha | tabela de 4 colunas: `1.3fr 1fr 150px 190px` | igual | igual, mais apertada (nome cerca de 178 px, setor cerca de 137 px; "Teste & Embalagem" quebra em 2 linhas) | cartão de 2 linhas: "nome + situação" / "setor + ID" (situação e ID alinhados à direita) |
| Altura da linha (alvo de toque) | mínimo 68 px | mínimo 68 px | mínimo 68 px | sem mínimo; padding 12 px (cerca de 75 px) |
| Fonte da linha | 17 px (ID 15, pílula 14) | igual | igual | igual |
| Padding do cartão da lista | 4 / 20 / 12 px | igual | igual | 4 / 12 / 8 px |
| Padding do painel | 24 px | 24 px | 24 px | 18 px |
| Como o detalhe abre | painel lateral fixo na página (sempre visível) | igual | bloco abaixo da lista (sem rolagem automática) | bloco abaixo da lista (sem rolagem automática) |
| Caixa do QR | QR 132 px à esquerda, texto à direita | igual | igual | empilhada: QR em cima, texto embaixo |
| Tamanho do QR | 132 × 132 | 132 × 132 | 132 × 132 | 132 × 132 |
| ID em destaque | 36 px | 36 px | 36 px | 30 px |
| "Copiar ID" e "Editar nome ou setor" | 2 colunas, 52 px | 2 colunas, 52 px | 2 colunas, 52 px | 1 coluna (empilhados), 52 px |
| Botões de risco (âmbar e vermelho) | empilhados, 52 px, largura total do painel | igual | igual | igual |
| Campos do formulário | 56 px de altura, fonte 18 px | igual | igual | igual |
| "Cancelar" / "Criar e gerar ID" | lado a lado, 52 px | igual | igual | lado a lado, 52 px (não empilha) |
| O que rola | a página inteira | a página inteira | a página inteira | a página inteira; abas rolam na horizontal |
| O que é fixo | nada (sem `sticky`/`fixed`) | nada | nada | nada |

Outros detalhes válidos em todas as larguras:
- Fontes: Barlow (texto) e Barlow Semi Condensed (título e ID).
- Foco visível: contorno 3 px `#BFDBFE` em botões e links.
- `touch-action: manipulation` e sem realce de toque nos botões.
- Fundo da página `#0A0E15`; cartões `#111824`; borda `#26334A`; azul primário `#2563EB`.

### 8.3 Pontos de atenção de layout

- No tablet horizontal o quadro tem 860 px de altura, mas o aparelho tem 800: o painel de detalhe (QR + 4 botões) pode passar da dobra; a página rola.
- No tablet vertical e no celular, tocar numa linha muda o painel que está **abaixo** da lista; com muitos tablets o usuário não vê a mudança sem rolar. O protótipo não rola nem abre folha.
- No celular, "+ Novo tablet" abre o formulário no painel que fica **abaixo da lista**, longe do botão.
- No tablet vertical a tabela mantém as 4 colunas com larguras fixas de 150 e 190 px para ID e situação; nomes longos de tablet ou setor quebram linha.

---

## 9. Fase futura, desabilitado ou placeholder

- Aba "Botões ESP32 · fase 3": rótulo declara fase 3; sem tela.
- Aba "Usuários": sem tela, sem link.
- Aba "Registro de ações": sem tela, sem link.
- QR code: desenho fixo, não é gerado a partir do ID.
- "Copiar ID", "Editar nome ou setor", "Gerar novo ID (o atual para de funcionar)", "Desvincular este tablet": botões sem ação.
- Formulário "Novo tablet": campos não ligados à lógica; sempre cria "Tablet Injetora 2 / TAB-INJE-04".
- Opção de setor "TV da fábrica (só visualizar)": não existe tela de TV em nenhum quadro do protótipo.
- Prop `estado: "novo"`: existe no código, nenhum quadro a usa.

---

## 10. Diferenças entre a versão anterior (`Admin-Tablets`) e a nova (`Tela-AdminTablets-*`)

A lógica (dados, seleção, criar, cancelar) é a mesma. A versão anterior não traz nenhuma regra a mais. Diferenças:

| Item | `Admin-Tablets` (anterior) | `Tela-AdminTablets-*` (nova) |
|---|---|---|
| Estilo | inline, só 1440 | classes `ad-*` + media query ≤ 719 px |
| Link do logo | `Hub.dc.html` | `Tela-Area` da largura |
| "Ir para o RH" | `Painel-RH.dc.html` (arquivo que não existe mais no projeto) | `RH2-Agora` da largura |
| Altura do "Ir para o RH" | cerca de 40 px (padding 10 px) | mínimo 48 px |
| Abas | `flex-wrap` (quebram linha) | rolagem horizontal |
| Campos do formulário | 52 px | 56 px |
| Botões de risco | 48 px | mínimo 52 px |
| Caixa do QR | não quebra | `flex-wrap`; empilha no celular |
| Acessibilidade da linha | sem `aria-pressed` | `aria-pressed` na linha selecionada |
| Props | só `$preview` | `largura`, `estado`, `$preview` |

---

## 11. Dúvidas reais para o card

1. **Entrada do Admin**: de onde o administrador chega a esta tela? "Escolher área" não tem cartão nem link de Admin. Um terceiro cartão só para quem é admin? Um item dentro do RH?
2. **Papéis**: quem é "admin"? É um papel separado do RH ou o RH também acessa? O que vê quem não tem permissão?
3. **Formato do ID**: `TAB-XXXX-NN` é o formato real ou só exemplo? O número é global ou por setor? Um ID curto e legível é um segredo fraco: basta para vincular, ou o vínculo exige também o admin estar logado no aparelho, ou um código de uso único com validade?
4. **Conteúdo do QR**: só o texto do ID, ou um endereço que já abre "Configurar tablet" com o ID preenchido?
5. **Um ID, quantos aparelhos?** Se um segundo aparelho informar um ID já "Vinculado": recusa, substitui o primeiro, ou aceita os dois?
6. **"Desvincular este tablet"**: o cadastro continua (volta a "Aguardando vínculo" com o mesmo ID), ganha ID novo, ou é excluído? Existe "excluir tablet"? O que acontece na tela do aparelho desvinculado?
7. **"Gerar novo ID"**: o aparelho atual é derrubado na hora (mesmo no meio de um turno e sem conexão)? Os registros pendentes de sincronização do ID antigo são aceitos?
8. **Confirmações**: as duas ações de risco pedem confirmação? Com qual texto? Há desfazer?
9. **"Editar nome ou setor"**: como é o formulário? Mudar o setor de um tablet vinculado muda a tela que ele abre na hora? E o histórico antigo: guarda o nome da época ou o nome atual como origem?
10. **Validações do "Novo tablet"**: nome obrigatório? Único? Tamanho máximo? Pode haver mais de um tablet por setor (o exemplo cria "Tablet Injetora 2", então parece que sim)?
11. **"TV da fábrica (só visualizar)"**: que tela esse tipo abre? Não há quadro de TV no protótipo. Entra agora ou é fase futura? Qual prefixo de ID?
12. **Lista vazia**: o que mostrar quando não há tablet cadastrado (texto e chamada para "+ Novo tablet")?
13. **Mais dados na lista ou no detalhe**: último acesso, data do vínculo, tablet online/offline, versão do app? O protótipo só mostra nome, setor, ID e situação.
14. **Abas "Usuários" e "Registro de ações"**: entram no escopo desta entrega (o login diz "Esqueceu a senha? Peça ao administrador.") ou ficam para depois? Se entram, falta o desenho. Na primeira entrega ficam visíveis e desabilitadas ou escondidas?
15. **"Botões ESP32 · fase 3"**: confirmar que fica só o rótulo desabilitado.
16. **Registro de ações**: criar, editar, regenerar e desvincular devem gerar entrada de auditoria já nesta entrega?
17. **Detalhe em telas estreitas**: no tablet vertical e no celular o detalhe e o formulário ficam abaixo da lista. Manter assim, rolar até o painel, ou abrir como folha/tela cheia?
18. **Barra do Admin**: não tem "Sair" nem o nome de quem está logado. É intencional?
19. **"Copiar ID"**: qual retorno visual (ex.: "Copiado")? Deve existir também "Imprimir QR" ou "Compartilhar"?
20. **Uso em tablet/celular**: a tela "Configurar tablet" diz "No computador". O admin no celular é caso real (mostrar o QR no celular para o tablet escanear) ou só precisa não quebrar?
