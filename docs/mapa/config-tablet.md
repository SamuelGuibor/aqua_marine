# Mapa do protótipo · Configurar tablet (vincular por ID ou QR)

Chave da família: `config-tablet`
Título no canvas: seção "Configurar tablet" (`resp-configtablet`), dentro do grupo "Entrada · PC, tablet e celular".

## 0. Arquivos lidos

| Quadro | Tamanho no canvas | Props | Observação |
|---|---|---|---|
| `Tela-ConfigTablet-PC` | 1440×900 (`expand: fill`) | `largura=pc`, `estado=""` | não vinculado |
| `Tela-ConfigTablet-TabletH` | 1280×800 | `largura=h`, `estado=""` | não vinculado (referência; lido por inteiro) |
| `Tela-ConfigTablet-TabletH-Vinculado` | 1280×800 | `largura=h`, `estado=vinculado` | já vinculado |
| `Tela-ConfigTablet-TabletV` | 800×1280 | `largura=v`, `estado=""` | não vinculado |
| `Tela-ConfigTablet-TabletV-Vinculado` | 800×1280 | `largura=v`, `estado=vinculado` | já vinculado |
| `Tela-ConfigTablet-Celular` | 390×1000 | `largura=cel`, `estado=""` | não vinculado |
| `Tablet` (versão anterior) | 1280×800 fixo | sem props | só tablet horizontal, estilos inline |

Os seis quadros `Tela-ConfigTablet-*` são **byte a byte o mesmo componente**: o `diff` só acusa o `<title>` e o `data-props` (valor padrão de `largura`, de `estado` e o tamanho do preview). Não existem quadros "Vinculado" para PC e celular, mas o estado existe em todas as larguras (é só clicar em "Vincular tablet").

Nenhum dos arquivos contém texto dirigido ao leitor/agente; só marcação, CSS e lógica de exemplo.

## 1. Propósito e quem usa

Tela de configuração **feita uma vez por aparelho**: liga o aparelho físico (o tablet do setor) a um cadastro de tablet criado pelo administrador em Admin › Tablets. Depois de vinculado, o aparelho "abre direto no setor certo".

- Quem usa: quem está instalando o tablet no setor (operador, líder ou o próprio administrador com o aparelho na mão). O cadastro em si (nome, setor, geração do ID e do QR) é do **administrador**, em outra tela (`Tela-AdminTablets-*`).
- Subtítulo fixo: "Feito uma vez por aparelho. Depois ele abre direto no setor certo."
- A tela é alcançada pelo rodapé de "Escolher área" (`Tela-Area-*`), no link "Configurar este tablet", ao lado da nota "Este aparelho ainda não está ligado a um setor". Como `Tela-Area` vem depois de `Tela-Entrar` (senha de acesso), o protótipo sugere que a tela fica atrás do login, mas não afirma isso.

## 2. Blocos da tela, de cima para baixo

### 2.1 Cabeçalho (`.ct-head`), igual nos dois estados

1. Botão quadrado "Voltar" (`aria-label="Voltar"`, seta para a esquerda), link para `Tela-Area{sufixo}`.
2. Título `h1` "Configurar tablet" + subtítulo "Feito uma vez por aparelho. Depois ele abre direto no setor certo."
3. Logo AquaPulse 56×56 à direita (`margin-left:auto`); **some no celular**.

Não há barra de navegação, abas nem rodapé nesta tela.

### 2.2 Estado "não vinculado" (padrão)

Dois blocos lado a lado (PC e tablet horizontal) ou empilhados (tablet vertical e celular):

**Bloco A · "COMO FUNCIONA"** (`.ct-passos`, `aria-label="Como funciona"`): rótulo em caixa alta + 3 cartões numerados (círculo com o número 1, 2, 3):

| n | Título | Texto |
|---|---|---|
| 1 | "O administrador cria o tablet" | "No computador, em Admin › Tablets, ele dá um nome ao tablet e escolhe o setor." |
| 2 | "O sistema gera um ID" | "Aparece na tela do admin, junto com um QR code." |
| 3 | "Você vincula aqui" | "Cole o ID, digite ou escaneie o QR code. O tablet passa a abrir direto no setor." |

Conteúdo puramente informativo, sem ação.

**Bloco B · formulário** (`.ct-form`, `aria-label="Vincular este tablet"`):

1. Rótulo "ID do tablet" (`label for="tablet-id"`).
2. Linha com o campo de texto + botão "Colar".
   - Campo: `type="text"`, placeholder "Ex.: TAB-MONT-01", `autocomplete="off"`, `autocapitalize="characters"`, `spellcheck="false"`, letra 22px peso 600 com `letter-spacing .04em`.
   - Cor da borda (2px): `#33425C` vazio/curto; `#60A5FA` (azul) quando "pronto"; `#EF4444` (vermelho) em erro.
3. Abaixo do campo, uma de duas mensagens (nunca as duas):
   - Dica (sem erro): "O administrador cria o tablet em Admin › Tablets e passa o ID para você."
   - Erro (`role="alert"`, vermelho claro `#FCA5A5`): "ID vazio, incompleto ou não encontrado. Confira com o administrador se o tablet foi criado."
4. Botão principal "Vincular tablet". Aparência muda com "pronto": fundo `#2563EB` / texto branco quando pronto; fundo `#1C2738` / texto `#7D8BA0` (aparência de apagado) quando não. **Não fica `disabled`**: tocar nele sem estar pronto dispara o erro.
5. Separador "ou" com linha de cada lado.
6. Botão secundário (contorno) com ícone de mira/scanner: "Escanear QR code da tela do admin".

### 2.3 Estado "vinculado"

Um cartão único (`.ct-ok`, `aria-label="Tablet vinculado"`), centralizado na horizontal, colado no topo, `max-width: 720px`:

1. Topo: círculo verde (`#22C55E`) com "check" + título "Tablet vinculado" + "Estes dados vêm do cadastro feito pelo administrador."
2. Lista de dados (chave à esquerda, valor em negrito à direita):
   - "Nome" → "Tablet Montagem"
   - "Setor" → quadradinho da cor do setor (`#2DD4BF`, cor da Montagem) + "Montagem"
   - "ID" → o ID digitado (`{{id}}`; no quadro de exemplo "TAB-MONT-01")
3. Duas opções com caixa de seleção, ambas marcadas por padrão:
   - "Manter a tela sempre ligada"
   - "Tela cheia"
4. Botão principal (link) "Abrir a Montagem" → `Tela-Montagem{sufixo}`.
5. Botão de texto discreto "Usar outro ID".

No estado vinculado o bloco "COMO FUNCIONA" e o formulário **não aparecem**.

## 3. Ações e lógica do script

Estado do componente: `{ id: string, vinculado: boolean, erro: boolean }`. Inicial: `id=''`, `vinculado=false`, `erro=false`; com `estado='vinculado'` começa com `id='TAB-MONT-01'`, `vinculado=true`.

Derivado: `pronto = id.trim().length >= 4`.

| Ação | Onde | O que o script faz |
|---|---|---|
| Digitar no campo | "ID do tablet" | `id = valor`, `erro = false` (o erro some ao digitar). Sem máscara nem conversão para maiúsculas no script (só o atributo `autocapitalize`). |
| "Colar" | ao lado do campo | **Simulado**: põe `id='TAB-MONT-01'` e limpa o erro. Não lê a área de transferência de verdade. Não vincula sozinho. |
| "Escanear QR code da tela do admin" | abaixo do "ou" | **Simulado e idêntico ao "Colar"** (mesmo handler `colar`): preenche `TAB-MONT-01`. Não abre câmera. Não vincula sozinho; ainda é preciso tocar em "Vincular tablet". |
| "Vincular tablet" | botão principal | Se `!pronto` → `erro=true` (borda vermelha + mensagem). Se pronto → `vinculado=true`, `erro=false`. **Não há consulta**: qualquer texto com 4+ caracteres "vincula", e os dados mostrados são sempre "Tablet Montagem / Montagem". |
| "Usar outro ID" | cartão vinculado | `vinculado=false`, `id=''`. **Sem confirmação, sem desfazer.** Volta ao formulário vazio. |
| Caixas "Manter a tela sempre ligada" e "Tela cheia" | cartão vinculado | Checkbox nativo não controlado (`checked` fixo no HTML): marca/desmarca, mas o script não guarda nem aplica nada. |
| "Abrir a Montagem" | cartão vinculado | Link para `Tela-Montagem{sufixo}`. Texto e destino fixos na Montagem. |
| "Voltar" | cabeçalho | Link para `Tela-Area{sufixo}`. |

Não há: estado de carregamento, mensagem de sucesso temporária, confirmação, limite de tentativas, tratamento de "ID já em uso", estado sem conexão.

## 4. Estados

| Estado | Como aparece | Existe no protótipo? |
|---|---|---|
| Não vinculado, campo vazio | borda cinza, botão "Vincular tablet" apagado, dica cinza | sim (padrão) |
| Não vinculado, ID "pronto" (4+ caracteres) | borda azul `#60A5FA`, botão azul `#2563EB` | sim |
| Erro | borda vermelha `#EF4444`, mensagem única com `role="alert"`, dica some | sim (só para ID curto/vazio; "não encontrado" está no texto mas não na lógica) |
| Vinculado | cartão "Tablet vinculado" | sim (quadros `-Vinculado` em tablet H e V) |
| Carregando / validando no servidor | — | **não desenhado** |
| Sem conexão | — | **não desenhado** |
| ID já vinculado a outro aparelho / ID invalidado ("Gerar novo ID") | — | **não desenhado** |
| Câmera aberta / permissão negada | — | **não desenhado** |

## 5. Regras de negócio e valores

- **Uma vez por aparelho**: o vínculo é do aparelho, não da pessoa. Depois de vinculado, o aparelho "abre direto no setor certo" (texto do subtítulo e do passo 3).
- **O cadastro é do admin**: nome, setor e ID nascem em Admin › Tablets; esta tela só lê ("Estes dados vêm do cadastro feito pelo administrador.") e não permite editar nome nem setor.
- **Três formas de informar o ID**: colar, digitar ou escanear o QR da tela do admin.
- **Validação mínima no protótipo**: 4 caracteres depois de `trim()`. É regra de exemplo, não regra de negócio; o formato real visto no admin é `TAB-XXXX-NN` (ex.: `TAB-MONT-01`, `TAB-INJE-02`, `TAB-TEST-03`, `TAB-INJE-04`): prefixo fixo, 4 letras do setor, número sequencial que parece global (01, 02, 03, 04 em setores diferentes).
- **Mensagem de erro única** para três casos (vazio, incompleto, não encontrado).
- **Preferências do aparelho**: "Manter a tela sempre ligada" e "Tela cheia", ambas ligadas por padrão. Não há outra preferência.
- **Cores de setor** (vindas das outras telas): Injetora `#60A5FA`, Montagem `#2DD4BF`, Teste & Embalagem `#C4B5FD`.
- Regras vizinhas, vistas em `Tela-AdminTablets-*` e que esta tela precisa respeitar:
  - Situação do tablet: "Vinculado" ou "Aguardando vínculo".
  - "Cada tablet fica ligado a um setor. O nome dele aparece no histórico como origem dos registros." (o histórico da Montagem mostra a origem "Tablet Montagem").
  - Opções de setor no cadastro: Injetora, Montagem, Teste & Embalagem e **"TV da fábrica (só visualizar)"**.
  - Ações do admin "SE O TABLET FOR TROCADO OU PERDIDO": "Gerar novo ID (o atual para de funcionar)" e "Desvincular este tablet".
  - Texto de instrução no admin: "No tablet: Configurar tablet › colar o ID ou escanear o QR code."
- Não há contas, metas nem percentuais nesta tela.

## 6. Entidades e dados implícitos

**Tablet** (cadastro do admin)
- `id` interno
- `nome` (ex.: "Tablet Montagem")
- `setor_id` (Injetora, Montagem, Teste & Embalagem ou o modo "TV da fábrica")
- `codigo` / ID de vínculo (ex.: `TAB-MONT-01`), único, regenerável
- `situacao`: "Aguardando vínculo" | "Vinculado"
- `vinculado_em`, `desvinculado_em`
- identificação do aparelho vinculado (token do dispositivo guardado no aparelho + hash no banco; user-agent; último acesso)
- `criado_por`, `criado_em`

**Setor**: `nome`, `cor`, rota da tela do setor (para o botão "Abrir a …").

**Preferências do aparelho** (por tablet ou só no aparelho): `manter_tela_ligada` (padrão verdadeiro), `tela_cheia` (padrão verdadeiro).

**Vínculo local no aparelho**: precisa sobreviver a recarregar/fechar o navegador e funcionar offline (o projeto usa Serwist + Dexie): token do vínculo, `tablet_id`, `setor`, `nome`, preferências.

**Eventos que a tela gravaria**
- `tablet_vinculado` (tablet, aparelho, quando, por qual usuário logado, se houver)
- `tablet_desvinculado` (origem: "Usar outro ID" no aparelho, ou admin)
- tentativa de vínculo recusada (ID inexistente, já usado, invalidado), para auditoria e limite de tentativas
- alteração de preferência (tela ligada / tela cheia), se for guardada no servidor

O nome do tablet vira "origem" dos registros de produção no histórico, então todo evento de produção gravado pelo aparelho precisa carregar `tablet_id`.

## 7. Navegação

| De | Elemento | Para |
|---|---|---|
| `Tela-Area-*` (rodapé) | "Configurar este tablet" | esta tela (mesma largura) |
| esta tela | "Voltar" (seta) | `Tela-Area{-PC | -TabletH | -TabletV | -Celular}` |
| esta tela, vinculado | "Abrir a Montagem" | `Tela-Montagem{sufixo}` |
| `Tela-AdminTablets-*` | só texto de instrução | (sem link direto para cá) |

O sufixo vem da prop `largura` (`pc`, `h`, `v`, `cel`); é artifício do protótipo para manter o passeio na mesma largura. No sistema real são rotas únicas.

Versão anterior (`Tablet.dc.html`): "Voltar" → `Hub.dc.html`; "Abrir a Montagem" → `Montagem.dc.html`; entrada pelo `Hub` em "Configurar este tablet".

## 8. Responsividade

### 8.1 Mecanismo

**CSS media queries por largura da janela**, em um único componente:

- base (sem query): vale de 1024px para cima → PC 1440 e tablet horizontal 1280 usam **o mesmo arranjo**;
- `@media (max-width:1023px)`: tablet em pé (comentário do protótipo: "o campo do ID vem primeiro, alto na tela, longe do teclado");
- `@media (max-width:719px)`: celular (herda também as regras de ≤1023).

A prop `largura` **não muda o layout**; só escolhe o sufixo dos links. A prop `estado` só escolhe o estado inicial. Não há container query nem largura fixa (a versão anterior `Tablet.dc.html` era 1280×800 fixo).

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| Regra CSS ativa | base | base | ≤1023 | ≤1023 + ≤719 |
| Padding da página | 36px 56px | 36px 56px | 28px 32px | 16px |
| Espaço entre blocos (`gap`) | 32px | 32px | 28px | 20px |
| Colunas (não vinculado) | 2: passos (flex) + formulário 560px | 2: passos (flex) + formulário 560px | 1 | 1 |
| Largura útil / passos / formulário | 1328 / 736 / 560 | 1168 / 576 / 560 | 736 / 736 / 736 | 358 / 358 / 358 |
| Ordem dos blocos | cabeçalho → passos (esq.) + formulário (dir.) | igual ao PC | cabeçalho → **formulário** → passos | cabeçalho → **formulário** → passos |
| Alinhamento do formulário | topo da coluna (`align-self:flex-start`) | igual | esticado na largura (`order:-1`) | esticado |
| Navegação | só botão "Voltar" no cabeçalho | igual | igual | igual |
| Botão "Voltar" | 52×52 | 52×52 | 52×52 | 48×48 |
| Cabeçalho | alinhado ao centro, gap 20 | igual | igual | alinhado ao topo, gap 14 |
| Título `h1` | 40px / 800 | 40px | 40px | 30px |
| Subtítulo | 17px | 17px | 17px | 15px, entrelinha 1.35 |
| Logo 56×56 | visível à direita | visível | visível | **escondido** |
| Rótulo "COMO FUNCIONA" | 15px caixa alta | 15px | 15px | 15px |
| Cartão de passo: padding / gap | 20 / 18 | 20 / 18 | 20 / 18 | 16 / 14 |
| Círculo do número | 44px, número 22px | igual | igual | igual |
| Passo: título / texto | 19px / 16px | 19 / 16 | 19 / 16 | 18 / 15 |
| Formulário: padding / gap interno | 32 / 20 | 32 / 20 | 32 / 20 | 20 / 16 |
| Rótulo "ID do tablet" | 20px | 20px | 20px | 18px |
| Campo do ID: altura / letra | 64px / 22px | 64 / 22 | **72 / 24** | 60 / 20 (padding lateral 14) |
| Botão "Colar": altura / letra | 64px / 18px (padding 20) | 64 / 18 | **72** / 18 (padding 24) | 60 / 17 (padding 16) |
| Botão "Vincular tablet": altura / letra | 64px / 20px | 64 / 20 | **72** / 20 | 60 / 19 |
| Botão "Escanear QR code…": altura / letra | 56px / 18px | 56 / 18 | 56 / 18 | 56 / 17 |
| Mensagem de erro / dica | 16px / 15px | igual | igual | igual |
| Cartão "vinculado": largura | `max-width:720`, centralizado | 720 centralizado | 720 centralizado (sobram 8px de cada lado) | 100% (358) |
| Cartão "vinculado": padding / gap | 32 / 22 | 32 / 22 | 32 / 22 | 20 / 18 |
| Ícone de "check" | círculo 56px | 56 | 56 | 56 |
| "Tablet vinculado" (título) | 32px / 800 | 32 | 32 | 26 |
| Linhas Nome/Setor/ID | 18px, padding 14px 0 | 18 | 18 | 16 |
| Opções (caixas) | 2 colunas | 2 colunas | 2 colunas | **1 coluna** |
| Opção: altura mínima / caixa / letra | 60px / 26px / 17px | igual | igual | igual |
| "Abrir a Montagem": altura / letra | 64px / 20px | 64 / 20 | 64 / 20 | 60 / 19 |
| "Usar outro ID": altura / letra | 48px / 16px | igual | igual | igual |
| Menor alvo de toque | 48px ("Usar outro ID") | 48px | 48px | 48px |
| O que rola | a página inteira (`min-height:100vh`); o conteúdo cabe sem rolar | idem; cabe em 800 de altura | página inteira; cabe em 1280 | página inteira rola (quadro de 1000 de altura) |
| O que é fixo | nada (`position` fixa/sticky não é usada) | nada | nada | nada |
| Como o "detalhe" abre | não há painel nem folha: o estado vinculado **substitui** o conteúdo da própria página | igual | igual | igual |
| Vira lista/card | passos já são cards; nada muda | — | — | opções empilham |

Observações de responsividade:

- Entre 720 e 1023px (tablet em pé) os três controles principais do formulário **crescem** para 72px, e o formulário sobe para antes da explicação, para ficar longe do teclado virtual. O botão do QR e o cartão vinculado não mudam nessa faixa.
- PC e tablet horizontal diferem só pela largura da coluna de passos (736 vs 576px); não há `max-width` na página, então em monitores muito largos a coluna de passos estica sem limite.
- Fontes: Barlow (texto) e Barlow Semi Condensed (títulos e números), do Google Fonts.
- Interação: `button:active` reduz para 98% e escurece; foco visível com contorno de 3px `#BFDBFE`; `touch-action: manipulation`.
- Tema escuro: fundo `#0A0E15`, cartões `#111824` com borda `#26334A`, texto `#EEF2F8`, texto secundário `#B7C2D3` / `#A3B0C2`, azul de ação `#2563EB`.

## 9. Fase futura, desabilitado, placeholder

Nada está marcado explicitamente como "fase futura" ou "[ ]". O que é **simulação** e precisa de implementação real:

- "Escanear QR code da tela do admin": não abre câmera; só preenche `TAB-MONT-01`.
- "Colar": não lê a área de transferência; só preenche `TAB-MONT-01`.
- "Vincular tablet": não consulta nada; aceita qualquer texto com 4+ caracteres.
- Dados do cartão vinculado ("Tablet Montagem", "Montagem", cor) são fixos, não dependem do ID.
- "Abrir a Montagem": texto e destino fixos.
- Caixas "Manter a tela sempre ligada" e "Tela cheia": sem efeito e sem persistência.
- "Usar outro ID": só limpa o estado local.
- O QR no admin é um desenho (quadrados), não um QR real.
- Logo: imagem em `/_blob/…` do artefato.

## 10. Divergências com a versão anterior (`Tablet.dc.html`)

| Ponto | Versão anterior | Versão nova (`Tela-ConfigTablet-*`) |
|---|---|---|
| Larguras | só 1280×800 fixo, estilos inline | fluida, 4 larguras, classes + media queries |
| Placeholder do campo | "Cole ou digite o ID gerado pelo admin" | "Ex.: TAB-MONT-01" |
| Atributos do campo | `autocomplete="off"` | acrescenta `autocapitalize="characters"` e `spellcheck="false"` |
| Mensagem de erro | sem `role` | `role="alert"` |
| Opções: altura mínima / caixa | 56px / 24px | 60px / 26px |
| Cartão vinculado | `width:720px` fixo | `width:100%; max-width:720px` |
| "Voltar" | `Hub.dc.html` | `Tela-Area{sufixo}` |
| "Abrir a Montagem" | `Montagem.dc.html` | `Tela-Montagem{sufixo}` |
| Lógica (estado, `pronto`, handlers, textos dos passos) | idêntica | idêntica |

A versão anterior não tem nenhuma regra a mais que a nova tenha resumido.

## 11. Dúvidas reais para o card

1. **Acesso**: a tela exige login (senha de acesso de `Tela-Entrar`) ou pode ser aberta num aparelho novo sem sessão? Qual perfil pode vincular (qualquer um, só admin/líder)?
2. **"Abre direto no setor"**: depois de vinculado, o aparelho pula `Tela-Entrar` e `Tela-Area`? O operador ainda digita senha? Como o tablet sai do setor para ver RH/Área?
3. **Conteúdo do QR**: só o ID em texto, ou uma URL com token de uso único que já vincula ao abrir? Escanear vincula direto ou só preenche o campo (como no protótipo)?
4. **Leitura do QR**: câmera dentro do app (precisa HTTPS e permissão) ou câmera nativa abrindo um link? O que mostrar se a permissão for negada ou não houver câmera (PC)?
5. **"Colar"**: usar a Clipboard API (pede permissão; no iPad aparece o balão "Colar") ou só focar o campo? O que fazer se a área de transferência estiver vazia?
6. **Segurança do ID**: `TAB-MONT-01` é curto e adivinhável. O ID é de uso único? Expira? Há limite de tentativas? Precisa estar logado para vincular?
7. **ID já vinculado**: se o ID já está "Vinculado" em outro aparelho, recusa, ou o novo aparelho toma o lugar (e o antigo é desligado)?
8. **Mensagens de erro**: manter a mensagem única ou separar "formato inválido", "não encontrado", "já em uso", "sem conexão"?
9. **Formato do ID**: validar `TAB-XXXX-NN` no cliente? Aceitar minúsculas e espaços (normalizar)? O número é sequencial global ou por setor?
10. **"Usar outro ID"**: desvincula no servidor (o cadastro volta a "Aguardando vínculo") ou só no aparelho? Precisa de confirmação? Quem pode fazer isso num tablet em produção?
11. **Desvínculo pelo admin** ("Desvincular este tablet" / "Gerar novo ID"): o que o tablet mostra na hora (volta para esta tela? aviso?) e o que acontece com registros feitos offline e ainda não enviados?
12. **"Manter a tela sempre ligada"**: usar Screen Wake Lock API (suporte no Safari do iPad a partir do 16.4; cai ao trocar de aba)? Guardar a preferência no aparelho ou no cadastro do tablet?
13. **"Tela cheia"**: Fullscreen API (exige gesto do usuário a cada abertura e não existe no iPhone) ou PWA instalado em modo standalone? O que a caixa faz quando o navegador não suporta?
14. **Setor "TV da fábrica (só visualizar)"**: o que o cartão vinculado mostra e para onde vai o botão "Abrir …" nesse caso?
15. **Texto do botão "Abrir a Montagem"**: confirmar que é dinâmico ("Abrir a Injetora", "Abrir o Teste & Embalagem") e a concordância de cada setor.
16. **PC e celular**: faz sentido vincular um PC ou um celular a um setor? Os quadros existem, mas o texto fala sempre em "tablet". Bloquear, permitir ou só mostrar a explicação?
17. **Offline**: o vínculo precisa de rede. Qual é a tela de "sem conexão" e de "validando"? Depois de vinculado, o aparelho precisa reconhecer o vínculo sem rede.
18. **Persistência do vínculo**: cookie de longa duração, token em IndexedDB, ou os dois? O que acontece se o navegador limpar os dados (Safari apaga dados de sites sem uso após 7 dias fora de PWA instalado)?
19. **Rodapé de `Tela-Area`**: com o aparelho vinculado, o que aparece no lugar de "Este aparelho ainda não está ligado a um setor"? Abrir esta tela já vinculado mostra o cartão "Tablet vinculado" (como nos quadros `-Vinculado`)?
20. **Mais de um tablet por setor** ("Tablet Injetora 2" aparece no admin): há alguma regra de concorrência entre dois tablets do mesmo setor, ou é só origem diferente no histórico?
