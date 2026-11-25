import type { Config } from "tailwindcss";
// Caminho relativo: o alias @/ não vale no arquivo de configuração.
import { cores, raios, tamanhosDeFonte } from "./lib/tema/tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Paleta, escala de fonte e raios são substituídos: só existe o que está no protótipo.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      ...cores,
      // --setor é a cor do setor da tela atual; cada tela de setor sobrescreve a variável.
      setor: { ...cores.setor, DEFAULT: "var(--setor)" },
    },
    fontSize: tamanhosDeFonte,
    borderRadius: raios,
    extend: {
      fontFamily: {
        sans: ["var(--font-barlow)", "system-ui", "sans-serif"],
        cond: ["var(--font-barlow-cond)", "system-ui", "sans-serif"],
      },
      borderColor: {
        DEFAULT: cores.borda.DEFAULT,
      },
    },
  },
  plugins: [],
};
export default config;
