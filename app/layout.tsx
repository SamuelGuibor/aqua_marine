import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import { cores } from "@/lib/tema/tokens";
import "./globals.css";

// As fontes são baixadas no build e servidas do próprio domínio.
// Barlow não é variável: cada peso usado precisa estar na lista.
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

export const metadata: Metadata = {
  title: "AquaPulse",
  description: "Sistema de produção AquaPulse",
};

export const viewport: Viewport = {
  themeColor: cores.fundo.DEFAULT,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${barlowCond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
