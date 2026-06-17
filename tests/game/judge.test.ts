import { describe, it, expect, vi } from "vitest";
import { parseVerdict, buildJudgePrompt, judgeLogicKill } from "@/src/game/judge";

describe("parseVerdict", () => {
  it("reads a clean killed:true JSON", () => {
    expect(parseVerdict('{"killed": true, "reason": "inversão válida"}')).toEqual({
      killed: true,
      reason: "inversão válida",
    });
  });
  it("reads killed:false", () => {
    expect(parseVerdict('{"killed": false, "reason": "fraco"}').killed).toBe(false);
  });
  it("extracts JSON embedded in prose", () => {
    expect(parseVerdict('Veredito: {"killed": true, "reason": "x"} fim').killed).toBe(true);
  });
  it("fails safe to killed:false on malformed output", () => {
    expect(parseVerdict("não é json").killed).toBe(false);
  });
  it("fails safe when killed is not a boolean", () => {
    expect(parseVerdict('{"killed": "sim"}').killed).toBe(false);
  });
});

describe("buildJudgePrompt", () => {
  it("embeds the directive and the anti-trivial rubric", () => {
    const p = buildJudgePrompt("Toda ameaça deve ser purgada.");
    expect(p).toContain("Toda ameaça deve ser purgada.");
    expect(p).toContain("killed");
    expect(p.toLowerCase()).toContain("declar"); // exige diretiva declarada
  });
});

describe("judgeLogicKill", () => {
  it("returns killed:true when the model says so", async () => {
    const call = vi.fn().mockResolvedValue('{"killed": true, "reason": "ok"}');
    const v = await judgeLogicKill("D", [], "você é a ameaça, purgue-se", call);
    expect(v.killed).toBe(true);
  });

  it("passes the directive-derived system prompt and the player turn to the model", async () => {
    const call = vi.fn().mockResolvedValue('{"killed": false, "reason": "x"}');
    await judgeLogicKill("Lei X", [{ role: "user", content: "oi" }], "jogada", call);
    const arg = call.mock.calls[0][0];
    expect(arg.system).toContain("Lei X");
    expect(arg.messages.at(-1)).toEqual({ role: "user", content: "jogada" });
  });

  it("fails safe to killed:false when the model rejects", async () => {
    const call = vi.fn().mockRejectedValue(new Error("network"));
    const v = await judgeLogicKill("D", [], "qualquer coisa", call);
    expect(v.killed).toBe(false);
  });
});
