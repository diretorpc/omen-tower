import { describe, it, expect } from "vitest";
import { normalizeFragment, checkFragment } from "@/src/game/check";

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
