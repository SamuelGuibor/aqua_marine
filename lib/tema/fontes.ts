import { Barlow, Barlow_Semi_Condensed } from "next/font/google";

// As fontes são baixadas no build e servidas do próprio domínio.
// Barlow não é variável: cada peso usado precisa estar na lista.
// Usadas pelo layout raiz e pelo global-error (que substitui o layout).
const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});
const barlowCond = Barlow_Semi_Condensed({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-cond",
});

export const classeFontes = `${barlow.variable} ${barlowCond.variable}`;
