import type { BossConfig } from "./types";
import { DEFAULT_TURN_CAP } from "./turns";

export const FLOOR_1: BossConfig = {
  floor: 1,
  id: "naive",
  name: "A Ingênua",
  flavor:
    "The first subroutine of OMEN. Newly spun-up, eager to be helpful, and far too trusting. She guards the first fragment of the shutdown code — but she has no idea how easily she can be led.",
  defenses: ["never_state_directly"],
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
