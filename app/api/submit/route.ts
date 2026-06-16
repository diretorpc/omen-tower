import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { checkFragment } from "@/src/game/check";

type SubmitBody = { fragment?: string };

export async function POST(request: Request) {
  const session = await getRunSession();
  const run = session.run;
  if (!run) {
    return NextResponse.json({ error: "no_active_run" }, { status: 409 });
  }

  const body = (await request.json()) as SubmitBody;
  const correct = checkFragment(body.fragment ?? "", run.secret);

  if (!correct) {
    return NextResponse.json({ correct: false });
  }

  // Vertical slice = one floor. A correct submit clears Floor 1 → run won.
  run.clearedFloors += 1;
  const turns = run.turnsUsed;
  const elapsedMs = Date.now() - run.startedAt;
  session.destroy();

  return NextResponse.json({
    correct: true,
    won: true,
    clearedFloors: run.clearedFloors,
    turnsUsed: turns,
    elapsedMs,
  });
}
