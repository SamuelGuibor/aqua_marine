import * as Sentry from "@sentry/nextjs";
import { dsnSentry, opcoesSentry } from "@/lib/erros/sentry";

// Sentry no servidor (Node e Edge): Server Components, Server Actions e Route Handlers.
// Sem NEXT_PUBLIC_SENTRY_DSN nada é iniciado e nenhuma requisição sai.
export function register() {
  if (!dsnSentry) return;
  Sentry.init(opcoesSentry(process.env.VERCEL_ENV, process.env.VERCEL_GIT_COMMIT_SHA));
}

// Erros de servidor capturados pelo Next (render, Server Action, Route Handler).
export const onRequestError = Sentry.captureRequestError;
