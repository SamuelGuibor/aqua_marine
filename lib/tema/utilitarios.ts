// Utilitários de largura do sistema: o alvo de toque e as duas cascas de página (docs/larguras.md).
// Entram como plugin no tailwind.config.ts. Os cortes vêm de theme.screens.
import plugin from "tailwindcss/plugin";

// A mesma altura da variante `baixo` do config: abaixo dela a "casca-rola" passa a rolar a página inteira.
const ALTURA_MINIMA_PARA_FIXAR = "720px";

export const utilitarios = plugin(({ addComponents, theme }) => {
  const tablet = theme("screens.tablet") as string;
  const pc = theme("screens.pc") as string;
  const telaFixa = `@media (min-width: ${tablet}) and (min-height: ${ALTURA_MINIMA_PARA_FIXAR})`;

  // addComponents, e não addUtilities: assim saem antes das utilitárias no CSS, e um
  // min-h-[56px] ou outra classe do Tailwind no mesmo elemento vence. As variantes valem igual.
  addComponents({
    /*
     * Alvo de toque mínimo: 48px no celular, 44px no tablet, 40px no PC com mouse
     * (44px no PC quando a tela é de toque).
     * Uso: <button className="h-toque ...">. É min-height: botões maiores continuam maiores.
     * Em <a> é preciso também `flex` ou `inline-flex` (elemento em linha ignora altura).
     * Não cuida da largura: botão só com ícone precisa de min-w-* próprio.
     */
    ".h-toque": {
      "min-height": "48px",
      [`@media (min-width: ${tablet})`]: { "min-height": "44px" },
      [`@media (min-width: ${pc})`]: { "min-height": "40px" },
      // Por último, para vencer a regra de cima nas telas de toque largas.
      [`@media (min-width: ${tablet}) and (pointer: coarse)`]: {
        "min-height": "44px",
      },
    },

    /*
     * Casca "tela que cabe": ocupa pelo menos a janela, o miolo estica e,
     * se o conteúdo passar, a página inteira rola.
     * Uso: <div className="casca-cabe"><header/><main className="casca-cabe-miolo"/><footer/></div>
     */
    ".casca-cabe": {
      display: "flex",
      "flex-direction": "column",
      "min-height": "100dvh",
    },
    ".casca-cabe-miolo": {
      flex: "1 0 auto",
    },

    /*
     * Casca "tela com miolo que rola": do tablet para cima a tela tem a altura da janela,
     * cabeçalho e rodapé ficam parados e só o miolo rola. No celular, ou com a janela mais
     * baixa que 720px, se comporta como a "casca-cabe" (rola a página inteira).
     * Uso: <div className="casca-rola"><header/><main className="casca-rola-miolo"/><footer/></div>
     * O miolo precisa ser filho direto da casca.
     */
    ".casca-rola": {
      display: "flex",
      "flex-direction": "column",
      "min-height": "100dvh",
      [telaFixa]: { height: "100dvh" },
    },
    ".casca-rola > *": {
      "flex-shrink": "0",
    },
    ".casca-rola > .casca-rola-miolo": {
      flex: "1 0 auto",
      [telaFixa]: {
        flex: "1 1 0%",
        "min-height": "0",
        "overflow-y": "auto",
      },
    },
  });
});
