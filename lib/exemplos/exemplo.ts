// Valores de exemplo da vista "exemplo", tirados do quadro Tela-Area-TabletH do protótipo.
import type {
  SetorDoExemplo,
  VistaExemploProps,
} from "@/components/vistas/VistaExemplo";
import type { EstadoDe } from "@/lib/telas/registro";

const base = { data: "Terça, 03/11 · 15:36", meta: 270 };

const setores: readonly SetorDoExemplo[] = [
  {
    id: "inj",
    setor: "inj",
    nome: "Injetora",
    produzido: 240,
    situacao: "parada sem motivo · 12 min",
    pedeAtencao: true,
  },
  {
    id: "mon",
    setor: "mon",
    nome: "Montagem",
    produzido: 387,
    situacao: "em produção",
    pedeAtencao: false,
  },
  {
    id: "tes",
    setor: "tes",
    nome: "Teste & Embalagem",
    produzido: 0,
    situacao: "pausado · manutenção",
    pedeAtencao: true,
  },
];

// Lista longa o bastante para o miolo rolar em qualquer janela.
const listaLonga = Array.from({ length: 10 }, (_, volta) =>
  setores.map((item) => ({ ...item, id: `${item.id}-${volta}` })),
).flat();

export const exemplo: Record<EstadoDe<"exemplo">, VistaExemploProps> = {
  padrao: { ...base, setores },
  vazio: { ...base, setores: [] },
  "miolo-rola": { ...base, setores: listaLonga, casca: "rola" },
};
