# Documentação do AquaPulse

| Documento | O que é |
| --- | --- |
| `banco.md` | Mapa do banco: as 30 tabelas e 2 views, colunas, restrições e índices, e quais cards usam cada uma. Gerado a partir de `lib/db/schema.ts`. |
| `sintese/modelo-de-dados-e-back.md` | Síntese de dados e back-end: tabelas, regras de negócio (`lib/dominio/`), API, tempo real, offline e ordem das migrations. |
| `sintese/arquitetura-front.md` | Síntese de front: tokens, componentes, cortes de largura, rotas e o que cada tela usa. |
| `mapa/*.md` | Um mapa por família de tela do protótipo (19 arquivos): o que a tela mostra, os estados, os números de exemplo e as larguras. `mapa/briefing-escopo.md` é o diagnóstico da fábrica. |
| `harness/` | O fluxo de cards (`README.md`) e o modelo de card. |

## Como os cards citam estes documentos

| Citação no card | Arquivo |
| --- | --- |
| "síntese de dados §x" | `docs/sintese/modelo-de-dados-e-back.md`, seção x |
| "síntese de front §x" | `docs/sintese/arquitetura-front.md`, seção x |
| "mapa `<nome>`" ou "mapa da tela `<nome>`" | `docs/mapa/<nome>.md` (ex.: mapa `rh-pausas` → `docs/mapa/rh-pausas.md`) |
| "diagnóstico" / "briefing" | `docs/mapa/briefing-escopo.md` |

## Aviso

As sínteses e os mapas são um **retrato de 24/11/2026**, feito a partir do protótipo. Os itens marcados **[padrão proposto]**
ainda não tinham resposta do dono do produto quando foram escritos.

**A decisão registrada num card do Jira vale mais que o documento.** Quando um card (descrição ou comentário) diz outra coisa,
siga o card. O banco já foi criado inteiro (SCRUM-100): para o que está no banco, a referência é `banco.md` e `lib/db/schema.ts`.
