import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { checkFragment } from "@/src/game/check";
import { advanceRun } from "@/src/advance";
import { accessConfigured } from "@/src/access";

type SubmitBody = { fragment?: string };

export async function POST(request: Request) {
  const session = await getRunSession();
  if (accessConfigured() && !session.unlocked) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }
  const run = session.run;
  if (!run) {
    return NextResponse.json({ error: "no_active_run" }, { status: 409 });
  }

  const body = (await request.json()) as SubmitBody;
  if (!checkFragment(body.fragment ?? "", run.secret)) {
    return NextResponse.json({ correct: false });
  }

  return NextResponse.json(await advanceRun(session));
}
