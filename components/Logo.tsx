import Image from "next/image";
import clsx from "clsx";

// Proporção (largura / altura) do viewBox de cada SVG em public/.
const LOGOS = {
  horizontal: { arquivo: "/logo-horizontal.svg", proporcao: 748.7 / 102.5 },
  simbolo: { arquivo: "/logo-simbolo.svg", proporcao: 1 },
};

type LogoProps = {
  forma?: keyof typeof LOGOS;
  /** Altura em px; a largura sai da proporção. */
  tamanho?: number;
  className?: string;
};

export function Logo({
  forma = "horizontal",
  tamanho = 30,
  className,
}: LogoProps) {
  const { arquivo, proporcao } = LOGOS[forma];

  return (
    <Image
      src={arquivo}
      alt="AquaPulse"
      width={Math.round(tamanho * proporcao)}
      height={tamanho}
      className={clsx("shrink-0", className)}
    />
  );
}
