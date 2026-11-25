import { Logo } from "@/components/Logo";

// Página provisória: só confere o tema, as fontes e os logos.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <Logo forma="simbolo" tamanho={96} />
      <Logo tamanho={36} />
      <h1 className="font-cond text-44 font-extrabold leading-none">
        AquaPulse
      </h1>
      <p className="text-16 text-texto-apoio">Sistema de produção</p>
    </main>
  );
}
