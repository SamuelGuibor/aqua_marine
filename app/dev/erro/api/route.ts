// Route Handler de teste do Sentry (SCRUM-30): sempre lança. Protegido pelo proxy.ts (/dev/*).
export function GET(): Response {
  throw new Error("Erro proposital de teste (SCRUM-30, servidor)");
}
