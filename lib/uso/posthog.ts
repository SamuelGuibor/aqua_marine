import posthog from "posthog-js";

// PostHog (projeto "aquapulse", região US). Sem NEXT_PUBLIC_POSTHOG_KEY nada é iniciado
// e nenhuma requisição sai. Sem autocaptura, sem gravação de sessão; a visita de página é
// enviada à mão, só com o caminho (sem query, que pode ter dado de tela).
const chave = process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let ligado = false;

export function iniciarPosthog() {
  if (ligado || !chave || typeof window === "undefined") return;
  try {
    posthog.init(chave, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: "identified_only",
      ip: false,
    });
    ligado = true;
  } catch {
    // Falha silenciosa: uso não pode atrapalhar o operador.
  }
}

export function posthogLigado() {
  return ligado;
}

export function registrarVisita(caminho: string) {
  if (!ligado) return;
  try {
    const so = caminho.split(/[?#]/)[0];
    posthog.capture("$pageview", { $current_url: window.location.origin + so, $pathname: so });
  } catch {
    // silencioso
  }
}

export { posthog };
