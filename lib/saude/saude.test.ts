import { afterEach, expect, test, vi } from "vitest";

import { verificarSaude, versaoDoApp } from "./saude";

const AGORA = new Date("2026-11-26T12:00:00.000Z");
const base = { agora: () => AGORA, env: {} };

afterEach(() => {
  vi.useRealTimers();
});

test("banco respondendo: 200 com ok e banco verdadeiros", async () => {
  const saude = await verificarSaude({ ...base, consultar: async () => [1] });

  expect(saude).toEqual({
    status: 200,
    corpo: {
      ok: true,
      banco: true,
      versao: "dev",
      agora: "2026-11-26T12:00:00.000Z",
    },
  });
});

test("o corpo tem exatamente as quatro chaves", async () => {
  const boa = await verificarSaude({ ...base, consultar: async () => [1] });
  const ruim = await verificarSaude({
    ...base,
    consultar: async () => {
      throw new Error("falhou");
    },
  });

  const chaves = ["agora", "banco", "ok", "versao"];
  expect(Object.keys(boa.corpo).sort()).toEqual(chaves);
  expect(Object.keys(ruim.corpo).sort()).toEqual(chaves);
});

test("consulta rejeitada: 503 sem a mensagem do driver no corpo", async () => {
  const saude = await verificarSaude({
    ...base,
    consultar: async () => {
      throw new Error(
        "getaddrinfo ENOTFOUND ep-segredo.sa-east-1.aws.neon.tech",
      );
    },
  });

  expect(saude.status).toBe(503);
  expect(saude.corpo.ok).toBe(false);
  expect(saude.corpo.banco).toBe(false);
  const texto = JSON.stringify(saude.corpo);
  expect(texto).not.toContain("neon.tech");
  expect(texto).not.toContain("ENOTFOUND");
});

test("consulta que lança de forma síncrona: 503", async () => {
  const saude = await verificarSaude({
    ...base,
    consultar: () => {
      throw new Error("DATABASE_URL não definida.");
    },
  });

  expect(saude.status).toBe(503);
  expect(saude.corpo.banco).toBe(false);
  expect(JSON.stringify(saude.corpo)).not.toContain("DATABASE_URL");
});

test("consulta que nunca responde: 503 quando o limite de 3 s estoura", async () => {
  vi.useFakeTimers();
  let pronta = false;
  const promessa = verificarSaude({
    ...base,
    consultar: () => new Promise(() => {}),
  }).then((saude) => {
    pronta = true;
    return saude;
  });

  await vi.advanceTimersByTimeAsync(2999);
  expect(pronta).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  const saude = await promessa;
  expect(saude.status).toBe(503);
  expect(saude.corpo.banco).toBe(false);
});

test("consulta rápida não deixa temporizador pendurado", async () => {
  vi.useFakeTimers();
  await verificarSaude({ ...base, consultar: async () => [1] });

  expect(vi.getTimerCount()).toBe(0);
});

test("versao: 7 primeiros caracteres do SHA do deploy", () => {
  expect(
    versaoDoApp({
      VERCEL_GIT_COMMIT_SHA: "e57b685d6f79a74fe5a49c99d00fb2a8e67f0892",
    }),
  ).toBe("e57b685");
});

test("versao: dev sem a variável ou com ela vazia", () => {
  expect(versaoDoApp({})).toBe("dev");
  expect(versaoDoApp({ VERCEL_GIT_COMMIT_SHA: "" })).toBe("dev");
});
