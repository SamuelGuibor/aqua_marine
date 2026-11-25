# Mapa do protótipo · Entrar (login) · chave `entrar`

Fonte: quadros `Tela-Entrar-PC`, `Tela-Entrar-TabletH`, `Tela-Entrar-TabletV`, `Tela-Entrar-Celular` (versão nova, responsiva) e `Login` (versão anterior, só 1280×800).
No canvas ("TP Sistema — Redesign UX") os quatro quadros novos ficam na faixa "Entrada · PC, tablet e celular", sob o título "Entrar".

> Os quatro quadros `Tela-Entrar-*` são **o mesmo arquivo**: o `diff` só acusa o `<title>`, o valor padrão da prop `largura` e o tamanho do preview. Marcação, CSS e lógica são idênticos. Não há texto de instrução escondido nos arquivos.

---

## 1. Propósito e quem usa

- Porta de entrada única do sistema AquaPulse. Aparece antes de tudo e é para onde o botão "Sair" devolve.
- Quem usa: **todo mundo** que abre o sistema (operador no tablet do setor, RH no computador, administrador). A tela não distingue perfil: só pede uma senha.
- O texto da faixa da marca descreve o produto: "Registro da fábrica no tablet e acompanhamento do RH no computador, com o mesmo número nos dois."
- Depois de entrar, a pessoa cai na tela **Área** ("Para onde você vai?"), onde escolhe Fábrica, RH ou configuração do tablet. Ou seja: a escolha de destino é feita depois do login, não pelo login.

## 2. Blocos da tela (de cima para baixo / da esquerda para a direita)

### 2.1 Faixa da marca (`<aside class="lg-brand">`)
Fundo azul-marinho `#00246A`, texto branco. Conteúdo:
1. Onda decorativa (SVG 620×230, duas formas: `#90DAFF` a 22% e `#1976F3` a 75%). `aria-hidden`.
2. Ícone da marca: quadrado branco com cantos arredondados contendo o símbolo (imagem `/_blob/b1215d43f356309ca21b972f311e8a28`, `alt=""`).
3. Sobretítulo: "AQUAPULSE" (cor `#90DAFF`, 700, espaçamento .12em).
4. Título `h1`: "Sistema de produção" (Barlow Semi Condensed 800).
5. Parágrafo: "Registro da fábrica no tablet e acompanhamento do RH no computador, com o mesmo número nos dois." (cor `#D3E2F8`, largura máx. 380px).

### 2.2 Área do formulário (`<main class="lg-main">`)
1. Logotipo horizontal "AquaPulse" (imagem `/_blob/ca29809a80155992525940c070438ad3`, 336×46, `alt="AquaPulse"`). Só nas larguras com duas colunas.
2. Cartão do formulário (fundo `#111824`, borda `#26334A`, raio 20px):
   - Título `h2`: "Entrar".
   - Campo com rótulo "Senha de acesso" (`label for="senha"`), `input id="senha"`, placeholder "Digite a senha", `autocomplete="current-password"`, tipo `password` (ou `text` quando a senha está visível).
   - Dentro da caixa do campo, à direita: botão de olho (ícone) para mostrar/esconder a senha.
   - Botão principal "Entrar" com seta para a direita (azul `#2563EB`, texto branco).
   - Texto de ajuda centralizado: "Esqueceu a senha? Peça ao administrador."

Não há campo de usuário/e-mail, "lembrar de mim", seletor de setor, link de cadastro nem rodapé.

## 3. Ações e o que a lógica faz

| Ação | Elemento | Efeito no protótipo |
|---|---|---|
| Digitar a senha | `input#senha` | Campo livre. **Nenhuma validação**: o valor nem é lido pela lógica. |
| Mostrar/esconder senha | botão `lg-olho` (`type="button"`) | Alterna `state.ver` (começa `false`). Troca o `type` do input entre `password` e `text`; `aria-label` vira "Esconder a senha" / "Mostrar a senha"; `aria-pressed` vira `true`/`false`. O ícone não muda de desenho. |
| Entrar | `<a class="lg-entrar">` | É um **link**, não um submit: navega direto para `Tela-Area-<largura>.dc.html`, com qualquer senha ou campo vazio. |
| Foco por teclado | input, botão, link | Contorno de foco 3px `#BFDBFE` com offset 2px; a caixa do campo ganha borda `#60A5FA` em `:focus-within`. |
| Passar o mouse em "Entrar" | hover | `filter: brightness(1.08)`. |

Não existem: confirmação, desfazer, contagem de tentativas, bloqueio, mensagem de erro, carregando, Enter enviando o formulário (o `<form>` não tem `action` nem botão submit).

## 4. Estados

Desenhados:
- **Normal, senha oculta** (padrão).
- **Senha visível** (após tocar no olho).
- **Foco** no campo / nos botões.

Não desenhados (o protótipo declara a prop `estado`, com padrão vazio, mas **não a usa**):
- Senha errada / campo vazio.
- Enviando (carregando).
- Bloqueio por excesso de tentativas.
- Sem conexão (relevante: o tablet do operador trabalha offline, conforme a stack Serwist + Dexie).
- Sessão expirada (voltar para Entrar com aviso).
- Já autenticado abrindo `/entrar` (redirecionar?).

## 5. Regras de negócio e contas

A tela não tem contas, metas nem limites. O que ela implica:
- **Acesso por senha única, sem identificação de usuário.** Rótulo "Senha de acesso", nenhum campo de login. Parece uma senha compartilhada do sistema (ou uma por perfil); o protótipo não decide.
- **Recuperação de senha é manual**: "Esqueceu a senha? Peça ao administrador." Não há fluxo de "esqueci a senha" por e-mail.
- **Existe um papel "administrador"** que conhece/troca a senha (o mesmo que cria tablets em "Admin › Tablets", citado na tela de configuração do tablet).
- **Destino fixo após o login**: sempre a tela Área, para qualquer pessoa.
- Valores configuráveis: nenhum visível. A própria senha é, por natureza, um dado configurável pelo administrador, mas não há tela desenhada para trocá-la.

## 6. Entidades e dados implícitos

Nada disto aparece na tela; é o mínimo para ela funcionar de verdade (inferência a confirmar):

| Entidade | Campos prováveis | Observação |
|---|---|---|
| Credencial de acesso | hash da senha, papel/perfil (se houver mais de uma senha), atualizado em, atualizado por | O protótipo sugere uma senha só. Se houver senha por perfil (fábrica / RH / admin), vira uma linha por perfil. |
| Sessão | id, papel, criado em, expira em, aparelho/tablet (opcional) | A stack do projeto prevê Auth.js; sessão por cookie. |
| Tentativa de acesso (auditoria) | data/hora, sucesso ou falha, aparelho/IP | Não desenhado; só se houver bloqueio por tentativas ou auditoria. |

Eventos que a tela gravaria: entrada com sucesso, entrada recusada, saída ("Sair" na tela Área). Nenhum evento de produção.

## 7. Navegação

- "Entrar" → **Área** (`Tela-Area-PC` / `-TabletH` / `-TabletV` / `-Celular`, conforme a prop `largura`).
- Chegada: o botão "Sair" do cabeçalho da tela Área aponta para `Tela-Entrar-<largura>`.
- Não há outros links na tela.
- Versão anterior: `Login` → `Hub` (a antiga "Área"), e o "Sair" do `Hub` volta para `Login`.

## 8. Responsividade

### 8.1 Mecanismo
- **Media queries de CSS pela largura da janela** (não é container query nem prop):
  - base (≥ 1024px): duas colunas lado a lado. Vale para PC 1440 e tablet horizontal 1280.
  - `@media (max-width:1023px)`: empilhado, marca vira faixa no topo (tablet vertical 800).
  - `@media (max-width:719px)`: faixa curta em linha, tudo compacto (celular 390).
- A prop `largura` (`pc` | `h` | `v` | `cel`) **não muda o arranjo**: só escolhe o sufixo do link de destino. No sistema real ela desaparece (uma rota só).
- Raiz `.lg` tem `min-height:100vh` e `display:flex`; a página rola naturalmente se o conteúdo passar da altura. Nada é fixo/sticky.
- PC 1440 e tablet horizontal 1280 usam **exatamente o mesmo arranjo**; só sobra mais espaço na coluna do formulário (920px contra 760px). No canvas o quadro PC tem `expand: fill`.
- Comentário no CSS do tablet em pé: "marca vira faixa no topo, formulário logo abaixo (acima do teclado)". A intenção é o campo não ficar escondido pelo teclado virtual.

### 8.2 Tabela parâmetro × largura

| Parâmetro | PC 1440×900 | Tablet horizontal 1280×800 | Tablet vertical 800×1280 | Celular 390×844 |
|---|---|---|---|---|
| Regra de CSS ativa | base | base | `max-width:1023px` | `max-width:1023px` + `max-width:719px` |
| Arranjo geral | 2 colunas (linha) | 2 colunas (linha) | 1 coluna (empilhado) | 1 coluna (empilhado) |
| Ordem dos blocos | marca à esquerda, formulário à direita | igual ao PC | faixa da marca em cima, formulário embaixo | faixa curta em cima, formulário embaixo |
| Faixa da marca: tamanho | largura fixa 520px, altura total | largura fixa 520px, altura total | largura total, `min-height` 340px | largura total, altura do conteúdo (~108px) |
| Faixa da marca: padding | 56px | 56px | 48px | 24px 20px |
| Faixa da marca: disposição interna | coluna, ícone no topo e textos no pé (`space-between`) | igual | coluna, tudo encostado embaixo (`flex-end`), gap 28px | **linha**: ícone à esquerda, textos à direita, gap 16px |
| Onda decorativa | visível, `left:-40px; top:262px` | igual | visível, movida para `right:-140px; top:28px` | oculta |
| Ícone da marca (caixa / imagem) | 92×92 raio 24 / 68×68 | 92×92 / 68×68 | 92×92 / 68×68 | 60×60 raio 16 / 44×44 |
| "AQUAPULSE" (sobretítulo) | 14px | 14px | 14px | 13px |
| `h1` "Sistema de produção" | 56px | 56px | 56px | 30px |
| Parágrafo descritivo | visível, 19px | visível, 19px | visível, 19px | oculto |
| Coluna do formulário: largura útil | ~920px | ~760px | 800px | 390px |
| Coluna do formulário: alinhamento | centro vertical e horizontal | centro vertical e horizontal | topo, centro horizontal | topo |
| Coluna do formulário: padding | 40px 32px | 40px 32px | 56px 48px | 24px 16px 32px |
| Caixa do formulário: largura máx. | 440px | 440px | 560px | 100% (358px em 390) |
| Logotipo horizontal 336×46 | visível acima do cartão (gap 36px) | visível | oculto | oculto |
| Cartão: padding / gap interno | 32px / 22px | 32px / 22px | 32px / 22px | 24px / 20px |
| `h2` "Entrar" | 34px | 34px | 34px | 30px |
| Rótulo "Senha de acesso" | 17px, 600 | 17px | 17px | 17px |
| Campo de senha: altura | 60px | 60px | **68px** | 60px |
| Campo de senha: fonte | 19px | 19px | **21px** | 19px |
| Botão do olho (alvo de toque) | 48×48 | 48×48 | **56×56** | 48×48 |
| Botão "Entrar": altura | 60px | 60px | **68px** | 60px |
| Botão "Entrar": fonte | 19px, 700 | 19px | **21px** | 19px |
| Botão "Entrar": largura | 100% do cartão (376px) | 376px | 100% do cartão (496px) | 100% do cartão (310px) |
| Texto de ajuda | 15px, centralizado | 15px | 15px | 15px |
| Rolagem | não rola (cabe em 900) | não rola (cabe em 800) | não rola; formulário termina por volta de 745px de 1280 | não rola; formulário termina por volta de 440px de 844 |
| Elementos fixos | nenhum | nenhum | nenhum | nenhum |
| Navegação | não há menu nesta tela | idem | idem | idem |
| Detalhe/painel/folha | não se aplica | idem | idem | idem |

Observações:
- Os maiores alvos de toque estão no **tablet vertical** (68px), não no horizontal. No tablet horizontal, que é o aparelho do operador, os alvos são de 60px (campo e botão) e 48px (olho).
- iPad na horizontal com 1024px de largura cai na regra de duas colunas (a quebra é `max-width:1023px`); iPads em pé (768 a 834) e o tablet de RH de 820 caem no arranjo empilhado.
- Entre 720 e 1023px o arranjo é sempre o do tablet vertical; abaixo de 720px, o do celular.
- Posições aproximadas de "onde o formulário termina" foram calculadas a partir do CSS, não medidas num navegador.

### 8.3 Tokens visuais usados
- Fundo da página `#0A0E15`; texto `#EEF2F8`; faixa da marca `#00246A`; sobretítulo `#90DAFF`; parágrafo da marca `#D3E2F8`.
- Cartão `#111824` com borda `#26334A`, raio 20px; campo com borda `#4B5B78`, fundo `#0A0E15`, raio 12px; placeholder `#8592A6`.
- Botão do olho: fundo `#182233`, ícone `#CBD5E1`, raio 10px.
- Botão principal `#2563EB`, texto `#FFFFFF`, raio 12px.
- Ajuda `#A3B0C2`. Foco: contorno `#BFDBFE` 3px, borda do campo `#60A5FA`.
- Fontes: Barlow (400/500/600/700) para texto; Barlow Semi Condensed (600/700/800) para `h1` e `h2`.
- Só tema escuro.

## 9. Fase futura, desabilitado, placeholder

- Nada está marcado como fase futura, "[ ]" ou desabilitado nesta tela.
- Placeholders de fato:
  - a autenticação inteira (o botão é um link, sem conferir senha);
  - a prop `estado`, declarada e sem uso (nenhum estado alternativo desenhado);
  - as imagens da marca são blobs do artefato (`/_blob/...`), precisam virar arquivos do projeto.

## 10. Divergências entre a versão anterior (`Login`) e a nova (`Tela-Entrar-*`)

| Item | `Login` (anterior) | `Tela-Entrar-*` (nova) |
|---|---|---|
| Tamanho | fixo 1280×800 (estilos inline) | fluido, `min-height:100vh`, três arranjos por media query |
| Campo de senha | input simples, 58px de altura, fonte 18px | caixa de 60px (68 no tablet em pé), fonte 19px (21), com botão de olho |
| Mostrar/esconder senha | não existe | existe (`state.ver`) |
| Texto de ajuda | não existe | "Esqueceu a senha? Peça ao administrador." |
| Botão "Entrar" | 58px de altura | 60px (68 no tablet em pé) |
| `autocomplete` | ausente | `current-password` |
| Foco visível | padrão do navegador | contorno desenhado |
| Destino | `Hub` | `Tela-Area-<largura>` |
| Textos da marca, cores, logotipo | iguais | iguais |

A versão anterior não traz nenhuma regra que a nova tenha perdido.

## 11. Dúvidas reais para quem vai escrever os cards

1. **Modelo de acesso**: é uma senha única para o sistema inteiro, uma senha por perfil (fábrica / RH / administrador) ou usuário + senha individual? A tela só tem "Senha de acesso". A resposta define o esquema do banco e a configuração do Auth.js.
2. **Perfis e permissão**: depois de entrar, todos veem a mesma tela Área com Fábrica, RH e configuração? O operador pode abrir o RH? O protótipo não restringe nada.
3. **Quem é o "administrador"** e onde ele troca a senha? Não há tela de troca de senha desenhada.
4. **Erro de senha**: texto, posição (abaixo do campo?) e cor do aviso não existem no protótipo. Idem para campo vazio.
5. **Limite de tentativas / bloqueio temporário**: existe? Quantas tentativas e por quanto tempo?
6. **Duração da sessão**: o tablet do setor fica logado o turno inteiro, dias, para sempre? "Sair" existe só na tela Área.
7. **Tablet vinculado a um setor**: pula o Entrar e a Área e abre direto a tela do setor, ou sempre pede senha?
8. **Sem conexão**: dá para entrar offline (sessão guardada no aparelho) ou o login exige rede? Qual mensagem aparece?
9. **Sessão expirada no meio do turno**: o que acontece com o registro em andamento no tablet?
10. **Enter no teclado** envia o formulário? (No protótipo o botão é um link; no real deve ser um `submit`.)
11. **Estado "enviando"**: botão desabilitado com indicador?
12. **Já autenticado abrindo a tela de entrar**: redireciona para a Área?
13. **Ícone do olho**: muda para "olho riscado" quando a senha está visível? No protótipo o desenho é o mesmo.
14. **Tablet horizontal com teclado virtual aberto**: o formulário fica centralizado na vertical em 800px de altura; com o teclado ocupando metade da tela ele pode ficar encoberto. Precisa de ajuste (alinhar ao topo ou rolar até o campo)?
15. **Rota**: `/entrar`? E a raiz `/` redireciona para onde quando não há sessão?
