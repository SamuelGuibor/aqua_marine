// Hash de senha com argon2id (padrão do pacote). Os parâmetros ficam gravados no
// próprio hash, então podem subir depois sem invalidar as senhas existentes.
import { hash } from "@node-rs/argon2";

const OPCOES = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export function gerarHashDeSenha(senha: string): Promise<string> {
  return hash(senha, OPCOES);
}
