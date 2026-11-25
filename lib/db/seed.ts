// Seed da base: `npm run db:seed`.
// Pode rodar quantas vezes for: só insere o que falta, nunca altera nem apaga.
// Nunca imprima senha, hash ou URL do banco, nem em mensagem de erro.
import { loadEnvConfig } from "@next/env";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { gerarHashDeSenha } from "../auth/senha";
import { transacao, type Transacao } from "./cliente";
import { medida, setor, setorConfig, setorEstado, usuario } from "./schema";

loadEnvConfig(process.cwd());

const SETORES: (typeof setor.$inferInsert)[] = [
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

const CONFIGS: (typeof setorConfig.$inferInsert)[] = [
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

const MEDIDAS: (typeof medida.$inferInsert)[] = [
  { id: 1, comprimentoM: 2, areaM2: 1, ordem: 1 },
  { id: 2, comprimentoM: 3, areaM2: 1.5, ordem: 2 },
  { id: 3, comprimentoM: 4, areaM2: 2, ordem: 3 },
  { id: 4, comprimentoM: 5, areaM2: 2.5, ordem: 4 },
];

/** Cria o primeiro admin. Se já existe algum, não toca nele nem lê a senha. */
async function criarPrimeiroAdmin(tx: Transacao) {
  const admins = await tx.$count(usuario, eq(usuario.papel, "admin"));
  if (admins > 0) return;

  const senha = process.env.ADMIN_SENHA_INICIAL;
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

async function semear() {
  const contagens = await transacao(async (tx) => {
    await tx.insert(setor).values(SETORES).onConflictDoNothing();
    await tx.insert(setorConfig).values(CONFIGS).onConflictDoNothing();
    await tx
      .insert(setorEstado)
      .values(SETORES.map(({ id }) => ({ setorId: id })))
      .onConflictDoNothing();
    await tx.insert(medida).values(MEDIDAS).onConflictDoNothing();
    await criarPrimeiroAdmin(tx);

    return {
      setor: await tx.$count(setor),
      setor_config: await tx.$count(setorConfig),
      setor_estado: await tx.$count(setorEstado),
      medida: await tx.$count(medida),
      "usuario (admin)": await tx.$count(usuario, eq(usuario.papel, "admin")),
    };
  });

  console.log("Seed concluído. Linhas no banco:");
  for (const [tabela, total] of Object.entries(contagens)) {
    console.log(`  ${tabela}: ${total}`);
  }
}

/** A mensagem do Drizzle traz os parâmetros da consulta: usa só a causa. */
function mensagemSegura(erro: unknown): string {
  if (erro instanceof DrizzleQueryError) {
    return `Falha no banco: ${erro.cause?.message || "causa não informada"}`;
  }
  if (erro instanceof Error) return erro.message;
  // O driver do Neon rejeita com um ErrorEvent sem mensagem quando não conecta.
  return "Não foi possível conectar ao banco. Confira a DATABASE_URL e a rede.";
}

semear().catch((erro: unknown) => {
  console.error(
    mensagemSegura(erro).replace(/postgres(ql)?:\/\/\S+/gi, "<url do banco>"),
  );
  process.exitCode = 1;
});
