# Registro de ações

"Todo toque deixa rastro." Toda escrita que **não** é um toque de produção grava uma linha em `registro_acao`
dizendo quem fez o quê, em quê, e o que mudou. Toques de produção (+1, −1, Desfazer) ficam em `registro_producao`
(SCRUM-38) e não passam por aqui.

| Arquivo | O que tem |
| --- | --- |
| `lib/auditoria/acoes.ts` | `ACOES`, a lista fechada de nomes de ação, e o tipo `Acao`. |
| `lib/auditoria/registrar-acao.ts` | `registrarAcao(tx, entrada)`, a única função que grava. Tipos `Ator`, `Origem`, `EntradaAcao`. |
| `lib/auditoria/limpar.ts` | `limparSensiveis` (tira senha e token) e `diferenca` (só os campos que mudaram). |
| `lib/auditoria/origem.ts` | `origemDaRequisicao()`: IP e navegador da requisição (usa `next/headers`). |
| `lib/auditoria/registro-de-acoes.ts` | `registroDeAcoes(filtro)`: leitura paginada, do mais novo para o mais antigo. |

## Como usar

`registrarAcao` recebe o **mesmo `tx`** da escrita que acompanha. Se a escrita falhar, o registro some junto; se o registro
falhar, a escrita também não fica. Ela não abre conexão.

```ts
"use server";
import { eq } from "drizzle-orm";
import { transacao } from "@/lib/db/cliente";
import { mesa } from "@/lib/db/schema";
import { diferenca } from "@/lib/auditoria/limpar";
import { origemDaRequisicao } from "@/lib/auditoria/origem";
import { registrarAcao } from "@/lib/auditoria/registrar-acao";

export async function trocarOperadora(mesaId: string, operadoraId: string, usuarioId: string) {
  // Lê os cabeçalhos antes de abrir a transação.
  const origem = await origemDaRequisicao();

  await transacao(async (tx) => {
    const [anterior] = await tx.select().from(mesa).where(eq(mesa.id, mesaId));
    const [nova] = await tx.update(mesa).set({ operadoraId }).where(eq(mesa.id, mesaId)).returning();

    await registrarAcao(tx, {
      acao: "mesa.operadora_alterada",
      ator: { tipo: "usuario", usuarioId },
      entidade: "mesa",
      entidadeId: mesaId,
      ...diferenca(anterior, nova), // { antes: { operadoraId: ... }, depois: { operadoraId: ... } }
      origem,
    });
  });
}
```

### Quem fez (`ator`)

| `ator` | Quando | Obrigatório |
| --- | --- | --- |
| `{ tipo: "usuario", usuarioId }` | Pessoa logada (Admin, RH, supervisor). | `usuarioId` |
| `{ tipo: "tablet", tabletId }` | Ação feita no tablet do setor. | `tabletId` |
| `{ tipo: "botao" }` | Botão físico (ESP32). | — |
| `{ tipo: "sistema" }` | Cron, seed, rotina automática. | — |

Faltar o id dá erro de tipo e, se chegar assim mesmo (um `as any`), `registrarAcao` lança erro e nada é gravado.

### O que mudou (`antes` / `depois`)

- Só os campos que mudaram. Use `diferenca(antes, depois)`; na criação, `antes` fica nulo e `depois` leva o que foi criado.
- **Nunca** senha, hash de senha, token de tablet ou de botão. `registrarAcao` tira sozinha, em qualquer nível, toda chave
  que contenha `senha` ou `token` (sem diferenciar maiúsculas), mesmo que o chamador passe. Mesmo assim, não passe.
- `login.recusado` grava IP e navegador; nunca a senha digitada.
- Duplo clique: quando a action usa uma chave `idem`, ela vai dentro de `depois` (`depois: { ..., idem }`).
  Quando usar é decisão de cada action.

### IP e navegador (`origem`)

Opcional. Em Server Action ou Route Handler, `await origemDaRequisicao()` (primeiro endereço do `x-forwarded-for`,
senão `x-real-ip`, e o `user-agent`). Cron e seed não passam nada.
`registrar-acao.ts` não importa o Next, por isso o seed, o cron e os testes podem usá-la.

## Nomes de ação

Formato `entidade.verbo` (`mesa.criada`, `jornada.reaberta`). A lista é **fechada**: nome fora de `ACOES` não compila.
Precisa de um nome novo? Acrescente em `lib/auditoria/acoes.ts`, no mesmo card que vai usá-lo, e cite o nome no card.

## Ler

```ts
import { registroDeAcoes } from "@/lib/auditoria/registro-de-acoes";

const { itens, pagina, temMais } = await registroDeAcoes({
  entidade: "mesa",
  entidadeId: mesaId,
  de: new Date("2026-11-01T03:00:00Z"), // inclusive
  ate: new Date("2026-12-01T02:59:59Z"), // inclusive
  pagina: 1, // começa em 1; 50 por página (ACOES_POR_PAGINA)
});
```

Todos os filtros são opcionais (`de`, `ate`, `acao`, `entidade`, `entidadeId`, `pagina`). A ordem é `ocorrido_em` desc,
`id` desc. A função **não confere papel**: a tela Admin › Registro de ações (SCRUM-43) e o relatório
"Fechamentos e correções" (SCRUM-81) decidem quem pode ver.

## Regras da tabela

- **Só inclusão.** Não existe função de alterar nem de apagar linha de `registro_acao`, e nenhum código deve fazer
  `update` ou `delete` nela. Correção de algo errado é uma ação nova (`registro.corrigido`), não edição do registro.
- Retenção: para sempre, sem limpeza automática.
- Testes: rodam no PGlite em memória (`lib/db/pglite-teste.ts`), nunca no Neon.
