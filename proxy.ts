import { NextResponse } from "next/server";

// O único proxy.ts do projeto (o Next aceita só um): o login entra neste mesmo arquivo,
// acrescentando as rotas dele ao matcher.
//
// /api/health é pública (o monitor de fora do ar chama sem sessão): quando o login (SCRUM-34)
// entrar aqui, ela fica fora do matcher e do redirecionamento para /entrar.
//
// Páginas de desenvolvimento (/dev/*): só existem com GALERIA_TELAS=ligada, que fica no
// .env.local e no Preview da Vercel, nunca em Production. A resposta 404 é dada aqui porque,
// com cacheComponents, um notFound() dentro da página sairia com status 200.
export function proxy() {
  if (process.env.GALERIA_TELAS !== "ligada") {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dev/:path*",
};
