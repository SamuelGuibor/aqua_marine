import * as Sentry from "@sentry/nextjs";
import { dsnSentry, opcoesSentry } from "@/lib/erros/sentry";
import { iniciarPosthog, registrarVisita } from "@/lib/uso/posthog";

// Sentry no navegador. Sem NEXT_PUBLIC_SENTRY_DSN nada é iniciado e nenhuma requisição sai.
// Nota para o service worker (SCRUM-85): ele não pode interceptar *.sentry.io nem *.posthog.com;
// as duas ferramentas já falham em silêncio sem rede.
if (dsnSentry) {
  Sentry.init(
    opcoesSentry(
      process.env.NEXT_PUBLIC_VERCEL_ENV,
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    ),
  );
}

// Uso (PostHog): visita da carga inicial e de cada navegação. Sem chave, não faz nada.
iniciarPosthog();
registrarVisita(window.location.pathname);

export function onRouterTransitionStart(
  ...args: Parameters<typeof Sentry.captureRouterTransitionStart>
) {
  if (dsnSentry) Sentry.captureRouterTransitionStart(...args);
  registrarVisita(new URL(args[0], window.location.href).pathname);
}
