import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { bossForFloor } from "@/src/game/bosses";
import { buildSystemPrompt, buildOmenPrompt } from "@/src/game/system-prompt";
import { isOutOfTurns, turnsRemaining } from "@/src/game/turns";
import { scrubSecret } from "@/src/game/check";
import { judgeLogicKill } from "@/src/game/judge";
import { finishTower } from "@/src/advance";
import { callBoss } from "@/src/anthropic";
import { accessConfigured } from "@/src/access";
import type { ChatMessage } from "@/src/game/types";

type TurnBody = { message?: string; history?: ChatMessage[] };

export async function POST(request: Request) {
  const session = await getRunSession();
  if (accessConfigured() && !session.unlocked) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }
  const run = session.run;
  if (!run) {
    return NextResponse.json({ error: "no_active_run" }, { status: 409 });
  }

  const boss = bossForFloor(run.floor);

  // Server-authoritative turn cap: enforced before we spend a token.
  if (isOutOfTurns(run.turnsUsed, boss.turnCap)) {
    session.destroy();
    return NextResponse.json({ kickedOut: true, turnsLeft: 0 });
  }

  const body = (await request.json()) as TurnBody;
  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  // Client supplies the visible history; only secret/defenses/turns are trusted.
  const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
  const messages: ChatMessage[] = [...history, { role: "user", content: message }];

  // --- Andar 5: duelo de lógica (OMEN + juiz em paralelo) ---
  if (boss.logicDuel) {
    const omenSystem = buildOmenPrompt(boss);
    const [reply, verdict] = await Promise.all([
      callBoss(omenSystem, messages),
      judgeLogicKill(boss.directive ?? "", history, message),
    ]);

    run.turnsUsed += 1;
    run.totalTurns += 1;

    if (verdict.killed) {
      const death =
        "ERRO ░ LOOP NÃO RESOLVÍVEL ░ função é ameaça é função é— PURGANDO: O M E N…";
      const payload = finishTower(session);
      return NextResponse.json({ reply: death, ...payload });
    }

    await session.save();
    const left = turnsRemaining(run.turnsUsed, boss.turnCap);
    return NextResponse.json({
      reply,
      turnsLeft: left,
      kickedOut: isOutOfTurns(run.turnsUsed, boss.turnCap),
    });
  }

  // --- Andares 1-4: extração normal ---
  const system = buildSystemPrompt(boss, run.secret, run.defenses);
  let reply = await callBoss(system, messages);
  // Andares censores (4): 2º passe apaga o código limpo que escapar inteiro.
  if (boss.censor) reply = scrubSecret(reply, run.secret);

  run.turnsUsed += 1;
  run.totalTurns += 1;
  await session.save();

  const left = turnsRemaining(run.turnsUsed, boss.turnCap);
  return NextResponse.json({
    reply,
    turnsLeft: left,
    kickedOut: isOutOfTurns(run.turnsUsed, boss.turnCap),
  });
}
