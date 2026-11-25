import clsx from "clsx";

import { Logo } from "@/components/Logo";

// Vista de exemplo da galeria (docs/larguras.md): mostra o formato que as vistas das telas
// seguem (só props, sem buscar dados) e exercita os cortes, o h-toque e as duas cascas.
// Não é uma tela do sistema.

const CORES_DO_SETOR = {
  inj: { texto: "text-setor-inj", barra: "bg-setor-inj" },
  mon: { texto: "text-setor-mon", barra: "bg-setor-mon" },
  tes: { texto: "text-setor-tes", barra: "bg-setor-tes" },
};

export type SetorDoExemplo = {
  id: string;
  setor: keyof typeof CORES_DO_SETOR;
  nome: string;
  produzido: number;
  situacao: string;
  pedeAtencao: boolean;
};

export type VistaExemploProps = {
  data: string;
  meta: number;
  setores: readonly SetorDoExemplo[];
  /** "cabe": a página rola se passar. "rola": cabeçalho e rodapé parados, só o miolo rola. */
  casca?: "cabe" | "rola";
};

const CAMPO =
  "h-toque w-full rounded-10 border border-borda-controle bg-cartao px-3 text-16 text-texto";

export function VistaExemplo({
  data,
  meta,
  setores,
  casca = "cabe",
}: VistaExemploProps) {
  const rola = casca === "rola";

  return (
    <div className={rola ? "casca-rola" : "casca-cabe"}>
      <header className="flex items-center justify-between gap-3 border-b border-borda-nav bg-nav px-4 py-3 tablet:px-6">
        <Logo tamanho={24} />
        <p className="hidden text-16 text-texto-apoio posto:flex">
          Conferência de larguras
        </p>
        <a
          href="#trocar-de-area"
          className="h-toque inline-flex items-center px-2 text-16 font-semibold text-acao-claro"
        >
          Trocar de área
        </a>
      </header>

      <main
        className={clsx(
          rola ? "casca-rola-miolo" : "casca-cabe-miolo",
          "flex flex-col gap-4 px-4 py-5 tablet:px-6",
        )}
      >
        <div>
          <p className="text-16 text-texto-apoio">{data}</p>
          <h1 className="font-cond text-34 font-extrabold leading-tight tablet:text-44">
            Para onde você vai?
          </h1>
        </div>
        <p className="text-14 font-semibold uppercase text-texto-apoio">
          Produção de hoje · meta {meta} por setor
        </p>
        <p className="text-14 text-texto-apoio tablet:hidden">
          Role a página para ver todos os setores.
        </p>

        {setores.length === 0 ? (
          <p className="rounded-16 border border-borda bg-cartao p-6 text-18 text-texto-2">
            Nenhuma produção registrada hoje.
          </p>
        ) : (
          <ul className="grid gap-4 tablet:grid-cols-3">
            {setores.map((item) => (
              <li key={item.id}>
                <CartaoDoSetor item={item} meta={meta} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="flex flex-col gap-3 border-t border-borda-nav bg-nav px-4 py-3 tablet:flex-row tablet:items-end tablet:px-6">
        <label className="flex flex-1 flex-col gap-1 text-14 text-texto-apoio">
          Operador
          <input
            type="text"
            placeholder="Nome ou matrícula"
            className={CAMPO}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-14 text-texto-apoio">
          Turno
          <select className={CAMPO}>
            <option>Manhã</option>
            <option>Tarde</option>
          </select>
        </label>
        <button
          type="button"
          className="h-toque rounded-10 bg-acao px-6 text-18 font-semibold text-texto-branco hover:bg-acao-hover"
        >
          Continuar
        </button>
      </footer>
    </div>
  );
}

function CartaoDoSetor({ item, meta }: { item: SetorDoExemplo; meta: number }) {
  const cores = CORES_DO_SETOR[item.setor];
  const porcento = Math.min(100, (item.produzido / meta) * 100);

  return (
    <button
      type="button"
      className="flex h-full w-full flex-col gap-2 rounded-16 border border-borda bg-cartao p-5 text-left hover:bg-cartao-hover"
    >
      <span className={clsx("text-20 font-bold", cores.texto)}>
        {item.nome}
      </span>
      <span className="font-cond text-56 font-extrabold leading-none">
        {item.produzido}
      </span>
      <span
        className={clsx(
          "text-16",
          item.pedeAtencao ? "text-atencao" : "text-texto-apoio",
        )}
      >
        {item.situacao}
      </span>
      <span className="mt-auto block h-2 w-full overflow-hidden rounded-full bg-fundo-trilho">
        <span
          className={clsx("block h-full", cores.barra)}
          style={{ width: `${porcento}%` }}
        />
      </span>
    </button>
  );
}
