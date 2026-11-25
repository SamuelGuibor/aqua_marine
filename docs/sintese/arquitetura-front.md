# AquaPulse · arquitetura de front e estratégia de responsividade

Síntese para virar os cards de "front / design system" e orientar cada card de tela.
Fontes: os 19 mapas em `docs/mapa/*.md`, o `PREPARACAO-DO-AMBIENTE.md`, o `CLAUDE.md`, os guias do Next 16 em `node_modules/next/dist/docs/` e uma contagem de cores, raios e media queries feita direto nos quadros `Tela-*` e `RH2-*`.

Chaves de família usadas neste documento: `entrar`, `area`, `config-tablet`, `admin-tablets`, `setores`, `injetora`, `montagem`, `mesas`, `teste`, `hist-injetora`, `hist-montagem`, `hist-teste`, `rh-agora`, `rh-desempenho`, `rh-pedidos`, `rh-pausas`, `rh-metas`, `rh-exportar`.

Estado do repositório hoje: Next 16.4.6 + React 19.3.1, `cacheComponents` e `partialPrefetching` ligados, Tailwind 3.4 com `tailwind.config.ts`, `app/layout.tsx` e `app/page.tsx` padrão (fontes Geist locais, `lang="en"`, tema claro/escuro automático). Não existe `public/`, `components/` nem nada em `lib/`.

---

## 0. Decisões em uma página

| Assunto | Decisão |
|---|---|
| Tema | Só escuro. Tokens num arquivo (`lib/tema/tokens.ts`) lido pelo `tailwind.config.ts`. Nenhuma cor fora da lista da seção 1. |
| Fontes | `next/font/google`: Barlow (400, 500, 600, 700) e Barlow Semi Condensed (600, 700, 800). Ficam hospedadas no próprio app, então funcionam offline. |
| Tailwind | Fica na versão 3.4 (já instalada). Escala de fonte em px igual à do protótipo. |
| Breakpoints | Quatro: **768, 1024, 1200, 1280**, com nomes `tablet`, `largo`, `pc`, `posto`. Mais dois por tipo de entrada: `toque` (`pointer: coarse`) e `baixo` (altura < 720). |
| Um componente por tela | Uma marcação só, arranjo trocado por CSS. Nada de arquivo por largura nem de troca por JavaScript. |
| Detalhes e painéis | Um componente `Sobreposicao` com três formas (painel lateral, folha de baixo, tela cheia), em cima do `<dialog>` nativo. |
| Estado de tela | Filtros, detalhe aberto e painel aberto ficam na URL (`?medida=3&registro=…&painel=metas`). O "voltar" do celular fecha o detalhe. |
| Gráficos | SVG e CSS próprios, sem biblioteca (seção 5). |
| Dados | Server Components com `<Suspense>` por bloco nas telas de consulta. Nas telas do operador, casca estática + ilha cliente que lê do Dexie (funciona offline). |
| PWA | `display: fullscreen`, sem travar orientação, Wake Lock ligado pelo vínculo do tablet (seção 6). |
| Teste de larguras | Playwright com 5 janelas fixas + galeria `/dev/telas` com os dados de exemplo do protótipo (seção 7). |

---

## 1. Tokens do tema escuro

### 1.1 Cores

Valores tirados dos quadros (contagem de ocorrências nos 95 arquivos `Tela-*` e `RH2-*`) e da tabela "Sistema visual" do Briefing RH parte 2.

**Superfícies**

| Token | Valor | Onde aparece |
|---|---|---|
| `fundo` | `#0A0E15` | fundo da página, campos, caixas internas |
| `nav` | `#0D121B` | barra do RH, barra do Admin, cabeçalho da Área, fundo dos painéis laterais |
| `cartao` | `#111824` | todo cartão |
| `azulejo` | `#0D1420` | azulejos dentro dos cartões do operador |
| `elevado` | `#182233` | botão do olho, fundo da prévia do relatório |
| `selecionado` | `#16223A` | item selecionado, chip, botão de stepper (hover `#1E2D4A`) |
| `foco-painel` | `#121D2E` | painel de setor em foco no RH · Agora |
| `borda` | `#26334A` | borda padrão de cartão |
| `borda-forte` | `#33425C` | botões de contorno, borda de painel |
| `borda-sutil` / `trilho` | `#1C2738` | borda de azulejo, trilho de barra e de anel |
| `borda-nav` | `#1F2A3D` | linha inferior das barras de navegação |
| `borda-campo` | `#4B5B78` | campo de texto, cartão de dia aberto |
| `borda-chip` | `#2E4470` | chip azul, cartão por medida |
| `borda-hover` | `#3B5B9A` | hover do cartão da Área |

**Texto**

| Token | Valor | Uso |
|---|---|---|
| `texto` | `#EEF2F8` | principal |
| `texto-2` | `#CBD5E1` | secundário forte (data, ID, segmento inativo) |
| `texto-corpo` | `#B7C2D3` | parágrafos de apoio |
| `texto-apoio` | `#A3B0C2` | rótulos, notas |
| `texto-fraco` | `#7D8BA0` | aba desabilitada, botão apagado |
| `texto-placeholder` | `#8592A6` | placeholder |

**Significado** (cor nunca informa sozinha: sempre com ícone ou palavra)

| Token | Cheio | Texto sobre escuro | Fundo | Borda | Texto sobre o cheio |
|---|---|---|---|---|---|
| `boa` | `#22C55E` | `#86EFAC` | `#0F2A1B` | `#1F6B3D` | `#052E16` |
| `atencao` (cabeça vazia, pausa) | `#F59E0B` | `#FCD34D` (claro `#FDE68A`) | `#2A1F07` (variações: cartão parado `#17130B`, linha pendente `#1F1806`, modal `#15110A`, botão de categoria `#211A0C` com borda `#4A3A14`) | `#7A5A12` (forte `#B7791F`) | `#2A1A00` |
| `perda` (perda, defeito, erro) | `#DC2626` | `#FCA5A5` (vivo `#F87171`, erro de campo `#EF4444`) | `#1A0D10` | `#7F1D1D` | `#FFFFFF` |
| `acao` | `#2563EB` (hover `#1D4ED8`) | `#93C5FD` (claro `#BFDBFE`) | `#0E1B36` | `#60A5FA` | `#FFFFFF` |

**Setores** (só identificam o setor)

| Setor | Cor | Claro | Outros |
|---|---|---|---|
| Injetora | `#60A5FA` | `#93C5FD` | — |
| Montagem | `#2DD4BF` | `#5EEAD4` | foco `#99F6E4`, painel Hoje `#0E2A26`, chip `#123B35` |
| Teste & Embalagem | `#C4B5FD` | `#DDD6FE` | reservado `#5B5490` |

**Categorias de pausa** (RH · Pausas, linha do tempo e barras): Manutenção `#F87171` · Falta de material `#FB923C` · Troca de medida `#E879F9` · Refeição `#64748B` · Energia, ar ou água `#FACC15` · Pessoas `#A3E635` · Outro `#94A3B8` · Sem motivo = âmbar listrado (gradiente repetido).

**Marca** (só na faixa do Entrar): `#00246A` (fundo), `#90DAFF` (sobretítulo e onda), `#1976F3` (onda), `#D3E2F8` (parágrafo).

**Folha do relatório** (único bloco claro, prévia e PDF): papel `#FFFFFF`, tinta `#141B26`, apoio `#4A5568`, chip `#E8EDF5`, aviso `#FEF2F2` / `#991B1B` / `#FECACA`.

**Véus**: `rgba(5,8,13,x)` com x = .74 (aviso de pausa), .72 (folha de filtros), .66 (painéis), .60 (gaveta de operadoras), .45 (menu "⋯").

### 1.2 Tipografia

- **Barlow** (400, 500, 600, 700): texto. **Barlow Semi Condensed** (600, 700, 800): números, títulos e rótulos dos botões grandes.
- `font-variant-numeric: tabular-nums` no `body` (o protótipo usa em todas as telas).
- Rótulos em caixa alta: 14 px, peso 700, `letter-spacing` .06 a .08em.
- Escala em px (a mesma do protótipo, sem arredondar para a escala padrão do Tailwind): 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 46, 50, 56, 60, 64, 88.
- Texto mínimo: **14 px**. O protótipo usa 13 px em quatro lugares (nota dos cartões de resumo do Histórico, chips do Histórico, cabeçalho das tabelas de Mesas e Admin, sobretítulo do Entrar no celular). Recomendação: subir para 14 (regra escrita no diagnóstico e no briefing). Fica como dúvida 5.

**Tamanhos de número por papel**

| Papel | Operador (fábrica) | RH |
|---|---|---|
| Herói | 88 (total da Montagem, número do cartão de setor); 64 no tablet em pé e 60 no celular nos mesmos lugares | 60 (etapa do Agora), 56 (% das Metas do mês, pacotes atendidos) |
| Destaque | 64 (lote, dia, total da operadora) | 44 a 48 no tablet, 28 a 44 no celular |
| Secundário | 40 (tamanho, % da meta), 46 (quantidade da mesa), 34 (placas hoje, cartão por medida) | 38 (números do topo; 32 no celular), 36 (eficiência e tempo; 28 no celular) |
| Apoio | 24 (azulejo), 26 (data, métrica do histórico, mini) | 20 a 26 |
| Relógio | 28 | 24 (22 no celular) |
| Botão de registro | 50 principal, 30 secundário, 20 perda, 36 no "−1" | — |

**Títulos de tela (h1)**: RH 44 (36 ou 28 no celular) · Área 44 (32) · Config. tablet 40 (30) · Admin 40 (32) · Setores 32 (28) · Mesas 30 (26 em pé, 22 celular) · Histórico 28 (24) · Entrar: h1 56 (30), h2 34 (30).

### 1.3 Raios, foco e toque

- Raios: 6 (folha do relatório), 8, 10 (controles do RH), **12** (botões, campos, azulejos), **14** (cartões do RH e dos painéis), 16 (cartões de lista), **18** (cartões do operador, folha de baixo), 20 (cartão do Entrar), **22** (botão verde, aviso de pausa, cartão de setor), 24 (cartão da Área), 999 (pílulas).
- Foco visível: contorno de 3 px `#BFDBFE`, afastado 2 px. Variações: `#99F6E4` na Montagem, `#DDD6FE` no Teste, branco dentro do aviso amarelo.
- Toque: `touch-action: manipulation`, sem realce de toque, `:active` encolhe para .98 (ou .97) e escurece, `:hover` clareia (1.08 a 1.12). `prefers-reduced-motion` desliga animação e pulso.

**Alvos de toque** (altura mínima)

| Contexto | Valor |
|---|---|
| Operador: menor alvo permitido | 44 (`Fechar lote`, `Fechar dia`) |
| Operador: cabeçalho (Pausar, Histórico), voltar | 48 (voltar 52 em Setores, Mesas, Histórico) |
| Operador: `−1` / `+1` de mesa | 60 × 56 |
| Operador: stepper de placas por pacote | 64 × 52 |
| Operador: botões de registro | 72 (celular) a 300 (tablet em pé) |
| Operador: aviso de pausa | categoria 96 (64 no celular), motivo 60 (56), botões 64 |
| Entrada: campo e botão principal | 60 a 64 (68 a 72 no tablet em pé) |
| RH: regra por largura | 40 no PC, 44 no tablet, 48 no celular |

### 1.4 Como entra no Tailwind do projeto

1. **`lib/tema/tokens.ts`**: objeto único com cores, raios e tamanhos. Também é importado pelos gráficos (cor de setor em `conic-gradient` e em SVG).
2. **`tailwind.config.ts`**:
   - `content`: `./app/**/*`, `./components/**/*`, `./lib/**/*` (tirar `./pages`).
   - `theme.screens` **substituído** (não estendido): `tablet: '768px'`, `largo: '1024px'`, `pc: '1200px'`, `posto: '1280px'`, `toque: { raw: '(pointer: coarse)' }`, `baixo: { raw: '(max-height: 719px)' }`.
   - `theme.extend.colors`: os tokens acima em hex direto (assim `bg-cartao/70` funciona). Nomes em português: `fundo`, `nav`, `cartao`, `azulejo`, `borda`, `texto`, `boa`, `atencao`, `perda`, `acao`, `setor.inj`, `setor.mon`, `setor.tes`, `pausa.*`.
   - `theme.extend.fontFamily`: `sans: ['var(--font-barlow)', 'system-ui', 'sans-serif']`, `cond: ['var(--font-barlow-cond)', 'var(--font-barlow)', 'sans-serif']`.
   - `theme.extend.fontSize`: chaves numéricas em px (`text-14` … `text-88`), cada uma com a entrelinha do protótipo.
   - `theme.extend.borderRadius`: `12`, `14`, `18`, `22` etc. com o mesmo nome do valor.
3. **`app/globals.css`**: apagar o bloco `prefers-color-scheme` e as variáveis `--background` / `--foreground`. Em `@layer base`: `html { color-scheme: dark }`, `body` com `bg-fundo text-texto font-sans tabular-nums`, regra global de foco, `touch-action` e `-webkit-tap-highlight-color` nos botões, e a variável `--setor` (cada tela de setor define `style={{ '--setor': cor }}` e os componentes usam `bg-[var(--setor)]`).
4. **`app/layout.tsx`**: `lang="pt-BR"`, `Barlow` e `Barlow_Semi_Condensed` de `next/font/google` com `variable`, `display: 'swap'`, subconjunto `latin`; remover as fontes Geist; `export const viewport = { themeColor: '#0A0E15', colorScheme: 'dark', width: 'device-width', initialScale: 1 }`; `metadata` com o nome AquaPulse.
5. Dependência nova só de utilidade: `clsx` (juntar classes). Sem biblioteca de componentes.

Regra de escrita: o protótipo é "desktop primeiro" (`max-width`). No código é "celular primeiro": a classe sem prefixo é o celular, `tablet:` o tablet em pé, `posto:` o tablet deitado. `max-width:1279px` do protótipo = tudo que **não** tem `posto:`.

---

## 2. Inventário de componentes compartilhados

Pasta sugerida: `components/base/` (primitivos), `components/casca/` (cabeçalhos e navegação), `components/operador/`, `components/graficos/`, `components/sobreposicao/`, `components/dados/` (tabela, lista de dias). "C" = Client Component; sem marca = Server Component.

### 2.1 Cascas e navegação

| Componente | Props | Telas | Como muda por largura |
|---|---|---|---|
| `CabecalhoOperador` (barra do operador) · C só nos botões | `setor`, `sufixo?`, `data`, `estado` (rodando, parada sem motivo, pausado + motivo), `aoPausar`, `aoRetomar`, `hrefHistorico`, `hrefVoltar` | injetora, montagem, teste | ≥1280: 1 linha de 68 px, logo 44 à direita. 768 a 1279: 1 linha, sem logo e sem sufixo, pode quebrar. <768: 2 linhas (voltar + setor/data + pílula à direita; Pausar e Histórico dividindo a largura + relógio), padding 10/12. Botões sempre 48. |
| `CabecalhoTela` | `hrefVoltar?`, `rotuloVoltar`, `sobretitulo?` (com cor do setor), `titulo`, `subtitulo?`, `acoes?` (slot), `logo?` | setores, mesas, hist-injetora, hist-montagem, hist-teste, config-tablet, area (variante com logo à esquerda e Sair) | Altura 80 a 88 em tablet e PC; no celular altura automática e quebra em linhas. Logo some abaixo de 1280 (Mesas), abaixo de 1200 (Histórico) ou só no celular (Setores, Config). Voltar 52 (48 no celular, exceto Histórico, que mantém 52). |
| `Relogio` · C | `formato` (`hh:mm`, `dia, dd/mm · hh:mm`), `tamanho` | area, setores, injetora, montagem, teste, rh-agora, rh-desempenho, rh-pedidos, rh-pausas | Tamanho por tela (28 operador, 30 Setores, 26 Área, 24 RH, 22 RH celular). Na Área e em Setores a data desce de linha no celular. Renderiza vazio no servidor e preenche ao montar (não entra no shell estático). |
| `Logo` | `forma` (`horizontal`, `simbolo`), `tamanho` | todas | Horizontal 219×30 (RH, Admin), 263×36 (Área), 336×46 (Entrar), 175×24 a 190×26 no celular. Símbolo 44 a 56 nos cabeçalhos; esconde conforme a regra de cada cabeçalho. |
| `NavegacaoRH` (3 formas) · C nas abas ativas e no menu | `abaAtiva`, `acoesExtras?` (itens a mais no menu "⋯": Motivos e regras, Definir mínimos, Ajustar estoque) | rh-agora, rh-desempenho, rh-pedidos, rh-pausas, rh-metas, rh-exportar | **≥1200**: 1 linha de 68 px (logo + selo RH, 4 abas com ícone e texto 16, Metas, Exportar de 40 px, relógio), conteúdo até 1360. **768 a 1199**: 2 linhas (logo + relógio 60 px; abas 52 px + Metas/Exportar 44 px), 3ª aba vira "Pedidos". **<768**: topo fixo de 60 px (logo 175×24, relógio, "⋯" 48×48) e as abas viram barra fixa embaixo, 4 colunas, 62 px, ícone 22 sobre rótulo 14, traço em cima na ativa; Metas e Exportar vão para o menu "⋯". |
| `NavegacaoAdmin` | `abaAtiva`, lista de abas com `desabilitada` e `selo` ("fase 3") | admin-tablets (e as futuras abas do Admin) | Linha de cima 68 px (logo + pílula Admin, "Ir para o RH" 48). No celular "Ir para o RH" desce de linha e as abas rolam na horizontal. Conteúdo até 1360. |
| `AtualizaSozinho` · C | `intervaloSeg`, `mostrarHora?` | mesas, rh-agora, rh-pedidos, setores, area | Ponto verde pulsando + "atualiza sozinho" ou "atualizado 09:49:57". Chama `router.refresh()` com a aba visível. 15 px (14 no celular). |
| `AvisoSemConexao` + `IndicadorFila` · C | `pendentes` (lido do Dexie), `ultimoEnvio` | todas as da fábrica; no RH só o aviso | **Não existe no protótipo.** Proposta: faixa fina âmbar abaixo do cabeçalho ("Sem conexão · 3 registros guardados no tablet"), mesma linguagem da `FaixaPausado`, 1 linha em tablet e PC, quebra no celular. Precisa de aprovação (dúvida 7). |

### 2.2 Primitivos

| Componente | Props | Telas | Como muda por largura |
|---|---|---|---|
| `Botao` | `variante` (primario, secundario, contorno, atencao, perigo, tracejado, texto), `altura` (40, 44, 48, 52, 56, 60, 64), `icone?`, `larguraTotal?`, `href?` | todas | A altura vem da tela. No RH usa a regra 40/44/48 (classe utilitária `h-toque`). No celular, pares de botões de rodapé dividem a largura. |
| `BotaoVoltar` | `href`, `rotulo` (aria) | setores, injetora, montagem, mesas, teste, hist-*, config-tablet | 48 ou 52 conforme a tela; no celular 48 (Histórico mantém 52). |
| `Cartao` | `variante` (padrao, parado, alerta, selecionado, aberto), `bordaSetor?`, `como?` (a, button, section) | todas | Padding e raio descem no celular (ex.: 26/22 → 18/18 em Setores; 28/24 → 20/20 na Área; 20 → 16 no RH). |
| `Azulejo` (rótulo + valor) | `rotulo`, `valor`, `tom?` (boa, atencao, perda, setor), `nota?` | injetora, teste, montagem, setores, hist-*, rh-agora, rh-desempenho | Rótulo 14, valor 24 (26 a 30 nas minis de Setores, 20 no detalhe do Histórico). A grade muda de colunas (ver `GradeAzulejos`). |
| `GradeAzulejos` | `colunas` por faixa | injetora, teste, hist-*, rh-desempenho (números soltos) | Lote 3×2 → 2×3 abaixo de 1024 (3 colunas entre 1024 e 1279); Dia 4×3 → 2×6; detalhe do Histórico 4×2 → 2×4 no celular; números soltos do registro 3 → 2 colunas. Altura `minmax(52px,1fr)` no posto, 56 fixos no celular. |
| `CartaoNumero` (número do topo) · C no "i" | `icone`, `rotulo`, `valor`, `unidade?`, `nota`, `dica`, `tom?`, `extra?` (minigráfico, barra) | rh-agora, rh-desempenho, rh-pedidos, rh-pausas; variante simples nos resumos de hist-* | RH: 4 em linha (valor 38) em PC e tablet, 2×2 (valor 32) no celular; botão "i" 40/44/48. Histórico: 7 colunas → 4 abaixo de 1200 → 2 no celular, valor 30. |
| `PilulaEstado` (ponto + palavra) | `estado` (rodando, pausado, parada-sem-motivo, sem-producao, vinculado, aguardando, ativa, configurar), `texto` | injetora, montagem, teste, setores, area, mesas, admin-tablets, rh-agora, rh-pausas | 14 a 16 px. No celular do operador vai para a direita da 1ª linha do cabeçalho. Motivo longo precisa de reticências (defeito apontado no mapa da Injetora). |
| `RotuloSetor` | `setor`, `sufixo?`, `tamanho` | todas as que mostram setor | Quadradinho de 10 a 12 px + nome. Nome curto "Teste & Emb." onde o mapa indica (etapa do Agora no tablet, filtros, matriz). |
| `ChipMedida` | `medida` (2, 3, 4, 5), `forma` (curta "3 m", longa "3 m · 1,5 m²"), `extra?` ("15 pacotes", "76"), `vazio?` (tracejado "sem 2 m") | montagem, mesas, hist-*, rh-agora, rh-desempenho, rh-pedidos, rh-exportar | Não muda de tamanho. No celular do Agora os chips somem da lista e aparecem no resumo da tela cheia. |
| `ChipFiltro` · C | `rotulo`, `aoTirar` | rh-agora, rh-desempenho, rh-pedidos, rh-pausas | 40 px em PC e tablet, 48 no celular. No celular aparecem todos os filtros ativos; em PC e tablet só os que não estão à vista. |
| `Segmentado` | `rotulo`, `opcoes` (valor, texto, título longo), `valor`, `parametro` (nome na URL) ou `aoMudar` | hist-*, rh-agora, rh-desempenho, rh-pedidos, rh-pausas, e o seletor de setor do Agora no tablet | Com `parametro` é feito de `<Link replace>` (sem JavaScript). Botões 48 no Histórico; 40/44 no RH. No tablet do RH a faixa rola na horizontal. No celular: Histórico ocupa 100% com botões iguais; RH some e vai para a `FolhaFiltros`. |
| `Pilulas` · C | `opcoes`, `valor` ou `valores`, `multipla?`, `comCorDeSetor?` | rh-exportar, rh-pausas (classificar), rh-desempenho (folha) | 40 / 44 / 48 de altura mínima conforme a faixa. |
| `Contador` (+1 / −1) · C | `valor`, `min`, `max`, `passo`, `aoMudar`, `tamanho` (mesa 60×56 com valor 46; pacote 64×52 com valor 40; painel 44×44 com valor 26), `rotulos` (aria de menos e de mais) | montagem, mesas (só o −1), teste (placas por pacote), rh-metas, rh-pausas (minutos) | Operador: não muda. Painéis do RH: botões 44 → 48 no celular. Em zero o "−" fica apagado (.4) e de fato desabilitado. |
| `CampoTexto`, `CampoSenha`, `Selecao`, `CaixaMarcar`, `CampoBusca` · C | padrão de formulário + `erro`, `dica` | entrar, config-tablet, admin-tablets, mesas, hist-teste, rh-pedidos, rh-exportar, rh-metas | Campos 56 a 64 de altura (68 a 72 no tablet em pé nas telas de entrada: os controles **crescem** nessa faixa); selects 50; busca 260×58 no Histórico (100% no celular) e 260×44 no RH. |
| `EstadoVazio` | `icone?`, `texto`, `acao?` | hist-*, rh-agora, rh-desempenho, rh-pedidos, rh-pausas | Caixa tracejada; não muda. |
| `Esqueleto`, `EstadoErro` | `forma`, `aoTentar?` | todas | **Não existem no protótipo** (carregando e erro nunca foram desenhados). Proposta única para o sistema inteiro (dúvida 7). |
| `Icone` | `nome`, `tamanho` | todas | SVG de traço, sem emoji, sempre com rótulo ao lado ou `aria-label`. Um arquivo só. |

### 2.3 Peças do operador

| Componente | Props | Telas | Como muda por largura |
|---|---|---|---|
| `BotaoRegistro` (botão grande + "−1" acoplado) · C | `tom` (boa cheio, boa contorno, atencao, perda), `titulo`, `legenda`, `contagem`, `aoSomar`, `aoTirar`, `rotuloTirar`, `porte` (principal, secundario, perda) | injetora, teste | **Principal**: ≈370×260 no 1280 (título 50, legenda 18, "−1" 88 px com 36) → ≈378×300 no tablet em pé (título 38; 42 entre 1024 e 1279) → largura total × 120 no celular (título 32, "−1" 72 px com 30). **Secundário**: ≈224×124 (30 px) → ≈192×144 (26) → largura total × 72. **Perda**: linhas de 64 (20 px, "−1" 52) → 64 (18) → 56 (16, "−1" 44). |
| `TecladoRegistro` (grade do "Registrar") | `children` em 3 áreas | injetora, teste | ≥1280: faixa de **260 px fixos embaixo**, colunas `1fr 292px 440px` (Injetora) ou `1fr 320px 400px` (Teste). 768 a 1279: **sobe para o topo**, `1fr 260px` (ou 300), linha 1 = `clamp(220px, 24dvh, 300px)`. <768: 1 coluna, altura automática, ainda no topo. |
| `UltimoRegistro` · C | `registro` (hora, texto, tom), `aoDesfazer?` | injetora, teste | ≥1280 e celular: linha (texto à esquerda, Desfazer 52 à direita; mín. 72 no celular). Tablet em pé: coluna de 260 px (texto em cima, Desfazer embaixo). `aria-live="polite"`. |
| `SeletorTamanho` · C | `atual`, `resumoPorTamanho` ("N hoje · X m²"), `aoEscolher`, `dica` | injetora, teste | 4 em linha de 64 px no posto; 2×2 abaixo de 1280. A dica "produzido hoje em cada tamanho" some abaixo de 1280. |
| `ConfirmacaoEmbutida` · C | `titulo`, `resumo`, `rotuloConfirmar`, `aoConfirmar`, `aoCancelar` | injetora (fechar lote), teste (fechar pacote) | Dentro do cartão, nunca modal. Posto: Cancelar à esquerda e principal ocupando o resto, 60 px. Abaixo de 1024: empilhados, principal em cima. |
| `BotaoSegurar` (Fechar dia… segurar 2 s) · C | `rotulo`, `segundos`, `aoConcluir`, `resumo?` | injetora, montagem, teste | 44 a 48 px, tracejado. Abaixo de 1280 nos cartões: largura máxima 124 px, 14 px, quebra em 2 linhas. Na Montagem muda de lugar (base do painel Hoje → canto superior direito → última linha). O gesto ainda não existe no protótipo. |
| `FaixaPausado` | `motivo`, `desde`, `aoRetomar` | injetora, montagem, teste | 1 linha, Retomar 52 px à direita. No celular quebra: texto em cima, Retomar em largura total. `role="status"`. |
| `AvisoParada` (pop-up de motivo de pausa) · C | `modo` (automatico, manual), `setor`, `paradoHaMin`, `desde`, `limiteMin`, `catalogo`, `aoRegistrar`, `aoDispensar` | injetora, montagem, teste | ≥1280: caixa central até 1040 px, raio 22, 7 categorias em linha (96 px), motivos em 4 colunas (60 px). 768 a 1279: até 760 px, categorias 4 colunas, motivos 2. <768: **tela cheia**, categorias 2 colunas (64 px, ícone à esquerda), motivos 1 coluna (56 px), título 24, os dois botões dividem o rodapé. Só o miolo rola. Não fecha com Esc nem tocando fora. |
| `FluxoMotivo` (categoria → motivo → descrição) · C | `catalogo`, `setor`, `valor`, `aoMudar`, `porte` (botoes, pilulas) | injetora, montagem, teste (dentro do `AvisoParada`), rh-pausas (painel Classificar) | No operador são botões grandes; no RH são pílulas de 40/44/48. A lógica de "pronto" é a mesma (categoria e, se houver lista, motivo). |
| `FaixaAlerta` | `icone`, `titulo`, `itens?` (chips que são links), `tom` | setores (setores parados agora), mesas (mesas pendentes), montagem (pílula do rodapé) | Setores: chips na mesma linha do título (≥1280), em linha própria (768 a 1279), empilhados com 100% (celular); chip mín. 56 px. Mesas: 16 px (15 no celular). |
| `CartaoSetor` (fábrica) | `setor`, `descricao`, `valor`, `meta`, `ritmo`, `previsao`, `parada?`, `href` | setores | ≥1280: 3 colunas, cartão em coluna (anel 128, número 88, 3 minis, botão 60 no pé). 768 a 1279: 1 coluna com 3 faixas iguais; título à esquerda + botão de 280×64 à direita; anel 120 e minis lado a lado. <768: cartão em coluna, anel 96, número 60, botão 56 no pé. O cartão inteiro é o link. |
| `LinhaSetorResumo` | `setor`, `valor`, `meta`, `situacao` | area | Nome 19 → 17, número 26 → 22; no celular "/ 270 · situação" quebra de linha. Barra de 6 px. |
| `RaiaOperadora` · C | `operadora`, `mesas[]` (número, medida, quantidade, pulso, temBotao), `total`, `pctDoDia`, `ritmo` | montagem | ≥1024: 3 zonas `190px 1fr 168px`, altura `flex:1` (mín. 150) no posto. 768 a 1023: 2 linhas (quem + total em cima, mesas embaixo), total 52. <768: igual, mesas empilhadas, total 48, avatar 48, some "Corrigir quantidade". |

### 2.4 Gráficos (todos em SVG ou CSS, Server Components)

| Componente | Props | Telas | Como muda por largura |
|---|---|---|---|
| `AnelMeta` | `pct`, `cor`, `tamanho`, `espessura`, `children` (centro), `rotulo` (aria) | montagem, setores, rh-agora, rh-desempenho (registro aberto), rh-metas (mini na legenda) | `conic-gradient` com preenchimento travado em 100% (o texto pode passar). Montagem 236 → 180 abaixo de 1280. Setores 128 → 120 → 96. Agora 100 → 72 (tablet) → 52 (celular; 100 de novo no resumo da tela cheia). |
| `BarraProgresso` | `pct`, `cor`, `altura` (6, 8, 10, 16), `rotulo` | area, injetora, teste, montagem, hist-*, rh-metas, rh-pedidos, rh-pausas | Histórico: trilho 200×8 com texto ao lado → 100% com texto embaixo no celular. Resto não muda. |
| `BarraMeta` (ritmo com marcador) | `pct`, `esperadoPct`, `projecaoPct`, `cor`, `rotulo` | rh-desempenho (Metas do mês) | 3 cartões lado a lado (% em 56) no PC → empilhados num card (48) no tablet → empilhados (44) no celular. O cartão inteiro abre o painel Metas. |
| `BarraDividida` | `partes[]` (valor, cor, rotulo), `legenda` | rh-agora, rh-desempenho | Não muda; os blocos de "Eficiência e tempo" vão de 3 colunas → 2 → 2 (número 36 → 28 no celular). `role="img"` com descrição. |
| `BarrasHorizontais` (ranking) · C quando clicável | `linhas[]` (nome, valor, extra, cor, alerta), `maximo`, `aoTocar?`, `selecionada?` | rh-agora (operadoras), rh-desempenho (composição), rh-pausas (tempo por motivo), rh-pedidos (estoque no celular) | Composição: colunas `76 · barra · 56 · 92` → `62 · barra · 50 · 84` no celular. Pausas: 4 colunas (`180 · barra · 64 · 76`) → 2 linhas no celular. |
| `BarrasPorDia` · C na seleção | `dias[]` (data, semana, valor, variação), `linhas[]` (meta, média), `selecionado`, `hoje?` | rh-desempenho (Por dia), rh-pedidos (Pacotes por dia) | Altura 220 (Desempenho) e 180 (Pedidos) → 180 e 170 no celular; valor 18 → 15; margem direita 84 → 70 (ou 58); menos rótulos no celular. Largura total abaixo de 1200. |
| `LinhaTendencia` | `pontos[]`, `media`, `selecionado?` | rh-desempenho (perdas e o minigráfico do número) | Altura 110 → 90 no celular, rótulo 18 → 16; rótulo só no primeiro e no último ponto. |
| `ColunaNivel` | `valor`, `maximo`, `minimo?`, `reservado?`, `situacao` | rh-pedidos (Estoque por medida) | 4 colunas com caixa de 200 px e eixo (PC e tablet) → vira `BarrasHorizontais` no celular (linha de 52 px, trilho 16). |
| `MatrizDiaSetor` · C na célula | `dias[]`, `setores[]`, `celulas` (valor, pctMeta, origem, vazio), `aoAbrir` | rh-desempenho (Registros) | PC: setor × dia, 170 px + 5 colunas, célula ≥72, número 26. Tablet: 128 px + 5 colunas. Celular: **invertida** (uma linha por dia com 3 células de setor), 58 px + 3 colunas, célula ≥60, número 22. |
| `TrilhasDoDia` (linha do tempo das pausas) | `inicio`, `fim`, `trilhas[]` (setor, blocos com início, fim, categoria) | rh-pausas | Rótulo de 160 px ao lado da trilha (40 px de altura) → rótulo acima da trilha no celular. |
| `EtapasPedido` (linha do tempo de pontos) | `etapas[]` (nome, texto, estado) | rh-pedidos (detalhe da OP) | Vertical em todas as larguras. |

### 2.5 Tabelas, listas e sobreposições

| Componente | Props | Telas | Como muda por largura |
|---|---|---|---|
| `TabelaCartoes` (tabela → cards) | `colunas[]` (chave, título, largura), `areas` por faixa (`grid-template-areas`), `linhas`, `renderCelula`, `aoTocarLinha?`, `linhaSelecionada?` | mesas, admin-tablets, rh-pausas (Registro de pausas), rh-pedidos (Movimentações) | Uma marcação só; as mesmas células mudam de lugar. **Mesas**: 7 colunas com cabeçalho (≥1280) → cartão de 2 linhas, 4 colunas (768 a 1279) → cartão de 4 linhas, 2 colunas (celular). **Admin**: 4 colunas com cabeçalho (≥768) → cartão de 2 linhas (celular). **Pausas**: 5 colunas com cabeçalho (≥1200) → 3 colunas sem cabeçalho (tablet) → cartão (celular). **Movimentações**: 6 colunas → 6 mais estreitas → cartão de 3 linhas. O cabeçalho some quando vira cartão e os rótulos entram dentro do cartão. |
| `ListaDias` + `LinhaDia` (sanfona do histórico) · C | `dias[]`, `aberto`, `renderMeio`, `metricas[]`, `renderDetalhe` | hist-injetora, hist-montagem, hist-teste | Grade `96px 1fr auto 40px` (≥1024) → `80px 1fr 40px` com as métricas numa 2ª fileira (768 a 1023) → `64px 1fr 36px` (celular). Detalhe com recuo de 132 px só a partir de 1200. Cartões do detalhe 3 (ou 2 na Injetora) → 2 → 1 coluna. Um dia aberto por vez. |
| `Sobreposicao` · C | `aberta`, `aoFechar`, `forma` por faixa (`painel`, `folha`, `telaCheia`, `caixa`), `largura` (400, 440, 480, 780, 1180), `titulo`, `icone?`, `rodape?` (slot fixo), `fechaFora?`, `voltarRotulo?` | rh-metas, rh-exportar, rh-desempenho (registro), rh-pedidos (OP), rh-pausas (Classificar, Motivos e regras), mesas (Operadoras), rh-agora (setor no celular), e as folhas de filtro | Ver tabela 3.5. Cabeçalho e rodapé fixos, só o corpo rola. No celular o "X" vira "‹ nome da tela" de 48 px. Feito sobre `<dialog>` com `showModal()` (foco preso e Esc de graça). |
| `BarraFiltros` + `FolhaFiltros` · C na folha | `grupos[]` (rótulo, opções, parâmetro), `extras?` (Operadora, Origem) | rh-agora, rh-desempenho, rh-pedidos, rh-pausas (barra + folha); hist-* (só a barra) | PC: segmentos à vista. Tablet: à vista, numa linha que rola de lado. Celular: botão "Filtros" de 48 px com selo de contagem → folha de baixo (cantos 18, até 88% da altura, opções de 48, "Ver resultado" de 52); cada toque aplica na hora. "Mais filtros" em PC e tablet é uma caixa flutuante de 420 px. |
| `MenuMais` ("⋯") · C | `itens[]` (rótulo, ação ou href, separador) | rh-agora, rh-desempenho, rh-pedidos, rh-pausas | Celular: botão 48×48 no topo, itens de 48 px. Em rh-pedidos também existe em PC e tablet para "Ações de estoque" (itens de 44). |
| `FolhaRelatorio` | `tipo`, `periodo`, `filtros`, `secoes`, `dados` | rh-exportar (prévia) e a rota de impressão usada pelo serviço de PDF | Até 680 px, padding 32×36; no celular largura total, padding 18×16, indicadores 2×2, colunas empilhadas. Tema claro. |

### 2.6 Utilidades compartilhadas (não são componentes)

- `lib/formatar.ts`: número pt-BR (`1.346`, `97,1%`), medida (`3 m · 1,5 m²`), duração (`10h34`, `7min`, `2h 21min`), data (`Terça, 10/11`), plural.
- `lib/tema/setores.ts`: os 3 setores com id, nome, nome curto, descrição, cor, unidade contada e rota.
- `lib/regras/*`: contas puras (meta, % da meta, faltam, ritmo, previsão, eficiência, área). Usadas no servidor **e** no tablet offline, para o mesmo dia e setor dar o mesmo número nos dois.
- `lib/url/parametros.ts` + `useParametroUrl` (C): lê e grava filtro, detalhe e painel na URL.
- `hooks/useManterAcordado`, `hooks/useTelaCheia` (C): seção 6.

---

## 3. Estratégia de responsividade

### 3.1 O que o protótipo faz hoje

Cada família tem seus próprios cortes, todos por `max-width` da janela:

| Família | Cortes no protótipo |
|---|---|
| Injetora, Montagem, Teste | 1279, 959, 719 (e 379 nas perdas) |
| Setores, Mesas | 1279, 719 |
| Entrar, Área, Configurar tablet | 1023, 719 |
| Admin · Tablets | ≈1016 (por `flex-wrap`), 719 |
| Históricos | 1179, 959, 719 |
| RH (4 telas + 2 painéis) | 1199, 767 |

São 8 valores diferentes. Em todos os casos a prop `largura` só troca o sufixo dos links; quem muda o arranjo é a largura real da janela.

### 3.2 Breakpoints a adotar

| Nome | A partir de | O que liga |
|---|---|---|
| (base) | 0 | celular: uma coluna, página rola |
| `tablet` | **768** | tablet em pé (800, 820, iPad em pé 768 a 834) |
| `largo` | **1024** | Entrar, Área, Config. tablet e Admin em 2 colunas; linha do dia do Histórico numa faixa só; azulejos do operador em 3 colunas |
| `pc` | **1200** | arranjo PC do RH (barra em 1 linha, grade de 2 colunas, kanban, tabela completa); Histórico largo (7 cartões de resumo, logo, recuo do detalhe) |
| `posto` | **1280** | arranjo do posto do operador: teclado embaixo com 260 px, Hoje ao lado das raias, 3 cartões de setor, tabela de mesas |
| `toque` | `pointer: coarse` | sobe o alvo mínimo do arranjo PC de 40 para 44 quando a tela é de toque |
| `baixo` | altura < 720 | no arranjo `posto`, libera a rolagem da página em vez de espremer |

**Onde isso difere do protótipo** (só em faixas que não têm quadro desenhado):

| Faixa | No protótipo | Com os 4 cortes |
|---|---|---|
| 720 a 767 | telas `Tela-*` já no arranjo de tablet em pé | arranjo de celular |
| 960 a 1023 | operador com azulejos em 3 colunas; linha do Histórico numa faixa | igual ao tablet em pé (2 colunas; métricas na 2ª fileira) |
| 1016 a 1023 | Admin em 2 colunas | 1 coluna |
| 1180 a 1199 | Histórico no arranjo largo | Histórico no arranjo intermediário |

As cinco larguras de referência (1440, 1280, 820, 800, 390) caem **exatamente** no mesmo arranjo do quadro correspondente. Se a preferência for copiar os 8 cortes do protótipo, a mudança é só na lista `screens`; a recomendação é não fazer isso (dúvida 4).

**Onde cai cada aparelho**

| Largura | Aparelhos | Entrada e Admin | Operador | Históricos | RH |
|---|---|---|---|---|---|
| 390 | celular | celular | celular (rola) | celular (rola tudo) | celular (abas embaixo) |
| 800 / 820 | tablet em pé, iPad em pé | empilhado, controles maiores | "em pé": teclado em cima | em pé | tablet (barra em 2 linhas, 1 coluna) |
| 1024 a 1199 | iPad deitado (1024, 1080, 1180, 1194) | 2 colunas | "em pé" com 3 colunas de azulejo (**sem quadro**) | intermediário (**sem quadro**) | tablet |
| 1280 | tablet do operador deitado | 2 colunas | **posto** (caso de projeto) | largo | PC (**sem quadro de RH em 1280**) |
| 1440 | PC | 2 colunas | posto, mais largo | largo | PC (caso de projeto) |

### 3.3 Orientação no tablet

- A troca é pela **largura**, não por `orientation`. Tablet de 1280×800 deitado = `posto`; virou em pé (800×1280) = arranjo `tablet`. Isso já cobre girar o aparelho.
- **Deitado (1280×800)**: tudo que o operador toca cabe sem rolar; o maior botão fica embaixo, perto da mão.
- **Em pé (800×1280)**: o teclado de registro sobe para o topo (`order: -1`) com a linha principal em `clamp(220px, 24dvh, 300px)`; cartões embaixo crescem para preencher. Nas telas de entrada o formulário vem antes da explicação, alto na tela, longe do teclado virtual.
- Usar `dvh` no lugar de `vh` (a barra do navegador e o teclado virtual mudam a altura útil).
- O app **não trava** a orientação: o RH usa tablet em pé e o operador usa deitado, com o mesmo código.
- iPad deitado (1024 a 1194 de largura, 768 a 834 de altura) cai no arranjo "em pé" do operador, que **não cabe** nessa altura e rola. O arranjo `posto` também não cabe em 1024 (as colunas fixas de 292 + 440 deixam ≈110 px para o botão principal). Ver dúvidas 1 e 2.

### 3.4 Regra "sem rolar onde o protótipo não rola"

Dois tipos de casca:

1. **Tela que cabe** (`min-h-dvh`, coluna flex, o miolo estica): Entrar, Área, Configurar tablet, Setores, Injetora, Montagem, Teste. Usa `min-height`, nunca `height` fixa: se o conteúdo passar, a página rola em vez de cortar.
2. **Tela com miolo que rola** (`h-dvh`, cabeçalho e rodapé parados, só a lista rola): Mesas e os três Históricos a partir de 768. No celular vira página comum.

Matriz que vira teste automático (seção 7):

| Rota | PC 1440×900 | Tablet H 1280×800 | Tablet V 800×1280 | Celular 390 |
|---|---|---|---|---|
| `/entrar` | não rola | não rola | não rola | não rola (844) |
| `/area` | não rola | não rola | não rola | rola |
| `/configurar-tablet` | não rola | não rola | não rola | rola |
| `/admin/tablets` | rola (quadro 1048) | rola (quadro 860) | cabe | rola |
| `/fabrica` (Setores) | não rola | não rola com até 2 parados | pode passar | rola |
| `/fabrica/injetora` | não rola | **não rola** | cabe | rola |
| `/fabrica/montagem` | não rola com 3 raias | não rola com 3 raias | cabe com 3 raias | rola |
| `/fabrica/montagem/mesas` | página parada, miolo rola | idem | idem | rola |
| `/fabrica/teste-embalagem` | não rola | **não rola** | cabe | rola |
| históricos | página parada, lista rola | idem | idem | rola |
| `/rh/*` | rola (a 1ª dobra responde à pergunta) | rola | rola | rola |
| painéis e detalhes | só o corpo rola | idem | idem | idem |

Rolagem horizontal da página: **nunca**, em nenhuma largura. Só rolam de lado a linha de filtros do RH no tablet, as abas de OP no tablet e as abas do Admin no celular.

Três pontos em que o 1280×800 está no limite (precisam de conferência no aparelho):
- Injetora e Teste **com a faixa de pausa aberta**: a área dos cartões cai de ≈424 para ≈350 px e os azulejos não cabem. Não há quadro desse estado.
- Montagem com **4 ou mais operadoras**: cada raia tem mínimo de 150 px; com 4 já passa de 800.
- Setores com faixa de parados em 2 linhas ou pílula de pausa longa.

A conta dos 800 px só vale com o app **instalado em tela cheia** (seção 6). No Chrome comum sobra menos altura (estimativa: perto de 700 px; medir no aparelho) e o variante `baixo` libera a rolagem.

### 3.5 Tabela "parâmetro × largura" consolidada

| Parâmetro | Celular 390 (<768) | Tablet em pé 800 / 820 (768 a 1023) | Tablet deitado 1280×800 | PC 1440 |
|---|---|---|---|---|
| **Papel** | consulta e emergência | RH: caso de projeto. Fábrica: alternativa ao deitado | **aparelho do operador** | RH e Admin: caso de projeto |
| **Colunas · fábrica** | 1 | cartões do operador 2 lado a lado; Setores 1 (3 faixas); Montagem 1 | Lote \| Resumo + teclado; Hoje 340 px + raias; Setores 3 | igual ao 1280, mais largo, sem limite de largura |
| **Colunas · RH** | 1 | 1 (números 4 em linha) | 2 (arranjo PC) | 2 (`2fr 1fr` ou `1fr 2fr`), até 4 blocos por linha, conteúdo até 1440 |
| **Colunas · entrada e Admin** | 1 | 1 | 2 | 2 (Admin até 1360) |
| **Ordem dos blocos** | o que pede ação primeiro: teclado, depois cartões; no RH o destaque sobe (Metas, Estoque) | teclado em cima; formulário antes da explicação | cartões em cima, teclado embaixo | igual ao 1280 |
| **Navegação · fábrica** | só o voltar; cabeçalho em 2 linhas | voltar; 1 linha, sem logo | voltar; 1 linha de 68 px com logo | igual |
| **Navegação · RH** | topo fixo 60 px (logo, relógio, "⋯") + abas fixas embaixo (4 colunas, 62 px) | 2 linhas (60 + 52), "Pedidos" curto | 1 linha de 68 px | 1 linha de 68 px, até 1360 |
| **Navegação · Admin** | abas rolam de lado; "Ir para o RH" desce | 1 linha + abas | idem | idem |
| **Filtros** | RH: botão "Filtros" → folha de baixo; ativo vira chip. Histórico: empilhados, 100% | RH: à vista, linha que rola de lado. Histórico: quebram em 2 linhas | à vista, 1 linha | à vista, 1 linha |
| **Detalhe** | **tela cheia** com "‹ voltar" | painel lateral de 440 a 480 (Exportar 780, empilhado); gaveta 440 | painel lateral 480 (Exportar 1180 em 2 colunas); gaveta 400 | igual ao 1280 |
| **Aviso de pausa** | tela cheia | caixa central até 760 | caixa central até 1040 | igual |
| **Detalhe sem sobreposição** | Histórico: sanfona. Admin: bloco abaixo da lista | idem | Histórico: sanfona. Admin: painel ao lado | idem |
| **Tabelas** | lista de cards | cards de 2 linhas (Mesas) ou colunas principais (Pausas, Admin mantém 4 colunas) | tabela completa com cabeçalho | tabela completa |
| **Gráficos** | largura total, 170 a 180 px de altura, menos rótulos; níveis viram barras; composição em abas; matriz invertida | largura total, empilhados | lado a lado (arranjo PC) | lado a lado |
| **Alvo de toque mínimo** | 48 (operador: 44 nos dois botões de fechar) | 44 | operador 44 (48 no cabeçalho); RH 44 por `toque` | 40 no RH com mouse; operador igual ao 1280 |
| **Margem lateral** | 12 (operador) a 16 | 24 (Área 32) | 24 (operador), 28 (Setores, Mesas), 40 (RH), 56 (Área, Config) | igual |
| **Título da tela** | 22 a 36 | 26 a 44 | 28 a 44 | igual |
| **Número herói** | 60 a 64 | 64 (88 em Setores) | 88 / 64 | igual |
| **Número do topo (RH)** | 32, grade 2×2 | 38, 4 em linha | 38 | 38 |
| **Botão principal de registro** | largura total × 120, título 32 | ≈378×300, título 38 | ≈370×260, título 50 | ≈530×260, título 50 |
| **Texto mínimo** | 14 | 14 | 14 | 14 |
| **Logo** | some (no RH encolhe para 175×24) | some nos cabeçalhos de setor e de histórico | visível | visível |
| **O que fica parado** | RH: topo, abas e botão flutuante "Nova OP". Fábrica: nada | Mesas e Histórico: cabeçalho, filtros e resumo | idem | idem |
| **Rolagem** | vertical, página inteira | fábrica: cabe em 1280 de altura; RH: rola | fábrica: não rola; RH: rola | idem |

### 3.6 O que é principal e o que é celular

| Área | Principal (fidelidade ao quadro + regra de não rolar) | Também desenhado e obrigatório | Celular |
|---|---|---|---|
| Fábrica (operador) | tablet deitado 1280×800 | tablet em pé 800×1280 e PC 1440×900 | consulta e emergência; precisa funcionar, rolar só na vertical e ter alvos de 48 |
| Históricos | tablet deitado 1280×800 | tablet em pé e PC | idem |
| RH | PC 1440 e tablet em pé 820 | — (1280 usa o arranjo PC) | tela completa, com navegação própria: é uso real do gestor |
| Entrada | tablet (config. e entrar) e PC | — | funciona |
| Admin | PC | tablet | funciona |

Regras que valem para todas: nada é escondido numa largura e mostrado em outra (só muda ordem, colunas e a forma de abrir o detalhe); as únicas exceções do protótipo são enfeites (logo, dicas "produzido hoje em cada tamanho", link "Corrigir quantidade" abaixo de 1024, parágrafo da marca no Entrar).

Blocos que o protótipo mantém duplicados no DOM e alterna por `display` (kanban × abas, matriz por setor × por dia, colunas de nível × barras): repetir a mesma solução (dois blocos, um escondido por CSS). Trocar por JavaScript causaria salto na hidratação.

---

## 4. Rotas, layouts, Server × Client e Suspense

### 4.1 Mapa de rotas

```text
app/
├─ layout.tsx                    raiz: <html lang="pt-BR">, fontes, tema, registro do service worker, AvisoSemConexao
├─ manifest.ts                   PWA
├─ sw.ts                         service worker (Serwist)
├─ ~offline/page.tsx             página de reserva sem conexão
├─ globals.css · not-found.tsx · error.tsx · global-error.tsx
├─ page.tsx                      "/" → tablet vinculado: /fabrica/{setor} · com sessão: /area · sem sessão: /entrar
├─ (entrada)/
│  ├─ entrar/page.tsx            Tela-Entrar
│  ├─ area/page.tsx              Tela-Area
│  └─ configurar-tablet/page.tsx Tela-ConfigTablet (não vinculado e vinculado)
├─ (fabrica)/fabrica/
│  ├─ layout.tsx                 casca do operador: vínculo do tablet, fila offline, manter acordado, tela cheia
│  ├─ page.tsx                   Tela-Setores
│  ├─ injetora/page.tsx          Tela-Injetora            ?estado só na galeria
│  ├─ injetora/historico/page.tsx        Tela-HistInjetora   ?periodo=&medida=&dia=
│  ├─ montagem/page.tsx          Tela-Montagem
│  ├─ montagem/mesas/page.tsx    Tela-Mesas               ?operadoras=1
│  ├─ montagem/historico/page.tsx        Tela-HistMontagem
│  ├─ teste-embalagem/page.tsx   Tela-Teste
│  └─ teste-embalagem/historico/page.tsx Tela-HistTeste     ?busca=
├─ (rh)/rh/
│  ├─ layout.tsx                 NavegacaoRH
│  ├─ page.tsx                   redireciona para /rh/agora
│  ├─ agora/page.tsx             RH2-Agora        ?medida=&setor=inj|mon|tes
│  ├─ desempenho/page.tsx        RH2-Desempenho   ?periodo=&medida=&setor=&operadora=&origem=&dia=&registro=
│  ├─ pedidos/page.tsx           RH2-Pedidos      ?medida=&aba=&busca=&op=
│  └─ pausas/page.tsx            RH2-Pausas       ?periodo=&setor=&motivo=&classificar=&motivos=1
│                                em todas: ?painel=metas | ?painel=exportar (&previa=1)
├─ (admin)/admin/
│  ├─ layout.tsx                 NavegacaoAdmin
│  ├─ page.tsx                   redireciona para /admin/tablets
│  ├─ tablets/page.tsx           Tela-AdminTablets ?tablet=&novo=1
│  └─ botoes/page.tsx            Botões ESP32 (entrega 2; sem quadro)
├─ (impressao)/relatorio/[tipo]/page.tsx   FolhaRelatorio em página branca, aberta pelo serviço de PDF
├─ (dev)/dev/ui/page.tsx                   galeria de componentes
├─ (dev)/dev/telas/[tela]/page.tsx         cada tela com os dados de exemplo do protótipo  ?estado=
└─ api/  health · pulsos · auth/[...nextauth] · (sincronização da fila, exportação: definidos pelo back)
proxy.ts                         checagem rápida de sessão e de vínculo para redirecionar (no Next 16 o Middleware chama Proxy)
```

Observações:
- Uma rota por tela, responsiva. Os sufixos `-PC`, `-TabletH`, `-TabletV`, `-Celular` do protótipo somem.
- Estados que no protótipo têm quadro próprio (`-Lote`, `-Pausa`, `-Operadoras`, `-OS`, `-Registro`, `-Motivos`, `-Classificar`, setor em foco, painel aberto, prévia) viram **parâmetro de URL** quando são navegação (detalhe, painel, filtro) e **estado local** quando são momento de operação (confirmação de lote, aviso de pausa).
- "Usuários" e "Registro de ações" do Admin são só abas desabilitadas até existir card; não criar rota vazia.
- Os painéis Metas e Exportar são um componente só (`PaineisRH`), chamado pelas 4 páginas do RH com o contexto de filtros de cada uma (o Exportar abre pré-preenchido com o filtro da tela).

### 4.2 Server Component × Client Component

Regra geral: a página e os blocos de dados são Server Components; vira Client Component só o pedaço que tem estado, gesto ou API do navegador.

| Parte | Tipo | Motivo |
|---|---|---|
| Layouts, cabeçalhos, títulos, grades | Server | fazem parte do shell estático que o `cacheComponents` pré-renderiza |
| Blocos de dados do RH, Setores, Área, Históricos, Admin | Server (async) dentro de `<Suspense>` | leem o banco; filtros chegam por `searchParams` |
| Gráficos e cartões | Server | SVG e CSS, sem JavaScript |
| `Segmentado` com parâmetro de URL, abas da navegação | Server (`<Link>`) | navegação sem estado local |
| Aba ativa da `NavegacaoRH`, `MenuMais` | Client | `usePathname`, abrir e fechar |
| `Relogio`, `AtualizaSozinho` | Client | tempo e `router.refresh()` |
| Painel de registro da Injetora, da Montagem e do Teste | **Client** (ilha) | toque imediato, Dexie, desfazer, aviso de parada por tempo, funciona offline |
| `AvisoParada`, `ConfirmacaoEmbutida`, `BotaoSegurar`, `Contador` | Client | estado e gesto |
| `Sobreposicao`, `FolhaFiltros` | Client | `<dialog>`, foco, histórico do navegador |
| Conteúdo dos painéis Metas e Exportar | formulário Client; prévia e dados Server | o formulário tem rascunho local; salvar por Server Action |
| Entrar, Configurar tablet (formulário) | Client pequeno + Server Action | validação, câmera do QR, área de transferência |
| `LinhaDia` (sanfona) | Client | um aberto por vez, dia aberto na URL |

**Telas do operador (o caso diferente).** O número que o operador vê não pode depender da rede. A página é um shell estático (cabeçalho, grade, rótulos) que o service worker guarda; dentro dele uma ilha cliente lê os eventos do dia no Dexie, calcula com `lib/regras/*` e mostra na hora; a fila envia ao servidor quando há conexão. O servidor só entra no primeiro carregamento (meta do dia, catálogo de pausas, lote aberto) e na sincronização.

### 4.3 Onde fica o `<Suspense>`

Com `cacheComponents`, tudo que lê sessão, `searchParams`, relógio ou banco sem cache precisa estar atrás de um `<Suspense>`; o resto vira shell instantâneo.

| Rota | Shell estático | Atrás de `<Suspense>` (um por bloco, com `Esqueleto` do mesmo tamanho) |
|---|---|---|
| `/entrar` | tudo | — |
| `/area` | cabeçalho, título, cartão RH, rodapé | produção de hoje por setor; nota do rodapé (depende do vínculo) |
| `/configurar-tablet` | cabeçalho, passos | formulário ou cartão "vinculado" (lê o vínculo) |
| `/fabrica` | cabeçalho | faixa de parados; grade dos 3 cartões |
| telas do operador | cabeçalho e grade | a ilha cliente (carga inicial do dia) |
| `/fabrica/montagem/mesas` | cabeçalho, rodapé | alerta + lista de mesas; gaveta de operadoras |
| históricos | cabeçalho, filtros | resumo do período; lista de dias |
| `/rh/agora` | navegação, título | Produção hoje; números; cada painel de setor |
| `/rh/desempenho` | navegação, título, filtros | números; metas do mês; por dia; composição; eficiência; matriz; registro aberto |
| `/rh/pedidos` | navegação, título | números; estoque; pacotes por dia; ordens; movimentações; OP aberta |
| `/rh/pausas` | navegação, título | setores agora; números; por motivo; linha do tempo; registro |
| `/admin/tablets` | barra, título | lista; painel de detalhe |
| painéis | moldura do painel | conteúdo (metas atuais; prévia do relatório) |

Cuidados do Next 16 que afetam todo card de tela:
- `searchParams` e `params` são `Promise`: ler com `await` dentro do componente que está sob `<Suspense>`.
- Hora atual e "hoje" nunca no shell: o relógio é Client Component e o "hoje" é calculado dentro do bloco dinâmico.
- Leitura de sessão: usar o padrão do guia `authentication-with-cache-components.md` (não chamar `cookies()` dentro de `use cache`).
- Dados que podem ficar em cache (metas, catálogo de pausas, medidas, lista de setores): `use cache` + `cacheTag`, invalidados na Server Action que salva.
- `useSearchParams` em Client Component também exige `<Suspense>` em volta.
- `experimental.useOffline` (guia `offline-support.md`) deixa navegação e Server Action pendentes até a rede voltar. Serve para o RH e as consultas; **não substitui** a fila do Dexie no operador (não sobrevive a recarregar). É experimental: ligar só depois de testar.

---

## 5. Gráficos: SVG e CSS próprios, sem biblioteca

Recomendação única: **desenhar os gráficos com SVG e CSS em `components/graficos/`**, com um arquivo pequeno de escala (`lib/graficos/escala.ts`: valor → posição, teto do eixo).

Motivo:
1. As formas do protótipo são simples e fixas: anel (`conic-gradient`), barra com marcador, barra dividida, barras por dia com duas linhas de referência, uma linha de 5 pontos, coluna de nível, matriz de células e trilhas posicionadas por percentual. Nenhuma precisa de eixo automático, zoom ou animação.
2. Cada uma tem medidas exatas por largura (altura 220 → 180, margem direita 84 → 70, rótulo só no primeiro e no último ponto). Numa biblioteca isso vira configuração contra o padrão dela.
3. Barras, colunas e células são **botões** com `aria-label` completo e alvo de toque mínimo. Em SVG e HTML próprios isso é marcação comum.
4. Ficam Server Components: sem JavaScript no celular e no tablet, funcionam offline e saem iguais no PDF (o serviço do Railway abre a mesma `FolhaRelatorio`).
5. Uma biblioteca (Recharts ou parecida) obrigaria Client Components, somaria peso ao pacote do tablet e não cobriria anel, matriz, trilhas nem coluna de nível, que teriam de ser feitos à mão de qualquer jeito.

---

## 6. PWA no tablet

| Item | Como fazer |
|---|---|
| Manifesto | `app/manifest.ts`: `name` "AquaPulse · Produção", `short_name` "AquaPulse", `start_url: '/'`, `display: 'fullscreen'`, `display_override: ['fullscreen', 'standalone']`, `background_color` e `theme_color` `#0A0E15`, `lang: 'pt-BR'`, ícones 192, 512 e um `maskable`. Sem `orientation` (fica livre). |
| Abrir direto no setor | `start_url` é `/`; a raiz redireciona o tablet vinculado para `/fabrica/{setor}`. O vínculo fica guardado no aparelho (cookie de longa duração + cópia no Dexie). |
| Instalação (Android) | Chrome → "Instalar app". Um botão "Instalar" pode aparecer no cartão "Tablet vinculado" usando `beforeinstallprompt` (só Chrome/Android). |
| Instalação (iPad) | Safari → Compartilhar → "Adicionar à Tela de Início". Não há aviso automático; mostrar a instrução em texto. |
| Tela cheia | Instalado com `display: fullscreen` o Android esconde a barra de status e a de navegação: é isso que garante os 800 px de altura. Fora do app instalado, a opção "Tela cheia" do cartão "Tablet vinculado" chama `requestFullscreen()` (precisa de um toque). No iPad instalado a barra de status continua. |
| Manter acordado | Opção "Manter a tela sempre ligada" → `navigator.wakeLock.request('screen')`, pedido de novo a cada `visibilitychange` (o sistema solta a trava quando a aba some). Reserva para aparelho antigo: a opção de desenvolvedor "Manter tela ativa" enquanto carrega, do passo 9 do `PREPARACAO-DO-AMBIENTE.md`. |
| Orientação | Não travar. O arranjo segue a largura. `screen.orientation.lock()` só funciona em tela cheia no Android e não existe no iPad; não depender dele. |
| Não sair do app | "Fixar app" do Android (passo 9). No app: `overscroll-behavior: none` nas telas do operador (sem puxar para recarregar) e `user-select: none` nos botões de registro. |
| Service worker | Serwist: guarda o shell das rotas da fábrica, fontes, ícones e CSS/JS; página `~offline` de reserva; nunca guarda resposta de API. Atualização: avisar "Nova versão · tocar para atualizar" só com o setor sem registro pendente. |
| Fila offline | Dexie: cada toque vira um evento com id gerado no aparelho e hora do toque; `AvisoSemConexao` mostra quantos estão guardados. |
| Preferências | "Manter a tela sempre ligada" e "Tela cheia" guardadas no aparelho (Dexie), ligadas por padrão. |

---

## 7. Ordem de construção e teste das larguras

### 7.1 O que precisa existir antes das telas

| # | Bloco de front | Entrega | Destrava |
|---|---|---|---|
| F1 | Tema: tokens, fontes, `tailwind.config.ts`, `globals.css`, layout raiz (pt-BR, escuro, viewport) | cores e escala do protótipo disponíveis como classes | tudo |
| F2 | Primitivos: `Botao`, `Cartao`, `Azulejo`, `PilulaEstado`, `RotuloSetor`, `ChipMedida`, `Icone`, `Logo`, campos, `EstadoVazio`, `Esqueleto`, `EstadoErro` + galeria `/dev/ui` | peças base conferidas nas 5 janelas | todas as telas |
| F3 | Utilidades: `lib/formatar`, `lib/tema/setores`, `lib/regras` (contas puras, com testes de unidade), `useParametroUrl` | mesmo número em qualquer tela | todas as telas |
| F4 | Harness de larguras: Playwright com 5 janelas, verificações automáticas, galeria `/dev/telas/[tela]` com dados de exemplo, script de fotos | critério "funciona nas 4 larguras" vira comando | aceite de todo card de tela |
| F5 | Cascas e navegação: grupos de rota e layouts, `CabecalhoTela`, `CabecalhoOperador`, `Relogio`, `NavegacaoRH` (3 formas), `NavegacaoAdmin`, `AtualizaSozinho` | esqueleto navegável de todas as rotas | todas as telas |
| F6 | Sobreposições e filtros: `Sobreposicao`, `FolhaFiltros`, `BarraFiltros`, `Segmentado`, `Pilulas`, `ChipFiltro`, `MenuMais` | painel lateral, folha de baixo e tela cheia prontos | RH inteiro, Mesas, Históricos |
| F7 | Gráficos: `AnelMeta`, `BarraProgresso`, `BarraMeta`, `BarraDividida`, `BarrasHorizontais`, `BarrasPorDia`, `LinhaTendencia`, `ColunaNivel`, `MatrizDiaSetor`, `TrilhasDoDia`, `EtapasPedido` | galeria de gráficos com os valores do protótipo | Setores, Montagem, RH inteiro |
| F8 | Peças do operador: `BotaoRegistro`, `TecladoRegistro`, `Contador`, `UltimoRegistro`, `SeletorTamanho`, `ConfirmacaoEmbutida`, `BotaoSegurar`, `FaixaPausado`, `AvisoParada` + `FluxoMotivo`, `FaixaAlerta` | Injetora e Teste montáveis só com peças | Injetora, Montagem, Teste, Pausas no tablet, RH · Pausas (Classificar) |
| F9 | Dados em lista: `TabelaCartoes`, `ListaDias` + `LinhaDia`, `CartaoNumero` | tabela que vira card e sanfona de dia | Mesas, Admin, Históricos, RH · Pausas, RH · Pedidos |
| F10 | PWA: manifesto, ícones, Serwist, página offline, `AvisoSemConexao`, `IndicadorFila`, `useManterAcordado`, `useTelaCheia` | app instalável em tela cheia | épico Offline, Configurar tablet |

Ordem sugerida das telas depois disso: Entrar → Área → Setores → Injetora → Teste & Embalagem → Montagem → Mesas → Históricos (um componente, três setores) → Configurar tablet → Admin · Tablets → RH · Agora → Painel Metas → RH · Desempenho → RH · Pausas → RH · Pedidos → Painel Exportar.
F1 a F4 são sequenciais. F5 a F9 podem andar em paralelo depois de F2. F10 pode andar em paralelo com as telas, mas tem de estar pronto antes de testar a regra de não rolar no tablet de verdade.

### 7.2 Como testar as larguras de forma repetível

**Janelas fixas (projetos do Playwright)**

| Projeto | Janela | Toque | Vale para |
|---|---|---|---|
| `pc` | 1440 × 900 | não | todas as telas |
| `tablet-h` | 1280 × 800 | sim | todas (caso de projeto da fábrica) |
| `tablet-v` | 800 × 1280 | sim | entrada, fábrica, históricos, admin |
| `rh-tablet` | 820 × 1180 | sim | telas e painéis do RH |
| `celular` | 390 × 844 | sim, `isMobile` | todas |
| `ipad-h` (só aviso, não bloqueia) | 1180 × 820 | sim | fumaça: sem rolagem horizontal |

**Dados**: o banco é um só (produção). O teste de largura **não toca no banco**: cada tela é escrita como uma "vista" que recebe os dados por props, e a galeria `/dev/telas/[tela]?estado=…` monta essa vista com os valores de exemplo do protótipo (`lib/exemplos/*.ts`: 240 / 270, Helena 52, OP-00015 etc.). A página real só busca os dados e entrega para a mesma vista. A galeria fica fora da produção (variável de ambiente), mas pode ficar ligada no preview para a AquaPulse comparar com o protótipo.

**Verificações automáticas** (`tests/larguras/`):
1. Sem rolagem horizontal: `scrollWidth <= clientWidth` em toda tela × janela.
2. Sem rolagem vertical nas células "não rola" da matriz da seção 3.4.
3. Alvo de toque: todo `button`, `a`, `input`, `select` visível com altura ≥ 44 nas janelas de toque (≥ 48 no celular para o RH), com lista curta de exceções declaradas.
4. Texto: nenhum texto visível abaixo de 14 px.
5. Foto por tela × janela × estado (`toHaveScreenshot`), para regressão; a comparação com o quadro do protótipo é visual, no PR.
6. Contraste e rótulos com `@axe-core/playwright` (opcional, recomendado).

**Comandos**: `npm run teste:larguras` (roda tudo) e `npm run fotos -- injetora` (gera as 5 fotos de uma tela para colar no PR ao lado do quadro `Tela-Injetora-*`). As fotos de referência são geradas sempre no mesmo ambiente (CI em Linux), porque a renderização de fonte muda entre Windows e Linux.

**No aparelho** (o automático não substitui): `adb reverse tcp:3000 tcp:3000`, abrir no Chrome do tablet, `chrome://inspect` no PC. Roteiro por card de tela: app instalado em tela cheia; deitado e em pé; não rola onde a matriz diz; teclado virtual não cobre o campo; toque com o polegar nos botões de registro; faixa de pausa aberta; sem Wi-Fi.

Dependências novas deste bloco: `@playwright/test` e, opcional, `@axe-core/playwright` (as duas só de desenvolvimento).

---

## 8. Riscos

1. **O tablet real pode não ter 1280×800 de área útil.** Muitos tablets Android de 10" informam menos pixels de CSS (depende da densidade), e fora do app instalado as barras do navegador e do sistema tiram altura (estimativa: por volta de 100 px; medir no aparelho). A regra de não rolar depende de medir o aparelho e de instalar o PWA em tela cheia.
2. **iPad deitado (1024 a 1194) não tem quadro.** Nas telas do operador cai no arranjo "em pé", que rola em 768 a 834 de altura. Se o aparelho da fábrica for iPad, falta desenhar um arranjo deitado compacto.
3. **Estados no limite dos 800 px**: faixa de pausa aberta na Injetora e no Teste, Montagem com 4 ou mais operadoras, Setores com várias paradas.
4. **Estados que o protótipo não desenha** em nenhuma tela: carregando, erro, sem conexão, fila pendente, lista vazia, confirmações de ação destrutiva. Sem um padrão único aprovado, cada card inventa o seu.
5. **Serwist com o Next 16**: o Turbopack é o empacotador padrão e o `@serwist/next` foi feito para Webpack. Conferir na documentação atual do Serwist (pacote para Turbopack) ou compilar com `next build --webpack`; e testar recarregar a tela do operador sem rede.
6. **`cacheComponents`**: relógio, "hoje", sessão e `searchParams` fora de `<Suspense>` quebram o build. Todo card de tela precisa seguir a tabela 4.3.
7. **RH em 1280 com toque**: usa o arranjo PC, de alvos de 40 px. O variante `toque` sobe para 44, o que aumenta a altura das barras e pode empurrar a primeira dobra.
8. **Os 4 breakpoints** mudam o arranjo em faixas sem quadro (720 a 767, 960 a 1023, 1180 a 1199). Nenhuma largura de referência é afetada, mas é diferença em relação ao CSS do protótipo.
9. **Blocos duplicados no DOM** (kanban × abas, matriz dupla, níveis × barras): cuidado com `id` repetido e com leitores de tela; o bloco escondido tem de estar com `display: none`.
10. **Fotos de referência** mudam entre Windows e Linux; gerar só na CI.
11. **iPad**: sem `display: fullscreen`, sem trava de orientação, instalação manual e Wake Lock só em versões recentes.
12. **Logos e ícones**: os arquivos do protótipo (`/_blob/ca29809a…` horizontal e `/_blob/b1215d43…` símbolo) não vieram no pacote lido; sem eles não há cabeçalho, Entrar nem ícone do PWA.
13. **Prazo**: F1 a F4 vêm antes de qualquer tela; a Entrega 1 do `PREPARACAO-DO-AMBIENTE.md` está marcada para 25/11.

## 9. Dúvidas para quem pediu

1. Qual é o tablet da fábrica (marca e modelo, Android ou iPad)? Preciso da largura e da altura úteis que o navegador informa nele.
2. Se for iPad ou outro aparelho com menos de 1280 de largura deitado: aceita o arranjo "em pé" com rolagem, ou quer um arranjo deitado compacto (trabalho de desenho a mais)?
3. PC e celular também **registram** produção nas telas do operador, ou fora do tablet vinculado elas são só leitura?
4. Posso unificar os cortes em 768 / 1024 / 1200 / 1280 (as larguras de referência ficam iguais ao protótipo), ou prefere os 8 cortes originais?
5. Os textos de 13 px do protótipo (notas do Histórico, cabeçalho de tabela) sobem para 14, como manda a regra do próprio protótipo?
6. No RH aberto num tablet de 1280 com o dedo, posso subir o alvo de 40 para 44 px?
7. Aprova um padrão único para o que o protótipo não desenha (carregando, erro, sem conexão, registros na fila), na mesma linguagem da faixa amarela de pausa?
8. O tablet do operador deve ficar **travado deitado**, ou pode girar (o protótipo tem as duas posições)?
9. "TV da fábrica (só visualizar)", opção do cadastro de tablets: qual tela ela mostra e em que resolução?
10. Em monitores maiores que 1440, as telas da fábrica esticam (como no protótipo) ou ganham largura máxima?
11. Filtros, detalhe aberto e painel aberto na URL (o link pode ser compartilhado e o "voltar" do celular fecha o detalhe): pode ser assim?
12. Por onde se chega em Admin · Tablets? Nenhuma tela do protótipo tem link para lá.
13. "Atualiza sozinho" (Mesas, RH · Agora, Setores): de quantos em quantos segundos é aceitável?
14. A galeria de telas com dados de exemplo pode ficar visível no link de preview para a AquaPulse aprovar?
15. Pode enviar os arquivos do logo (horizontal e símbolo) e do ícone do app?
