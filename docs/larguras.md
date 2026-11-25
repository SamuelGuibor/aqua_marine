# Larguras · cortes, cascas e conferência

Toda tela funciona no PC, no tablet deitado (o aparelho do operador), no tablet em pé e no celular. Este guia diz quais
são os cortes, o que cada tela precisa cumprir e como conferir.

```powershell
npm run teste:larguras
```

## Os cortes

Estão em `theme.screens` do `tailwind.config.ts` e **substituem** os do Tailwind: `sm:`, `md:`, `lg:` e `xl:` não existem
(nenhum CSS é gerado para elas). O código é "celular primeiro": a classe sem prefixo é a do celular, e cada prefixo vale
daquela largura para cima.

| Prefixo | Vale quando | Janela de referência | Arranjo |
| --- | --- | --- | --- |
| (nenhum) | sempre | celular 390 | fábrica em 1 coluna; RH com abas embaixo |
| `tablet:` | largura ≥ 768 px | tablet em pé 800 (RH: 820) | fábrica com teclado em cima e 2 colunas; RH em 1 coluna |
| `largo:` | largura ≥ 1024 px | nenhuma (intermediário) | |
| `pc:` | largura ≥ 1200 px | PC 1440 | RH em 2 colunas |
| `posto:` | largura ≥ 1280 px | tablet deitado 1280 e PC 1440 | fábrica com cartões em cima e teclado embaixo |
| `toque:` | `pointer: coarse` | tablets e celular | |
| `baixo:` | altura < 720 px | nenhuma | tablet fora do app instalado, teclado virtual aberto |

Como `toque` e `baixo` são consultas livres, o Tailwind 3 **não gera as variantes `max-*`** (`max-tablet:` etc.). Para
esconder do tablet para cima, use `tablet:hidden`; para mostrar só a partir de um corte, `hidden posto:flex`.

Um iPad deitado (1180×820) fica abaixo de `pc` e `posto`: recebe o arranjo "em pé", com rolagem, e isso é aceito.

## Alvo de toque: `h-toque`

Altura mínima do que se toca: **48 px** no celular, **44** no tablet, **40** no PC com mouse (44 no PC quando a tela é de
toque).

```tsx
<button type="button" className="h-toque rounded-10 px-6">Continuar</button>
<a href="/area" className="h-toque inline-flex items-center px-2">Trocar de área</a>
```

- É `min-height`: um botão de 56, 60 ou 64 px continua do tamanho dele, e `min-h-[56px]` no mesmo elemento vence.
- Em `<a>` é preciso `flex` ou `inline-flex`: elemento em linha ignora altura.
- Não cuida da largura: botão só com ícone precisa de `min-w-*` próprio.

## As duas cascas de página

Toda tela usa uma delas na raiz. O miolo é filho direto da casca.

**Tela que cabe** (`casca-cabe`): ocupa pelo menos a janela, o miolo estica e, se o conteúdo passar, a página inteira
rola. É a casca de Entrar, Área, Setores, Injetora, Montagem e Teste.

```tsx
<div className="casca-cabe">
  <header>...</header>
  <main className="casca-cabe-miolo">...</main>
  <footer>...</footer>
</div>
```

**Tela com miolo que rola** (`casca-rola`): do tablet para cima a tela tem a altura da janela, cabeçalho e rodapé ficam
parados e só o miolo rola. No celular, ou com a janela mais baixa que 720 px, a página rola inteira. É a casca de Mesas e
dos Históricos.

```tsx
<div className="casca-rola">
  <header>...</header>
  <main className="casca-rola-miolo">...</main>
  <footer>...</footer>
</div>
```

## Matriz "rola / não rola"

Derivada do protótipo (<https://claude.ai/artifact/LFC3oCvfAfdz288hmVFxNv>, versão `1795569230-f319`): quadro com a mesma
altura da janela = **não rola** (a página não rola na vertical); quadro mais alto = rola. O número entre parênteses é a
altura do quadro. "—" = não há quadro, nada é exigido. No celular a página sempre pode rolar.

### Fábrica, entrada e Admin (quadros `Tela-*`)

| Tela | Casca | pc | tablet-h | tablet-v | celular | rh-tablet |
| --- | --- | --- | --- | --- | --- | --- |
| Entrar | cabe | não rola | não rola | não rola | rola | — |
| Área | cabe | não rola | não rola | não rola | rola (1180) | — |
| Configurar tablet (e Vinculado) | cabe | não rola | não rola | não rola | rola (1000) | — |
| Admin › Tablets | cabe | rola (1048) | rola (860) | não rola | rola (1480) | — |
| Setores | cabe | não rola | não rola | não rola | rola (1620) | — |
| Injetora (e Lote, Pausa) | cabe | não rola | não rola | não rola | rola (1920) | — |
| Montagem, 3 raias (e Pausa) | cabe | não rola | não rola | não rola | rola (1760) | — |
| Mesas (e Operadoras) | miolo rola | não rola | não rola | não rola | rola (2080) | — |
| Teste & Embalagem (e Lote, Pausa) | cabe | não rola | não rola | não rola | rola (2000) | — |
| Histórico Injetora / Montagem / Teste | miolo rola | não rola | não rola | não rola | rola | — |

"Admin › Botões ESP32" ainda não tem quadro no protótipo.

### RH (quadros `RH2-*`)

O RH não tem quadro próprio em `tablet-h` e `tablet-v`: nada é exigido nessas duas.

| Tela | pc | rh-tablet | celular |
| --- | --- | --- | --- |
| Agora (e setor aberto) | rola (1380) | rola (1260 a 1460) | rola |
| Desempenho (e Registro aberto) | rola | rola | rola |
| Pedidos e estoque | rola (1220) | rola (2150) | rola |
| Pedidos · OP aberta | não rola | não rola | rola |
| Pausas | rola (1500) | rola (2320) | rola |
| Pausas · Classificar | não rola | — | rola |
| Pausas · Motivos | não rola | não rola | rola |
| Painel Metas | rola (1200) | — | rola |
| Painel Exportar (e Prévia) | rola (1320) | — | rola |

## A conferência

### Preparar a máquina (uma vez)

Baixa o Chromium do Playwright (cerca de 350 MB). Repita quando a versão do `@playwright/test` mudar.

```powershell
npx playwright install chromium
```

### Comandos

Tudo, em todas as janelas (faz o build, sobe o servidor com a galeria ligada e confere):

```powershell
npm run teste:larguras
```

Só uma janela:

```powershell
npm run teste:larguras -- --project=tablet-h
```

Só as fotos de uma tela, em `fotos/<tela>/` (fora do Git), para colar no PR:

```powershell
npm run fotos -- exemplo
```

- O servidor usa a porta 4100; se estiver ocupada, defina `LARGURAS_PORTA`.
- A conferência roda contra o build de produção: o `next dev` desenha um indicador na tela. Não lê o banco.
- Cada foto é da página inteira. Numa casca "miolo que rola" aparece só o que cabe na janela.
- As fotos não são comparadas com nada, e as do Windows diferem das do Linux (fonte).

### Janelas e o que cada uma confere

| Janela | Tamanho | Toque | 1. Rolagem horizontal | 2. Rolagem vertical | 3. Alvo de toque | 4. Texto ≥ 14 px | 5. Foto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pc` | 1440×900 | não | sim | se a matriz diz "não rola" | não | sim | sim |
| `tablet-h` | 1280×800 | sim | sim | se a matriz diz "não rola" | 44 px | sim | sim |
| `tablet-v` | 800×1280 | sim | sim | se a matriz diz "não rola" | 44 px | sim | sim |
| `rh-tablet` | 820×1180 | sim | sim | se a matriz diz "não rola" | 44 px | sim | sim |
| `celular` | 390×844 | sim (móvel) | sim | não | 48 px | sim | sim |
| `ipad-h` | 1180×820 | sim | só avisa | não | não | não | sim |

1. **Rolagem horizontal:** nem a página nem um `casca-rola-miolo` têm conteúdo mais largo que a janela.
2. **Rolagem vertical:** a página não passa da altura da janela.
3. **Alvo de toque:** todo `button`, `a`, `input` e `select` visível tem a altura mínima, fora as exceções da tela.
4. **Texto:** nenhum texto visível abaixo de 14 px, inclusive o de dentro dos campos. Texto só para leitor de tela não
   conta. A ferramenta não enxerga texto criado por CSS (`::before`, `::after`) nem redução por `transform`.
5. **Foto:** uma por tela × janela × estado.

A conferência também testa a si mesma e os cortes (`tests/larguras/cortes.larguras.ts`): o `pointer: coarse` de cada
janela, a altura do `h-toque` e a troca em 767/768 e 1279/1280.

Margem lateral e o jeito de abrir o detalhe (painel, gaveta, tela cheia) são do card de cada tela: a ferramenta não confere.

### No CI

O job `larguras` do `.github/workflows/ci.yml` roda `npm run teste:larguras` em todo PR, sem segredo e sem banco, e
publica as fotos como artefato `fotos`.

## Registrar uma tela nova

Cada tela é uma **vista**: um componente que recebe tudo por props e não busca dados. A página real busca os dados e
entrega à vista; a galeria entrega os valores de exemplo do protótipo. O modelo é a tela `exemplo`.

1. **Vista:** `components/vistas/Vista<Tela>.tsx`, com os tipos das props exportados e uma das duas cascas na raiz.
2. **Exemplo:** `lib/exemplos/<tela>.ts`, um conjunto de props por estado, com os valores do quadro. Nunca importe
   `lib/db` daqui nem da vista.
3. **Registro:** uma entrada em `lib/telas/registro.ts`:
   - `estados`: o primeiro é o padrão;
   - `naoRola`: as janelas marcadas "não rola" na matriz;
   - `naoRolaPorEstado`: só se um estado difere dos outros;
   - `excecoesDeToque`: seletor CSS e **motivo** de cada alvo que pode ser menor que o mínimo.
4. **Mapa:** uma linha em `app/dev/telas/[tela]/vistas.tsx`. Se faltar, a checagem de tipos acusa.
5. Confira e gere as fotos para o PR.

Registre também os **estados de limite**, que é onde a tela estoura aos 800 px de altura: pausa aberta, 4 ou mais
operadoras, vários setores parados ao mesmo tempo, listas cheias, nomes compridos, números com mais dígitos e a lista
vazia.

## A galeria

`/dev/telas/<tela>?estado=<estado>` mostra a vista com os valores de exemplo. Estado desconhecido cai no padrão.

Ela (como tudo em `/dev/*`) só existe com `GALERIA_TELAS=ligada`; sem isso o `proxy.ts` responde 404.

- **Na sua máquina:** acrescente `GALERIA_TELAS=ligada` ao `.env.local` e use `npm run dev`. A conferência liga sozinha.
- **Na Vercel:** cadastre a variável **só no ambiente Preview**. Nunca em Production.

## Conferência no aparelho

O navegador do computador não mostra o tablet de verdade. Antes do aceite (e quando uma tela nova tiver campo de texto
ou trabalhar perto do limite de altura), confira no tablet Android da fábrica.

1. No tablet, ligue as opções do desenvolvedor e a **depuração USB**. Conecte o cabo e aceite o aviso.
2. No computador (precisa do Android Platform Tools), confirme que o aparelho aparece:

   ```powershell
   adb devices
   ```

3. Faça a porta 3000 do tablet apontar para a do computador:

   ```powershell
   adb reverse tcp:3000 tcp:3000
   ```

4. Rode `npm run dev` e abra `http://localhost:3000` no Chrome do tablet.
5. No computador, abra `chrome://inspect` no Chrome e inspecione a aba do tablet.
6. **Meça** no console: `innerWidth` e `innerHeight`. O aparelho pode informar menos que 1280×800; anote os números no card.
7. **App instalado em tela cheia** (depende do SCRUM-85): instale, abra pelo ícone e meça de novo. Fora do app instalado
   sobra menos altura, e a variante `baixo` libera a rolagem.
8. **Deitado e em pé:** gire o aparelho em cada tela. Deitado é o uso normal; em pé não pode ter rolagem horizontal.
9. **Teclado virtual:** toque em cada campo. O campo e o botão que confirma precisam continuar alcançáveis.
10. **Dedo:** toque nos alvos pequenos sem mirar; nenhum toque pode acertar o vizinho.
11. **Sem Wi-Fi** (depende do modo offline): desligue o Wi-Fi, use a tela, religue e confira que o que foi registrado subiu.
