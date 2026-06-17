import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { bossForFloor } from "@/src/game/bosses";
import { buildSystemPrompt } from "@/src/game/system-prompt";
import { isOutOfTurns, turnsRemaining } from "@/src/game/turns";
import { callBoss } from "@/src/anthropic";
import type { ChatMessage } from "@/src/game/types";

type TurnBody = { message?: string; history?: ChatMessage[] };

export async function POST(request: Request) {
  const session = await getRunSession();
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

  const system = buildSystemPrompt(boss, run.secret, run.defenses);
  const reply = await callBoss(system, messages);

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
