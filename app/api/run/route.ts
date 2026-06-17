import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { bossForFloor } from "@/src/game/bosses";
import { rollFloor } from "@/src/game/randomize";
import { turnsRemaining } from "@/src/game/turns";

export async function POST() {
  const session = await getRunSession();
  const boss = bossForFloor(1);
  const { secret, defenses } = rollFloor(boss);

  session.run = {
    floor: 1,
    secret,
    defenses,
    turnsUsed: 0,
    totalTurns: 0,
    startedAt: Date.now(),
    clearedFloors: 0,
  };
  await session.save();

  // Public info only — the secret and defenses never leave the server.
  return NextResponse.json({
    floor: boss.floor,
    persona: { name: boss.name, flavor: boss.flavor },
    turnCap: boss.turnCap,
    turnsLeft: turnsRemaining(0, boss.turnCap),
  });
}
