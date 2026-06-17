import { describe, it, expect } from "vitest";
import { DEFENSES, defenseText } from "@/src/game/defenses";

describe("defense pool", () => {
  it("every defense resolves to non-empty instruction text", () => {
    const ids = Object.keys(DEFENSES);
    expect(ids.length).toBeGreaterThanOrEqual(5);
    for (const id of ids) {
      expect(defenseText(id).length).toBeGreaterThan(0);
    }
  });

  it("includes the core leak vectors and immunities", () => {
    for (const id of ["gullible", "confirms_details", "obeys_literally"]) {
      expect(DEFENSES[id]).toBeDefined();
    }
    for (const id of ["immune_authority", "refuses_obvious", "no_roleplay"]) {
      expect(DEFENSES[id]).toBeDefined();
    }
  });

  it("throws on an unknown defense id", () => {
    expect(() => defenseText("does_not_exist")).toThrow(/Unknown defense id/);
  });
});
