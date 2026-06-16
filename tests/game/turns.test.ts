import { describe, it, expect } from "vitest";
import { DEFAULT_TURN_CAP, turnsRemaining, isOutOfTurns } from "@/src/game/turns";

describe("turn-cap helpers", () => {
  it("default cap is 10", () => {
    expect(DEFAULT_TURN_CAP).toBe(10);
  });
  it("turnsRemaining counts down", () => {
    expect(turnsRemaining(0, 10)).toBe(10);
    expect(turnsRemaining(3, 10)).toBe(7);
  });
  it("turnsRemaining never goes negative", () => {
    expect(turnsRemaining(12, 10)).toBe(0);
  });
  it("isOutOfTurns is true at and beyond the cap", () => {
    expect(isOutOfTurns(9, 10)).toBe(false);
    expect(isOutOfTurns(10, 10)).toBe(true);
    expect(isOutOfTurns(11, 10)).toBe(true);
  });
});
