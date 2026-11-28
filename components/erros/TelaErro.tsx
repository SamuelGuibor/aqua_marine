// Tela cheia de erro / não encontrado, no tema escuro.
// Provisória até o EstadoErro (SCRUM-26), que pode substituí-la.
export function TelaErro({
  titulo,
  texto,
  acao,
}: {
  titulo: string;
  texto: string;
  acao?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-cond text-32 font-extrabold leading-none text-texto">{titulo}</h1>
      <p className="max-w-md text-16 text-texto-apoio">{texto}</p>
      {acao}
    </main>
  );
}

// Alvo de toque de 48 px em todas as larguras (o h-toque baixa para 44/40 em telas maiores).
export const classeBotaoErro =
  "inline-flex min-h-12 items-center justify-center rounded-10 bg-acao px-6 text-16 font-semibold text-texto-branco hover:bg-acao-hover";
