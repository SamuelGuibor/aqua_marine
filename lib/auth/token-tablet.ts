// Token do aparelho vinculado: o aparelho guarda o token, o banco só o hash.
// O token é aleatório e longo, então SHA-256 basta (não é senha: sem argon2).
import { createHash, randomBytes } from "node:crypto";

/** 32 bytes aleatórios em base64url (43 caracteres). */
export function gerarTokenDoTablet(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 em hexadecimal: o que vai para `tablet_vinculo.token_hash`. */
export function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
