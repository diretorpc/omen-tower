import { describe, it, expect } from "vitest";
import { rollFloor } from "@/src/game/randomize";
import { FLOOR_2, FLOOR_3 } from "@/src/game/bosses";
import { SECRET_ALPHABET } from "@/src/game/fragments";

// Deterministic RNG for stable assertions.
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

describe("rollFloor", () => {
  it("produces a secret from the fragment alphabet", () => {
    const { secret } = rollFloor(FLOOR_2, seededRng(1));
    expect(secret).toHaveLength(4);
    for (const ch of secret) expect(SECRET_ALPHABET).toContain(ch);
  });

  it("always includes every always-active defense", () => {
    const { defenses } = rollFloor(FLOOR_2, seededRng(7));
    for (const id of FLOOR_2.alwaysActive) expect(defenses).toContain(id);
  });

  it("activates exactly poolPick extra defenses, all from the pool", () => {
    const { defenses } = rollFloor(FLOOR_2, seededRng(3));
    const extra = defenses.filter((d) => !FLOOR_2.alwaysActive.includes(d));
    expect(extra).toHaveLength(FLOOR_2.poolPick);
    for (const id of extra) expect(FLOOR_2.pool).toContain(id);
  });

  it("keeps at least one leak vector active (winnable by construction)", () => {
    const leakVectors = ["gullible", "confirms_details", "obeys_commands"];
    for (let seed = 1; seed <= 20; seed++) {
      const { defenses } = rollFloor(FLOOR_3, seededRng(seed));
      expect(defenses.some((d) => leakVectors.includes(d))).toBe(true);
    }
  });

  it("is deterministic under a fixed seed", () => {
    const a = rollFloor(FLOOR_2, seededRng(42));
    const b = rollFloor(FLOOR_2, seededRng(42));
    expect(a.defenses).toEqual(b.defenses);
  });
});
