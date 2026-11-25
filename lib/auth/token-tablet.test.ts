import { expect, test } from "vitest";

import { gerarTokenDoTablet, hashDoToken } from "./token-tablet";

test("o token tem 32 bytes em base64url", () => {
  const token = gerarTokenDoTablet();
  expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(Buffer.from(token, "base64url")).toHaveLength(32);
});

test("dois tokens são diferentes", () => {
  expect(gerarTokenDoTablet()).not.toBe(gerarTokenDoTablet());
});

test("o hash é o SHA-256 em hexadecimal", () => {
  // Valor conhecido: mudar o algoritmo invalidaria os vínculos já gravados.
  expect(hashDoToken("abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("o hash é estável e diferente do token", () => {
  const token = gerarTokenDoTablet();
  expect(hashDoToken(token)).toBe(hashDoToken(token));
  expect(hashDoToken(token)).not.toBe(token);
});
