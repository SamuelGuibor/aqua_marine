import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda fora do Next: carrega o .env.local do mesmo jeito que o app.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    // Migration usa sempre a conexão direta, nunca a de pooling.
    // Vazia, `db:gerar` ainda funciona; `db:migrar` falha pedindo a URL.
    url: process.env.DATABASE_URL_UNPOOLED ?? "",
  },
});
