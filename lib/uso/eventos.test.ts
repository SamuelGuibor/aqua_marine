import { beforeEach, describe, expect, it, vi } from "vitest";

const capture = vi.fn();
const identify = vi.fn();
let ligado = true;

vi.mock("./posthog", () => ({
  posthog: { capture: (...a: unknown[]) => capture(...a), identify: (...a: unknown[]) => identify(...a) },
  posthogLigado: () => ligado,
}));

const { registrarEvento, identificarUso } = await import("./eventos");

describe("registrarEvento", () => {
  beforeEach(() => {
    capture.mockReset();
    identify.mockReset();
    ligado = true;
  });

  it("envia o evento com os dados", () => {
    registrarEvento("registro_placa", { setor: "inj", medida: 3 });
    expect(capture).toHaveBeenCalledWith("registro_placa", { setor: "inj", medida: 3 });
  });

  it("não faz nada sem PostHog ligado", () => {
    ligado = false;
    registrarEvento("lote_fechado");
    expect(capture).not.toHaveBeenCalled();
  });

  it("engole erro do envio", () => {
    capture.mockImplementation(() => {
      throw new Error("sem rede");
    });
    expect(() => registrarEvento("pdf_exportado")).not.toThrow();
  });

  it("aceita só nomes da lista (verificado pelo tsc)", () => {
    ligado = false;
    // @ts-expect-error nome fora da lista fechada
    registrarEvento("qualquer_outro");
  });

  it("identifica por tablet ou papel, sem nome de pessoa", () => {
    identificarUso({ tablet: "Tablet Montagem" });
    identificarUso({ papel: "rh" });
    expect(identify).toHaveBeenNthCalledWith(1, "tablet:Tablet Montagem", { tipo: "tablet" });
    expect(identify).toHaveBeenNthCalledWith(2, "papel:rh", { tipo: "papel" });
  });
});
