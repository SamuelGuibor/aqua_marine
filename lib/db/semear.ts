// Dados iniciais do banco, usados pelo `npm run db:seed` (seed.ts) e pelo teste
// das migrations. Só insere o que falta: nunca altera nem apaga.
// Nunca imprima senha, hash ou URL do banco, nem em mensagem de erro.
import { eq } from "drizzle-orm";
import { gerarHashDeSenha } from "../auth/senha";
import { anoMesEm, diasUteisDoMes } from "../dominio/calendario";
import type { Transacao } from "./cliente";
import {
  calendarioMes,
  medida,
  mesa,
  metaSetor,
  pausaCategoria,
  pausaMotivo,
  relatorioAgendado,
  setor,
  setorConfig,
  setorEstado,
  usuario,
} from "./schema";

/** O que o seed usa da transação (o teste passa a do PGlite). */
export type Escrita = Pick<Transacao, "insert" | "select" | "$count">;

export const SETORES: (typeof setor.$inferInsert)[] = [
  {
    id: "inj",
    nome: "Injetora",
    nomeCurto: "Injetora",
    descricao: "Produção de placas",
    slug: "injetora",
    cor: "#60A5FA",
    ordem: 1,
    unidade: "boas",
  },
  {
    id: "mon",
    nome: "Montagem",
    nomeCurto: "Montagem",
    descricao: "Placas montadas nas mesas",
    slug: "montagem",
    cor: "#2DD4BF",
    ordem: 2,
    unidade: "montadas",
  },
  {
    id: "tes",
    nome: "Teste & Embalagem",
    nomeCurto: "Teste & Emb.",
    descricao: "Teste de pressão e pacotes",
    slug: "teste",
    cor: "#C4B5FD",
    ordem: 3,
    unidade: "embaladas",
  },
];

export const CONFIGS: (typeof setorConfig.$inferInsert)[] = [
  { setorId: "inj", minutosAvisoParada: 10, inicioJornada: "07:00" },
  { setorId: "mon", minutosAvisoParada: 15, inicioJornada: "07:00" },
  {
    setorId: "tes",
    minutosAvisoParada: 15,
    placasPorPacotePadrao: 10,
    placasPorPacoteMin: 1,
    placasPorPacoteMax: 30,
    inicioJornada: "07:00",
  },
];

export const MEDIDAS: (typeof medida.$inferInsert)[] = [
  { id: 1, comprimentoM: 2, areaM2: 1, ordem: 1 },
  { id: 2, comprimentoM: 3, areaM2: 1.5, ordem: 2 },
  { id: 3, comprimentoM: 4, areaM2: 2, ordem: 3 },
  { id: 4, comprimentoM: 5, areaM2: 2.5, ordem: 4 },
];

/** SCRUM-37: mesas 1 a 6, sem operadora e sem medida. */
export const MESAS: (typeof mesa.$inferInsert)[] = [1, 2, 3, 4, 5, 6].map(
  (numero) => ({ numero }),
);

/** SCRUM-47: as 7 categorias. Só Refeição é planejada. */
export const CATEGORIAS: (typeof pausaCategoria.$inferInsert)[] = [
  { id: "manutencao", nome: "Manutenção", pergunta: "QUAL MANUTENÇÃO?", cor: "#F87171", icone: "chave", ordem: 1 },
  { id: "falta_material", nome: "Falta de material", pergunta: "FALTOU O QUÊ?", cor: "#FB923C", icone: "caixa", ordem: 2 },
  { id: "troca_medida", nome: "Troca de medida", pergunta: "QUE TIPO DE TROCA?", cor: "#E879F9", icone: "regua", ordem: 3 },
  { id: "refeicao", nome: "Refeição", pergunta: "QUAL REFEIÇÃO?", cor: "#64748B", icone: "talheres", planejada: true, ordem: 4 },
  { id: "energia_ar_agua", nome: "Energia, ar ou água", pergunta: "O QUE FALTOU?", cor: "#FACC15", icone: "raio", ordem: 5 },
  { id: "pessoas", nome: "Pessoas", pergunta: "O QUE ACONTECEU?", cor: "#A3E635", icone: "pessoas", ordem: 6 },
  { id: "outro", nome: "Outro", pergunta: null, cor: "#94A3B8", icone: "interrogacao", ordem: 7 },
];

type ListaDeMotivos = Record<string, Partial<Record<"inj" | "mon" | "tes" | "comum", string[]>>>;

/** SCRUM-47: "lista inicial para conferir com a fábrica". `comum` = os três setores. */
export const MOTIVOS: ListaDeMotivos = {
  manutencao: {
    inj: ["Molde", "Resistência / aquecimento", "Sistema hidráulico", "Bico / canhão", "Refrigeração", "Painel elétrico"],
    mon: ["Bancada / mesa", "Botão ESP32", "Ferramenta", "Elétrica"],
    tes: ["Bancada de teste", "Compressor / ar", "Manômetro", "Vedação / conexão"],
  },
  falta_material: {
    inj: ["Matéria-prima", "Pigmento / aditivo", "Peça de reposição"],
    mon: ["Placas da Injetora", "Componentes", "Insumos"],
    tes: ["Placas da Montagem", "Embalagem", "Etiquetas"],
  },
  troca_medida: {
    inj: ["Troca de molde", "Aquecimento da máquina", "Regulagem"],
    mon: ["Troca de medida", "Organização da bancada"],
    tes: ["Troca de medida", "Ajuste da bancada"],
  },
  refeicao: { comum: ["Almoço", "Café"] },
  energia_ar_agua: { comum: ["Queda de energia", "Falta de ar comprimido", "Falta de água"] },
  pessoas: { comum: ["Operador ausente", "Reunião", "Treinamento"] },
};

/** SCRUM-51: meta 270 por setor desde o primeiro dia de dados. */
export const META_INICIAL = { placasDia: 270, vigenteDe: "2026-11-01" };

function motivosDoSeed(): (typeof pausaMotivo.$inferInsert)[] {
  const linhas: (typeof pausaMotivo.$inferInsert)[] = [];
  for (const [categoriaId, porSetor] of Object.entries(MOTIVOS)) {
    for (const [chave, nomes] of Object.entries(porSetor)) {
      nomes?.forEach((nome, i) =>
        linhas.push({
          categoriaId,
          setorId: chave === "comum" ? null : chave,
          nome,
          ordem: i + 1,
        }),
      );
    }
  }
  return linhas;
}

/**
 * Motivos não têm chave natural única (o índice só vale para os ativos): um
 * motivo desativado pelo RH não pode voltar pelo seed. Por isso a conferência
 * é feita aqui, contra todas as linhas, ativas ou não.
 */
async function inserirMotivosQueFaltam(tx: Escrita) {
  const chave = (m: { categoriaId: string; setorId?: string | null; nome: string }) =>
    `${m.categoriaId}|${m.setorId ?? "*"}|${m.nome.toLowerCase()}`;
  const existentes = new Set(
    (
      await tx
        .select({
          categoriaId: pausaMotivo.categoriaId,
          setorId: pausaMotivo.setorId,
          nome: pausaMotivo.nome,
        })
        .from(pausaMotivo)
    ).map(chave),
  );
  const faltam = motivosDoSeed().filter((m) => !existentes.has(chave(m)));
  if (faltam.length) await tx.insert(pausaMotivo).values(faltam);
}

/** Cria o primeiro admin. Se já existe algum, não toca nele nem lê a senha. */
async function criarPrimeiroAdmin(tx: Escrita, senha: string | undefined) {
  const admins = await tx.$count(usuario, eq(usuario.papel, "admin"));
  if (admins > 0) return;

  if (!senha?.trim()) {
    throw new Error(
      "ADMIN_SENHA_INICIAL não definida e ainda não há usuário admin. " +
        "Preencha no .env.local e rode de novo. Nada foi gravado.",
    );
  }

  await tx.insert(usuario).values({
    nome: "Administração",
    papel: "admin",
    senhaHash: await gerarHashDeSenha(senha),
  });
}

/** Insere tudo o que falta e devolve as contagens por tabela. */
export async function semearBanco(
  tx: Escrita,
  opcoes: { senhaAdmin: string | undefined; agora?: Date },
) {
  await tx.insert(setor).values(SETORES).onConflictDoNothing();
  await tx.insert(setorConfig).values(CONFIGS).onConflictDoNothing();
  await tx
    .insert(setorEstado)
    .values(SETORES.map(({ id }) => ({ setorId: id })))
    .onConflictDoNothing();
  await tx.insert(medida).values(MEDIDAS).onConflictDoNothing();
  await criarPrimeiroAdmin(tx, opcoes.senhaAdmin);

  await tx.insert(mesa).values(MESAS).onConflictDoNothing();
  await tx.insert(pausaCategoria).values(CATEGORIAS).onConflictDoNothing();
  await inserirMotivosQueFaltam(tx);
  await tx
    .insert(metaSetor)
    .values(SETORES.map(({ id }) => ({ setorId: id, ...META_INICIAL })))
    .onConflictDoNothing();

  const { ano, mes } = anoMesEm(opcoes.agora ?? new Date());
  await tx
    .insert(calendarioMes)
    .values({ ano, mes, diasUteis: diasUteisDoMes(ano, mes) })
    .onConflictDoNothing();
  await tx.insert(relatorioAgendado).values({ id: 1 }).onConflictDoNothing();

  return {
    setor: await tx.$count(setor),
    setor_config: await tx.$count(setorConfig),
    setor_estado: await tx.$count(setorEstado),
    medida: await tx.$count(medida),
    "usuario (admin)": await tx.$count(usuario, eq(usuario.papel, "admin")),
    mesa: await tx.$count(mesa),
    pausa_categoria: await tx.$count(pausaCategoria),
    pausa_motivo: await tx.$count(pausaMotivo),
    meta_setor: await tx.$count(metaSetor),
    calendario_mes: await tx.$count(calendarioMes),
    relatorio_agendado: await tx.$count(relatorioAgendado),
  };
}
