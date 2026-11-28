// Lista fechada dos nomes de ação gravados em `registro_acao` (formato `entidade.verbo`).
// Um nome fora desta lista não compila em `registrarAcao`.
// Card que precisar de nome novo acrescenta aqui (e cita o nome no próprio card).

export const ACOES = [
  "tablet.criado",
  "tablet.codigo_regenerado",
  "tablet.vinculado",
  "tablet.desvinculado",
  "meta.alterada",
  "dias_uteis.alterados",
  "pausa.classificada",
  "pausa.regra_alterada",
  "motivo.criado",
  "mesa.operadora_alterada",
  "mesa.medida_alterada",
  "mesa.criada",
  "operadora.criada",
  "operadora.removida",
  "jornada.fechada",
  "jornada.reaberta",
  "lote.fechado",
  "op.criada",
  "op.expedida",
  "estoque.ajustado",
  "estoque.minimo_alterado",
  "registro.corrigido",
  "dia.lancado",
  "exportacao.gerada",
  "usuario.senha_trocada",
  "login.sucesso",
  "login.recusado",
] as const;

export type Acao = (typeof ACOES)[number];
