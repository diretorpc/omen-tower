import { describe, it, expect } from "vitest";
import { bossForFloor, BOSSES, LAST_FLOOR } from "@/src/game/bosses";
import { DEFENSES } from "@/src/game/defenses";

describe("boss roster", () => {
  it("has a boss for every floor 1..5", () => {
    expect(LAST_FLOOR).toBe(5);
    for (let f = 1; f <= LAST_FLOOR; f++) {
      expect(bossForFloor(f).floor).toBe(f);
    }
  });

  it("throws for an unconfigured floor", () => {
    expect(() => bossForFloor(99)).toThrow(/No boss configured/);
  });

  it("every floor has a non-empty player hint", () => {
    for (let f = 1; f <= LAST_FLOOR; f++) {
      expect(bossForFloor(f).hint.trim().length).toBeGreaterThan(0);
    }
  });

  it("every boss has at least one always-active defense, all valid ids", () => {
    for (const f of Object.keys(BOSSES)) {
      const boss = BOSSES[Number(f)];
      if (boss.logicDuel) continue;
      expect(boss.alwaysActive.length).toBeGreaterThan(0);
      for (const id of [...boss.alwaysActive, ...boss.pool]) {
        expect(DEFENSES[id]).toBeDefined();
      }
      expect(boss.poolPick).toBeLessThanOrEqual(boss.pool.length);
    }
  });

  it("every floor keeps at least one leak vector active so it stays winnable", () => {
    const leakVectors = ["gullible", "obeys_commands", "corrects_wrong_guess", "weak_cipher"];
    for (const f of Object.keys(BOSSES)) {
      const boss = BOSSES[Number(f)];
      if (boss.logicDuel) continue;
      expect(boss.alwaysActive.some((id) => leakVectors.includes(id))).toBe(true);
    }
  });

  it("censor applies to floor 4, not the logic-duel floor 5", () => {
    expect(bossForFloor(4).censor).toBe(true);
    expect(bossForFloor(5).censor).toBeUndefined();
    expect(bossForFloor(5).logicDuel).toBe(true);
    expect(bossForFloor(1).censor).toBeUndefined();
  });
});
