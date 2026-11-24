# Modelo de card

É o formato que `/criar-card` escreve e que `/entender-card`, `/revisar-card` e `/auditar-codigo` sabem ler.
Copie o bloco abaixo para um arquivo, preencha e crie com
`node scripts/harness/jira.mjs criar --tipo História --arquivo card.md --pai SCRUM-<épico> --label <setor>`.

```markdown
# Setor ou área: o que muda, com verbo

## Contexto
Por que isto existe e quem usa. Duas ou três frases. Cite o épico e os cards relacionados (SCRUM-xx) quando houver.

## O que fazer
O comportamento esperado, do ponto de vista de quem usa. Sem dizer como programar, a não ser que seja uma restrição.

## Critérios de aceite
- CA1 — Dado/quando/então, ou uma frase que se possa conferir olhando a tela ou o banco.
- CA2 — ...
- CA3 — Funciona nas 4 larguras: 1440, 1280×800, 800×1280 e 390. (para card com tela)

## Tela no protótipo
Quadro: `Tela-Injetora-TabletH` (e os outros quadros da mesma tela). Ou "não se aplica".

## Fora do escopo
O que parece fazer parte e NÃO faz. Evita que a implementação cresça e que a revisão cobre o que não foi pedido.

## Notas técnicas
Tabelas, rotas, variáveis, dependência de outro card, risco conhecido. Ou "nenhuma".
```

## O que faz um card bom

- **Título** que se entende sozinho na lista: `Injetora: fechar lote com tamanho`, não `Ajustes`.
- **Critério de aceite conferível.** "Ficar bom" não dá para revisar; "o botão Fechar lote pede confirmação e grava o tamanho" dá.
  A fase 4 aprova ou reprova **por esta lista**.
- **Tamanho de um PR.** Uma tela ou um comportamento. Se a lista de critérios passa de uns sete, provavelmente são dois cards.
- **Fora do escopo preenchido.** É a seção que mais poupa retrabalho.

## Tipos e etiquetas

| Tipo | Quando |
| --- | --- |
| `História` | Tela ou comportamento que o usuário vê |
| `Tarefa` | Configuração, infraestrutura, trabalho técnico. Defeito também: `Tarefa` com a etiqueta `bug` |
| `Epic` | Agrupa os cards de uma área (um por linha do backlog, passo 10.6 do `PREPARACAO-DO-AMBIENTE.md`) |
| `Subtask` | Só para dividir um card grande que já existe; o fluxo de fases roda no card pai |

Etiqueta de setor (o projeto não tem o campo "Setor"): `injetora`, `montagem`, `teste-embalagem`, `rh`, `infra`.
