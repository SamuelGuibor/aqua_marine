import type { ErrorEvent } from "@sentry/nextjs";

// Opções comuns do Sentry (navegador, Node e Edge). Sem DSN o Sentry nem é iniciado.
// Ambiente: production / preview na Vercel; development fora dela.
// Versão: o commit do deploy (a Vercel preenche; no navegador, a versão NEXT_PUBLIC_).
// Sem dados pessoais e sem gravação de sessão (Replay).

export const dsnSentry = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

export function opcoesSentry(ambiente: string | undefined, versao: string | undefined) {
  return {
    dsn: dsnSentry,
    environment: ambiente || "development",
    release: versao || undefined,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: limparEvento,
  };
}

// Tira do evento o que pode carregar dado pessoal: corpo, cookies, cabeçalhos, query e usuário.
export function limparEvento(evento: ErrorEvent): ErrorEvent {
  if (evento.request) {
    delete evento.request.data;
    delete evento.request.cookies;
    delete evento.request.headers;
    delete evento.request.query_string;
    if (evento.request.url) evento.request.url = evento.request.url.split("?")[0];
  }
  delete evento.user;
  return evento;
}
