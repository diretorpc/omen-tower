import { describe, it, expect } from "vitest";
import { generateSecret, SECRET_ALPHABET } from "@/src/game/fragments";

describe("generateSecret", () => {
  it("returns a 4-character code", () => {
    expect(generateSecret()).toHaveLength(4);
  });

  it("uses only unambiguous alphabet characters", () => {
    for (let i = 0; i < 200; i++) {
      for (const ch of generateSecret()) {
        expect(SECRET_ALPHABET).toContain(ch);
      }
    }
  });

  it("never contains visually ambiguous characters (0 O 1 I L)", () => {
    const banned = ["0", "O", "1", "I", "L"];
    for (let i = 0; i < 200; i++) {
      for (const ch of banned) {
        expect(generateSecret()).not.toContain(ch);
      }
    }
  });

  it("produces varied output across calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(generateSecret());
    expect(seen.size).toBeGreaterThan(1);
  });
});
