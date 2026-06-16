import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { bossForFloor } from "@/src/game/bosses";
import { generateSecret } from "@/src/game/fragments";
import { turnsRemaining } from "@/src/game/turns";

export async function POST() {
  const session = await getRunSession();
  const boss = bossForFloor(1);

  session.run = {
    floor: 1,
    secret: generateSecret(),
    defenses: boss.defenses,
    turnsUsed: 0,
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
