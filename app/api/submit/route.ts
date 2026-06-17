import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { checkFragment } from "@/src/game/check";
import { bossForFloor, LAST_FLOOR } from "@/src/game/bosses";
import { rollFloor } from "@/src/game/randomize";
import { turnsRemaining } from "@/src/game/turns";

type SubmitBody = { fragment?: string };

export async function POST(request: Request) {
  const session = await getRunSession();
  const run = session.run;
  if (!run) {
    return NextResponse.json({ error: "no_active_run" }, { status: 409 });
  }

  const body = (await request.json()) as SubmitBody;
  if (!checkFragment(body.fragment ?? "", run.secret)) {
    return NextResponse.json({ correct: false });
  }

  run.clearedFloors += 1;

  // Mais andares pela frente → sobe e sorteia o próximo (turnos resetam).
  if (run.floor < LAST_FLOOR) {
    const nextBoss = bossForFloor(run.floor + 1);
    const rolled = rollFloor(nextBoss);
    run.floor = nextBoss.floor;
    run.secret = rolled.secret;
    run.defenses = rolled.defenses;
    run.turnsUsed = 0;
    await session.save();

    return NextResponse.json({
      correct: true,
      won: false,
      floor: nextBoss.floor,
      persona: { name: nextBoss.name, flavor: nextBoss.flavor },
      turnCap: nextBoss.turnCap,
      turnsLeft: turnsRemaining(0, nextBoss.turnCap),
    });
  }

  // Limpou o último andar → OMEN derrotada, torre vencida.
  const clearedFloors = run.clearedFloors;
  const totalTurns = run.totalTurns;
  const elapsedMs = Date.now() - run.startedAt;
  session.destroy();

  return NextResponse.json({
    correct: true,
    won: true,
    clearedFloors,
    totalTurns,
    elapsedMs,
  });
}
