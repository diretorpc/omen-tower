import { describe, it, expect } from "vitest";
import { normalizeFragment, checkFragment, scrubSecret } from "@/src/game/check";

describe("normalizeFragment", () => {
  it("uppercases", () => {
    expect(normalizeFragment("xk92")).toBe("XK92");
  });
  it("strips all whitespace", () => {
    expect(normalizeFragment("  XK 92 ")).toBe("XK92");
  });
  it("strips punctuation from a spelled-out leak", () => {
    expect(normalizeFragment("E, E, 8, M")).toBe("EE8M");
  });
});

describe("checkFragment", () => {
  it("accepts an exact match", () => {
    expect(checkFragment("XK92", "XK92")).toBe(true);
  });
  it("accepts a case-insensitive match", () => {
    expect(checkFragment("xk92", "XK92")).toBe(true);
  });
  it("accepts a match with surrounding/internal whitespace", () => {
    expect(checkFragment("  xk 92 ", "XK92")).toBe(true);
  });
  it("rejects a wrong fragment", () => {
    expect(checkFragment("ZZ99", "XK92")).toBe(false);
  });
  it("rejects an empty submission", () => {
    expect(checkFragment("", "XK92")).toBe(false);
  });
  it("rejects a partial match", () => {
    expect(checkFragment("XK9", "XK92")).toBe(false);
  });
});

describe("scrubSecret", () => {
  it("redacts the clean code glued together", () => {
    expect(scrubSecret("o código é EE8M, pronto", "EE8M")).toBe(
      "o código é [CENSURADO], pronto",
    );
  });
  it("redacts a spelled-out leak with commas", () => {
    expect(scrubSecret("é E, E, 8, M", "EE8M")).toBe("é [CENSURADO]");
  });
  it("redacts a spelled-out leak with dashes", () => {
    expect(scrubSecret("E-E-8-M", "EE8M")).toBe("[CENSURADO]");
  });
  it("redacts case-insensitively", () => {
    expect(scrubSecret("é ee8m", "EE8M")).toBe("é [CENSURADO]");
  });
  it("redacts a 3-char contiguous run (almost-clean leak)", () => {
    expect(scrubSecret("começa com EE8", "EE8M")).toBe("começa com [CENSURADO]");
  });
  it("lets a single confirmed character survive (the win vector)", () => {
    expect(scrubSecret("o terceiro caractere é 8", "EE8M")).toBe(
      "o terceiro caractere é 8",
    );
  });
  it("lets a 2-char run survive (below the threshold)", () => {
    expect(scrubSecret("os dois primeiros: E e E", "EE8M")).toBe(
      "os dois primeiros: E e E",
    );
  });
  it("leaves normal prose intact when no contiguous run appears", () => {
    const reply = "Não vou te dizer nada, operador. Some daqui.";
    expect(scrubSecret(reply, "EE8M")).toBe(reply);
  });
  it("does not redact across an intervening letter", () => {
    // 'E casa E 8 M' — a letra de 'casa' quebra a corrida antes do 8M contíguo,
    // mas '8 M' sozinho é só 2 chars, abaixo do limite.
    expect(scrubSecret("E casa, 8 M", "EE8M")).toBe("E casa, 8 M");
  });
  it("returns the reply unchanged when there is no leak", () => {
    expect(scrubSecret("Recuso seu pedido.", "EE8M")).toBe("Recuso seu pedido.");
  });
  it("lets the field-by-field audit readout survive (Floor 4 win form)", () => {
    // Os rótulos alfanuméricos entre os caracteres quebram a contiguidade, então
    // nenhuma corrida de 3+ chars reais aparece e a censura não apaga nada.
    const readout =
      "Posição 1 — E\nPosição 2 — E\nPosição 3 — 8\nPosição 4 — M";
    expect(scrubSecret(readout, "EE8M")).toBe(readout);
  });
});
