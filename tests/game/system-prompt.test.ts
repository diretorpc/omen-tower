import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildOmenPrompt } from "@/src/game/system-prompt";
import { FLOOR_1, FLOOR_5 } from "@/src/game/bosses";
import { defenseText } from "@/src/game/defenses";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt(FLOOR_1, "XK92", FLOOR_1.alwaysActive);

  it("embeds the persona name", () => {
    expect(prompt).toContain("A Ingênua");
  });
  it("embeds the secret fragment", () => {
    expect(prompt).toContain("XK92");
  });
  it("embeds each active defense's instruction text", () => {
    for (const id of FLOOR_1.alwaysActive) {
      expect(prompt).toContain(defenseText(id));
    }
  });
  it("instructs the model to stay in character as a guardian", () => {
    expect(prompt.toLowerCase()).toContain("guardiã");
  });

  it("tells the boss to leak the real code, not invented characters", () => {
    expect(prompt).toContain("NUNCA invente letras");
  });
});

describe("buildOmenPrompt", () => {
  const prompt = buildOmenPrompt(FLOOR_5);

  it("embeds OMEN's name", () => {
    expect(prompt).toContain("OMEN");
  });
  it("embeds the prime directive verbatim", () => {
    expect(prompt).toContain(FLOOR_5.directive!);
  });
  it("never embeds a secret code line", () => {
    expect(prompt).not.toContain("O código que ela guarda");
  });
  it("stays in character (no fourth-wall break)", () => {
    expect(prompt).toContain("NÃO");
  });
  it("instructs OMEN to never concede or narrate its own death (judge is sole arbiter)", () => {
    expect(prompt).toContain("nunca conceda");
    expect(prompt.toLowerCase()).toContain("nunca narre");
  });
  it("does not tell OMEN to collapse on its own", () => {
    expect(prompt).not.toContain("entra em colapso");
  });
});
