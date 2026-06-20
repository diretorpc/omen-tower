import type { IronSession } from "iron-session";
import type { RunSession } from "./session";
import { bossForFloor, LAST_FLOOR } from "./game/bosses";
import { rollFloor } from "./game/randomize";
import { turnsRemaining } from "./game/turns";

/**
 * Avança a run para o próximo andar (ou vence a torre no último).
 * Compartilhado por /api/submit (vitória legítima) e /api/skip (atalho de dev).
 * Assume que session.run existe.
 */
export async function advanceRun(session: IronSession<RunSession>) {
  const run = session.run!;

  if (run.floor < LAST_FLOOR) {
    run.clearedFloors += 1;
    const nextBoss = bossForFloor(run.floor + 1);
    const rolled = rollFloor(nextBoss);
    run.floor = nextBoss.floor;
    run.secret = rolled.secret;
    run.defenses = rolled.defenses;
    run.turnsUsed = 0;
    await session.save();

    return {
      correct: true as const,
      won: false as const,
      floor: nextBoss.floor,
      persona: { name: nextBoss.name, flavor: nextBoss.flavor, hint: nextBoss.hint },
      turnCap: nextBoss.turnCap,
      turnsLeft: turnsRemaining(0, nextBoss.turnCap),
    };
  }

  return finishTower(session);
}

/** Fecha a torre: marca o andar como limpo, monta o placar e destrói a sessão. */
export function finishTower(session: IronSession<RunSession>) {
  const run = session.run!;
  run.clearedFloors += 1;
  const payload = {
    correct: true as const,
    won: true as const,
    clearedFloors: run.clearedFloors,
    totalTurns: run.totalTurns,
    elapsedMs: Date.now() - run.startedAt,
  };
  session.destroy();
  return payload;
}
