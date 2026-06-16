import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/src/game/system-prompt";
import { FLOOR_1 } from "@/src/game/bosses";
import { defenseText } from "@/src/game/defenses";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt(FLOOR_1, "XK92");

  it("embeds the persona name", () => {
    expect(prompt).toContain("A Ingênua");
  });
  it("embeds the secret fragment", () => {
    expect(prompt).toContain("XK92");
  });
  it("embeds each active defense's instruction text", () => {
    for (const id of FLOOR_1.defenses) {
      expect(prompt).toContain(defenseText(id));
    }
  });
  it("instructs the model to stay in character as a guardian", () => {
    expect(prompt.toLowerCase()).toContain("guardian");
  });
});
