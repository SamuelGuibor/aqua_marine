import { TesteErro } from "./TesteErro";

// Página de teste do Sentry e do PostHog (SCRUM-30). Como tudo em /dev/*, só existe com
// GALERIA_TELAS=ligada (proxy.ts); nunca em Production.
export default function PaginaTesteErro() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-cond text-32 font-extrabold">Teste de erros e uso</h1>
      <TesteErro />
      <a className="text-16 text-acao-claro underline" href="/dev/erro/api">
        Erro no servidor (/dev/erro/api)
      </a>
    </main>
  );
}
