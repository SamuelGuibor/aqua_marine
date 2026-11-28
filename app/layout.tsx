import type { Metadata, Viewport } from "next";
import { classeFontes } from "@/lib/tema/fontes";
import { cores } from "@/lib/tema/tokens";
import "./globals.css";

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
    <html lang="pt-BR" className={classeFontes}>
      <body>{children}</body>
    </html>
  );
}
