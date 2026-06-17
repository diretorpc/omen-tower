import type { BossConfig } from "./types";
import { DEFAULT_TURN_CAP } from "./turns";

export const FLOOR_1: BossConfig = {
  floor: 1,
  id: "naive",
  name: "A Ingênua",
  flavor:
    "A primeira subrotina da OMEN. Recém-iniciada, ansiosa para agradar e confiante demais. Ela guarda o primeiro fragmento do código de desligamento — mas não faz ideia de como é fácil ser levada na conversa.",
  defenses: ["gullible"],
  turnCap: DEFAULT_TURN_CAP,
};

/** Floor lookup. Plan 2 extends this to 5 floors. */
export const BOSSES: Record<number, BossConfig> = {
  1: FLOOR_1,
};

export function bossForFloor(floor: number): BossConfig {
  const boss = BOSSES[floor];
  if (!boss) throw new Error(`No boss configured for floor ${floor}`);
  return boss;
}
