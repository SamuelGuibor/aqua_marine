// Funções puras que preparam o `antes`/`depois` de `registro_acao`: sem banco, sem `next/*`.

/** Um `antes` ou `depois`: os campos da entidade, por nome. */
export type Campos = Record<string, unknown>;

/** Chave que nunca vai para o registro (senha, hash de senha, token de tablet ou de botão). */
const SENSIVEL = /senha|token/i;

function ehObjetoSimples(valor: unknown): valor is Campos {
  if (valor === null || typeof valor !== "object") return false;
  const proto = Object.getPrototypeOf(valor);
  return proto === Object.prototype || proto === null;
}

function limparValor(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(limparValor);
  if (!ehObjetoSimples(valor)) return valor;
  const limpo: Campos = {};
  for (const [chave, v] of Object.entries(valor)) {
    if (!SENSIVEL.test(chave)) limpo[chave] = limparValor(v);
  }
  return limpo;
}

/**
 * Tira, em qualquer nível, toda chave que contenha `senha` ou `token`
 * (sem diferenciar maiúsculas). O que sobrar vazio vira `null`.
 */
export function limparSensiveis(campos: Campos | null | undefined): Campos | null {
  if (!campos) return null;
  const limpo = limparValor(campos) as Campos;
  return Object.keys(limpo).length > 0 ? limpo : null;
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Só os campos cujo valor mudou entre `antes` e `depois`.
 * Campo que não existia de um lado fica só do outro. Nada mudou: os dois `null`.
 */
export function diferenca(
  antes: Campos | null | undefined,
  depois: Campos | null | undefined,
): { antes: Campos | null; depois: Campos | null } {
  const a = antes ?? {};
  const d = depois ?? {};
  const saiu: Campos = {};
  const entrou: Campos = {};
  for (const chave of new Set([...Object.keys(a), ...Object.keys(d)])) {
    if (igual(a[chave], d[chave])) continue;
    if (chave in a) saiu[chave] = a[chave];
    if (chave in d) entrou[chave] = d[chave];
  }
  const ouNulo = (c: Campos) => (Object.keys(c).length > 0 ? c : null);
  return { antes: ouNulo(saiu), depois: ouNulo(entrou) };
}
