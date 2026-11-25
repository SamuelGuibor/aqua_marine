// Tokens do tema escuro, contados nos quadros Tela-* e RH2-* do protótipo.
// Lidos pelo tailwind.config.ts e pelos gráficos. Este arquivo não importa nada.
// Um grupo vira o prefixo da classe: cores.boa.claro → text-boa-claro; DEFAULT → text-boa.
// Hex repetido com dois nomes é apelido de papel, não é cor nova.

export const cores = {
  // Superfície base das telas e trilho de barra/anel.
  fundo: {
    DEFAULT: "#0A0E15",
    trilho: "#1C2738",
  },
  // Barra do topo, abas e painéis laterais.
  nav: "#0D121B",
  // Cartões e blocos.
  cartao: {
    DEFAULT: "#111824",
    selecionado: "#16223A",
    hover: "#141D2B",
  },
  // Caixas de resumo dentro dos blocos, botão secundário e chip.
  azulejo: {
    DEFAULT: "#0D1420",
    botao: "#182233",
    planejada: "#1E293B",
  },
  // Contornos e divisórias.
  borda: {
    DEFAULT: "#26334A",
    controle: "#33425C",
    nav: "#1F2A3D",
    forte: "#4B5B78",
    hover: "#3B4C6B",
    acao: "#2E4470",
    seta: "#5B6B88",
  },
  // Texto sobre o fundo escuro.
  texto: {
    DEFAULT: "#EEF2F8",
    apoio: "#A3B0C2",
    "2": "#CBD5E1",
    "3": "#B7C2D3",
    branco: "#FFFFFF",
    "icone-fraco": "#6B7B98",
    placeholder: "#8592A6",
    "placeholder-2": "#8B98AD",
    desabilitado: "#7D8BA0",
    "barra-neutra": "#8DA2C0",
  },
  // Botões, links, seleção e foco.
  acao: {
    DEFAULT: "#2563EB",
    hover: "#1D4ED8",
    claro: "#93C5FD",
    "claro-2": "#BFDBFE",
    selecao: "#60A5FA",
    fundo: "#0E1B36",
    "fundo-dica": "#0D1626",
    "fundo-hover": "#1E2D4A",
    "fundo-foco": "#121D2E",
    "borda-fraca": "#3B5B9A",
  },
  // Rodando, meta batida, peça boa.
  boa: {
    DEFAULT: "#22C55E",
    claro: "#86EFAC",
    "claro-2": "#BBF7D0",
    sobre: "#052E16",
    fundo: "#0F2A1B",
    borda: "#1F6B3D",
    "borda-celula": "#1E5B36",
    trilho: "#12301F",
    pulso: "rgba(34,197,94,.55)",
    "pulso-fim": "rgba(34,197,94,0)",
  },
  // Pausado, atrás da meta, avisos e folha de pausa.
  atencao: {
    DEFAULT: "#F59E0B",
    claro: "#FCD34D",
    "claro-2": "#FDE68A",
    sobre: "#2A1A00",
    fundo: "#2A1F07",
    "fundo-linha": "#1F1806",
    "fundo-vaga": "#1A1608",
    "fundo-cartao": "#17130B",
    "fundo-cartao-hover": "#1E180D",
    borda: "#7A5A12",
    "borda-forte": "#B7791F",
    "borda-botao": "#6B5A2A",
    "borda-vaga": "#9A7216",
    folha: "#15110A",
    azulejo: "#211A0C",
    "azulejo-borda": "#4A3A14",
    "azulejo-sel": "#3A2A08",
    divisor: "#3A2E12",
    desabilitado: "#A08E5C",
  },
  // Perda, defeito, erro e ação perigosa.
  perda: {
    DEFAULT: "#DC2626",
    claro: "#FCA5A5",
    "claro-2": "#FECACA",
    linha: "#F87171",
    borda: "#7F1D1D",
    fundo: "#1A0D10",
    "fundo-chip": "#2A0F12",
    halo: "rgba(248,113,113,.35)",
    "erro-campo": "#EF4444",
  },
  // Identidade dos 3 setores. O setor da tela atual (bg-setor) é montado no tailwind.config.ts.
  setor: {
    inj: {
      DEFAULT: "#60A5FA",
      claro: "#93C5FD",
    },
    mon: {
      DEFAULT: "#2DD4BF",
      claro: "#5EEAD4",
      "claro-2": "#99F6E4",
      "claro-3": "#CCFBF1",
      fundo: "#123B35",
      painel: "#0E2A26",
      azulejo: "#0B211E",
      "azulejo-borda": "#17463F",
      borda: "#1D5E55",
      "borda-tracejada": "#3F7F76",
    },
    tes: {
      DEFAULT: "#C4B5FD",
      claro: "#DDD6FE",
      "claro-2": "#EEE9FE",
      fundo: "#211B3B",
      listra: "#8B7FC9",
      reservado: "#5B5490",
    },
  },
  // Categorias de pausa. "Sem motivo" é uma listra com `sem` e `sem-listra`.
  pausa: {
    manutencao: "#F87171",
    material: "#FB923C",
    troca: "#E879F9",
    refeicao: "#64748B",
    energia: "#FACC15",
    pessoas: "#A3E635",
    outro: "#94A3B8",
    sem: "#F59E0B",
    "sem-listra": "#5A3A06",
  },
  // Faixa azul da tela Entrar.
  marca: {
    azul: "#00246A",
    onda: "#1976F3",
    ciano: "#90DAFF",
    texto: "#D3E2F8",
  },
  // Folha clara do relatório (prévia de exportação e PDF).
  relatorio: {
    papel: "#FFFFFF",
    texto: "#141B26",
    apoio: "#4A5568",
    borda: "#CBD5E1",
    chip: "#E8EDF5",
    "alerta-fundo": "#FEF2F2",
    "alerta-titulo": "#991B1B",
    "alerta-texto": "#7F1D1D",
    sombra: "rgba(0,0,0,.35)",
  },
  // Véus atrás de painéis e folhas, e cores de sombra.
  veu: {
    folha: "rgba(5,8,13,.72)",
    painel: "rgba(5,8,13,.66)",
    menu: "rgba(5,8,13,.45)",
    detalhe: "rgba(5,8,13,.62)",
    pausa: "rgba(5,8,13,.74)",
    gaveta: "rgba(5,8,13,.6)",
    sombra: "rgba(0,0,0,.5)",
    "sombra-painel": "rgba(0,0,0,.45)",
    "sombra-pausa": "rgba(0,0,0,.6)",
  },
} as const;

// Raios em px, com o nome do valor: rounded-12, rounded-22.
export const raios = {
  none: "0",
  "2": "2px",
  "3": "3px",
  "4": "4px",
  "5": "5px",
  "6": "6px",
  "8": "8px",
  "9": "9px",
  "10": "10px",
  "12": "12px",
  "13": "13px",
  "14": "14px",
  "16": "16px",
  "18": "18px",
  "20": "20px",
  "22": "22px",
  "24": "24px",
  full: "9999px",
} as const;

// Tamanhos de fonte em px: text-14 a text-88. Nada abaixo de 14.
export const tamanhosDeFonte = {
  "14": "14px",
  "15": "15px",
  "16": "16px",
  "17": "17px",
  "18": "18px",
  "19": "19px",
  "20": "20px",
  "21": "21px",
  "22": "22px",
  "24": "24px",
  "26": "26px",
  "28": "28px",
  "30": "30px",
  "32": "32px",
  "34": "34px",
  "36": "36px",
  "38": "38px",
  "40": "40px",
  "42": "42px",
  "44": "44px",
  "46": "46px",
  "48": "48px",
  "50": "50px",
  "52": "52px",
  "56": "56px",
  "60": "60px",
  "64": "64px",
  "88": "88px",
} as const;
